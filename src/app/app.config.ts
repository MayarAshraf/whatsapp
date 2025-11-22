import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  ApplicationConfig,
  importProvidersFrom,
  inject,
  provideAppInitializer,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import {
  provideRouter,
  withComponentInputBinding,
  withInMemoryScrolling,
  withRouterConfig,
} from '@angular/router';
import { FORMLY_CONFIG, provideFormlyCore } from '@ngx-formly/core';
import { FormlyPrimeNGModule } from '@ngx-formly/primeng';
import { provideTranslateService, TranslateService } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader'; // loads the json file for the chosen language
import { ConfirmationService, MessageService } from 'primeng/api';
import { providePrimeNG } from 'primeng/config';
import {
  DialogService,
  DynamicDialogConfig,
  DynamicDialogRef,
} from 'primeng/dynamicdialog';
import { Preset } from './app-theme';
import { routes } from './app.routes';
import { customFormlyConfig } from './shared/config/formly-config';
import { HttpRequestInterceptor } from './shared/interceptors/http-request.interceptor';
import { HttpResponseInterceptor } from './shared/interceptors/http-response.interceptor';
import { RefreshTokenInterceptor } from './shared/interceptors/token.interceptor';
import { CustomPageTitleProvider } from './shared/services/custom-page-title.service';

import { environment } from 'src/environments/environment.development';
import { constants } from './shared/config/constants';
import { LangService } from './shared/services/lang.service';

const suffix = environment.production ? `.json?v=${Date.now()}` : '.json';

export const appConfig: ApplicationConfig = {
  providers: [
    MessageService,
    ConfirmationService,
    CustomPageTitleProvider,
    DialogService,
    DynamicDialogRef,
    DynamicDialogConfig,
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideAnimations(),
    providePrimeNG({
      theme: {
        preset: Preset,
        options: {
          cssLayer: false,
          darkModeSelector: '.app-dark', // false or "none" to disable dark mode, "system" is default
        },
      },
    }),
    /* The order of `withInterceptors` and `withInterceptorsFromDi` matters.
     `withInterceptors([...])` must come BEFORE `withInterceptorsFromDi()`
     because `provideLoadingBarInterceptor()` uses DI and relies on our custom
     interceptors.
    */
    provideHttpClient(
      withInterceptors([
        HttpResponseInterceptor,
        RefreshTokenInterceptor,
        HttpRequestInterceptor,
      ])
    ),
    provideRouter(
      routes,
      withComponentInputBinding(),
      withRouterConfig({
        onSameUrlNavigation: 'ignore', // "ignore" (The default), "reload"
        paramsInheritanceStrategy: 'always', // 'always' (The default), 'emptyOnly'
      }),
      // Note: this will preload the lazy loaded modules.
      // withPreloading(PreloadAllModules),
      // withDebugTracing(),
      withInMemoryScrolling({
        // Enable scrolling to anchors
        anchorScrolling: 'enabled',
        // Configures if the scroll position needs to be restored when navigating back.
        scrollPositionRestoration: 'enabled',
      })
    ),
    provideTranslateService({
      loader: provideTranslateHttpLoader({ prefix: './assets/i18n/', suffix }),
    }),
    importProvidersFrom(FormlyPrimeNGModule),
    provideFormlyCore(),
    {
      provide: FORMLY_CONFIG,
      useFactory: customFormlyConfig,
      deps: [TranslateService],
      multi: true,
    },
    provideAppInitializer(() => {
      const langService = inject(LangService);
      const lang = langService.currentLanguage() || constants.DEFAULT_LANGUAGE;
      return langService.switchLanguage(lang);
    }),
  ],
};
