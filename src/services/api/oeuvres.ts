
// src/services/api/oeuvres.ts - CORRIGÉ pour gérer les formats réels
import { apiClient } from './client';
import { API_ENDPOINTS, type PaginatedResponse } from '../../config/api'; // ✅ Import correct
import type { 
  Oeuvre, 
  CreateOeuvreData, 
  UpdateOeuvreData, 
  OeuvreFilters,
  ValidationOeuvreData,
  SearchOeuvresParams,
} from '../../types/oeuvre';
export class OeuvreService {
  constructor(private client = apiClient) {}

  // ✅ HELPER : Normaliser les réponses en format attendu
  private normalizeListResponse<T>(response: any, itemsKey: string = 'items'): PaginatedResponse<T> {
    // Format déjà correct : { data: { items: [], pagination: {} } }
    if (response.data && response.data.items) {
      return response;
    }
    
    // Format backend: { oeuvres: [], pagination: {} } ou { evenements: [], pagination: {} }
    const dataKey = Object.keys(response).find(key => 
      Array.isArray(response[key]) && !['pagination', 'meta'].includes(key)
    );
    
    if (dataKey && Array.isArray(response[dataKey])) {
      const items = response[dataKey];
      const pagination = response.pagination || response.meta || {};
      
      return {
        data: {
          items,
          pagination: {
            page: pagination.page || 1,
            limit: pagination.limit || items.length,
            total: pagination.total || items.length,
            pages: pagination.pages || pagination.totalPages || Math.ceil((pagination.total || items.length) / (pagination.limit || items.length || 1))
          }
        }
      };
    }
    
    // Format array simple: [...]
    if (Array.isArray(response)) {
      return {
        data: {
          items: response,
          pagination: {
            page: 1,
            limit: response.length,
            total: response.length,
            pages: 1
          }
        }
      };
    }
    
    // Format inattendu - retourner vide
    console.warn('⚠️ Format de réponse inattendu:', response);
    return {
      data: {
        items: [],
        pagination: { page: 1, limit: 10, total: 0, pages: 0 }
      }
    };
  }

  // ✅ HELPER : Extraire un tableau d'items d'une réponse
  private extractArrayFromResponse<T>(response: any, possibleKeys: string[] = []): T[] {
    // Si c'est déjà un tableau
    if (Array.isArray(response)) {
      return response;
    }
    
    // Si c'est dans response.data.items
    if (response.data?.items && Array.isArray(response.data.items)) {
      return response.data.items;
    }
    
    // Chercher dans les clés possibles
    const allKeys = [...possibleKeys, 'oeuvres', 'evenements', 'sites', 'lieux', 'items', 'data', 'results'];
    
    for (const key of allKeys) {
      if (response[key] && Array.isArray(response[key])) {
        return response[key];
      }
    }
    
    // Rien trouvé
    console.warn('⚠️ Impossible d\'extraire un tableau de:', response);
    return [];
  }

  async getAll(filters: OeuvreFilters & { page?: number; limit?: number } = {}): Promise<PaginatedResponse<Oeuvre>> {
    try {
      console.log('📚 Récupération des œuvres...', filters);
      
      const response = await this.client.get<any>(
        API_ENDPOINTS.OEUVRES.BASE, 
        filters,
        { cache: true }
      );
      
      const normalizedResponse = this.normalizeListResponse<Oeuvre>(response);
      console.log(`✅ ${normalizedResponse.data.items.length} œuvres récupérées`);
      return normalizedResponse;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des œuvres:', error);
      throw error;
    }
  }

  async getRecent(limit: number = 10): Promise<Oeuvre[]> {
    try {
      console.log(`🆕 Récupération des œuvres récentes (${limit})...`);
      
      const response = await this.client.get<any>(
        API_ENDPOINTS.OEUVRES.RECENT,
        { limit },
        { cache: true }
      );
      
      const oeuvres = this.extractArrayFromResponse<Oeuvre>(response, ['oeuvres']);
      console.log(`✅ ${oeuvres.length} œuvres récentes récupérées`);
      return oeuvres;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des œuvres récentes:', error);
      return []; // Retourner un tableau vide plutôt que throw pour éviter de casser l'UI
    }
  }

  async getPopular(limit: number = 10): Promise<Oeuvre[]> {
    try {
      console.log(`📈 Récupération des œuvres populaires (${limit})...`);
      
      const response = await this.client.get<any>(
        API_ENDPOINTS.OEUVRES.POPULAR,
        { limit },
        { cache: true }
      );
      
      const oeuvres = this.extractArrayFromResponse<Oeuvre>(response, ['oeuvres']);
      console.log(`✅ ${oeuvres.length} œuvres populaires récupérées`);
      return oeuvres;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des œuvres populaires:', error);
      return [];
    }
  }

  async getById(id: number): Promise<Oeuvre> {
    try {
      console.log(`📖 Récupération de l'œuvre ${id}...`);
      
      const response = await this.client.get<Oeuvre>(
        API_ENDPOINTS.OEUVRES.BY_ID(id),
        undefined,
        { cache: true }
      );
      
      console.log(`✅ Œuvre "${response.titre}" récupérée`);
      return response;
    } catch (error) {
      console.error(`❌ Erreur lors de la récupération de l'œuvre ${id}:`, error);
      throw error;
    }
  }

  async create(data: CreateOeuvreData): Promise<Oeuvre> {
    try {
      console.log('✏️ Création d\'une nouvelle œuvre...', data.titre);
      
      const response = await this.client.post<Oeuvre>(
        API_ENDPOINTS.OEUVRES.BASE, 
        data
      );
      
      console.log(`✅ Œuvre "${response.titre}" créée avec l'ID ${response.id_oeuvre}`);
      return response;
    } catch (error) {
      console.error('❌ Erreur lors de la création de l\'œuvre:', error);
      throw error;
    }
  }

  async update(id: number, data: UpdateOeuvreData): Promise<Oeuvre> {
    try {
      console.log(`📝 Mise à jour de l'œuvre ${id}...`);
      
      const response = await this.client.put<Oeuvre>(
        API_ENDPOINTS.OEUVRES.BY_ID(id), 
        data
      );
      
      console.log(`✅ Œuvre "${response.titre}" mise à jour`);
      return response;
    } catch (error) {
      console.error(`❌ Erreur lors de la mise à jour de l'œuvre ${id}:`, error);
      throw error;
    }
  }

  async delete(id: number): Promise<void> {
    try {
      console.log(`🗑️ Suppression de l'œuvre ${id}...`);
      
      await this.client.delete<void>(API_ENDPOINTS.OEUVRES.BY_ID(id));
      
      console.log(`✅ Œuvre ${id} supprimée`);
    } catch (error) {
      console.error(`❌ Erreur lors de la suppression de l'œuvre ${id}:`, error);
      throw error;
    }
  }

  async search(query: string, filters: OeuvreFilters = {}): Promise<Oeuvre[]> {
    try {
      console.log(`🔍 Recherche d'œuvres: "${query}"...`);
      
      const response = await this.client.get<any>(
        API_ENDPOINTS.OEUVRES.SEARCH, 
        { q: query, ...filters },
        { cache: true }
      );
      
      const oeuvres = this.extractArrayFromResponse<Oeuvre>(response, ['oeuvres', 'results']);
      console.log(`✅ ${oeuvres.length} œuvres trouvées`);
      return oeuvres;
    } catch (error) {
      console.error('❌ Erreur lors de la recherche d\'œuvres:', error);
      return [];
    }
  }

  async getMyOeuvres(filters: OeuvreFilters = {}): Promise<Oeuvre[]> {
    try {
      console.log('👤 Récupération de mes œuvres...');
      
      const response = await this.client.get<any>(
        API_ENDPOINTS.OEUVRES.MY_OEUVRES, 
        filters,
        { cache: true }
      );
      
      const oeuvres = this.extractArrayFromResponse<Oeuvre>(response, ['oeuvres']);
      console.log(`✅ ${oeuvres.length} de mes œuvres trouvées`);
      return oeuvres;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération de mes œuvres:', error);
      return [];
    }
  }

  async validate(id: number, data: ValidationOeuvreData): Promise<void> {
    try {
      console.log(`✅ Validation de l'œuvre ${id}...`, data.statut);
      
      await this.client.post<void>(
        API_ENDPOINTS.OEUVRES.VALIDATE(id), 
        data
      );
      
      console.log(`✅ Œuvre ${id} ${data.statut === 'publie' ? 'validée' : 'rejetée'}`);
    } catch (error) {
      console.error(`❌ Erreur lors de la validation de l'œuvre ${id}:`, error);
      throw error;
    }
  }

  async getPendingValidation(filters: { page?: number; limit?: number } = {}): Promise<PaginatedResponse<Oeuvre>> {
    try {
      console.log('⏳ Récupération des œuvres en attente de validation...');
      
      const response = await this.client.get<any>(
        API_ENDPOINTS.OEUVRES.BASE,
        { ...filters, statut: 'en_attente' },
        { cache: false }
      );
      
      const normalizedResponse = this.normalizeListResponse<Oeuvre>(response);
      console.log(`✅ ${normalizedResponse.data.items.length} œuvres en attente trouvées`);
      return normalizedResponse;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des œuvres en attente:', error);
      throw error;
    }
  }

  async getStatistics(): Promise<any> {
    try {
      console.log('📊 Récupération des statistiques des œuvres...');
      
      const response = await this.client.get<any>(
        API_ENDPOINTS.OEUVRES.STATISTICS,
        undefined,
        { cache: true }
      );
      
      console.log('✅ Statistiques des œuvres récupérées');
      return response;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des statistiques:', error);
      throw error;
    }
  }

  async getSuggestions(query: string, limit: number = 5): Promise<Oeuvre[]> {
    try {
      if (query.length < 2) return [];
      
      const response = await this.client.get<any>(
        API_ENDPOINTS.OEUVRES.SUGGESTIONS,
        { q: query, limit },
        { cache: true }
      );
      
      return this.extractArrayFromResponse<Oeuvre>(response, ['oeuvres', 'suggestions']);
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des suggestions:', error);
      return [];
    }
  }

  // ... Méthodes pour les types spécifiques (inchangées)
  async createLivreDetails(oeuvreId: number, livreData: any): Promise<any> {
    return this.client.post(`${API_ENDPOINTS.OEUVRES.BASE}/${oeuvreId}/livre`, livreData);
  }

  async createFilmDetails(oeuvreId: number, filmData: any): Promise<any> {
    return this.client.post(`${API_ENDPOINTS.OEUVRES.BASE}/${oeuvreId}/film`, filmData);
  }

  async createAlbumDetails(oeuvreId: number, albumData: any): Promise<any> {
    return this.client.post(`${API_ENDPOINTS.OEUVRES.BASE}/${oeuvreId}/album`, albumData);
  }

  async createArticleDetails(oeuvreId: number, articleData: any): Promise<any> {
    return this.client.post(`${API_ENDPOINTS.OEUVRES.BASE}/${oeuvreId}/article`, articleData);
  }

  async createArticleScientifiqueDetails(oeuvreId: number, articleSciData: any): Promise<any> {
    return this.client.post(`${API_ENDPOINTS.OEUVRES.BASE}/${oeuvreId}/article-scientifique`, articleSciData);
  }

  async createArtisanatDetails(oeuvreId: number, artisanatData: any): Promise<any> {
    return this.client.post(`${API_ENDPOINTS.OEUVRES.BASE}/${oeuvreId}/artisanat`, artisanatData);
  }

  async createOeuvreArtDetails(oeuvreId: number, oeuvreArtData: any): Promise<any> {
    return this.client.post(`${API_ENDPOINTS.OEUVRES.BASE}/${oeuvreId}/oeuvre-art`, oeuvreArtData);
  }

  async getOeuvresByType(type: string, filters: OeuvreFilters = {}): Promise<Oeuvre[]> {
    try {
      console.log(`📂 Récupération des œuvres de type "${type}"...`);
      
      const response = await this.client.get<any>(
        API_ENDPOINTS.OEUVRES.BY_TYPE(type),
        filters,
        { cache: true }
      );
      
      const oeuvres = this.extractArrayFromResponse<Oeuvre>(response, ['oeuvres']);
      console.log(`✅ ${oeuvres.length} œuvres de type "${type}" récupérées`);
      return oeuvres;
    } catch (error) {
      console.error(`❌ Erreur lors de la récupération des œuvres de type "${type}":`, error);
      return [];
    }
  }
}

export const oeuvreService = new OeuvreService();