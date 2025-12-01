// vendas.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VendaService, VendaDTO, CompradorDTO } from '../../services/vendas.service';
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
  // Formulário
  compradorCpf: string = '';
  usuarioResponsavelId: number | null = null;
  produtoId: number | null = null;
  quantidade: number = 0;
  precoUnitario: number = 0;

  // Dados
  usuarios: Usuario[] = [];
  produtos: Produto[] = [];
  compradores: any[] = [];

  // Pagamento
  paymentMethod: 'DINHEIRO' | 'PIX' | 'CARTAO_CREDITO' | 'CARTAO_DEBITO' = 'DINHEIRO';
  amountPaid: number = 0;

  // Comprador
  mostrarFormComprador: boolean = false;
  novoComprador: CompradorDTO = {
    nome: '',
    cpf: '',
    email: ''
  };

  // Carrinho
  itensVenda: { produtoId: number, quantidade: number, precoVendido?: number }[] = [];
  compradorSelecionadoId: number | null = null;

  constructor(private vendaService: VendaService) {}

  ngOnInit(): void {
    this.carregarDadosIniciais();
  }

  private carregarDadosIniciais(): void {
    this.carregarUsuarios();
    this.carregarProdutos();
    this.carregarCompradores();
  }

  carregarUsuarios(): void {
    this.vendaService.listarUsuarios().subscribe({
      next: (data) => this.usuarios = data,
      error: (err) => console.error('Erro ao carregar usuários', err)
    });
  }

  carregarProdutos(): void {
    this.vendaService.listarProdutos().subscribe({
      next: (data) => {
        this.produtos = data;
        console.log('Produtos carregados:', this.produtos);
      },
      error: (err) => console.error('Erro ao carregar produtos', err)
    });
  }

  carregarCompradores(): void {
    this.vendaService.listarCompradores().subscribe({
      next: (data) => {
        this.compradores = data;
        console.log('Compradores carregados:', this.compradores);
      },
      error: (err) => console.error('Erro ao carregar compradores', err)
    });
  }

  // UI Helpers
  onProdutoChange(): void {
    if (this.produtoId) {
      const produto = this.produtos.find(p => p.id === this.produtoId);
      this.precoUnitario = produto?.preco || 0;
    }
  }

  getProdutosAtivos(): Produto[] {
    return this.produtos.filter(p => p.ativo !== false);
  }

  getProdutoNome(id: number | null): string {
    return id ? this.produtos.find(p => p.id === id)?.nome || '' : '';
  }

  getProdutoPreco(id: number | null): number {
    return id ? this.produtos.find(p => p.id === id)?.preco || 0 : 0;
  }

  get subtotal(): number {
    return this.quantidade * this.precoUnitario;
  }

  get totalAtual(): number {
    return this.itensVenda.reduce((acc, item) => {
      const preco = item.precoVendido || this.getProdutoPreco(item.produtoId);
      return acc + (preco * item.quantidade);
    }, 0);
  }

  get troco(): number {
    const diff = this.amountPaid - this.totalAtual;
    return diff > 0 ? diff : 0;
  }

  // Carrinho
  adicionarItem(): void {
    if (!this.validarItemParaAdicao()) return;

    const produtoIdNum = Number(this.produtoId);
    const produto = this.produtos.find(p => p.id === produtoIdNum)!;
    const itemExistente = this.itensVenda.find(i => i.produtoId === produtoIdNum);

    if (itemExistente) {
      itemExistente.quantidade += this.quantidade;
      if (itemExistente.precoVendido === undefined) {
        itemExistente.precoVendido = produto.preco || 0;
      }
    } else {
      this.itensVenda.push({
        produtoId: produtoIdNum,
        quantidade: this.quantidade,
        precoVendido: produto.preco || 0
      });
    }

    this.limparCamposItem();
  }

  private validarItemParaAdicao(): boolean {
    if (!this.produtoId) {
      alert('Selecione um produto!');
      return false;
    }

    if (!this.quantidade || this.quantidade <= 0) {
      alert('Informe uma quantidade válida (> 0).');
      return false;
    }

    const produtoIdNum = Number(this.produtoId);
    const produto = this.produtos.find(p => p.id === produtoIdNum);

    if (!produto) {
      alert('Produto não encontrado.');
      return false;
    }

    if (produto.ativo === false) {
      alert('Este produto está inativo e não pode ser vendido.');
      return false;
    }

    const estoqueDisponivel = this.getEstoqueProduto(produto);
    if (estoqueDisponivel <= 0) {
      alert(`O produto "${produto.nome}" está com estoque zerado.`);
      return false;
    }

    const itemExistente = this.itensVenda.find(i => i.produtoId === produtoIdNum);
    const qtdNoCarrinho = itemExistente ? itemExistente.quantidade : 0;
    const qtdPretendida = qtdNoCarrinho + this.quantidade;

    if (this.quantidade > estoqueDisponivel) {
      alert(`Quantidade solicitada (${this.quantidade}) excede o estoque disponível (${estoqueDisponivel}).`);
      return false;
    }

    if (qtdPretendida > estoqueDisponivel) {
      alert(`Você já tem ${qtdNoCarrinho} deste produto no carrinho. Somando a quantidade atual ultrapassa o estoque (${estoqueDisponivel}).`);
      return false;
    }

    return true;
  }

  private limparCamposItem(): void {
    this.produtoId = null;
    this.quantidade = 0;
    this.precoUnitario = 0;
  }

  removerItem(index: number): void {
    this.itensVenda.splice(index, 1);
  }

  editarPrecoItem(index: number, novoPreco: number): void {
    if (novoPreco > 0) {
      this.itensVenda[index].precoVendido = novoPreco;
    } else {
      alert('O preço deve ser maior que zero.');
    }
  }

  // Comprador
  onCpfChange(): void {
    if (this.compradorCpf) {
      const comprador = this.compradores.find(c => c.cpf === this.compradorCpf);
      this.compradorSelecionadoId = comprador ? comprador.id : null;
    } else {
      this.compradorSelecionadoId = null;
    }
  }

  criarComprador(): void {
    if (!this.validarComprador()) return;

    this.vendaService.criarComprador(this.novoComprador).subscribe({
      next: (data: any) => {
        alert('Comprador criado com sucesso!');
        this.compradorCpf = this.novoComprador.cpf;
        this.onCpfChange();
        this.resetarFormComprador();
        this.carregarCompradores();
      },
      error: (err) => {
        console.error('Erro ao criar comprador', err);
        alert(`Erro ao criar comprador! ${err.error?.message || ''}`);
      }
    });
  }

  private validarComprador(): boolean {
    if (!this.novoComprador.nome || !this.novoComprador.cpf || !this.novoComprador.email) {
      alert('Preencha todos os campos do comprador!');
      return false;
    }

    const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$|^\d{11}$/;
    if (!cpfRegex.test(this.novoComprador.cpf)) {
      alert('CPF inválido. Use o formato 000.000.000-00 ou 00000000000.');
      return false;
    }

    const jaExiste = this.compradores.some(c => c.cpf === this.novoComprador.cpf);
    if (jaExiste) {
      alert('Já existe um comprador cadastrado com esse CPF. Selecione na lista!');
      this.mostrarFormComprador = false;
      return false;
    }

    return true;
  }

  private resetarFormComprador(): void {
    this.novoComprador = { nome: '', cpf: '', email: '' };
    this.mostrarFormComprador = false;
  }

  // Venda
  salvarVenda(): void {
    if (!this.validarVenda()) return;

    const vendaDTO: VendaDTO = this.criarVendaDTO();

    console.log('Enviando vendaDTO:', JSON.stringify(vendaDTO, null, 2));

    this.vendaService.salvarVenda(vendaDTO, this.usuarioResponsavelId!).subscribe({
      next: (response: any) => {
        alert('Venda salva com sucesso!');
        console.log('Venda salva:', response);
        this.limparFormulario();
      },
      error: (err) => this.tratarErroVenda(err)
    });
  }

  private validarVenda(): boolean {
    if (!this.usuarioResponsavelId) {
      alert('Selecione um usuário responsável!');
      return false;
    }

    if (!this.itensVenda.length) {
      alert('Adicione ao menos um item à venda!');
      return false;
    }

    if (this.paymentMethod === 'DINHEIRO') {
      if (!this.amountPaid || this.amountPaid <= 0) {
        alert('Informe o valor pago em dinheiro.');
        return false;
      }
      if (this.amountPaid < this.totalAtual) {
        alert(`Valor pago (R$ ${this.amountPaid.toFixed(2)}) é insuficiente para o total (R$ ${this.totalAtual.toFixed(2)}).`);
        return false;
      }
    }

    if (this.compradorCpf && !this.compradorSelecionadoId) {
      alert('CPF do comprador não encontrado. Verifique ou cadastre um novo comprador.');
      return false;
    }

    return true;
  }

  private criarVendaDTO(): VendaDTO {
    return {
      compradorId: this.compradorSelecionadoId,
      metodoPagamento: this.paymentMethod,
      valorPago: this.paymentMethod === 'DINHEIRO' ? this.amountPaid : this.totalAtual,
      itens: this.itensVenda.map(item => ({
        produtoId: item.produtoId,
        quantidadeVendida: item.quantidade,
        precoVendido: item.precoVendido || null
      }))
    };
  }

  private tratarErroVenda(err: any): void {
    console.error('Erro ao salvar venda:', err);
    
    let mensagemErro = 'Erro ao salvar venda!';
    if (err.error?.message) {
      mensagemErro += `\n${err.error.message}`;
    }
    
    alert(mensagemErro);
  }

  limparFormulario(): void {
    this.itensVenda = [];
    this.amountPaid = 0;
    this.compradorCpf = '';
    this.compradorSelecionadoId = null;
    this.usuarioResponsavelId = null;
    this.produtoId = null;
    this.quantidade = 0;
    this.precoUnitario = 0;
    this.paymentMethod = 'DINHEIRO';
    this.mostrarFormComprador = false;
    this.novoComprador = { nome: '', cpf: '', email: '' };
  }

  // Utilitários
  private getEstoqueProduto(produto: Produto): number {
    const v = produto.estoque ?? produto.quantidade ?? 0;
    const num = Number(v);
    return Number.isNaN(num) ? 0 : Math.floor(num);
  }

  getEstoqueDisponivel(): number {
    if (!this.produtoId) return 0;
    const produto = this.produtos.find(p => p.id === this.produtoId);
    return produto ? this.getEstoqueProduto(produto) : 0;
  }

  getEstoqueProdutoSelecionado(): number {
    return this.getEstoqueDisponivel();
  }
}