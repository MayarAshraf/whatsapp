import { Injectable, inject } from '@angular/core';
import { marker as _ } from '@biesbjerg/ngx-translate-extract-marker';
import { TranslateService } from '@ngx-translate/core';
import { ConfirmationService } from 'primeng/api';

interface ConfirmConfig {
  key?: string;
  header?: string;
  message?: string;
  acceptCallback: Function;
  rejectCallback?: Function;
}

@Injectable({ providedIn: 'root' })
export class ConfirmService {
  #confirm = inject(ConfirmationService);
  #translate = inject(TranslateService);

  header = this.#translate.instant(_('Are You Sure'));
  message = this.#translate.instant(_('You Will Not Be Able To Revert'));

  confirmDelete(config: ConfirmConfig): void {
    this.#confirm.confirm({
      header: config?.header || this.header,
      message: config?.message || this.message,
      icon: 'pi pi-exclamation-circle text-yellow-400',
      rejectButtonStyleClass: 'p-button-outlined',
      accept: config.acceptCallback,
      reject: config?.rejectCallback,
    });
  }
}
