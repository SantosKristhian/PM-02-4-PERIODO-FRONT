import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: number;
  type: ToastType;
  mensagem: string;
}

const DURACAO_MS: Record<ToastType, number> = {
  success: 4000,
  info: 4000,
  warning: 5000,
  error: 6000,
};

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private proximoId = 1;
  private readonly _toasts = signal<Toast[]>([]);
  readonly toasts = this._toasts.asReadonly();

  success(mensagem: string): void {
    this.mostrar('success', mensagem);
  }

  error(mensagem: string): void {
    this.mostrar('error', mensagem);
  }

  warning(mensagem: string): void {
    this.mostrar('warning', mensagem);
  }

  info(mensagem: string): void {
    this.mostrar('info', mensagem);
  }

  dismiss(id: number): void {
    this._toasts.update(toasts => toasts.filter(t => t.id !== id));
  }

  private mostrar(type: ToastType, mensagem: string): void {
    const toast: Toast = { id: this.proximoId++, type, mensagem };
    this._toasts.update(toasts => [...toasts, toast]);
    setTimeout(() => this.dismiss(toast.id), DURACAO_MS[type]);
  }
}
