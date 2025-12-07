import { Routes } from '@angular/router';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
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
        path: 'conversations/:page',
        loadComponent: () => import('./pages/chat/chat.component'),
        title: _('conversations'),
      },
    ],
  },
  {
    path: '**',
    loadComponent: () => import('@pages/errors/404/404.component'),
  },
];
