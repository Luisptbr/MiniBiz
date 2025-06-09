import { AuthService } from "./auth.service"
import { VendaRequest, VendaResponse } from "@/models/venda.model"

interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
}

export class VendaService {
  private static readonly API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api"
  private static readonly VENDA_ENDPOINT = `${VendaService.API_URL}/vendas`

  private static getHeaders() {
    return {
      ...AuthService.getAuthHeaders(),
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  }

  static async getVendas(): Promise<ApiResponse<VendaResponse[]>> {
    try {
      const response = await fetch(this.VENDA_ENDPOINT, {
        method: "GET",
        headers: this.getHeaders(),
        credentials: 'omit'
      });

      if (!response.ok) {
        const errorData = await response.json();
        return { success: false, message: errorData.message || "Failed to fetch sales" };
      }

      const data = await response.json();
      
      // Handle paginated response
      if (data.content && Array.isArray(data.content)) {
        const vendas = data.content.map((venda: any) => ({
          id: venda.id.toString(),
          clientId: venda.clientId,
          products: venda.products,
          valorTotal: venda.valorTotal,
          vendaDate: venda.vendaDate,
          status: venda.status
        }));
        return { success: true, data: vendas };
      }

      return { success: false, message: "Unexpected response format" };
    } catch (error) {
      console.error('VendaService: Network error:', error);
      return { success: false, message: "Network error occurred" };
    }
  }

  static async createVenda(vendaData: VendaRequest): Promise<ApiResponse<VendaResponse>> {
    try {
      const response = await fetch(this.VENDA_ENDPOINT, {
        method: "POST",
        headers: this.getHeaders(),
        credentials: 'omit',
        body: JSON.stringify(vendaData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        return { success: false, message: errorData.message || "Failed to create sale" };
      }

      const data = await response.json();
      return { success: true, data: data };
    } catch (error) {
      console.error('VendaService: Create error:', error);
      return { success: false, message: "Network error occurred" };
    }
  }

  static async cancelarVenda(id: string): Promise<ApiResponse<VendaResponse>> {
    try {
      const response = await fetch(`${this.VENDA_ENDPOINT}/cancelar/${id}`, {
        method: "PUT",
        headers: this.getHeaders(),
        credentials: 'omit'
      });

      if (!response.ok) {
        const errorData = await response.json();
        return { success: false, message: errorData.message || "Failed to cancel sale" };
      }

      const data = await response.json();
      return { success: true, data: data };
    } catch (error) {
      console.error('VendaService: Cancel error:', error);
      return { success: false, message: "Network error occurred" };
    }
  }
}

