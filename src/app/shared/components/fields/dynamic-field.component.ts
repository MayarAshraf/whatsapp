import { Component } from "@angular/core";
import { FieldType, FormlyModule } from "@ngx-formly/core";

@Component({
  selector: "formly-dynamic-input",
  template: `
    @for (field of field.fieldGroup; track $index) {
      @switch (field.type) {
        @case ("input-field") {
          <formly-field [field]="field" />
        }
        @case ("select-field") {
          <formly-field [field]="field" />
        }
        @case ("textarea-field") {
          <formly-field [field]="field" />
        }
      }
    }
  `,
  imports: [FormlyModule],
})
export class FormlyDynamicInput extends FieldType {}
