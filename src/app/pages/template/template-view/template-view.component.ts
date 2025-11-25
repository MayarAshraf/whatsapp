import { Component, inject } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { DefaultScreenHeaderComponent } from 'src/app/shared/components/default-screen-header.component';

@Component({
  selector: 'app-template-view',
  imports: [TranslatePipe, ButtonModule, DefaultScreenHeaderComponent],
  templateUrl: './template-view.component.html',
})
export class TemplateViewComponent {
  dialogConfig = inject(DynamicDialogConfig);
  dialogRef = inject(DynamicDialogRef);
  editData = this.dialogConfig.data;

  closeDialog() {
    this.dialogRef.close();
  }
}
