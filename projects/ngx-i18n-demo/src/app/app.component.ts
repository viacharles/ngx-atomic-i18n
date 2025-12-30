import { Component } from '@angular/core';
import { DialogHostComponent } from './shared/systems/dialog-system/dialog-host/dialog-host.component';
import { LayoutComponent } from './features/layout/layout.component';
import { ToastHostComponent } from '@demo2-shared/systems/toast-system/toast-host/toast-host';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [LayoutComponent, DialogHostComponent, ToastHostComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'ngx-i18n-demo';
}
