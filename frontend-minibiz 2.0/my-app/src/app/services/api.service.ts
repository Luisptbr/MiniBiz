import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  // Método para obter headers com autenticação
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem(environment.tokenKey);
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
  }

  // Métodos genéricos para requisições HTTP
  get<T>(endpoint: string, requireAuth: boolean = true): Observable<T> {
    const headers = requireAuth ? this.getAuthHeaders() : new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.get<T>(`${this.apiUrl}${endpoint}`, { headers });
  }

  post<T>(endpoint: string, data: any, requireAuth: boolean = true): Observable<T> {
    const headers = requireAuth ? this.getAuthHeaders() : new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<T>(`${this.apiUrl}${endpoint}`, data, { headers });
  }

  put<T>(endpoint: string, data: any): Observable<T> {
    return this.http.put<T>(`${this.apiUrl}${endpoint}`, data, { headers: this.getAuthHeaders() });
  }

  delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<T>(`${this.apiUrl}${endpoint}`, { headers: this.getAuthHeaders() });
  }
}

