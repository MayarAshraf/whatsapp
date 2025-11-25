import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormGroup } from '@angular/forms';
import { NavigationEnd, Router } from '@angular/router';
import { FormlyFieldConfig, FormlyFormOptions } from '@ngx-formly/core';
import { TranslateService } from '@ngx-translate/core';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { finalize, Observable, of, switchMap } from 'rxjs';
import { AuthService } from 'src/app/shared/services/auth/auth.service';
import { FieldBuilderService } from 'src/app/shared/services/field-builder.service';
import { ApiService } from 'src/app/shared/services/global-services/api.service';
import {
  BaseCrudDialogMeta,
  GlobalApiResponse,
} from 'src/app/shared/services/global-services/global';
import { FormDialogComponent } from './form-dialog/form-dialog.component';

@Component({
  selector: 'app-base-create-update',
  templateUrl: './base-create-update.component.html',
  imports: [FormDialogComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export abstract class BaseCreateUpdateComponent<
  T extends { [key: string]: any }
> {
  public api = inject(ApiService);
  public translate = inject(TranslateService);
  public fieldBuilder = inject(FieldBuilderService);
  public router = inject(Router);
  public destroyRef = inject(DestroyRef); // Current "context" (this component)
  public dialogRef = inject(DynamicDialogRef);
  public dialogConfig = inject(DynamicDialogConfig);
  public editData = this.dialogConfig.data;
  #authService = inject(AuthService);

  isLoading = signal(false);
  isDisabled = computed(() => false);
  dialogMeta = new BaseCrudDialogMeta();

  model = {} as T;
  options: FormlyFormOptions = {};
  fields!: FormlyFieldConfig[];
  createUpdateForm = new FormGroup({});

  loggedInEffect = effect(
    () => !this.#authService.isLoggedIn() && this.closeDialog()
  );

  constructor() {
    this.router.events
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((event) => {
        if (event instanceof NavigationEnd) {
          this.closeDialog();
        }
      });
  }

  protected onTitleBtnClicked() {}
  protected updateUi(data: any): Observable<any> | void {}

  protected createUpdateRecord(endpoints: { [key: string]: string }, model: T) {
    const { headers, params, updateApiVersion, createApiVersion } =
      this.dialogMeta;
    const isUpdateAction =
      this.editData?.method !== 'create' && !!this.editData;

    const endpoint = isUpdateAction ? endpoints.update : endpoints.store;

    const action = this.api.request(
      isUpdateAction ? 'put' : 'post',
      endpoint,
      model,
      headers,
      params
    );

    this.#manageRecord(action);
  }

  #manageRecord(action: Observable<GlobalApiResponse>) {
    if (this.createUpdateForm.invalid) {
      this.createUpdateForm.markAllAsTouched();
      this.#scrollToFirstInvalidField();
      return;
    }
    this.isLoading.set(true);
    action
      .pipe(
        switchMap(
          (response) => this.updateUi(response.data) || of(response.data)
        ),
        finalize(() => this.isLoading.set(false)),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((data) => {
        this.options.resetModel?.();
        this.closeDialog(data);
      });
  }

  #scrollToFirstInvalidField() {
    const form = document.querySelector('form.base-dialog-form.ng-invalid');

    if (!form) return;

    const firstInvalidElement = form.querySelector<HTMLFormElement>(
      '.ng-invalid:not(form)'
    );

    if (firstInvalidElement) {
      firstInvalidElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }
  }

  closeDialog(data?: T) {
    this.dialogRef.close(data);
  }
}
