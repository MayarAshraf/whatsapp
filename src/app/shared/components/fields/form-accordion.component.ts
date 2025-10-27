import { ChangeDetectionStrategy, Component } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { FieldType, FormlyModule } from "@ngx-formly/core";
import { TranslatePipe } from "@ngx-translate/core";
import { AccordionModule } from "primeng/accordion";

@Component({
  selector: "formly-form-accordion",
  template: `
    <div attr.data-field-key="{{ field.key }}">
      <p-accordion [value]="props.AccordionValue" [multiple]="props.multiple">
        @for (tab of field.fieldGroup; track $index) {
          <p-accordion-panel [value]="$index" [disabled]="tab.props?.accordionDisabled">
            <p-accordion-header>
              <div class="flex gap-2 align-items-center">
                <i [class]="tab.props?.icon"></i>
                <span>{{ tab.props?.header | translate }}</span>
              </div>
            </p-accordion-header>

            <p-accordion-content>
              <div class="py-2">
                <formly-field [field]="tab" />
              </div>
            </p-accordion-content>
          </p-accordion-panel>
        }
      </p-accordion>
    </div>
  `,
  styles: `
    :host ::ng-deep {
      .p-accordionpanel {
        .p-accordionheader {
          padding: 10px;

          &:focus-visible {
            outline: none;
          }
        }

        .p-accordioncontent-content {
          padding-block: 0;
        }
      }
    }
  `,
  imports: [FormlyModule, TranslatePipe, AccordionModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormAccordionComponent extends FieldType {}
