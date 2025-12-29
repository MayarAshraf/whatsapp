import { ChangeDetectionStrategy, Component } from "@angular/core";
import { RouterLink } from "@angular/router";
import { ButtonModule } from "primeng/button";

@Component({
  selector: "app-forbidden-access",
  template: `
    <div class="surface-0 text-center h-screen px-3 py-8">
      <div>
        <svg width="85" viewBox="0 0 24 24">
          <path
            fill="#adb5bd"
            d="M6.616 21q-.672 0-1.144-.472T5 19.385v-8.77q0-.67.472-1.143Q5.944 9 6.616 9H8V7q0-1.671 1.165-2.835Q10.329 3 12 3t2.836 1.165T16 7v2h1.385q.67 0 1.143.472q.472.472.472 1.144v8.769q0 .67-.472 1.143q-.472.472-1.143.472zm0-1h10.769q.269 0 .442-.173t.173-.442v-8.77q0-.269-.173-.442T17.385 10H6.615q-.269 0-.442.173T6 10.616v8.769q0 .269.173.442t.443.173M12 16.5q.633 0 1.066-.434q.434-.433.434-1.066t-.434-1.066T12 13.5t-1.066.434Q10.5 14.367 10.5 15t.434 1.066q.433.434 1.066.434M9 9h6V7q0-1.25-.875-2.125T12 4t-2.125.875T9 7zM6 20V10z"
          />
        </svg>
        <h1
          class="m-0 line-height-1 text-8xl text-primary"
          [style.font-family]="'Arial, sans-serif'"
        >
          403
        </h1>
        <h2 class="mt-0 text-2xl text-700 font-normal">Access Denied / Forbidden</h2>
        <p class="m-0 line-height-2 text-lg text-400">
          Oops! It looks like you don't have permission to view this page. <br />
          If you think this is a mistake, please contact support.
        </p>
        <a pButton routerLink="/" class="mt-4">Go Back to Home</a>
      </div>
    </div>
  `,
  imports: [ButtonModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class Error403Component {}
