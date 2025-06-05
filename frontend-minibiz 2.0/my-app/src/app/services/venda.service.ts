import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { Page } from './client.service';

export interface ProdutoVendaDTO {
  productId: number;
  quantity: number;
}

export interface VendaRequest {
  clientId: number;
  produtosDTO: ProdutoVendaDTO[];
}

export interface VendaResponse {
  id: number;
  clientName: string;
  clientId: number;
  total: number;
  dataVenda: string;
  status: string;
  items: ProdutoVendaDTO[];
}

export interface DetalheVendaDTO {
  id: number;
  clientName: string;
  clientId: number;
  total: number;
  dataVenda: string;
  status: string;
  items: ProdutoVendaDTO[];
}

export interface VendaRelatorioRequest {
  dataInicio: string;
  dataFim: string;
  clientId?: number;
  clientName?: string;
}

export interface VendaRelatorioFinanceiroResponse {
  totalVendas: number;
  valorTotal: number;
  ticketMedio: number;
  // Adicione outros campos conforme necessário
}

@Injectable({
  providedIn: 'root'
})
export class VendaService {
  private endpoint = '/api/vendas';

  constructor(private apiService: ApiService) { }

  getAllVendas(page: number = 0, size: number = 10): Observable<Page<VendaResponse>> {
    return this.apiService.get<Page<VendaResponse>>(`${this.endpoint}?page=${page}&size=${size}`);
  }

  getVenda(id: number): Observable<VendaResponse> {
    return this.apiService.get<VendaResponse>(`${this.endpoint}/${id}`);
  }

  createVenda(venda: VendaRequest): Observable<VendaResponse> {
    return this.apiService.post<VendaResponse>(this.endpoint, venda);
  }

  cancelarVenda(id: number): Observable<VendaResponse> {
    return this.apiService.put<VendaResponse>(`${this.endpoint}/cancelar/${id}`, {});
  }

  editarVenda(id: number, venda: VendaRequest): Observable<VendaResponse> {
    return this.apiService.put<VendaResponse>(`${this.endpoint}/editar/${id}`, venda);
  }

  getRelatorioVendas(request: VendaRelatorioRequest): Observable<DetalheVendaDTO[]> {
    return this.apiService.post<DetalheVendaDTO[]>(`${this.endpoint}/relatorio`, request);
  }

  getRelatorioFinanceiro(request: VendaRelatorioRequest): Observable<VendaRelatorioFinanceiroResponse> {
    return this.apiService.post<VendaRelatorioFinanceiroResponse>(`${this.endpoint}/relatorio-financeiro`, request);
  }
}

