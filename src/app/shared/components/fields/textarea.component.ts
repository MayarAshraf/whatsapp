import { ChangeDetectionStrategy, Component } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { FieldType, FieldTypeConfig, FormlyModule } from "@ngx-formly/core";
import { FloatLabel } from "primeng/floatlabel";
import { Textarea } from "primeng/textarea";

@Component({
  selector: "formly-textarea-input",
  template: `
    <div class="p-field" attr.data-field-key="{{ field.key }}" [class.mb-0]="props.noMarginBottom">
      <p-floatlabel variant="on">
        <textarea
          pTextarea
          class="w-full"
          [formControl]="formControl"
          [formlyAttributes]="field"
          [rows]="props.rows"
        ></textarea>

        @if (props.label) {
          <label [class]="props.labelClass">
            {{ props.label }}
            @if (props.required && props.hideRequiredMarker !== true) {
              <span class="text-red">*</span>
            }
          </label>
        }
      </p-floatlabel>

      @if (props.description) {
        <p class="mt-1 mb-0 font-medium text-xs text-primary capitalize">
          {{ props.description }} <i class="fas fa-circle-info text-sm"></i>
        </p>
      }

      @if (showError && formControl.errors) {
        <small class="error-msg" role="alert">
          <formly-validation-message [field]="field" />
        </small>
      }
    </div>
  `,
  imports: [FloatLabel, Textarea, FormlyModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TextareaComponent extends FieldType<FieldTypeConfig> {}
