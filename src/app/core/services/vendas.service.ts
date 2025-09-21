import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

// Modelo de Venda
export interface Venda {
  comprador: string;           // pode ser ID ou CPF, conforme backend
  usuarioResponsavel: string;  // pode ser ID ou CPF
  produto: string;             // pode ser ID do produto
  quantidade: number;
  precoUnitario: number;
  total: number;
}

@Injectable({
  providedIn: 'root'
})
export class VendaService {
  // URL ajustada para seguir o padrão do backend com /api/
  private apiUrl = 'http://localhost:8080/api/emanager/venda'; 

  constructor(private http: HttpClient) {}

  // Salvar uma venda
  salvarVenda(venda: Venda): Observable<Venda> {
    return this.http.post<Venda>(this.apiUrl, venda);
  }

  // Listar todas as vendas
  listarVendas(): Observable<Venda[]> {
    return this.http.get<Venda[]>(this.apiUrl);
  }
}
