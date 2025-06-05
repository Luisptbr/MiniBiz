import { AuthService } from "./auth.service"
import type { Product } from "@/models/product.model"
import type { ApiResponse } from "@/src/types"
import { Page } from "./client.service"

export class ProductService {
  private static readonly API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1"

  static async getProducts(page: number = 0, size: number = 10): Promise<ApiResponse<Page<Product> | Product[]>> {
    try {
      const response = await fetch(`${this.API_URL}/products?page=${page}&size=${size}`, {
        headers: {
          ...AuthService.getAuthHeaders(),
          'Accept': 'application/json'
        },
      })

      const data = await response.json()

      if (response.ok) {
        // Spring Boot returns paginated responses with 'content' property
        if (data && 'content' in data) {
          return { 
            success: true, 
            data: data as Page<Product> 
          }
        }
        // Handle non-paginated responses
        const products = Array.isArray(data) ? data : (data.content || [])
        return { success: true, data: products }
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
        // Spring Boot returns the created entity directly
        return { success: true, data: data }
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
        headers: {
          ...AuthService.getAuthHeaders(),
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(productData),
      })

      const data = await response.json()

      if (response.ok) {
        // Spring Boot returns the updated entity directly
        return { success: true, data: data }
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
        headers: {
          ...AuthService.getAuthHeaders(),
          'Accept': 'application/json'
        },
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
