// src/services/api/products.ts - Service pour la gestion des produits

import { ApiClient } from './client';
import { API_ENDPOINTS } from '../../config/api';

export interface Product {
  idProduit: number;
  nom: string;
  description: string;
  prix: number;
  stock?: number;
  image?: string;
  statut?: 'actif' | 'inactif';
  categorie: {
    idCategorie: number;
    nom: string;
  };
  date_creation?: string;
  date_modification?: string;
}

export interface CreateProductRequest {
  nom: string;
  description: string;
  prix: number;
  stock?: number;
  categorie_id: number;
  image?: string;
  statut?: 'actif' | 'inactif';
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {
  idProduit: number;
}

export interface ProductFilters {
  search?: string;
  categorie_id?: number;
  statut?: 'actif' | 'inactif';
  min_prix?: number;
  max_prix?: number;
  en_stock?: boolean;
}

export interface ProductListResponse {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export class ProductService {
  private client: ApiClient;

  constructor() {
    this.client = new ApiClient();
  }

  // =============================================================================
  // CRUD OPERATIONS
  // =============================================================================

  /**
   * Récupérer tous les produits avec pagination et filtres
   */
  async getProducts(
    page: number = 1,
    limit: number = 20,
    filters?: ProductFilters
  ): Promise<ProductListResponse> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(filters?.search && { search: filters.search }),
        ...(filters?.categorie_id && { categorie_id: filters.categorie_id.toString() }),
        ...(filters?.statut && { statut: filters.statut }),
        ...(filters?.min_prix && { min_prix: filters.min_prix.toString() }),
        ...(filters?.max_prix && { max_prix: filters.max_prix.toString() }),
        ...(filters?.en_stock && { en_stock: filters.en_stock.toString() })
      });

      const response = await this.client.get<ProductListResponse>(
        `${API_ENDPOINTS.PRODUITS.BASE}?${params.toString()}`
      );

      return response;
    } catch (error) {
      console.error('Erreur lors de la récupération des produits:', error);
      throw new Error('Impossible de récupérer les produits');
    }
  }

  /**
   * Récupérer un produit par son ID
   */
  async getProduct(id: number): Promise<Product> {
    try {
      const response = await this.client.get<Product>(
        API_ENDPOINTS.PRODUITS.BY_ID(id)
      );

      return response;
    } catch (error) {
      console.error(`Erreur lors de la récupération du produit ${id}:`, error);
      throw new Error('Impossible de récupérer le produit');
    }
  }

  /**
   * Créer un nouveau produit
   */
  async createProduct(data: CreateProductRequest): Promise<Product> {
    try {
      console.log('📝 Création d\'un nouveau produit:', data);

      const response = await this.client.post<Product>(
        API_ENDPOINTS.PRODUITS.BASE,
        data
      );

      console.log('✅ Produit créé avec succès:', response);
      return response;
    } catch (error) {
      console.error('❌ Erreur lors de la création du produit:', error);
      throw new Error('Impossible de créer le produit');
    }
  }

  /**
   * Mettre à jour un produit existant
   */
  async updateProduct(data: UpdateProductRequest): Promise<Product> {
    try {
      console.log('📝 Mise à jour du produit:', data);

      const response = await this.client.put<Product>(
        API_ENDPOINTS.PRODUITS.BY_ID(data.idProduit),
        data
      );

      console.log('✅ Produit mis à jour avec succès:', response);
      return response;
    } catch (error) {
      console.error(`❌ Erreur lors de la mise à jour du produit ${data.idProduit}:`, error);
      throw new Error('Impossible de mettre à jour le produit');
    }
  }

  /**
   * Supprimer un produit
   */
  async deleteProduct(id: number): Promise<void> {
    try {
      console.log(`🗑️ Suppression du produit ${id}`);

      await this.client.delete(API_ENDPOINTS.PRODUITS.BY_ID(id));

      console.log('✅ Produit supprimé avec succès');
    } catch (error) {
      console.error(`❌ Erreur lors de la suppression du produit ${id}:`, error);
      throw new Error('Impossible de supprimer le produit');
    }
  }

  // =============================================================================
  // OPERATIONS SPÉCIALES
  // =============================================================================

  /**
   * Rechercher des produits
   */
  async searchProducts(query: string, limit: number = 10): Promise<Product[]> {
    try {
      const response = await this.client.get<Product[]>(
        `${API_ENDPOINTS.PRODUITS.SEARCH}?q=${encodeURIComponent(query)}&limit=${limit}`
      );

      return response;
    } catch (error) {
      console.error('Erreur lors de la recherche de produits:', error);
      throw new Error('Impossible de rechercher les produits');
    }
  }

  /**
   * Récupérer les produits populaires
   */
  async getPopularProducts(limit: number = 10): Promise<Product[]> {
    try {
      const response = await this.client.get<Product[]>(
        `${API_ENDPOINTS.PRODUITS.POPULAR}?limit=${limit}`
      );

      return response;
    } catch (error) {
      console.error('Erreur lors de la récupération des produits populaires:', error);
      throw new Error('Impossible de récupérer les produits populaires');
    }
  }

  /**
   * Récupérer les produits récents
   */
  async getRecentProducts(limit: number = 10): Promise<Product[]> {
    try {
      const response = await this.client.get<Product[]>(
        `${API_ENDPOINTS.PRODUITS.RECENT}?limit=${limit}`
      );

      return response;
    } catch (error) {
      console.error('Erreur lors de la récupération des produits récents:', error);
      throw new Error('Impossible de récupérer les produits récents');
    }
  }

  /**
   * Récupérer les produits par catégorie
   */
  async getProductsByCategory(
    categoryId: number,
    page: number = 1,
    limit: number = 20
  ): Promise<ProductListResponse> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });

      const response = await this.client.get<ProductListResponse>(
        `${API_ENDPOINTS.PRODUITS.BY_CATEGORY(categoryId)}?${params.toString()}`
      );

      return response;
    } catch (error) {
      console.error(`Erreur lors de la récupération des produits de la catégorie ${categoryId}:`, error);
      throw new Error('Impossible de récupérer les produits de cette catégorie');
    }
  }

  /**
   * Mettre à jour le stock d'un produit
   */
  async updateStock(productId: number, newStock: number): Promise<Product> {
    try {
      console.log(`📦 Mise à jour du stock du produit ${productId}: ${newStock}`);

      const response = await this.client.patch<Product>(
        `${API_ENDPOINTS.PRODUITS.BY_ID(productId)}/stock`,
        { stock: newStock }
      );

      console.log('✅ Stock mis à jour avec succès:', response);
      return response;
    } catch (error) {
      console.error(`❌ Erreur lors de la mise à jour du stock du produit ${productId}:`, error);
      throw new Error('Impossible de mettre à jour le stock');
    }
  }

  /**
   * Changer le statut d'un produit
   */
  async updateStatus(productId: number, status: 'actif' | 'inactif'): Promise<Product> {
    try {
      console.log(`🔄 Changement du statut du produit ${productId}: ${status}`);

      const response = await this.client.patch<Product>(
        `${API_ENDPOINTS.PRODUITS.BY_ID(productId)}/status`,
        { statut: status }
      );

      console.log('✅ Statut mis à jour avec succès:', response);
      return response;
    } catch (error) {
      console.error(`❌ Erreur lors du changement de statut du produit ${productId}:`, error);
      throw new Error('Impossible de changer le statut');
    }
  }

  // =============================================================================
  // UTILITAIRES
  // =============================================================================

  /**
   * Vérifier si un produit est en stock
   */
  isInStock(product: Product): boolean {
    return (product.stock || 0) > 0 && product.statut !== 'inactif';
  }

  /**
   * Formater le prix pour l'affichage
   */
  formatPrice(price: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  }

  /**
   * Obtenir le statut d'affichage d'un produit
   */
  getStatusDisplay(status: 'actif' | 'inactif'): { label: string; color: string } {
    switch (status) {
      case 'actif':
        return { label: 'Actif', color: 'green' };
      case 'inactif':
        return { label: 'Inactif', color: 'red' };
      default:
        return { label: 'Inconnu', color: 'gray' };
    }
  }
}

// Export d'une instance par défaut
export const productService = new ProductService(); 