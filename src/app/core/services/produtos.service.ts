import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Produto } from '../../models/produto';

@Injectable({
  providedIn: 'root'
})
export class ProdutosService {
  private apiUrl = 'http://localhost:8080/api/emanager/produto';
  private usuarioId = 1; // se precisar enviar no body

  constructor(private http: HttpClient) {}

  // Listar produtos
  listar(): Observable<Produto[]> {
    return this.http.get<Produto[]>(`${this.apiUrl}/findAll`);
  }

  // Adicionar produto
  adicionar(produto: Produto): Observable<Produto> {
    return this.http.post<Produto>(`${this.apiUrl}/save`, produto);
  }

  // Editar produto
  editar(produto: Produto): Observable<Produto> {
    return this.http.put<Produto>(`${this.apiUrl}/update/${produto.id}`, produto);
  }

  // Remover produto
 // produtos.service.ts
remover(id: number): Observable<void> {
  return this.http.delete<void>(`${this.apiUrl}/produto/delete/${id}`);
}


}
 