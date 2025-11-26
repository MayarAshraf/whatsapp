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

  header = this.#translate.instant(_('are_you_sure'));
  message = this.#translate.instant(_('you_will_not_be_able_to_revert'));

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
