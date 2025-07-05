import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchApi } from './useSearchApi';
import { useApi } from './useApi';
import type { TagMotCle } from '../types/classification';

// Service pour les tags (à créer)
import { tagService } from '../services/api/tags';

interface TagSuggestion extends TagMotCle {
  score?: number; // Score de pertinence pour l'œuvre
  source?: 'existing' | 'popular' | 'related' | 'ai'; // Source de la suggestion
  usage_count?: number;
}

interface UseTagSuggestionsOptions {
  typeOeuvre?: string;
  categories?: string[];
  langue?: string;
  titre?: string;
  description?: string;
  limit?: number;
}

export const useTagSuggestions = (options: UseTagSuggestionsOptions = {}) => {
  const {
    typeOeuvre,
    categories = [],
    langue,
    titre = '',
    description = '',
    limit = 50
  } = options;

  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState('');
  const [isCreatingTag, setIsCreatingTag] = useState(false);

  // ==========================================================================
  // 📊 RÉCUPÉRATION DES TAGS EXISTANTS
  // ==========================================================================

  // Tags populaires généraux
  const { data: popularTags, isLoading: loadingPopular } = useApi(
    () => tagService.getPopular(limit),
    { immediate: true, cache: true }
  );

  // Tags spécifiques au type d'œuvre
  const { data: typeTags, isLoading: loadingType } = useApi(
    () => typeOeuvre ? tagService.getByTypeOeuvre(typeOeuvre, limit) : Promise.resolve([]),
    { 
      immediate: !!typeOeuvre,
      dependencies: [typeOeuvre],
      cache: true
    }
  );

  // Tags spécifiques aux catégories
  const { data: categoryTags, isLoading: loadingCategory } = useApi(
    () => categories.length > 0 ? tagService.getByCategories(categories, limit) : Promise.resolve([]),
    { 
      immediate: categories.length > 0,
      dependencies: [categories.join(',')],
      cache: true
    }
  );

  // Tags similaires basés sur le contenu (IA/NLP)
  const { data: contentTags, isLoading: loadingContent } = useApi(
    () => {
      const content = `${titre} ${description}`.trim();
      return content.length > 10 ? tagService.getSuggestionsByContent(content, langue, limit) : Promise.resolve([]);
    },
    { 
      immediate: titre.length > 3 || description.length > 10,
      dependencies: [titre, description, langue],
      
    }
  );

  // ==========================================================================
  // 🔍 RECHERCHE DE TAGS EN TEMPS RÉEL
  // ==========================================================================

  const searchTags = useSearchApi(
    (query: string) => tagService.search(query, { limit, includeStats: true }),
    { 
      debounceMs: 300, 
      minLength: 2,
   
    }
  );

  // ==========================================================================
  // 🧠 SUGGESTIONS INTELLIGENTES COMBINÉES
  // ==========================================================================

  const suggestions = useMemo(() => {
    const allTags: TagSuggestion[] = [];
    const tagMap = new Map<string, TagSuggestion>();

    // 1. Tags populaires (score: 0.2)
    popularTags?.forEach((tag: TagMotCle) => {
      const suggestion: TagSuggestion = {
        ...tag,
        score: 0.2,
        source: 'popular'
      };
      tagMap.set(tag.nom.toLowerCase(), suggestion);
    });

    // 2. Tags par type d'œuvre (score: 0.6)
    typeTags?.forEach((tag: TagMotCle) => {
      const existing = tagMap.get(tag.nom.toLowerCase());
      const suggestion: TagSuggestion = {
        ...tag,
        score: (existing?.score || 0) + 0.6,
        source: 'related'
      };
      tagMap.set(tag.nom.toLowerCase(), suggestion);
    });

    // 3. Tags par catégorie (score: 0.4)
    categoryTags?.forEach((tag: TagMotCle) => {
      const existing = tagMap.get(tag.nom.toLowerCase());
      const suggestion: TagSuggestion = {
        ...tag,
        score: (existing?.score || 0) + 0.4,
        source: 'related'
      };
      tagMap.set(tag.nom.toLowerCase(), suggestion);
    });

    // 4. Tags par contenu IA (score: 0.8)
    contentTags?.forEach((tag: any) => {
      const existing = tagMap.get(tag.nom.toLowerCase());
      const suggestion: TagSuggestion = {
        ...tag,
        score: (existing?.score || 0) + 0.8,
        source: 'ai'
      };
      tagMap.set(tag.nom.toLowerCase(), suggestion);
    });

    // 5. Tags de recherche
    if (searchTags.results.length > 0) {
      searchTags.results.forEach((tag: TagMotCle) => {
        if (!tagMap.has(tag.nom.toLowerCase())) {
          const suggestion: TagSuggestion = {
            ...tag,
            score: 0.3,
            source: 'existing'
          };
          tagMap.set(tag.nom.toLowerCase(), suggestion);
        }
      });
    }

    // Convertir en array et trier par score
    const sortedTags = Array.from(tagMap.values())
      .filter(tag => !selectedTags.includes(tag.nom))
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .slice(0, limit);

    return sortedTags;
  }, [
    popularTags,
    typeTags, 
    categoryTags,
    contentTags,
    searchTags.results,
    selectedTags,
    limit
  ]);

  // ==========================================================================
  // 🏷️ GESTION DES TAGS
  // ==========================================================================

  const addTag = useCallback(async (tagName: string, createIfNotExists = true) => {
    const normalizedTag = tagName.trim().toLowerCase();
    
    if (!normalizedTag || selectedTags.includes(normalizedTag)) {
      return false;
    }

    // Vérifier si le tag existe
    const existingTag = suggestions.find(t => t.nom.toLowerCase() === normalizedTag);
    
    if (existingTag) {
      // Tag existant
      setSelectedTags(prev => [...prev, existingTag.nom]);
      // Incrementer l'usage
      await tagService.incrementUsage(existingTag.id_tag);
      return true;
    } else if (createIfNotExists) {
      // Créer un nouveau tag
      try {
        setIsCreatingTag(true);
        const newTag = await tagService.create({
          nom: tagName.trim(),
          couleur: generateTagColor(tagName),
          suggestion: true
        });
        
        setSelectedTags(prev => [...prev, newTag.nom]);
        return true;
      } catch (error) {
        console.error('Erreur création tag:', error);
        return false;
      } finally {
        setIsCreatingTag(false);
      }
    }
    
    return false;
  }, [selectedTags, suggestions]);

  const removeTag = useCallback((tagName: string) => {
    setSelectedTags(prev => prev.filter(tag => tag !== tagName));
  }, []);

  const addFromInput = useCallback(async () => {
    if (newTagInput.trim()) {
      const success = await addTag(newTagInput.trim());
      if (success) {
        setNewTagInput('');
      }
    }
  }, [newTagInput, addTag]);

  const addSuggestion = useCallback(async (suggestion: TagSuggestion) => {
    await addTag(suggestion.nom, false);
  }, [addTag]);

  // ==========================================================================
  // 📝 SUGGESTIONS RAPIDES PAR CONTEXTE
  // ==========================================================================

  const getQuickSuggestions = useCallback(() => {
    const quick: { [key: string]: string[] } = {
      livre: ['littérature', 'roman', 'poésie', 'histoire', 'biographie', 'essai'],
      film: ['cinéma', 'documentaire', 'fiction', 'court-métrage', 'réalisation'],
      'album musical': ['musique', 'album', 'chanson', 'composition', 'acoustique'],
      article: ['journalisme', 'actualité', 'analyse', 'investigation', 'presse'],
      photographie: ['photo', 'image', 'portrait', 'paysage', 'noir-blanc'],
      artisanat: ['traditionnel', 'manuel', 'technique', 'savoir-faire', 'héritage'],
      'œuvre d\'art': ['art', 'création', 'expression', 'contemporain', 'classique']
    };

    return quick[typeOeuvre?.toLowerCase() || ''] || [];
  }, [typeOeuvre]);

  // ==========================================================================
  // 🎨 UTILITAIRES
  // ==========================================================================

  const generateTagColor = (tagName: string): string => {
    const colors = [
      '#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', 
      '#EF4444', '#06B6D4', '#84CC16', '#EC4899'
    ];
    const hash = tagName.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    return colors[Math.abs(hash) % colors.length];
  };

  const getTagsBySource = useCallback((source: TagSuggestion['source']) => {
    return suggestions.filter(tag => tag.source === source);
  }, [suggestions]);

  const isLoading = loadingPopular || loadingType || loadingCategory || loadingContent || searchTags.isSearching;

  return {
    // État des tags sélectionnés
    selectedTags,
    setSelectedTags,
    
    // Input nouveau tag
    newTagInput,
    setNewTagInput,
    isCreatingTag,
    
    // Suggestions
    suggestions,
    getTagsBySource,
    getQuickSuggestions,
    
    // Actions
    addTag,
    removeTag,
    addFromInput,
    addSuggestion,
    
    // Recherche
    searchQuery: searchTags.query,
    setSearchQuery: searchTags.setQuery,
    searchResults: searchTags.results,
    clearSearch: searchTags.clearSearch,
    
    // États
    isLoading,
    hasContentSuggestions: contentTags && contentTags.length > 0,
    
    // Statistiques
    stats: {
      popularCount: popularTags?.length || 0,
      typeCount: typeTags?.length || 0,
      categoryCount: categoryTags?.length || 0,
      contentCount: contentTags?.length || 0,
      totalSuggestions: suggestions.length
    }
  };
};

// ==========================================================================
// 🎯 HOOK POUR LES TAGS POPULAIRES PAR CONTEXTE
// ==========================================================================

export const usePopularTagsByContext = (context: {
  typeOeuvre?: string;
  categories?: string[];
  langue?: string;
}) => {
  const { data: tags, isLoading } = useApi(
    () => tagService.getPopularByContext(context, 20),
    { 
      immediate: !!(context.typeOeuvre || context.categories?.length),
      dependencies: [context.typeOeuvre, context.categories?.join(','), context.langue],
      cache: true
    }
  );

  return {
    popularTags: tags || [],
    isLoading
  };
};