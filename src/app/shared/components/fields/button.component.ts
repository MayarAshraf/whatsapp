import { ChangeDetectionStrategy, Component } from "@angular/core";
import { FieldType, FormlyModule } from "@ngx-formly/core";
import { ButtonModule } from "primeng/button";

@Component({
  selector: "formly-button-field",
  template: `
    <div
      class="p-field"
      attr.data-field-key="{{ field.key }}"
      [class.mb-0]="props.noMarginBottom"
      [class]="props.isButtonRight ? 'text-right' : props.isButtonCenter ? 'text-center' : ''"
    >
      <button
        pButton
        size="small"
        [type]="props.type ?? 'button'"
        [outlined]="props.outlined ?? true"
        [severity]="props.severity ?? 'success'"
        [class]="props.buttonClass ?? 'py-1 px-2 text-sm shadow-none'"
        [icon]="props.buttonIcon"
        [label]="props.label ?? ''"
        [disabled]="props.disabled"
        [loading]="props.loading"
        (click)="props.onClick && props.onClick(field, $event)"
      ></button>
    </div>
  `,
  imports: [FormlyModule, ButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonFieldComponent extends FieldType {}
