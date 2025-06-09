import { AuthService } from "./auth.service"
import type { Product } from "@/models/product.model"

interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
}

// Backend data structure
interface BackendProduct {
  id: number
  nome: string
  descricao: string
  preco: number
  quantidadeEmEstoque: number
  codigoProduto: string
  dataCriacao: string
  dataAtualizacao: string
  categoria: string
}

export class ProductService {
  private static readonly API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api"
  private static readonly PRODUCT_ENDPOINT = `${ProductService.API_URL}/products`

  private static getHeaders() {
    return {
      ...AuthService.getAuthHeaders(),
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  }

  private static mapProductData(product: BackendProduct): Product {
    return {
      id: product.id.toString(),
      nome: product.nome,
      descricao: product.descricao,
      preco: product.preco,
      quantidadeEmEstoque: product.quantidadeEmEstoque,
      codigoProduto: product.codigoProduto,
      dataCriacao: product.dataCriacao,
      dataAtualizacao: product.dataAtualizacao,
      categoria: product.categoria
    }
  }

  static async getProducts(): Promise<ApiResponse<Product[]>> {
    try {
      const response = await fetch(this.PRODUCT_ENDPOINT, {
        method: "GET",
        headers: this.getHeaders(),
        credentials: 'omit'
      });

      if (!response.ok) {
        const errorData = await response.json();
        return { success: false, message: errorData.message || "Failed to fetch products" };
      }

      const data = await response.json();
      
      // Handle paginated response
      if (data.content && Array.isArray(data.content)) {
        const products = data.content.map(this.mapProductData);
        return { success: true, data: products };
      }

      return { success: false, message: "Unexpected response format" };
    } catch (error) {
      console.error('ProductService: Network error:', error);
      return { success: false, message: "Network error occurred" };
    }
  }

  static async createProduct(productData: Omit<Product, "id" | "dataCriacao" | "dataAtualizacao">): Promise<ApiResponse<Product>> {
    try {
      const response = await fetch(this.PRODUCT_ENDPOINT, {
        method: "POST",
        headers: this.getHeaders(),
        credentials: 'omit',
        body: JSON.stringify(productData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        return { success: false, message: errorData.message || "Failed to create product" };
      }

      const data = await response.json();
      return { success: true, data: this.mapProductData(data) };
    } catch (error) {
      console.error('ProductService: Create error:', error);
      return { success: false, message: "Network error occurred" };
    }
  }

  static async updateProduct(id: string, productData: Partial<Product>): Promise<ApiResponse<Product>> {
    try {
      const numericId = parseInt(id, 10);
      if (isNaN(numericId)) {
        return { success: false, message: "Invalid product ID" };
      }

      const response = await fetch(`${this.PRODUCT_ENDPOINT}/${numericId}`, {
        method: "PUT",
        headers: this.getHeaders(),
        credentials: 'omit',
        body: JSON.stringify(productData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        return { success: false, message: errorData.message || "Failed to update product" };
      }

      const data = await response.json();
      return { success: true, data: this.mapProductData(data) };
    } catch (error) {
      console.error('ProductService: Update error:', error);
      return { success: false, message: "Network error occurred" };
    }
  }

  static async deleteProduct(id: string): Promise<ApiResponse<void>> {
    try {
      const numericId = parseInt(id, 10);
      if (isNaN(numericId)) {
        return { success: false, message: "Invalid product ID" };
      }

      const response = await fetch(`${this.PRODUCT_ENDPOINT}/${numericId}`, {
        method: "DELETE",
        headers: this.getHeaders(),
        credentials: 'omit'
      });

      if (response.ok) {
        return { success: true };
      }

      const errorData = await response.json();
      return { success: false, message: errorData.message || "Failed to delete product" };
    } catch (error) {
      console.error('ProductService: Delete error:', error);
      return { success: false, message: "Network error occurred" };
    }
  }
}
