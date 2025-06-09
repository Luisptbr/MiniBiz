import { StatusVenda } from "./status-venda.enum"

export interface ItemVenda {
  productId: number
  quantidade: number
  nome?: string
  preco?: number
}

export interface VendaRequest {
  clientId: number
  produtosDTO: ItemVenda[]
}

export interface VendaResponse {
  id: string
  clientId: number
  products: Array<{
    id: number
    nome: string
    preco: number
    quantidade: number
  }>
  valorTotal: number
  vendaDate: string
  status: StatusVenda
}

