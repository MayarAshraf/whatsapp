import { AsyncPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  FormlyFieldConfig,
  FormlyFormOptions,
  FormlyModule,
} from '@ngx-formly/core';
import { TranslatePipe } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { Observable } from 'rxjs';
import { DefaultScreenHeaderComponent } from '../../../default-screen-header.component';
import { SpinnerComponent } from '../../../spinner.component';

@Component({
  selector: 'app-form-dialog',
  imports: [
    AsyncPipe,
    ButtonModule,
    FormlyModule,
    ReactiveFormsModule,
    DefaultScreenHeaderComponent,
    SpinnerComponent,
    TranslatePipe,
  ],
  template: `
    <form
      [formGroup]="form()"
      (ngSubmit)="onSubmit.emit(model())"
      class="base-dialog-form h-full"
    >
      <div class="flex flex-column h-full">
        @if (showDialogHeader()) {
        <div class="sticky top-0 z-10 p-3 border-bottom-1 border-300 surface-0">
          <app-default-screen-header
            [title]="dialogTitle()"
            [titleIcon]="titleIcon()"
            [isTitleRenderedAsBtn]="isTitleRenderedAsBtn()"
            [titleClass]="dialogTitleClass()"
            [subtitle]="dialogSubtitle()"
            buttonIcon="pi pi-times"
            buttonClass="p-button-text p-button-secondary p-button-rounded w-2rem h-2rem"
            (onTitleBtnClicked)="onTitleBtnClicked.emit()"
            (onClick)="closeDialog.emit()"
          />
        </div>
        } @if (dialogData$() | async) {
        <div [class]="isFormActionsSticky() ? 'flex-auto' : ''">
          <ng-content select="[additionalContent]" />
          <div class=" p-3">
            <formly-form
              [model]="model()"
              [fields]="fields()"
              [form]="form()"
              [options]="options()"
            />
          </div>
        </div>

        @if (showFormActions()) {
        <div
          [class]="
            'p-3 ' +
            (isFormActionsSticky()
              ? 'sticky bottom-0 z-10 border-top-1 border-300 surface-0'
              : '')
          "
        >
          <div class="flex flex-wrap justify-content-end gap-2">
            @if (showResetButton()) {
            <button
              pButton
              type="button"
              size="small"
              severity="secondary"
              [outlined]="true"
              (click)="options().resetModel?.()"
              [label]="'clear_all' | translate"
            ></button>
            } @if (showSubmitButton()) {
            <p-button
              size="small"
              severity="success"
              type="submit"
              [loading]="isLoading()"
              [disabled]="isDisabled()"
              [label]="submitBtnLabel() | translate"
            />
            }
          </div>
        </div>
        } } @else {
        <app-spinner />
        }
      </div>
    </form>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormDialogComponent<T> {
  showDialogHeader = input(true);
  dialogData$ = input<Observable<any>>();
  dialogTitle = input('');
  dialogTitleClass = input('');
  dialogSubtitle = input('');
  isTitleRenderedAsBtn = input(false);
  titleIcon = input('');
  onTitleBtnClicked = output();
  closeDialog = output();
  form = input<FormGroup<any>>({} as FormGroup);
  model = input<T>({} as T);
  fields = input.required<FormlyFieldConfig[]>();
  options = input<FormlyFormOptions>({});
  submitBtnLabel = input<string>('');
  isLoading = input(false);
  isDisabled = input(false);
  showFormActions = input(true);
  showSubmitButton = input(true);
  showResetButton = input(false);
  isFormActionsSticky = input(true);
  onSubmit = output<T>();
}
