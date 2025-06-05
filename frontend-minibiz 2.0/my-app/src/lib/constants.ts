// Constantes de configuração da API
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// Chaves para armazenamento de tokens
export const TOKEN_KEY = 'minibiz_auth_token';
export const REFRESH_TOKEN_KEY = 'minibiz_refresh_token';

// Configurações de autenticação
export const AUTH_CONFIG = {
  // Tempo em segundos antes da expiração para tentar renovar o token (5 minutos)
  TOKEN_REFRESH_THRESHOLD: 5 * 60,
  // Rota de redirecionamento após logout
  LOGOUT_REDIRECT: '/login',
  // Rota de redirecionamento após login bem sucedido
  LOGIN_REDIRECT: '/dashboard',
};

// Constantes para rotas de autenticação
export const AUTH_ROUTES = {
  LOGIN: '/api/auth/login',
  REGISTER: '/api/auth/register',
  FORGOT_PASSWORD: '/api/auth/forgot-password',
  RESET_PASSWORD: '/api/auth/reset-password',
  REFRESH_TOKEN: '/api/auth/refresh',
  VALIDATE_TOKEN: '/api/auth/validate',
  CHANGE_PASSWORD: '/api/auth/change-password',
  LOGOUT: '/api/auth/logout',
};

// Constantes para rotas de recursos
export const API_ROUTES = {
  PRODUCTS: '/api/products',
  CLIENTS: '/api/clients',
  SALES: '/api/vendas',
  USER: '/api/user',
  PROFILE: '/api/user/profile',
  DASHBOARD: '/api/dashboard',
};

// HTTP Status codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
};
