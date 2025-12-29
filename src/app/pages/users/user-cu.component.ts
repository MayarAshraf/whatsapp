import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { map } from 'rxjs';
import { BaseCreateUpdateComponent } from 'src/app/shared/components/basic-crud/base-create-update/base-create-update.component';
import { FormDialogComponent } from 'src/app/shared/components/basic-crud/base-create-update/form-dialog/form-dialog.component';
import { constants } from 'src/app/shared/config/constants';
import { AuthService } from 'src/app/shared/services/auth/auth.service';
import { FieldBuilderService } from 'src/app/shared/services/field-builder.service';
import { GlobalListService } from 'src/app/shared/services/global-list.service';
import { LangService } from 'src/app/shared/services/lang.service';
import { UserModel } from './services/service-type';

@Component({
  selector: 'app-user-cu',
  templateUrl:
    '../../shared/components/basic-crud/base-create-update/base-create-update.component.html',
  imports: [FormDialogComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserCuComponent extends BaseCreateUpdateComponent<any> {
  #fieldBuilder = inject(FieldBuilderService);
  #globalList = inject(GlobalListService);
  #currentLang = inject(LangService).currentLanguage;
  #authService = inject(AuthService);

  ngOnInit() {
    this.dialogMeta = {
      ...this.dialogMeta,
      endpoints: {
        store: 'auth/users/user',
        update: 'auth/users/user/update',
      },
    };

    if (this.editData) {
      this.dialogMeta = {
        ...this.dialogMeta,
        dialogTitle: this.translate.instant(_('update_user')),
        submitButtonLabel: this.translate.instant(_('update_user')),
      };
      this.model = new UserModel(this.editData);
    } else {
      this.dialogMeta = {
        ...this.dialogMeta,
        dialogTitle: this.translate.instant(_('create_user')),
        submitButtonLabel: this.translate.instant(_('create_user')),
      };
      this.model = new UserModel();
    }
    this.fields = this.configureFields();
  }

  configureFields(): FormlyFieldConfig[] {
    return [
      this.#fieldBuilder.fieldBuilder([
        {
          key: 'first_name',
          type: 'input-field',
          props: {
            label: _('first_name'),
            required: true,
            maxLength: constants.MAX_LENGTH_TEXT_INPUT,
          },
        },
        {
          key: 'last_name',
          type: 'input-field',
          props: {
            label: _('last_name'),
            required: true,
            maxLength: constants.MAX_LENGTH_TEXT_INPUT,
          },
        },
      ]),
      this.#fieldBuilder.fieldBuilder([
        {
          key: 'email',
          type: 'input-field',
          validators: {
            validation: ['email'],
          },
          props: {
            label: _('email'),
            required: true,
            maxLength: constants.MAX_LENGTH_TEXT_INPUT,
          },
        },
        {
          key: 'username',
          type: 'input-field',
          props: {
            label: _('username'),
            maxLength: constants.MAX_LENGTH_TEXT_INPUT,
          },
        },
      ]),
      this.#fieldBuilder.fieldBuilder([
        {
          validators: {
            validation: [
              {
                name: 'fieldMatch',
                options: { errorPath: 'password_confirmation' },
              },
            ],
          },
          fieldGroup: [
            this.#fieldBuilder.fieldBuilder([
              {
                key: 'password',
                type: 'password-field',
                expressions: {
                  'props.required': '!model.id',
                },
                props: {
                  placeholder: _('password'),
                  toggleMask: true,
                },
              },
              {
                key: 'password_confirmation',
                type: 'password-field',
                expressions: {
                  'props.required': '!model.id',
                },
                props: {
                  placeholder: _('password_confirmation'),
                  toggleMask: true,
                },
              },
            ]),
          ],
        },
      ]),
      this.#fieldBuilder.fieldBuilder([
        {
          key: 'phone',
          type: 'input-field',
          props: {
            type: 'number',
            label: _('phone'),
          },
        },
        {
          key: 'job_title',
          type: 'input-field',
          props: {
            label: _('job_title'),
            maxLength: constants.MAX_LENGTH_TEXT_INPUT,
          },
        },
      ]),
      this.#fieldBuilder.fieldBuilder([
        {
          key: 'role_id',
          type: 'select-field',
          props: {
            label: _('role'),
            filter: true,
            options: this.#globalList.getGlobalList('users').pipe(
              map(({ roles }) =>
                roles.map((user: any) => ({
                  label: user.label,
                  value: user.value,
                }))
              )
            ),
          },
        },
        {
          key: 'group_ids',
          type: 'select-field',
          props: {
            label: _('groups'),
            filter: true,
            multiple: true,
            options: this.#globalList.getGlobalList('users').pipe(
              map(({ groups }) =>
                groups.map((group: any) => ({
                  label: group.label,
                  value: group.value,
                }))
              )
            ),
          },
        },
      ]),
      {
        key: 'is_active',
        type: 'switch-field',
        props: {
          label: 'is_active',
        },
      },
    ];
  }

  protected override updateUi(res: any): void {
    if (res.id === this.#authService.currentUser()?.id) {
      this.#authService.updateCurrentUser(res);
    }
  }
}
