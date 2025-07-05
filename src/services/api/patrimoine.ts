// =============================================================================
// SERVICE PATRIMOINE - CORRIGÉ avec fallback d'endpoints et imports
// =============================================================================

import { API_ENDPOINTS, type PaginatedResponse } from '../../config/api'; // ✅ CORRIGÉ : import unifié
import type { 
  Lieu, 
  CreateLieuData, 
  LieuFilters,
  PatrimoineSearchParams,
  ProximiteFilters,
  TypePatrimoine,
  TypeMonument,
  TypeVestige
} from '../../types/place';
import { apiClient } from './client';

export class PatrimoineService {
  constructor(private client = apiClient) {}

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
    
    const allKeys = [...possibleKeys, 'sites', 'lieux', 'patrimoine', 'items', 'data', 'results'];
    
    for (const key of allKeys) {
      if (response[key] && Array.isArray(response[key])) {
        return response[key];
      }
    }
    
    return [];
  }

  // ✅ CORRIGÉ : Essayer différents endpoints avec fallback
  async getAllSites(filters: LieuFilters & { page?: number; limit?: number } = {}): Promise<PaginatedResponse<Lieu>> {
    try {
      console.log('🏛️ Récupération des sites patrimoniaux...', filters);
      
      // ✅ Essayer différents endpoints dans l'ordre de préférence
      const endpoints = [
        API_ENDPOINTS.PATRIMOINE.SITES,    // /patrimoine/sites
        API_ENDPOINTS.PATRIMOINE.BASE      // /patrimoine
      ];
      
      let response: any;
      let lastError: any;
      
      for (const endpoint of endpoints) {
        try {
          console.log(`📡 Tentative avec endpoint: ${endpoint}`);
          response = await this.client.get<any>(endpoint, filters, { cache: true });
          break; // Succès, sortir de la boucle
        } catch (error: any) {
          lastError = error;
          console.warn(`⚠️ Endpoint ${endpoint} failed:`, error.message);
          
          // Si c'est une 404, essayer le suivant
          if (error.message?.includes('404') || error.message?.includes('introuvable')) {
            continue;
          }
          // Pour les autres erreurs, relancer
          throw error;
        }
      }
      
      if (!response) {
        throw lastError || new Error('Tous les endpoints ont échoué');
      }
      
      const normalizedResponse = this.normalizeListResponse<Lieu>(response);
      console.log(`✅ ${normalizedResponse.data.items.length} sites patrimoniaux récupérés`);
      return normalizedResponse;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des sites:', error);
      
      // ✅ Retourner une réponse vide plutôt que throw pour éviter de casser l'UI
      return {
        data: {
          items: [],
          pagination: { page: 1, limit: 10, total: 0, pages: 0 }
        }
      };
    }
  }

  async getSiteById(id: number): Promise<Lieu> {
    try {
      console.log(`🏺 Récupération du site patrimonial ${id}...`);
      
      // Essayer différents formats d'endpoint
      const endpoints = [
        API_ENDPOINTS.PATRIMOINE.SITE_BY_ID(id),  // /patrimoine/sites/{id}
        `${API_ENDPOINTS.PATRIMOINE.BASE}/${id}`   // /patrimoine/{id}
      ];
      
      for (const endpoint of endpoints) {
        try {
          const response = await this.client.get<Lieu>(endpoint, undefined, { cache: true });
          console.log(`✅ Site "${response.nom}" récupéré`);
          return response;
        } catch (error: any) {
          if (error.message?.includes('404')) {
            continue;
          }
          throw error;
        }
      }
      
      throw new Error(`Site ${id} introuvable`);
    } catch (error) {
      console.error(`❌ Erreur lors de la récupération du site ${id}:`, error);
      throw error;
    }
  }

  async getPopulaires(limit: number = 10): Promise<Lieu[]> {
    try {
      console.log(`⭐ Récupération des sites populaires (${limit})...`);
      
      // Essayer différents endpoints
      const endpoints = [
        API_ENDPOINTS.PATRIMOINE.POPULAIRES,      // /patrimoine/populaires
        `${API_ENDPOINTS.PATRIMOINE.BASE}/popular`, // /patrimoine/popular
        `${API_ENDPOINTS.PATRIMOINE.BASE}/sites/popular` // /patrimoine/sites/popular
      ];
      
      let response: any;
      
      for (const endpoint of endpoints) {
        try {
          response = await this.client.get<any>(endpoint, { limit }, { cache: true });
          break;
        } catch (error: any) {
          if (error.message?.includes('404')) {
            continue;
          }
          throw error;
        }
      }
      
      if (!response) {
        console.warn('⚠️ Aucun endpoint populaire trouvé, retour tableau vide');
        return [];
      }
      
      const sites = this.extractArrayFromResponse<Lieu>(response, ['sites', 'populaires', 'lieux']);
      console.log(`✅ ${sites.length} sites populaires récupérés`);
      return sites;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des sites populaires:', error);
      return [];
    }
  }

  async search(query: string, filters: PatrimoineSearchParams = {}): Promise<Lieu[]> {
    try {
      console.log(`🔍 Recherche dans le patrimoine: "${query}"...`);
      
      const response = await this.client.get<any>(
        API_ENDPOINTS.PATRIMOINE.RECHERCHE, 
        { q: query, ...filters },
        { cache: true }
      );
      
      const sites = this.extractArrayFromResponse<Lieu>(response, ['sites', 'lieux', 'results']);
      console.log(`✅ ${sites.length} sites trouvés`);
      return sites;
    } catch (error) {
      console.error('❌ Erreur lors de la recherche dans le patrimoine:', error);
      return [];
    }
  }

  async createSite(data: CreateLieuData): Promise<Lieu> {
    try {
      console.log('🏗️ Création d\'un nouveau site patrimonial...', data.nom);
      
      // Essayer sites puis base
      const endpoints = [
        API_ENDPOINTS.PATRIMOINE.SITES,
        API_ENDPOINTS.PATRIMOINE.BASE
      ];
      
      for (const endpoint of endpoints) {
        try {
          const response = await this.client.post<Lieu>(endpoint, data);
          console.log(`✅ Site "${response.nom}" créé avec l'ID ${response.id_lieu}`);
          return response;
        } catch (error: any) {
          if (error.message?.includes('404')) {
            continue;
          }
          throw error;
        }
      }
      
      throw new Error('Impossible de créer le site');
    } catch (error) {
      console.error('❌ Erreur lors de la création du site:', error);
      throw error;
    }
  }

  async getSitesProches(params: ProximiteFilters): Promise<Lieu[]> {
    try {
      console.log(`📍 Recherche de sites à proximité (${params.latitude}, ${params.longitude})...`);
      
      // Essayer différents endpoints possibles
      const endpoints = [
        API_ENDPOINTS.PATRIMOINE.PROXIMITE,           // /patrimoine/proximite
        `${API_ENDPOINTS.PATRIMOINE.BASE}/proximity`, // /patrimoine/proximity
        `${API_ENDPOINTS.PATRIMOINE.BASE}/nearby`     // /patrimoine/nearby
      ];
      
      let response: any;
      
      for (const endpoint of endpoints) {
        try {
          response = await this.client.get<any>(endpoint, params, { cache: true });
          break;
        } catch (error: any) {
          if (error.message?.includes('404')) {
            continue;
          }
          throw error;
        }
      }
      
      if (!response) {
        console.warn('⚠️ Aucun endpoint de proximité trouvé, retour tableau vide');
        return [];
      }
      
      const sites = this.extractArrayFromResponse<Lieu>(response, ['sites', 'lieux', 'nearby']);
      console.log(`✅ ${sites.length} sites trouvés à proximité`);
      return sites;
    } catch (error) {
      console.error('❌ Erreur lors de la recherche de proximité:', error);
      return [];
    }
  }

  async getSuggestions(query: string, limit: number = 5): Promise<Lieu[]> {
    try {
      if (query.length < 2) return [];
      
      const response = await this.client.get<any>(
        `${API_ENDPOINTS.PATRIMOINE.BASE}/suggestions`,
        { q: query, limit },
        { cache: true }
      );
      
      return this.extractArrayFromResponse<Lieu>(response, ['sites', 'lieux', 'suggestions']);
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des suggestions:', error);
      return [];
    }
  }

  async updateSite(id: number, data: Partial<CreateLieuData>): Promise<Lieu> {
    try {
      console.log(`📝 Mise à jour du site ${id}...`);
      
      // Essayer différents endpoints
      const endpoints = [
        API_ENDPOINTS.PATRIMOINE.SITE_BY_ID(id),  // /patrimoine/sites/{id}
        `${API_ENDPOINTS.PATRIMOINE.BASE}/${id}`   // /patrimoine/{id}
      ];
      
      for (const endpoint of endpoints) {
        try {
          const response = await this.client.put<Lieu>(endpoint, data);
          console.log(`✅ Site "${response.nom}" mis à jour`);
          return response;
        } catch (error: any) {
          if (error.message?.includes('404')) {
            continue;
          }
          throw error;
        }
      }
      
      throw new Error(`Impossible de mettre à jour le site ${id}`);
    } catch (error) {
      console.error(`❌ Erreur lors de la mise à jour du site ${id}:`, error);
      throw error;
    }
  }

  async deleteSite(id: number): Promise<void> {
    try {
      console.log(`🗑️ Suppression du site ${id}...`);
      
      // Essayer différents endpoints
      const endpoints = [
        API_ENDPOINTS.PATRIMOINE.SITE_BY_ID(id),  // /patrimoine/sites/{id}
        `${API_ENDPOINTS.PATRIMOINE.BASE}/${id}`   // /patrimoine/{id}
      ];
      
      for (const endpoint of endpoints) {
        try {
          await this.client.delete<void>(endpoint);
          console.log(`✅ Site ${id} supprimé`);
          return;
        } catch (error: any) {
          if (error.message?.includes('404')) {
            continue;
          }
          throw error;
        }
      }
      
      throw new Error(`Impossible de supprimer le site ${id}`);
    } catch (error) {
      console.error(`❌ Erreur lors de la suppression du site ${id}:`, error);
      throw error;
    }
  }

  async addMedia(siteId: number, file: File, metadata: any = {}): Promise<any> {
    try {
      console.log(`📤 Ajout d'un média au site ${siteId}...`);
      
      const response = await this.client.uploadFile(
        API_ENDPOINTS.PATRIMOINE.GALERIE(siteId),
        file,
        metadata
      );
      
      console.log(`✅ Média ajouté au site ${siteId}`);
      return response;
    } catch (error) {
      console.error(`❌ Erreur lors de l'ajout du média au site ${siteId}:`, error);
      throw error;
    }
  }

  async getGalerie(siteId: number): Promise<any[]> {
    try {
      console.log(`📸 Récupération de la galerie du site ${siteId}...`);
      
      const response = await this.client.get<any>(
        API_ENDPOINTS.PATRIMOINE.GALERIE(siteId),
        undefined,
        { cache: true }
      );
      
      const medias = this.extractArrayFromResponse<any>(response, ['medias', 'galerie', 'images']);
      console.log(`✅ ${medias.length} médias récupérés`);
      return medias;
    } catch (error) {
      console.error(`❌ Erreur lors de la récupération de la galerie du site ${siteId}:`, error);
      return [];
    }
  }

  async getStatistiques(): Promise<any> {
    try {
      console.log('📊 Récupération des statistiques du patrimoine...');
      
      const response = await this.client.get<any>(
        API_ENDPOINTS.PATRIMOINE.STATISTIQUES,
        undefined,
        { cache: true }
      );
      
      console.log('✅ Statistiques du patrimoine récupérées');
      return response;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des statistiques:', error);
      
      // Retourner des stats vides plutôt que throw
      return {
        total_sites: 0,
        sites_par_wilaya: [],
        monuments_par_type: [],
        vestiges_par_type: [],
        sites_populaires: [],
        total_medias: 0
      };
    }
  }

  // ✅ Méthodes utilitaires supplémentaires
  async checkNameExists(name: string, excludeId?: number): Promise<boolean> {
    try {
      const response = await this.client.get<{ exists: boolean }>(
        `${API_ENDPOINTS.PATRIMOINE.BASE}/check-name`,
        { name, exclude_id: excludeId }
      );
      
      return response.exists;
    } catch (error) {
      console.error('❌ Erreur lors de la vérification du nom:', error);
      return false;
    }
  }

  // Calculer la distance entre deux sites
  calculateDistance(site1: Lieu, site2: Lieu): number {
    if (!site1.latitude || !site1.longitude || !site2.latitude || !site2.longitude) {
      return 0;
    }
    
    const R = 6371; // Rayon de la Terre en km
    const dLat = (site2.latitude - site1.latitude) * Math.PI / 180;
    const dLon = (site2.longitude - site1.longitude) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(site1.latitude * Math.PI / 180) * Math.cos(site2.latitude * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  // Formater une adresse complète algérienne
  formatAdresseAlgerienne(lieu: Lieu): string {
    const parties = [
      lieu.adresse,
      lieu.Commune?.nom,
      lieu.Daira?.nom,
      lieu.Wilaya?.nom,
      'Algérie'
    ].filter(Boolean);
    
    return parties.join(', ');
  }
}

export const patrimoineService = new PatrimoineService();