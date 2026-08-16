import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuditoriaService, RegistroAuditoria } from '../../services/auditoria.service';

interface CampoAlterado {
  campo: string;
  de: any;
  para: any;
}

@Component({
  selector: 'app-auditoria',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auditoria.component.html',
  styleUrls: ['./auditoria.component.scss']
})
export class AuditoriaComponent implements OnInit {
  private auditoriaService = inject(AuditoriaService);

  registros: RegistroAuditoria[] = [];
  loading = false;
  filtroEntidade: string = '';
  registroExpandidoId: number | null = null;

  entidades = ['PRODUTO', 'USUARIO', 'VENDA'];

  ngOnInit(): void {
    this.carregar();
  }

  carregar(): void {
    this.loading = true;
    const request = this.filtroEntidade
      ? this.auditoriaService.listarPorEntidade(this.filtroEntidade)
      : this.auditoriaService.listarTudo();

    request.subscribe({
      next: (dados) => {
        this.registros = dados;
        this.loading = false;
      },
      error: (erro) => {
        console.error('Erro ao carregar auditoria', erro);
        this.loading = false;
      }
    });
  }

  toggleDetalhes(registro: RegistroAuditoria): void {
    this.registroExpandidoId = this.registroExpandidoId === registro.id ? null : registro.id;
  }

  classeAcao(acao: string): string {
    switch (acao) {
      case 'CRIACAO': return 'bg-success';
      case 'ATUALIZACAO': return 'bg-warning text-dark';
      case 'EXCLUSAO': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }

  private parseJson(valor: string | null): Record<string, any> | null {
    if (!valor) return null;
    try {
      return JSON.parse(valor);
    } catch {
      return null;
    }
  }

  // Monta o diff entre antes/depois para exibicao. Em CRIACAO so ha "depois",
  // em EXCLUSAO so ha "antes", em ATUALIZACAO mostra so os campos que mudaram.
  camposAlterados(registro: RegistroAuditoria): CampoAlterado[] {
    const antes = this.parseJson(registro.dadosAntes);
    const depois = this.parseJson(registro.dadosDepois);

    if (!antes && depois) {
      return Object.keys(depois).map(campo => ({ campo, de: null, para: depois[campo] }));
    }

    if (antes && !depois) {
      return Object.keys(antes).map(campo => ({ campo, de: antes[campo], para: null }));
    }

    if (antes && depois) {
      const campos = new Set([...Object.keys(antes), ...Object.keys(depois)]);
      const alterados: CampoAlterado[] = [];
      campos.forEach(campo => {
        if (JSON.stringify(antes[campo]) !== JSON.stringify(depois[campo])) {
          alterados.push({ campo, de: antes[campo], para: depois[campo] });
        }
      });
      return alterados;
    }

    return [];
  }
}