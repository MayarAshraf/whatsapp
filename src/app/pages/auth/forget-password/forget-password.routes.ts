import { Route, Routes } from '@angular/router';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';

export const forgetRoutes: Routes = [
  {
    path: 'forget-password',
    loadComponent: () => import('./forget-password.component'),
    title: _('forget password'),
  },
] as Route[];
