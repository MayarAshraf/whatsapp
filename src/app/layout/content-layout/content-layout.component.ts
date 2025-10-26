import { ChangeDetectionStrategy, Component, inject, signal } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { NavigationError, Router, RouterOutlet } from "@angular/router";
import { FooterComponent } from "@layout/footer/footer.component";
import { MenuSidebarComponent } from "@layout/menu-sidebar/menu-sidebar.component";
import { ButtonModule } from "primeng/button";
import { map, tap } from "rxjs";

@Component({
  selector: "app-content-layout",
  templateUrl: "./content-layout.component.html",
  styleUrl: "./content-layout.component.scss",
  imports: [
    FooterComponent,
    RouterOutlet,
    MenuSidebarComponent,
    ButtonModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ContentLayoutComponent {
  #router = inject(Router);

  showRetryBanner = signal(false);

  isHomeRoute$ = this.#router.events.pipe(map(() => this.#router.url === "/chat"));
  isNavigationError$ = this.#router.events.pipe(
    tap(event => {
      if (event instanceof NavigationError) {
        if (
          event.error.message.includes("Failed to fetch dynamically imported module") ||
          event.error.message.includes("Importing a module script failed")
        ) {
          this.showRetryBanner.set(true);
        }
      }
    }),
  );

  isHomeRoute = toSignal(this.isHomeRoute$, { initialValue: false });
  isNavigationError = toSignal(this.isNavigationError$);

  retry() {
    window.location.reload();
  }
}
