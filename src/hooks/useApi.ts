// src/hooks/useApi.ts - Hook API générique avec cache et états
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';

// ==========================================================================
// TYPES ET INTERFACES
// ==========================================================================

interface UseApiState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  isSuccess: boolean;
  isError: boolean;
}

interface UseApiOptions {
  immediate?: boolean;
  cache?: boolean;
  dependencies?: any[];
  onSuccess?: (data: any) => void;
  onError?: (error: string) => void;
  retryAttempts?: number;
  retryDelay?: number;
}

interface UseApiReturn<T> extends UseApiState<T> {
  execute: () => Promise<void>;
  refetch: () => Promise<void>;
  reset: () => void;
  retry: () => Promise<void>;
}

interface UseMutationOptions<TData, TVariables> {
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: string, variables: TVariables) => void;
  onSettled?: (data: TData | null, error: string | null, variables: TVariables) => void;
}

interface UseMutationReturn<TData, TVariables> {
  mutate: (variables: TVariables) => Promise<void>;
  mutateAsync: (variables: TVariables) => Promise<TData>;
  data: TData | null;
  isLoading: boolean;
  error: string | null;
  isSuccess: boolean;
  isError: boolean;
  reset: () => void;
}

// ==========================================================================
// HOOK PRINCIPAL useApi
// ==========================================================================

export function useApi<T>(
  apiCall: () => Promise<T>,
  options: UseApiOptions = {}
): UseApiReturn<T> {
  const {
    immediate = true,
    cache = true,
    dependencies = [],
    onSuccess,
    onError,
    retryAttempts = 0,
    retryDelay = 1000,
  } = options;

  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    isLoading: immediate,
    error: null,
    isSuccess: false,
    isError: false,
  });

  const retryCountRef = useRef(0);
  const mountedRef = useRef(true);

  // Nettoyage au démontage
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const execute = useCallback(async () => {
    if (!mountedRef.current) return;

    try {
      setState(prev => ({
        ...prev,
        isLoading: true,
        error: null,
        isSuccess: false,
        isError: false,
      }));

      console.log('🚀 Exécution de l\'appel API...');
      const result = await apiCall();

      if (!mountedRef.current) return;

      setState({
        data: result,
        isLoading: false,
        error: null,
        isSuccess: true,
        isError: false,
      });

      retryCountRef.current = 0;
      onSuccess?.(result);
      console.log('✅ Appel API réussi');
    } catch (error) {
      if (!mountedRef.current) return;

      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      
      console.error('❌ Erreur API:', errorMessage);

      setState({
        data: null,
        isLoading: false,
        error: errorMessage,
        isSuccess: false,
        isError: true,
      });

      onError?.(errorMessage);

      // Retry automatique si configuré
      if (retryCountRef.current < retryAttempts) {
        retryCountRef.current++;
        console.log(`🔄 Tentative ${retryCountRef.current}/${retryAttempts} dans ${retryDelay}ms...`);
        
        setTimeout(() => {
          if (mountedRef.current) {
            execute();
          }
        }, retryDelay);
      }
    }
  }, [apiCall, onSuccess, onError, retryAttempts, retryDelay]);

  const reset = useCallback(() => {
    setState({
      data: null,
      isLoading: false,
      error: null,
      isSuccess: false,
      isError: false,
    });
    retryCountRef.current = 0;
  }, []);

  const retry = useCallback(async () => {
    retryCountRef.current = 0;
    await execute();
  }, [execute]);

  // Exécution automatique
  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [immediate, ...dependencies]);

  return {
    ...state,
    execute,
    refetch: execute,
    reset,
    retry,
  };
}

// ==========================================================================
// HOOK useMutation - POUR LES ACTIONS (POST, PUT, DELETE)
// ==========================================================================

export function useMutation<TData = any, TVariables = any>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options: UseMutationOptions<TData, TVariables> = {}
): UseMutationReturn<TData, TVariables> {
  const { onSuccess, onError, onSettled } = options;

  const [state, setState] = useState<{
    data: TData | null;
    isLoading: boolean;
    error: string | null;
    isSuccess: boolean;
    isError: boolean;
  }>({
    data: null,
    isLoading: false,
    error: null,
    isSuccess: false,
    isError: false,
  });

  const mutateAsync = useCallback(
    async (variables: TVariables): Promise<TData> => {
      try {
        setState(prev => ({
          ...prev,
          isLoading: true,
          error: null,
          isSuccess: false,
          isError: false,
        }));

        console.log('🚀 Exécution de la mutation...');
        const result = await mutationFn(variables);

        setState({
          data: result,
          isLoading: false,
          error: null,
          isSuccess: true,
          isError: false,
        });

        onSuccess?.(result, variables);
        onSettled?.(result, null, variables);
        console.log('✅ Mutation réussie');

        return result;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
        
        console.error('❌ Erreur mutation:', errorMessage);

        setState({
          data: null,
          isLoading: false,
          error: errorMessage,
          isSuccess: false,
          isError: true,
        });

        onError?.(errorMessage, variables);
        onSettled?.(null, errorMessage, variables);

        throw error;
      }
    },
    [mutationFn, onSuccess, onError, onSettled]
  );

  const mutate = useCallback(
    async (variables: TVariables) => {
      try {
        await mutateAsync(variables);
      } catch (error) {
        // L'erreur est déjà gérée dans mutateAsync
      }
    },
    [mutateAsync]
  );

  const reset = useCallback(() => {
    setState({
      data: null,
      isLoading: false,
      error: null,
      isSuccess: false,
      isError: false,
    });
  }, []);

  return {
    mutate,
    mutateAsync,
    ...state,
    reset,
  };
}

// ==========================================================================
// HOOKS SPÉCIALISÉS POUR VOTRE APPLICATION
// ==========================================================================

// Hook pour les données paginées - VERSION CORRIGÉE
export function usePaginatedApi<T>(
  apiCall: (page: number, limit: number) => Promise<{ data: { items: T[]; pagination: any } }>,
  options: { limit?: number; immediate?: boolean } = {}
) {
  const { limit = 10, immediate = true } = options;
  const [page, setPage] = useState(1);

  const {
    data,
    isLoading,
    error,
    execute,
    reset
  } = useApi(
    () => apiCall(page, limit),
    {
      immediate,
      dependencies: [page, limit],
      cache: true,
    }
  );

  // ✅ CORRIGÉ : Créer une pagination sécurisée avec des valeurs par défaut
  const safePagination = useMemo(() => {
    const apiPagination = data?.data?.pagination;
    
    if (!apiPagination) {
      return {
        page: page,
        limit: limit,
        total: data?.data?.items?.length || 0,
        totalPages: 1,
        pages: 1, // Alias pour compatibilité
        hasNextPage: false,
        hasPrevPage: false
      };
    }

    // Normaliser les différents formats de pagination
    const totalPages = apiPagination.pages || apiPagination.totalPages || Math.ceil((apiPagination.total || 0) / (apiPagination.limit || limit)) || 1;
    
    return {
      page: apiPagination.page || page,
      limit: apiPagination.limit || limit,
      total: apiPagination.total || 0,
      totalPages: totalPages,
      pages: totalPages, // Alias pour compatibilité
      hasNextPage: (apiPagination.page || page) < totalPages,
      hasPrevPage: (apiPagination.page || page) > 1
    };
  }, [data, page, limit]);

  const goToPage = useCallback((newPage: number) => {
    if (newPage >= 1 && newPage <= safePagination.totalPages) {
      setPage(newPage);
    }
  }, [safePagination.totalPages]);

  const nextPage = useCallback(() => {
    if (safePagination.hasNextPage) {
      setPage(prev => prev + 1);
    }
  }, [safePagination.hasNextPage]);

  const prevPage = useCallback(() => {
    if (safePagination.hasPrevPage) {
      setPage(prev => prev - 1);
    }
  }, [safePagination.hasPrevPage]);

  const resetPagination = useCallback(() => {
    setPage(1);
    reset();
  }, [reset]);

  return {
    data: data?.data?.items || [],
    pagination: safePagination, // ✅ Toujours un objet, jamais null
    isLoading,
    error,
    page,
    goToPage,
    nextPage,
    prevPage,
    reset: resetPagination,
    refetch: execute,
  };
}

// Hook pour les recherches avec debounce
export function useSearchApi<T>(
  searchFn: (query: string) => Promise<T[]>,
  options: { debounceMs?: number; minLength?: number } = {}
) {
  const { debounceMs = 300, minLength = 2 } = options;
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce de la query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, debounceMs]);

  const {
    data,
    isLoading,
    error,
    execute
  } = useApi(
    () => searchFn(debouncedQuery),
    {
      immediate: false,
      dependencies: [debouncedQuery],
      cache: true,
    }
  );

  // Exécuter la recherche seulement si la query est assez longue
  useEffect(() => {
    if (debouncedQuery.length >= minLength) {
      execute();
    }
  }, [debouncedQuery, minLength, execute]);

  const clearSearch = useCallback(() => {
    setQuery('');
    setDebouncedQuery('');
  }, []);

  return {
    query,
    setQuery,
    results: data || [],
    isSearching: isLoading,
    error,
    clearSearch,
  };
}

// Hook pour gérer les états de liste avec optimistic updates
export function useListWithMutations<T extends { id?: number; id_oeuvre?: number; id_evenement?: number }>(
  fetchFn: () => Promise<T[]>,
  options: { immediate?: boolean } = {}
) {
  const { immediate = true } = options;

  const {
    data: items,
    isLoading,
    error,
    refetch
  } = useApi(fetchFn, { immediate, cache: true });

  const [optimisticItems, setOptimisticItems] = useState<T[]>([]);

  // Synchroniser avec les données du serveur
  useEffect(() => {
    if (items) {
      setOptimisticItems(items);
    }
  }, [items]);

  const addOptimistic = useCallback((item: T) => {
    setOptimisticItems(prev => [item, ...prev]);
  }, []);

  const updateOptimistic = useCallback((id: number, updates: Partial<T>) => {
    setOptimisticItems(prev =>
      prev.map(item => {
        const itemId = item.id || item.id_oeuvre || item.id_evenement;
        return itemId === id ? { ...item, ...updates } : item;
      })
    );
  }, []);

  const removeOptimistic = useCallback((id: number) => {
    setOptimisticItems(prev =>
      prev.filter(item => {
        const itemId = item.id || item.id_oeuvre || item.id_evenement;
        return itemId !== id;
      })
    );
  }, []);

  return {
    items: optimisticItems,
    isLoading,
    error,
    refetch,
    addOptimistic,
    updateOptimistic,
    removeOptimistic,
  };
}

// ==========================================================================
// UTILITAIRES
// ==========================================================================

// Hook pour gérer plusieurs appels API en parallèle
export function useMultipleApi<T extends Record<string, any>>(
  apiCalls: T,
  options: { immediate?: boolean } = {}
): {
  [K in keyof T]: {
    data: T[K] extends () => Promise<infer R> ? R | null : never;
    isLoading: boolean;
    error: string | null;
  };
} & {
  isAllLoading: boolean;
  hasAnyError: boolean;
  refetchAll: () => Promise<void>;
} {
  const { immediate = true } = options;

  const results = {} as any;
  const refetchFunctions: (() => Promise<void>)[] = [];

  for (const [key, apiCall] of Object.entries(apiCalls)) {
    const { data, isLoading, error, refetch } = useApi(apiCall as () => Promise<any>, {
      immediate,
      cache: true,
    });

    results[key] = { data, isLoading, error };
    refetchFunctions.push(refetch);
  }

  const isAllLoading = Object.values(results).some((result: any) => result.isLoading);
  const hasAnyError = Object.values(results).some((result: any) => result.error);

  const refetchAll = useCallback(async () => {
    await Promise.all(refetchFunctions.map(fn => fn()));
  }, [refetchFunctions]);

  return {
    ...results,
    isAllLoading,
    hasAnyError,
    refetchAll,
  };
}