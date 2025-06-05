import { api } from './api';
import { AUTH_ROUTES, TOKEN_KEY, API_ROUTES } from '@/lib/constants';

/**
 * Tipos e interfaces para autenticação
 */
export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  token: string;
  refreshToken?: string;
  user?: User;
}

export interface RefreshTokenResponse {
  token: string;
  refreshToken?: string;
}

export interface JwtPayload {
  sub: string;
  name: string;
  email: string;
  role: string;
  exp: number;
  iat: number;
}

/**
 * Serviço de autenticação consolidado
 */
export const authService = {
  /**
   * Salva o token no localStorage (seguro para SSR)
   */
  saveToken: (token: string, refreshToken?: string): void => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(TOKEN_KEY, token);
      
      if (refreshToken) {
        localStorage.setItem(`${TOKEN_KEY}_refresh`, refreshToken);
      }
    }
  },

  /**
   * Obtém o token JWT do localStorage
   */
  getToken: (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(TOKEN_KEY);
    }
    return null;
  },

  /**
   * Obtém o refresh token do localStorage
   */
  getRefreshToken: (): string | null => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(`${TOKEN_KEY}_refresh`);
    }
    return null;
  },

  /**
   * Remove todos os tokens do localStorage
   */
  removeTokens: (): void => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(`${TOKEN_KEY}_refresh`);
    }
  },

  /**
   * Verifica se o usuário está autenticado
   */
  isAuthenticated: (): boolean => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem(TOKEN_KEY);
      return !!token && authService.isTokenValid(token);
    }
    return false;
  },

  /**
   * Decodifica o payload do token JWT
   */
  decodeToken: (token: string): JwtPayload | null => {
    try {
      // Decodifica o payload do token (segunda parte do JWT)
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64).split('').map(c => {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Erro ao decodificar token JWT:', error);
      return null;
    }
  },

  /**
   * Verifica se o token JWT é válido e não está expirado
   */
  isTokenValid: (token: string): boolean => {
    try {
      const payload = authService.decodeToken(token);
      if (!payload) return false;
      
      // Verifica se o token não está expirado
      // exp é o timestamp de expiração em segundos, Date.now() é em milissegundos
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  },

  /**
   * Verifica quando o token expira (em segundos)
   */
  getTokenExpirationTime: (token: string): number | null => {
    try {
      const payload = authService.decodeToken(token);
      return payload ? payload.exp : null;
    } catch {
      return null;
    }
  },

  /**
   * Obtém o usuário atual a partir do token JWT
   */
  getCurrentUser: (): User | null => {
    const token = authService.getToken();
    if (!token) return null;

    try {
      const payload = authService.decodeToken(token);
      if (!payload) return null;

      return {
        id: parseInt(payload.sub),
        name: payload.name,
        email: payload.email,
        role: payload.role
      };
    } catch {
      return null;
    }
  },

  /**
   * Efetua login
   */
  login: async (email: string, password: string): Promise<AuthResponse> => {
    try {
      const response = await api.post<AuthResponse>(
        AUTH_ROUTES.LOGIN, 
        { email, password }, 
        { requiresAuth: false }
      );
      
      if (response.token) {
        authService.saveToken(response.token, response.refreshToken);
        return { 
          success: true,
          token: response.token,
          refreshToken: response.refreshToken,
          user: response.user
        };
      }
      
      return { 
        success: false, 
        message: 'Falha na autenticação',
        token: '' 
      };
    } catch (error: any) {
      return { 
        success: false, 
        message: error.message || 'Erro ao tentar fazer login',
        token: '' 
      };
    }
  },

  /**
   * Efetua registro de novo usuário
   */
  register: async (registerData: RegisterRequest): Promise<AuthResponse> => {
    try {
      const response = await api.post<AuthResponse>(
        AUTH_ROUTES.REGISTER, 
        registerData, 
        { requiresAuth: false }
      );
      
      if (response.token) {
        authService.saveToken(response.token, response.refreshToken);
        return { 
          success: true,
          token: response.token,
          refreshToken: response.refreshToken,
          user: response.user
        };
      }
      
      return {
        success: true,
        message: 'Registro realizado com sucesso',
        token: ''
      };
    } catch (error: any) {
      return { 
        success: false, 
        message: error.message || 'Erro ao registrar usuário',
        token: '' 
      };
    }
  },

  /**
   * Atualiza o token usando o refresh token
   */
  refreshToken: async (): Promise<boolean> => {
    const refreshToken = authService.getRefreshToken();
    
    if (!refreshToken) {
      return false;
    }
    
    try {
      const response = await api.post<RefreshTokenResponse>(
        AUTH_ROUTES.LOGIN + '/refresh',
        { refreshToken },
        { requiresAuth: false }
      );
      
      if (response.token) {
        authService.saveToken(response.token, response.refreshToken);
        return true;
      }
      
      return false;
    } catch {
      authService.removeTokens();
      return false;
    }
  },

  /**
   * Solicita recuperação de senha
   */
  forgotPassword: async (email: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await api.post<{ message: string }>(
        AUTH_ROUTES.FORGOT_PASSWORD, 
        { email }, 
        { requiresAuth: false }
      );
      
      return { 
        success: true, 
        message: response.message || 'Email de recuperação enviado com sucesso' 
      };
    } catch (error: any) {
      return { 
        success: false, 
        message: error.message || 'Erro ao solicitar recuperação de senha' 
      };
    }
  },

  /**
   * Redefine a senha com o token
   */
  resetPassword: async (token: string, password: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await api.post<{ message: string }>(
        `${AUTH_ROUTES.RESET_PASSWORD}?token=${token}`, 
        { password }, 
        { requiresAuth: false }
      );
      
      return { 
        success: true, 
        message: response.message || 'Senha redefinida com sucesso' 
      };
    } catch (error: any) {
      return { 
        success: false, 
        message: error.message || 'Erro ao redefinir senha' 
      };
    }
  },

  /**
   * Verifica se o token está prestes a expirar e o atualiza se necessário
   */
  checkAndRefreshToken: async (): Promise<boolean> => {
    const token = authService.getToken();
    if (!token) return false;
    
    const expirationTime = authService.getTokenExpirationTime(token);
    if (!expirationTime) return false;
    
    // Se o token expira em menos de 5 minutos, tenta renovar
    const fiveMinutesInSeconds = 5 * 60;
    const currentTimeInSeconds = Math.floor(Date.now() / 1000);
    
    if (expirationTime - currentTimeInSeconds < fiveMinutesInSeconds) {
      return await authService.refreshToken();
    }
    
    return true;
  },

  /**
   * Efetua logout
   */
  logout: (): void => {
    authService.removeTokens();
    // Redirecionar para página de login, se necessário
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }
};

/**
 * Hook para autenticação (pode ser exportado separadamente em um arquivo de hooks)
 */
export const useAuth = () => {
  return {
    login: authService.login,
    logout: authService.logout,
    register: authService.register,
    isAuthenticated: authService.isAuthenticated,
    getCurrentUser: authService.getCurrentUser,
    forgotPassword: authService.forgotPassword,
    resetPassword: authService.resetPassword,
  };
};
