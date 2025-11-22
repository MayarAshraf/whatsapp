import { Location } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { LangService } from '../services/lang.service';

@Component({
  selector: 'app-lang-switcher',
  template: `
    @if (currentLang()) {
    <button
      pButton
      [text]="true"
      class="bg-transparent p-0 hover:underline text-sm"
      [label]="currentLang() === 'en' ? 'AR' : 'EN'"
      (click)="switchLang()"
    ></button>
    }
  `,
  imports: [ButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LangSwitcherComponent {
  #langService = inject(LangService);
  #location = inject(Location);

  currentLang = this.#langService.currentLanguage;
  RELOAD_DELAY = 1000;

  switchLang() {
    const newLang = this.currentLang() === 'en' ? 'ar' : 'en';
    this.#langService.switchLanguage(newLang);
    this.#location.go(this.#location.path());
    setTimeout(() => location.reload(), this.RELOAD_DELAY);
  }
}
