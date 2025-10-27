import { inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { AuthService } from '../services/auth/auth.service';

export const AuthGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const isLoggedIn = inject(AuthService).isLoggedIn;

  if (!isLoggedIn()) {
    const router = inject(Router);
    const customRedirect = route.data['authGuardRedirect'];
    const redirectUrl = !!customRedirect ? customRedirect : '/auth/login';

    const queryParams = {
      returnUrl: state.url,
      message: 'You need to log in to access this page.',
    };

    router.navigate([redirectUrl], { queryParams });
  }

  return isLoggedIn() as boolean;
};
