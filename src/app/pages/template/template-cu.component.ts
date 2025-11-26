import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { FormlyFieldConfig } from '@ngx-formly/core';
import { map } from 'rxjs';
import { BaseCreateUpdateComponent } from 'src/app/shared/components/basic-crud/base-create-update/base-create-update.component';
import { FormDialogComponent } from 'src/app/shared/components/basic-crud/base-create-update/form-dialog/form-dialog.component';
import { FieldBuilderService } from 'src/app/shared/services/field-builder.service';
import { GlobalListService } from 'src/app/shared/services/global-list.service';
import { LangService } from 'src/app/shared/services/lang.service';
import { TemplateModel } from './services/service-type';

@Component({
  selector: 'app-template-cu',
  templateUrl:
    '../../shared/components/basic-crud/base-create-update/base-create-update.component.html',
  imports: [FormDialogComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TemplateCuComponent extends BaseCreateUpdateComponent<any> {
  #fieldBuilder = inject(FieldBuilderService);
  #globalList = inject(GlobalListService);
  #currentLang = inject(LangService).currentLanguage;

  templateList$ = this.#globalList.getGlobalList('routing');

  ngOnInit() {
    this.dialogMeta = {
      ...this.dialogMeta,
      endpoints: {
        store: 'routing-levels/routing-level',
        update: 'routing-levels/routing-level/update',
      },
    };

    if (this.editData) {
      this.dialogMeta = {
        ...this.dialogMeta,
        dialogTitle: this.translate.instant(_('update_template')),
        submitButtonLabel: this.translate.instant(_('update_template')),
      };
      this.model = new TemplateModel(this.editData);
    } else {
      this.dialogMeta = {
        ...this.dialogMeta,
        dialogTitle: this.translate.instant(_('create_template')),
        submitButtonLabel: this.translate.instant(_('create_template')),
      };
      this.model = new TemplateModel();
    }
    this.fields = this.configureFields();
  }

  configureFields(): FormlyFieldConfig[] {
    return [
      this.#fieldBuilder.fieldBuilder([
        {
          key: 'name',
          type: 'input-field',
          props: { label: _('name'), required: true },
        },
        {
          key: 'order',
          type: 'input-field',
          props: { label: _('order'), type: 'number' },
        },
      ]),
      this.#fieldBuilder.fieldBuilder([
        {
          key: 'level_type',
          type: 'select-field',
          className: 'col-12 md:col-6',
          props: {
            label: _('level_type'),
            filter: true,
            required: true,
            options: this.templateList$.pipe(
              map((res: any) =>
                res['level-types'].map((type: any) => ({
                  label: type.label,
                  value: type.value,
                }))
              )
            ),
          },
        },
        {
          key: 'parent_department_id',
          type: 'select-field',
          className: 'col-12 md:col-6',
          hideExpression: () => this.model?.level_type !== 'subrole',
          props: {
            label: _('department'),
            filter: true,
            options: this.templateList$.pipe(
              map(({ departments }) =>
                departments.map((department: any) => ({
                  label: department[`label_${this.#currentLang()}`],
                  value: department.value,
                }))
              )
            ),
          },
        },
        {
          key: 'is_active',
          type: 'switch-field',
          className: 'col-12 md:col-6',
          props: {
            label: _('is_active'),
          },
        },
        {
          key: 'message_text',
          type: 'textarea-field',
          className: 'col-12 md:col-6',
          props: { label: _('message_text'), required: true },
        },
      ]),
      this.#fieldBuilder.fieldBuilder([
        {
          key: 'options',
          type: 'order-list-field',
          props: {
            label: _('response_options'),
            description: _('drag_to_reorder_configure_buttons'),
            itemLabel: _('option'),
            addBtnText: _('add_option'),
            emptyMessage: _('no_options_added_yet'),
            maxItems: 3,
          },
          fieldArray: {
            fieldGroup: [
              this.#fieldBuilder.fieldBuilder([
                {
                  key: 'title',
                  type: 'input-field',
                  props: { label: _('title') },
                },
                {
                  key: 'order',
                  type: 'input-field',
                  props: { label: _('order'), type: 'number' },
                },
              ]),
              this.#fieldBuilder.fieldBuilder([
                {
                  key: 'department_id',
                  type: 'select-field',
                  className: 'col-12 md:col-6',
                  hideExpression: () => this.model?.level_type !== 'department',
                  props: {
                    label: _('department'),
                    filter: true,
                    options: this.templateList$.pipe(
                      map(({ departments }) =>
                        departments.map((department: any) => ({
                          label: department[`label_${this.#currentLang()}`],
                          value: department.value,
                        }))
                      )
                    ),
                  },
                },
                {
                  key: 'subrole_id',
                  type: 'select-field',
                  className: 'col-12 md:col-6',
                  hideExpression: () =>
                    this.model?.level_type !== 'subrole' ||
                    !this.model.parent_department_id,
                  props: {
                    label: _('subrole'),
                    filter: true,
                    options: [],
                  },
                  expressions: {
                    'props.options': () => {
                      if (!this.model.parent_department_id) {
                        return [];
                      }
                      return this.#globalList
                        .getGlobalList('routing', {
                          department_id: this.model.parent_department_id,
                        })
                        .pipe(
                          map((res: any) =>
                            res['sub-roles'].map((sub: any) => ({
                              label: sub[`label_${this.#currentLang()}`],
                              value: sub.value,
                            }))
                          )
                        );
                    },
                  },
                  hooks: {
                    onInit: (field) => {
                      field.formControl?.valueChanges.subscribe(() => {
                        if (!this.model?.parent_department_id) {
                          field.formControl?.reset();
                        }
                      });
                    },
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
            ],
          },
        },
      ]),
    ];
  }
}
