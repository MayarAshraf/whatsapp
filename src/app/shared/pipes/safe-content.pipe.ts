import { inject, Pipe, PipeTransform } from "@angular/core";
import {
  DomSanitizer,
  SafeHtml,
  SafeResourceUrl,
  SafeScript,
  SafeStyle,
  SafeUrl,
} from "@angular/platform-browser";

@Pipe({ name: "safeContent", standalone: true })
export class SafeContentPipe implements PipeTransform {
  #domSanitizer = inject(DomSanitizer);

  transform(
    value: string,
    type: string,
  ): SafeHtml | SafeStyle | SafeScript | SafeUrl | SafeResourceUrl {
    switch (type) {
      case "html":
        return this.#domSanitizer.bypassSecurityTrustHtml(value);
      case "style":
        return this.#domSanitizer.bypassSecurityTrustStyle(value);
      case "script":
        return this.#domSanitizer.bypassSecurityTrustScript(value);
      case "url":
        return this.#domSanitizer.bypassSecurityTrustUrl(value);
      case "resourceUrl":
        return this.#domSanitizer.bypassSecurityTrustResourceUrl(value);
      default:
        return this.#domSanitizer.bypassSecurityTrustHtml(value);
    }
  }
}
