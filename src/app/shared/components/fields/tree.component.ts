import { ChangeDetectionStrategy, Component, signal } from "@angular/core";
import { FieldType, FieldTypeConfig } from "@ngx-formly/core";
import { TranslatePipe } from "@ngx-translate/core";
import { ButtonModule } from "primeng/button";
import { StyleClassModule } from "primeng/styleclass";
import { Tree } from "primeng/tree";

@Component({
  selector: "formly-tree-field",
  template: `
    <div class="p-field" attr.data-field-key="{{ field.key }}">
      @if (props.label) {
        <label [class]="props.labelClass">{{ props.label }}</label>
      }

      @if (props.description) {
        <p class="mb-3 text-xs">{{ props.description }}</p>
      }

      @if (props.withSelectionToggler || props.withCollapseToggler) {
        <div class="flex align-items-center flex-wrap gap-1 mb-3">
          @if (props.withSelectionToggler) {
            <button
              pButton
              type="button"
              [label]="
                props.isAllSelected ? ('deselect_all' | translate) : ('select_all' | translate)
              "
              (click)="props.toggleSelection && props.toggleSelection(field)"
              [disabled]="field.props.isNoFilterResult"
              severity="secondary"
              class="text-xs py-1 px-2 w-8rem"
            ></button>
          }

          @if (props.withCollapseToggler) {
            <button
              pButton
              type="button"
              [label]="isNodeExpanded() ? ('collapse_all' | translate) : ('expand_all' | translate)"
              (click)="expandRecursive()"
              [loading]="expandLoading()"
              [disabled]="field.props.isNoFilterResult"
              severity="secondary"
              class="text-xs py-1 px-2 w-8rem"
            ></button>
          }
        </div>
      }

      <p-tree
        class="p-0"
        [value]="props.options"
        [metaKeySelection]="props.metaKeySelection ?? false"
        [propagateSelectionUp]="true"
        [propagateSelectionDown]="true"
        [selection]="props.selection() ?? null"
        [selectionMode]="props.selectionMode ?? 'checkbox'"
        [filter]="props.filter"
        [filterBy]="props.filterBy ?? 'label'"
        [filterPlaceholder]="props.filterPlaceholder | translate"
        [scrollHeight]="props.scrollHeight ?? '100%'"
        (selectionChange)="props.selectionChange && props.selectionChange(field, $event)"
        (onFilter)="props.onFilter && props.onFilter(field, $event)"
        (onNodeSelect)="props.onNodeSelect && props.onNodeSelect(field, $event)"
        (onNodeUnselect)="props.onNodeUnselect && props.onNodeUnselect(field, $event)"
      >
        <ng-template let-node pTemplate="default">
          <span>{{ node.label | translate }}</span>
        </ng-template>
      </p-tree>
    </div>
  `,
  imports: [ButtonModule, StyleClassModule, Tree, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TreeComponent extends FieldType<FieldTypeConfig> {
  isNodeExpanded = signal(false);
  expandLoading = signal(false);

  expandRecursive() {
    this.isNodeExpanded.update(expanded => !expanded);
    this.expandLoading.set(true);

    setTimeout(() => {
      this.props?.options?.forEach(node => {
        node.expanded = this.isNodeExpanded();
        this.expandLoading.set(false);
      });
    }, 500);
  }
}
