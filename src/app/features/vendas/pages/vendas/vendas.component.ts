import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

import { Produto } from '../../../../models/produto';
import { Usuario } from '../../../../models/usuario';

@Component({
  selector: 'app-vendas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './vendas.component.html',
  styleUrls: ['./vendas.component.scss']
})
export class VendasComponent implements OnInit {
  compradorCpf: string = '';
  compradorEmail: string = '';
  usuarioResponsavelId: number | null = null;
  produtoId: number | null = null;
  quantidade: number = 0;

  usuarios: Usuario[] = [];
  produtos: Produto[] = [];

  precoUnitario: number = 0;
total: any;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<Usuario[]>('http://localhost:8080/api/emanager/user/findAll').subscribe({
      next: (data) => this.usuarios = data,
      error: (err) => console.error('Erro ao carregar usuários', err)
    });

    this.http.get<Produto[]>('http://localhost:8080/api/emanager/produto/findAll').subscribe({
      next: (data) => this.produtos = data,
      error: (err) => console.error('Erro ao carregar produtos', err)
    });
  }

  onProdutoChange() {
    const produtoSelecionado = this.produtos.find(p => p.id === this.produtoId);
    this.precoUnitario = produtoSelecionado?.preco ?? 0;
  }

  get subtotal(): number {
    return this.quantidade * this.precoUnitario;
  }

  salvarVendas() {
    if (!this.usuarioResponsavelId || !this.produtoId || this.quantidade <= 0) {
      alert('Preencha todos os campos obrigatórios!');
      return;
    }

    const venda = {
      comprador: this.compradorCpf || this.compradorEmail ? { cpf: this.compradorCpf, email: this.compradorEmail } : null,
      usuario: { id: this.usuarioResponsavelId },
      itens: [
        {
          produto: { id: this.produtoId },
          quantidadeVendida: this.quantidade
        }
      ]
    };

    this.http.post(
      `http://localhost:8080/api/emanager/venda/save/${this.usuarioResponsavelId}`,
      venda
    ).subscribe({
      next: () => alert('Venda salva com sucesso!'),
      error: (err) => {
        console.error('Erro ao salvar venda', err);
        alert('Erro ao salvar venda!');
      }
    });
  }
}
