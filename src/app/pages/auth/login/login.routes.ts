import { Route, Routes } from '@angular/router';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';

export const loginRoutes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./login.component'),
    title: _('login'),
  },
] as Route[];
