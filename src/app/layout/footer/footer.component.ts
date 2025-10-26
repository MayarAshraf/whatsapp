import { ChangeDetectionStrategy, Component, signal } from "@angular/core";

import { ButtonModule } from "primeng/button";

@Component({
  selector: "app-footer",
  templateUrl: "./footer.component.html",
  styleUrl: "./footer.component.scss",
  imports: [ButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FooterComponent {
  getCurrentYear() {
    return new Date().getFullYear();
  }
}
