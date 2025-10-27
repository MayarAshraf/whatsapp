import { Route } from '@angular/router';
import { forgetRoutes } from '@pages/auth/forget-password/forget-password.routes';
import { loginRoutes } from '@pages/auth/login/login.routes';
import { resetPasswordRoutes } from '@pages/auth/reset-password/reset-password.routes';

export default [
  ...loginRoutes,
  ...resetPasswordRoutes,
  ...forgetRoutes,
] as Route[];
