import { ChangeDetectionStrategy, Component } from "@angular/core";

@Component({
  selector: "app-spinner",
  template: `
    <div class="spinner-holder">
      <svg width="100" height="100" viewBox="0 0 100 100">
        <g transform="translate(20 50)">
          <circle cx="0" cy="0" r="6" fill="#038EDF">
            <animateTransform
              attributeName="transform"
              type="scale"
              begin="-0.375s"
              calcMode="spline"
              keySplines="0.3 0 0.7 1;0.3 0 0.7 1"
              values="0;1;0"
              keyTimes="0;0.5;1"
              dur="1s"
              repeatCount="indefinite"
            ></animateTransform>
          </circle>
        </g>
        <g transform="translate(40 50)">
          <circle cx="0" cy="0" r="6" fill="#D5628D">
            <animateTransform
              attributeName="transform"
              type="scale"
              begin="-0.25s"
              calcMode="spline"
              keySplines="0.3 0 0.7 1;0.3 0 0.7 1"
              values="0;1;0"
              keyTimes="0;0.5;1"
              dur="1s"
              repeatCount="indefinite"
            ></animateTransform>
          </circle>
        </g>
        <g transform="translate(60 50)">
          <circle cx="0" cy="0" r="6" fill="#00E1B1">
            <animateTransform
              attributeName="transform"
              type="scale"
              begin="-0.125s"
              calcMode="spline"
              keySplines="0.3 0 0.7 1;0.3 0 0.7 1"
              values="0;1;0"
              keyTimes="0;0.5;1"
              dur="1s"
              repeatCount="indefinite"
            ></animateTransform>
          </circle>
        </g>
        <g transform="translate(80 50)">
          <circle cx="0" cy="0" r="6" fill="#7293BC">
            <animateTransform
              attributeName="transform"
              type="scale"
              begin="0s"
              calcMode="spline"
              keySplines="0.3 0 0.7 1;0.3 0 0.7 1"
              values="0;1;0"
              keyTimes="0;0.5;1"
              dur="1s"
              repeatCount="indefinite"
            ></animateTransform>
          </circle>
        </g>
      </svg>
    </div>
  `,
  styles: `
    .spinner-holder {
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: var(--surface-0);
      padding-inline: 1rem 1rem;
      padding-top: 3rem;
      padding-bottom: 1rem;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SpinnerComponent {}
