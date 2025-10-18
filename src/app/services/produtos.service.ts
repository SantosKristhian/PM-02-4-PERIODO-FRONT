import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Produto } from '../models/produto';
import { ProdutoCurvaABCDTO } from '../models/produto-curva-abc.dto';

@Injectable({
  providedIn: 'root'
})
export class ProdutosService {
  private apiUrl = 'http://localhost:8080/api/emanager/produto';
  private usuarioId = 1; // simulação de usuário logado

  constructor(private http: HttpClient) {}

  // Listar produtos
  listar(): Observable<Produto[]> {
    return this.http.get<Produto[]>(`${this.apiUrl}/findAll`);
  }

  // Adicionar produto
  adicionar(produto: Produto): Observable<Produto> {
    return this.http.post<Produto>(`${this.apiUrl}/save/${this.usuarioId}`, produto);
  }

  // Editar produto
  editar(produto: Produto): Observable<Produto> {
    return this.http.put<Produto>(`${this.apiUrl}/update/${produto.id}/${this.usuarioId}`, produto);
  }

  // Remover produto
  remover(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete/${id}`);
  }

  // Obter dados da Curva ABC
  curvaABC(): Observable<ProdutoCurvaABCDTO[]> {
    return this.http.get<ProdutoCurvaABCDTO[]>(`${this.apiUrl}/curva-abc`);
  }
}
