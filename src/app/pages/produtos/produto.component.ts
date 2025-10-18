import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProdutosService } from '../../services/produtos.service';
import { VendaService } from '../../services/vendas.service';
import { ProdutoCurvaABCDTO } from '../../models/produto-curva-abc.dto';
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
  // Curva ABC
  mostrandoCurvaABC: boolean = false;
  curvaABCData: any[] = [];
  curvaPorClassificacao: { [key: string]: any[] } = {};
  curvaLoading: boolean = false;
  curvaError: string | null = null;
  curvaErrorDetail: string | null = null;
  curvaFallbackUsed: boolean = false;

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

  carregarCurvaABC(): void {
    this.curvaLoading = true;
    this.curvaError = null;
    this.produtosService.curvaABC().subscribe({
      next: (dados: ProdutoCurvaABCDTO[]) => {
        console.log('Curva ABC raw response:', dados);
        this.curvaABCData = dados || [];
        this.curvaPorClassificacao = (this.curvaABCData || []).reduce((acc: any, item: any) => {
          const cls = (item && item.classificacao) || 'C';
          if (!acc[cls]) acc[cls] = [];
          acc[cls].push(item);
          return acc;
        }, {});
        this.curvaLoading = false;
      },
      error: (erro: any) => {
        console.error('Erro ao carregar Curva ABC:', erro);
        // Build a helpful error string for the UI
        try {
          if (erro && typeof erro === 'object' && 'status' in erro) {
            const status = erro.status;
            const statusText = (erro.statusText) ? erro.statusText : '';
            // erro.error may be string or object
            const serverMsg = erro.error && (typeof erro.error === 'string' ? erro.error : JSON.stringify(erro.error));
            this.curvaError = `HTTP ${status} ${statusText}: ${serverMsg || erro.message}`;
            this.curvaErrorDetail = JSON.stringify(erro, null, 2);
          } else {
            this.curvaError = erro?.message || 'Erro desconhecido';
            this.curvaErrorDetail = JSON.stringify(erro, null, 2);
          }
        } catch (e) {
          this.curvaError = 'Erro desconhecido ao processar a resposta de erro';
          this.curvaErrorDetail = String(e);
        }
        this.curvaLoading = false;
        // If backend returned 500 (static resource missing), try local computation from vendas
        if (erro && erro.status === 500) {
          console.warn('Curva ABC endpoint failed with 500, attempting local computation from vendas');
          this.computeCurvaABCFromVendas();
        }
      }
    });
  }

  // Fallback: compute Curva ABC locally using vendas list
  computeCurvaABCFromVendas(): void {
    this.curvaFallbackUsed = true;
    this.curvaLoading = true;
    this.vendaService.listarVendas().subscribe({
      next: (vendas: any[]) => {
        console.log('Vendas fetched for local Curva ABC:', vendas);
        // Map productId -> valorTotalVendido
        const totals: Record<number, number> = {};
        vendas.forEach(v => {
          if (!v.itens) return;
          v.itens.forEach((item: any) => {
            const pid = item.produto?.id ?? item.produto;
            const valor = (item.precoVendido ?? item.precoUnitario ?? 0) * (item.quantidadeVendida ?? item.quantidade ?? 0);
            if (!pid) return;
            totals[pid] = (totals[pid] || 0) + valor;
          });
        });

        console.log('Aggregated totals per product:', totals);

        // Convert to array and compute percentages
        const entries: ProdutoCurvaABCDTO[] = Object.keys(totals).map(k => ({
          id: Number(k),
          nome: (this.produtos.find(p => p.id === Number(k))?.nome) || 'Produto ' + k,
          valorTotalVendido: totals[Number(k)],
          percentualFaturamento: 0,
          percentualAcumulado: 0,
          classificacao: 'C'
        }));

        const totalGeral = entries.reduce((s, e) => s + (e.valorTotalVendido || 0), 0) || 1;
        // sort desc
        entries.sort((a, b) => (b.valorTotalVendido || 0) - (a.valorTotalVendido || 0));

        let acumulado = 0;
        entries.forEach(e => {
          e.percentualFaturamento = ((e.valorTotalVendido || 0) / totalGeral) * 100;
          acumulado += e.percentualFaturamento;
          e.percentualAcumulado = acumulado;
            // Match backend thresholds: A = 80%, B = 95%, C = 100%
            if (e.percentualAcumulado <= 80) e.classificacao = 'A';
            else if (e.percentualAcumulado <= 95) e.classificacao = 'B';
            else e.classificacao = 'C';
        });

        this.curvaABCData = entries;
        this.curvaPorClassificacao = entries.reduce((acc: any, item: any) => {
          const cls = item.classificacao || 'C';
          if (!acc[cls]) acc[cls] = [];
          acc[cls].push(item);
          return acc;
        }, {});
        this.curvaLoading = false;
      },
      error: (err: any) => {
        console.error('Erro ao carregar vendas para calcular Curva ABC localmente', err);
        try {
          if (err && typeof err === 'object' && 'status' in err) {
            const status = err.status;
            const statusText = err.statusText || '';
            const serverMsg = err.error && (typeof err.error === 'string' ? err.error : JSON.stringify(err.error));
            this.curvaError = `HTTP ${status} ${statusText}: ${serverMsg || err.message}`;
            this.curvaErrorDetail = JSON.stringify(err, null, 2);
          } else {
            this.curvaError = err?.message || 'Erro desconhecido ao buscar vendas';
            this.curvaErrorDetail = JSON.stringify(err, null, 2);
          }
        } catch (e) {
          this.curvaError = 'Erro desconhecido ao processar erro de vendas';
          this.curvaErrorDetail = String(e);
        }
        this.curvaLoading = false;
      }
    });
  }

  toggleCurvaABC(): void {
    this.mostrandoCurvaABC = !this.mostrandoCurvaABC;
    if (this.mostrandoCurvaABC) this.carregarCurvaABC();
  }

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
