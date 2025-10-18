export interface Produto {
  categoria: any;
  estoque: any;
  id: number;
  nome: string;
  preco: number | undefined;
  quantidade: number | undefined;
  ativo?: boolean;
}
