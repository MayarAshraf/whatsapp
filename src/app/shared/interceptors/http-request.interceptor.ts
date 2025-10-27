import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { LangService } from '../services/lang.service';

export const HttpRequestInterceptor: HttpInterceptorFn = (req, next) => {
  const langService = inject(LangService);
  const currentLang = langService.currentLanguage?.() ?? 'en';

  const excludedPatterns = ['assets/i18n/', '/login'];

  const isExcluded = excludedPatterns.some((seg) => req.url.includes(seg));

  if (isExcluded) return next(req);

  const headers: Record<string, string> = {
    Accept: 'application/json',
    'X-localization': currentLang,
  };

  const isFormData = req.body instanceof FormData;
  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  const modifiedReq = req.clone({ setHeaders: headers });
  return next(modifiedReq);
};
