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
  private usuarioId = 1; // Considere tornar isso dinâmico (ex: do localStorage)

  constructor(private http: HttpClient) {}

  listar(): Observable<Produto[]> {
    return this.http.get<Produto[]>(`${this.apiUrl}/findAll`);
  }

  adicionar(produto: Produto): Observable<Produto> {
    // Garante que a categoria seja enviada no formato correto
    const produtoParaEnviar = {
      nome: produto.nome,
      quantidade: produto.quantidade,
      preco: produto.preco,
      categoria: { id: produto.categoria.id } // Envia apenas o ID da categoria
    };
    
    return this.http.post<Produto>(`${this.apiUrl}/save/${this.usuarioId}`, produtoParaEnviar);
  }

  editar(produto: Produto): Observable<Produto> {
    // Garante que a categoria seja enviada no formato correto
    const produtoParaEnviar = {
      id: produto.id,
      nome: produto.nome,
      quantidade: produto.quantidade,
      preco: produto.preco,
      ativo: produto.ativo,
      categoria: { id: produto.categoria.id } // Envia apenas o ID da categoria
    };
    
    return this.http.put<Produto>(`${this.apiUrl}/update/${produto.id}/${this.usuarioId}`, produtoParaEnviar);
  }

  remover(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete/${id}`);
  }

  curvaABC(): Observable<ProdutoCurvaABCDTO[]> {
    return this.http.get<ProdutoCurvaABCDTO[]>(`${this.apiUrl}/curva-abc`);
  }

  // Método auxiliar para formatar a categoria
  formatarCategoriaParaEnvio(categoria: any): { id: number } {
    if (typeof categoria === 'number') {
      return { id: categoria };
    } else if (categoria && typeof categoria === 'object' && categoria.id) {
      return { id: categoria.id };
    }
    return { id: 0 }; // Valor padrão ou lançar erro
  }
}