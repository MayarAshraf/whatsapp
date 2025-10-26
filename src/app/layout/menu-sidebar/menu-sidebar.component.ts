import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { DrawerModule } from 'primeng/drawer';
import { Tooltip } from 'primeng/tooltip';

@Component({
  selector: 'app-menu-sidebar',
  templateUrl: './menu-sidebar.component.html',
  styleUrl: './menu-sidebar.component.scss',
  imports: [RouterLink, RouterLinkActive, Tooltip, DrawerModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuSidebarComponent {
  visible = true;

  topMenuItems = signal<MenuItem[]>([
    {
      label: 'conversations',
      icon: 'fa-solid fa-comment-dots',
      routerLink: '/conversations',
      visible: true,
    },
  ]);

  bottomMenuItems = signal<MenuItem[]>([
    {
      label: 'users',
      icon: 'fa-users fas',
      routerLink: '/users',
      visible: true,
    },
    {
      label: 'settings',
      icon: 'fa-cogs fas',
      routerLink: '/settings',
      visible: true,
    },
    {
      label: 'profile',
      icon: 'fa-user-gear fas',
      routerLink: '/profile',
      visible: true,
    },
  ]);
}
