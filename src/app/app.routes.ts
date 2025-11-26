import { Routes } from '@angular/router';
import { AuthGuard } from './shared/guards/auth.guard';
import { LoginGuard } from './shared/guards/login.guard';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';

export const routes: Routes = [
  { path: '', redirectTo: '/auth/login', pathMatch: 'full' },
  {
    path: 'auth',
    canActivate: [LoginGuard],
    canActivateChild: [LoginGuard],
    loadComponent: () => import('@layout/auth-layout/auth-layout.component'),
    loadChildren: () => import('./auth-child.routes'),
    title: _('login'),
  },
  {
    path: '',
    canMatch: [AuthGuard],
    data: {
      authGuardRedirect: '/auth/login',
    },
    loadComponent: () =>
      import('@layout/content-layout/content-layout.component'),
    children: [
      {
        path: 'conversations',
        loadComponent: () => import('./pages/chat/chat.component'),
        title: _('conversations'),
      },
      {
        path: 'users',
        loadComponent: () => import('./pages/users/users.component'),
        title: _('users'),
      },
      {
        path: 'template',
        loadComponent: () => import('./pages/template/template.component'),
        title: _('template'),
      },
      {
        path: 'department',
        loadComponent: () =>
          import('./pages/departments/departments.component'),
        title: _('department'),
      },
    ],
  },
  {
    path: '**',
    loadComponent: () => import('@pages/errors/404/404.component'),
  },
];
