export interface Produto {
  id?: number;  // ⬅️ Torna opcional com "?"
  nome: string;
  quantidade: number | undefined;
  preco: number | undefined;
  ativo?: boolean;
  estoque?: number;
  dataUltimaAlteracao?: string;
  
  categoria: {
    id: number;
    nome: string;
  };
  
  usuarioUltimaAlteracao?: {
    id: number;
    nome: string;
    username: string;
  };
}