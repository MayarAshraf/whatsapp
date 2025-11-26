// import { ChangeDetectionStrategy, Component } from '@angular/core';
// import { ReactiveFormsModule } from '@angular/forms';
// import { FieldType, FormlyModule } from '@ngx-formly/core';
// import { ButtonModule } from 'primeng/button';
// import { OrderListModule } from 'primeng/orderlist';

// @Component({
//   selector: 'formly-order-list',
//   imports: [ReactiveFormsModule, FormlyModule, OrderListModule, ButtonModule],
//   changeDetection: ChangeDetectionStrategy.OnPush,
//   template: `
//     <div class="formly-order-list">
//       <p-orderList
//         [value]="formControl.value"
//         [dragdrop]="true"
//         [listStyle]="{ height: props.height || '300px' }"
//         [filterBy]="props.filterBy || 'title'"
//         [metaKeySelection]="false"
//         (onReorder)="onReorder($event)"
//       >
//         <ng-template pTemplate="item" let-item let-index="index">
//           <div class="flex align-items-center justify-content-between w-full">
//             <span>{{ item[props.labelKey || 'title'] }}</span>
//             <small class="text-gray-400">#{{ index + 1 }}</small>
//             <i class="pi pi-bars text-gray-500"></i>
//           </div>
//         </ng-template>
//       </p-orderList>
//     </div>
//   `,
// })
// export class FormlyOrderListComponent extends FieldType {
//   onReorder(event: any) {
//     const reordered = event.value.map((item: any, index: number) => ({
//       ...item,
//       order: index + 1,
//     }));

//     this.formControl.setValue(reordered);
//     this.formControl.markAsDirty();
//   }
// }
import {
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  signal,
} from '@angular/core';
import { FieldArrayType, FormlyModule } from '@ngx-formly/core';
import { TranslatePipe } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'formly-order-list',
  template: `
    <div attr.data-field-key="{{ field.key }}">
      @if (props.label) {
      <label>{{ props.label | translate }}</label>
      } @if (props.description) {
      <p class="m-0 mb-3 text-xs">{{ props.description | translate }}</p>
      }

      <div cdkDropList (cdkDropListDropped)="onDrop($event)">
        @for (field of field.fieldGroup; track field.id; let i = $index; let f =
        $first; let l = $last) {
        <div
          cdkDrag
          class="surface-50 border-round border-1 border-200 hover:shadow-2 p-3 pb-1"
          [class.mb-3]="!l"
        >
          <div class="flex gap-2 align-items-center">
            <div
              cdkDragHandle
              class="flex justify-content-center align-items-center cursor-move hover:text-primary-500"
              [pTooltip]="'drag_to_reorder' | translate"
              tooltipPosition="right"
            >
              <i class="fa-solid fa-arrows-to-dot"></i>
            </div>

            <formly-field [field]="field" class="flex-auto" />

            @if (!f || !l) {
            <div class="flex flex-column gap-1">
              @if (!f) {
              <button
                pButton
                type="button"
                class="p-button-text p-button-rounded w-2rem h-2rem"
                icon="pi pi-chevron-up text-sm"
                [pTooltip]="'move_up' | translate"
                (click)="reorderUp(i)"
              ></button>
              <button
                pButton
                type="button"
                class="p-button-text p-button-rounded p-button-danger w-2rem h-2rem"
                icon="pi pi-trash text-sm"
                [pTooltip]="props.removeBtnText || 'remove' | translate"
                (click)="remove(i)"
              ></button>
              } @if (!l) {
              <button
                pButton
                type="button"
                class="p-button-text p-button-rounded w-2rem h-2rem"
                icon="pi pi-chevron-down text-sm"
                [pTooltip]="'move_down' | translate"
                (click)="reorderDown(i)"
              ></button>
              }
            </div>
            }
          </div>

          <div
            *cdkDragPreview
            class="surface-card p-3 shadow-3 border-round border-1 border-primary flex align-items-center gap-2"
          >
            <i class="pi pi-bars text-primary"></i>
            <span class="font-semibold text-sm"
              >{{ props.itemLabel || 'option' | translate }} {{ i + 1 }}</span
            >
          </div>
        </div>
        }
      </div>

      <div class="my-4 text-right">
        <button
          pButton
          class="text-xs p-2"
          type="button"
          icon="pi pi-plus text-xs"
          (click)="addIfAllowed()"
          [disabled]="isAddDisabled()"
          [label]="props.addBtnText | translate"
        ></button>
      </div>
    </div>
  `,
  styles: `
      .p-field {
      &:not(:empty) {
        margin-bottom: 0 !important;
      }
    }
  `,
  imports: [
    FormlyModule,
    ButtonModule,
    TranslatePipe,
    DragDropModule,
    TooltipModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormlyOrderListComponent extends FieldArrayType {
  trigger = signal(0);

  onDrop(event: CdkDragDrop<any[]>) {
    const array = this.formControl.value;
    moveItemInArray(array, event.previousIndex, event.currentIndex);
    this.formControl.setValue([...array]);
    this.formControl.markAsDirty();

    if (this.props.onReorder) {
      this.props.onReorder(this.field, event.previousIndex, event.currentIndex);
    }
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

    if (this.props.onReorder) {
      this.props.onReorder(this.field, oldI, newI);
    }
  }

  isAddDisabled = computed(() => {
    this.trigger();
    const max = this.props.maxItems;
    const length = this.field?.fieldGroup?.length || 0;
    return !!this.props.disabledRepeater || (max && length >= max);
  });

  addIfAllowed() {
    if (this.isAddDisabled()) return;
    this.add();
    this.props.onAdd && this.props.onAdd(this.field);
    this.trigger.update((v) => v + 1);
  }
}
