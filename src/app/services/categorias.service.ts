// core/services/categorias.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Categoria {
  id: number;
  nome: string;
}

@Injectable({
  providedIn: 'root'
})
export class CategoriasService {
  private apiUrl = 'http://localhost:8080/api/emanager/categoria';

  constructor(private http: HttpClient) {}

  // Listar todas as categorias
  listar(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(`${this.apiUrl}/findAll`);
  }

  // Adicionar nova categoria → enviando apenas o nome
  adicionar(nome: string): Observable<Categoria> {
    return this.http.post<Categoria>(`${this.apiUrl}/save`, { nome });
  }

  // Editar categoria existente
  editar(categoria: Categoria): Observable<Categoria> {
    return this.http.put<Categoria>(`${this.apiUrl}/update/${categoria.id}`, { nome: categoria.nome });
  }

  // Remover categoria
  remover(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete/${id}`);
  }
}
