export interface Usuario {
  id: number;
  nome: string;
  cpf: string;
  idade: number;
  login: string;
  cargo: string; // vem como texto por ser Enum
}
