import { Injectable, inject } from '@angular/core';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root',
})
export class StaticDataService {
  #translate = inject(TranslateService);

  public languages = [
    {
      value: 'en',
      label: this.#translate.instant(_('English')),
    },
    {
      value: 'ar',
      label: this.#translate.instant(_('Arabic')),
    },
  ];
}
