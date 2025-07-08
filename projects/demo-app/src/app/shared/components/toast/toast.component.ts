import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      <div
        *ngFor="let toast of toasts"
        class="toast"
        [class]="toast.type"
        [@slideInOut]
      >
        <div class="toast-content">
          <span class="toast-icon">
            <ng-container [ngSwitch]="toast.type">
              <span *ngSwitchCase="'success'">✓</span>
              <span *ngSwitchCase="'error'">✕</span>
              <span *ngSwitchCase="'warning'">⚠</span>
              <span *ngSwitchCase="'info'">ℹ</span>
            </ng-container>
          </span>
          <span class="toast-message">{{ toast.message }}</span>
        </div>
        <button class="toast-close" (click)="removeToast(toast.id)">×</button>
      </div>
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      top: 1rem;
      left: 50%;
      transform: translateX(-50%);
      z-index: 1000;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
    }

    .toast {
      display: flex;
      align-items: center;
      justify-content: space-between;
      min-width: 300px;
      padding: 0.75rem 1rem;
      border-radius: 8px;
      background: white;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      animation: slideIn 0.3s ease-out;
    }

    .toast-content {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .toast-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      font-size: 0.875rem;
    }

    .toast-message {
      font-size: 0.875rem;
      color: #333;
    }

    .toast-close {
      background: none;
      border: none;
      color: #666;
      font-size: 1.25rem;
      cursor: pointer;
      padding: 0;
      margin-left: 0.5rem;
      opacity: 0.6;
      transition: opacity 0.2s;
    }

    .toast-close:hover {
      opacity: 1;
    }

    .success {
      border-left: 4px solid #10b981;
      .toast-icon {
        background: #10b981;
        color: white;
      }
    }

    .error {
      border-left: 4px solid #ef4444;
      .toast-icon {
        background: #ef4444;
        color: white;
      }
    }

    .warning {
      border-left: 4px solid #f59e0b;
      .toast-icon {
        background: #f59e0b;
        color: white;
      }
    }

    .info {
      border-left: 4px solid #3b82f6;
      .toast-icon {
        background: #3b82f6;
        color: white;
      }
    }

    @keyframes slideIn {
      from {
        transform: translateY(-100%);
        opacity: 0;
      }
      to {
        transform: translateY(0);
        opacity: 1;
      }
    }
  `]
})
export class ToastComponent implements OnInit {
  toasts: Toast[] = [];

  constructor(private toastService: ToastService) { }

  ngOnInit(): void {
    this.toastService.toasts$.subscribe(toasts => {
      this.toasts = toasts;
    });
  }

  removeToast(id: number): void {
    this.toastService.remove(id);
  }
} 