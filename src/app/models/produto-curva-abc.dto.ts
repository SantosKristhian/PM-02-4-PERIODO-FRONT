export interface ProdutoCurvaABCDTO {
  id: number;
  nome: string;
  valorTotalVendido: number;
  percentualFaturamento: number;
  percentualAcumulado: number;
  classificacao: 'A' | 'B' | 'C' | string;
}
