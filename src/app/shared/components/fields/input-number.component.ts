import { ChangeDetectionStrategy, Component } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { FieldType, FieldTypeConfig, FormlyModule } from "@ngx-formly/core";
import { TranslatePipe } from "@ngx-translate/core";
import { FloatLabel } from "primeng/floatlabel";
import { InputNumber } from "primeng/inputnumber";

@Component({
  selector: "formly-field-input-number",
  template: `
    <div class="p-field" attr.data-field-key="{{ field.key }}" [class.mb-0]="props.noMarginBottom">
      <p-floatlabel variant="on">
        <p-inputNumber
          [size]="props.size"
          [formControl]="formControl"
          [formlyAttributes]="field"
          [mode]="props.mode || 'decimal'"
          [class]="'w-full ' + props.styleClass"
          [inputStyleClass]="props.inputStyleClass"
          [minFractionDigits]="props.minFractionDigits"
          [maxFractionDigits]="props.maxFractionDigits"
          [useGrouping]="props.useGrouping ?? true"
          [prefix]="props.prefix || ''"
          [suffix]="props.suffix || ''"
          [min]="props.min"
          [max]="props.max"
          [step]="props.step || 1"
          [placeholder]="props.placeholder"
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
  imports: [FloatLabel, TranslatePipe, InputNumber, FormlyModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormlyInputNumberType extends FieldType<FieldTypeConfig> {}
