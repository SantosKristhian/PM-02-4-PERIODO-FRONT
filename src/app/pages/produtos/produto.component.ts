import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ProdutosService } from '../../services/produtos.service';
import { CategoriasService, Categoria } from '../../services/categorias.service';
import { Produto } from '../../models/produto';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../shared/services/notification.service';
import { ConfirmDialogService } from '../../shared/services/confirm-dialog.service';

@Component({
  selector: 'app-produto',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './produto.component.html',
  styleUrls: ['./produto.component.scss']
})
export class ProdutoComponent implements OnInit {
  private notification = inject(NotificationService);
  private confirmDialog = inject(ConfirmDialogService);

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
      error: (erro: any) => console.error('Erro ao atualizar status do produto:', erro)
    });
  }

  toggleMostrarInativos(): void {
    this.showInativos = !this.showInativos;
  }

  carregarProdutos(): void {
    this.produtosService.listar().subscribe({
      next: (dados: Produto[]) => {
        this.produtos = dados;
      },
      error: (erro: any) => console.error('Erro ao carregar produtos:', erro)
    });
  }

  carregarCategorias(): void {
    this.categoriasService.listar().subscribe({
      next: (dados: Categoria[]) => {
        this.categorias = dados;
      },
      error: (erro: any) => console.error('Erro ao carregar categorias:', erro)
    });
  }

  criarProduto(): void {
    if (!this.novoProduto.categoria.id) {
      this.notification.warning('Selecione uma categoria!');
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
        this.notification.success('Produto criado com sucesso!');
      },
      error: (erro: any) => console.error('Erro ao adicionar produto:', erro)
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
      this.notification.warning('Selecione uma categoria válida!');
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
        this.notification.success('Produto atualizado com sucesso!');
      },
      error: (erro: any) => console.error('Erro ao editar produto:', erro)
    });
  }

  cancelarEdicao(): void {
    this.produtoEditando = null;
  }

  async remover(produto: Produto): Promise<void> {
    if (!produto.id) {
      console.error('Produto não tem ID válido:', produto);
      this.notification.error('Produto não tem ID válido.');
      return;
    }

    const confirmado = await this.confirmDialog.confirm(`Deseja realmente excluir "${produto.nome}"?`);
    if (!confirmado) return;

    this.produtosService.remover(produto.id).subscribe({
      next: () => {
        this.carregarProdutos();
        this.notification.success('Produto excluído com sucesso!');
      },
      error: (erro: any) => console.error('Erro ao remover produto:', erro)
    });
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
