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
import { GroupCuComponent } from './group-cu.component';
import { Group } from './services/service-type';

@Component({
  selector: 'app-groups',
  imports: [TableWrapperComponent, TooltipModule, ButtonModule],
  templateUrl: './groups.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class GroupsComponent extends BaseIndexComponent<
  Group,
  Type<GroupCuComponent>
> {
  currentLang = inject(LangService).currentLanguage;

  ngOnInit() {
    this.dialogComponent = GroupCuComponent;

    this.indexMeta = {
      ...this.indexMeta,
      indexTitle: 'groups',
      indexIcon: 'fa-solid fa-building-user',
      createBtnLabel: 'create_group',
      endpoints: {
        index: 'groups/group',
        delete: 'groups/group/delete',
      },
      indexTableKey: 'GROUP_KEY',
      columns: [
        {
          title: 'id',
          name: 'id',
        },
        {
          title: 'group',
          name: `name`,
        },
      ],
    };
  }
}
