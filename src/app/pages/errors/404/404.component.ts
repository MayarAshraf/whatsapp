import { ChangeDetectionStrategy, Component } from "@angular/core";
import { RouterLink } from "@angular/router";
import { ButtonModule } from "primeng/button";

@Component({
  selector: "app-not-found",
  template: `
    <div class="surface-0 text-center h-screen px-3 py-8">
      <div>
        <svg width="75" viewBox="0 0 32 32">
          <path
            fill="#adb5bd"
            d="M16.8 10.8a.75.75 0 0 0-1.5 0v8.5a.75.75 0 0 0 1.5 0zM16 25a1 1 0 1 0 0-2a1 1 0 0 0 0 2"
          />
          <path
            fill="#adb5bd"
            fill-rule="evenodd"
            d="m12.4 2.2l-12 24C-.93 28.86.995 32 3.96 32h24c2.97 0 4.89-3.14 3.56-5.8l-12-24c-1.47-2.94-5.65-2.94-7.12 0M1.3 26.6l12-24c1.1-2.2 4.23-2.2 5.33 0l12 24c1 2-.451 4.35-2.67 4.35h-24c-2.22 0-3.67-2.35-2.67-4.35z"
            clip-rule="evenodd"
          />
        </svg>
        <h1
          class="m-0 line-height-1 text-8xl text-primary"
          [style.font-family]="'Arial, sans-serif'"
        >
          404
        </h1>
        <h2 class="mt-0 text-2xl text-700 font-normal">Page Not Found</h2>
        <p class="m-0 line-height-2 text-lg text-400">
          Sorry, we couldn't find the page you're looking for. <br />
          It might have been moved, deleted, or perhaps you mistyped the URL.
        </p>
        <a pButton routerLink="/" class="mt-4">Go Back to Home</a>
      </div>
    </div>
  `,
  imports: [RouterLink, ButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class Error404Component {}
