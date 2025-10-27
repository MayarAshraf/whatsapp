import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogRef } from 'primeng/dynamicdialog';
import { constants } from 'src/app/shared/config/constants';
import { AuthService } from 'src/app/shared/services/auth/auth.service';

@Component({
  selector: 'app-relogin-dialog',
  imports: [ButtonModule],
  template: `
    <p class="m-0">Your user profile has been updated</p>
    <div class="flex justify-content-end mt-3">
      <p-button
        siaze="small"
        severity="success"
        label="Logout"
        icon="pi pi-sign-out"
        [rounded]="true"
        (onClick)="logout()"
      />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReloginDialogComponent {
  #router = inject(Router);
  #dialogRef = inject(DynamicDialogRef);
  #auth = inject(AuthService);

  logout() {
    this.#dialogRef.close();
    this.#auth.doLogout();
    this.#router.navigate([constants.LOGIN_URL]);
  }
}
