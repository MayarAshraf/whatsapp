import {
  HttpErrorResponse,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, finalize, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth/auth.service';
import { AlertService } from '../services/global-services/alert.service';

const isExcludedRequest = (request: HttpRequest<unknown>) => {
  const excludedEndpoints = [
    'modules/names',
    'assets/i18n/',
    'auth/login',
    'user/oauth/token',
  ];
  /*
  why the oauth/token endpoint is excluded:
    - Avoid Infinite Loops: If the interceptor tried to add a token to the oauth/token request itself, and that request failed with a 401 error, the interceptor would try to refresh the token. This could lead to an infinite loop of refresh attempts.

    - Refresh Token Request Is Different: The oauth/token request is used for getting a new access token when the old one expires.This request requires a different kind of authorization(such as a refresh token rather than an access token) that does not need to be intercepted and modified in the same way as other requests
  */

  return excludedEndpoints.some((segment) => request.url.includes(segment));
};

export const RefreshTokenInterceptor: HttpInterceptorFn = (
  request: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const alertService = inject(AlertService);

  if (isExcludedRequest(request)) return next(request);

  const accessToken = auth.accessToken; // tracks the current token, or is null if no token is currently available (e.g. refresh pending). used to notify other requests when a new access token is available. This signal allows other requests to be paused until the token is refreshed.

  let refreshTokenInProgress = false; // track whether a token refresh operation is currently taking place. This flag prevents multiple simultaneous refresh requests.

  // Helper function to add the accessToken to the request if it exists.
  const addAccessToken = () => {
    // If access token is null this means that user is not logged in and we return the original request.
    if (!accessToken()) return request;

    // clone the request, because the original request is immutable
    const req = request.clone({
      setHeaders: { Authorization: `Bearer ${accessToken()}` },
    });
    return req;
  };

  const handle401Error = () => {
    if (refreshTokenInProgress) {
      // If a token refresh is in progress, it waits for the new token to be emitted by accessToken, and then retries the original request with the new token.
      return next(addAccessToken()); // retry the original request with the new token.
    } else {
      refreshTokenInProgress = true;
      // Set the accessToken to null so that subsequent API calls will wait (pausing them) until the new token has been retrieved.
      auth.updateAccessToken(null); // clear any previous token

      return auth.refreshAccessToken().pipe(
        switchMap((tokens) => {
          auth.updateAccessToken(tokens.token);
          auth.updateRefreshToken(tokens.refresh_token);
          return next(addAccessToken()); // retry the original request with the new token.
        }),
        catchError((error) => {
          // If the oauth/token request resulted in error. it indicates that the user cannot be re-authenticated silently and must be logged out and prompted to log in again manually.
          if (error.status === 401) {
            alertService?.setMessage({
              severity: 'error',
              detail: '(401) You do not have permission',
            });
            auth.doLogout();
            router.navigate(['/auth/login'], {
              queryParams: { returnUrl: router.url },
            });
          }
          return throwError(() => error);
        }),
        finalize(() => (refreshTokenInProgress = false)) // when the call to refreshAccessToken completes we reset the refreshTokenInProgress to false. for the next time the token needs to be refreshed.
      );
    }
  };

  return next(addAccessToken()).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        return handle401Error();
      } else {
        return throwError(() => error);
      }
    })
  );
};
