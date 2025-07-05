// types/geography.ts - Types géographiques pour l'Algérie

// =============================================================================
// TYPES GÉOGRAPHIQUES ALGÉRIENS
// =============================================================================

export interface Wilaya {
  id_wilaya: number;
  codeW: number;
  nom: string;
  wilaya_name_ascii: string;
  createdAt: string;
  updatedAt: string;
  Dairas?: Daira[];
}

export interface Daira {
  id_daira: number;
  nom: string;
  daira_name_ascii: string;
  wilayaId: number;
  createdAt: string;
  updatedAt: string;
  Wilaya?: Wilaya;
  Communes?: Commune[];
}

export interface Commune {
  id_commune: number;
  nom: string;
  commune_name_ascii: string;
  dairaId: number;
  createdAt: string;
  updatedAt: string;
  Daira?: Daira;
  Localites?: Localite[];
}

export interface Localite {
  id_localite: number;
  nom: string;
  localite_name_ascii: string;
  id_commune: number;
  Commune?: Commune;
}

// =============================================================================
// TYPES DE COORDONNÉES
// =============================================================================

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface GeographicLocation extends Coordinates {
  wilayaId?: number;
  dairaId?: number;
  communeId?: number;
  localiteId?: number;
  adresse?: string;
}

// =============================================================================
// TYPES DE FILTRES GÉOGRAPHIQUES
// =============================================================================

export interface GeographicFilters {
  wilaya?: number;
  daira?: number;
  commune?: number;
  localite?: string;
}

export interface ProximitySearch extends Coordinates {
  rayon?: number; // en kilomètres
}

// =============================================================================
// UTILITAIRES GÉOGRAPHIQUES
// =============================================================================

export interface AdresseComplete {
  lieu?: string;
  localite?: string;
  commune?: string;
  daira?: string;
  wilaya?: string;
  adresse_formatee?: string;
}

// =============================================================================
// CONSTANTES GÉOGRAPHIQUES
// =============================================================================

export const WILAYAS_PRINCIPALES = [
  { code: 16, nom: 'Alger' },
  { code: 31, nom: 'Oran' },
  { code: 25, nom: 'Constantine' },
  { code: 15, nom: 'Tizi Ouzou' },
  { code: 6, nom: 'Béjaïa' },
  { code: 19, nom: 'Sétif' },
  { code: 9, nom: 'Blida' },
  { code: 34, nom: 'Bordj Bou Arréridj' },
] as const;

// =============================================================================
// TYPES POUR LES SÉLECTEURS
// =============================================================================

export interface GeographicOption {
  value: number;
  label: string;
  ascii_name?: string;
  parent_id?: number;
}

export interface GeographicHierarchy {
  wilaya: GeographicOption | null;
  daira: GeographicOption | null;
  commune: GeographicOption | null;
  localite: GeographicOption | null;
}
