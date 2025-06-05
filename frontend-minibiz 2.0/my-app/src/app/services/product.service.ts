import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';
import { Page } from './client.service';

export interface Product {
  id?: number;
  name: string;
  description?: string;
  price: number;
  stock: number;
  // Adicione outros campos conforme necessário
}

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private endpoint = '/api/products';

  constructor(private apiService: ApiService) { }

  getAllProducts(page: number = 0, size: number = 10): Observable<Page<Product>> {
    return this.apiService.get<Page<Product>>(`${this.endpoint}?page=${page}&size=${size}`);
  }

  getProduct(id: number): Observable<Product> {
    return this.apiService.get<Product>(`${this.endpoint}/${id}`);
  }

  createProduct(product: Product): Observable<Product> {
    return this.apiService.post<Product>(this.endpoint, product);
  }

  updateProduct(id: number, product: Product): Observable<Product> {
    return this.apiService.put<Product>(`${this.endpoint}/${id}`, product);
  }

  deleteProduct(id: number): Observable<string> {
    return this.apiService.delete<string>(`${this.endpoint}/${id}`);
  }
}

