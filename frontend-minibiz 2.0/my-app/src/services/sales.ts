import { api } from './api';
import { API_ROUTES } from '@/lib/constants';
import { PageResponse } from './products';

/**
 * Interface para item de venda
 */
export interface SaleItem {
  productId: number;
  quantity: number;
}

/**
 * Interface para requisição de criação de venda
 */
export interface SaleRequest {
  clientId: number;
  produtosDTO: SaleItem[];
}

/**
 * Interface para resposta de venda
 */
export interface SaleResponse {
  id: number;
  clientName: string;
  clientId: number;
  total: number;
  dataVenda: string;
  status: string;
  items: SaleItem[];
}

/**
 * Interface para requisição de relatório
 */
export interface SaleReportRequest {
  dataInicio: string;
  dataFim: string;
  clientId?: number;
  clientName?: string;
}

/**
 * Interface para resposta de relatório financeiro
 */
export interface FinancialReportResponse {
  totalVendas: number;
  valorTotal: number;
  ticketMedio: number;
}

/**
 * Serviço para gerenciamento de vendas
 */
export const saleService = {
  /**
   * Obtém todas as vendas com paginação
   */
  getAllSales: async (page: number = 0, size: number = 10): Promise<PageResponse<SaleResponse>> => {
    return api.get<PageResponse<SaleResponse>>(`${API_ROUTES.SALES}?page=${page}&size=${size}`);
  },

  /**
   * Obtém uma venda pelo ID
   */
  getSale: async (id: number): Promise<SaleResponse> => {
    return api.get<SaleResponse>(`${API_ROUTES.SALES}/${id}`);
  },

  /**
   * Cria uma nova venda
   */
  createSale: async (sale: SaleRequest): Promise<SaleResponse> => {
    return api.post<SaleResponse>(API_ROUTES.SALES, sale);
  },

  /**
   * Cancela uma venda
   */
  cancelSale: async (id: number): Promise<SaleResponse> => {
    return api.put<SaleResponse>(`${API_ROUTES.SALES}/cancelar/${id}`, {});
  },

  /**
   * Atualiza uma venda existente
   */
  updateSale: async (id: number, sale: SaleRequest): Promise<SaleResponse> => {
    return api.put<SaleResponse>(`${API_ROUTES.SALES}/editar/${id}`, sale);
  },

  /**
   * Gera relatório de vendas
   */
  getSalesReport: async (request: SaleReportRequest): Promise<SaleResponse[]> => {
    return api.post<SaleResponse[]>(`${API_ROUTES.SALES}/relatorio`, request);
  },

  /**
   * Gera relatório financeiro
   */
  getFinancialReport: async (request: SaleReportRequest): Promise<FinancialReportResponse> => {
    return api.post<FinancialReportResponse>(`${API_ROUTES.SALES}/relatorio-financeiro`, request);
  }
};

