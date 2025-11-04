import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { FormlyFieldConfig, FormlyModule } from '@ngx-formly/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { finalize } from 'rxjs';
import { constants } from 'src/app/shared/config/constants';
import { AuthService } from 'src/app/shared/services/auth/auth.service';
import { AlertService } from 'src/app/shared/services/global-services/alert.service';
import { LoginModel } from 'src/app/shared/services/global-services/global';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  standalone: true,
  imports: [
    MessageModule,
    TranslateModule,
    RouterLink,
    FormlyModule,
    ReactiveFormsModule,
    ButtonModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class LoginComponent {
  #activatedRoute = inject(ActivatedRoute);
  #authService = inject(AuthService);
  #alert = inject(AlertService);
  #router = inject(Router);
  #translate = inject(TranslateService);
  #destroyRef = inject(DestroyRef);

  returnUrl!: string;
  loading = signal(false);
  showEnvelopeAnimation = signal(false);
  model: LoginModel = {} as LoginModel;
  loginForm = new FormGroup({});

  fields: FormlyFieldConfig[] = [
    {
      key: 'email',
      type: 'input-field',
      className: 'shadow-none',
      props: {
        required: true,
        placeholder: this.#translate.instant(_('example@gmail.com')),
      },
      validators: {
        validation: ['email'],
      },
    },
    {
      key: 'password',
      type: 'password-field',
      className: 'shadow-none',
      props: {
        required: true,
        placeholder: '********',
        toggleMask: true,
        minLength: constants.MIN_LENGTH_TEXT_INPUT,
      },
    },
  ];

  ngOnInit(): void {
    this.#activatedRoute.queryParams
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe((params) => {
        this.returnUrl =
          params['returnUrl'] || constants.LOGIN_SUCCESS_REDIRECT_URL;
        this.#alert.setMessage({
          severity: 'error',
          detail: params['message'] ?? '',
        });
      });
  }

  login(): void {
    if (this.loginForm.invalid) return;
    this.loading.set(true);
    this.#authService
      .login(this.model)
      .pipe(
        finalize(() => this.loading.set(false)),
        takeUntilDestroyed(this.#destroyRef)
      )
      .subscribe({
        next: () => {
          this.showEnvelopeAnimation.set(true);
          setTimeout(() => {
            this.#router.navigateByUrl(this.returnUrl);
          }, 4000);
        },
      });
  }
}
