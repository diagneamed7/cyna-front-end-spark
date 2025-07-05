// types/base.ts - Types de base et utilitaires pour l'API

// =============================================================================
// TYPES D'API GÉNÉRIQUES
// =============================================================================

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  details?: any[];
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginationResponse {
  total: number;
  page: number;
  pages: number;
  limit: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: {
    items: T[];
    pagination: PaginationResponse;
  };
}

// =============================================================================
// TYPES DE FILTRES GÉNÉRIQUES
// =============================================================================

export interface SearchFilters {
  search?: string;
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'ASC' | 'DESC';
}

export interface DateFilters {
  date_debut?: string;
  date_fin?: string;
  annee_min?: number;
  annee_max?: number;
}

// =============================================================================
// TYPES D'ÉTAT GÉNÉRIQUES
// =============================================================================

export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

export interface DataState<T> extends LoadingState {
  data: T | null;
}

export interface ListState<T> extends LoadingState {
  items: T[];
  pagination: PaginationResponse | null;
  filters: SearchFilters;
}

// =============================================================================
// TYPES DE FORMULAIRES
// =============================================================================

export interface FormErrors {
  [key: string]: string | undefined;
}

export interface FormState<T> {
  values: T;
  errors: FormErrors;
  isSubmitting: boolean;
  isValid: boolean;
}

// =============================================================================
// TYPES D'ÉVÉNEMENTS
// =============================================================================

export type EventHandler<T = any> = (event: T) => void;
export type AsyncEventHandler<T = any> = (event: T) => Promise<void>;

// =============================================================================
// TYPES DE MÉDIAS
// =============================================================================

export type MediaType = 'image' | 'video' | 'audio' | 'document';

export interface BaseMedia {
  id: number;
  type: MediaType;
  url: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

// =============================================================================
// TYPES DE STATUTS GÉNÉRIQUES
// =============================================================================

export type BaseStatus =
  | 'actif'
  | 'inactif'
  | 'brouillon'
  | 'publie'
  | 'archive'
  | 'supprime';

// =============================================================================
// UTILITAIRES DE TYPES
// =============================================================================

/**
 * Rendre certaines clés optionnelles dans un type.
 */
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

/**
 * Rendre certaines clés obligatoires dans un type.
 */
export type RequiredKeys<T, K extends keyof T> = T & { [P in K]-?: T[P] };

/**
 * Rendre toutes les clés récursivement optionnelles.
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// =============================================================================
// CONSTANTES D'API
// =============================================================================
export interface DataState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  refetch?: () => Promise<void>;
}
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    PROFILE: '/auth/profile',
    CHANGE_PASSWORD: '/auth/change-password',
  },
  USERS: '/users',
  OEUVRES: '/oeuvres',
  EVENEMENTS: '/evenements',
  LIEUX: '/lieux',
  COMMENTAIRES: '/commentaires',
  METADATA: '/metadata',
} as const;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500,
} as const;
