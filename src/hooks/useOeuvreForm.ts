import { Service } from './../types/place';
// src/hooks/useOeuvreForm.ts - Hook formulaire œuvre ADAPTATIF
import { useState, useEffect, useMemo } from 'react';
import { useForm } from '../hooks/useForm';
import { useMetadata } from '../hooks/useMetadata';
import { useOeuvres } from './useOeuvre';
import type { 
  CreateOeuvreData,
  Livre,
  Film,
  AlbumMusical,
  Article,
  ArticleScientifique,
  Artisanat,
  OeuvreArt
} from '../types/oeuvre';

// ==========================================================================
// ✅ INTERFACES POUR CHAQUE TYPE D'ŒUVRE
// ==========================================================================

interface BaseOeuvreFormData {
  // Champs communs à toutes les œuvres
  titre: string;
  description: string;
  annee_creation: number | '';
  type_oeuvre: string;
  langue: string;
  categories: string[];
  auteurs: string[];
  tags: string[];
}

interface LivreFormData extends BaseOeuvreFormData {
  // Champs spécifiques aux livres
  isbn?: string;
  nb_pages?: number | '';
  id_genre?: string;
  editeur_original?: string;
  premiere_edition?: string;
  derniere_edition?: string;
  traduction?: boolean;
  langue_originale?: string;
}

interface FilmFormData extends BaseOeuvreFormData {
  // Champs spécifiques aux films
  duree_minutes?: number | '';
  realisateur?: string;
  id_genre?: string;
  budget?: number | '';
  recettes?: number | '';
  classification?: string;
  format_original?: string;
  couleur?: boolean;
}

interface AlbumMusicalFormData extends BaseOeuvreFormData {
  // Champs spécifiques aux albums musicaux
  duree?: number | '';
  id_genre: string;
  label: string;
  nombre_pistes?: number | '';
  producteur?: string;
  studio_enregistrement?: string;
  format_original?: string;
}

interface ArticleFormData extends BaseOeuvreFormData {
  // Champs spécifiques aux articles
  auteur?: string;
  source?: string;
  type_article: string;
  categorie?: string;
  sous_titre?: string;
  date_publication?: string;
  resume?: string;
  contenu_complet?: string;
  url_source?: string;
  niveau_credibilite: string;
  fact_checked: boolean;
  paywall: boolean;
  nb_mots?: number | '';
  temps_lecture?: number | '';
}

interface ArticleScientifiqueFormData extends BaseOeuvreFormData {
  // Champs spécifiques aux articles scientifiques
  journal?: string;
  doi?: string;
  pages?: string;
  volume?: string;
  numero?: string;
  issn?: string;
  impact_factor?: number | '';
  peer_reviewed: boolean;
  open_access: boolean;
  date_soumission?: string;
  date_acceptation?: string;
  date_publication?: string;
  resume?: string;
  mots_cles_scientifiques?: string[];
  domaine_recherche?: string;
  url_hal?: string;
  url_arxiv?: string;
}

interface ArtisanatFormData extends BaseOeuvreFormData {
  // Champs spécifiques à l'artisanat
  id_materiau?: string;
  id_technique?: string;
  dimensions?: string;
  poids?: number | '';
  prix?: number | '';
  date_creation?: string;
  region_origine?: string;
  tradition_associee?: string;
  niveau_difficulte?: string;
  temps_creation?: number | '';
  pieces_similaires?: number | '';
}

interface OeuvreArtFormData extends BaseOeuvreFormData {
  // Champs spécifiques aux œuvres d'art
  technique?: string;
  dimensions?: string;
  support?: string;
  medium?: string;
  style_artistique?: string;
  periode_artistique?: string;
  lieu_creation?: string;
  inspiration?: string;
  etat_conservation?: string;
  valeur_estimee?: number | '';
  propriete_actuelle?: string;
  expositions_precedentes?: string[];
}

// Type union pour tous les formulaires
type OeuvreFormData = 
  | LivreFormData 
  | FilmFormData 
  | AlbumMusicalFormData 
  | ArticleFormData 
  | ArticleScientifiqueFormData 
  | ArtisanatFormData 
  | OeuvreArtFormData;

// ==========================================================================
// ✅ HOOK PRINCIPAL ADAPTATIF
// ==========================================================================

export const useOeuvreForm = (initialData?: Partial<OeuvreFormData>) => {
  const { metadata } = useMetadata();
  const { createOeuvre, updateOeuvre } = useOeuvres();
  
  // État pour le type d'œuvre sélectionné
  const [selectedType, setSelectedType] = useState<string>(
    initialData?.type_oeuvre || ''
  );

  // ==========================================================================
  // ✅ CONFIGURATION DYNAMIQUE DU FORMULAIRE
  // ==========================================================================

  const getFormConfig = useMemo(() => {
    const baseConfig = {
      titre: {
        initialValue: initialData?.titre || '',
        required: true,
        validators: [
          {
            test: (value: string) => value.length >= 2,
            message: 'Le titre doit contenir au moins 2 caractères'
          },
          {
            test: (value: string) => value.length <= 200,
            message: 'Le titre ne peut pas dépasser 200 caractères'
          }
        ]
      },
      description: {
        initialValue: initialData?.description || '',
        required: true,
        validators: [
          {
            test: (value: string) => value.length >= 10,
            message: 'La description doit contenir au moins 10 caractères'
          }
        ]
      },
      annee_creation: {
        initialValue: initialData?.annee_creation || '',
        required: true,
        validators: [
          {
            test: (value: number | '') => {
              if (value === '') return false;
              const year = Number(value);
              const currentYear = new Date().getFullYear();
              return year >= 1000 && year <= currentYear;
            },
            message: `L'année doit être entre 1000 et ${new Date().getFullYear()}`
          }
        ]
      },
      type_oeuvre: {
        initialValue: initialData?.type_oeuvre || '',
        required: true
      },
      langue: {
        initialValue: initialData?.langue || '',
        required: true
      },
      categories: {
        initialValue: initialData?.categories || [],
        validators: [
          {
            test: (value: string[]) => value.length > 0,
            message: 'Sélectionnez au moins une catégorie'
          }
        ]
      },
      auteurs: {
        initialValue: initialData?.auteurs || [],
        required: true,
        validators: [
          {
            test: (value: string[]) => value.length > 0,
            message: 'Ajoutez au moins un auteur'
          }
        ]
      },
      tags: {
        initialValue: initialData?.tags || []
      }
    };

    // ✅ Ajouter les champs spécifiques selon le type
    switch (selectedType) {
      case 'livre':
        return {
          ...baseConfig,
          // Champs spécifiques aux livres
          isbn: {
            initialValue: (initialData as LivreFormData)?.isbn || '',
            validators: [
              {
                test: (value: string) => !value || /^(?:ISBN(?:-1[03])?:? )?(?=[0-9X]{10}$|(?=(?:[0-9]+[- ]){3})[- 0-9X]{13}$|97[89][0-9]{10}$|(?=(?:[0-9]+[- ]){4})[- 0-9]{17}$)/.test(value),
                message: 'Format ISBN invalide'
              }
            ]
          },
          nb_pages: {
            initialValue: (initialData as LivreFormData)?.nb_pages || '',
            validators: [
              {
                test: (value: number | '') => value === '' || (Number(value) > 0 && Number(value) < 10000),
                message: 'Le nombre de pages doit être entre 1 et 10000'
              }
            ]
          },
          editeur_original: {
            initialValue: (initialData as LivreFormData)?.editeur_original || ''
          },
          premiere_edition: {
            initialValue: (initialData as LivreFormData)?.premiere_edition || ''
          },
          traduction: {
            initialValue: (initialData as LivreFormData)?.traduction || false
          }
        };

      case 'film':
        return {
          ...baseConfig,
          // Champs spécifiques aux films
          duree_minutes: {
            initialValue: (initialData as FilmFormData)?.duree_minutes || '',
            validators: [
              {
                test: (value: number | '') => value === '' || (Number(value) > 0 && Number(value) < 1000),
                message: 'La durée doit être entre 1 et 1000 minutes'
              }
            ]
          },
          realisateur: {
            initialValue: (initialData as FilmFormData)?.realisateur || ''
          },
          budget: {
            initialValue: (initialData as FilmFormData)?.budget || '',
            validators: [
              {
                test: (value: number | '') => value === '' || Number(value) >= 0,
                message: 'Le budget ne peut pas être négatif'
              }
            ]
          },
          classification: {
            initialValue: (initialData as FilmFormData)?.classification || ''
          },
          couleur: {
            initialValue: (initialData as FilmFormData)?.couleur || true
          }
        };

      case 'album':
        return {
          ...baseConfig,
          // Champs spécifiques aux albums
          duree: {
            initialValue: (initialData as AlbumMusicalFormData)?.duree || '',
            validators: [
              {
                test: (value: number | '') => value === '' || Number(value) > 0,
                message: 'La durée doit être positive'
              }
            ]
          },
          label: {
            initialValue: (initialData as AlbumMusicalFormData)?.label || '',
            required: true
          },
          nombre_pistes: {
            initialValue: (initialData as AlbumMusicalFormData)?.nombre_pistes || '',
            validators: [
              {
                test: (value: number | '') => value === '' || (Number(value) > 0 && Number(value) <= 100),
                message: 'Le nombre de pistes doit être entre 1 et 100'
              }
            ]
          },
          producteur: {
            initialValue: (initialData as AlbumMusicalFormData)?.producteur || ''
          }
        };

      case 'article':
        return {
          ...baseConfig,
          // Champs spécifiques aux articles
          source: {
            initialValue: (initialData as ArticleFormData)?.source || ''
          },
          type_article: {
            initialValue: (initialData as ArticleFormData)?.type_article || '',
            required: true
          },
          date_publication: {
            initialValue: (initialData as ArticleFormData)?.date_publication || ''
          },
          niveau_credibilite: {
            initialValue: (initialData as ArticleFormData)?.niveau_credibilite || '',
            required: true
          },
          fact_checked: {
            initialValue: (initialData as ArticleFormData)?.fact_checked || false
          },
          url_source: {
            initialValue: (initialData as ArticleFormData)?.url_source || '',
            validators: [
              {
                test: (value: string) => !value || /^https?:\/\/.+/.test(value),
                message: 'URL invalide'
              }
            ]
          }
        };

      case 'artisanat':
        return {
          ...baseConfig,
          // Champs spécifiques à l'artisanat
          dimensions: {
            initialValue: (initialData as ArtisanatFormData)?.dimensions || ''
          },
          poids: {
            initialValue: (initialData as ArtisanatFormData)?.poids || '',
            validators: [
              {
                test: (value: number | '') => value === '' || Number(value) > 0,
                message: 'Le poids doit être positif'
              }
            ]
          },
          prix: {
            initialValue: (initialData as ArtisanatFormData)?.prix || '',
            validators: [
              {
                test: (value: number | '') => value === '' || Number(value) >= 0,
                message: 'Le prix ne peut pas être négatif'
              }
            ]
          },
          region_origine: {
            initialValue: (initialData as ArtisanatFormData)?.region_origine || ''
          },
          niveau_difficulte: {
            initialValue: (initialData as ArtisanatFormData)?.niveau_difficulte || ''
          }
        };

      case 'oeuvre_art':
        return {
          ...baseConfig,
          // Champs spécifiques aux œuvres d'art
          technique: {
            initialValue: (initialData as OeuvreArtFormData)?.technique || ''
          },
          dimensions: {
            initialValue: (initialData as OeuvreArtFormData)?.dimensions || ''
          },
          support: {
            initialValue: (initialData as OeuvreArtFormData)?.support || ''
          },
          style_artistique: {
            initialValue: (initialData as OeuvreArtFormData)?.style_artistique || ''
          },
          etat_conservation: {
            initialValue: (initialData as OeuvreArtFormData)?.etat_conservation || ''
          }
        };

      default:
        return baseConfig;
    }
  }, [selectedType, initialData]);

  // ==========================================================================
  // ✅ CONFIGURATION DU FORMULAIRE
  // ==========================================================================

  const formConfig = {
    fields: getFormConfig,
    onSubmit: async (values: any) => {
      // Construire les données de l'œuvre
      const oeuvreData: CreateOeuvreData = {
        titre: values.titre,
        description: values.description,
        annee_creation: Number(values.annee_creation),
        id_type_oeuvre: Number(values.type_oeuvre),
        id_langue: Number(values.langue),
        categories: values.categories.map(Number),
        auteurs: values.auteurs,
        tags: values.tags,
        details_specifiques: buildDetailsSpecifiques(selectedType, values)
      };

      await createOeuvre(oeuvreData);
    }
  };

  const form = useForm(formConfig);

  // ==========================================================================
  // ✅ FONCTION POUR CONSTRUIRE LES DÉTAILS SPÉCIFIQUES
  // ==========================================================================

  const buildDetailsSpecifiques = (type: string, values: any) => {
    switch (type) {
      case 'livre':
        return {
          livre: {
            isbn: values.isbn,
            nb_pages: values.nb_pages ? Number(values.nb_pages) : undefined,
            editeur_original: values.editeur_original,
            premiere_edition: values.premiere_edition,
            traduction: values.traduction
          }
        };

      case 'film':
        return {
          film: {
            duree_minutes: values.duree_minutes ? Number(values.duree_minutes) : undefined,
            realisateur: values.realisateur,
            budget: values.budget ? Number(values.budget) : undefined,
            classification: values.classification,
            couleur: values.couleur
          }
        };

      case 'album':
        return {
          album: {
            duree: values.duree ? Number(values.duree) : undefined,
            label: values.label,
            nombre_pistes: values.nombre_pistes ? Number(values.nombre_pistes) : undefined,
            producteur: values.producteur
          }
        };

      case 'article':
        return {
          article: {
            source: values.source,
            type_article: values.type_article,
            date_publication: values.date_publication,
            niveau_credibilite: values.niveau_credibilite,
            fact_checked: values.fact_checked,
            url_source: values.url_source
          }
        };

      case 'artisanat':
        return {
          artisanat: {
            dimensions: values.dimensions,
            poids: values.poids ? Number(values.poids) : undefined,
            prix: values.prix ? Number(values.prix) : undefined,
            region_origine: values.region_origine,
            niveau_difficulte: values.niveau_difficulte
          }
        };

      case 'oeuvre_art':
        return {
          oeuvre_art: {
            technique: values.technique,
            dimensions: values.dimensions,
            support: values.support,
            style_artistique: values.style_artistique,
            etat_conservation: values.etat_conservation
          }
        };

      default:
        return {};
    }
  };

  // ==========================================================================
  // ✅ EFFET POUR CHANGER LE TYPE D'ŒUVRE
  // ==========================================================================

  useEffect(() => {
    if (form.values.type_oeuvre !== selectedType) {
      setSelectedType(form.values.type_oeuvre);
    }
  }, [form.values.type_oeuvre, selectedType]);

  // ==========================================================================
  // ✅ OPTIONS POUR LES SÉLECTS
  // ==========================================================================

  const options = useMemo(() => ({
    typesOeuvres: metadata?.types_oeuvres?.map(type => ({
      value: type.id_type_oeuvre.toString(),
      label: type.nom_type
    })) || [],
    
    langues: metadata?.langues?.map(langue => ({
      value: langue.id_langue.toString(),
      label: langue.nom
    })) || [],
    
    categories: metadata?.categories?.map(cat => ({
      value: cat.id_categorie.toString(),
      label: cat.nom
    })) || [],

    // Options spécifiques selon le type
    typesArticles: [
      { value: 'presse', label: 'Presse' },
      { value: 'blog', label: 'Blog' },
      { value: 'magazine', label: 'Magazine' },
      { value: 'newsletter', label: 'Newsletter' },
      { value: 'editorial', label: 'Éditorial' }
    ],
    
    niveauxCredibilite: [
      { value: 'tres_fiable', label: 'Très fiable' },
      { value: 'fiable', label: 'Fiable' },
      { value: 'moyen', label: 'Moyen' },
      { value: 'peu_fiable', label: 'Peu fiable' },
      { value: 'non_verifie', label: 'Non vérifié' }
    ],

    niveauxDifficulte: [
      { value: 'facile', label: 'Facile' },
      { value: 'moyen', label: 'Moyen' },
      { value: 'difficile', label: 'Difficile' },
      { value: 'expert', label: 'Expert' }
    ],

    etatsConservation: [
      { value: 'excellent', label: 'Excellent' },
      { value: 'bon', label: 'Bon' },
      { value: 'moyen', label: 'Moyen' },
      { value: 'mauvais', label: 'Mauvais' }
    ]
  }), [metadata]);

  return {
    ...form,
    selectedType,
    options,
    metadata,
    
    // Fonction pour vérifier si un champ doit être affiché
    shouldShowField: (fieldName: string) => {
      return Object.keys(getFormConfig).includes(fieldName);
    },
    
    // Fonction pour obtenir le type d'œuvre sélectionné
    getSelectedTypeInfo: () => {
      return options.typesOeuvres.find(type => type.value === selectedType);
    }
  };
};