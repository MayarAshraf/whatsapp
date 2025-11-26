import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { BaseCreateUpdateComponent } from 'src/app/shared/components/basic-crud/base-create-update/base-create-update.component';
import { FormDialogComponent } from 'src/app/shared/components/basic-crud/base-create-update/form-dialog/form-dialog.component';
import { FieldBuilderService } from 'src/app/shared/services/field-builder.service';
import { SettingsModel } from './services/service-type';

@Component({
  selector: 'app-setting-cu',
  templateUrl:
    '../../shared/components/basic-crud/base-create-update/base-create-update.component.html',
  imports: [FormDialogComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingCuComponent extends BaseCreateUpdateComponent<SettingsModel> {
  #fieldBuilder = inject(FieldBuilderService);
  ngOnInit() {
    this.dialogMeta = {
      ...this.dialogMeta,
      endpoints: {
        store: 'whatsapp-account/whatsapp-account',
        update: 'whatsapp-account/whatsapp-account',
      },
    };

    if (this.editData) {
      this.dialogMeta = {
        ...this.dialogMeta,
        dialogTitle: this.translate.instant(_('update_setting')),
        submitButtonLabel: this.translate.instant(_('update_setting')),
      };
      this.model = new SettingsModel(this.editData);
    } else {
      this.dialogMeta = {
        ...this.dialogMeta,
        dialogTitle: this.translate.instant(_('create_setting')),
        submitButtonLabel: this.translate.instant(_('create_setting')),
      };
      this.model = new SettingsModel();
    }
    this.fields = this.configureFields();
  }

  configureFields(): FormlyFieldConfig[] {
    return [
      this.#fieldBuilder.fieldBuilder([
        {
          key: 'phone_number_id',
          type: 'input-field',
          props: {
            type: 'number',
            label: _('phone_number_id'),
            required: true,
          },
        },
        {
          key: 'phone_number',
          type: 'input-field',
          props: {
            type: 'number',
            label: _('phone_number'),
            required: true,
          },
        },
      ]),
      this.#fieldBuilder.fieldBuilder([
        {
          key: 'waba_id',
          type: 'input-field',
          props: {
            type: 'number',
            label: _('waba_id'),
            required: true,
          },
        },
        {
          key: 'access_token',
          type: 'input-field',
          props: {
            label: _('access_token'),
            required: true,
          },
        },
      ]),
      this.#fieldBuilder.fieldBuilder([
        {
          key: 'display_name',
          type: 'input-field',
          props: {
            label: _('display_name'),
            required: true,
          },
        },
        {
          key: 'status',
          type: 'switch-field',
          props: {
            label: _('status'),
            required: true,
            trueValue: 'active',
            falseValue: 'inactive',
          },
        },
      ]),
    ];
  }
}
