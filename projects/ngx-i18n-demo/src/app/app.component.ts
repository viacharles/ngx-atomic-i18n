import { Component } from '@angular/core';
import { DialogHostComponent } from './shared/systems/dialog-system/dialog-host/dialog-host.component';
import { LayoutComponent } from './features/layout/layout.component';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [LayoutComponent, DialogHostComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'ngx-i18n-demo';
}
