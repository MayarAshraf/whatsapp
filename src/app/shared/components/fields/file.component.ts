import { NgClass } from "@angular/common";
import { ChangeDetectionStrategy, Component, viewChild } from "@angular/core";
import { FieldType, FieldTypeConfig, FormlyModule } from "@ngx-formly/core";
import { TranslatePipe } from "@ngx-translate/core";
import { ButtonModule } from "primeng/button";
import { FileUpload, FileUploadModule } from "primeng/fileupload";
import { TooltipModule } from "primeng/tooltip";
import { TruncateTextPipe } from "../../pipes/truncate-text.pipe";

@Component({
  selector: "formly-field-file",
  template: `
    <div class="p-field">
      @if (props.fileLabel) {
        <label [ngClass]="props.labelClass">
          {{ props.fileLabel | translate }}
          @if (props.required && props.hideRequiredMarker !== true) {
            <span class="text-red-500">*</span>
          }
        </label>
        @if (props.description) {
          <p class="my-1 font-bold capitalize font-medium text-xs">
            {{ props.description | translate }}
          </p>
        }
      }

      <p-fileUpload
        #fileUploader
        [styleClass]="props.styleClass"
        mode="advanced"
        (onSelect)="props.onSelect ? props.onSelect($event, field) : updateControlValue()"
        [multiple]="props.multiple ?? false"
        [disabled]="props.disabled ?? false"
        [accept]="props.accept ?? '.jpeg,.jpg,.png'"
        [maxFileSize]="props.maxFileSize ?? 104857600"
        [fileLimit]="props.fileLimit"
        [chooseLabel]="props.chooseLabel ?? 'Choose' | translate"
        chooseStyleClass="main-cta border-round border-none shadow-none"
        uploadStyleClass="main-cta border-round border-none shadow-none"
        cancelStyleClass="main-cta border-round border-none shadow-none"
        removeStyleClass="main-cta border-round border-none shadow-none w-2rem h-2rem"
        [chooseIcon]="props.chooseIcon ?? 'pi pi-image'"
        [showUploadButton]="false"
        [showCancelButton]="false"
      >
        <ng-template pTemplate="content" let-files>
          @if (files.length > 0) {
            <div class="flex flex-column gap-3">
              @for (file of files; track $index; let i = $index) {
                <div class="flex align-items-center justify-content-between gap-3">
                  @if (props.type === "image") {
                    <div class="w-4rem h-4rem">
                      <img [src]="file.objectURL" class="img-cover h-full w-full" />
                    </div>
                  } @else if (props.type === "pdf") {
                    <i class="text-3xl text-red-600 fa-solid fa-file-pdf"></i>
                  } @else {
                    <i class="text-3xl text-blue-500 fa-solid fa-circle-play"></i>
                  }

                  @if (file.objectURL && props.type !== "image") {
                    <span [pTooltip]="file.objectURL" tooltipPosition="top" class="mr-auto">
                      <a [href]="file.objectURL" targt="_blank">{{
                        file.objectURL | truncateText: 30
                      }}</a>
                    </span>
                  } @else {
                    <span [pTooltip]="file.name" tooltipPosition="top" class="mr-auto">
                      {{ file.name | truncateText: 30 }}
                    </span>
                  }
                  <button
                    pButton
                    class="w-2rem h-2rem text-white"
                    type="button"
                    icon="pi pi-times"
                    [rounded]="true"
                    (click)="fileUploader.remove($event, i); updateControlValue()"
                  ></button>
                </div>
              }
            </div>
          }
        </ng-template>

        <ng-template pTemplate="file"></ng-template>

        <ng-template pTemplate="empty">
          <div class="flex align-items-center justify-content-center flex-column">
            <i class="pi pi-cloud-upload text-2xl"></i>
            <p class="mt-3 mb-0">
              {{ "Drag and drop files to here to upload" | translate }}
            </p>
          </div>
        </ng-template>
      </p-fileUpload>

      @if (showError && formControl.errors) {
        <small class="p-error" role="alert">
          <formly-validation-message [field]="field"></formly-validation-message>
        </small>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgClass,
    TooltipModule,
    FormlyModule,
    ButtonModule,
    TranslatePipe,
    FileUploadModule,
    TruncateTextPipe,
  ],
  styles: [
    `
      ::ng-deep {
        .p-button.p-fileupload-choose {
          border-radius: 5px !important;
          border-top-right-radius: 0 !important;
          &:hover {
            background-color: var(--primary-dark-color);
          }
        }
      }
    `,
  ],
})
export class FileFieldComponent extends FieldType<FieldTypeConfig> {
  fileUploader = viewChild.required<FileUpload>("fileUploader");

  ngOnInit() {
    const controlValue = this.formControl.value;

    if (controlValue) {
      const value = this.props.multiple ? controlValue : [controlValue];
      const files = value.map((url: string) => ({ objectURL: url }));
      this.fileUploader().files.push(...files);
    }
  }

  updateControlValue() {
    const files: (File | { objectURL: string })[] = this.fileUploader().files;
    const formValue = files.map(file => (file instanceof File ? file : file.objectURL));
    if (!formValue.length) this.formControl.setValue(null);
    else {
      this.formControl.setValue(this.props.multiple ? formValue : formValue[0]);
    }
  }
}
