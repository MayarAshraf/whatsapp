import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { FormlyFieldConfig, FormlyModule } from '@ngx-formly/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { finalize } from 'rxjs';
import { AuthService } from 'src/app/shared/services/auth/auth.service';
import { ForgetModel } from 'src/app/shared/services/global-services/global';

@Component({
  selector: 'app-forget-password',
  standalone: true,
  imports: [TranslateModule, FormlyModule, ReactiveFormsModule, ButtonModule],
  templateUrl: './forget-password.component.html',
  styleUrl: './forget-password.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ForgetPasswordComponent {
  #authService = inject(AuthService);
  #translate = inject(TranslateService);
  #destroyRef = inject(DestroyRef);

  loading = signal(false);
  message = signal('');

  forgetForm = new FormGroup({});
  model: ForgetModel = {} as ForgetModel;

  fields: FormlyFieldConfig[] = [
    {
      key: 'email',
      type: 'input',
      props: {
        required: true,
        placeholder: this.#translate.instant(_('example@gmail.com')),
      },
    },
  ];

  forgetPassword(): void {
    if (this.forgetForm.invalid) return; // return early
    this.loading.set(true);
    this.#authService
      .forgetPassword(this.model)
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.#destroyRef)
      )
      .subscribe({
        next: () =>
          this.message.set(
            this.#translate.instant(
              _(
                'your requerst is successfully please verify your Account to Reset Password'
              )
            )
          ),
      });
  }
}
