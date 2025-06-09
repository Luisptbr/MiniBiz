import { AuthService } from "./auth.service"
import type { Client } from "@/models/client.model"

interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
}

// Interface representing the client data structure from the backend
interface BackendClient {
  id: number
  nome: string
  endereco: string
  email: string
  telefone: string | null
}

// Backend pagination interface
interface PageResponse<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
  first: boolean
  last: boolean
  empty: boolean
}

export class ClientService {
  private static readonly API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api"
  private static readonly CLIENT_ENDPOINT = `${ClientService.API_URL}/clients`

  // Helper method to convert client data from backend to frontend model
  private static mapClientData(client: BackendClient | null | undefined, index?: number): Client {
    if (!client) {
      return {
        id: index !== undefined ? `temp-${index}` : 'temp-id',
        nome: '',
        email: '',
        telefone: '',
        endereco: ''
      };
    }
    
    return {
      id: client.id?.toString() || (index !== undefined ? `temp-${index}` : 'temp-id'),
      nome: client.nome || '',
      email: client.email || '',
      telefone: client.telefone || '',
      endereco: client.endereco || ''
    };
  }

  // Get common headers including authorization
  private static getHeaders() {
    return {
      ...AuthService.getAuthHeaders(),
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
  }

  static async getClients(): Promise<ApiResponse<Client[]>> {
    try {
      console.log('ClientService: Fetching clients from API...');
      const response = await fetch(`${this.CLIENT_ENDPOINT}`, {
        method: "GET",
        headers: this.getHeaders(),
        credentials: 'omit'
      });

      console.log('ClientService: Response status:', response.status, response.statusText);
      
      if (!response.ok) {
        let errorMessage = "Failed to fetch clients";
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
          console.error('ClientService: API error response:', errorData);
        } catch (parseError) {
          console.error('ClientService: Could not parse error response:', parseError);
        }
        return { success: false, message: errorMessage };
      }
      
      const rawData = await response.json();
      console.log('ClientService: Raw API response:', rawData);

      try {
        // Log basic response structure for debugging
        console.log('ClientService: Response structure:', {
          isArray: Array.isArray(rawData),
          hasContent: !!rawData.content,
          keys: Object.keys(rawData)
        });
        
        // Handle Spring Data paginated response (most common)
        if (rawData.content && Array.isArray(rawData.content)) {
          console.log('ClientService: Processing paginated response with', rawData.content.length, 'items');
          const clients = rawData.content.map((client: BackendClient) => ({
            id: client.id.toString(), // Convert number to string for frontend
            nome: client.nome || '',
            email: client.email || '',
            telefone: client.telefone || '',
            endereco: client.endereco || ''
          }));
          return { success: true, data: clients };
        } 
        
        // Handle direct array response
        if (Array.isArray(rawData)) {
          console.log('ClientService: Processing direct array response with', rawData.length, 'items');
          const clients = rawData.map((client: BackendClient) => ({
            id: client.id.toString(), // Convert number to string for frontend
            nome: client.nome || '',
            email: client.email || '',
            telefone: client.telefone || '',
            endereco: client.endereco || ''
          }));
          return { success: true, data: clients };
        } 
        
        // Handle single client response
        if (rawData && typeof rawData === 'object' && rawData.id) {
          console.log('ClientService: Processing single client response');
          const client = {
            id: rawData.id.toString(),
            nome: rawData.nome || '',
            email: rawData.email || '',
            telefone: rawData.telefone || '',
            endereco: rawData.endereco || ''
          };
          return { success: true, data: [client] };
        }
        
        // For development only - create mock data if response format is unexpected
        if (process.env.NODE_ENV === 'development') {
          console.log('ClientService: Creating mock data for development');
          const mockClients: Client[] = [
            {
              id: '1',
              nome: 'Mock Client 1',
              email: 'mock1@example.com',
              telefone: '(123) 456-7890',
              endereco: '123 Mock Street'
            },
            {
              id: '2',
              nome: 'Mock Client 2',
              email: 'mock2@example.com',
              telefone: '(987) 654-3210',
              endereco: '456 Mock Avenue'
            }
          ];
          console.log('ClientService: Using mock data due to unexpected response format');
          return { success: true, data: mockClients };
        }
        
        console.error('ClientService: Unexpected API response format', rawData);
        return { success: false, message: "Unexpected API response format" };
      } catch (parseError) {
        console.error('ClientService: Error parsing response data:', parseError);
        return { success: false, message: "Error parsing response data" };
      }
    } catch (error) {
      console.error('ClientService: Network error:', error);
      return { success: false, message: "Network error occurred" }
    }
  }

  static async createClient(clientData: Omit<Client, "id">): Promise<ApiResponse<Client>> {
    try {
      console.log('ClientService: Creating client with data:', clientData);
      const response = await fetch(`${this.CLIENT_ENDPOINT}`, {
        method: "POST",
        headers: this.getHeaders(),
        credentials: 'omit',
        body: JSON.stringify(clientData),
      });
      
      console.log('ClientService: Create response status:', response.status, response.statusText);
      
      if (!response.ok) {
        let errorMessage = "Failed to create client";
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
          console.error('ClientService: Create error response:', errorData);
        } catch (parseError) {
          console.error('ClientService: Could not parse create error response');
        }
        return { success: false, message: errorMessage };
      }
      
      const data = await response.json();
      console.log('ClientService: Create response data:', data);

      // Convert to client model
      const client = this.mapClientData(data);
      return { success: true, data: client }
    } catch (error) {
      console.error('ClientService: Create network error:', error);
      return { success: false, message: "Network error occurred" }
    }
  }

  static async updateClient(id: string, clientData: Partial<Client>): Promise<ApiResponse<Client>> {
    try {
      console.log(`ClientService: Updating client ${id} with data:`, clientData);
      const numericId = parseInt(id, 10);
      if (isNaN(numericId)) {
        console.error('ClientService: Invalid client ID:', id);
        return { success: false, message: "Invalid client ID" };
      }
      
      const response = await fetch(`${this.CLIENT_ENDPOINT}/${numericId}`, {
        method: "PUT",
        headers: this.getHeaders(),
        credentials: 'omit',
        body: JSON.stringify(clientData),
      });
      
      console.log('ClientService: Update response status:', response.status, response.statusText);
      
      if (!response.ok) {
        let errorMessage = "Failed to update client";
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
          console.error('ClientService: Update error response:', errorData);
        } catch (parseError) {
          console.error('ClientService: Could not parse update error response');
        }
        return { success: false, message: errorMessage };
      }
      
      const data = await response.json();
      console.log('ClientService: Update response data:', data);

      // Convert to client model
      const client = this.mapClientData(data);
      return { success: true, data: client }
    } catch (error) {
      console.error('ClientService: Update network error:', error);
      return { success: false, message: "Network error occurred" }
    }
  }

  static async deleteClient(id: string): Promise<ApiResponse<void>> {
    try {
      console.log(`ClientService: Deleting client ${id}`);
      const numericId = parseInt(id, 10);
      if (isNaN(numericId)) {
        console.error('ClientService: Invalid client ID for deletion:', id);
        return { success: false, message: "Invalid client ID" };
      }
      
      const response = await fetch(`${this.CLIENT_ENDPOINT}/${numericId}`, {
        method: "DELETE",
        headers: this.getHeaders(),
        credentials: 'omit',
      });

      console.log('ClientService: Delete response status:', response.status, response.statusText);
      
      if (response.ok) {
        console.log('ClientService: Client deleted successfully');
        return { success: true };
      }

      let errorMessage = "Failed to delete client";
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
        console.error('ClientService: Delete error response:', errorData);
      } catch (parseError) {
        console.error('ClientService: Could not parse delete error response');
      }
      return { success: false, message: errorMessage };
    } catch (error) {
      console.error('ClientService: Delete network error:', error);
      return { success: false, message: "Network error occurred" }
    }
  }
}
