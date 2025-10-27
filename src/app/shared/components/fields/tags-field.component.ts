import { Component } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { FieldType, FieldTypeConfig, FormlyModule } from "@ngx-formly/core";
import { AutoComplete } from "primeng/autocomplete";
import { FloatLabel } from "primeng/floatlabel";

@Component({
  selector: "formly-field-tags",
  imports: [AutoComplete, FloatLabel, FormlyModule, ReactiveFormsModule],
  template: `
    <div class="p-field" attr.data-field-key="{{ field.key }}">
      <p-floatlabel variant="on">
        <p-autocomplete
          multiple
          fluid
          [formControl]="formControl"
          [formlyAttributes]="field"
          [typeahead]="false"
          [addOnBlur]="true"
          [addOnTab]="true"
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
        <p class="mt-2 text-xs">{{ props.description }}</p>
      }

      @if (showError && formControl.errors) {
        <small class="error-msg" role="alert">
          <formly-validation-message [field]="field" />
        </small>
      }
    </div>
  `,
})
export class FormlyTagsType extends FieldType<FieldTypeConfig> {}
