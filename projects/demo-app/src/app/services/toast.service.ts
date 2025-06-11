import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Toast {
    id: number;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
    duration?: number;
}

@Injectable({
    providedIn: 'root'
})
export class ToastService {
    private toasts = new BehaviorSubject<Toast[]>([]);
    toasts$ = this.toasts.asObservable();
    private id = 0;

    show(message: string, type: Toast['type'] = 'info', duration: number = 3000): void {
        const toast: Toast = {
            id: this.id++,
            message,
            type,
            duration
        };

        const currentToasts = this.toasts.value;
        this.toasts.next([...currentToasts, toast]);

        if (duration > 0) {
            setTimeout(() => {
                this.remove(toast.id);
            }, duration);
        }
    }

    success(message: string, duration?: number): void {
        console.log('aa-success', message)
        this.show(message, 'success', duration);
    }

    error(message: string, duration?: number): void {
        this.show(message, 'error', duration);
    }

    warning(message: string, duration?: number): void {
        this.show(message, 'warning', duration);
    }

    info(message: string, duration?: number): void {
        this.show(message, 'info', duration);
    }

    remove(id: number): void {
        const currentToasts = this.toasts.value;
        this.toasts.next(currentToasts.filter(toast => toast.id !== id));
    }

    clear(): void {
        this.toasts.next([]);
    }
} 