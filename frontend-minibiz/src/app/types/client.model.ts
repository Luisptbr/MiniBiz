export interface Client {
  id?: number;
  nome: string;
  email: string;
  telefone: string;
  endereco: string;
}

export interface ClientPage {
  content: Client[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

