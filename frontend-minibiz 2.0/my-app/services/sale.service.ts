import { AuthService } from "./auth.service"
import type { Sale, SaleItem } from "@/models/sale.model"

interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
}

interface CreateSaleData {
  clientId: string
  status: "pending" | "completed" | "cancelled"
  items: SaleItem[]
}

export class SaleService {
  private static readonly API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api"

  static async getSales(): Promise<ApiResponse<Sale[]>> {
    try {
      const response = await fetch(`${this.API_URL}/sales`, {
        headers: AuthService.getAuthHeaders(),
      })

      const data = await response.json()

      if (response.ok) {
        return { success: true, data: data.sales || [] }
      }

      return { success: false, message: data.message || "Failed to fetch sales" }
    } catch (error) {
      return { success: false, message: "Network error occurred" }
    }
  }

  static async createSale(saleData: CreateSaleData): Promise<ApiResponse<Sale>> {
    try {
      const response = await fetch(`${this.API_URL}/sales`, {
        method: "POST",
        headers: AuthService.getAuthHeaders(),
        body: JSON.stringify(saleData),
      })

      const data = await response.json()

      if (response.ok) {
        return { success: true, data: data.sale }
      }

      return { success: false, message: data.message || "Failed to create sale" }
    } catch (error) {
      return { success: false, message: "Network error occurred" }
    }
  }

  static async updateSale(id: string, saleData: Partial<CreateSaleData>): Promise<ApiResponse<Sale>> {
    try {
      const response = await fetch(`${this.API_URL}/sales/${id}`, {
        method: "PUT",
        headers: AuthService.getAuthHeaders(),
        body: JSON.stringify(saleData),
      })

      const data = await response.json()

      if (response.ok) {
        return { success: true, data: data.sale }
      }

      return { success: false, message: data.message || "Failed to update sale" }
    } catch (error) {
      return { success: false, message: "Network error occurred" }
    }
  }

  static async deleteSale(id: string): Promise<ApiResponse<void>> {
    try {
      const response = await fetch(`${this.API_URL}/sales/${id}`, {
        method: "DELETE",
        headers: AuthService.getAuthHeaders(),
      })

      if (response.ok) {
        return { success: true }
      }

      const data = await response.json()
      return { success: false, message: data.message || "Failed to delete sale" }
    } catch (error) {
      return { success: false, message: "Network error occurred" }
    }
  }
}
