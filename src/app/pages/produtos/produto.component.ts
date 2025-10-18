import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProdutosService } from '../../services/produtos.service';
import { VendaService } from '../../services/vendas.service';
import { CategoriasService, Categoria } from '../../services/categorias.service';
import { Produto } from '../../models/produto';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-produto',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './produto.component.html',
  styleUrls: ['./produto.component.scss']
})
export class ProdutoComponent implements OnInit {
  produtos: Produto[] = [];
  categorias: Categoria[] = [];
  mostrarForm: boolean = false;
  searchText: string = '';
  showInativos: boolean = false; // controlar exibição de itens inativos

  novoProduto: Produto = {
    id: 0,
    nome: '',
    quantidade: 0,
    preco: 0,
    categoria: { id: 0, nome: '' },
    estoque: 0
  };

  produtoEditando: Produto | null = null;
  // Curva ABC was moved to Relatórios

  constructor(
    private produtosService: ProdutosService,
    private categoriasService: CategoriasService,
    private router: Router,
    private vendaService: VendaService
  ) {}

  ngOnInit(): void {
    this.carregarProdutos();
    this.carregarCategorias();
  }

  // Curva ABC moved to Relatórios

  // Retorna a lista de produtos visíveis considerando o filtro de inativos
  get produtosVisiveis(): Produto[] {
    if (this.showInativos) return this.produtos;
    return this.produtos.filter(p => p.ativo !== false);
  }

  toggleAtivo(produto: Produto): void {
    const produtoParaAtualizar = { ...produto, ativo: !produto.ativo } as any;
    this.produtosService.editar(produtoParaAtualizar).subscribe({
      next: () => this.carregarProdutos(),
      error: (erro: any) => console.error('Erro ao atualizar status do produto:', erro)
    });
  }

  toggleMostrarInativos(): void {
    this.showInativos = !this.showInativos;
  }

  carregarProdutos(): void {
    this.produtosService.listar().subscribe({
      next: (dados: Produto[]) => this.produtos = dados,
      error: (erro: any) => console.error('Erro ao carregar produtos:', erro)
    });
  }

  carregarCategorias(): void {
    this.categoriasService.listar().subscribe({
      next: (dados: Categoria[]) => this.categorias = dados,
      error: (erro: any) => console.error('Erro ao carregar categorias:', erro)
    });
  }

  criarProduto(): void {
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
        this.novoProduto = { id: 0, nome: '', quantidade: 0, preco: 0, categoria: { id: 0, nome: '' }, estoque: 0 };
      },
      error: (erro: any) => console.error('Erro ao adicionar produto:', erro)
    });
  }

  editar(produto: Produto): void {
    this.produtoEditando = {
      ...produto,
      quantidade: produto.quantidade ?? 0,
      preco: produto.preco ?? 0,
      categoria: produto.categoria || { id: 0, nome: '' },
      estoque: produto.estoque ?? 0
    };
  }

  salvarEdicao(): void {
    if (!this.produtoEditando) return;

    const produtoParaSalvar = {
      id: this.produtoEditando.id,
      nome: this.produtoEditando.nome,
      quantidade: this.produtoEditando.quantidade,
      preco: this.produtoEditando.preco,
      categoria: { id: this.produtoEditando.categoria.id }
    };

    this.produtosService.editar(produtoParaSalvar as any).subscribe({
      next: () => {
        this.carregarProdutos();
        this.produtoEditando = null;
      },
      error: (erro: any) => console.error('Erro ao editar produto:', erro)
    });
  }

  cancelarEdicao(): void {
    this.produtoEditando = null;
  }

  remover(produto: Produto): void {
    if (confirm(`Deseja realmente excluir ${produto.nome}?`)) {
      this.produtosService.remover(produto.id).subscribe({
        next: () => this.carregarProdutos(),
        error: (erro: any) => console.error('Erro ao remover produto:', erro)
      });
    }
  }

  filtrar(): void {
    if (!this.searchText) {
      this.carregarProdutos();
    } else {
      this.produtos = this.produtos.filter(prod =>
        prod.nome.toLowerCase().includes(this.searchText.toLowerCase())
      );
    }
  }

  irParaCategorias(): void {
    this.router.navigate(['/categorias']);
  }
}
