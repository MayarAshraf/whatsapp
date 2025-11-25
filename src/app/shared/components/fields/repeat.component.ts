import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  FieldArrayType,
  FormlyFieldConfig,
  FormlyModule,
} from '@ngx-formly/core';
import { TranslatePipe } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'formly-repeat',
  template: `
    <div attr.data-field-key="{{ field.key }}">
      @if (props.label) {
      <label>{{ props.label }}</label>
      } @if (props.description) {
      <p class="mb-3 text-xs">{{ props.description }}</p>
      } @for ( field of field.fieldGroup; track field.id; let i = $index; let f
      = $first; let l = $last ) {
      <div
        class="pt-3 px-2 flex gap-2 align-items-start surface-50 border-round border-1 border-200"
        [class.mb-3]="!l"
      >
        <formly-field [field]="field" class="flex-auto" />
        @if (!f || !l) {
        <div class="flex gap-1">
          @if (!f) {
          <button
            pButton
            type="button"
            class="p-button-text p-button-rounded p-button-danger w-2rem h-2rem text-xs p-1"
            severity="danger"
            icon="fas fa-trash"
            (click)="remove(i)"
            [pTooltip]="props.removeBtnText || 'Remove' | translate"
            label="{{ props.removeBtnText | translate }}"
          ></button>
          <button
            pButton
            class="p-button-text p-button-rounded w-2rem h-2rem text-xs p-1"
            icon="pi pi-chevron-up"
            type="button"
            [pTooltip]="'Move up' | translate"
            (click)="reorderUp(i)"
          ></button>
          } @if (!l) {
          <button
            pButton
            class="p-button-text p-button-rounded w-2rem h-2rem text-xs p-1"
            icon="pi pi-chevron-down"
            type="button"
            [pTooltip]="'Move down' | translate"
            (click)="reorderDown(i)"
          ></button>
          }
        </div>
        }
      </div>
      }

      <div class="my-3 text-right">
        <button
          pButton
          class="text-xs p-2"
          type="button"
          icon="fas fa-plus text-xs"
          (click)="add(); props.onAdd && props.onAdd(field)"
          [disabled]="props.disabledRepeater"
          label="{{ props.addBtnText | translate }}"
        ></button>
      </div>
    </div>
  `,
  imports: [FormlyModule, ButtonModule, TranslatePipe, TooltipModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RepeatTypeComponent extends FieldArrayType {
  customAdd() {
    if (this.props.add) {
      this.props.add(this);
    } else {
      this.add();
    }
  }

  customRemove(i: number) {
    if (this.props.remove) {
      this.props.remove(this, i);
    } else {
      this.remove(i);
    }
  }

  onAdd(field: FormlyFieldConfig) {
    super.add();
  }

  onRemove(i: number) {
    super.remove(i);
  }

  reorderUp(i: number) {
    if (i === 0) return;
    this.#reorder(i, i - 1);
  }

  reorderDown(i: number) {
    if (i === this.formControl.length - 1) return;
    this.#reorder(i, i + 1);
  }

  #reorder(oldI: number, newI: number) {
    const m = this.model[oldI];
    this.remove(oldI);
    this.add(newI, m);
  }
}
