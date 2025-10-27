import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { constants } from '../config/constants';
import { AuthService } from '../services/auth/auth.service';

export const LoginGuard: CanActivateFn = () => {
  const isLoggedIn = inject(AuthService).isLoggedIn;

  if (isLoggedIn()) {
    const router = inject(Router);
    router.navigateByUrl(constants.LOGIN_SUCCESS_REDIRECT_URL);
    return false;
  }
  return true;
};
