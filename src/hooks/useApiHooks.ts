// hooks/useApiHooks.ts - Hooks adaptés pour votre API existante

import { useState, useEffect, useCallback } from 'react';
import { useNotifications } from '../components/UI';
import type { 
  ApiResponse, 
  PaginatedResponse, 
  PaginationParams,
  SearchFilters 
} from '../types/base';
import type { Oeuvre, CreateOeuvreData, OeuvreFilters } from '../types/oeuvre';
import type { Evenement, CreateEvenementData, EvenementFilters } from '../types/event';
import type { Lieu, CreateLieuData, LieuFilters } from '../types/place';
import type { User } from '../types/user';

// =============================================================================
// HOOK GÉNÉRIQUE POUR APPELS API
// =============================================================================

export const useApi = <T>(
  apiCall: () => Promise<T>,
  options: {
    immediate?: boolean;
    dependencies?: any[];
    onSuccess?: (data: T) => void;
    onError?: (error: string) => void;
  } = {}
) => {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { addNotification } = useNotifications();

  const execute = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await apiCall();
      setData(result);
      
      if (options.onSuccess) {
        options.onSuccess(result);
      }
      
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(errorMessage);
      
      if (options.onError) {
        options.onError(errorMessage);
      } else {
        addNotification({
          type: 'error',
          title: 'Erreur',
          message: errorMessage
        });
      }
      
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [apiCall, options, addNotification]);

  useEffect(() => {
    if (options.immediate !== false) {
      execute();
    }
  }, options.dependencies || []);

  return {
    data,
    isLoading,
    error,
    execute,
    refetch: execute
  };
};

// =============================================================================
// HOOKS POUR LES ŒUVRES
// =============================================================================

export const useOeuvresList = (
  filters: OeuvreFilters = {},
  pagination: PaginationParams = { page: 1, limit: 12 }
) => {
  const [oeuvres, setOeuvres] = useState<Oeuvre[]>([]);
  const [paginationInfo, setPaginationInfo] = useState({
    page: 1,
    pages: 1,
    total: 0,
    limit: 12
  });
  const [currentPage, setCurrentPage] = useState(pagination.page || 1);

  const apiCall = useCallback(async () => {
    const token = localStorage.getItem('auth_token');
    const params = new URLSearchParams({
      page: currentPage.toString(),
      limit: pagination.limit?.toString() || '12',
      ...Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== undefined && value !== null)
      )
    });

    const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3001/api'}/oeuvres?${params}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    });

    if (!response.ok) {
      throw new Error(`Erreur ${response.status}: ${response.statusText}`);
    }

    const data: PaginatedResponse<Oeuvre> = await response.json();
    
    if (data.success) {
      setOeuvres(data.data.items);
      setPaginationInfo(data.data.pagination);
      return data.data.items;
    } else {
      throw new Error('Erreur lors du chargement des œuvres');
    }
  }, [filters, pagination.limit, currentPage]);

  const { isLoading, error, execute } = useApi(apiCall, {
    immediate: true,
    dependencies: [filters, currentPage]
  });

  const goToPage = (page: number) => {
    setCurrentPage(page);
  };

  const nextPage = () => {
    if (currentPage < paginationInfo.pages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return {
    oeuvres,
    pagination: paginationInfo,
    isLoading,
    error,
    page: currentPage,
    goToPage,
    nextPage,
    prevPage,
    canGoNext: currentPage < paginationInfo.pages,
    canGoPrev: currentPage > 1,
    refetch: execute
  };
};

export const useOeuvreDetail = (id: number) => {
  const apiCall = useCallback(async () => {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3001/api'}/oeuvres/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Œuvre non trouvée');
      }
      throw new Error(`Erreur ${response.status}: ${response.statusText}`);
    }

    const data: ApiResponse<Oeuvre> = await response.json();
    
    if (data.success && data.data) {
      return data.data;
    } else {
      throw new Error(data.message || 'Erreur lors du chargement de l\'œuvre');
    }
  }, [id]);

  return useApi(apiCall, {
    immediate: true,
    dependencies: [id]
  });
};

export const useCreateOeuvre = () => {
  const { addNotification } = useNotifications();
  const [isLoading, setIsLoading] = useState(false);

  const createOeuvre = useCallback(async (oeuvreData: CreateOeuvreData): Promise<Oeuvre> => {
    setIsLoading(true);
    
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3001/api'}/oeuvres`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify(oeuvreData)
      });

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      const data: ApiResponse<Oeuvre> = await response.json();
      
      if (data.success && data.data) {
        addNotification({
          type: 'success',
          title: 'Œuvre créée',
          message: 'Votre œuvre a été ajoutée avec succès'
        });
        return data.data;
      } else {
        throw new Error(data.message || 'Erreur lors de la création de l\'œuvre');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      addNotification({
        type: 'error',
        title: 'Erreur',
        message: errorMessage
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [addNotification]);

  return {
    createOeuvre,
    isLoading
  };
};

// =============================================================================
// HOOKS POUR LES ÉVÉNEMENTS
// =============================================================================

export const useEvenementsList = (
  filters: EvenementFilters = {},
  pagination: PaginationParams = { page: 1, limit: 12 }
) => {
  const [evenements, setEvenements] = useState<Evenement[]>([]);
  const [paginationInfo, setPaginationInfo] = useState({
    page: 1,
    pages: 1,
    total: 0,
    limit: 12
  });
  const [currentPage, setCurrentPage] = useState(pagination.page || 1);

  const apiCall = useCallback(async () => {
    const token = localStorage.getItem('auth_token');
    const params = new URLSearchParams({
      page: currentPage.toString(),
      limit: pagination.limit?.toString() || '12',
      ...Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== undefined && value !== null)
      )
    });

    const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3001/api'}/evenements?${params}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    });

    if (!response.ok) {
      throw new Error(`Erreur ${response.status}: ${response.statusText}`);
    }

    const data: PaginatedResponse<Evenement> = await response.json();
    
    if (data.success) {
      setEvenements(data.data.items);
      setPaginationInfo(data.data.pagination);
      return data.data.items;
    } else {
      throw new Error('Erreur lors du chargement des événements');
    }
  }, [filters, pagination.limit, currentPage]);

  const { isLoading, error, execute } = useApi(apiCall, {
    immediate: true,
    dependencies: [filters, currentPage]
  });

  const goToPage = (page: number) => setCurrentPage(page);
  const nextPage = () => currentPage < paginationInfo.pages && setCurrentPage(currentPage + 1);
  const prevPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);

  return {
    evenements,
    pagination: paginationInfo,
    isLoading,
    error,
    page: currentPage,
    goToPage,
    nextPage,
    prevPage,
    canGoNext: currentPage < paginationInfo.pages,
    canGoPrev: currentPage > 1,
    refetch: execute
  };
};

// =============================================================================
// HOOKS POUR LES LIEUX PATRIMONIAUX
// =============================================================================

export const usePatrimoineList = (
  filters: LieuFilters = {},
  pagination: PaginationParams = { page: 1, limit: 12 }
) => {
  const [sites, setSites] = useState<Lieu[]>([]);
  const [paginationInfo, setPaginationInfo] = useState({
    page: 1,
    pages: 1,
    total: 0,
    limit: 12
  });
  const [currentPage, setCurrentPage] = useState(pagination.page || 1);

  const apiCall = useCallback(async () => {
    const token = localStorage.getItem('auth_token');
    const params = new URLSearchParams({
      page: currentPage.toString(),
      limit: pagination.limit?.toString() || '12',
      ...Object.fromEntries(
        Object.entries(filters).filter(([_, value]) => value !== undefined && value !== null)
      )
    });

    const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3001/api'}/lieux?${params}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    });

    if (!response.ok) {
      throw new Error(`Erreur ${response.status}: ${response.statusText}`);
    }

    const data: PaginatedResponse<Lieu> = await response.json();
    
    if (data.success) {
      setSites(data.data.items);
      setPaginationInfo(data.data.pagination);
      return data.data.items;
    } else {
      throw new Error('Erreur lors du chargement des sites');
    }
  }, [filters, pagination.limit, currentPage]);

  const { isLoading, error, execute } = useApi(apiCall, {
    immediate: true,
    dependencies: [filters, currentPage]
  });

  const goToPage = (page: number) => setCurrentPage(page);
  const nextPage = () => currentPage < paginationInfo.pages && setCurrentPage(currentPage + 1);
  const prevPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);

  return {
    sites,
    pagination: paginationInfo,
    isLoading,
    error,
    page: currentPage,
    goToPage,
    nextPage,
    prevPage,
    canGoNext: currentPage < paginationInfo.pages,
    canGoPrev: currentPage > 1,
    refetch: execute
  };
};

// =============================================================================
// HOOK POUR LES DONNÉES D'ACCUEIL
// =============================================================================

export const useHomepageData = () => {
  const [oeuvresRecentes, setOeuvresRecentes] = useState<Oeuvre[]>([]);
  const [evenementsAVenir, setEvenementsAVenir] = useState<Evenement[]>([]);
  const [sitesPopulaires, setSitesPopulaires] = useState<Lieu[]>([]);
  const [stats, setStats] = useState({
    totalOeuvres: 0,
    totalEvenements: 0,
    totalSites: 0,
    totalUsers: 0
  });

  const apiCall = useCallback(async () => {
    const token = localStorage.getItem('auth_token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };

    // Appels parallèles
    const [oeuvresRes, evenementsRes, lieuxRes, statsRes] = await Promise.allSettled([
      fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3001/api'}/oeuvres?limit=6&sort=date_creation&order=DESC&statut=publie`, { headers }),
      fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3001/api'}/evenements?limit=6&upcoming=true&sort=date_debut&order=ASC`, { headers }),
      fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3001/api'}/lieux?limit=6&sort=note_moyenne&order=DESC`, { headers }),
      fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3001/api'}/stats/dashboard`, { headers })
    ]);

    // Traitement des œuvres
    if (oeuvresRes.status === 'fulfilled' && oeuvresRes.value.ok) {
      const data: PaginatedResponse<Oeuvre> = await oeuvresRes.value.json();
      if (data.success) {
        setOeuvresRecentes(data.data.items);
      }
    }

    // Traitement des événements
    if (evenementsRes.status === 'fulfilled' && evenementsRes.value.ok) {
      const data: PaginatedResponse<Evenement> = await evenementsRes.value.json();
      if (data.success) {
        setEvenementsAVenir(data.data.items);
      }
    }

    // Traitement des lieux
    if (lieuxRes.status === 'fulfilled' && lieuxRes.value.ok) {
      const data: PaginatedResponse<Lieu> = await lieuxRes.value.json();
      if (data.success) {
        setSitesPopulaires(data.data.items);
      }
    }

    // Traitement des stats
    if (statsRes.status === 'fulfilled' && statsRes.value.ok) {
      const data: ApiResponse<any> = await statsRes.value.json();
      if (data.success && data.data) {
        setStats({
          totalOeuvres: data.data.totalOeuvres || 0,
          totalEvenements: data.data.totalEvenements || 0,
          totalSites: data.data.totalSites || 0,
          totalUsers: data.data.totalUsers || 0
        });
      }
    }

    return {
      oeuvresRecentes,
      evenementsAVenir,
      sitesPopulaires,
      stats
    };
  }, []);

  const { isLoading, error, execute } = useApi(apiCall, {
    immediate: true
  });

  return {
    oeuvresRecentes,
    evenementsAVenir,
    sitesPopulaires,
    stats,
    isLoading,
    error,
    refetch: execute
  };
};

// =============================================================================
// HOOK POUR LA RECHERCHE GLOBALE
// =============================================================================

export const useGlobalSearch = (debounceMs: number = 300) => {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState({
    oeuvres: [] as Oeuvre[],
    evenements: [] as Evenement[],
    sites: [] as Lieu[]
  });
  const [isSearching, setIsSearching] = useState(false);

  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setSearchResults({ oeuvres: [], evenements: [], sites: [] });
      return;
    }

    try {
      setIsSearching(true);
      const token = localStorage.getItem('auth_token');
      
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || 'http://localhost:3001/api'}/search?q=${encodeURIComponent(searchQuery)}&limit=5`,
        {
          headers: {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
          }
        }
      );

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}`);
      }

      const data: ApiResponse<any> = await response.json();
      
      if (data.success && data.data) {
        setSearchResults({
          oeuvres: Array.isArray(data.data.oeuvres) ? data.data.oeuvres : [],
          evenements: Array.isArray(data.data.evenements) ? data.data.evenements : [],
          sites: Array.isArray(data.data.sites) ? data.data.sites : []
        });
      }
    } catch (error) {
      console.error('Erreur de recherche:', error);
      setSearchResults({ oeuvres: [], evenements: [], sites: [] });
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(query);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, debounceMs, performSearch]);

  const hasResults = searchResults.oeuvres.length > 0 || 
                    searchResults.evenements.length > 0 || 
                    searchResults.sites.length > 0;

  const clearSearch = () => {
    setQuery('');
    setSearchResults({ oeuvres: [], evenements: [], sites: [] });
  };

  return {
    query,
    setQuery,
    oeuvres: searchResults.oeuvres,
    evenements: searchResults.evenements,
    sites: searchResults.sites,
    isSearching,
    hasResults,
    clearSearch
  };
};

// =============================================================================
// HOOK POUR LES MÉTADONNÉES
// =============================================================================

export const useMetadata = () => {
  const [options, setOptions] = useState({
    typesOeuvres: [],
    langues: [],
    categories: [],
    wilayas: [],
    typesEvenements: []
  });

  const apiCall = useCallback(async () => {
    const token = localStorage.getItem('auth_token');
    const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3001/api'}/metadata`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    });

    if (!response.ok) {
      throw new Error(`Erreur ${response.status}: ${response.statusText}`);
    }

    const data: ApiResponse<any> = await response.json();
    
    if (data.success && data.data) {
      setOptions({
        typesOeuvres: data.data.typesOeuvres || [],
        langues: data.data.langues || [],
        categories: data.data.categories || [],
        wilayas: data.data.wilayas || [],
        typesEvenements: data.data.typesEvenements || []
      });
      return data.data;
    } else {
      throw new Error('Erreur lors du chargement des métadonnées');
    }
  }, []);

  const { isLoading, error, execute } = useApi(apiCall, {
    immediate: true
  });

  return {
    options,
    isLoading,
    error,
    refetch: execute
  };
};