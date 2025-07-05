// src/hooks/combined.ts - Hooks combinés CORRIGÉS
import { useCallback, useMemo } from 'react';
import { useApi, useMutation, usePaginatedApi, useSearchApi } from './useApi';
import { useAuth } from './useAuth';
import { useMetadata } from './useMetadata';
import { oeuvreService } from '../services/api/oeuvres';
import { evenementService } from '../services/api/evenements';
import { patrimoineService } from '../services/api/patrimoine';
import { permissions } from '../utils/permissions';
import type { OeuvreFilters, CreateOeuvreData } from '../types/oeuvre';
import type { EvenementFilters, CreateEvenementData } from '../types/event';
import type { LieuFilters } from '../types/place';
import type { PaginatedResponse } from '../config/api';
import { apiClient } from '../services/api/client';
import { API_ENDPOINTS } from '../config/api';

// ==========================================================================
// HOOK POUR LA PAGE D'ACCUEIL - CORRIGÉ
// ==========================================================================

export function useHomepageData() {
  // ✅ CORRIGÉ : Gestion d'erreur robuste pour éviter de casser l'UI
  const { 
    data: oeuvresRecentes, 
    isLoading: loadingOeuvres, 
    error: errorOeuvres,
    refetch: refetchOeuvres 
  } = useApi(
    async () => {
      try {
        const result = await oeuvreService.getRecent(6);
        console.log('✅ Œuvres récentes chargées:', result?.length || 0);
        return result || [];
      } catch (error) {
        console.warn('⚠️ Impossible de charger les œuvres récentes:', error);
        return []; // Retourner un tableau vide plutôt que throw
      }
    },
    { immediate: true }
  );

  const { 
    data: evenementsAVenir, 
    isLoading: loadingEvenements, 
    error: errorEvenements,
    refetch: refetchEvenements 
  } = useApi(
    async () => {
      try {
        const result = await evenementService.getUpcoming(6);
        console.log('✅ Événements à venir chargés:', result?.length || 0);
        return result || [];
      } catch (error) {
        console.warn('⚠️ Impossible de charger les événements à venir:', error);
        return [];
      }
    },
    { immediate: true }
  );

  const { 
    data: sitesPopulaires, 
    isLoading: loadingSites, 
    error: errorSites,
    refetch: refetchSites 
  } = useApi(
    async () => {
      try {
        const result = await patrimoineService.getPopulaires(6);
        console.log('✅ Sites populaires chargés:', result?.length || 0);
        return result || [];
      } catch (error) {
        console.warn('⚠️ Impossible de charger les sites populaires:', error);
        return [];
      }
    },
    { immediate: true }
  );

  // Métadonnées (optionnel)
  const { metadata, isLoading: loadingMetadata } = useMetadata();

  // ✅ STATS GLOBALES avec gestion d'erreur robuste
  const { 
    data: globalStats, 
    isLoading: loadingStats,
    refetch: refetchStats 
  } = useApi(
    async () => {
      try {
        // Essayer de récupérer les stats depuis un endpoint dédié
        const response = await apiClient.get(API_ENDPOINTS.STATS.DASHBOARD);
        return response;
      } catch (error) {
        console.warn('⚠️ Stats indisponibles, utilisation de valeurs par défaut');
        // Sinon calculer des stats basiques avec les données déjà chargées
        return {
          totalOeuvres: oeuvresRecentes?.length || 0,
          totalEvenements: evenementsAVenir?.length || 0,
          totalSites: sitesPopulaires?.length || 0,
          totalUsers: 0
        };
      }
    },
    { immediate: true }
  );

  // ✅ Chargement intelligent
  const isLoading = loadingOeuvres || loadingEvenements || loadingSites || loadingStats;

  // ✅ Indicateur de données disponibles
  const hasData = (oeuvresRecentes && oeuvresRecentes.length > 0) ||
                  (evenementsAVenir && evenementsAVenir.length > 0) ||
                  (sitesPopulaires && sitesPopulaires.length > 0);

  // ✅ Gestion des erreurs
  const errors = {
    oeuvres: errorOeuvres,
    evenements: errorEvenements,
    sites: errorSites
  };

  const hasErrors = !!(errorOeuvres || errorEvenements || errorSites);

  // ✅ Fonction refetch pour actualiser toutes les données
  const refetch = useCallback(async () => {
    console.log('🔄 Actualisation des données de la page d\'accueil...');
    try {
      await Promise.all([
        refetchOeuvres(),
        refetchEvenements(),
        refetchSites(),
        refetchStats()
      ]);
      console.log('✅ Données actualisées');
    } catch (error) {
      console.error('❌ Erreur lors de l\'actualisation:', error);
    }
  }, [refetchOeuvres, refetchEvenements, refetchSites, refetchStats]);

  return {
    // Données principales
    oeuvresRecentes: oeuvresRecentes || [],
    evenementsAVenir: evenementsAVenir || [],
    sitesPopulaires: sitesPopulaires || [],
    metadata,
    
    // État
    isLoading,
    hasData,
    hasErrors,
    errors,
    
    // Stats
    stats: globalStats || {
      totalOeuvres: 0,
      totalEvenements: 0,
      totalSites: 0,
      totalUsers: 0
    },
    
    // Actions
    refetch
  };
}

// ==========================================================================
// HOOKS POUR LES LISTES AVEC PAGINATION - CORRIGÉS
// ==========================================================================

export function useOeuvresList(
  filters: OeuvreFilters = {},
  options: { limit?: number } = {}
) {
  const { user } = useAuth();
  const { limit = 10 } = options;

  const {
    data: items,
    pagination,
    isLoading,
    error,
    page,
    goToPage,
    nextPage,
    prevPage,
    reset,
    refetch,
  } = usePaginatedApi(
    async (page: number, limit: number): Promise<PaginatedResponse<any>> => {
      try {
        return await oeuvreService.getAll({ ...filters, page, limit });
      } catch (error) {
        console.error('❌ Erreur lors du chargement des œuvres:', error);
        // ✅ Retourner une structure PaginatedResponse vide conforme
        return {
          data: {
            items: [],
            pagination: { page: 1, limit, total: 0, pages: 0 }
          }
        };
      }
    },
    { limit, immediate: true }
  );

  // Mutation pour créer une œuvre
  const createMutation = useMutation(
    async (data: CreateOeuvreData) => {
      try {
        return await oeuvreService.create(data);
      } catch (error) {
        console.error('❌ Erreur création œuvre:', error);
        throw error;
      }
    },
    {
      onSuccess: () => {
        console.log('✅ Œuvre créée, rechargement de la liste');
        refetch();
      },
    }
  );

  // Mutation pour supprimer une œuvre
  const deleteMutation = useMutation(
    async (id: number) => {
      try {
        return await oeuvreService.delete(id);
      } catch (error) {
        console.error('❌ Erreur suppression œuvre:', error);
        throw error;
      }
    },
    {
      onSuccess: () => {
        console.log('✅ Œuvre supprimée, rechargement de la liste');
        refetch();
      },
    }
  );

  // ✅ Vérifier les permissions (version simplifiée en attendant le système complet)
  const canCreate = useMemo(() => {
    if (!user) return false;
    // return permissions.oeuvre.canCreate(user); // ✅ À activer quand disponible
    return user.type_user !== 'visiteur' && user.professionnel_valide === true;
  }, [user]);

  const canModerate = useMemo(() => {
    if (!user?.Roles) return false;
    // return permissions.oeuvre.canValidate(user); // ✅ À activer quand disponible
    return user.Roles.some(role => ['Admin', 'Modérateur'].includes(role.nom_role));
  }, [user]);

  return {
    // Données
    oeuvres: items || [],
    pagination,

    // État
    isLoading,
    error,

    // Navigation
    page,
    goToPage,
    nextPage,
    prevPage,

    // Actions
    refetch,
    reset,
    createOeuvre: createMutation.mutate,
    deleteOeuvre: deleteMutation.mutate,

    // États des mutations
    isCreating: createMutation.isLoading,
    isDeleting: deleteMutation.isLoading,
    createError: createMutation.error,
    deleteError: deleteMutation.error,

    // Permissions
    canCreate,
    canModerate,
  };
}

export function useEvenementsList(
  filters: EvenementFilters = {},
  options: { limit?: number } = {}
) {
  const { user } = useAuth();
  const { limit = 10 } = options;

  const {
    data: items,
    pagination,
    isLoading,
    error,
    page,
    goToPage,
    nextPage,
    prevPage,
    reset,
    refetch,
  } = usePaginatedApi(
    async (page: number, limit: number): Promise<PaginatedResponse<any>> => {
      try {
        return await evenementService.getAll({ ...filters, page, limit });
      } catch (error) {
        console.error('❌ Erreur lors du chargement des événements:', error);
        // ✅ Retourner une structure PaginatedResponse vide conforme
        return {
          data: {
            items: [],
            pagination: { page: 1, limit, total: 0, pages: 0 }
          }
        };
      }
    },
    { limit, immediate: true }
  );

  // Mutation pour s'inscrire à un événement
  const inscriptionMutation = useMutation(
    async ({ id, data }: { id: number; data?: any }) => {
      try {
        return await evenementService.inscrire(id, data);
      } catch (error) {
        console.error('❌ Erreur inscription événement:', error);
        throw error;
      }
    },
    {
      onSuccess: () => {
        console.log('✅ Inscription réussie, rechargement');
        refetch();
      },
    }
  );

  // Mutation pour se désinscrire
  const desinscriptionMutation = useMutation(
    async (id: number) => {
      try {
        return await evenementService.desinscrire(id);
      } catch (error) {
        console.error('❌ Erreur désinscription événement:', error);
        throw error;
      }
    },
    {
      onSuccess: () => {
        console.log('✅ Désinscription réussie, rechargement');
        refetch();
      },
    }
  );

  return {
    // Données
    evenements: items || [],
    pagination,

    // État
    isLoading,
    error,

    // Navigation
    page,
    goToPage,
    nextPage,
    prevPage,

    // Actions
    refetch,
    reset,
    sInscrire: inscriptionMutation.mutate,
    seDesinscrire: desinscriptionMutation.mutate,

    // États des mutations
    isInscribing: inscriptionMutation.isLoading,
    isUnsubscribing: desinscriptionMutation.isLoading,
  };
}

// ✅ CORRIGÉ : usePatrimoineList avec gestion correcte des types
export function usePatrimoineList(
  filters: LieuFilters = {},
  options: { limit?: number } = {}
) {
  const { limit = 10 } = options;

  const {
    data: items,
    pagination,
    isLoading,
    error,
    page,
    goToPage,
    nextPage,
    prevPage,
    reset,
    refetch,
  } = usePaginatedApi(
    async (page: number, limit: number): Promise<PaginatedResponse<any>> => {
      try {
        // ✅ getAllSites retourne maintenant PaginatedResponse<Lieu>
        return await patrimoineService.getAllSites({ ...filters, page, limit });
      } catch (error) {
        console.error('❌ Erreur lors du chargement des sites:', error);
        // ✅ CORRIGÉ : Retourner une structure PaginatedResponse conforme
        return {
          data: {
            items: [],
            pagination: { page: 1, limit, total: 0, pages: 0 }
          }
        };
      }
    },
    { limit, immediate: true }
  );

  return {
    // Données
    sites: items || [],
    pagination,

    // État
    isLoading,
    error,

    // Navigation
    page,
    goToPage,
    nextPage,
    prevPage,

    // Actions
    refetch,
    reset,
  };
}

// ==========================================================================
// HOOK POUR LA RECHERCHE GLOBALE - CORRIGÉ
// ==========================================================================

export function useGlobalSearch() {
  const searchOeuvres = useSearchApi(
    async (query: string) => {
      try {
        return await oeuvreService.search(query);
      } catch (error) {
        console.warn('⚠️ Erreur recherche œuvres:', error);
        return [];
      }
    },
    { debounceMs: 300, minLength: 2 }
  );

  const searchEvenements = useSearchApi(
    async (query: string) => {
      try {
        return await evenementService.search(query);
      } catch (error) {
        console.warn('⚠️ Erreur recherche événements:', error);
        return [];
      }
    },
    { debounceMs: 300, minLength: 2 }
  );

  const searchPatrimoine = useSearchApi(
    async (query: string) => {
      try {
        return await patrimoineService.search(query);
      } catch (error) {
        console.warn('⚠️ Erreur recherche patrimoine:', error);
        return [];
      }
    },
    { debounceMs: 300, minLength: 2 }
  );

  const setGlobalQuery = useCallback(
    (query: string) => {
      console.log(`🔍 Recherche globale: "${query}"`);
      searchOeuvres.setQuery(query);
      searchEvenements.setQuery(query);
      searchPatrimoine.setQuery(query);
    },
    [searchOeuvres.setQuery, searchEvenements.setQuery, searchPatrimoine.setQuery]
  );

  const clearGlobalSearch = useCallback(() => {
    console.log('🧹 Nettoyage recherche globale');
    searchOeuvres.clearSearch();
    searchEvenements.clearSearch();
    searchPatrimoine.clearSearch();
  }, [searchOeuvres.clearSearch, searchEvenements.clearSearch, searchPatrimoine.clearSearch]);

  const isSearching =
    searchOeuvres.isSearching || searchEvenements.isSearching || searchPatrimoine.isSearching;
  
  const hasResults =
    searchOeuvres.results.length > 0 ||
    searchEvenements.results.length > 0 ||
    searchPatrimoine.results.length > 0;

  const totalResults =
    searchOeuvres.results.length +
    searchEvenements.results.length +
    searchPatrimoine.results.length;

  return {
    // Requête
    query: searchOeuvres.query,
    setQuery: setGlobalQuery,
    clearSearch: clearGlobalSearch,

    // Résultats
    oeuvres: searchOeuvres.results || [],
    evenements: searchEvenements.results || [],
    sites: searchPatrimoine.results || [],

    // État
    isSearching,
    hasResults,
    totalResults,
  };
}

// ==========================================================================
// HOOK POUR GÉRER UN PROFIL UTILISATEUR COMPLET - CORRIGÉ
// ==========================================================================

export function useUserProfile(userId?: number) {
  const { user: currentUser } = useAuth();
  const targetUserId = userId || currentUser?.id_user;
  const isOwnProfile = !userId || userId === currentUser?.id_user;

  // Données de l'utilisateur
  const { data: user, isLoading: loadingUser, refetch: refetchUser } = useApi(
    async () => {
      if (isOwnProfile && currentUser) {
        return currentUser;
      }
      if (targetUserId) {
        // TODO: Implémenter authService.getUserById(targetUserId) si nécessaire
        return currentUser; // Fallback temporaire
      }
      throw new Error('No user ID');
    },
    {
      immediate: !!targetUserId || isOwnProfile,
      dependencies: [targetUserId, isOwnProfile],
    }
  );

  // Œuvres de l'utilisateur
  const { data: oeuvres, isLoading: loadingOeuvres, refetch: refetchOeuvres } = useApi(
    async () => {
      if (!targetUserId) return [];
      try {
        if (isOwnProfile) {
          return await oeuvreService.getMyOeuvres();
        } else {
          // TODO: Implémenter oeuvreService.getByUser(targetUserId) si nécessaire
          return [];
        }
      } catch (error) {
        console.warn('⚠️ Impossible de charger les œuvres utilisateur:', error);
        return [];
      }
    },
    {
      immediate: !!targetUserId,
      dependencies: [targetUserId, isOwnProfile],
    }
  );

  // Événements de l'utilisateur
  const { data: evenements, isLoading: loadingEvenements, refetch: refetchEvenements } = useApi(
    async () => {
      if (!targetUserId) return [];
      try {
        return await evenementService.getMyEvents();
      } catch (error) {
        console.warn('⚠️ Impossible de charger les événements utilisateur:', error);
        return [];
      }
    },
    {
      immediate: !!targetUserId,
      dependencies: [targetUserId],
    }
  );

  // Mutation pour mettre à jour le profil (seulement si c'est son propre profil)
  const updateProfileMutation = useMutation(
    async (data: any) => {
      try {
        const { authService } = await import('../services/api/auth');
        return await authService.updateProfile(data);
      } catch (error) {
        console.error('❌ Erreur mise à jour profil:', error);
        throw error;
      }
    },
    {
      onSuccess: () => {
        console.log('✅ Profil mis à jour');
        refetchUser();
      },
    }
  );

  const refreshAll = useCallback(async () => {
    console.log('🔄 Actualisation du profil complet...');
    try {
      await Promise.all([refetchUser(), refetchOeuvres(), refetchEvenements()]);
      console.log('✅ Profil actualisé');
    } catch (error) {
      console.error('❌ Erreur actualisation profil:', error);
    }
  }, [refetchUser, refetchOeuvres, refetchEvenements]);

  const isLoading = loadingUser || loadingOeuvres || loadingEvenements;

  // Statistiques calculées
  const stats = useMemo(
    () => ({
      totalOeuvres: oeuvres?.length || 0,
      totalEvenements: evenements?.length || 0,
      oeuvresPubliees: oeuvres?.filter((o) => o.statut === 'publie').length || 0,
      evenementsAVenir:
        evenements?.filter((e) => new Date(e.date_debut || '') > new Date()).length || 0,
    }),
    [oeuvres, evenements]
  );

  return {
    // Données
    user,
    oeuvres: oeuvres || [],
    evenements: evenements || [],
    stats,

    // État
    isLoading,
    isOwnProfile,

    // Actions
    updateProfile: isOwnProfile ? updateProfileMutation.mutate : undefined,
    refreshAll,

    // États des mutations
    isUpdatingProfile: updateProfileMutation.isLoading,
    updateError: updateProfileMutation.error,
  };
}

// ==========================================================================
// HOOK POUR LES SUGGESTIONS ET RECOMMANDATIONS
// ==========================================================================

export function useSuggestions() {
  const { user } = useAuth();

  const { data: suggestions, isLoading, refetch } = useApi(
    async () => {
      if (!user) return { oeuvres: [], evenements: [], sites: [] };

      try {
        const [oeuvres, evenements, sites] = await Promise.allSettled([
          oeuvreService.getSuggestions('', 5),
          evenementService.getSuggestions('', 5),
          patrimoineService.getSuggestions('', 5),
        ]);

        return {
          oeuvres: oeuvres.status === 'fulfilled' ? oeuvres.value : [],
          evenements: evenements.status === 'fulfilled' ? evenements.value : [],
          sites: sites.status === 'fulfilled' ? sites.value : [],
        };
      } catch (error) {
        console.warn('⚠️ Erreur chargement suggestions:', error);
        return { oeuvres: [], evenements: [], sites: [] };
      }
    },
    {
      immediate: !!user,
      dependencies: [user?.id_user],
    }
  );

  return {
    suggestions: suggestions || { oeuvres: [], evenements: [], sites: [] },
    isLoading,
    refetch,
  };
}

// ==========================================================================
// HOOK POUR LES STATISTIQUES GLOBALES
// ==========================================================================

export function useGlobalStatistics() {
  const { data: stats, isLoading, error, refetch } = useApi(
    async () => {
      try {
        const [oeuvresStats, evenementsStats, patrimoineStats] = await Promise.allSettled([
          oeuvreService.getStatistics(),
          evenementService.getStatistics(),
          patrimoineService.getStatistiques(),
        ]);

        return {
          oeuvres: oeuvresStats.status === 'fulfilled' ? oeuvresStats.value : { total: 0 },
          evenements: evenementsStats.status === 'fulfilled' ? evenementsStats.value : { total: 0 },
          patrimoine: patrimoineStats.status === 'fulfilled' ? patrimoineStats.value : { total_sites: 0 },

          // Totaux combinés
          totals: {
            oeuvres: oeuvresStats.status === 'fulfilled' ? oeuvresStats.value?.total || 0 : 0,
            evenements: evenementsStats.status === 'fulfilled' ? evenementsStats.value?.total || 0 : 0,
            sites: patrimoineStats.status === 'fulfilled' ? patrimoineStats.value?.total_sites || 0 : 0,
          },
        };
      } catch (error) {
        console.warn('⚠️ Erreur chargement statistiques globales:', error);
        return {
          oeuvres: { total: 0 },
          evenements: { total: 0 },
          patrimoine: { total_sites: 0 },
          totals: { oeuvres: 0, evenements: 0, sites: 0 },
        };
      }
    },
    { immediate: true, cache: true }
  );

  return {
    statistics: stats,
    isLoading,
    error,
    refetch,
  };
}

// ==========================================================================
// HOOK POUR LA GÉOLOCALISATION ET PROXIMITÉ
// ==========================================================================

export function useGeolocation() {
  const { data: position, isLoading, error } = useApi(
    () =>
      new Promise<GeolocationPosition>((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error('Géolocalisation non supportée'));
          return;
        }

        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000, // 5 minutes
        });
      }),
    { immediate: false }
  );

  // Sites à proximité
  const { data: sitesProches, isLoading: loadingSites, execute: findNearby } = useApi(
    async () => {
      if (!position) return [];

      try {
        return await patrimoineService.getSitesProches({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          rayon: 10, // 10km par défaut
        });
      } catch (error) {
        console.warn('⚠️ Erreur recherche sites proches:', error);
        return [];
      }
    },
    {
      immediate: false,
      dependencies: [position],
    }
  );

  return {
    // Position
    position,
    coordinates: position
      ? {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }
      : null,

    // Sites proches
    sitesProches: sitesProches || [],

    // État
    isLoading: isLoading || loadingSites,
    error,

    // Actions
    findNearby,
  };
}