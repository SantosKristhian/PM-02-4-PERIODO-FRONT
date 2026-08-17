import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export type AcaoAuditoria = 'CRIACAO' | 'ATUALIZACAO' | 'EXCLUSAO';

export interface RegistroAuditoria {
  id: number;
  entidade: string;
  entidadeId: number;
  acao: AcaoAuditoria;
  usuarioId: number | null;
  usuarioNome: string;
  dataHora: string;
  dadosAntes: string | null;
  dadosDepois: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class AuditoriaService {
  private apiUrl = environment.SERVIDOR + '/auditoria';

  constructor(private http: HttpClient) {}

  listarTudo(): Observable<RegistroAuditoria[]> {
    return this.http.get<RegistroAuditoria[]>(`${this.apiUrl}/findAll`);
  }

  listarPorEntidade(entidade: string): Observable<RegistroAuditoria[]> {
    return this.http.get<RegistroAuditoria[]>(`${this.apiUrl}/entidade/${entidade}`);
  }

  listarPorRegistro(entidade: string, entidadeId: number): Observable<RegistroAuditoria[]> {
    return this.http.get<RegistroAuditoria[]>(`${this.apiUrl}/entidade/${entidade}/${entidadeId}`);
  }
}