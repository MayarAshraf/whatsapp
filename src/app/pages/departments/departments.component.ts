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
import { DepartmentCuComponent } from './department-cu.component';
import { Department } from './services/service-type';

@Component({
  selector: 'app-departments',
  imports: [TableWrapperComponent, TooltipModule, ButtonModule],
  templateUrl: './departments.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class DepartmentsComponent extends BaseIndexComponent<
  Department,
  Type<DepartmentCuComponent>
> {
  currentLang = inject(LangService).currentLanguage;

  ngOnInit() {
    this.dialogComponent = DepartmentCuComponent;

    this.indexMeta = {
      ...this.indexMeta,
      indexTitle: 'departments',
      indexIcon: 'fa-solid fa-building-user',
      createBtnLabel: 'create department',
      endpoints: {
        index: 'departments/department',
        delete: 'departments/department/delete',
      },
      indexTableKey: 'DEPARTMENT_KEY',
      columns: [
        {
          title: 'id',
          name: 'id',
        },
        {
          title: 'department',
          name: `name_${this.currentLang()}`,
        },
      ],
    };
  }
}
