
import { API_ENDPOINTS, type PaginatedResponse } from '../../config/api'; // ✅ Import correct
import type { 
  Evenement, 
  CreateEvenementData, 
  EvenementFilters,
  InscriptionEvenementData,
  StatutEvenement
} from '../../types/event';
import type { User } from '../../types/user';
import { apiClient } from './client';
export class EvenementService {
  constructor(private client = apiClient) {}

  // ✅ Réutiliser les mêmes helpers que OeuvreService
  private normalizeListResponse<T>(response: any): PaginatedResponse<T> {
    if (response.data && response.data.items) {
      return response;
    }
    
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
    
    if (Array.isArray(response)) {
      return {
        data: {
          items: response,
          pagination: { page: 1, limit: response.length, total: response.length, pages: 1 }
        }
      };
    }
    
    return {
      data: {
        items: [],
        pagination: { page: 1, limit: 10, total: 0, pages: 0 }
      }
    };
  }

  private extractArrayFromResponse<T>(response: any, possibleKeys: string[] = []): T[] {
    if (Array.isArray(response)) return response;
    if (response.data?.items && Array.isArray(response.data.items)) return response.data.items;
    
    const allKeys = [...possibleKeys, 'evenements', 'events', 'items', 'data', 'results'];
    
    for (const key of allKeys) {
      if (response[key] && Array.isArray(response[key])) {
        return response[key];
      }
    }
    
    return [];
  }

  async getAll(filters: EvenementFilters & { page?: number; limit?: number } = {}): Promise<PaginatedResponse<Evenement>> {
    try {
      console.log('🎭 Récupération des événements...', filters);
      
      const response = await this.client.get<any>(
        API_ENDPOINTS.EVENEMENTS.BASE, 
        filters,
        { cache: true }
      );
      
      const normalizedResponse = this.normalizeListResponse<Evenement>(response);
      console.log(`✅ ${normalizedResponse.data.items.length} événements récupérés`);
      return normalizedResponse;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des événements:', error);
      throw error;
    }
  }

  async getUpcoming(limit: number = 10, wilaya?: number): Promise<Evenement[]> {
    try {
      console.log(`📅 Récupération des événements à venir (${limit})...`);
      
      const params: any = { limit };
      if (wilaya) params.wilaya = wilaya;
      
      const response = await this.client.get<any>(
        API_ENDPOINTS.EVENEMENTS.UPCOMING,
        params,
        { cache: true }
      );
      
      const evenements = this.extractArrayFromResponse<Evenement>(response, ['evenements']);
      console.log(`✅ ${evenements.length} événements à venir récupérés`);
      return evenements;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des événements à venir:', error);
      return [];
    }
  }

  async getById(id: number): Promise<Evenement> {
    try {
      console.log(`🎪 Récupération de l'événement ${id}...`);
      
      const response = await this.client.get<Evenement>(
        API_ENDPOINTS.EVENEMENTS.BY_ID(id),
        undefined,
        { cache: true }
      );
      
      console.log(`✅ Événement "${response.nom_evenement}" récupéré`);
      return response;
    } catch (error) {
      console.error(`❌ Erreur lors de la récupération de l'événement ${id}:`, error);
      throw error;
    }
  }

  async create(data: CreateEvenementData): Promise<Evenement> {
    try {
      console.log('🎯 Création d\'un nouvel événement...', data.nom_evenement);
      
      const response = await this.client.post<Evenement>(
        API_ENDPOINTS.EVENEMENTS.BASE, 
        data
      );
      
      console.log(`✅ Événement "${response.nom_evenement}" créé avec l'ID ${response.id_evenement}`);
      return response;
    } catch (error) {
      console.error('❌ Erreur lors de la création de l\'événement:', error);
      throw error;
    }
  }

  async update(id: number, data: Partial<CreateEvenementData>): Promise<Evenement> {
    try {
      console.log(`📝 Mise à jour de l'événement ${id}...`);
      
      const response = await this.client.put<Evenement>(
        API_ENDPOINTS.EVENEMENTS.BY_ID(id), 
        data
      );
      
      console.log(`✅ Événement "${response.nom_evenement}" mis à jour`);
      return response;
    } catch (error) {
      console.error(`❌ Erreur lors de la mise à jour de l'événement ${id}:`, error);
      throw error;
    }
  }

  async delete(id: number): Promise<void> {
    try {
      console.log(`🗑️ Suppression de l'événement ${id}...`);
      
      await this.client.delete<void>(API_ENDPOINTS.EVENEMENTS.BY_ID(id));
      
      console.log(`✅ Événement ${id} supprimé`);
    } catch (error) {
      console.error(`❌ Erreur lors de la suppression de l'événement ${id}:`, error);
      throw error;
    }
  }

  async search(query: string, filters: EvenementFilters = {}): Promise<Evenement[]> {
    try {
      console.log(`🔍 Recherche d'événements: "${query}"...`);
      
      const response = await this.client.get<any>(
        API_ENDPOINTS.EVENEMENTS.SEARCH, 
        { q: query, ...filters },
        { cache: true }
      );
      
      const evenements = this.extractArrayFromResponse<Evenement>(response, ['evenements', 'results']);
      console.log(`✅ ${evenements.length} événements trouvés`);
      return evenements;
    } catch (error) {
      console.error('❌ Erreur lors de la recherche d\'événements:', error);
      return [];
    }
  }

  async getMyEvents(filters: EvenementFilters = {}): Promise<Evenement[]> {
    try {
      console.log('👤 Récupération de mes événements...');
      
      const response = await this.client.get<any>(
        API_ENDPOINTS.EVENEMENTS.MY_EVENTS,
        filters,
        { cache: true }
      );
      
      const evenements = this.extractArrayFromResponse<Evenement>(response, ['evenements']);
      console.log(`✅ ${evenements.length} de mes événements trouvés`);
      return evenements;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération de mes événements:', error);
      return [];
    }
  }

  async inscrire(id: number, data: InscriptionEvenementData = {}): Promise<void> {
    try {
      console.log(`✍️ Inscription à l'événement ${id}...`);
      
      await this.client.post<void>(
        API_ENDPOINTS.EVENEMENTS.INSCRIPTION(id),
        data
      );
      
      console.log(`✅ Inscription à l'événement ${id} réussie`);
    } catch (error) {
      console.error(`❌ Erreur lors de l'inscription à l'événement ${id}:`, error);
      throw error;
    }
  }

  async desinscrire(id: number): Promise<void> {
    try {
      console.log(`❌ Désinscription de l'événement ${id}...`);
      
      await this.client.delete<void>(
        API_ENDPOINTS.EVENEMENTS.INSCRIPTION(id)
      );
      
      console.log(`✅ Désinscription de l'événement ${id} réussie`);
    } catch (error) {
      console.error(`❌ Erreur lors de la désinscription de l'événement ${id}:`, error);
      throw error;
    }
  }

  async getParticipants(id: number): Promise<User[]> {
    try {
      console.log(`👥 Récupération des participants de l'événement ${id}...`);
      
      const response = await this.client.get<any>(
        API_ENDPOINTS.EVENEMENTS.PARTICIPANTS(id),
        undefined,
        { cache: false }
      );
      
      const participants = this.extractArrayFromResponse<User>(response, ['participants', 'users']);
      console.log(`✅ ${participants.length} participants récupérés`);
      return participants;
    } catch (error) {
      console.error(`❌ Erreur lors de la récupération des participants de l'événement ${id}:`, error);
      return [];
    }
  }

  async getStatistics(): Promise<any> {
    try {
      console.log('📊 Récupération des statistiques des événements...');
      
      const response = await this.client.get<any>(
        API_ENDPOINTS.EVENEMENTS.STATISTICS,
        undefined,
        { cache: true }
      );
      
      console.log('✅ Statistiques des événements récupérées');
      return response;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des statistiques:', error);
      throw error;
    }
  }

  async getSuggestions(query: string, limit: number = 5): Promise<Evenement[]> {
    try {
      if (query.length < 2) return [];
      
      const response = await this.client.get<any>(
        API_ENDPOINTS.EVENEMENTS.SUGGESTIONS,
        { q: query, limit },
        { cache: true }
      );
      
      return this.extractArrayFromResponse<Evenement>(response, ['evenements', 'suggestions']);
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des suggestions:', error);
      return [];
    }
  }
}

export const evenementService = new EvenementService();