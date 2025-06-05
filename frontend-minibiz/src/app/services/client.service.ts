import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Client, ClientPage } from '../types/client.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ClientService {
  private apiUrl = `${environment.apiUrl}/clients`;

  constructor(private http: HttpClient) { }

  /**
   * Retrieves a paginated list of clients
   * @param page Page number (0-based)
   * @param size Number of items per page
   * @returns Observable of ClientPage
   */
  getClients(page: number = 0, size: number = 10): Observable<ClientPage> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    return this.http.get<ClientPage>(this.apiUrl, { params })
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Retrieves a single client by ID
   * @param id Client ID
   * @returns Observable of Client
   */
  getClientById(id: number): Observable<Client> {
    return this.http.get<Client>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Creates a new client
   * @param client Client data
   * @returns Observable of created Client
   */
  createClient(client: Client): Observable<Client> {
    return this.http.post<Client>(this.apiUrl, client)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Updates an existing client
   * @param id Client ID
   * @param client Updated client data
   * @returns Observable of updated Client
   */
  updateClient(id: number, client: Client): Observable<Client> {
    return this.http.put<Client>(`${this.apiUrl}/${id}`, client)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Deletes a client
   * @param id Client ID
   * @returns Observable of deletion confirmation
   */
  deleteClient(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Error handler for HTTP requests
   * @param error HTTP error
   * @returns Observable with error
   */
  private handleError(error: any) {
    let errorMessage = '';
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}

