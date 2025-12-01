import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProdutosService } from '../../services/produtos.service';
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
  showInativos: boolean = false;

  novoProduto: Produto = {
    id: 0,
    nome: '',
    quantidade: 0,
    preco: 0,
    categoria: { id: 0, nome: '' },
    estoque: 0
  };

  produtoEditando: Produto | null = null;

  constructor(
    private produtosService: ProdutosService,
    private categoriasService: CategoriasService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.carregarProdutos();
    this.carregarCategorias();
  }

  // Retorna a lista de produtos visíveis
  get produtosVisiveis(): Produto[] {
    if (this.showInativos) return this.produtos;
    return this.produtos.filter(p => p.ativo !== false);
  }

  toggleAtivo(produto: Produto): void {
    const produtoParaAtualizar = { 
      ...produto, 
      ativo: !produto.ativo 
    };
    
    this.produtosService.editar(produtoParaAtualizar).subscribe({
      next: () => this.carregarProdutos(),
      error: (erro: any) => {
        console.error('Erro ao atualizar status do produto:', erro);
        alert('Erro ao atualizar status do produto');
      }
    });
  }

  toggleMostrarInativos(): void {
    this.showInativos = !this.showInativos;
  }

  carregarProdutos(): void {
    this.produtosService.listar().subscribe({
      next: (dados: Produto[]) => {
        this.produtos = dados;
        console.log('Produtos carregados:', dados);
      },
      error: (erro: any) => {
        console.error('Erro ao carregar produtos:', erro);
        alert('Erro ao carregar produtos');
      }
    });
  }

  carregarCategorias(): void {
    this.categoriasService.listar().subscribe({
      next: (dados: Categoria[]) => {
        this.categorias = dados;
        console.log('Categorias carregadas:', dados);
      },
      error: (erro: any) => {
        console.error('Erro ao carregar categorias:', erro);
        alert('Erro ao carregar categorias');
      }
    });
  }

  criarProduto(): void {
    if (!this.novoProduto.categoria.id) {
      alert('Selecione uma categoria!');
      return;
    }

    const produtoParaSalvar: Produto = {
      nome: this.novoProduto.nome,
      quantidade: this.novoProduto.quantidade,
      preco: this.novoProduto.preco,
      categoria: { id: this.novoProduto.categoria.id, nome: '' } // Nome não é necessário para envio
    };

    this.produtosService.adicionar(produtoParaSalvar).subscribe({
      next: () => {
        this.carregarProdutos();
        this.mostrarForm = false;
        this.resetarNovoProduto();
        alert('Produto criado com sucesso!');
      },
      error: (erro: any) => {
        console.error('Erro ao adicionar produto:', erro);
        alert('Erro ao criar produto: ' + (erro.error?.message || erro.message));
      }
    });
  }

  private resetarNovoProduto(): void {
    this.novoProduto = { 
      id: 0, 
      nome: '', 
      quantidade: 0, 
      preco: 0, 
      categoria: { id: 0, nome: '' }, 
      estoque: 0 
    };
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

    if (!this.produtoEditando.categoria.id) {
      alert('Selecione uma categoria válida!');
      return;
    }

    const produtoParaSalvar: Produto = {
      id: this.produtoEditando.id,
      nome: this.produtoEditando.nome,
      quantidade: this.produtoEditando.quantidade,
      preco: this.produtoEditando.preco,
      ativo: this.produtoEditando.ativo,
      categoria: { id: this.produtoEditando.categoria.id, nome: '' }
    };

    this.produtosService.editar(produtoParaSalvar).subscribe({
      next: () => {
        this.carregarProdutos();
        this.produtoEditando = null;
        alert('Produto atualizado com sucesso!');
      },
      error: (erro: any) => {
        console.error('Erro ao editar produto:', erro);
        alert('Erro ao editar produto: ' + (erro.error?.message || erro.message));
      }
    });
  }

  cancelarEdicao(): void {
    this.produtoEditando = null;
  }

  remover(produto: Produto): void {
  // Verifica se o produto tem ID
  if (!produto.id) {
    console.error('Produto não tem ID válido:', produto);
    alert('Erro: Produto não tem ID válido');
    return;
  }

  if (confirm(`Deseja realmente excluir "${produto.nome}"?`)) {
    // Agora produto.id é garantido como number
    this.produtosService.remover(produto.id).subscribe({
      next: () => {
        this.carregarProdutos();
        alert('Produto excluído com sucesso!');
      },
      error: (erro: any) => {
        console.error('Erro ao remover produto:', erro);
        alert('Erro ao excluir produto: ' + (erro.error?.message || erro.message));
      }
    });
  }
}

  filtrar(): void {
    if (!this.searchText.trim()) {
      this.carregarProdutos();
    } else {
      const termo = this.searchText.toLowerCase();
      this.produtos = this.produtos.filter(prod =>
        prod.nome.toLowerCase().includes(termo) ||
        (prod.categoria?.nome?.toLowerCase() || '').includes(termo)
      );
    }
  }

  irParaCategorias(): void {
    this.router.navigate(['/categorias']);
  }

  // Método auxiliar para obter o nome da categoria
  getNomeCategoria(produto: Produto): string {
    return produto.categoria?.nome || 'Sem categoria';
  }

  // Método auxiliar para obter a categoria selecionada no formulário
  getCategoriaSelecionada(): Categoria | undefined {
    return this.categorias.find(c => c.id === this.novoProduto.categoria.id);
  }
}