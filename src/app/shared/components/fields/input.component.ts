import { ChangeDetectionStrategy, Component } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { FieldType, FieldTypeConfig, FormlyModule } from "@ngx-formly/core";
import { TranslatePipe } from "@ngx-translate/core";
import { FloatLabel } from "primeng/floatlabel";
import { InputTextModule } from "primeng/inputtext";

@Component({
  selector: "formly-input-field",
  template: `
    <div class="p-field" attr.data-field-key="{{ field.key }}" [class.mb-0]="props.noMarginBottom">
      <p-floatlabel variant="on">
        <input
          pInputText
          [pSize]="props.size"
          [class]="'w-full ' + props.styleClass"
          [type]="props.type || 'text'"
          [formControl]="formControl"
          [placeholder]="props.placeholder"
          [min]="props.min"
          [max]="props.max"
          [formlyAttributes]="field"
          (keydown)="onKeyDown($event)"
        />

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
          {{ props.description | translate }} <i class="fas fa-circle-info text-sm"></i>
        </p>
      }

      @if (showError && formControl.errors) {
        <small class="error-msg" role="alert">
          <formly-validation-message [field]="field" />
        </small>
      }
    </div>
  `,
  imports: [FloatLabel, TranslatePipe, InputTextModule, FormlyModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputComponent extends FieldType<FieldTypeConfig> {
  onKeyDown(event: KeyboardEvent) {
    if (this.props && this.props?.preventSpaces && event.key === " ") {
      event.preventDefault();
    }
  }
}
