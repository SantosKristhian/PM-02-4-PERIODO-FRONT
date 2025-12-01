import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { environment } from '../../../environments/environment';
import { RouterModule } from '@angular/router';
import { ProdutosService } from '../../services/produtos.service';
import { VendaService } from '../../services/vendas.service';

@Component({
  selector: 'app-relatorio',
  templateUrl: './relatorio.component.html',
  styleUrls: ['./relatorio.component.scss'],
  imports: [CommonModule, DatePipe, CurrencyPipe, RouterModule]
})
export class RelatorioComponent implements OnInit {
  vendas: any[] = [];
  // Modal cancelar venda
  showCancelModal: boolean = false;
  vendaParaCancelar: any = null;
  cancelLoading: boolean = false;
  cancelError: string | null = null;

  // Curva ABC
  curvaABCData: any[] = [];
  curvaPorClassificacao: { [key: string]: any[] } = {};
  curvaLoading: boolean = false;
  curvaError: string | null = null;
  curvaErrorDetail: string | null = null;
  curvaFallbackUsed: boolean = false;
  showCurvaABC: boolean = false;

  constructor(private http: HttpClient, private produtosService: ProdutosService, private vendaService: VendaService) {}

  ngOnInit(): void {
    this.carregarVendas();
  }

  carregarVendas() {
    this.http.get<any[]>(`${environment.SERVIDOR}/venda/findAll`).subscribe({
      next: (data) => {
        this.vendas = data.sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime());
      },
      error: (err) => console.error('Erro ao carregar vendas', err)
    });
  }

  ativarDesativarVenda(venda: any) {
    
    this.openCancelModal(venda);
  }

  openCancelModal(venda: any) {
    if (!venda || !venda.ativo) return;
    this.vendaParaCancelar = venda;
    this.cancelError = null;
    this.cancelLoading = false;
    this.showCancelModal = true;
  }

  closeCancelModal() {
    this.showCancelModal = false;
    this.vendaParaCancelar = null;
    this.cancelLoading = false;
    this.cancelError = null;
  }

  confirmCancel(itensDevolvidos: boolean) {
    if (!this.vendaParaCancelar) return;
    this.cancelLoading = true;
    const body: any = { ...this.vendaParaCancelar, ativo: false, itensDevolvidos };
    this.http.put(`${environment.SERVIDOR}/venda/update/${this.vendaParaCancelar.id}`, body).subscribe({
      next: (vendaAtualizada: any) => {
        this.cancelLoading = false;
        this.showCancelModal = false;
        this.vendaParaCancelar = null;
        // atualiza a lista de vendas
        this.carregarVendas();
      },
      error: (err) => {
        console.error('Erro ao cancelar venda', err);
        this.cancelLoading = false;
        this.cancelError = err?.message || 'Erro ao cancelar venda';
      }
    });
  }

  // Curva ABC
  carregarCurvaABC(): void {
    this.curvaLoading = true;
    this.curvaError = null;
    this.curvaFallbackUsed = false;

    this.produtosService.curvaABC().subscribe({
      next: (dados: any[]) => {
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
        // build helpful error
        try {
          if (erro && typeof erro === 'object' && 'status' in erro) {
            const status = erro.status;
            const statusText = (erro.statusText) ? erro.statusText : '';
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
        if (erro && erro.status === 500) {
          // fallback to compute locally
          console.warn('Curva ABC endpoint failed with 500, attempting local computation from vendas');
          this.computeCurvaABCFromVendas();
        }
      }
    });
  }

  toggleCurvaABC() {
    this.showCurvaABC = !this.showCurvaABC;
    if (this.showCurvaABC && (!this.curvaABCData || this.curvaABCData.length === 0) && !this.curvaLoading) {
      this.carregarCurvaABC();
    }
  }

  computeCurvaABCFromVendas(): void {
    this.curvaFallbackUsed = true;
    this.curvaLoading = true;
    this.vendaService.listarVendas().subscribe({
      next: (vendas: any[]) => {
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

        const entries: any[] = Object.keys(totals).map(k => ({
          id: Number(k),
          nome: 'Produto ' + k,
          valorTotalVendido: totals[Number(k)],
          percentualFaturamento: 0,
          percentualAcumulado: 0,
          classificacao: 'C'
        }));

        const totalGeral = entries.reduce((s, e) => s + (e.valorTotalVendido || 0), 0) || 1;
        entries.sort((a, b) => (b.valorTotalVendido || 0) - (a.valorTotalVendido || 0));
        let acumulado = 0;
        entries.forEach(e => {
          e.percentualFaturamento = ((e.valorTotalVendido || 0) / totalGeral) * 100;
          acumulado += e.percentualFaturamento;
          e.percentualAcumulado = acumulado;
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
        this.curvaError = err?.message || 'Erro desconhecido ao buscar vendas';
        this.curvaErrorDetail = JSON.stringify(err, null, 2);
        this.curvaLoading = false;
      }
    });
  }
}
