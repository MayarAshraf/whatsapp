import { ChangeDetectionStrategy, Component } from "@angular/core";
import { FieldType, FieldTypeConfig } from "@ngx-formly/core";
import { TranslatePipe } from "@ngx-translate/core";
import { SafeContentPipe } from "../../pipes/safe-content.pipe";

@Component({
  selector: "formly-separator-field",
  template: `
    @if (!props.noBorderTop) {
      <div class="border-1 border-200"></div>
    }
    <h2 class="flex align-items-center gap-2 section-title">
      @if (props.svg) {
        <span
          class="line-height-1 font-size-0"
          [innerHTML]="props.svg | safeContent: 'html'"
        ></span>
      } @else {
        <i [class]="props.icon"></i>
      }
      {{ props.title | translate }}
    </h2>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SafeContentPipe, TranslatePipe],
})
export class SeparatorComponent extends FieldType<FieldTypeConfig> {}
