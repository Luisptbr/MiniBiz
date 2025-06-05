import { AuthService } from "./auth.service"
import type { Sale, SaleItem } from "@/models/sale.model"
import type { Client } from "@/models/client.model"
import type { Product } from "@/models/product.model"
import type { ApiResponse } from "@/src/types"
import { Page } from "./client.service"

interface CreateSaleData {
  clientId: string
  status: "pending" | "completed" | "cancelled"
  items: SaleItem[]
}

export class SaleService {
  private static readonly API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1"

  static async getSales(page: number = 0, size: number = 10): Promise<ApiResponse<Page<Sale> | Sale[]>> {
    try {
      const response = await fetch(`${this.API_URL}/sales?page=${page}&size=${size}`, {
        headers: {
          ...AuthService.getAuthHeaders(),
          'Accept': 'application/json'
        },
      })

      const data = await response.json()

      if (response.ok) {
        // Spring Boot returns paginated responses with 'content' property
        if (data && 'content' in data) {
          // Process sales data to ensure client and items are properly structured
          const processedData = {
            ...data,
            content: data.content.map((sale: any) => this.processSaleData(sale))
          };
          return { 
            success: true, 
            data: processedData as Page<Sale> 
          }
        }
        // Handle non-paginated responses
        const sales = Array.isArray(data) 
          ? data.map((sale: any) => this.processSaleData(sale)) 
          : (data.content || []).map((sale: any) => this.processSaleData(sale));
        return { success: true, data: sales }
      }
      return { success: false, message: data.message || "Failed to fetch sales" }
    } catch (error) {
      return { success: false, message: "Network error occurred" }
    }
  }

  /**
   * Process sale data to ensure proper structure for client and items
   */
  private static processSaleData(sale: any): Sale {
    return {
      ...sale,
      // Ensure client is properly structured
      client: sale.client || { id: sale.clientId, name: 'Unknown Client' },
      // Ensure items are properly structured
      items: Array.isArray(sale.items) ? sale.items.map((item: any) => ({
        ...item,
        // Ensure product is properly structured within each item
        product: item.product || { id: item.productId, name: 'Unknown Product' }
      })) : []
    };
  }

  static async createSale(saleData: {
    clientId: string | number;
    status: string;
    items: Array<{
      productId: string | number;
      quantity: number;
      price?: number;
      discount?: number;
    }>;
    discount?: number;
    tax?: number;
    shipping?: number;
    note?: string;
    paymentMethod?: string;
  }): Promise<ApiResponse<Sale>> {
    try {
      const response = await fetch(`${this.API_URL}/sales`, {
        method: "POST",
        headers: {
          ...AuthService.getAuthHeaders(),
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(saleData),
      })

      const data = await response.json()

      if (response.ok) {
        // Process the sale data to ensure proper structure
        const processedSale = this.processSaleData(data);
        return { success: true, data: processedSale }
      }

      return { success: false, message: data.message || "Failed to create sale" }
    } catch (error) {
      return { success: false, message: "Network error occurred" }
    }
  }

  static async updateSale(id: string, saleData: {
    clientId?: string | number;
    status?: string;
    items?: Array<{
      productId: string | number;
      quantity: number;
      price?: number;
      discount?: number;
    }>;
    discount?: number;
    tax?: number;
    shipping?: number;
    note?: string;
    paymentMethod?: string;
  }): Promise<ApiResponse<Sale>> {
    try {
      const response = await fetch(`${this.API_URL}/sales/${id}`, {
        method: "PUT",
        headers: {
          ...AuthService.getAuthHeaders(),
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(saleData),
      })

      const data = await response.json()

      if (response.ok) {
        // Process the sale data to ensure proper structure
        const processedSale = this.processSaleData(data);
        return { success: true, data: processedSale }
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
        headers: {
          ...AuthService.getAuthHeaders(),
          'Accept': 'application/json'
        },
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

/**
 * Helper method to calculate sale total
 */
export function calculateSaleTotal(items: SaleItem[], discount: number = 0, tax: number = 0, shipping: number = 0): number {
  // Calculate subtotal from items
  const subtotal = items.reduce((total, item) => {
    const itemPrice = item.price || 0;
    const itemQuantity = item.quantity || 0;
    const itemDiscount = item.discount || 0;
    return total + (itemPrice * itemQuantity * (1 - itemDiscount / 100));
  }, 0);
  
  // Apply overall discount
  const afterDiscount = subtotal * (1 - discount / 100);
  
  // Apply tax
  const afterTax = afterDiscount * (1 + tax / 100);
  
  // Add shipping
  return afterTax + shipping;
}
