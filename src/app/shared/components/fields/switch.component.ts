import { ChangeDetectionStrategy, Component } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { FieldType, FieldTypeConfig, FormlyModule } from "@ngx-formly/core";
import { ToggleSwitch } from "primeng/toggleswitch";

@Component({
  selector: "formly-switch-field",
  template: `
    <div class="p-field" attr.data-field-key="{{ field.key }}">
      <div class="flex gap-2 align-items-center">
        <p-toggleswitch
          class="flex-shrink-0"
          [inputId]="'switch-field-' + id"
          [formControl]="formControl"
          [formlyAttributes]="field"
          [trueValue]="props.trueValue ?? 1"
          [falseValue]="props.falseValue ?? 0"
          (onChange)="props.change && props.change(field, $event)"
        />

        @if (props.label) {
          <label [for]="'switch-field-' + id" class="cursor-pointer text-sm">
            {{ props.label }}
            @if (props.required && props.hideRequiredMarker !== true) {
              <span class="text-red">*</span>
            }
          </label>
        }
      </div>

      @if (props.description) {
        <p class="mt-2 text-xs">{{ props.description }}</p>
      }

      @if (showError && formControl.errors) {
        <small class="error-msg" role="alert">
          <formly-validation-message [field]="field" />
        </small>
      }
    </div>
  `,
  imports: [FormlyModule, ToggleSwitch, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SwitchComponent extends FieldType<FieldTypeConfig> {}
