// src/hooks/useMetadata.ts - Version corrigée

import { useCallback, useEffect, useMemo, useState } from 'react';
import { metadataService } from '../services/api/metadata';
import type { 
  Langue, 
  Categorie, 
  Genre, 
  TypeOeuvre, 
  TypeEvenement 
} from '../types/classification';
import type { Wilaya, Daira, Commune } from '../types/geography';
import { useApi } from './useApi';
import { useSearchApi } from './useSearchApi';

// ==========================================================================
// HOOK PRINCIPAL - TOUTES LES MÉTADONNÉES
// ==========================================================================

export function useMetadata() {
  const {
    data: metadata,
    isLoading,
    error,
    refetch,
  } = useApi(
    () => metadataService.getAll(),
    { 
      immediate: true, 
      dependencies: []
    }
  );

  const preload = useCallback(async () => {
    console.log('🚀 Préchargement des métadonnées...');
    await metadataService.preloadAll();
  }, []);

  const refreshCache = useCallback(async () => {
    console.log('🔄 Actualisation du cache des métadonnées...');
    await metadataService.refreshCache();
    await refetch();
  }, [refetch]);

  const langues = metadata?.langues || [];
  const categories = metadata?.categories || [];
  const genres = metadata?.genres || [];
  const typesOeuvres = metadata?.types_oeuvres || [];
  const typesEvenements = metadata?.types_evenements || [];
  const roles = metadata?.roles || [];
  const wilayas = metadata?.wilayas || [];

  const options = useMemo(() => ({
    langues: langues.map((l: Langue) => ({ 
      value: l.id_langue, 
      label: l.nom,
      code: (l as any).code 
    })),
    categories: categories.map((c: Categorie) => ({ 
      value: c.id_categorie, 
      label: c.nom,
      description: c.description 
    })),
    genres: genres.map((g: Genre) => ({ 
      value: g.id_genre, 
      label: g.nom 
    })),
    typesOeuvres: typesOeuvres.map((t: TypeOeuvre) => ({ 
      value: t.id_type_oeuvre, 
      label: t.nom_type 
    })),
    typesEvenements: typesEvenements.map((t: TypeEvenement) => ({ 
      value: t.id_type_evenement, 
      label: t.nom_type 
    })),
    wilayas: wilayas.map((w: Wilaya) => ({ 
      value: w.id_wilaya, 
      label: w.nom 
    })),
    typesUtilisateurs: metadataService.getTypesUtilisateursAlgeriens(),
    languesAlgeriennes: metadataService.getLanguesAlgeriennes(),
  }), [langues, categories, genres, typesOeuvres, typesEvenements, wilayas]);

  const getters = useMemo(() => ({
    getLangueById: (id: number) => langues.find((l: Langue) => l.id_langue === id),
    getCategorieById: (id: number) => categories.find((c: Categorie) => c.id_categorie === id),
    getGenreById: (id: number) => genres.find((g: Genre) => g.id_genre === id),
    getTypeOeuvreById: (id: number) => typesOeuvres.find((t: TypeOeuvre) => t.id_type_oeuvre === id),
    getTypeEvenementById: (id: number) => typesEvenements.find((t: TypeEvenement) => t.id_type_evenement === id),
    getWilayaById: (id: number) => wilayas.find((w: Wilaya) => w.id_wilaya === id),
  }), [langues, categories, genres, typesOeuvres, typesEvenements, wilayas]);

  return {
    metadata,
    langues,
    categories,
    genres,
    typesOeuvres,
    typesEvenements,
    roles,
    wilayas,
    options,
    ...getters,
    isLoading,
    error,
    refetch,
    preload,
    refreshCache,
  };
}

// ==========================================================================
// HOOKS SPÉCIALISÉS
// ==========================================================================

export function useLangues() {
  const {
    data: langues,
    isLoading,
    error,
    refetch
  } = useApi(
    () => metadataService.getLangues(),
    { immediate: true }
  );

  const options = useMemo(() => 
    (langues || []).map((l: Langue) => ({ 
      value: l.id_langue, 
      label: l.nom,
      code: (l as any).code 
    })), 
    [langues]
  );

  const getById = useCallback((id: number) => 
    langues?.find((l: Langue) => l.id_langue === id), 
    [langues]
  );

  const getByCode = useCallback((code: string) => 
    langues?.find((l: any) => l.code === code), 
    [langues]
  );

  return {
    langues: langues || [],
    options,
    getById,
    getByCode,
    isLoading,
    error,
    refetch,
  };
}

export function useCategories() {
  const {
    data: categories,
    isLoading,
    error,
    refetch
  } = useApi(
    () => metadataService.getCategories(),
    { immediate: true }
  );

  const options = useMemo(() => 
    (categories || []).map((c: Categorie) => ({ 
      value: c.id_categorie, 
      label: c.nom,
      description: c.description 
    })), 
    [categories]
  );

  const getById = useCallback((id: number) => 
    categories?.find((c: Categorie) => c.id_categorie === id), 
    [categories]
  );

  const searchHook = useSearchApi(
    (query: string) => metadataService.searchCategories(query),
    { debounceMs: 300, minLength: 2 }
  );

  return {
    categories: categories || [],
    options,
    getById,
    search: searchHook,
    isLoading,
    error,
    refetch,
  };
}

// ==========================================================================
// HOOK GÉOGRAPHIQUE CORRIGÉ
// ==========================================================================

export function useGeography() {
  const [wilayas, setWilayas] = useState<Wilaya[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    
    const fetchWilayas = async () => {
      try {
        setIsLoading(true);
        const data = await metadataService.getWilayas(true);
        console.log('📍 Données reçues dans useEffect:', data);
        
        if (mounted) {
          setWilayas(data);
          setIsLoading(false);
        }
      } catch (err) {
        console.error('❌ Erreur:', err);
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Erreur inconnue');
          setIsLoading(false);
        }
      }
    };

    fetchWilayas();
    
    return () => {
      mounted = false;
    };
  }, []);

  // ✅ CORRIGÉ : Options pour les formulaires avec wilayas (pas state.wilayas)
  const wilayasOptions = useMemo(() => {
    return wilayas.map((w) => ({
      value: w.id_wilaya,
      label: `${w.codeW?.toString().padStart(2, '0') || ''} - ${w.wilaya_name_ascii || w.nom || 'Sans nom'}`
    }));
  }, [wilayas]);
  
  const wilayasPrincipales = useMemo(() => {
    if (!wilayas || wilayas.length === 0) return [];
    const principalesIds = [16, 31, 25, 15, 6, 19, 9, 34];
    return wilayas.filter(w => principalesIds.includes(w.id_wilaya));
  }, [wilayas]);

  const getDairasByWilaya = useCallback((wilayaId: number): Daira[] => {
    const wilaya = wilayas?.find((w: Wilaya) => w.id_wilaya === wilayaId);
    return wilaya?.Dairas || [];
  }, [wilayas]);

  const getCommunesByDaira = useCallback((wilayaId: number, dairaId: number): Commune[] => {
    const wilaya = wilayas?.find((w: Wilaya) => w.id_wilaya === wilayaId);
    const daira = wilaya?.Dairas?.find((d: Daira) => d.id_daira === dairaId);
    return daira?.Communes || [];
  }, [wilayas]);

  const getDairaOptions = useCallback((wilayaId: number) => {
    const dairas = getDairasByWilaya(wilayaId);
    return dairas.map((d: Daira) => ({ 
      value: d.id_daira, 
      label: d.nom 
    }));
  }, [getDairasByWilaya]);

  const getCommuneOptions = useCallback((wilayaId: number, dairaId: number) => {
    const communes = getCommunesByDaira(wilayaId, dairaId);
    return communes.map((c: Commune) => ({ 
      value: c.id_commune, 
      label: c.nom 
    }));
  }, [getCommunesByDaira]);

  const searchWilayas = useSearchApi(
    (query: string) => metadataService.searchWilayas(query),
    { debounceMs: 300, minLength: 2 }
  );

  const getWilayaById = useCallback((id: number) => 
    wilayas?.find((w: Wilaya) => w.id_wilaya === id), 
    [wilayas]
  );

  const refetch = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await metadataService.getWilayas(true);
      setWilayas(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    // Données
    wilayas: wilayas || [],
    wilayasPrincipales,
    
    // ✅ CORRIGÉ : Options pour formulaires (nom cohérent)
    wilayaOptions: wilayasOptions,  // ← Utiliser wilayasOptions défini ci-dessus
    getDairaOptions,
    getCommuneOptions,
    
    // Navigation hiérarchique
    getDairasByWilaya,
    getCommunesByDaira,
    
    // Recherche
    searchWilayas,
    getWilayaById,
    
    // État
    isLoading,
    error,
    refetch,
  };
}

// ==========================================================================
// HOOKS COMBINÉS POUR FORMULAIRES
// ==========================================================================

export function useOeuvreMetadata() {
  const { options, isLoading, error } = useMetadata();

  const oeuvreSpecificOptions = useMemo(() => ({
    langues: options.langues,
    categories: options.categories,
    typesOeuvres: options.typesOeuvres,
    statuts: [
      { value: 'brouillon', label: 'Brouillon', color: 'gray' },
      { value: 'en_attente', label: 'En attente', color: 'orange' },
      { value: 'publie', label: 'Publié', color: 'green' },
      { value: 'rejete', label: 'Rejeté', color: 'red' },
      { value: 'archive', label: 'Archivé', color: 'blue' },
    ],
    roles: [
      { value: 'auteur', label: 'Auteur' },
      { value: 'realisateur', label: 'Réalisateur' },
      { value: 'acteur', label: 'Acteur' },
      { value: 'musicien', label: 'Musicien' },
      { value: 'artiste', label: 'Artiste' },
      { value: 'artisan', label: 'Artisan' },
      { value: 'journaliste', label: 'Journaliste' },
      { value: 'scientifique', label: 'Scientifique' },
      { value: 'collaborateur', label: 'Collaborateur' },
      { value: 'autre', label: 'Autre' },
    ],
  }), [options]);

  return {
    options: oeuvreSpecificOptions,
    isLoading,
    error,
  };
}

export function useEvenementMetadata() {
  const { options, wilayas, isLoading, error } = useMetadata();

  const evenementSpecificOptions = useMemo(() => ({
    typesEvenements: options.typesEvenements,
    wilayas: options.wilayas,
    langues: options.langues,
    statuts: [
      { value: 'planifie', label: 'Planifié', color: 'blue' },
      { value: 'en_cours', label: 'En cours', color: 'green' },
      { value: 'termine', label: 'Terminé', color: 'gray' },
      { value: 'annule', label: 'Annulé', color: 'red' },
      { value: 'reporte', label: 'Reporté', color: 'orange' },
    ],
    rolesParticipation: [
      { value: 'organisateur', label: 'Organisateur' },
      { value: 'intervenant', label: 'Intervenant' },
      { value: 'participant', label: 'Participant' },
      { value: 'benevole', label: 'Bénévole' },
      { value: 'sponsor', label: 'Sponsor' },
      { value: 'media', label: 'Média' },
      { value: 'invite', label: 'Invité' },
      { value: 'artiste', label: 'Artiste' },
      { value: 'conferencier', label: 'Conférencier' },
    ],
  }), [options]);

  return {
    options: evenementSpecificOptions,
    wilayas,
    isLoading,
    error,
  };
}

// ==========================================================================
// HOOKS UTILITAIRES
// ==========================================================================

export function useMetadataStatistics() {
  const {
    data: stats,
    isLoading,
    error,
    refetch
  } = useApi(
    () => metadataService.getUsageStatistics(),
    { immediate: true }
  );

  return {
    statistics: stats,
    isLoading,
    error,
    refetch,
  };
}

export function useMetadataValidator() {
  const { langues, categories, typesOeuvres, wilayas } = useMetadata();

  const validators = useMemo(() => ({
    isValidLangue: (id: number) => 
      langues.some((l: Langue) => l.id_langue === id),
    
    isValidCategorie: (id: number) => 
      categories.some((c: Categorie) => c.id_categorie === id),
    
    isValidTypeOeuvre: (id: number) => 
      typesOeuvres.some((t: TypeOeuvre) => t.id_type_oeuvre === id),
    
    isValidWilaya: (id: number) => 
      wilayas.some((w: Wilaya) => w.id_wilaya === id),
  }), [langues, categories, typesOeuvres, wilayas]);

  return validators;
}