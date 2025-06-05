import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';

export interface Client {
  id?: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  // Adicione outros campos conforme necessário
}

export interface Page<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private endpoint = '/api/clients';

  constructor(private apiService: ApiService) { }

  getAllClients(page: number = 0, size: number = 10): Observable<Page<Client>> {
    return this.apiService.get<Page<Client>>(`${this.endpoint}?page=${page}&size=${size}`);
  }

  getClient(id: number): Observable<Client> {
    return this.apiService.get<Client>(`${this.endpoint}/${id}`);
  }

  createClient(client: Client): Observable<Client> {
    return this.apiService.post<Client>(this.endpoint, client);
  }

  updateClient(id: number, client: Client): Observable<Client> {
    return this.apiService.put<Client>(`${this.endpoint}/${id}`, client);
  }

  deleteClient(id: number): Observable<string> {
    return this.apiService.delete<string>(`${this.endpoint}/${id}`);
  }
}

