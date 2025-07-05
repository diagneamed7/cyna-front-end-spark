// src/config/api.ts - Configuration de l'API pour votre backend Node.js

// =============================================================================
// CONFIGURATION DE BASE
// =============================================================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ✅ CORRIGÉ : PaginatedResponse avec structure data
export interface PaginatedResponse<T> {
  data: {
    items: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number; // ✅ CORRIGÉ : 'pages' au lieu de 'totalPages' pour correspondre au code
    };
  };
}

// ✅ AJOUT : Interface pour la pagination seule
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

// ✅ AJOUT : Interface pour les erreurs de validation
export interface ValidationError {
  field: string;
  message: string;
}

// Configuration API selon l'environnement
export const API_CONFIG = {

  // ✅ TEMPORAIRE : Forcer l'URL directe pour contourner le proxy
  BASE_URL: 'http://172.16.1.32:3000',
  UPLOAD_URL: 'http://172.16.1.32:3000/uploads',
  // ... reste de la configuration

  TIMEOUT: 30000, // 30 secondes
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 seconde
  
  // Configuration du cache
  CACHE_TTL: 5 * 60 * 1000, // 5 minutes
  
  // Clé de stockage du token
  TOKEN_KEY: 'actionculture_token',
  USER_KEY: 'actionculture_user',
  
  // Headers par défaut
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  }
};

// Types d'erreurs API
export enum ApiErrorType {
  NETWORK = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT_ERROR',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION = 'VALIDATION_ERROR',
  SERVER = 'SERVER_ERROR',
  UNKNOWN = 'UNKNOWN_ERROR'
}

export class ApiError extends Error {
  constructor(
    public type: ApiErrorType,
    public message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Helper pour construire les URLs
export const buildUrl = (path: string): string => {
  // Si on est en dev et que l'URL commence par /api, on utilise directement le path
  if (import.meta.env.DEV && path.startsWith('/')) {
    return path;
  }
  
  const baseUrl = API_CONFIG.BASE_URL.replace(/\/$/, '');
  const cleanPath = path.replace(/^\//, '');
  return `${baseUrl}/${cleanPath}`;
};

// Helper pour construire les URLs d'upload
export const buildUploadUrl = (filename: string): string => {
  const baseUrl = API_CONFIG.UPLOAD_URL.replace(/\/$/, '');
  return `${baseUrl}/${filename}`;
};

// Log de la configuration en développement
if (import.meta.env.DEV) {
  console.log('📡 Configuration API:', {
    BASE_URL: API_CONFIG.BASE_URL,
    UPLOAD_URL: API_CONFIG.UPLOAD_URL,
    Environment: import.meta.env.MODE
  });
}

export const API_ENDPOINTS = {
  // ✅ CORRIGÉ - Authentification pour votre backend Node.js avec MFA
  AUTH: {
    LOGIN: '/api/auth/login',           // ✅ CORRIGÉ : /api/auth/login pour votre backend
    REGISTER: '/api/auth/register',     // ✅ CORRIGÉ : /api/auth/register pour votre backend
    LOGOUT: '/api/auth/logout',         // ✅ CORRIGÉ : /api/auth/logout pour votre backend
    PROFILE: '/api/auth/profile',       // ✅ CORRIGÉ : /api/auth/profile pour votre backend
    CHANGE_PASSWORD: '/api/auth/change-password', // ✅ CORRIGÉ : /api/auth/change-password
    REFRESH_TOKEN: '/api/auth/refresh', // ✅ CORRIGÉ : /api/auth/refresh
    // ✅ AJOUTÉ : Endpoints MFA
    VERIFY_MFA: '/api/auth/verify-mfa',
    SETUP_MFA: '/api/auth/setup-mfa',
  },

  // ✅ MODIFIÉ - Endpoints pour votre backend Node.js
  USERS: {
    BASE: '/user',
    BY_ID: (id: number) => `/user/${id}`,
    PROFILE: '/user/profile',
    UPDATE: '/user/update',
  },

  // ✅ AJOUTÉ - Œuvres pour votre backend Node.js
  OEUVRES: {
    BASE: '/oeuvres',
    BY_ID: (id: number) => `/oeuvres/${id}`,
    SEARCH: '/oeuvres/search',
    POPULAR: '/oeuvres/popular',
    RECENT: '/oeuvres/recent',
    MY_OEUVRES: '/oeuvres/my-oeuvres',
    VALIDATE: (id: number) => `/oeuvres/${id}/validate`,
    SUGGESTIONS: '/oeuvres/suggestions',
  },

  // ✅ AJOUTÉ - Événements pour votre backend Node.js
  EVENEMENTS: {
    BASE: '/evenements',
    BY_ID: (id: number) => `/evenements/${id}`,
    SEARCH: '/evenements/search',
    UPCOMING: '/evenements/upcoming',
    MY_EVENTS: '/evenements/my-events',
    INSCRIPTION: (id: number) => `/evenements/${id}/inscription`,
    PARTICIPANTS: (id: number) => `/evenements/${id}/participants`,
    STATISTICS: '/evenements/statistics',
    SUGGESTIONS: '/evenements/suggestions',
  },

  // ✅ AJOUTÉ - Patrimoine pour votre backend Node.js
  PATRIMOINE: {
    BASE: '/patrimoine',
    SITES: '/patrimoine/sites',
    SITE_BY_ID: (id: number) => `/patrimoine/sites/${id}`,
    POPULAIRES: '/patrimoine/populaires',
    RECHERCHE: '/patrimoine/recherche',
    PROXIMITE: '/patrimoine/proximite',
    STATISTIQUES: '/patrimoine/statistiques',
  },

  // ✅ MODIFIÉ - Produits pour votre backend Node.js
  PRODUITS: {
    BASE: '/produits',
    BY_ID: (id: number) => `/produits/${id}`,
    BY_CATEGORY: (categoryId: number) => `/produits/category/${categoryId}`,
    SEARCH: '/produits/search',
    POPULAR: '/produits/popular',
    RECENT: '/produits/recent',
  },

  // ✅ MODIFIÉ - Catégories pour votre backend Node.js
  CATEGORIES: {
    BASE: '/categories',
    BY_ID: (id: number) => `/categories/${id}`,
    ALL: '/categories/all',
    SEARCH: '/categories/search',
    WITH_COUNT: '/categories/with-count',
    POPULAR: '/categories/popular',
    RECENT: '/categories/recent',
    STATS: '/categories/stats',
  },

  // ✅ MODIFIÉ - Panier pour votre backend Node.js
  PANIER: {
    BASE: '/panier',
    ADD_ITEM: '/panier/add',
    REMOVE_ITEM: (itemId: number) => `/panier/remove/${itemId}`,
    UPDATE_QUANTITY: (itemId: number) => `/panier/update/${itemId}`,
    CLEAR: '/panier/clear',
  },

  // ✅ MODIFIÉ - Commandes pour votre backend Node.js
  COMMANDES: {
    BASE: '/commandes',
    BY_ID: (id: number) => `/commandes/${id}`,
    CREATE: '/commandes/create',
    MY_ORDERS: '/commandes/my-orders',
  },

  // ✅ MODIFIÉ - Paiements pour votre backend Node.js
  PAIEMENTS: {
    BASE: '/paiements',
    CREATE: '/paiements/create',
    VERIFY: '/paiements/verify',
  },

  // Upload
  UPLOAD: {
    IMAGE: '/uploads/image',
    FILE: '/uploads/file',
  },

  // Métadonnées
  METADATA: {
    BASE: '/metadata',
    LANGUES: '/metadata/langues',
    CATEGORIES: '/metadata/categories',
    WILAYAS: '/metadata/wilayas',
    GENRES: '/metadata/genres',
    TYPES: '/metadata/types',
    SPECIALITES: '/metadata/specialites',
    STATUTS: '/metadata/statuts',
    ROLES: '/metadata/roles',
    PERMISSIONS: '/metadata/permissions',
  },

  // Recherche globale
  SEARCH: {
    GLOBAL: '/search',
    SUGGESTIONS: '/search/suggestions',
    HISTORY: '/search/history',
    POPULAR: '/search/popular',
  },

  // Statistiques
  STATISTICS: {
    GLOBAL: '/statistics',
    USER: '/statistics/user',
    ADMIN: '/statistics/admin',
  },

  // ✅ AJOUTÉ - Statistiques détaillées
  STATS: {
    DASHBOARD: '/api/stats/dashboard',
    GLOBAL: '/api/stats/global',
    USER: '/api/stats/user',
    ADMIN: '/api/stats/admin',
  },

  // Notifications
  NOTIFICATIONS: {
    BASE: '/notifications',
    MARK_READ: (id: number) => `/notifications/${id}/read`,
    MARK_ALL_READ: '/notifications/mark-all-read',
    SETTINGS: '/notifications/settings',
  },

  // Chat
  CHAT: {
    BASE: '/chat',
    MESSAGES: '/chat/messages',
    SEND: '/chat/send',
    ROOMS: '/chat/rooms',
  },
};

// ✅ AJOUTÉ : Types pour l'authentification MFA
export interface MFALoginRequest {
  email: string;
  password: string;
  token: string; // Code MFA
}

export interface MFARegisterRequest {
  email: string;
  nom: string;
  prenom: string;
  password: string;
}

export interface MFARegisterResponse {
  user: {
    idUser: number;
    email: string;
    username: string;
    role: string;
  };
  qrCode: string; // URL du QR code pour configurer l'app MFA
}

export interface MFALoginResponse {
  token: string; // JWT token
  user?: {
    idUser: number;
    email: string;
    username: string;
    role: string;
  };
}

// =============================================================================
// CONFIGURATION DES HEADERS PAR DÉFAUT
// =============================================================================

export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
  'X-Requested-With': 'XMLHttpRequest',
};

// =============================================================================
// CODES DE STATUT HTTP
// =============================================================================

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
};

// =============================================================================
// MESSAGES D'ERREUR PAR DÉFAUT
// =============================================================================

export const ERROR_MESSAGES = {
  NETWORK: 'Erreur de connexion au serveur',
  TIMEOUT: 'La requête a expiré',
  UNAUTHORIZED: 'Vous devez vous connecter pour accéder à cette ressource',
  FORBIDDEN: 'Vous n\'avez pas les permissions nécessaires',
  NOT_FOUND: 'Ressource introuvable',
  SERVER_ERROR: 'Erreur serveur, veuillez réessayer plus tard',
  VALIDATION: 'Les données fournies sont invalides',
  UNKNOWN: 'Une erreur inattendue s\'est produite',
};

// =============================================================================
// CONFIGURATION DE LA PAGINATION
// =============================================================================

export const PAGINATION_CONFIG = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 12,
  LIMITS: [6, 12, 24, 48],
  MAX_LIMIT: 100,
};

// =============================================================================
// CONFIGURATION DU CACHE
// =============================================================================

export const CACHE_CONFIG = {
  // Durées de cache par type de ressource (en ms)
  DURATIONS: {
    METADATA: 24 * 60 * 60 * 1000, // 24 heures
    USER_PROFILE: 10 * 60 * 1000,   // 10 minutes
    OEUVRES_LIST: 5 * 60 * 1000,    // 5 minutes
    OEUVRE_DETAIL: 10 * 60 * 1000,  // 10 minutes
    SEARCH_RESULTS: 2 * 60 * 1000,  // 2 minutes
    STATISTICS: 15 * 60 * 1000,     // 15 minutes
  },
  
  // Clés de cache
  KEYS: {
    METADATA: 'cache_metadata',
    USER: 'cache_user',
    OEUVRES: 'cache_oeuvres',
    EVENEMENTS: 'cache_evenements',
    PATRIMOINE: 'cache_patrimoine',
  }
};

// =============================================================================
// CONFIGURATION DES UPLOADS
// =============================================================================

export const UPLOAD_CONFIG = {
  // Tailles maximales (en octets)
  MAX_SIZE: {
    IMAGE: 5 * 1024 * 1024,      // 5 MB
    DOCUMENT: 10 * 1024 * 1024,  // 10 MB
    VIDEO: 100 * 1024 * 1024,    // 100 MB
    AUDIO: 20 * 1024 * 1024,     // 20 MB
  },
  
  // Types MIME acceptés
  ACCEPTED_TYPES: {
    IMAGE: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    DOCUMENT: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    VIDEO: ['video/mp4', 'video/mpeg', 'video/quicktime'],
    AUDIO: ['audio/mpeg', 'audio/wav', 'audio/ogg'],
  },
  
  // Extensions acceptées
  ACCEPTED_EXTENSIONS: {
    IMAGE: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
    DOCUMENT: ['.pdf', '.doc', '.docx'],
    VIDEO: ['.mp4', '.mpeg', '.mov'],
    AUDIO: ['.mp3', '.wav', '.ogg'],
  }
};

// =============================================================================
// EXPORT PAR DÉFAUT
// =============================================================================

export default {
  API_CONFIG,
  API_ENDPOINTS,
  DEFAULT_HEADERS,
  HTTP_STATUS,
  ERROR_MESSAGES,
  PAGINATION_CONFIG,
  CACHE_CONFIG,
  UPLOAD_CONFIG,
};