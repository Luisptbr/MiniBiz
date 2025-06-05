import type { Client } from "./client.model"
import type { Product } from "./product.model"

export interface SaleItem {
  id: string
  productId: string
  product: Product
  quantity: number
  price: number
}

export interface Sale {
  id: string
  client: Client
  items: SaleItem[]
  total: number
  status: "pending" | "completed" | "cancelled"
  createdAt: string
  updatedAt: string
}
