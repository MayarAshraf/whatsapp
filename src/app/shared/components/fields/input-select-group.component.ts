import { ChangeDetectionStrategy, Component } from "@angular/core";
import { FieldType, FieldTypeConfig, FormlyModule } from "@ngx-formly/core";
import { TranslatePipe } from "@ngx-translate/core";

@Component({
  selector: "formly-field-input-select-group",
  template: `
    <div class="p-field" attr.data-field-key="{{ field.key }}" [class.mb-0]="props.noMarginBottom">
      <div class="flex">
        @if (props.addonIcon || props.addonText) {
          <div class="border-round-left border-1 border-300 p-2 surface-100">
            @if (props.addonIcon) {
              <i class="{{ props.addonIcon }}"></i>
            }
            @if (props.addonText) {
              <span class="white-space-nowrap" [style.font-size.px]="13">
                {{ props.addonText | translate }}
              </span>
            }
          </div>
        }

        @for (f of field.fieldGroup; track f.id) {
          <formly-field
            [class.flex-auto]="$first"
            [class.group-select-field]="f.type === 'select-field'"
            [field]="f"
          />
        }
      </div>

      @if (props.description) {
        <p class="mt-1 mb-0 font-medium text-xs text-primary">
          {{ props.description | translate }} <i class="fas fa-circle-info text-sm"></i>
        </p>
      }
    </div>
  `,
  imports: [TranslatePipe, FormlyModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    ::ng-deep {
      .group-select-field .p-select,
      .group-select-field .p-multiselect {
        width: auto !important;
        max-width: 120px;
        background-color: var(--p-surface-100);
        border-start-start-radius: 0;
        border-end-start-radius: 0;
        padding-block: var(--p-select-padding-y);
        padding-inline: 7px;
        .p-select-label,
        .p-multiselect-label {
          padding: 0;
          padding-inline-end: 7px;
        }
        .p-select-dropdown,
        .p-multiselect-dropdown {
          width: auto;
        }
      }
    }
  `,
})
export class InputSelectGroupType extends FieldType<FieldTypeConfig> {}
