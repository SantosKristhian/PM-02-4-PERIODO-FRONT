// venda.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface VendaDTO {
  compradorId?: number | null;
  metodoPagamento: 'DINHEIRO' | 'PIX' | 'CARTAO_CREDITO' | 'CARTAO_DEBITO';
  valorPago?: number;
  itens: Array<{
    produtoId: number;
    quantidadeVendida: number;
    precoVendido?: number | null;
  }>;
}

export interface CompradorDTO {
  nome: string;
  cpf: string;
  email: string;
}

@Injectable({
  providedIn: 'root'
})
export class VendaService {
  private apiUrl = environment.SERVIDOR;

  constructor(private http: HttpClient) {}

  // Vendas
  salvarVenda(vendaDTO: VendaDTO, usuarioId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/venda/save/${usuarioId}`, vendaDTO);
  }

  listarVendas(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/venda/findAll`);
  }

  // Compradores
  listarCompradores(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/comprador/findAll`);
  }

  criarComprador(comprador: CompradorDTO): Observable<any> {
    return this.http.post(`${this.apiUrl}/comprador/save`, comprador);
  }

  // Usuários
  listarUsuarios(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/user/findAll`);
  }

  // Produtos
  listarProdutos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/produto/findAll`);
  }
}