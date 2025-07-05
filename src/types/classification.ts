// types/classification.ts - Types de classification et métadonnées

// =============================================================================
// TYPES DE BASE POUR CLASSIFICATIONS
// =============================================================================

interface BaseClassification {
  id: number;
  nom: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

// =============================================================================
// LANGUES
// =============================================================================

export interface Langue extends BaseClassification {
  id_langue: number;
  code: string;
  actif?: boolean;
}

export const LANGUES_ALGERIE = [
  { code: 'ar', nom: 'Arabe', id: 3 },
  { code: 'tm', nom: 'Tamazight', id: 1 },
  { code: 'tif', nom: 'Tifinagh', id: 2 },
  { code: 'de', nom: 'Derja', id: 4 },
  { code: 'fr', nom: 'Français', id: 5 },
  { code: 'en', nom: 'Anglais', id: 6 },
] as const;

// =============================================================================
// CATÉGORIES D'ŒUVRES
// =============================================================================

export interface Categorie extends BaseClassification {
  id_categorie: number;
  couleur?: string;
  icone?: string;
  parent_id?: number;
  ordre?: number;
}

export const CATEGORIES_PRINCIPALES = [
  'Roman',
  'Poésie', 
  'Bande dessinée',
  'Essai',
  'Histoire',
  'Biographie',
  'Peinture',
  'Sculpture',
  'Documentaire',
  'Fiction',
  'Jazz',
  'Classique',
  'Musique traditionnelle',
  'Cinéma d\'auteur',
  'Comédie',
  'Drame',
  'Court métrage',
  'Photographie'
] as const;

// =============================================================================
// GENRES
// =============================================================================

export interface Genre extends BaseClassification {
  id_genre: number;
  type_oeuvre?: string;
  parent_genre_id?: number;
}

// =============================================================================
// TYPES D'ŒUVRES
// =============================================================================

export interface TypeOeuvre extends BaseClassification {
  id_type_oeuvre: number;
  nom_type: string;
  icone?: string;
  couleur?: string;
  actif?: boolean;
}

export const TYPES_OEUVRES = [
  { nom: 'Livre', icone: 'book', couleur: '#3B82F6' },
  { nom: 'Film', icone: 'film', couleur: '#8B5CF6' },
  { nom: 'Album Musical', icone: 'music', couleur: '#10B981' },
  { nom: 'Article', icone: 'newspaper', couleur: '#F59E0B' },
  { nom: 'Article Scientifique', icone: 'academic-cap', couleur: '#06B6D4' },
  { nom: 'Artisanat', icone: 'cube', couleur: '#84CC16' },
  { nom: 'Œuvre d\'Art', icone: 'color-swatch', couleur: '#EC4899' },
  { nom: 'Photographie', icone: 'camera', couleur: '#6B7280' },
  { nom: 'Théâtre', icone: 'theater-masks', couleur: '#DC2626' },
  { nom: 'Danse', icone: 'user-group', couleur: '#7C3AED' },
  { nom: 'Performance', icone: 'microphone', couleur: '#059669' },
  { nom: 'Installation', icone: 'home', couleur: '#EA580C' },
] as const;

// =============================================================================
// TAGS ET MOTS-CLÉS
// =============================================================================

export interface TagMotCle extends BaseClassification {
  id_tag: number;
  couleur?: string;
  utilisation_count?: number;
  suggestion?: boolean;
}

// =============================================================================
// MATÉRIAUX (ARTISANAT)
// =============================================================================

export interface Materiau extends BaseClassification {
  id_materiau: number;
  origine?: 'naturel' | 'synthetique' | 'mineral';
  durete?: number;
  couleur_principale?: string;
}

export const MATERIAUX_COURANTS = [
  { nom: 'Bois', origine: 'naturel' },
  { nom: 'Pierre', origine: 'mineral' },
  { nom: 'Métal', origine: 'mineral' },
  { nom: 'Céramique', origine: 'mineral' },
  { nom: 'Textile', origine: 'naturel' },
  { nom: 'Cuir', origine: 'naturel' },
  { nom: 'Verre', origine: 'mineral' },
  { nom: 'Papier', origine: 'naturel' },
  { nom: 'Plastique', origine: 'synthetique' },
] as const;

// =============================================================================
// TECHNIQUES ARTISTIQUES/ARTISANALES
// =============================================================================

export interface Technique extends BaseClassification {
  id_technique: number;
  type_art?: string;
  niveau_difficulte?: 'facile' | 'moyen' | 'difficile' | 'expert';
  outils_requis?: string[];
}

export const TECHNIQUES_ARTISANALES = [
  { nom: 'Sculpture', type: 'art_3d' },
  { nom: 'Peinture', type: 'art_2d' },
  { nom: 'Gravure', type: 'art_2d' },
  { nom: 'Tissage', type: 'textile' },
  { nom: 'Poterie', type: 'ceramique' },
  { nom: 'Broderie', type: 'textile' },
  { nom: 'Marqueterie', type: 'bois' },
  { nom: 'Ciselure', type: 'metal' },
  { nom: 'Calligraphie', type: 'ecriture' },
  { nom: 'Photographie', type: 'image' },
] as const;

// =============================================================================
// TYPES D'ÉVÉNEMENTS
// =============================================================================

export interface TypeEvenement extends BaseClassification {
  id_type_evenement: number;
  nom_type: string;
  icone?: string;
  couleur?: string;
  duree_typique?: number; // en heures
}

export const TYPES_EVENEMENTS = [
  { nom: 'Festival', icone: 'star', couleur: '#F59E0B', duree: 72 },
  { nom: 'Exposition', icone: 'photograph', couleur: '#8B5CF6', duree: 240 },
  { nom: 'Concert', icone: 'musical-note', couleur: '#10B981', duree: 3 },
  { nom: 'Conférence', icone: 'academic-cap', couleur: '#3B82F6', duree: 2 },
  { nom: 'Atelier', icone: 'beaker', couleur: '#84CC16', duree: 4 },
  { nom: 'Visite guidée', icone: 'map', couleur: '#06B6D4', duree: 2 },
  { nom: 'Spectacle', icone: 'eye', couleur: '#EC4899', duree: 2 },
  { nom: 'Projection', icone: 'film', couleur: '#6B7280', duree: 2 },
  { nom: 'Lecture', icone: 'book-open', couleur: '#DC2626', duree: 1 },
  { nom: 'Débat', icone: 'chat', couleur: '#7C3AED', duree: 2 },
] as const;

// =============================================================================
// TYPES D'ORGANISATIONS
// =============================================================================

export interface TypeOrganisation extends BaseClassification {
  id_type_organisation: number;
  secteur?: 'public' | 'prive' | 'associatif';
  niveau?: 'local' | 'regional' | 'national' | 'international';
}

export const TYPES_ORGANISATIONS = [
  'Association culturelle',
  'Ministère',
  'Collectivité territoriale',
  'Institution publique',
  'Fondation',
  'ONG',
  'Entreprise privée',
  'Université',
  'École',
  'Musée',
  'Bibliothèque'
] as const;

// =============================================================================
// INTERFACES DE SÉLECTION
// =============================================================================

export interface ClassificationOption {
  value: number | string;
  label: string;
  description?: string;
  color?: string;
  icon?: string;
  disabled?: boolean;
}

export interface ClassificationFilters {
  langue?: number;
  categorie?: number;
  genre?: number;
  type_oeuvre?: number;
  materiau?: number;
  technique?: number;
  type_evenement?: number;
  type_organisation?: number;
  tags?: string[];
}

// =============================================================================
// UTILITAIRES
// =============================================================================

export const getLangueByCode = (code: string): Langue | undefined => {
  return LANGUES_ALGERIE.find(l => l.code === code) as Langue | undefined;
};

export const getTypeOeuvreIcon = (type: string): string => {
  const found = TYPES_OEUVRES.find(t => t.nom.toLowerCase() === type.toLowerCase());
  return found?.icone || 'document';
};

export const getTypeEvenementColor = (type: string): string => {
  const found = TYPES_EVENEMENTS.find(t => t.nom.toLowerCase() === type.toLowerCase());
  return found?.couleur || '#6B7280';
};
