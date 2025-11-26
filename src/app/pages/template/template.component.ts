import {
  ChangeDetectionStrategy,
  Component,
  inject,
  Type,
} from '@angular/core';

import { TranslatePipe } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { BaseIndexComponent } from 'src/app/shared/components/basic-crud/base-index.component';
import { TableWrapperComponent } from 'src/app/shared/components/table-wrapper/table-wrapper.component';
import { LangService } from 'src/app/shared/services/lang.service';
import { Template } from './services/service-type';
import { TemplateCuComponent } from './template-cu.component';
import { TemplateViewComponent } from './template-view/template-view.component';

@Component({
  selector: 'app-template',
  imports: [TableWrapperComponent, TooltipModule, ButtonModule, TranslatePipe],
  templateUrl: './template.component.html',
  styleUrl: './template.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TemplateComponent extends BaseIndexComponent<
  Template,
  Type<TemplateCuComponent>
> {
  currentLang = inject(LangService).currentLanguage;

  ngOnInit() {
    this.dialogComponent = TemplateCuComponent;

    this.indexMeta = {
      ...this.indexMeta,
      indexTitle: 'template',
      indexIcon: 'fa-solid fa-robot',
      createBtnLabel: 'create_template',
      endpoints: {
        index: 'routing-levels/routing-level',
        delete: 'routing-levels/routing-level/delete',
      },
      indexTableKey: 'TEMPLATE_KEY',
      columns: [
        {
          title: 'id',
          name: 'id',
        },
        {
          title: 'name',
          name: 'name',
        },
        {
          title: 'level_type',
          name: 'level_type',
        },
      ],
    };
  }

  openTemplateView(template: Template) {
    const dialogConfig = {
      ...this.dialogConfig,
      data: template,
    };
    this.dialogRef = this.dialogService.open(
      TemplateViewComponent,
      dialogConfig
    );
  }
}
