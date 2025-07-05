// src/services/api/client.ts - Client HTTP unifié CORRIGÉ
import { API_CONFIG, ApiResponse } from '../../config/api';

interface RequestConfig {
  timeout?: number;
  retries?: number;
  cache?: boolean;
  skipAuth?: boolean;
}

interface CacheEntry {
  data: any;
  timestamp: number;
}

export class ApiClient {
  private baseURL: string;
  private token: string | null = null;
  private cache = new Map<string, CacheEntry>();

  constructor(baseURL?: string) {
    this.baseURL = baseURL || API_CONFIG.BASE_URL;
    this.token = this.getStoredToken();
    
    if (import.meta.env.DEV) {
      console.log(`🔗 API Client initialisé sur: ${this.baseURL}`);
    }
  }

  // ==========================================================================
  // GESTION DES TOKENS (inchangée)
  // ==========================================================================

  private getStoredToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(API_CONFIG.TOKEN_KEY);
  }

  setToken(token: string): void {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem(API_CONFIG.TOKEN_KEY, token);
    }
  }

  clearToken(): void {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem(API_CONFIG.TOKEN_KEY);
    }
  }

  private isTokenValid(): boolean {
    if (!this.token) return false;
    try {
      const parts = this.token.split('.');
      if (parts.length !== 3) return false;
      
      const payload = JSON.parse(atob(parts[1]));
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  }

  // ==========================================================================
  // GESTION DU CACHE (inchangée)
  // ==========================================================================

  private getCacheKey(url: string, params?: any): string {
    const query = params ? new URLSearchParams(params).toString() : '';
    return `${url}${query ? '?' + query : ''}`;
  }

  private getFromCache<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    if (Date.now() - cached.timestamp > API_CONFIG.CACHE_TTL) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }

  private setCache(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  clearCache(): void {
    this.cache.clear();
  }

  // ==========================================================================
  // MÉTHODE PRINCIPALE DE REQUÊTE - CORRIGÉE
  // ==========================================================================

  private async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
    endpoint: string,
    data?: any,
    config: RequestConfig = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    if (import.meta.env.DEV) {
      console.log(`🔗 Construction URL: ${this.baseURL} + ${endpoint} = ${url}`);
    }

    // Vérification du cache pour GET
    if (method === 'GET' && config.cache !== false) {
      const cacheKey = this.getCacheKey(endpoint, data);
      const cached = this.getFromCache<T>(cacheKey);
      if (cached) {
        if (import.meta.env.DEV) {
          console.log(`📦 Cache hit: ${endpoint}`);
        }
        return cached;
      }
    }

    // Vérification du token
    if (!config.skipAuth && this.token) {
      if (!this.isTokenValid()) {
        this.clearToken();
        if (import.meta.env.DEV) {
          console.log(`⚠️ Token expiré détecté pour ${endpoint}, nettoyage du token`);
        }
      }
    }

    // Construction des headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.token && !config.skipAuth && this.isTokenValid()) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    // Configuration de la requête
    const requestOptions: RequestInit = {
      method,
      headers,
    };

    if ('AbortSignal' in window && AbortSignal.timeout) {
      requestOptions.signal = AbortSignal.timeout(config.timeout || API_CONFIG.TIMEOUT);
    }

    if (data && method !== 'GET') {
      requestOptions.body = JSON.stringify(data);
    }

    // Ajout des paramètres pour GET
    let finalUrl = url;
    if (data && method === 'GET') {
      const params = new URLSearchParams(data).toString();
      finalUrl = `${url}${params ? '?' + params : ''}`;
    }

    // Exécution de la requête
    try {
      const response = await fetch(finalUrl, requestOptions);
      return this.handleResponse<T>(response, method, endpoint, data, config);
    } catch (error) {
      return this.handleError(error, config);
    }
  }

  // ==========================================================================
  // GESTION DES RÉPONSES ET ERREURS - CORRIGÉE
  // ==========================================================================

  private async handleResponse<T>(
    response: Response,
    method: string,
    endpoint: string,
    data: any,
    config: RequestConfig
  ): Promise<T> {
    if (import.meta.env.DEV) {
      console.log(`${this.getMethodEmoji(method)} ${method} ${endpoint} - ${response.status}`);
    }

    // ✅ GESTION SPÉCIFIQUE DES CODES D'ERREUR
    if (!response.ok) {
      // 401 - Non autorisé
      if (response.status === 401) {
        if (this.token) {
          this.clearToken();
          if (import.meta.env.DEV) {
            console.log('🔑 401 Unauthorized - Token nettoyé');
          }
        }
        throw new Error('Session expirée. Veuillez vous reconnecter.');
      }
      
      // 403 - Interdit
      if (response.status === 403) {
        throw new Error('Vous n\'avez pas les permissions nécessaires.');
      }
      
      // ✅ 404 - Ressource introuvable (message spécifique pour debug)
      if (response.status === 404) {
        const errorMessage = `Ressource introuvable: ${method} ${endpoint}`;
        if (import.meta.env.DEV) {
          console.warn(`🔍 404 Not Found: ${endpoint} - Cet endpoint n'existe peut-être pas côté backend`);
        }
        throw new Error(errorMessage);
      }

      // 422 - Erreur de validation
      if (response.status === 422) {
        try {
          const errorData = await response.json();
          const validationErrors = errorData.errors || errorData.details || {};
          const errorMessages = Object.values(validationErrors).flat();
          throw new Error(`Erreur de validation: ${errorMessages.join(', ')}`);
        } catch {
          throw new Error('Erreur de validation des données');
        }
      }

      // 429 - Trop de requêtes
      if (response.status === 429) {
        throw new Error('Trop de requêtes. Veuillez patienter avant de réessayer.');
      }

      // 500+ - Erreurs serveur
      if (response.status >= 500) {
        throw new Error('Erreur serveur. Veuillez réessayer plus tard.');
      }
      
      // Autres erreurs - essayer de récupérer le message du serveur
      try {
        const errorData = await response.json();
        const errorMessage = errorData.error || errorData.message || errorData.details || `Erreur HTTP: ${response.status}`;
        throw new Error(errorMessage);
      } catch {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }
    }

    // ✅ GESTION DU CONTENT-TYPE AVEC PLUS DE FLEXIBILITÉ
    const contentType = response.headers.get('content-type');
    
    // Si pas de content-type ou pas JSON, vérifier s'il y a du contenu
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      
      // Si pas de contenu (204 No Content), retourner un objet vide
      if (!text) {
        return {} as T;
      }
      
      // Essayer de parser en JSON quand même (certaines APIs ne définissent pas le bon content-type)
      try {
        const parsed = JSON.parse(text);
        return this.processJsonResponse<T>(parsed, method, endpoint, data, config);
      } catch {
        // Si ça n'est vraiment pas du JSON, erreur
        throw new Error(`Réponse inattendue du serveur. Content-Type: ${contentType || 'undefined'}`);
      }
    }

    // Traitement de la réponse JSON
    try {
      const result = await response.json();
      return this.processJsonResponse<T>(result, method, endpoint, data, config);
    } catch (parseError) {
      throw new Error('Impossible de parser la réponse JSON du serveur');
    }
  }

  // ✅ NOUVELLE MÉTHODE : Traitement unifié des réponses JSON
  private processJsonResponse<T>(
    result: any,
    method: string,
    endpoint: string,
    data: any,
    config: RequestConfig
  ): T {
    // ✅ GESTION FLEXIBLE DES FORMATS DE RÉPONSE
    
    // Format API standard : { success: true, data: ... }
    if (typeof result === 'object' && result.success !== undefined) {
      if (!result.success) {
        throw new Error(result.error || result.message || 'Erreur serveur');
      }
      
      const responseData = result.data !== undefined ? result.data : result;
      
      // Mise en cache pour GET
      if (method === 'GET' && config.cache !== false) {
        const cacheKey = this.getCacheKey(endpoint, data);
        this.setCache(cacheKey, responseData);
      }
      
      return responseData;
    }
    
    // ✅ Format direct (pas d'enveloppe success/data) - NOUVEAU
    // Beaucoup d'APIs retournent directement les données sans enveloppe
    if (result !== null && result !== undefined) {
      // Mise en cache pour GET
      if (method === 'GET' && config.cache !== false) {
        const cacheKey = this.getCacheKey(endpoint, data);
        this.setCache(cacheKey, result);
      }
      
      return result;
    }
    
    // Cas où result est null/undefined
    throw new Error('Réponse vide du serveur');
  }

  private handleError<T>(error: any, config: RequestConfig): Promise<T> {
    if (error.name === 'AbortError') {
      throw new Error('Délai d\'attente dépassé');
    }
    
    if (error instanceof Error) {
      throw error;
    }
    
    throw new Error('Erreur de connexion au serveur');
  }

  private getMethodEmoji(method: string): string {
    switch (method) {
      case 'GET': return '📖';
      case 'POST': return '➕';
      case 'PUT': return '✏️';
      case 'DELETE': return '🗑️';
      case 'PATCH': return '🔧';
      default: return '🌐';
    }
  }

  // ==========================================================================
  // MÉTHODES PUBLIQUES - CORRIGÉES
  // ==========================================================================

  // ✅ CORRIGÉ : GET ne devrait pas skipAuth par défaut
  async get<T>(endpoint: string, params?: any, config?: RequestConfig): Promise<T> {
    return this.request<T>('GET', endpoint, params, { cache: true, ...config });
  }

  async post<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.request<T>('POST', endpoint, data, { ...config, cache: false });
  }

  async put<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.request<T>('PUT', endpoint, data, { ...config, cache: false });
  }

  async delete<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.request<T>('DELETE', endpoint, undefined, { ...config, cache: false });
  }

  async patch<T>(endpoint: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.request<T>('PATCH', endpoint, data, { ...config, cache: false });
  }

  // ==========================================================================
  // UPLOAD DE FICHIERS - CORRIGÉ
  // ==========================================================================

  async uploadFile(endpoint: string, file: File, additionalData?: Record<string, any>): Promise<any> {
    const url = `${this.baseURL}${endpoint}`;
    
    const formData = new FormData();
    formData.append('file', file);
    
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
    }

    const headers: Record<string, string> = {};
    if (this.token && this.isTokenValid()) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      if (import.meta.env.DEV) {
        console.log(`📤 Upload: ${file.name} vers ${endpoint}`);
      }

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Erreur upload: ${response.status}`);
      }

      // ✅ Utiliser la même logique de traitement que pour les autres réponses
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        const result = await response.json();
        return this.processJsonResponse(result, 'POST', endpoint, formData, {});
      } else {
        // Réponse non-JSON pour upload
        const text = await response.text();
        return text ? JSON.parse(text) : {};
      }
    } catch (error) {
      throw error instanceof Error ? error : new Error('Erreur upload');
    }
  }

  // ==========================================================================
  // MÉTHODES UTILITAIRES - AMÉLIORÉES
  // ==========================================================================

  async healthCheck(): Promise<boolean> {
    try {
      await this.get('/health', undefined, { skipAuth: true, cache: false });
      return true;
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn('❤️ Health check failed:', error);
      }
      return false;
    }
  }

  getInfo(): { baseURL: string; hasToken: boolean; cacheSize: number } {
    return {
      baseURL: this.baseURL,
      hasToken: !!this.token && this.isTokenValid(),
      cacheSize: this.cache.size,
    };
  }

  // ✅ NOUVELLE MÉTHODE : Tester plusieurs endpoints
  async tryEndpoints<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
    endpoints: string[],
    data?: any,
    config?: RequestConfig
  ): Promise<{ result: T; usedEndpoint: string }> {
    let lastError: any;
    
    for (const endpoint of endpoints) {
      try {
        const result = await this.request<T>(method, endpoint, data, config);
        return { result, usedEndpoint: endpoint };
      } catch (error: any) {
        lastError = error;
        
        // Si c'est une 404, essayer l'endpoint suivant
        if (error.message?.includes('404') || error.message?.includes('introuvable')) {
          if (import.meta.env.DEV) {
            console.warn(`⚠️ Endpoint ${endpoint} non trouvé, essai suivant...`);
          }
          continue;
        }
        
        // Pour les autres erreurs, arrêter les tentatives
        throw error;
      }
    }
    
    throw lastError || new Error('Tous les endpoints ont échoué');
  }

  // ✅ NOUVELLE MÉTHODE : GET avec fallback d'endpoints
  async getWithFallback<T>(
    endpoints: string[],
    params?: any,
    config?: RequestConfig
  ): Promise<{ result: T; usedEndpoint: string }> {
    return this.tryEndpoints<T>('GET', endpoints, params, { cache: true, ...config });
  }

  /**
   * Synchronise le token depuis le localStorage (à appeler après login si besoin)
   */
  static syncTokenFromStorage() {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem(API_CONFIG.TOKEN_KEY);
      if (token) {
        ApiClient.prototype.setToken.call(ApiClient.prototype, token);
      }
    }
  }
}

// Instance singleton exportée
export const apiClient = new ApiClient();