import { AuthService } from "./auth.service"
import type { Product } from "@/models/product.model"

interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
}

export class ProductService {
  private static readonly API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api"

  static async getProducts(): Promise<ApiResponse<Product[]>> {
    try {
      const response = await fetch(`${this.API_URL}/products`, {
        headers: AuthService.getAuthHeaders(),
      })

      const data = await response.json()

      if (response.ok) {
        return { success: true, data: data.products || [] }
      }

      return { success: false, message: data.message || "Failed to fetch products" }
    } catch (error) {
      return { success: false, message: "Network error occurred" }
    }
  }

  static async createProduct(
    productData: Omit<Product, "id" | "createdAt" | "updatedAt">,
  ): Promise<ApiResponse<Product>> {
    try {
      const response = await fetch(`${this.API_URL}/products`, {
        method: "POST",
        headers: AuthService.getAuthHeaders(),
        body: JSON.stringify(productData),
      })

      const data = await response.json()

      if (response.ok) {
        return { success: true, data: data.product }
      }

      return { success: false, message: data.message || "Failed to create product" }
    } catch (error) {
      return { success: false, message: "Network error occurred" }
    }
  }

  static async updateProduct(id: string, productData: Partial<Product>): Promise<ApiResponse<Product>> {
    try {
      const response = await fetch(`${this.API_URL}/products/${id}`, {
        method: "PUT",
        headers: AuthService.getAuthHeaders(),
        body: JSON.stringify(productData),
      })

      const data = await response.json()

      if (response.ok) {
        return { success: true, data: data.product }
      }

      return { success: false, message: data.message || "Failed to update product" }
    } catch (error) {
      return { success: false, message: "Network error occurred" }
    }
  }

  static async deleteProduct(id: string): Promise<ApiResponse<void>> {
    try {
      const response = await fetch(`${this.API_URL}/products/${id}`, {
        method: "DELETE",
        headers: AuthService.getAuthHeaders(),
      })

      if (response.ok) {
        return { success: true }
      }

      const data = await response.json()
      return { success: false, message: data.message || "Failed to delete product" }
    } catch (error) {
      return { success: false, message: "Network error occurred" }
    }
  }
}
