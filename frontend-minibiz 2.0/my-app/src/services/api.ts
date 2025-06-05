import { API_BASE_URL, TOKEN_KEY, REFRESH_TOKEN_KEY, HTTP_STATUS, AUTH_ROUTES } from '@/lib/constants';

/**
 * Interfaces para o serviço de API
 */
export interface RequestOptions {
  requiresAuth?: boolean;
  customHeaders?: Record<string, string>;
  retry?: boolean;
  cache?: RequestCache;
}

export interface ApiError {
  message: string;
  status: number;
  isNetworkError?: boolean;
}

/**
 * Tipos para callbacks de requisição
 */
type BeforeRequestHook = (config: RequestInit) => RequestInit;
type AfterResponseHook = (response: Response) => Promise<Response>;
type ErrorHandlerHook = (error: any, endpoint: string, retryFn: () => Promise<any>) => Promise<any>;

/**
 * Classe para gerenciar os hooks e callbacks do API client
 */
class ApiHooks {
  private beforeRequestHooks: BeforeRequestHook[] = [];
  private afterResponseHooks: AfterResponseHook[] = [];
  private errorHandlerHooks: ErrorHandlerHook[] = [];

  addBeforeRequestHook(hook: BeforeRequestHook) {
    this.beforeRequestHooks.push(hook);
  }

  addAfterResponseHook(hook: AfterResponseHook) {
    this.afterResponseHooks.push(hook);
  }

  addErrorHandlerHook(hook: ErrorHandlerHook) {
    this.errorHandlerHooks.push(hook);
  }

  async applyBeforeRequestHooks(config: RequestInit): Promise<RequestInit> {
    let modifiedConfig = { ...config };
    
    for (const hook of this.beforeRequestHooks) {
      modifiedConfig = hook(modifiedConfig);
    }
    
    return modifiedConfig;
  }

  async applyAfterResponseHooks(response: Response): Promise<Response> {
    let modifiedResponse = response;
    
    for (const hook of this.afterResponseHooks) {
      modifiedResponse = await hook(modifiedResponse);
    }
    
    return modifiedResponse;
  }

  async applyErrorHandlerHooks(error: any, endpoint: string, retryFn: () => Promise<any>): Promise<any> {
    // Aplicar hooks de erro em cascata
    let currentIndex = 0;
    
    const processNextHook = async (err: any): Promise<any> => {
      if (currentIndex >= this.errorHandlerHooks.length) {
        throw err;
      }
      
      const hook = this.errorHandlerHooks[currentIndex];
      currentIndex++;
      
      try {
        return await hook(err, endpoint, retryFn);
      } catch (nextError) {
        return processNextHook(nextError);
      }
    };
    
    if (this.errorHandlerHooks.length === 0) {
      throw error;
    }
    
    return processNextHook(error);
  }
}

/**
 * Funções para gerenciamento de token
 */
export const getToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(TOKEN_KEY);
  }
  return null;
};

export const getRefreshToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }
  return null;
};

export const saveTokens = (token: string, refreshToken?: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, token);
    if (refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }
  }
};

export const removeTokens = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }
};

/**
 * Função para decodificar token JWT
 */
export const decodeToken = (token: string): any => {
  try {
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
};

/**
 * Verifica se o token está expirado
 */
export const isTokenExpired = (token: string): boolean => {
  try {
    const payload = decodeToken(token);
    if (!payload || !payload.exp) return true;
    
    // exp é timestamp em segundos, Date.now() é em milissegundos
    return payload.exp * 1000 <= Date.now();
  } catch {
    return true;
  }
};

/**
 * Configuração da API
 */
class Api {
  private hooks = new ApiHooks();
  private isRefreshing = false;
  private refreshSubscribers: Array<(token: string) => void> = [];

  constructor() {
    // Adicionar hook para tratamento de token expirado
    this.hooks.addErrorHandlerHook(this.handleTokenError);
  }

  /**
   * Cria os headers da requisição
   */
  private createHeaders(options?: RequestOptions): Headers {
    const headers = new Headers({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    });

    // Adiciona headers customizados
    if (options?.customHeaders) {
      Object.entries(options.customHeaders).forEach(([key, value]) => {
        headers.append(key, value);
      });
    }

    // Adiciona token de autenticação se necessário
    if (options?.requiresAuth !== false) {
      const token = getToken();
      if (token) {
        headers.append('Authorization', `Bearer ${token}`);
      }
    }

    return headers;
  }

  /**
   * Função para tratamento de erros
   */
  private async handleApiError(response: Response): Promise<ApiError> {
    let errorMessage = 'Erro desconhecido na requisição';
    
    try {
      const data = await response.json();
      errorMessage = data.message || data.error || errorMessage;
    } catch (e) {
      // Se não conseguir parsear o JSON, usa a mensagem padrão
      errorMessage = `${response.status}: ${response.statusText || errorMessage}`;
    }

    return {
      message: errorMessage,
      status: response.status,
    };
  }

  /**
   * Hook para tratamento de erros de token
   */
  private handleTokenError = async (error: any, endpoint: string, retryFn: () => Promise<any>): Promise<any> => {
    // Verifica se é um erro de autorização
    if (error.status === HTTP_STATUS.UNAUTHORIZED) {
      // Evita refresh para endpoints de autenticação
      if (endpoint.includes(AUTH_ROUTES.LOGIN) || 
          endpoint.includes(AUTH_ROUTES.REGISTER) || 
          endpoint.includes(AUTH_ROUTES.REFRESH_TOKEN)) {
        throw error;
      }
      
      // Tenta renovar o token
      try {
        await this.refreshAuthToken();
        // Se conseguiu renovar, tenta a requisição original novamente
        return retryFn();
      } catch (refreshError) {
        // Se falhou em renovar o token, força logout
        removeTokens();
        
        // Redireciona para login se estiver no browser
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
        
        throw error;
      }
    }
    
    // Se não for erro de token, propaga o erro
    throw error;
  };

  /**
   * Função para renovar o token
   */
  private async refreshAuthToken(): Promise<string> {
    const refreshToken = getRefreshToken();
    
    if (!refreshToken) {
      throw new Error('Refresh token não disponível');
    }
    
    // Se já estiver renovando, aguarda o resultado
    if (this.isRefreshing) {
      return new Promise((resolve, reject) => {
        this.refreshSubscribers.push((token: string) => {
          resolve(token);
        });
      });
    }
    
    this.isRefreshing = true;
    
    try {
      const response = await this.fetchApi<{ token: string, refreshToken?: string }>(
        AUTH_ROUTES.REFRESH_TOKEN,
        'POST',
        { refreshToken },
        { requiresAuth: false }
      );
      
      const { token, refreshToken: newRefreshToken } = response;
      
      // Salva os novos tokens
      saveTokens(token, newRefreshToken);
      
      // Notifica todos os subscribers
      this.refreshSubscribers.forEach(callback => callback(token));
      this.refreshSubscribers = [];
      
      return token;
    } finally {
      this.isRefreshing = false;
    }
  }

  /**
   * Método base para fazer requisições HTTP
   */
  async fetchApi<T>(
    endpoint: string, 
    method: string, 
    data?: any, 
    options?: RequestOptions
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = this.createHeaders(options);

    let config: RequestInit = {
      method,
      headers,
      credentials: 'include',
      cache: options?.cache || 'no-cache',
    };

    if (data && method !== 'GET') {
      config.body = JSON.stringify(data);
    }

    // Aplicar hooks antes da requisição
    config = await this.hooks.applyBeforeRequestHooks(config);

    try {
      let response = await fetch(url, config);
      
      // Aplicar hooks após a resposta
      response = await this.hooks.applyAfterResponseHooks(response);

      if (!response.ok) {
        const error = await this.handleApiError(response);
        
        // Função para retry da requisição
        const retryRequest = async () => {
          return this.fetchApi<T>(endpoint, method, data, {
            ...options,
            retry: false // Evita loops infinitos de retry
          });
        };
        
        // Tratar erro usando os hooks
        return await this.hooks.applyErrorHandlerHooks(error, endpoint, retryRequest);
      }

      // Para respostas 204 No Content ou similar
      if (response.status === HTTP_STATUS.NO_CONTENT) {
        return {} as T;
      }

      return await response.json() as T;
    } catch (error) {
      console.error(`API request failed (${method} ${endpoint}):`, error);
      
      // Criar objeto de erro para erros de rede
      const networkError: ApiError = {
        message: 'Erro de conexão. Verifique sua internet.',
        status: 0,
        isNetworkError: true
      };
      
      // Função para retry
      const retryRequest = async () => {
        return this.fetchApi<T>(endpoint, method, data, options);
      };
      
      // Tratar erro usando os hooks
      return await this.hooks.applyErrorHandlerHooks(
        error instanceof Error ? error : networkError, 
        endpoint, 
        retryRequest
      );
    }
  }

  /**
   * Registra um hook personalizado para execução antes da requisição
   */
  registerBeforeRequestHook(hook: BeforeRequestHook) {
    this.hooks.addBeforeRequestHook(hook);
    return this; // Para permitir chaining
  }

  /**
   * Registra um hook personalizado para execução após a resposta
   */
  registerAfterResponseHook(hook: AfterResponseHook) {
    this.hooks.addAfterResponseHook(hook);
    return this;
  }

  /**
   * Registra um hook personalizado para tratamento de erros
   */
  registerErrorHandlerHook(hook: ErrorHandlerHook) {
    this.hooks.addErrorHandlerHook(hook);
    return this;
  }

  // Métodos HTTP
  get<T>(endpoint: string, options?: RequestOptions) {
    return this.fetchApi<T>(endpoint, 'GET', undefined, options);
  }
  
  post<T>(endpoint: string, data?: any, options?: RequestOptions) {
    return this.fetchApi<T>(endpoint, 'POST', data, options);
  }
  
  put<T>(endpoint: string, data?: any, options?: RequestOptions) {
    return this.fetchApi<T>(endpoint, 'PUT', data, options);
  }
  
  patch<T>(endpoint: string, data?: any, options?: RequestOptions) {
    return this.fetchApi<T>(endpoint, 'PATCH', data, options);
  }
  
  delete<T>(endpoint: string, options?: RequestOptions) {
    return this.fetchApi<T>(endpoint, 'DELETE', undefined, options);
  }
}

// Instância global da API
export const api = new Api();

// Adicionar hooks de log em desenvolvimento
if (process.env.NODE_ENV === 'development') {
  api.registerBeforeRequestHook((config) => {
    console.log('🚀 API Request:', config);
    return config;
  });
  
  api.registerAfterResponseHook(async (response) => {
    console.log('✅ API Response:', {
      url: response.url,
      status: response.status,
      statusText: response.statusText,
    });
    return response;
  });
}
