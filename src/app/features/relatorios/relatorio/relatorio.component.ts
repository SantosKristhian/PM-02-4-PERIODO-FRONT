import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-relatorio',
  templateUrl: './relatorio.component.html',
  styleUrls: ['./relatorio.component.scss'],
  imports: [CommonModule, DatePipe, CurrencyPipe]
})
export class RelatorioComponent implements OnInit {
  vendas: any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.carregarVendas();
  }

  carregarVendas() {
    this.http.get<any[]>('http://localhost:8080/api/emanager/venda/findAll').subscribe({
      next: (data) => {
        this.vendas = data.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
      },
      error: (err) => console.error('Erro ao carregar vendas', err)
    });
  }

  ativarDesativarVenda(venda: any) {
    const novoStatus = !venda.ativo;
    const body = { ...venda, ativo: novoStatus };
    console.log('Body enviado para update:', body);
    this.http.put(`http://localhost:8080/api/emanager/venda/update/${venda.id}`, body).subscribe({
      next: (vendaAtualizada: any) => {
        venda.ativo = vendaAtualizada.ativo;
      },
      error: (err) => alert('Erro ao atualizar status da venda!')
    });
  }
}
