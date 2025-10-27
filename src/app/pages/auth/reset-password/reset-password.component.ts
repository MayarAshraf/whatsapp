import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  Input,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { FormlyFieldConfig, FormlyModule } from '@ngx-formly/core';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { finalize } from 'rxjs';
import { AuthService } from 'src/app/shared/services/auth/auth.service';
import { FieldBuilderService } from 'src/app/shared/services/field-builder.service';
import { ResetModel } from 'src/app/shared/services/global-services/global';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [TranslateModule, FormlyModule, ReactiveFormsModule, ButtonModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ResetPasswordComponent {
  @Input() token!: string;

  #authService = inject(AuthService);
  #destroyRef = inject(DestroyRef);
  #fieldBuilder = inject(FieldBuilderService);
  #router = inject(Router);

  loading = signal(false);
  resetForm = new FormGroup({});
  model: ResetModel = {} as ResetModel;

  fields: FormlyFieldConfig[] = [
    this.#fieldBuilder.fieldBuilder([
      {
        validators: {
          validation: [
            {
              name: 'fieldMatch',
              options: { errorPath: 'password_confirm' },
            },
          ],
        },
        fieldGroup: [
          this.#fieldBuilder.fieldBuilder([
            {
              key: 'password',
              type: 'password-field',
              props: {
                placeholder: 'auth.enter_password',
                toggleMask: true,
              },
            },
            {
              key: 'password_confirmation',
              type: 'password-field',
              props: {
                placeholder: 'auth.enter_password',
                toggleMask: true,
              },
            },
          ]),
        ],
      },
    ]),
  ];

  resetPassword(): void {
    if (this.resetForm.invalid) return; // return early
    this.model = { ...this.model, token: this.token };
    this.loading.set(true);
    this.#authService
      .resetPassword(this.model)
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.#destroyRef)
      )
      .subscribe({
        next: () => this.#router.navigateByUrl('/dashboard'),
      });
  }
}
