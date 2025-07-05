// hooks/useUtilities.ts - Hooks utilitaires pour l'interface utilisateur

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import type { FormState, FormErrors } from '../types/base';
import { utils } from '../utils';

// =============================================================================
// HOOK DE GESTION DE FORMULAIRES
// =============================================================================

interface UseFormOptions<T> {
  initialValues: T;
  validate?: (values: T) => FormErrors;
  onSubmit?: (values: T) => Promise<void> | void;
}

export function useForm<T extends Record<string, any>>(options: UseFormOptions<T>) {
  const { initialValues, validate, onSubmit } = options;
  
  const [state, setState] = useState<FormState<T>>({
    values: initialValues,
    errors: {},
    isSubmitting: false,
    isValid: true,
  });

  // Mettre à jour une valeur
  const setValue = useCallback((name: keyof T, value: any) => {
    setState(prev => ({
      ...prev,
      values: { ...prev.values, [name]: value },
      errors: { ...prev.errors, [name]: undefined },
    }));
  }, []);

  // Mettre à jour plusieurs valeurs
  const setValues = useCallback((newValues: Partial<T>) => {
    setState(prev => ({
      ...prev,
      values: { ...prev.values, ...newValues },
    }));
  }, []);

  // Valider le formulaire
  const validateForm = useCallback(() => {
    if (!validate) return true;
    
    const errors = validate(state.values);
    const isValid = Object.keys(errors).length === 0;
    
    setState(prev => ({
      ...prev,
      errors,
      isValid,
    }));
    
    return isValid;
  }, [validate, state.values]);

  // Soumettre le formulaire
  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!validateForm() || !onSubmit) return;
    
    setState(prev => ({ ...prev, isSubmitting: true }));
    
    try {
      await onSubmit(state.values);
    } catch (error) {
      console.error('Erreur de soumission:', error);
    } finally {
      setState(prev => ({ ...prev, isSubmitting: false }));
    }
  }, [validateForm, onSubmit, state.values]);

  // Réinitialiser le formulaire
  const reset = useCallback(() => {
    setState({
      values: initialValues,
      errors: {},
      isSubmitting: false,
      isValid: true,
    });
  }, [initialValues]);

  // Définir une erreur manuellement
  const setError = useCallback((name: keyof T, error: string) => {
    setState(prev => ({
      ...prev,
      errors: { ...prev.errors, [name]: error },
      isValid: false,
    }));
  }, []);

  return {
    values: state.values,
    errors: state.errors,
    isSubmitting: state.isSubmitting,
    isValid: state.isValid,
    setValue,
    setValues,
    setError,
    validateForm,
    handleSubmit,
    reset,
    isDirty: JSON.stringify(state.values) !== JSON.stringify(initialValues),
  };
}

// =============================================================================
// HOOK DE RECHERCHE AVEC DEBOUNCE
// =============================================================================

interface UseSearchOptions {
  minLength?: number;
  delay?: number;
}

export function useSearch<T>(
  searchFunction: (query: string) => Promise<T[]>,
  options: UseSearchOptions = {}
) {
  const { minLength = 2, delay = 300 } = options;
  
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<T[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fonction de recherche avec debounce
  const debouncedSearch = useMemo(
    () => utils.performance.debounce(async (searchQuery: string) => {
      if (searchQuery.length < minLength) {
        setResults([]);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      setError(null);

      try {
        const searchResults = await searchFunction(searchQuery);
        setResults(searchResults);
      } catch (err: any) {
        setError(err.message || 'Erreur de recherche');
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, delay),
    [searchFunction, minLength, delay]
  );

  // Effet pour déclencher la recherche
  useEffect(() => {
    debouncedSearch(query);
  }, [query, debouncedSearch]);

  const clearSearch = useCallback(() => {
    setQuery('');
    setResults([]);
    setError(null);
  }, []);

  return {
    query,
    setQuery,
    results,
    isSearching,
    error,
    clearSearch,
    hasResults: results.length > 0,
  };
}

// =============================================================================
// HOOK DE MODAL/DIALOG
// =============================================================================

export function useModal() {
  const [isOpen, setIsOpen] = useState(false);

  const openModal = useCallback(() => setIsOpen(true), []);
  const closeModal = useCallback(() => setIsOpen(false), []);
  const toggleModal = useCallback(() => setIsOpen(prev => !prev), []);

  return {
    isOpen,
    openModal,
    closeModal,
    toggleModal,
  };
}

// =============================================================================
// HOOK DE NOTIFICATION/TOAST
// =============================================================================

interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  duration?: number;
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast = { ...toast, id };
    
    setToasts(prev => [...prev, newToast]);

    // Supprimer automatiquement après la durée spécifiée
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, toast.duration || 5000);

    return id;
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const success = useCallback((message: string, duration?: number) => {
    return addToast({ type: 'success', message, duration });
  }, [addToast]);

  const error = useCallback((message: string, duration?: number) => {
    return addToast({ type: 'error', message, duration });
  }, [addToast]);

  const warning = useCallback((message: string, duration?: number) => {
    return addToast({ type: 'warning', message, duration });
  }, [addToast]);

  const info = useCallback((message: string, duration?: number) => {
    return addToast({ type: 'info', message, duration });
  }, [addToast]);

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info,
  };
}

// =============================================================================
// HOOK DE PAGINATION
// =============================================================================

interface UsePaginationOptions {
  initialPage?: number;
  pageSize?: number;
  totalItems?: number;
}

export function usePagination(options: UsePaginationOptions = {}) {
  const { initialPage = 1, pageSize = 10, totalItems = 0 } = options;
  
  const [currentPage, setCurrentPage] = useState(initialPage);

  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);

  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  }, [totalPages]);

  const nextPage = useCallback(() => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  }, [currentPage, totalPages]);

  const prevPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  }, [currentPage]);

  const reset = useCallback(() => {
    setCurrentPage(1);
  }, []);

  return {
    currentPage,
    totalPages,
    pageSize,
    totalItems,
    startIndex,
    endIndex,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
    goToPage,
    nextPage,
    prevPage,
    reset,
  };
}

// =============================================================================
// HOOK DE STOCKAGE LOCAL
// =============================================================================

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    return utils.storage.get<T>(key) ?? initialValue;
  });

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    const valueToStore = value instanceof Function ? value(storedValue) : value;
    setStoredValue(valueToStore);
    utils.storage.set(key, valueToStore);
  }, [key, storedValue]);

  const removeValue = useCallback(() => {
    setStoredValue(initialValue);
    utils.storage.remove(key);
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue] as const;
}

// =============================================================================
// HOOK DE DÉTECTION DE LA TAILLE D'ÉCRAN
// =============================================================================

export function useBreakpoint() {
  const [breakpoint, setBreakpoint] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');

  useEffect(() => {
    const checkBreakpoint = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setBreakpoint('mobile');
      } else if (width < 1024) {
        setBreakpoint('tablet');
      } else {
        setBreakpoint('desktop');
      }
    };

    checkBreakpoint();
    window.addEventListener('resize', checkBreakpoint);

    return () => window.removeEventListener('resize', checkBreakpoint);
  }, []);

  return {
    breakpoint,
    isMobile: breakpoint === 'mobile',
    isTablet: breakpoint === 'tablet',
    isDesktop: breakpoint === 'desktop',
    isMobileOrTablet: breakpoint === 'mobile' || breakpoint === 'tablet',
  };
}

// =============================================================================
// HOOK D'INTERSECTION OBSERVER
// =============================================================================

export function useIntersectionObserver(
  options: IntersectionObserverInit = {}
) {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasIntersected, setHasIntersected] = useState(false);
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
      if (entry.isIntersecting && !hasIntersected) {
        setHasIntersected(true);
      }
    }, options);

    observer.observe(element);

    return () => observer.disconnect();
  }, [options, hasIntersected]);

  return {
    elementRef,
    isIntersecting,
    hasIntersected,
  };
}

// =============================================================================
// HOOK DE COPIE DANS LE PRESSE-PAPIERS
// =============================================================================

export function useClipboard() {
  const [isCopied, setIsCopied] = useState(false);

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
      return true;
    } catch (error) {
      console.error('Erreur lors de la copie:', error);
      return false;
    }
  }, []);

  return {
    isCopied,
    copyToClipboard,
  };
}

// =============================================================================
// HOOK DE GESTION D'ÉTAT ASYNC
// =============================================================================

export function useAsync<T, E = Error>(
  asyncFunction: () => Promise<T>,
  immediate = false
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState<E | null>(null);

  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await asyncFunction();
      setData(result);
      return result;
    } catch (err) {
      setError(err as E);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [asyncFunction]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return {
    data,
    loading,
    error,
    execute,
    reset,
  };
}

// =============================================================================
// HOOK DE FILTRE ET TRI
// =============================================================================

interface UseFilterOptions<T> {
  filterFunction?: (item: T, filters: Record<string, any>) => boolean;
  sortFunction?: (a: T, b: T, sortBy: string, sortOrder: 'asc' | 'desc') => number;
}

export function useFilter<T>(
  items: T[],
  options: UseFilterOptions<T> = {}
) {
  const [filters, setFilters] = useState<Record<string, any>>({});
  const [sortBy, setSortBy] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const filteredItems = useMemo(() => {
    let result = [...items];

    // Appliquer les filtres
    if (options.filterFunction && Object.keys(filters).length > 0) {
      result = result.filter(item => options.filterFunction!(item, filters));
    }

    // Appliquer le tri
    if (sortBy && options.sortFunction) {
      result.sort((a, b) => options.sortFunction!(a, b, sortBy, sortOrder));
    }

    return result;
  }, [items, filters, sortBy, sortOrder, options]);

  const updateFilter = useCallback((key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  const updateSort = useCallback((field: string) => {
    setSortBy(field);
    setSortOrder(prev => field === sortBy && prev === 'asc' ? 'desc' : 'asc');
  }, [sortBy]);

  return {
    filteredItems,
    filters,
    sortBy,
    sortOrder,
    updateFilter,
    clearFilters,
    updateSort,
    hasFilters: Object.keys(filters).length > 0,
    itemCount: filteredItems.length,
  };
}

// =============================================================================
// HOOK DE FAVORIS
// =============================================================================

export function useFavorites<T extends { id: number }>(
  storageKey: string
) {
  const [favorites, setFavorites] = useLocalStorage<number[]>(storageKey, []);

  const addFavorite = useCallback((id: number) => {
    setFavorites(prev => prev.includes(id) ? prev : [...prev, id]);
  }, [setFavorites]);

  const removeFavorite = useCallback((id: number) => {
    setFavorites(prev => prev.filter(fav => fav !== id));
  }, [setFavorites]);

  const toggleFavorite = useCallback((id: number) => {
    setFavorites(prev => 
      prev.includes(id) 
        ? prev.filter(fav => fav !== id)
        : [...prev, id]
    );
  }, [setFavorites]);

  const isFavorite = useCallback((id: number) => {
    return favorites.includes(id);
  }, [favorites]);

  const clearFavorites = useCallback(() => {
    setFavorites([]);
  }, [setFavorites]);

  return {
    favorites,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    isFavorite,
    clearFavorites,
    count: favorites.length,
  };
}
