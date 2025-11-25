import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { TranslatePipe, TranslateService, _ } from '@ngx-translate/core';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DrawerModule } from 'primeng/drawer';
import { MenuModule } from 'primeng/menu';
import { MenubarModule } from 'primeng/menubar';
import { PopoverModule } from 'primeng/popover';
import { Tooltip } from 'primeng/tooltip';
import { LangSwitcherComponent } from 'src/app/shared/components/lang-switcher.component';
import { AuthService } from 'src/app/shared/services/auth/auth.service';
import { ConfirmService } from 'src/app/shared/services/global-services/confirm.service';
import { LangService } from 'src/app/shared/services/lang.service';

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
    TranslatePipe,
    LangSwitcherComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuSidebarComponent {
  #confirmService = inject(ConfirmService);
  #translate = inject(TranslateService);
  #authService = inject(AuthService);
  #router = inject(Router);
  #destroyRef = inject(DestroyRef);

  currentLang = inject(LangService).currentLanguage;
  currentUser = this.#authService.currentUser;

  visible = true;

  topMenuItems = signal<MenuItem[]>([
    {
      label: 'conversations',
      icon: 'fa-solid fa-comment-dots',
      routerLink: '/chat',
      visible: true,
    },
    {
      label: 'template',
      icon: 'fa-solid fa-robot',
      routerLink: '/template',
      visible: true,
    },
    {
      label: 'department',
      icon: 'fa-solid fa-building-user',
      routerLink: '/department',
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
