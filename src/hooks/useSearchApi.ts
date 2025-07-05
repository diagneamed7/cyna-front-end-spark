// src/hooks/useSearchApi.ts
import { useState, useEffect, useCallback } from 'react';
import { useApi } from './useApi';

interface UseSearchApiOptions {
  debounceMs?: number;
  minLength?: number;
}

export function useSearchApi<T>(
  searchFn: (query: string) => Promise<T[]>,
  options: UseSearchApiOptions = {}
) {
  const { debounceMs = 300, minLength = 2 } = options;
  const [query, setQuery] = useState<string>('');
  const [debouncedQuery, setDebouncedQuery] = useState<string>('');

  // Met en place le debounce pour la query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, debounceMs]);

  // Appelle useApi pour lancer la recherche lorsque debouncedQuery change
  const {
    data,
    isLoading,
    error,
    execute,
  } = useApi<T[]>(
    () => searchFn(debouncedQuery),
    {
      immediate: false,
      dependencies: [debouncedQuery],
      cache: true,
    }
  );

  // Ne lancer l’exécution que si la query atteint la longueur minimale
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
