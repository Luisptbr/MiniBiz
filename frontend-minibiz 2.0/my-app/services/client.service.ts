import { AuthService } from "./auth.service"
import type { Client } from "@/models/client.model"
import type { ApiResponse } from "@/src/types"

// Define the Page interface for paginated responses from Spring Boot backend
export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export class ClientService {
  private static readonly API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1"

  static async getClients(page: number = 0, size: number = 10): Promise<ApiResponse<Page<Client> | Client[]>> {
    try {
      const response = await fetch(`${this.API_URL}/clients?page=${page}&size=${size}`, {
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
            data: data as Page<Client> 
          }
        }
        // Handle non-paginated responses
        const clients = Array.isArray(data) ? data : (data.content || [])
        return { success: true, data: clients }
      }

      return { success: false, message: data.message || "Failed to fetch clients" }
    } catch (error) {
      return { success: false, message: "Network error occurred" }
    }
  }

  static async createClient(clientData: Omit<Client, "id" | "createdAt" | "updatedAt">): Promise<ApiResponse<Client>> {
    try {
      const response = await fetch(`${this.API_URL}/clients`, {
        method: "POST",
        headers: {
          ...AuthService.getAuthHeaders(),
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(clientData),
      })

      const data = await response.json()

      if (response.ok) {
        // Spring Boot returns the created entity directly
        return { success: true, data: data }
      }

      return { success: false, message: data.message || "Failed to create client" }
    } catch (error) {
      return { success: false, message: "Network error occurred" }
    }
  }

  static async updateClient(id: string, clientData: Partial<Client>): Promise<ApiResponse<Client>> {
    try {
      const response = await fetch(`${this.API_URL}/clients/${id}`, {
        method: "PUT",
        headers: {
          ...AuthService.getAuthHeaders(),
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(clientData),
      })

      const data = await response.json()

      if (response.ok) {
        // Spring Boot returns the updated entity directly
        return { success: true, data: data }
      }

      return { success: false, message: data.message || "Failed to update client" }
    } catch (error) {
      return { success: false, message: "Network error occurred" }
    }
  }

  static async deleteClient(id: string): Promise<ApiResponse<void>> {
    try {
      const response = await fetch(`${this.API_URL}/clients/${id}`, {
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
      return { success: false, message: data.message || "Failed to delete client" }
    } catch (error) {
      return { success: false, message: "Network error occurred" }
    }
  }
}
