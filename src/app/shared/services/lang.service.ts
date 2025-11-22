import { DOCUMENT } from '@angular/common';
import { Injectable, inject, signal } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ar } from 'primelocale/js/ar.js';
import { en } from 'primelocale/js/en.js';
import { PrimeNG } from 'primeng/config';
import { StorageService } from './global-services/storage.service';

@Injectable({ providedIn: 'root' })
export class LangService {
  #translate = inject(TranslateService);
  #primengConfig = inject(PrimeNG);
  #storage = inject(StorageService);
  #document = inject(DOCUMENT);

  #LANG_KEY = 'language-app';
  currentLanguage = signal<string>(this.#storage.getLocalData(this.#LANG_KEY));

  switchLanguage(lang: string) {
    const htmlTag = this.#document.getElementsByTagName(
      'html'
    )[0] as HTMLHtmlElement;
    const locale = lang === 'ar' ? ar : en;
    const dir = lang === 'ar' ? 'rtl' : 'ltr';
    this.currentLanguage.set(lang);
    this.#storage.storeLocalData(this.#LANG_KEY, lang);
    htmlTag.lang = lang;
    htmlTag.dir = dir;
    this.#primengConfig.setTranslation(locale);
    this.#translate.use(lang);
  }
}
