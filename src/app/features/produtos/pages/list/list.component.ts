import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // necessário para *ngFor, *ngIf
import { Router } from '@angular/router';
import { ProdutosService } from '../../../../../app/core/services/produtos.service';
import { Produto } from '../../../../models/produto';
import { FormsModule } from '@angular/forms'; // necessário para ngModel

@Component({
  selector: 'app-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {
  produtos: Produto[] = [];
  searchText: string = '';

  constructor(
    private produtosService: ProdutosService,
    private router: Router // caso queira usar navegação futuramente
  ) {}

  ngOnInit(): void {
    this.carregarProdutos();
  }

  // Carrega todos os produtos
  carregarProdutos(): void {
    this.produtosService.listar().subscribe({
      next: (dados) => {
        this.produtos = dados;
        console.log('Produtos carregados:', this.produtos);
      },
      error: (erro) => {
        console.error('Erro ao carregar produtos:', erro);
      }
    });
  }

  // Editar produto
  editar(produto: Produto): void {
    const produtoEditado = { ...produto, nome: produto.nome + ' (editado)' };
    this.produtosService.editar(produtoEditado).subscribe({
      next: () => this.carregarProdutos(),
      error: (erro) => console.error('Erro ao editar produto:', erro)
    });
  }

  // Remover produto
 remover(produto: Produto): void {
  if (confirm(`Deseja realmente excluir ${produto.nome}?`)) {
    this.produtosService.remover(produto.id).subscribe({
      next: () => this.carregarProdutos(),
      error: (erro) => console.error('Erro ao remover produto:', erro)
    });
  }
}

  // Filtrar produtos pelo nome
  filtrar(): void {
    if (!this.searchText) {
      this.carregarProdutos();
    } else {
      this.produtos = this.produtos.filter(prod =>
        prod.nome.toLowerCase().includes(this.searchText.toLowerCase())
      );
    }
  }
}
