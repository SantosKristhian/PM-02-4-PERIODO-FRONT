import { Injectable, signal } from '@angular/core';

export interface ConfirmRequest {
  mensagem: string;
  textoConfirmar: string;
  textoCancelar: string;
}

@Injectable({ providedIn: 'root' })
export class ConfirmDialogService {
  private readonly _request = signal<ConfirmRequest | null>(null);
  readonly request = this._request.asReadonly();

  private resolver: ((valor: boolean) => void) | null = null;

  confirm(mensagem: string, opcoes?: { textoConfirmar?: string; textoCancelar?: string }): Promise<boolean> {
    this._request.set({
      mensagem,
      textoConfirmar: opcoes?.textoConfirmar || 'Confirmar',
      textoCancelar: opcoes?.textoCancelar || 'Cancelar'
    });

    return new Promise<boolean>(resolve => {
      this.resolver = resolve;
    });
  }

  responder(valor: boolean): void {
    this._request.set(null);
    this.resolver?.(valor);
    this.resolver = null;
  }
}