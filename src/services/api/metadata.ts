// src/services/api/metadata.ts - Service des métadonnées avec cache intelligent
import { apiClient } from './client';
import { API_ENDPOINTS } from '../../config/api';
import type { 
  Langue, 
  Categorie, 
  Genre, 
  TypeOeuvre, 
  TypeEvenement 
} from '../../types/classification';
import type { Wilaya, Daira, Commune } from '../../types/geography';

interface MetadataBundle {
  langues: Langue[];
  categories: Categorie[];
  genres: Genre[];
  types_oeuvres: TypeOeuvre[];
  types_evenements: TypeEvenement[];
  roles: any[];
  wilayas: Wilaya[];
  materiaux?: any[];
  techniques?: any[];
}

export class MetadataService {
  constructor(private client = apiClient) {}

  // ==========================================================================
  // RÉCUPÉRATION GLOBALE (RECOMMANDÉE)
  // ==========================================================================

  async getAll(): Promise<MetadataBundle> {
    try {
      console.log('📊 Récupération de toutes les métadonnées...');
      
      const response = await this.client.get<MetadataBundle>(
        API_ENDPOINTS.METADATA.BASE,
        undefined,
        { cache: true } // Cache longue durée pour les métadonnées
      );
      
      console.log('✅ Métadonnées récupérées:', {
        langues: response.langues?.length || 0,
        categories: response.categories?.length || 0,
        wilayas: response.wilayas?.length || 0,
      });
      
      return response;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des métadonnées:', error);
      throw error;
    }
  }

  // ==========================================================================
  // RÉCUPÉRATION INDIVIDUELLE (POUR CAS SPÉCIAUX)
  // ==========================================================================

  async getLangues(): Promise<Langue[]> {
    try {
      console.log('🌐 Récupération des langues...');
      
      const response = await this.client.get<Langue[]>(
        API_ENDPOINTS.METADATA.LANGUES,
        undefined,
        { cache: true }
      );
      
      console.log(`✅ ${response.length} langues récupérées`);
      return response;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des langues:', error);
      throw error;
    }
  }

  async getCategories(): Promise<Categorie[]> {
    try {
      console.log('📂 Récupération des catégories...');
      
      const response = await this.client.get<Categorie[]>(
        API_ENDPOINTS.METADATA.CATEGORIES,
        undefined,
        { cache: true }
      );
      
      console.log(`✅ ${response.length} catégories récupérées`);
      return response;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des catégories:', error);
      throw error;
    }
  }

 async getWilayas(withHierarchy: boolean = false): Promise<Wilaya[]> {
  try {
    console.log(`🗺️ Récupération des wilayas${withHierarchy ? ' avec hiérarchie' : ''}...`);
    
    const response = await this.client.get<any>( // Changé en 'any' temporairement
      API_ENDPOINTS.METADATA.WILAYAS,
      withHierarchy ? { with_hierarchy: true } : undefined,
      { cache: true }
    );
    
    // 🔍 LOG DE DEBUG
    console.log('📦 Réponse complète:', response);
    
    // ✅ GESTION DE LA STRUCTURE DE RÉPONSE
    let wilayas: Wilaya[];
    
    // Si la réponse a une propriété 'data', c'est le format {success: true, data: [...]}
    if (response && typeof response === 'object' && 'data' in response) {
      wilayas = response.data;
    } else if (Array.isArray(response)) {
      // Si c'est directement un tableau
      wilayas = response;
    } else {
      console.error('❌ Format de réponse inattendu:', response);
      wilayas = [];
    }
    
    console.log(`✅ ${wilayas.length} wilayas récupérées`);
    return wilayas;
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des wilayas:', error);
    throw error;
  }
}

  // ==========================================================================
  // HIÉRARCHIE GÉOGRAPHIQUE
  // ==========================================================================

  async getDairasByWilaya(wilayaId: number): Promise<Daira[]> {
    try {
      console.log(`🏛️ Récupération des daïras de la wilaya ${wilayaId}...`);
      
      const response = await this.client.get<Daira[]>(
        `${API_ENDPOINTS.METADATA.WILAYAS}/${wilayaId}/dairas`,
        undefined,
        { cache: true }
      );
      
      console.log(`✅ ${response.length} daïras récupérées`);
      return response;
    } catch (error) {
      console.error(`❌ Erreur lors de la récupération des daïras de la wilaya ${wilayaId}:`, error);
      throw error;
    }
  }

  async getCommunesByDaira(dairaId: number): Promise<Commune[]> {
    try {
      console.log(`🏘️ Récupération des communes de la daïra ${dairaId}...`);
      
      const response = await this.client.get<Commune[]>(
        `/metadata/dairas/${dairaId}/communes`,
        undefined,
        { cache: true }
      );
      
      console.log(`✅ ${response.length} communes récupérées`);
      return response;
    } catch (error) {
      console.error(`❌ Erreur lors de la récupération des communes de la daïra ${dairaId}:`, error);
      throw error;
    }
  }

  // ==========================================================================
  // RECHERCHE ET SUGGESTIONS
  // ==========================================================================

  async searchWilayas(query: string): Promise<Wilaya[]> {
    try {
      if (query.length < 2) return [];
      
      const response = await this.client.get<Wilaya[]>(
        `${API_ENDPOINTS.METADATA.WILAYAS}/search`,
        { q: query },
        { cache: true }
      );
      
      return response;
    } catch (error) {
      console.error('❌ Erreur lors de la recherche de wilayas:', error);
      return [];
    }
  }

  async searchCategories(query: string): Promise<Categorie[]> {
    try {
      if (query.length < 2) return [];
      
      const response = await this.client.get<Categorie[]>(
        `${API_ENDPOINTS.METADATA.CATEGORIES}/search`,
        { q: query },
        { cache: true }
      );
      
      return response;
    } catch (error) {
      console.error('❌ Erreur lors de la recherche de catégories:', error);
      return [];
    }
  }

  // ==========================================================================
  // UTILITAIRES DE TRANSFORMATION
  // ==========================================================================

  transformToOptions<T extends { id?: number; nom?: string; label?: string }>(
    items: T[], 
    valueKey: string = 'id', 
    labelKey: string = 'nom'
  ): Array<{ value: any; label: string; item: T }> {
    return items.map(item => ({
      value: (item as any)[valueKey],
      label: (item as any)[labelKey] || (item as any).nom || (item as any).label || 'Sans nom',
      item
    }));
  }

  // ==========================================================================
  // MÉTHODES DE RECHERCHE PAR ID
  // ==========================================================================

  async getLangueById(id: number): Promise<Langue | null> {
    try {
      const langues = await this.getLangues();
      return langues.find(l => l.id_langue === id) || null;
    } catch (error) {
      console.error(`❌ Erreur lors de la recherche de la langue ${id}:`, error);
      return null;
    }
  }

  async getCategorieById(id: number): Promise<Categorie | null> {
    try {
      const categories = await this.getCategories();
      return categories.find(c => c.id_categorie === id) || null;
    } catch (error) {
      console.error(`❌ Erreur lors de la recherche de la catégorie ${id}:`, error);
      return null;
    }
  }

  async getWilayaById(id: number): Promise<Wilaya | null> {
    try {
      const wilayas = await this.getWilayas();
      return wilayas.find(w => w.id_wilaya === id) || null;
    } catch (error) {
      console.error(`❌ Erreur lors de la recherche de la wilaya ${id}:`, error);
      return null;
    }
  }

  // ==========================================================================
  // CACHE ET OPTIMISATION
  // ==========================================================================

  async preloadAll(): Promise<void> {
    try {
      console.log('🚀 Préchargement de toutes les métadonnées...');
      
      await Promise.all([
        this.getAll(),
        this.getWilayas(true), // Avec hiérarchie
      ]);
      
      console.log('✅ Toutes les métadonnées préchargées');
    } catch (error) {
      console.error('❌ Erreur lors du préchargement:', error);
    }
  }

  clearCache(): void {
    console.log('🧹 Nettoyage du cache des métadonnées...');
    this.client.clearCache();
  }

  async refreshCache(): Promise<void> {
    console.log('🔄 Actualisation du cache des métadonnées...');
    this.clearCache();
    await this.preloadAll();
  }

  // ==========================================================================
  // MÉTHODES SPÉCIFIQUES AU PATRIMOINE ALGÉRIEN
  // ==========================================================================

  getLanguesAlgeriennes(): Array<{ code: string; nom: string; id: number }> {
    return [
      { code: 'ar', nom: 'Arabe', id: 3 },
      { code: 'tm', nom: 'Tamazight', id: 1 },
      { code: 'tif', nom: 'Tifinagh', id: 2 },
      { code: 'de', nom: 'Derja', id: 4 },
      { code: 'fr', nom: 'Français', id: 5 },
      { code: 'en', nom: 'Anglais', id: 6 },
    ];
  }

  getTypesUtilisateursAlgeriens(): Array<{ value: string; label: string; description: string }> {
    return [
      { value: 'visiteur', label: 'Visiteur', description: 'Consultation uniquement' },
      { value: 'ecrivain', label: 'Écrivain', description: 'Auteur de livres et textes' },
      { value: 'artisan', label: 'Artisan', description: 'Créateur d\'objets artisanaux traditionnels' },
      { value: 'acteur', label: 'Acteur', description: 'Artiste de théâtre et cinéma' },
      { value: 'journaliste', label: 'Journaliste', description: 'Professionnel des médias' },
      { value: 'scientifique', label: 'Scientifique', description: 'Chercheur et académique' },
      { value: 'artiste', label: 'Artiste', description: 'Créateur d\'œuvres artistiques' },
      { value: 'realisateur', label: 'Réalisateur', description: 'Cinéaste et créateur audiovisuel' },
      { value: 'musicien', label: 'Musicien', description: 'Compositeur et interprète musical' },
      { value: 'photographe', label: 'Photographe', description: 'Artiste photographe' },
      { value: 'danseur', label: 'Danseur', description: 'Artiste de la danse' },
      { value: 'sculpteur', label: 'Sculpteur', description: 'Artiste sculpteur' },
    ];
  }

  
  // ==========================================================================
  // STATISTIQUES
  // ==========================================================================

  async getUsageStatistics(): Promise<{
    most_used_categories: Array<{ id: number; nom: string; usage_count: number }>;
    most_used_wilayas: Array<{ id: number; nom: string; usage_count: number }>;
    most_used_languages: Array<{ id: number; nom: string; usage_count: number }>;
  }> {
    try {
      console.log('📈 Récupération des statistiques d\'usage...');
      
      const response = await this.client.get<any>(
        `${API_ENDPOINTS.METADATA.BASE}/statistics`,
        undefined,
        { cache: true }
      );
      
      console.log('✅ Statistiques d\'usage récupérées');
      return response;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des statistiques:', error);
      throw error;
    }
  }
}

// Instance singleton exportée
export const metadataService = new MetadataService();