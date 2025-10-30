import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { TranslateService, _ } from '@ngx-translate/core';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DrawerModule } from 'primeng/drawer';
import { MenubarModule } from 'primeng/menubar';
import { PopoverModule } from 'primeng/popover';
import { Tooltip } from 'primeng/tooltip';
import { AuthService } from 'src/app/shared/services/auth/auth.service';
import { ConfirmService } from 'src/app/shared/services/global-services/confirm.service';
import { MenuModule } from 'primeng/menu';
import { NgTemplateOutlet } from '@angular/common';

@Component({
  selector: 'app-menu-sidebar',
  templateUrl: './menu-sidebar.component.html',
  styleUrl: './menu-sidebar.component.scss',
  imports: [
    RouterLink,
    RouterLinkActive,
    Tooltip,
    DrawerModule,
    MenubarModule,
    PopoverModule,
    ButtonModule,
    MenuModule,
    NgTemplateOutlet,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuSidebarComponent {
  #confirmService = inject(ConfirmService);
  #translate = inject(TranslateService);
  #authService = inject(AuthService);
  #router = inject(Router);
  #destroyRef = inject(DestroyRef);
  currentUser = this.#authService.currentUser;

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
  ]);

  Menuitems: MenuItem[] = [
    {
      label: 'Logout',
      icon: 'fa-solid fa-arrow-right-from-bracket',
      command: () => {
        this.logout();
      },
    },
  ];

  logout() {
    this.#confirmService.confirmDelete({
      message: this.#translate.instant(_('Please confirm to proceed')),
      acceptCallback: () =>
        this.#authService
          .logout()
          .pipe(takeUntilDestroyed(this.#destroyRef))
          .subscribe(() => {
            this.#router.navigateByUrl('auth/login');
          }),
    });
  }
}
