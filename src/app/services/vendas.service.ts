import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Venda {
  comprador: string;
  usuarioResponsavel: string;
  produto: string;
  quantidade: number;
  precoUnitario: number;
  total: number;
}

@Injectable({
  providedIn: 'root'
})
export class VendaService {
  private apiUrl = environment.SERVIDOR + '/venda';

  constructor(private http: HttpClient) {}

  salvarVenda(venda: Venda): Observable<Venda> {
    return this.http.post<Venda>(this.apiUrl, venda);
  }

  listarVendas(): Observable<Venda[]> {
    return this.http.get<Venda[]>(`${this.apiUrl}/findAll`);
  }

  listarVendasRaiz(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }
}
