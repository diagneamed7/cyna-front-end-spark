// src/services/api/categories.ts - Service pour la gestion des catégories

import { ApiClient } from './client';
import { API_ENDPOINTS } from '../../config/api';

export interface Category {
  idCategorie: number;
  nom: string;
  description: string;
  image?: string;
  statut?: 'actif' | 'inactif';
  date_creation?: string;
  date_modification?: string;
  nombre_produits?: number;
}

export interface CreateCategoryRequest {
  nom: string;
  description: string;
  image?: string;
  statut?: 'actif' | 'inactif';
}

export interface UpdateCategoryRequest extends Partial<CreateCategoryRequest> {
  idCategorie: number;
}

export interface CategoryFilters {
  search?: string;
  statut?: 'actif' | 'inactif';
  avec_produits?: boolean;
}

export interface CategoryListResponse {
  categories: Category[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class CategoryService {
  private client: ApiClient;

  constructor() {
    this.client = new ApiClient();
  }

  // =============================================================================
  // CRUD OPERATIONS
  // =============================================================================

  /**
   * Récupérer toutes les catégories avec pagination et filtres
   */
  async getCategories(
    page: number = 1,
    limit: number = 20,
    filters?: CategoryFilters
  ): Promise<CategoryListResponse> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(filters?.search && { search: filters.search }),
        ...(filters?.statut && { statut: filters.statut }),
        ...(filters?.avec_produits && { avec_produits: filters.avec_produits.toString() })
      });

      const response = await this.client.get<CategoryListResponse>(
        `${API_ENDPOINTS.CATEGORIES.BASE}?${params.toString()}`
      );

      return response;
    } catch (error) {
      console.error('Erreur lors de la récupération des catégories:', error);
      throw new Error('Impossible de récupérer les catégories');
    }
  }

  /**
   * Récupérer toutes les catégories (sans pagination)
   */
  async getAllCategories(): Promise<Category[]> {
    try {
      const response = await this.client.get<Category[]>(
        API_ENDPOINTS.CATEGORIES.BASE
      );
      return response;
    } catch (error) {
      console.error('Erreur lors de la récupération de toutes les catégories:', error);
      throw new Error('Impossible de récupérer les catégories');
    }
  }

  /**
   * Récupérer une catégorie par son ID
   */
  async getCategory(id: number): Promise<Category> {
    try {
      const response = await this.client.get<Category>(
        API_ENDPOINTS.CATEGORIES.BY_ID(id)
      );

      return response;
    } catch (error) {
      console.error(`Erreur lors de la récupération de la catégorie ${id}:`, error);
      throw new Error('Impossible de récupérer la catégorie');
    }
  }

  /**
   * Créer une nouvelle catégorie
   */
  async createCategory(data: CreateCategoryRequest): Promise<Category> {
    try {
      console.log('📝 Création d\'une nouvelle catégorie:', data);

      const response = await this.client.post<Category>(
        API_ENDPOINTS.CATEGORIES.BASE,
        data
      );

      console.log('✅ Catégorie créée avec succès:', response);
      return response;
    } catch (error) {
      console.error('❌ Erreur lors de la création de la catégorie:', error);
      throw new Error('Impossible de créer la catégorie');
    }
  }

  /**
   * Mettre à jour une catégorie existante
   */
  async updateCategory(data: UpdateCategoryRequest): Promise<Category> {
    try {
      console.log('📝 Mise à jour de la catégorie:', data);

      const response = await this.client.put<Category>(
        API_ENDPOINTS.CATEGORIES.BY_ID(data.idCategorie),
        data
      );

      console.log('✅ Catégorie mise à jour avec succès:', response);
      return response;
    } catch (error) {
      console.error(`❌ Erreur lors de la mise à jour de la catégorie ${data.idCategorie}:`, error);
      throw new Error('Impossible de mettre à jour la catégorie');
    }
  }

  /**
   * Supprimer une catégorie
   */
  async deleteCategory(id: number): Promise<void> {
    try {
      console.log(`🗑️ Suppression de la catégorie ${id}`);

      await this.client.delete(API_ENDPOINTS.CATEGORIES.BY_ID(id));

      console.log('✅ Catégorie supprimée avec succès');
    } catch (error) {
      console.error(`❌ Erreur lors de la suppression de la catégorie ${id}:`, error);
      throw new Error('Impossible de supprimer la catégorie');
    }
  }

  // =============================================================================
  // OPERATIONS SPÉCIALES
  // =============================================================================

  /**
   * Rechercher des catégories
   */
  async searchCategories(query: string, limit: number = 10): Promise<Category[]> {
    try {
      const response = await this.client.get<Category[]>(
        `${API_ENDPOINTS.CATEGORIES.BASE}/search?q=${encodeURIComponent(query)}&limit=${limit}`
      );

      return response;
    } catch (error) {
      console.error('Erreur lors de la recherche de catégories:', error);
      throw new Error('Impossible de rechercher les catégories');
    }
  }

  /**
   * Récupérer les catégories avec le nombre de produits
   */
  async getCategoriesWithProductCount(): Promise<Category[]> {
    try {
      const response = await this.client.get<Category[]>(
        `${API_ENDPOINTS.CATEGORIES.BASE}/with-count`
      );

      return response;
    } catch (error) {
      console.error('Erreur lors de la récupération des catégories avec comptage:', error);
      throw new Error('Impossible de récupérer les catégories avec comptage');
    }
  }

  /**
   * Récupérer les catégories populaires (avec le plus de produits)
   */
  async getPopularCategories(limit: number = 10): Promise<Category[]> {
    try {
      const response = await this.client.get<Category[]>(
        `${API_ENDPOINTS.CATEGORIES.BASE}/popular?limit=${limit}`
      );

      return response;
    } catch (error) {
      console.error('Erreur lors de la récupération des catégories populaires:', error);
      throw new Error('Impossible de récupérer les catégories populaires');
    }
  }

  /**
   * Récupérer les catégories récentes
   */
  async getRecentCategories(limit: number = 10): Promise<Category[]> {
    try {
      const response = await this.client.get<Category[]>(
        `${API_ENDPOINTS.CATEGORIES.BASE}/recent?limit=${limit}`
      );

      return response;
    } catch (error) {
      console.error('Erreur lors de la récupération des catégories récentes:', error);
      throw new Error('Impossible de récupérer les catégories récentes');
    }
  }

  /**
   * Changer le statut d'une catégorie
   */
  async updateStatus(categoryId: number, status: 'actif' | 'inactif'): Promise<Category> {
    try {
      console.log(`🔄 Changement du statut de la catégorie ${categoryId}: ${status}`);

      const response = await this.client.patch<Category>(
        `${API_ENDPOINTS.CATEGORIES.BY_ID(categoryId)}/status`,
        { statut: status }
      );

      console.log('✅ Statut mis à jour avec succès:', response);
      return response;
    } catch (error) {
      console.error(`❌ Erreur lors du changement de statut de la catégorie ${categoryId}:`, error);
      throw new Error('Impossible de changer le statut');
    }
  }

  /**
   * Vérifier si une catégorie peut être supprimée (pas de produits associés)
   */
  async canDeleteCategory(categoryId: number): Promise<boolean> {
    try {
      const category = await this.getCategory(categoryId);
      return (category.nombre_produits || 0) === 0;
    } catch (error) {
      console.error(`Erreur lors de la vérification de suppression de la catégorie ${categoryId}:`, error);
      return false;
    }
  }

  /**
   * Récupérer les statistiques des catégories
   */
  async getCategoryStats(): Promise<{
    total: number;
    actives: number;
    inactives: number;
    avec_produits: number;
    sans_produits: number;
  }> {
    try {
      const response = await this.client.get<{
        total: number;
        actives: number;
        inactives: number;
        avec_produits: number;
        sans_produits: number;
      }>(`${API_ENDPOINTS.CATEGORIES.BASE}/stats`);

      return response;
    } catch (error) {
      console.error('Erreur lors de la récupération des statistiques des catégories:', error);
      throw new Error('Impossible de récupérer les statistiques');
    }
  }

  // =============================================================================
  // UTILITAIRES
  // =============================================================================

  /**
   * Vérifier si une catégorie est active
   */
  isActive(category: Category): boolean {
    return category.statut === 'actif';
  }

  /**
   * Vérifier si une catégorie a des produits
   */
  hasProducts(category: Category): boolean {
    return (category.nombre_produits || 0) > 0;
  }

  /**
   * Obtenir le statut d'affichage d'une catégorie
   */
  getStatusDisplay(status: 'actif' | 'inactif'): { label: string; color: string } {
    switch (status) {
      case 'actif':
        return { label: 'Active', color: 'green' };
      case 'inactif':
        return { label: 'Inactive', color: 'red' };
      default:
        return { label: 'Inconnu', color: 'gray' };
    }
  }

  /**
   * Formater le nombre de produits pour l'affichage
   */
  formatProductCount(count: number): string {
    if (count === 0) return 'Aucun produit';
    if (count === 1) return '1 produit';
    return `${count} produits`;
  }

  /**
   * Valider les données d'une catégorie
   */
  validateCategoryData(data: CreateCategoryRequest): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.nom || data.nom.trim().length === 0) {
      errors.push('Le nom de la catégorie est requis');
    }

    if (data.nom && data.nom.trim().length < 2) {
      errors.push('Le nom de la catégorie doit contenir au moins 2 caractères');
    }

    if (data.nom && data.nom.trim().length > 100) {
      errors.push('Le nom de la catégorie ne peut pas dépasser 100 caractères');
    }

    if (data.description && data.description.length > 500) {
      errors.push('La description ne peut pas dépasser 500 caractères');
    }

    if (data.image && !this.isValidUrl(data.image)) {
      errors.push('L\'URL de l\'image n\'est pas valide');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Valider une URL
   */
  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }
}

// Export d'une instance par défaut
export const categoryService = new CategoryService(); 