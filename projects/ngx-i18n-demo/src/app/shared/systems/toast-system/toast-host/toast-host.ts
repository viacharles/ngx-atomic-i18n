import { Component, inject } from '@angular/core';
import { ToastService } from '../toast.service';
import { ToastComponent } from '../toast/toast';

@Component({
  selector: 'app-toast-host',
  imports: [ToastComponent],
  templateUrl: './toast-host.html',
  styleUrl: './toast-host.scss',
})
export class ToastHostComponent {
  toastService = inject(ToastService);
}
