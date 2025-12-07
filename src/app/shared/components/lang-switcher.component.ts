import { Location } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { SelectChangeEvent, SelectModule } from 'primeng/select';
import { LangService } from '../services/lang.service';

@Component({
  selector: 'app-lang-switcher',
  template: `
    @if (currentLang()) {
    <p-select
      size="small"
      [options]="languages"
      [(ngModel)]="currentLang"
      appendTo="body"
      [placeholder]="'select_language' | translate"
      class="w-full text-xs border-200"
      (onChange)="switchLang($event)"
    />
    }
  `,
  imports: [SelectModule, TranslatePipe, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LangSwitcherComponent {
  #langService = inject(LangService);
  #location = inject(Location);

  currentLang = this.#langService.currentLanguage;
  RELOAD_DELAY = 1000;

  languages = [
    { label: 'English', value: 'en' },
    { label: 'Arabic', value: 'ar' },
  ];

  switchLang(event: SelectChangeEvent) {
    this.#langService.switchLanguage(event.value);
    this.#location.go(this.#location.path());
    setTimeout(() => location.reload(), this.RELOAD_DELAY);
  }
}
