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
        store: 'groups/group',
        update: 'groups/group/update',
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
          key: `name`,
          type: 'input-field',
          props: {
            label: `name`,
            required: true,
          },
        },
        {
          key: 'users_data',
          type: 'autocomplete-field',
          props: {
            label: _('users'),
            endpoint: `auth/users/autocomplete`,
            required: true,
            multiple: true,
            fieldKey: 'user_ids',
          },
        },
        { key: 'user_ids' },
      ]),
      this.#fieldBuilder.fieldBuilder([
        {
          key: 'description',
          type: 'textarea-field',
          props: {
            label: _('description'),
            rows: 3,
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
