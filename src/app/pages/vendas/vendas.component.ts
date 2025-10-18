import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

import { Produto } from '../../models/produto';
import { Usuario } from '../../models/usuario';

@Component({
  selector: 'app-vendas',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './vendas.component.html',
  styleUrls: ['./vendas.component.scss']
})
export class VendasComponent implements OnInit {
  compradorCpf: string = '';
  compradorEmail: string = '';
  usuarioResponsavelId: number | null = null;
  produtoId: number | null = null;
  quantidade: number = 0;

  usuarios: Usuario[] = [];
  produtos: Produto[] = [];

  compradores: any[] = [];

  precoUnitario: number = 0;
total: any;

  // Pagamento
  paymentMethod: 'DINHEIRO' | 'PIX' | 'CARTAO_CREDITO' | 'CARTAO_DEBITO' = 'DINHEIRO';
  amountPaid: number = 0; // valor pago pelo cliente

  mostrarFormComprador: boolean = false;
  novoComprador = {
    nome: '',
    cpf: '',
    email: ''
  };

    itensVenda: { produtoId: number | null, quantidade: number }[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<Usuario[]>('http://localhost:8080/api/emanager/user/findAll').subscribe({
      next: (data) => this.usuarios = data,
      error: (err) => console.error('Erro ao carregar usuários', err)
    });

    this.http.get<Produto[]>('http://localhost:8080/api/emanager/produto/findAll').subscribe({
      next: (data) => this.produtos = data,
      error: (err) => console.error('Erro ao carregar produtos', err)
    });

      this.http.get<any[]>('http://localhost:8080/api/emanager/comprador/findAll').subscribe({
        next: (data) => this.compradores = data,
        error: (err) => console.error('Erro ao carregar compradores', err)
      });
  }

  onProdutoChange() {
    const produtoSelecionado = this.produtos.find(p => p.id === this.produtoId);
    this.precoUnitario = produtoSelecionado?.preco ?? 0;
  }

  // Retorna apenas produtos ativos (não inativos)
  getProdutosAtivos(): Produto[] {
    return this.produtos.filter(p => p.ativo !== false);
  }

    adicionarItem() {
      if (!this.produtoId || this.quantidade <= 0) {
        alert('Selecione um produto e quantidade válida!');
        return;
      }
      const produto = this.produtos.find(p => p.id === this.produtoId);
      if (!produto) {
        alert('Produto não encontrado.');
        return;
      }
      if (produto.ativo === false) {
        alert('Este produto está inativo e não pode ser vendido.');
        return;
      }
      this.itensVenda.push({ produtoId: this.produtoId, quantidade: this.quantidade });
      this.produtoId = null;
      this.quantidade = 0;
      this.precoUnitario = 0;
    }

    removerItem(index: number) {
      this.itensVenda.splice(index, 1);
    }

    getProdutoNome(id: number | null): string {
      const produto = this.produtos.find(p => p.id === id);
      return produto ? produto.nome : '';
    }

    getProdutoPreco(id: number | null): number {
      const produto = this.produtos.find(p => p.id === id);
      return produto ? produto.preco ?? 0 : 0;
    }

  get subtotal(): number {
    return this.quantidade * this.precoUnitario;
  }

  // Calcula o total atual da venda (soma dos itens)
  get totalAtual(): number {
    return this.itensVenda.reduce((acc, item) => acc + (this.produtos.find(p => p.id === item.produtoId)?.preco ?? 0) * item.quantidade, 0);
  }

  // Troco (usar centavos para evitar floats)
  get troco(): number {
    const cents = (n: number) => Math.round((n || 0) * 100);
    const diff = cents(this.amountPaid) - cents(this.totalAtual);
    return diff > 0 ? diff / 100 : 0;
  }

  salvarVendas() {
      if (!this.usuarioResponsavelId || !this.itensVenda.length) {
        alert('Preencha todos os campos obrigatórios e adicione ao menos um item!');
        return;
      }

      const compradorSelecionado = this.compradores.find(c => c.cpf === this.compradorCpf);

      const valortotal = this.totalAtual;

      // Validação do pagamento em dinheiro
      if (this.paymentMethod === 'DINHEIRO') {
        if (!this.amountPaid || this.amountPaid <= 0) {
          alert('Informe o valor pago em dinheiro.');
          return;
        }
        if (this.amountPaid < valortotal) {
          alert('Valor pago é insuficiente para cobrir o total da venda.');
          return;
        }
      }

      const venda = {
        comprador: compradorSelecionado ? { id: compradorSelecionado.id } : null,
        usuario: { id: this.usuarioResponsavelId },
        itens: this.itensVenda.map(item => ({
          produto: { id: item.produtoId },
          quantidadeVendida: item.quantidade,
          precoVendido: this.produtos.find(p => p.id === item.produtoId)?.preco ?? 0
        })),
        valortotal: valortotal,
        metodoPagamento: this.paymentMethod,
        valorPago: this.paymentMethod === 'DINHEIRO' ? this.amountPaid : valortotal,
        ativo: true
      };

      this.http.post(
        `http://localhost:8080/api/emanager/venda/save/${this.usuarioResponsavelId}`,
      venda
    ).subscribe({
      next: () => alert('Venda salva com sucesso!'),
      error: (err) => {
        console.error('Erro ao salvar venda', err);
        alert('Erro ao salvar venda!');
      }
    });
      this.itensVenda = [];
    this.amountPaid = 0;
  }

    criarComprador() {
      if (!this.novoComprador.nome || !this.novoComprador.cpf || !this.novoComprador.email) {
        alert('Preencha todos os campos do comprador!');
        return;
      }
      const jaExiste = this.compradores.some(c => c.cpf === this.novoComprador.cpf);
      if (jaExiste) {
        alert('Já existe um comprador cadastrado com esse CPF. Selecione na lista!');
        this.mostrarFormComprador = false;
        return;
      }
      this.http.post('http://localhost:8080/api/emanager/comprador/save', this.novoComprador).subscribe({
        next: (data: any) => {
          alert('Comprador criado com sucesso!');
          this.compradorCpf = this.novoComprador.cpf;
          this.novoComprador = { nome: '', cpf: '', email: '' };
          this.mostrarFormComprador = false;
          // Atualiza lista de compradores
          this.http.get<any[]>('http://localhost:8080/api/emanager/comprador/findAll').subscribe({
            next: (data) => this.compradores = data
          });
        },
        error: (err) => {
          console.error('Erro ao criar comprador', err);
          alert('Erro ao criar comprador!');
        }
      });
    }
}