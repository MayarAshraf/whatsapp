import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/web-chat', pathMatch: 'full' },
  {
    path: 'chat',
    loadComponent: () => import('./pages/chat/chat.component'),
  },
  {
    path: 'web-chat',
    loadComponent: () => import('./pages/web-chat/web-chat.component'),
  },
];
