import { NgTemplateOutlet } from "@angular/common";
import { ChangeDetectionStrategy, Component } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { FieldType, FieldTypeConfig, FormlyModule } from "@ngx-formly/core";
import { FloatLabelModule } from "primeng/floatlabel";
import { InputGroup } from "primeng/inputgroup";
import { InputGroupAddonModule } from "primeng/inputgroupaddon";
import { InputTextModule } from "primeng/inputtext";
@Component({
  selector: "app-input-group",
  template: `
    <div class="p-field" attr.data-field-key="{{ field.key }}">
      <ng-template #addon>
        <p-inputgroup-addon>
          @if (props.icon) {
            <i [class]="props.icon"></i>
          } @else {
            <span> {{ props.flagGroup }}</span>
          }
        </p-inputgroup-addon>
      </ng-template>

      <p-inputgroup>
        @if (!props.isRightAddon) {
          <ng-container *ngTemplateOutlet="addon" />
        }

        <p-floatlabel>
          <input
            [type]="props.type || 'text'"
            pInputText
            [placeholder]="props.placeholder"
            [formControl]="formControl"
            [formlyAttributes]="field"
          />
          @if (props.label) {
            <label>
              {{ props.label }}
              @if (props.required && props.hideRequiredMarker !== true) {
                <span class="text-red">*</span>
              }
            </label>
          }
        </p-floatlabel>

        @if (props.isRightAddon) {
          <ng-container *ngTemplateOutlet="addon" />
        }
      </p-inputgroup>

      @if (props.description) {
        <p class="mt-1 mb-0 font-medium text-xs text-primary capitalize">
          {{ props.description }}
        </p>
      }

      @if (showError && formControl.errors) {
        <small class="error-msg" role="alert">
          <formly-validation-message [field]="field" />
        </small>
      }
    </div>
  `,
  imports: [
    FormlyModule,
    InputGroupAddonModule,
    FloatLabelModule,
    NgTemplateOutlet,
    InputGroup,
    InputTextModule,
    ReactiveFormsModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InputGroupComponent extends FieldType<FieldTypeConfig> {}
