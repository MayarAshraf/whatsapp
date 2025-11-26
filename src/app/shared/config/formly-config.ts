import { AbstractControl } from '@angular/forms';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { FormlyExtension, FormlyFieldConfig } from '@ngx-formly/core';
import { TranslateService } from '@ngx-translate/core';
import { AutocompleteComponent } from '../components/fields/autocomplete.component';
import { ButtonFieldComponent } from '../components/fields/button.component';
import { CheckboxComponent } from '../components/fields/checkbox.component';
import { ColorComponent } from '../components/fields/color.component';
import { DatePickerComponent } from '../components/fields/date-picker.component';
import { FileFieldComponent } from '../components/fields/file.component';
import { FormAccordionComponent } from '../components/fields/form-accordion.component';
import { InputGroupComponent } from '../components/fields/input-group.component';
import { FormlyInputNumberType } from '../components/fields/input-number.component';
import { InputSelectGroupType } from '../components/fields/input-select-group.component';
import { InputComponent } from '../components/fields/input.component';
import { MultiCheckboxComponent } from '../components/fields/multi-checkbox.component';
import { FormlyOrderListComponent } from '../components/fields/order-list.component';
import { PasswordComponent } from '../components/fields/password.component';
import { RadioComponent } from '../components/fields/radio.component';
import { RatingComponent } from '../components/fields/rating.component';
import { RepeatTypeComponent } from '../components/fields/repeat.component';
import { SelectComponent } from '../components/fields/select/select.component';
import { SeparatorComponent } from '../components/fields/separator.component';
import { SwitchComponent } from '../components/fields/switch.component';
import { TabsFormComponent } from '../components/fields/tabs-form.component';
import { FormlyTagsType } from '../components/fields/tags-field.component';
import { TextareaComponent } from '../components/fields/textarea.component';
import { TreeComponent } from '../components/fields/tree.component';

export class FormlyTranslateExtension implements FormlyExtension {
  constructor(private translate: TranslateService) {}

  prePopulate(field: FormlyFieldConfig) {
    const props = field.props || {};
    field.expressions = field.expressions || {};

    if (props.label) {
      field.expressions['props.label'] = this.translate.stream(props.label);
    }

    if (props.placeholder) {
      field.expressions['props.placeholder'] = this.translate.stream(
        props.placeholder
      );
    }
  }
}

export function EmailValidator(control: AbstractControl) {
  if (!control.value) return true; // Allow empty values (optional field)
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(control.value);
}

export function fieldMatchValidator(control: AbstractControl) {
  const { password, password_confirmation } = control.value;
  return password_confirmation === password ? null : { fieldMatch: true };
}

export function onlyNumbersValidator(control: AbstractControl) {
  if (!control.value) return true; // Allow empty values since the field is optional
  const isValid = /^\d+$/.test(control.value);
  return isValid ? null : { onlyNumbers: true };
}

export function urlValidator(control: AbstractControl) {
  if (!control.value) return true; // Allow empty values since the field is optional
  const isValidUrl = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i.test(
    control.value
  );
  return isValidUrl ? null : { url: true };
}

export function customFormlyConfig(translate: TranslateService) {
  return {
    validators: [
      { name: 'email', validation: EmailValidator },
      { name: 'onlyNumbers', validation: onlyNumbersValidator },
      { name: 'url', validation: urlValidator },
      { name: 'fieldMatch', validation: fieldMatchValidator },
    ],
    validationMessages: [
      {
        name: 'required',
        message(error: any, field: FormlyFieldConfig) {
          return translate.stream(_('this_field_is_required'));
        },
      },
      {
        name: 'minLength',
        message(error: any, field: FormlyFieldConfig) {
          return translate.stream(_('GLOBAL.FORM_VALIDATION.MIN_LENGTH'), {
            minLength: field.props?.minLength,
          });
        },
      },
      {
        name: 'maxLength',
        message(error: any, field: FormlyFieldConfig) {
          return translate.stream(_('GLOBAL.FORM_VALIDATION.MAX_LENGTH'), {
            maxLength: field.props?.maxLength,
          });
        },
      },
      {
        name: 'min',
        message: (error: any, field: FormlyFieldConfig) => {
          return translate.stream(_('GLOBAL.FORM_VALIDATION.MIN'), {
            min: field.props?.min,
          });
        },
      },
      {
        name: 'max',
        message: (error: any, field: FormlyFieldConfig) => {
          return translate.stream(_('GLOBAL.FORM_VALIDATION.MAX'), {
            max: field.props?.max,
          });
        },
      },
      {
        name: 'email',
        message() {
          return translate.stream(_('GLOBAL.FORM_VALIDATION.VALID_EMAIL'));
        },
      },
      {
        name: 'onlyNumbers',
        message() {
          return translate.stream(_('GLOBAL.FORM_VALIDATION.VALID_NUMBER'));
        },
      },
      {
        name: 'url',
        message() {
          return translate.stream(_('GLOBAL.FORM_VALIDATION.INVALID_URL'));
        },
      },
      {
        name: 'fieldMatch',
        message() {
          return translate.stream(
            _('GLOBAL.FORM_VALIDATION.COMPARE_PASSWORD_ERROR')
          );
        },
      },
    ],
    extensions: [
      {
        name: 'translate',
        extension: new FormlyTranslateExtension(translate),
        priority: 3,
      },
    ],
    wrappers: [{ name: 'input-select-field', component: InputSelectGroupType }],
    types: [
      { name: 'separator-field', component: SeparatorComponent },
      { name: 'select-field', component: SelectComponent },
      { name: 'input-field', component: InputComponent },
      { name: 'input-number-field', component: FormlyInputNumberType },
      { name: 'textarea-field', component: TextareaComponent },
      { name: 'tree-field', component: TreeComponent },
      { name: 'button-field', component: ButtonFieldComponent },
      { name: 'switch-field', component: SwitchComponent },
      { name: 'checkbox-field', component: CheckboxComponent },
      { name: 'multi-checkbox-field', component: MultiCheckboxComponent },
      { name: 'radio-field', component: RadioComponent },
      { name: 'rating-field', component: RatingComponent },
      { name: 'repeat-field', component: RepeatTypeComponent },
      { name: 'password-field', component: PasswordComponent },
      { name: 'autocomplete-field', component: AutocompleteComponent },
      { name: 'file-field', component: FileFieldComponent },
      { name: 'input-group-field', component: InputGroupComponent },
      { name: 'accordion-field', component: FormAccordionComponent },
      { name: 'color-field', component: ColorComponent },
      { name: 'date-field', component: DatePickerComponent },
      { name: 'tags-field', component: FormlyTagsType },
      {
        name: 'order-list-field',
        component: FormlyOrderListComponent,
      },
      {
        name: 'tabs-field',
        component: TabsFormComponent,
      },
    ],
  };
}
