/**
 * Arquivo centralizado de tipos para a aplicação MiniBiz
 * Organizado por domínios de negócio
 */

// ==============================================
// Tipos de Autenticação
// ==============================================

/**
 * Interface para o payload do token JWT
 */
export interface JwtPayload {
  sub: string;        // ID do usuário (subject)
  name: string;       // Nome do usuário 
  email: string;      // Email do usuário
  role: string;       // Papel/função do usuário (ex: admin, user)
  exp: number;        // Timestamp de expiração (em segundos)
  iat: number;        // Timestamp de emissão (em segundos)
}

/**
 * Tipos para solicitações de autenticação
 */
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

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

/**
 * Tipos para respostas de autenticação
 */
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

// ==============================================
// Tipos de Usuário
// ==============================================

/**
 * Enum para papéis de usuário
 */
export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  EMPLOYEE = 'EMPLOYEE',
  USER = 'USER'
}

/**
 * Interface para dados de usuário
 */
export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole | string;
  phone?: string;
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserProfile extends User {
  address?: Address;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  theme?: 'light' | 'dark' | 'system';
  language?: string;
  notifications?: boolean;
}

// ==============================================
// Tipos de Resposta da API
// ==============================================

/**
 * Interface genérica para resposta da API
 */
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}

/**
 * Interface para erros da API
 */
export interface ApiError {
  message: string;
  status: number;
  isNetworkError?: boolean;
  code?: string;
  errors?: Record<string, string[]>;
}

/**
 * Interface para resposta paginada
 */
export interface PaginatedResponse<T> {
  items: T[];
  totalItems: number;
  itemsPerPage: number;
  currentPage: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

/**
 * Parâmetros para requisições paginadas
 */
export interface PaginationParams {
  page?: number;
  size?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  search?: string;
  filters?: Record<string, any>;
}

// ==============================================
// Tipos de Entidades de Negócio: Cliente
// ==============================================

/**
 * Interface para Cliente
 */
export interface Client {
  id: number;
  name: string;
  email: string;
  phone?: string;
  document?: string; // CPF/CNPJ
  type: 'PERSON' | 'COMPANY';
  address?: Address;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

/**
 * Interface para criação de Cliente
 */
export interface CreateClientRequest {
  name: string;
  email: string;
  phone?: string;
  document?: string;
  type: 'PERSON' | 'COMPANY';
  address?: CreateAddressRequest;
}

/**
 * Interface para atualização de Cliente
 */
export interface UpdateClientRequest {
  name?: string;
  email?: string;
  phone?: string;
  document?: string;
  type?: 'PERSON' | 'COMPANY';
  address?: UpdateAddressRequest;
  isActive?: boolean;
}

// ==============================================
// Tipos de Entidades de Negócio: Produto
// ==============================================

/**
 * Interface para Produto
 */
export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number;
  cost?: number;
  stock: number;
  sku?: string;
  barcode?: string;
  category?: ProductCategory;
  images?: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Interface para Categoria de Produto
 */
export interface ProductCategory {
  id: number;
  name: string;
  description?: string;
  parentId?: number;
}

/**
 * Interface para criação de Produto
 */
export interface CreateProductRequest {
  name: string;
  description?: string;
  price: number;
  cost?: number;
  stock: number;
  sku?: string;
  barcode?: string;
  categoryId?: number;
  images?: string[];
}

/**
 * Interface para atualização de Produto
 */
export interface UpdateProductRequest {
  name?: string;
  description?: string;
  price?: number;
  cost?: number;
  stock?: number;
  sku?: string;
  barcode?: string;
  categoryId?: number;
  images?: string[];
  isActive?: boolean;
}

// ==============================================
// Tipos de Entidades de Negócio: Venda
// ==============================================

/**
 * Enum para status de Venda
 */
export enum SaleStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELED = 'CANCELED',
  REFUNDED = 'REFUNDED'
}

/**
 * Interface para Venda
 */
export interface Sale {
  id: number;
  clientId: number;
  client: Client;
  items: SaleItem[];
  status: SaleStatus;
  total: number;
  discount?: number;
  tax?: number;
  shipping?: number;
  note?: string;
  paymentMethod: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Interface para Item de Venda
 */
export interface SaleItem {
  id: number;
  saleId: number;
  productId: number;
  product: Product;
  quantity: number;
  price: number;
  discount?: number;
  total: number;
}

/**
 * Interface para criação de Venda
 */
export interface CreateSaleRequest {
  clientId: number;
  items: {
    productId: number;
    quantity: number;
    price?: number;
    discount?: number;
  }[];
  discount?: number;
  tax?: number;
  shipping?: number;
  note?: string;
  paymentMethod: string;
}

// ==============================================
// Utilidades Gerais
// ==============================================

/**
 * Interface para Endereço
 */
export interface Address {
  id?: number;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  country?: string;
}

/**
 * Interface para criação de Endereço
 */
export interface CreateAddressRequest {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  country?: string;
}

/**
 * Interface para atualização de Endereço
 */
export interface UpdateAddressRequest {
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
}

/**
 * Interface para seletor (dropdown, select)
 */
export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
  description?: string;
  icon?: string;
}

/**
 * Interface para data range
 */
export interface DateRange {
  startDate: Date | string;
  endDate: Date | string;
}

/**
 * Interface para filtros
 */
export interface Filters {
  [key: string]: any;
}

/**
 * Tipos de notificação
 */
export type NotificationType = 'info' | 'success' | 'warning' | 'error';

/**
 * Interface para notificação
 */
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date | string;
  read: boolean;
  link?: string;
}

