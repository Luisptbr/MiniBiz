import { api } from './api';
import { API_ROUTES } from '@/lib/constants';
import { PageResponse } from './products';

/**
 * Interface para cliente
 */
export interface Client {
  id?: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
}

/**
 * Serviço para gerenciamento de clientes
 */
export const clientService = {
  /**
   * Obtém todos os clientes com paginação
   */
  getAllClients: async (page: number = 0, size: number = 10): Promise<PageResponse<Client>> => {
    return api.get<PageResponse<Client>>(`${API_ROUTES.CLIENTS}?page=${page}&size=${size}`);
  },

  /**
   * Obtém um cliente pelo ID
   */
  getClient: async (id: number): Promise<Client> => {
    return api.get<Client>(`${API_ROUTES.CLIENTS}/${id}`);
  },

  /**
   * Cria um novo cliente
   */
  createClient: async (client: Client): Promise<Client> => {
    return api.post<Client>(API_ROUTES.CLIENTS, client);
  },

  /**
   * Atualiza um cliente existente
   */
  updateClient: async (id: number, client: Client): Promise<Client> => {
    return api.put<Client>(`${API_ROUTES.CLIENTS}/${id}`, client);
  },

  /**
   * Exclui um cliente
   */
  deleteClient: async (id: number): Promise<string> => {
    return api.delete<string>(`${API_ROUTES.CLIENTS}/${id}`);
  }
};

