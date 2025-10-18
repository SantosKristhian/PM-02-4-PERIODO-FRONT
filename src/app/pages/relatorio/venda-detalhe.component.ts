import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-venda-detalhe',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './venda-detalhe.component.html',
  styleUrls: ['./venda-detalhe.component.scss']
})
export class VendaDetalheComponent implements OnInit {
  venda: any = null;
  loading = false;
  error: string | null = null;

  constructor(private route: ActivatedRoute, private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.loadVenda(Number(id));
  }

  loadVenda(id: number) {
    this.loading = true;
    this.http.get(`http://localhost:8080/api/emanager/venda/findById/${id}`).subscribe({
      next: (v: any) => { this.venda = v; this.loading = false; },
      error: (err) => { this.error = 'Erro ao carregar venda'; this.loading = false; console.error(err); }
    });
  }

  getMetodoLabel(metodo: string | null | undefined): string {
    if (!metodo) return '-';
    switch (metodo) {
      case 'DINHEIRO': return 'Dinheiro';
      case 'PIX': return 'PIX';
      case 'CARTAO_CREDITO': return 'Cartão de Crédito';
      case 'CARTAO_DEBITO': return 'Cartão de Débito';
      default: return metodo;
    }
  }

  voltar() { this.router.navigate(['/relatorios']); }
}
