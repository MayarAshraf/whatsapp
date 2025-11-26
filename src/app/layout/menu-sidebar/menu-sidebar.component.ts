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
import { SettingCuComponent } from '@pages/settings/setting-cu.component';
import { MenuItem, MenuItemCommandEvent } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DrawerModule } from 'primeng/drawer';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { MenuModule } from 'primeng/menu';
import { MenubarModule } from 'primeng/menubar';
import { PopoverModule } from 'primeng/popover';
import { Tooltip } from 'primeng/tooltip';
import { map, tap } from 'rxjs';
import { LangSwitcherComponent } from 'src/app/shared/components/lang-switcher.component';
import { AuthService } from 'src/app/shared/services/auth/auth.service';
import { ApiService } from 'src/app/shared/services/global-services/api.service';
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
  #api = inject(ApiService);
  dialogService = inject(DialogService);
  currentLang = inject(LangService).currentLanguage;

  dialogRef: DynamicDialogRef | null = null;
  currentUser = this.#authService.currentUser;

  visible = true;

  settings = signal([]);
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
      command: () => this.openSettings(),
      visible: true,
    },
  ]);

  handleMenuClick(event: Event, link: MenuItem) {
    if (link.command) {
      event.preventDefault();
      const menuEvent: MenuItemCommandEvent = {
        originalEvent: event,
        item: link,
      };
      link.command(menuEvent);
    }
  }
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

  dialogConfig = {
    showHeader: false,
    width: '800px',
    height: '100%',
    modal: true,
    focusOnShow: false,
    styleClass: 'm-0 max-h-full transform-none',
    position: this.currentLang() === 'en' ? 'right' : 'left',
    rtl: this.currentLang() !== 'en',
    closable: true,
    closeOnEscape: true,
    dismissableMask: false,
  };
  openSettings() {
    this.#api
      .request('get', 'whatsapp-account/whatsapp-account')
      .pipe(
        map(({ data }) => data),
        tap((data) => this.settings.set(data))
      )
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe(() => {
        this.dialogRef = this.dialogService.open(SettingCuComponent, {
          ...this.dialogConfig,
          data: this.settings(),
        });
      });
  }
}
