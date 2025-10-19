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
  
  // Validações iniciais
  if (this.produtoId === null || this.produtoId === undefined) {
    alert('Selecione um produto!');
    return;
  }
  if (!this.quantidade || this.quantidade <= 0) {
    alert('Informe uma quantidade válida (> 0).');
    return;
  }

  // Normaliza o id do produto para number (evita comparar string com number)
  const produtoIdNum = Number(this.produtoId);
  if (Number.isNaN(produtoIdNum)) {
    console.error('produtoId não é numérico:', this.produtoId);
    alert('ID do produto inválido.');
    return;
  }

  const produto = this.produtos.find(p => Number(p.id) === produtoIdNum);
  if (!produto) {
    alert('Produto não encontrado.');
    return;
  }

  // Verificação de ativo (considera undefined como ativo)
  if (produto.ativo === false) {
    alert('Este produto está inativo e não pode ser vendido.');
    return;
  }

  // Coerce o estoque para number de forma segura
  const estoqueDisponivel = (() => {
    const v = produto.estoque ?? produto.quantidade ?? 0; // tenta estoque, senão quantidade
    const num = Number(v);
    return Number.isNaN(num) ? 0 : Math.floor(num); // usa inteiro e evita NaN
  })();

  console.log('Estoque disponível (coercionado):', estoqueDisponivel);

  if (estoqueDisponivel <= 0) {
    alert(`O produto "${produto.nome}" está com estoque zerado e não pode ser adicionadsso.`);
    return;
  }

  // Quantidade já no carrinho para esse produto
  const itemExistente = this.itensVenda.find(i => Number(i.produtoId) === produtoIdNum);
  const qtdNoCarrinho = itemExistente ? Number(itemExistente.quantidade) : 0;
  const qtdPretendida = qtdNoCarrinho + Number(this.quantidade);

  // Validações contra estoque
  if (Number(this.quantidade) > estoqueDisponivel) {
    alert(`Quantidade solicitada (${this.quantidade}) excede o estoque disponível (${estoqueDisponivel}).`);
    return;
  }
  if (qtdPretendida > estoqueDisponivel) {
    alert(`Você já tem ${qtdNoCarrinho} deste produto no carrinho. Somando a quantidade atual (${this.quantidade}) ultrapassa o estoque (${estoqueDisponivel}).`);
    return;
  }

  // Atualiza carrinho (merge se já existe)
  if (itemExistente) {
    itemExistente.quantidade = qtdPretendida;
  } else {
    this.itensVenda.push({ produtoId: produtoIdNum, quantidade: Number(this.quantidade) });
  }

  // Opcional: diminuir o estoque localmente para feedback imediato (não substitui validação no backend)
  produto.estoque = estoqueDisponivel - (itemExistente ? (qtdPretendida - qtdNoCarrinho) : Number(this.quantidade));

  // Limpa campos
  this.produtoId = null;
  this.quantidade = 0;
  this.precoUnitario = 0;

  console.log('Item adicionado com sucesso. Itens agora:', this.itensVenda);
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