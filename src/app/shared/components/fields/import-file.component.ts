import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FieldType, FieldTypeConfig, FormlyModule } from '@ngx-formly/core';
import { TranslatePipe } from '@ngx-translate/core';
import { FileSelectEvent, FileUpload } from 'primeng/fileupload';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'formly-import-file',
  template: `
    <div class="p-field">
      @if (props.fileLabel) {
      <label>
        {{ props.fileLabel }}
        @if (props.required && props.hideRequiredMarker !== true) {
        <span class="text-red">*</span>
        }
      </label>
      } @if (props.description) {
      <p class="mb-3 text-xs">{{ props.description }}</p>
      }

      <p-fileupload
        mode="basic"
        [multiple]="props.multiple ?? false"
        [accept]="
          props.accept ??
          'xlsx,xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/excel,application/vnd.ms-excel, application/vnd.msexcel'
        "
        [maxFileSize]="props.maxFileSize ?? 134217728"
        [fileLimit]="props.fileLimit"
        [chooseLabel]="'upload_sheet' | translate"
        tooltipPosition="top"
        chooseIcon="pi pi-upload"
        (onSelect)="onSelect($event)"
      />

      @if (showError && formControl.errors) {
      <small class="error-msg" role="alert">
        <formly-validation-message [field]="field" />
      </small>
      }
    </div>
  `,
  imports: [
    FormlyModule,
    FileUpload,
    TooltipModule,
    ReactiveFormsModule,
    TranslatePipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    :host ::ng-deep {
      .p-fileupload-basic {
        justify-content: flex-start;

        .p-fileupload-choose-button {
          width: 100%;
          text-align: start;
          font-size: 14px;
        }

        .filelabel {
          font-size: 12px;
        }
      }
    }
  `,
})
export class ImportFileComponent extends FieldType<FieldTypeConfig> {
  onSelect(event: FileSelectEvent) {
    if (!event.files[0]) return;
    this.field.formControl?.setValue(event.files[0]);
  }
}
