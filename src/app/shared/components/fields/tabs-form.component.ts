import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FieldType, FormlyModule } from '@ngx-formly/core';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { TabsModule } from 'primeng/tabs';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'formly-field-tabs',
  standalone: true,
  imports: [
    FormlyModule,
    ReactiveFormsModule,
    TranslateModule,
    TabsModule,
    ButtonModule,
    TooltipModule,
    MessageModule,
  ],
  template: `
    @if (hasAnyTabError()) {
    <p-message severity="error"
      >"One or more tabs contain invalid fields. Please review the highlighted
      tabs</p-message
    >
    }
    <p-tabs scrollable [(value)]="activeIndex">
      <p-tablist>
        @for (tab of field.fieldGroup; track $index) {
        <p-tab
          [value]="$index"
          class="bg-primary border-round font-normal text-sm py-1 px-2"
        >
          {{ tab.props?.label }}
        </p-tab>
        }
      </p-tablist>

      <p-tabpanels>
        @for (tab of field.fieldGroup; track $index) {
        <p-tabpanel [value]="$index">
          <formly-field [field]="tab"></formly-field>
        </p-tabpanel>
        }
      </p-tabpanels>
    </p-tabs>
  `,
  styles: `
    .scrollable-tabs {
    width: 100%;
    padding-bottom: 10px;
    overflow-x: auto;
    scrollbar-width: thin;
   }

    .scrollable-tabs::-webkit-scrollbar {
      height: 6px;
    }

    :host ::ng-deep {
      .p-tablist {
        &-active-bar {
          display: none;
        }

        &-tab-list {
          margin-block: 1px;
          gap: 0.5rem;
          border: none;
        }
      }

      .p-tabpanels{
        padding-inline: 0 !important;
        padding-bottom: 0 !important;
      }

      .p-tab {
        &:not(.p-tab-active):not(.p-disabled):hover {
          background: none !important;
          border: 1px solid var(--p-primary-color) !important;
          color: var(--p-primary-color) !important;
          transition: 0.3s ease-in-out;
        }

        &-active {
          background: none !important;
          border: 1px solid var(--p-primary-color) !important;
          color: var(--p-primary-color) !important;
        }
      }

      .p-message{
        .p-message-wrapper {
          padding: .5rem 1.75rem;
        }

        .p-icon {
          width: 1.4rem;
          height: 1.4rem;
        }

        .p-icon-wrapper{
          width: 1.4rem;
          height: 1.4rem;
        }
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabsFormComponent extends FieldType {
  activeIndex = signal<number>(0);

  hasAnyTabError(): boolean {
    if (!this.field.fieldGroup) return false;
    for (let i = 0; i < this.field.fieldGroup.length; i++) {
      if (this.isCurrentTabValid(i)) {
        return true;
      }
    }
    return false;
  }

  isCurrentTabValid(index: number): boolean {
    const currentStepField = this.field.fieldGroup?.[index];
    return currentStepField?.props?.isValid
      ? currentStepField.props.isValid()
      : false;
  }
}
