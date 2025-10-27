import { AsyncPipe } from "@angular/common";
import { ChangeDetectionStrategy, Component, OnInit } from "@angular/core";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { FieldType, FieldTypeConfig, FormlyModule } from "@ngx-formly/core";
import { TranslatePipe } from "@ngx-translate/core";
import { Checkbox } from "primeng/checkbox";
import { Observable, of } from "rxjs";

@Component({
  selector: "formly-multi-checkbox-field",
  template: `
    <div class="p-field" attr.data-field-key="{{ field.key }}">
      @if (props.label) {
        <label class="block mb-2">
          {{ props.label }}
          @if (props.required && props.hideRequiredMarker !== true) {
            <span class="text-red">*</span>
          }
        </label>
      }

      @if (props.description) {
        <p class="mb-3 text-xs">{{ props.description }}</p>
      }

      <div
        [class.flex-column]="props.direction === 'column'"
        [style.gap]="props.direction === 'column' ? '0.5rem' : '2rem'"
        class="flex flex-wrap"
      >
        @for (option of options$ | async; track i; let i = $index) {
          <div class="flex align-items-center gap-2">
            <p-checkbox
              [inputId]="'m-checkbox-field-' + i"
              [formControl]="option.disabled ? disabledControl : formControl"
              [formlyAttributes]="field"
              [name]="field.name || id"
              [value]="option.value"
              (onChange)="props.change && props.change(field, $event)"
            />
            <label
              [for]="'m-checkbox-field-' + i"
              class="text-sm"
              [class.cursor-pointer]="!option.disabled"
            >
              {{ option.label | translate }}
            </label>
          </div>
        }
      </div>

      @if (showError && formControl.errors) {
        <small class="error-msg" role="alert">
          <formly-validation-message [field]="field" />
        </small>
      }
    </div>
  `,
  imports: [AsyncPipe, FormlyModule, Checkbox, ReactiveFormsModule, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MultiCheckboxComponent extends FieldType<FieldTypeConfig> implements OnInit {
  ngOnInit() {
    const v = this.formControl.value;
    if (!Array.isArray(v)) {
      this.formControl.setValue([]);
    }
  }

  get options$(): Observable<any[]> {
    return Array.isArray(this.props.options)
      ? of(this.props.options)
      : (this.props.options ?? of([]));
  }

  get disabledControl() {
    return new FormControl({ value: this.formControl.value, disabled: true });
  }
}
