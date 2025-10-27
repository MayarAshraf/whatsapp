import { AsyncPipe, NgTemplateOutlet } from "@angular/common";
import { ChangeDetectionStrategy, Component } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { FieldType, FieldTypeConfig, FormlyModule } from "@ngx-formly/core";
import { TranslatePipe } from "@ngx-translate/core";
import { FloatLabel } from "primeng/floatlabel";
import { MultiSelectModule } from "primeng/multiselect";
import { Select } from "primeng/select";
import { Observable, of } from "rxjs";
import { take } from "rxjs/operators";

@Component({
  selector: "formly-select-field",
  templateUrl: "./select.component.html",
  styleUrl: "./select.component.scss",
  imports: [
    FloatLabel,
    NgTemplateOutlet,
    TranslatePipe,
    FormlyModule,
    Select,
    MultiSelectModule,
    AsyncPipe,
    ReactiveFormsModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectComponent extends FieldType<FieldTypeConfig> {
  get options$(): Observable<any[]> {
    return Array.isArray(this.props.options)
      ? of(this.props.options)
      : (this.props.options ?? of([]));
  }

  ngOnInit() {
    this.#checkAndSetDefaultValue();
  }

  #checkAndSetDefaultValue() {
    if (!this.props.multiple && this.props.required && !this.formControl.value) {
      this.options$.pipe(take(1)).subscribe(options => {
        if (options && options.length === 1) {
          const optionValue = options[0]?.value;
          this.formControl.setValue(optionValue);
        }
      });
    }
  }
}
