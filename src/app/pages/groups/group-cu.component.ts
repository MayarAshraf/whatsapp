import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { BaseCreateUpdateComponent } from 'src/app/shared/components/basic-crud/base-create-update/base-create-update.component';
import { FormDialogComponent } from 'src/app/shared/components/basic-crud/base-create-update/form-dialog/form-dialog.component';
import { FieldBuilderService } from 'src/app/shared/services/field-builder.service';
import { StaticDataService } from 'src/app/shared/services/static-data.service';
import { GroupModel } from './services/service-type';

@Component({
  selector: 'app-group-cu',
  templateUrl:
    '../../shared/components/basic-crud/base-create-update/base-create-update.component.html',
  imports: [FormDialogComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GroupCuComponent extends BaseCreateUpdateComponent<any> {
  #fieldBuilder = inject(FieldBuilderService);
  #languages = inject(StaticDataService).languages;
  ngOnInit() {
    this.dialogMeta = {
      ...this.dialogMeta,
      endpoints: {
        store: 'departments/department',
        update: 'departments/department/update',
      },
    };

    if (this.editData) {
      this.dialogMeta = {
        ...this.dialogMeta,
        dialogTitle: this.translate.instant(_('update_group')),
        submitButtonLabel: this.translate.instant(_('update_group')),
      };
      this.model = new GroupModel(this.editData);
    } else {
      this.dialogMeta = {
        ...this.dialogMeta,
        dialogTitle: this.translate.instant(_('create_group')),
        submitButtonLabel: this.translate.instant(_('create_group')),
      };
      this.model = new GroupModel();
    }
    this.fields = this.configureFields();
  }

  configureFields(): FormlyFieldConfig[] {
    return [
      this.#fieldBuilder.fieldBuilder([
        {
          type: 'tabs-field',
          fieldGroup: this.#languages.map((lang) => ({
            props: {
              label: `${lang.label} (${lang.value.toUpperCase()})`,
            },
            fieldGroup: [...this.buildGroupFields(lang.value)],
          })),
        },
      ]),
      {
        key: 'has_subroles',
        type: 'checkbox-field',
        props: {
          label: 'has_subroles',
        },
      },
      {
        type: 'tabs-field',
        hideExpression: (model) => !model?.has_subroles,
        fieldGroup: this.#languages.map((lang) => ({
          props: {
            label: `${lang.label} (${lang.value.toUpperCase()})`,
          },
          fieldGroup: [
            {
              key: 'sub_roles',
              type: 'order-list-field',
              resetOnHide: false,
              props: {
                itemLabel: _('add_subroles'),
                addBtnText: _('add_subroles'),
                emptyMessage: _('no_subroles_added_yet'),
              },
              fieldArray: {
                fieldGroup: [...this.buildGroupFields(lang.value)],
              },
            },
          ],
        })),
      },
    ];
  }
  buildGroupFields(lang: string): FormlyFieldConfig[] {
    return [
      this.#fieldBuilder.fieldBuilder([
        {
          key: `name_${lang}`,
          type: 'input-field',
          props: {
            label: `name`,
            required: lang === 'en',
          },
        },
        {
          key: 'is_active',
          type: 'switch-field',
          props: {
            label: 'is_active',
          },
        },
      ]),
    ];
  }
}
