import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  vendas: any[] = [];
  produtos: any[] = [];
  clientes: any[] = [];
  usuarios: any[] = [];

  // KPIs
  faturamentoTotal = 0;
  numeroVendas = 0;
  clientesAtivos = 0;
  produtosEmEstoque = 0;
  produtosEstoqueCritico: any[] = [];
  ticketMedio = 0;
  lucroEstimado = 0; // placeholder, needs backend data to be accurate

  // Top lists
  topProdutos: any[] = [];
  menosVendidos: any[] = [];

  // Curva ABC (computed locally)
  curvaABC: any[] = [];

  loading = false;
  error: string | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadAll();
  }

  async loadAll() {
    this.loading = true;
    try {
      const [vendas, produtos, clientes, usuarios] = await Promise.all([
        this.http.get<any[]>(`${environment.SERVIDOR}/venda/findAll`).toPromise(),
        this.http.get<any[]>(`${environment.SERVIDOR}/produto/findAll`).toPromise(),
        this.http.get<any[]>(`${environment.SERVIDOR}/comprador/findAll`).toPromise(),
        this.http.get<any[]>(`${environment.SERVIDOR}/user/findAll`).toPromise()
      ]);

      this.vendas = vendas || [];
      this.produtos = produtos || [];
      this.clientes = clientes || [];
      this.usuarios = usuarios || [];

      this.computeKPIs();
      this.computeTopProdutos();
      this.computeCurvaABC();

    } catch (err: any) {
      console.error('Erro ao carregar dados do dashboard', err);
      this.error = err?.message || 'Erro desconhecido';
    } finally {
      this.loading = false;
    }
  }

  computeKPIs() {
    this.faturamentoTotal = this.vendas.reduce((s, v) => s + (v.valortotal || 0), 0);
    this.numeroVendas = this.vendas.length;
    this.clientesAtivos = this.clientes.length;
    this.produtosEmEstoque = this.produtos.reduce((s, p) => s + (p.quantidade || 0), 0);
    this.produtosEstoqueCritico = this.produtos.filter(p => (p.quantidade || 0) <= (p.minimoEstoque || 5));
    this.ticketMedio = this.numeroVendas ? this.faturamentoTotal / this.numeroVendas : 0;
    // lucroEstimado left as placeholder (requires custo/receita info)
  }

  computeTopProdutos() {
    const totals: Record<number, { id: number; nome: string; total: number; qtd: number }> = {};
    this.vendas.forEach(v => {
      if (!v.itens) return;
      v.itens.forEach((it: any) => {
        const pid = it.produto?.id ?? it.produto;
        const nome = it.produto?.nome || (this.produtos.find(p => p.id === pid)?.nome) || 'Produto ' + pid;
        const valor = (it.precoVendido ?? it.precoUnitario ?? 0) * (it.quantidadeVendida ?? it.quantidade ?? 0);
        if (!pid) return;
        if (!totals[pid]) totals[pid] = { id: pid, nome, total: 0, qtd: 0 };
        totals[pid].total += valor;
        totals[pid].qtd += (it.quantidadeVendida ?? it.quantidade ?? 0);
      });
    });

    const arr = Object.values(totals);
    arr.sort((a, b) => b.qtd - a.qtd);
    this.topProdutos = arr.slice(0, 10);

    arr.sort((a, b) => a.qtd - b.qtd);
    this.menosVendidos = arr.slice(0, 10);
  }

  computeCurvaABC() {
    // reuse totals computed in computeTopProdutos
    const totals: Record<number, number> = {};
    this.vendas.forEach(v => {
      if (!v.itens) return;
      v.itens.forEach((it: any) => {
        const pid = it.produto?.id ?? it.produto;
        const valor = (it.precoVendido ?? it.precoUnitario ?? 0) * (it.quantidadeVendida ?? it.quantidade ?? 0);
        if (!pid) return;
        totals[pid] = (totals[pid] || 0) + valor;
      });
    });

    const entries: any[] = Object.keys(totals).map(k => ({
      id: Number(k),
      nome: (this.produtos.find(p => p.id === Number(k))?.nome) || 'Produto ' + k,
      valorTotalVendido: totals[Number(k)]
    }));

    const totalGeral = entries.reduce((s, e) => s + (e.valorTotalVendido || 0), 0) || 1;
    entries.sort((a, b) => (b.valorTotalVendido || 0) - (a.valorTotalVendido || 0));
    let acumulado = 0;
    entries.forEach(e => {
      e.percentualFaturamento = ((e.valorTotalVendido || 0) / totalGeral) * 100;
      acumulado += e.percentualFaturamento;
      e.percentualAcumulado = acumulado;
      if (acumulado <= 80) e.classificacao = 'A';
      else if (acumulado <= 95) e.classificacao = 'B';
      else e.classificacao = 'C';
    });

    this.curvaABC = entries;
  }

}
