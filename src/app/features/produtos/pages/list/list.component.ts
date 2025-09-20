import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProdutosService } from '../../../../../app/core/services/produtos.service';
import { Produto } from '../../../../models/produto';
import { FormsModule } from '@angular/forms';

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

  // controle do form
  mostrarForm: boolean = false;

  // objeto usado no form
novoProduto: Produto = {
  id: 0,
  nome: '',
  quantidade: undefined,
  preco: undefined,
  categoria: { id: undefined },
  descricao: '',
  estoque: 0
};

  constructor(
    private produtosService: ProdutosService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.carregarProdutos();
  }

  // Carrega todos os produtos
  carregarProdutos(): void {
    this.produtosService.listar().subscribe({
      next: (dados) => {
        this.produtos = dados;
      },
      error: (erro) => console.error('Erro ao carregar produtos:', erro)
    });
  }

  // Criar novo produto
  criarProduto(): void {
    // Mapeia apenas os campos que o backend espera
    const produtoParaSalvar = {
      nome: this.novoProduto.nome,
      quantidade: this.novoProduto.quantidade,
      preco: this.novoProduto.preco,
      categoria: { id: this.novoProduto.categoria.id }
    };

    this.produtosService.adicionar(produtoParaSalvar as any).subscribe({
      next: () => {
        this.carregarProdutos();
        this.mostrarForm = false;
        this.novoProduto = {
          id: 0,
          nome: '',
          quantidade: 0,
          preco: 0,
          categoria: { id: 0 },
          descricao: '',
          estoque: 0
        };
      },
      error: (erro) => console.error('Erro ao adicionar produto:', erro)
    });
  }

  // Editar produto
  editar(produto: Produto): void {
    const produtoEditado = { ...produto, nome: produto.nome + ' (editado)' };

    // Mapear apenas campos válidos para backend
    const produtoParaSalvar = {
      id: produtoEditado.id,
      nome: produtoEditado.nome,
      quantidade: produtoEditado.quantidade,
      preco: produtoEditado.preco,
      categoria: { id: produtoEditado.categoria.id }
    };

    this.produtosService.editar(produtoParaSalvar as any).subscribe({
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
