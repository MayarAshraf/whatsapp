import { DestroyRef, inject, Injectable } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { Title } from "@angular/platform-browser";
import { RouterStateSnapshot, TitleStrategy } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import { constants } from "../config/constants";


@Injectable({
  providedIn: "root",
})
export class CustomPageTitleStrategy extends TitleStrategy {
  #title = inject(Title);
  #translate = inject(TranslateService);
  #destroyRef = inject(DestroyRef); // Current "context" (this service)

  // override the TitleStrategy to define a prefix for pages titles.

  override updateTitle(snapshot: RouterStateSnapshot): void {
    const title = this.buildTitle(snapshot);
    if (title) {
      this.setPageTitle(title);
    } else {
      this.#title.setTitle(`${constants.PAGE_TITLE_PREFIX}`);
    }
  }

  setPageTitle(title: string) {
    this.#translate
      .get(title)
      .pipe(takeUntilDestroyed(this.#destroyRef))
      .subscribe(translatedTitle => {
        this.#title.setTitle(`${constants.PAGE_TITLE_PREFIX} | ${translatedTitle}`);
      });
  }
}

export const CustomPageTitleProvider = [
  { provide: TitleStrategy, useClass: CustomPageTitleStrategy },
];
