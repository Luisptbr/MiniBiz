import { Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

interface AuthResponse {
  name: string;
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(
    private apiService: ApiService,
    private router: Router
  ) { }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.apiService.post<AuthResponse>('/auth/login', { email, password }, false)
      .pipe(
        tap(response => {
          localStorage.setItem(environment.tokenKey, response.token);
        })
      );
  }

  register(name: string, email: string, password: string): Observable<AuthResponse> {
    return this.apiService.post<AuthResponse>('/auth/register', { name, email, password }, false)
      .pipe(
        tap(response => {
          localStorage.setItem(environment.tokenKey, response.token);
        })
      );
  }

  forgotPassword(email: string): Observable<string> {
    return this.apiService.post<string>('/auth/forgot-password', { email }, false);
  }

  resetPassword(token: string, newPassword: string): Observable<string> {
    return this.apiService.post<string>(`/auth/reset-password?token=${token}`, newPassword, false);
  }

  logout(): void {
    localStorage.removeItem(environment.tokenKey);
    this.router.navigate(['/login']);
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem(environment.tokenKey);
  }

  getToken(): string | null {
    return localStorage.getItem(environment.tokenKey);
  }
}

