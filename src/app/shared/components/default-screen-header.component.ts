import { NgTemplateOutlet } from "@angular/common";
import { ChangeDetectionStrategy, Component, TemplateRef, input, output } from "@angular/core";
import { TranslatePipe } from "@ngx-translate/core";
import { ButtonModule } from "primeng/button";

@Component({
  selector: "app-default-screen-header",
  template: `
    <div class="flex flex-wrap align-items-center justify-content-between gap-2">
      @if (isTitleRenderedAsBtn()) {
        <button
          pButton
          type="button"
          class="p-button-link p-0 text-primary text-lg shadow-none {{ titleClass() }}"
          (click)="onTitleBtnClicked.emit()"
          [icon]="titleIcon()"
          [label]="title() | translate"
        ></button>
      } @else {
        <div class="flex flex-wrap align-items-center gap-2">
          <h2
            [class]="titleClass()"
            [class]="withDefaultTitleClass() ? 'font-semibold text-lg line-height-2 my-0' : ''"
          >
            <i [class]="titleIcon() + ' text-base'"></i> {{ title() | translate }}
            @if (subtitle() | translate) {
              <span class="block text-sm font-medium text-primary">
                {{ subtitle() | translate }}
              </span>
            }
          </h2>
          <ng-container *ngTemplateOutlet="extraContent()" />
        </div>
      }

      <div class="flex align-items-center gap-1">
        <ng-container *ngTemplateOutlet="headerContent()" />

        @if (displayButton()) {
          <button
            pButton
            type="button"
            class="shadow-none {{ buttonClass() }}"
            (click)="onClick.emit()"
            [icon]="buttonIcon()"
            [label]="buttonLabel() | translate"
          ></button>
        }
      </div>
    </div>
  `,
  imports: [TranslatePipe, NgTemplateOutlet, ButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DefaultScreenHeaderComponent {
  extraContent = input<TemplateRef<any> | null>(null);
  headerContent = input<TemplateRef<any> | null>(null);

  isTitleRenderedAsBtn = input(false);
  title = input("");
  subtitle = input("");
  titleIcon = input("");
  withDefaultTitleClass = input(true);
  titleClass = input("");
  displayButton = input(true);
  buttonClass = input("");
  buttonLabel = input("");
  buttonIcon = input("pi pi-plus");
  onClick = output();
  onTitleBtnClicked = output();
}
