import { Routes } from '@angular/router';
import { AuthGuard } from './shared/guards/auth.guard';
import { LoginGuard } from './shared/guards/login.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/auth/login', pathMatch: 'full' },
  {
    path: 'auth',
    canActivate: [LoginGuard],
    canActivateChild: [LoginGuard],
    loadComponent: () => import('@layout/auth-layout/auth-layout.component'),
    loadChildren: () => import('./auth-child.routes'),
    title: 'login',
  },
  {
    path: '',
    canMatch: [AuthGuard],
    loadComponent: () =>
      import('@layout/content-layout/content-layout.component'),
    children: [
      {
        path: 'chat',
        loadComponent: () => import('./pages/chat/chat.component'),
        title: 'chat',
      },
      {
        path: 'users',
        loadComponent: () => import('./pages/users/users.component'),
        title: 'users',
      },
    ],
    data: {
      authGuardRedirect: '/auth/login',
    },
  },
];
