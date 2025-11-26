import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Type,
} from '@angular/core';

import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { BaseIndexComponent } from 'src/app/shared/components/basic-crud/base-index.component';
import { TableWrapperComponent } from 'src/app/shared/components/table-wrapper/table-wrapper.component';
import { LangService } from 'src/app/shared/services/lang.service';
import { User } from './services/service-type';
import { UserCuComponent } from './user-cu.component';

@Component({
  selector: 'app-users',
  imports: [TableWrapperComponent, TooltipModule, ButtonModule],
  templateUrl: './users.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class UsersComponent extends BaseIndexComponent<
  User,
  Type<UserCuComponent>
> {
  currentLang = inject(LangService).currentLanguage;

  ngOnInit() {
    this.dialogComponent = UserCuComponent;

    this.indexMeta = {
      ...this.indexMeta,
      indexTitle: 'users',
      indexIcon: 'fa-solid fa-user',
      createBtnLabel: 'create_user',
      endpoints: {
        index: 'auth/users/user',
        delete: 'auth/users/user/delete',
      },
      indexTableKey: 'USERS_KEY',
      columns: [
        {
          title: 'id',
          name: 'id',
        },
        {
          title: 'email',
          name: 'email',
        },
        {
          title: 'department',
          name: `department.name_${this.currentLang()}`,
        },
      ],
    };
  }
}
