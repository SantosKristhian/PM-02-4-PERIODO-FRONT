import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Produto } from '../models/produto';
import { ProdutoCurvaABCDTO } from '../models/produto-curva-abc.dto';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProdutosService {
  private apiUrl = environment.SERVIDOR + '/produto';
  private usuarioId = 1;

  constructor(private http: HttpClient) {}

  listar(): Observable<Produto[]> {
    return this.http.get<Produto[]>(`${this.apiUrl}/findAll`);
  }

  adicionar(produto: Produto): Observable<Produto> {
    return this.http.post<Produto>(`${this.apiUrl}/save/${this.usuarioId}`, produto);
  }

  editar(produto: Produto): Observable<Produto> {
    return this.http.put<Produto>(`${this.apiUrl}/update/${produto.id}/${this.usuarioId}`, produto);
  }

  remover(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete/${id}`);
  }

  curvaABC(): Observable<ProdutoCurvaABCDTO[]> {
    return this.http.get<ProdutoCurvaABCDTO[]>(`${this.apiUrl}/curva-abc`);
  }
}
