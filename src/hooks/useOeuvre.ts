// src/hooks/useOeuvre.ts - Hook œuvres UNIFIÉ et CORRIGÉ
import { useState, useCallback, useMemo } from 'react';
import { oeuvreService } from '../services/api/oeuvres'; // ✅ CORRIGÉ: Instance singleton
import { useAuth } from './useAuth';
// import { permissions } from '../utils/permissions'; // À décommenter quand disponible
import type { 
  Oeuvre, 
  CreateOeuvreData, 
  UpdateOeuvreData, 
  OeuvreFilters,
  ValidationOeuvreData,
  // Types spécifiques
  Livre,
  Film,
  AlbumMusical,
  Article,
  ArticleScientifique,
  Artisanat,
  OeuvreArt
} from '../types/oeuvre';
import type { PaginatedResponse } from '../types/base';

interface UseOeuvresReturn {
  // Données principales
  oeuvres: Oeuvre[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  
  // Méthodes CRUD de base
  fetchOeuvres: (filters?: OeuvreFilters & { page?: number; limit?: number }) => Promise<void>;
  getOeuvre: (id: number) => Promise<Oeuvre | null>;
  createOeuvre: (data: CreateOeuvreData) => Promise<Oeuvre | null>;
  updateOeuvre: (id: number, data: UpdateOeuvreData) => Promise<Oeuvre | null>;
  deleteOeuvre: (id: number) => Promise<boolean>;
  
  // ✅ Méthodes pour types spécifiques
  createWithSpecificDetails: (data: CreateOeuvreData) => Promise<Oeuvre | null>;
  addLivreDetails: (oeuvreId: number, livreData: Partial<Livre>) => Promise<Livre | null>;
  addFilmDetails: (oeuvreId: number, filmData: Partial<Film>) => Promise<Film | null>;
  addAlbumDetails: (oeuvreId: number, albumData: Partial<AlbumMusical>) => Promise<AlbumMusical | null>;
  addArticleDetails: (oeuvreId: number, articleData: Partial<Article>) => Promise<Article | null>;
  addArticleScientifiqueDetails: (oeuvreId: number, articleSciData: Partial<ArticleScientifique>) => Promise<ArticleScientifique | null>;
  addArtisanatDetails: (oeuvreId: number, artisanatData: Partial<Artisanat>) => Promise<Artisanat | null>;
  addOeuvreArtDetails: (oeuvreId: number, oeuvreArtData: Partial<OeuvreArt>) => Promise<OeuvreArt | null>;
  
  // ✅ Méthodes par type
  getOeuvresByType: (type: string, filters?: OeuvreFilters) => Promise<void>;
  getLivres: (filters?: OeuvreFilters) => Promise<void>;
  getFilms: (filters?: OeuvreFilters) => Promise<void>;
  getAlbums: (filters?: OeuvreFilters) => Promise<void>;
  getArticles: (filters?: OeuvreFilters) => Promise<void>;
  getArticlesScientifiques: (filters?: OeuvreFilters) => Promise<void>;
  getArtisanat: (filters?: OeuvreFilters) => Promise<void>;
  getOeuvresArt: (filters?: OeuvreFilters) => Promise<void>;
  
  // Méthodes de recherche
  searchOeuvres: (query: string, filters?: OeuvreFilters) => Promise<void>;
  getPopularOeuvres: (limit?: number) => Promise<void>;
  getRecentOeuvres: (limit?: number) => Promise<void>;
  getMyOeuvres: (filters?: OeuvreFilters) => Promise<void>;
  
  // ✅ Validation et modération
  validateOeuvre: (id: number, validation: ValidationOeuvreData) => Promise<boolean>;
  getPendingOeuvres: () => Promise<void>;
  
  // ✅ Permissions et actions conditionnelles
  canCreateOeuvre: boolean;
  canModerateOeuvres: boolean;
  canEditOeuvre: (oeuvre: Oeuvre) => boolean;
  canDeleteOeuvre: (oeuvre: Oeuvre) => boolean;
  
  // ✅ Statistiques et métriques
  getStatsByType: () => Record<string, number>;
  getTotalByStatus: () => Record<string, number>;
  
  // ✅ Utilitaires
  clearError: () => void;
  refresh: () => Promise<void>;
  resetPagination: () => void;
}

export const useOeuvres = (): UseOeuvresReturn => {
  const { user } = useAuth();
  const [oeuvres, setOeuvres] = useState<Oeuvre[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0
  });
  
  // ✅ État pour les derniers filtres (pour refresh)
  const [lastFilters, setLastFilters] = useState<OeuvreFilters & { page?: number; limit?: number }>({});

  // ==========================================================================
  // ✅ MÉTHODES CRUD DE BASE (CORRIGÉES)
  // ==========================================================================

  const fetchOeuvres = useCallback(async (filters: OeuvreFilters & { page?: number; limit?: number } = {}) => {
    setLoading(true);
    setError(null);
    setLastFilters(filters);
    
    try {
      const response: PaginatedResponse<Oeuvre> = await oeuvreService.getAll(filters); // ✅ CORRIGÉ
      setOeuvres(response.data.items);
      setPagination({
        page: response.data.pagination.page,
        limit: response.data.pagination.limit,
        total: response.data.pagination.total,
        totalPages: response.data.pagination.pages // ✅ CORRIGÉ: 'pages' pas 'totalPages'
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des œuvres';
      setError(errorMessage);
      console.error('❌ Erreur fetchOeuvres:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const getOeuvre = useCallback(async (id: number): Promise<Oeuvre | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const oeuvre = await oeuvreService.getById(id); // ✅ CORRIGÉ
      return oeuvre;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement de l\'œuvre';
      setError(errorMessage);
      console.error('❌ Erreur getOeuvre:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const createOeuvre = useCallback(async (data: CreateOeuvreData): Promise<Oeuvre | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const newOeuvre = await oeuvreService.create(data); // ✅ CORRIGÉ
      setOeuvres(prev => [newOeuvre, ...prev]);
      setPagination(prev => ({ ...prev, total: prev.total + 1 }));
      return newOeuvre;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la création de l\'œuvre';
      setError(errorMessage);
      console.error('❌ Erreur createOeuvre:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateOeuvre = useCallback(async (id: number, data: UpdateOeuvreData): Promise<Oeuvre | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedOeuvre = await oeuvreService.update(id, data); // ✅ CORRIGÉ
      setOeuvres(prev => prev.map(oeuvre => 
        oeuvre.id_oeuvre === id ? updatedOeuvre : oeuvre
      ));
      return updatedOeuvre;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour de l\'œuvre';
      setError(errorMessage);
      console.error('❌ Erreur updateOeuvre:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteOeuvre = useCallback(async (id: number): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      await oeuvreService.delete(id); // ✅ CORRIGÉ
      setOeuvres(prev => prev.filter(oeuvre => oeuvre.id_oeuvre !== id));
      setPagination(prev => ({ ...prev, total: Math.max(0, prev.total - 1) }));
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression de l\'œuvre';
      setError(errorMessage);
      console.error('❌ Erreur deleteOeuvre:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // ==========================================================================
  // ✅ MÉTHODES POUR TYPES SPÉCIFIQUES (CORRIGÉES)
  // ==========================================================================

  const createWithSpecificDetails = useCallback(async (data: CreateOeuvreData): Promise<Oeuvre | null> => {
    setLoading(true);
    setError(null);
    
    try {
      // Créer l'œuvre de base
      const oeuvre = await oeuvreService.create(data); // ✅ CORRIGÉ
      
      // Ajouter les détails spécifiques si présents
      if (data.details_specifiques) {
        const details = data.details_specifiques;
        
        if (details.livre) {
          await oeuvreService.createLivreDetails(oeuvre.id_oeuvre, details.livre); // ✅ CORRIGÉ
        }
        if (details.film) {
          await oeuvreService.createFilmDetails(oeuvre.id_oeuvre, details.film); // ✅ CORRIGÉ
        }
        if (details.album) {
          await oeuvreService.createAlbumDetails(oeuvre.id_oeuvre, details.album); // ✅ CORRIGÉ
        }
        if (details.article) {
          await oeuvreService.createArticleDetails(oeuvre.id_oeuvre, details.article); // ✅ CORRIGÉ
        }
        if (details.article_scientifique) {
          await oeuvreService.createArticleScientifiqueDetails(oeuvre.id_oeuvre, details.article_scientifique); // ✅ CORRIGÉ
        }
        if (details.artisanat) {
          await oeuvreService.createArtisanatDetails(oeuvre.id_oeuvre, details.artisanat); // ✅ CORRIGÉ
        }
        if (details.oeuvre_art) {
          await oeuvreService.createOeuvreArtDetails(oeuvre.id_oeuvre, details.oeuvre_art); // ✅ CORRIGÉ
        }
      }
      
      // Recharger l'œuvre complète
      const completeOeuvre = await oeuvreService.getById(oeuvre.id_oeuvre); // ✅ CORRIGÉ
      setOeuvres(prev => [completeOeuvre, ...prev.filter(o => o.id_oeuvre !== oeuvre.id_oeuvre)]);
      
      return completeOeuvre;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la création de l\'œuvre complète';
      setError(errorMessage);
      console.error('❌ Erreur createWithSpecificDetails:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const addLivreDetails = useCallback(async (oeuvreId: number, livreData: Partial<Livre>): Promise<Livre | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const livre = await oeuvreService.createLivreDetails(oeuvreId, livreData); // ✅ CORRIGÉ
      const updatedOeuvre = await oeuvreService.getById(oeuvreId); // ✅ CORRIGÉ
      setOeuvres(prev => prev.map(o => o.id_oeuvre === oeuvreId ? updatedOeuvre : o));
      return livre;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'ajout des détails livre';
      setError(errorMessage);
      console.error('❌ Erreur addLivreDetails:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const addFilmDetails = useCallback(async (oeuvreId: number, filmData: Partial<Film>): Promise<Film | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const film = await oeuvreService.createFilmDetails(oeuvreId, filmData); // ✅ CORRIGÉ
      const updatedOeuvre = await oeuvreService.getById(oeuvreId); // ✅ CORRIGÉ
      setOeuvres(prev => prev.map(o => o.id_oeuvre === oeuvreId ? updatedOeuvre : o));
      return film;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'ajout des détails film';
      setError(errorMessage);
      console.error('❌ Erreur addFilmDetails:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const addAlbumDetails = useCallback(async (oeuvreId: number, albumData: Partial<AlbumMusical>): Promise<AlbumMusical | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const album = await oeuvreService.createAlbumDetails(oeuvreId, albumData); // ✅ CORRIGÉ
      const updatedOeuvre = await oeuvreService.getById(oeuvreId); // ✅ CORRIGÉ
      setOeuvres(prev => prev.map(o => o.id_oeuvre === oeuvreId ? updatedOeuvre : o));
      return album;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'ajout des détails album';
      setError(errorMessage);
      console.error('❌ Erreur addAlbumDetails:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const addArticleDetails = useCallback(async (oeuvreId: number, articleData: Partial<Article>): Promise<Article | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const article = await oeuvreService.createArticleDetails(oeuvreId, articleData); // ✅ CORRIGÉ
      const updatedOeuvre = await oeuvreService.getById(oeuvreId); // ✅ CORRIGÉ
      setOeuvres(prev => prev.map(o => o.id_oeuvre === oeuvreId ? updatedOeuvre : o));
      return article;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'ajout des détails article';
      setError(errorMessage);
      console.error('❌ Erreur addArticleDetails:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const addArticleScientifiqueDetails = useCallback(async (oeuvreId: number, articleSciData: Partial<ArticleScientifique>): Promise<ArticleScientifique | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const articleSci = await oeuvreService.createArticleScientifiqueDetails(oeuvreId, articleSciData); // ✅ CORRIGÉ
      const updatedOeuvre = await oeuvreService.getById(oeuvreId); // ✅ CORRIGÉ
      setOeuvres(prev => prev.map(o => o.id_oeuvre === oeuvreId ? updatedOeuvre : o));
      return articleSci;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'ajout des détails article scientifique';
      setError(errorMessage);
      console.error('❌ Erreur addArticleScientifiqueDetails:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const addArtisanatDetails = useCallback(async (oeuvreId: number, artisanatData: Partial<Artisanat>): Promise<Artisanat | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const artisanat = await oeuvreService.createArtisanatDetails(oeuvreId, artisanatData); // ✅ CORRIGÉ
      const updatedOeuvre = await oeuvreService.getById(oeuvreId); // ✅ CORRIGÉ
      setOeuvres(prev => prev.map(o => o.id_oeuvre === oeuvreId ? updatedOeuvre : o));
      return artisanat;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'ajout des détails artisanat';
      setError(errorMessage);
      console.error('❌ Erreur addArtisanatDetails:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const addOeuvreArtDetails = useCallback(async (oeuvreId: number, oeuvreArtData: Partial<OeuvreArt>): Promise<OeuvreArt | null> => {
    setLoading(true);
    setError(null);
    
    try {
      const oeuvreArt = await oeuvreService.createOeuvreArtDetails(oeuvreId, oeuvreArtData); // ✅ CORRIGÉ
      const updatedOeuvre = await oeuvreService.getById(oeuvreId); // ✅ CORRIGÉ
      setOeuvres(prev => prev.map(o => o.id_oeuvre === oeuvreId ? updatedOeuvre : o));
      return oeuvreArt;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'ajout des détails œuvre d\'art';
      setError(errorMessage);
      console.error('❌ Erreur addOeuvreArtDetails:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  // ==========================================================================
  // ✅ MÉTHODES PAR TYPE (CORRIGÉES)
  // ==========================================================================

  const getOeuvresByType = useCallback(async (type: string, filters: OeuvreFilters = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const results = await oeuvreService.getOeuvresByType(type, filters); // ✅ CORRIGÉ
      setOeuvres(results);
      // Reset pagination pour les listes filtrées
      setPagination({
        page: 1,
        limit: results.length,
        total: results.length,
        totalPages: 1
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : `Erreur lors du chargement des œuvres de type ${type}`;
      setError(errorMessage);
      console.error('❌ Erreur getOeuvresByType:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const getLivres = useCallback(async (filters: OeuvreFilters = {}) => {
    await getOeuvresByType('livre', filters);
  }, [getOeuvresByType]);

  const getFilms = useCallback(async (filters: OeuvreFilters = {}) => {
    await getOeuvresByType('film', filters);
  }, [getOeuvresByType]);

  const getAlbums = useCallback(async (filters: OeuvreFilters = {}) => {
    await getOeuvresByType('album', filters);
  }, [getOeuvresByType]);

  const getArticles = useCallback(async (filters: OeuvreFilters = {}) => {
    await getOeuvresByType('article', filters);
  }, [getOeuvresByType]);

  const getArticlesScientifiques = useCallback(async (filters: OeuvreFilters = {}) => {
    await getOeuvresByType('article-scientifique', filters);
  }, [getOeuvresByType]);

  const getArtisanat = useCallback(async (filters: OeuvreFilters = {}) => {
    await getOeuvresByType('artisanat', filters);
  }, [getOeuvresByType]);

  const getOeuvresArt = useCallback(async (filters: OeuvreFilters = {}) => {
    await getOeuvresByType('oeuvre-art', filters);
  }, [getOeuvresByType]);

  // ==========================================================================
  // ✅ MÉTHODES DE RECHERCHE (CORRIGÉES)
  // ==========================================================================

  const searchOeuvres = useCallback(async (query: string, filters: OeuvreFilters = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const results = await oeuvreService.search(query, filters); // ✅ CORRIGÉ
      setOeuvres(results);
      setPagination({
        page: 1,
        limit: results.length,
        total: results.length,
        totalPages: 1
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la recherche';
      setError(errorMessage);
      console.error('❌ Erreur searchOeuvres:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const getPopularOeuvres = useCallback(async (limit: number = 10) => {
    setLoading(true);
    setError(null);
    
    try {
      const popular = await oeuvreService.getPopular(limit); // ✅ CORRIGÉ
      setOeuvres(popular);
      setPagination({
        page: 1,
        limit: popular.length,
        total: popular.length,
        totalPages: 1
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des œuvres populaires';
      setError(errorMessage);
      console.error('❌ Erreur getPopularOeuvres:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const getRecentOeuvres = useCallback(async (limit: number = 10) => {
    setLoading(true);
    setError(null);
    
    try {
      const recent = await oeuvreService.getRecent(limit); // ✅ CORRIGÉ
      setOeuvres(recent);
      setPagination({
        page: 1,
        limit: recent.length,
        total: recent.length,
        totalPages: 1
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des œuvres récentes';
      setError(errorMessage);
      console.error('❌ Erreur getRecentOeuvres:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const getMyOeuvres = useCallback(async (filters: OeuvreFilters = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const myOeuvres = await oeuvreService.getMyOeuvres(filters); // ✅ CORRIGÉ
      setOeuvres(myOeuvres);
      setPagination({
        page: 1,
        limit: myOeuvres.length,
        total: myOeuvres.length,
        totalPages: 1
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement de vos œuvres';
      setError(errorMessage);
      console.error('❌ Erreur getMyOeuvres:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // ==========================================================================
  // ✅ VALIDATION ET MODÉRATION (CORRIGÉES)
  // ==========================================================================

  const validateOeuvre = useCallback(async (id: number, validation: ValidationOeuvreData): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      await oeuvreService.validate(id, validation); // ✅ CORRIGÉ
      const updatedOeuvre = await oeuvreService.getById(id); // ✅ CORRIGÉ
      setOeuvres(prev => prev.map(oeuvre => 
        oeuvre.id_oeuvre === id ? updatedOeuvre : oeuvre
      ));
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la validation de l\'œuvre';
      setError(errorMessage);
      console.error('❌ Erreur validateOeuvre:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const getPendingOeuvres = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const pending = await oeuvreService.getPendingValidation(); // ✅ CORRIGÉ
      setOeuvres(pending.data.items);
      setPagination({
        page: pending.data.pagination.page,
        limit: pending.data.pagination.limit,
        total: pending.data.pagination.total,
        totalPages: pending.data.pagination.pages
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des œuvres en attente';
      setError(errorMessage);
      console.error('❌ Erreur getPendingOeuvres:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // ==========================================================================
  // ✅ PERMISSIONS ET ACTIONS CONDITIONNELLES
  // ==========================================================================

  const canCreateOeuvre = useMemo(() => {
    // ✅ Version temporaire - à remplacer par le système de permissions
    if (!user) return false;
    return user.type_user !== 'visiteur' && user.professionnel_valide === true;
    // return permissions.oeuvre.canCreate(user); // ✅ À activer quand disponible
  }, [user]);

  const canModerateOeuvres = useMemo(() => {
    // ✅ Version temporaire
    if (!user?.Roles) return false;
    return user.Roles.some(role => ['Admin', 'Modérateur'].includes(role.nom_role));
    // return permissions.oeuvre.canValidate(user); // ✅ À activer quand disponible
  }, [user]);

  const canEditOeuvre = useCallback((oeuvre: Oeuvre) => {
    // ✅ Version temporaire
    if (!user) return false;
    return oeuvre.saisi_par === user.id_user || canModerateOeuvres;
    // return permissions.oeuvre.canEdit(user, oeuvre); // ✅ À activer quand disponible
  }, [user, canModerateOeuvres]);

  const canDeleteOeuvre = useCallback((oeuvre: Oeuvre) => {
    // ✅ Version temporaire
    if (!user) return false;
    return oeuvre.saisi_par === user.id_user || canModerateOeuvres;
    // return permissions.oeuvre.canDelete(user, oeuvre); // ✅ À activer quand disponible
  }, [user, canModerateOeuvres]);

  // ==========================================================================
  // ✅ STATISTIQUES ET MÉTRIQUES
  // ==========================================================================

  const getStatsByType = useCallback(() => {
    const stats: Record<string, number> = {};
    oeuvres.forEach(oeuvre => {
      const type = oeuvre.TypeOeuvre?.nom_type || 'Autre';
      stats[type] = (stats[type] || 0) + 1;
    });
    return stats;
  }, [oeuvres]);

  const getTotalByStatus = useCallback(() => {
    const stats: Record<string, number> = {};
    oeuvres.forEach(oeuvre => {
      const status = oeuvre.statut;
      stats[status] = (stats[status] || 0) + 1;
    });
    return stats;
  }, [oeuvres]);

  // ==========================================================================
  // ✅ UTILITAIRES
  // ==========================================================================

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const refresh = useCallback(async () => {
    await fetchOeuvres(lastFilters);
  }, [fetchOeuvres, lastFilters]);

  const resetPagination = useCallback(() => {
    setPagination({
      page: 1,
      limit: 12,
      total: 0,
      totalPages: 0
    });
  }, []);

  return {
    // Données principales
    oeuvres,
    loading,
    error,
    pagination,
    
    // Méthodes CRUD de base
    fetchOeuvres,
    getOeuvre,
    createOeuvre,
    updateOeuvre,
    deleteOeuvre,
    
    // ✅ Méthodes pour types spécifiques
    createWithSpecificDetails,
    addLivreDetails,
    addFilmDetails,
    addAlbumDetails,
    addArticleDetails,
    addArticleScientifiqueDetails,
    addArtisanatDetails,
    addOeuvreArtDetails,
    
    // ✅ Méthodes par type
    getOeuvresByType,
    getLivres,
    getFilms,
    getAlbums,
    getArticles,
    getArticlesScientifiques,
    getArtisanat,
    getOeuvresArt,
    
    // Méthodes de recherche
    searchOeuvres,
    getPopularOeuvres,
    getRecentOeuvres,
    getMyOeuvres,
    
    // ✅ Validation et modération
    validateOeuvre,
    getPendingOeuvres,
    
    // ✅ Permissions et actions conditionnelles
    canCreateOeuvre,
    canModerateOeuvres,
    canEditOeuvre,
    canDeleteOeuvre,
    
    // ✅ Statistiques et métriques
    getStatsByType,
    getTotalByStatus,
    
    // ✅ Utilitaires
    clearError,
    refresh,
    resetPagination
  };
};