import { Component } from '@angular/core';
import { PageDialogContainerComponent } from '@demo2-shared/systems/dialog-system/components/page-dialog-container/page-dialog-container.component';
import { SideNavComponent } from '../../../side-nav/side-nav.component';

@Component({
  selector: 'app-side-menu-page-dialog',
  standalone: true,
  imports: [PageDialogContainerComponent, SideNavComponent],
  templateUrl: './side-menu-page-dialog.component.html',
  styleUrl: './side-menu-page-dialog.component.scss'
})
export class SideMenuPageDialogComponent {

}
