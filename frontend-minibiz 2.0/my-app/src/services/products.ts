import { api } from './api';
import { API_ROUTES } from '@/lib/constants';

/**
 * Interface para produto
 */
export interface Product {
  id?: number;
  name: string;
  description?: string;
  price: number;
  stock: number;
}

/**
 * Interface para resposta paginada
 */
export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

/**
 * Serviço para gerenciamento de produtos
 */
export const productService = {
  /**
   * Obtém todos os produtos com paginação
   */
  getAllProducts: async (page: number = 0, size: number = 10): Promise<PageResponse<Product>> => {
    return api.get<PageResponse<Product>>(`${API_ROUTES.PRODUCTS}?page=${page}&size=${size}`);
  },

  /**
   * Obtém um produto pelo ID
   */
  getProduct: async (id: number): Promise<Product> => {
    return api.get<Product>(`${API_ROUTES.PRODUCTS}/${id}`);
  },

  /**
   * Cria um novo produto
   */
  createProduct: async (product: Product): Promise<Product> => {
    return api.post<Product>(API_ROUTES.PRODUCTS, product);
  },

  /**
   * Atualiza um produto existente
   */
  updateProduct: async (id: number, product: Product): Promise<Product> => {
    return api.put<Product>(`${API_ROUTES.PRODUCTS}/${id}`, product);
  },

  /**
   * Exclui um produto
   */
  deleteProduct: async (id: number): Promise<string> => {
    return api.delete<string>(`${API_ROUTES.PRODUCTS}/${id}`);
  }
};

