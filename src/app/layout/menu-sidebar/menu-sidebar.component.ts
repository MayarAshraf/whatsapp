import { AsyncPipe, NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import {
  ActivatedRoute,
  Router,
  RouterLink,
  RouterLinkActive,
} from '@angular/router';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DrawerModule } from 'primeng/drawer';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { MenuModule } from 'primeng/menu';
import { MenubarModule } from 'primeng/menubar';
import { PopoverModule } from 'primeng/popover';
import { SelectChangeEvent, SelectModule } from 'primeng/select';
import { Tooltip } from 'primeng/tooltip';
import { map } from 'rxjs';
import { LangSwitcherComponent } from 'src/app/shared/components/lang-switcher.component';
import { AuthService } from 'src/app/shared/services/auth/auth.service';
import { GlobalListService } from 'src/app/shared/services/global-list.service';
import { ApiService } from 'src/app/shared/services/global-services/api.service';
import { ConfirmService } from 'src/app/shared/services/global-services/confirm.service';
import { LangService } from 'src/app/shared/services/lang.service';
import { RoleService } from 'src/app/shared/services/role.service';

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
    SelectModule,
    AsyncPipe,
    FormsModule,
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
  #globalList = inject(GlobalListService);
  currentLang = inject(LangService).currentLanguage;
  #userRole = inject(RoleService);
  
  settingsList$ = this.#globalList.getGlobalList('user-settings');

  dialogRef: DynamicDialogRef | null = null;
  currentUser = this.#authService.currentUser;

  visible = signal(true);
  hasConversationRole = this.#userRole.hasRole([
    'system-admin',
    'manager',
    'user',
  ]);
  hasSettingsRole = this.#userRole.hasRole(['system-admin', 'manager']);

  topMenuItems = signal<MenuItem[]>([
    {
      label: _('conversations'),
      icon: 'fa-solid fa-comment-dots',
      routerLink: '/conversations',
      visible: this.hasConversationRole,
    },
  ]);

  bottomMenuItems = signal<MenuItem[]>([
    {
      label: _('settings'),
      icon: 'fa-cogs fas',
      routerLink: ['/conversations', 'settings'],
      visible: this.hasSettingsRole,
    },
  ]);

  status$ = this.settingsList$.pipe(
    map(({ status }) =>
      status.map((status: any) => ({
        label: status[`label_${this.currentLang()}`],
        value: status.value,
      }))
    )
  );

  userStatus$ = this.#api
    .request('post', 'auth/users/settings')
    .pipe(map(({ data }) => data));

  userStatus = toSignal(this.userStatus$, { initialValue: [] });

  onStatusChange(event: SelectChangeEvent | any) {
    this.#api
      .request('post', 'auth/users/change-status', {
        status: event.value,
      })
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe();
  }

  getStyle(status: string): { [klass: string]: any } {
    const colorMap: Record<string, string> = {
      online: '#22c55e',
      offline: '#a1a1aa',
      busy: '#fb923c',
      away: '#eab308',
    };

    return {
      backgroundColor: colorMap[status] || '#a1a1aa',
    };
  }

  logout() {
    this.#confirmService.confirmDelete({
      message: this.#translate.instant(_('please_confirm_to_proceed')),
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
