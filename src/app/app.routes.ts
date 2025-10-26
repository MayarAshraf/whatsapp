import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/chat', pathMatch: 'full' },

  {
    path: '',
    // canMatch: [AuthGuard],
    loadComponent: () =>
      import('@layout/content-layout/content-layout.component'),
    children: [
      {
        path: 'chat',
        loadComponent: () => import('./pages/chat/chat.component'),
      },
    ],
  },
  {
    path: 'web-chat',
    loadComponent: () => import('./pages/web-chat/web-chat.component'),
  },
];
