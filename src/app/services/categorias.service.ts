import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Categoria {
  id: number;
  nome: string;
}

@Injectable({
  providedIn: 'root'
})
export class CategoriasService {
  private apiUrl = environment.SERVIDOR + '/categoria';

  constructor(private http: HttpClient) {}

  listar(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(`${this.apiUrl}/findAll`);
  }

  adicionar(nome: string): Observable<Categoria> {
    return this.http.post<Categoria>(`${this.apiUrl}/save`, { nome });
  }

  editar(categoria: Categoria): Observable<Categoria> {
    return this.http.put<Categoria>(`${this.apiUrl}/update/${categoria.id}`, { nome: categoria.nome });
  }

  remover(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete/${id}`);
  }
}
