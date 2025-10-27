import { ChangeDetectionStrategy, Component } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { FieldType, FieldTypeConfig, FormlyModule } from "@ngx-formly/core";
import { PasswordModule } from "primeng/password";

@Component({
  selector: "formly-password-field",
  template: `
    <div class="p-field" attr.data-field-key="{{ field.key }}">
      @if (props.label) {
        <label>
          {{ props.label }}
          @if (props.required && props.hideRequiredMarker !== true) {
            <span class="text-red">*</span>
          }
        </label>
      }

      @if (props.description) {
        <p class="mb-3 text-xs">{{ props.description }}</p>
      }

      <p-password
        [formControl]="formControl"
        [formlyAttributes]="field"
        [placeholder]="props.placeholder"
        [required]="props.required ?? false"
        [class.ng-dirty]="showError"
        [feedback]="props.feedback"
        [toggleMask]="props.toggleMask"
        [showClear]="false"
        class="w-full"
        [inputStyleClass]="'w-full ' + props.inputStyleClass"
        class="w-full"
      />

      @if (showError && formControl.errors) {
        <small class="error-msg" role="alert">
          <formly-validation-message [field]="field" />
        </small>
      }
    </div>
  `,
  imports: [FormlyModule, PasswordModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PasswordComponent extends FieldType<FieldTypeConfig> {}
