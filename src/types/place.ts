// types/place.ts - Types pour les lieux et patrimoine

import type { Wilaya, Daira, Commune, Localite, Coordinates } from './geography';
import type { BaseMedia } from './base';

// =============================================================================
// ÉNUMÉRATIONS LIEUX
// =============================================================================

export type TypeLieu = 'Wilaya' | 'Daira' | 'Commune';

export type TypeMonument = 
  | 'Mosquée'
  | 'Palais'
  | 'Statue'
  | 'Tour'
  | 'Musée';

export type TypeVestige = 
  | 'Ruines'
  | 'Murailles'
  | 'Site archéologique';

export type TypePatrimoine = 
  | 'monument'
  | 'vestige'
  | 'site_culturel';

// =============================================================================
// INTERFACES PRINCIPALES
// =============================================================================

export interface Lieu {
  id_lieu: number;
  typeLieu: TypeLieu;
  wilayaId?: number;
  dairaId?: number;
  communeId?: number;
  localiteId?: number;
  nom: string;
  adresse: string;
  latitude: number;
  longitude: number;
  createdAt: string;
  updatedAt: string;
  
  // Relations géographiques
  Wilaya?: Wilaya;
  Daira?: Daira;
  Commune?: Commune;
  Localite?: Localite;
  
  // Relations de contenu
  DetailLieu?: DetailLieu;
  Services?: Service[];
  LieuMedias?: LieuMedia[];
  Evenements?: import('./event').Evenement[];
  
  // Métadonnées calculées
  distance?: number;
  adresseComplete?: string;
  typePatrimoine?: TypePatrimoine;
  imagePrincipale?: string;
  nombreImages?: number;
  notesMoyenne?: number;
}

export interface DetailLieu {
  id_detailLieu: number;
  description?: string;
  horaires?: string;
  histoire?: string;
  id_lieu: number;
  referencesHistoriques?: string;
  noteMoyenne?: number;
  periode_historique?: string;
  style_architectural?: string;
  etat_conservation?: 'excellent' | 'bon' | 'moyen' | 'mauvais';
  accessibilite?: 'total' | 'partiel' | 'limite' | 'aucun';
  visite_guidee_disponible?: boolean;
  tarif_entree?: number;
  langues_visite?: string[];
  createdAt: string;
  updatedAt: string;
  
  // Relations patrimoine
  Monuments?: Monument[];
  Vestiges?: Vestige[];
  Lieu?: Lieu;
}

export interface Monument {
  id: number;
  detailLieuId: number;
  nom: string;
  description: string;
  type: TypeMonument;
  architecte?: string;
  date_construction?: string;
  style?: string;
  materiaux_principaux?: string[];
  dimensions?: string;
  capacite?: number;
  fonction_actuelle?: string;
  fonction_originale?: string;
  classement_patrimoine?: boolean;
  date_classement?: string;
  restaurations?: string[];
  createdAt: string;
  updatedAt: string;
  DetailLieu?: DetailLieu;
}

export interface Vestige {
  id: number;
  detailLieuId: number;
  nom: string;
  description: string;
  type: TypeVestige;
  civilisation?: string;
  periode_estimation?: string;
  date_decouverte?: string;
  archeologue_principal?: string;
  etendue_site?: number; // en m²
  profondeur_fouilles?: number; // en mètres
  artefacts_principales?: string[];
  importance_historique?: 'locale' | 'regionale' | 'nationale' | 'internationale';
  fouilles_en_cours?: boolean;
  acces_public?: boolean;
  recherches_associees?: string[];
  createdAt: string;
  updatedAt: string;
  DetailLieu?: DetailLieu;
}

export interface Service {
  id: number;
  id_lieu: number;
  nom: string;
  description?: string;
  gratuit?: boolean;
  tarif?: number;
  horaires?: string;
  contact?: string;
  langue_service?: string;
  createdAt: string;
  updatedAt: string;
  Lieu?: Lieu;
}

export interface LieuMedia extends BaseMedia {
  id: number;
  id_lieu: number;
  titre?: string;
  legende?: string;
  photographe?: string;
  date_prise?: string;
  qualite?: 'basse' | 'moyenne' | 'haute' | 'originale';
  tags?: string[];
  vue_type?: 'exterieur' | 'interieur' | 'detail' | 'panorama' | 'aerienne';
  saison?: 'printemps' | 'ete' | 'automne' | 'hiver';
  moment_journee?: 'matin' | 'midi' | 'apres_midi' | 'soir' | 'nuit';
  Lieu?: Lieu;
}

// =============================================================================
// TYPES DE RECHERCHE ET FILTRES
// =============================================================================

export interface LieuFilters {
  wilaya?: number;
  daira?: number;
  commune?: number;
  type_lieu?: TypeLieu;
  type_patrimoine?: TypePatrimoine;
  type_monument?: TypeMonument;
  type_vestige?: TypeVestige;
  search?: string;
  with_events?: boolean;
  services?: string[];
  accessibilite?: string;
  visite_guidee?: boolean;
  note_min?: number;
}

export interface ProximiteFilters extends Coordinates {
  rayon?: number; // en kilomètres
  type_patrimoine?: TypePatrimoine;
  services_requis?: string[];
}

export interface PatrimoineSearchParams extends LieuFilters {
  q?: string;
  sort?: 'nom' | 'note' | 'recent' | 'distance' | 'popularite';
  order?: 'ASC' | 'DESC';
  limit?: number;
  page?: number;
}

// =============================================================================
// TYPES DE FORMULAIRES
// =============================================================================

export interface CreateLieuData {
  nom: string;
  adresse: string;
  latitude: number;
  longitude: number;
  typeLieu: TypeLieu;
  wilayaId?: number;
  dairaId?: number;
  communeId?: number;
  localiteId?: number;
  details?: CreateDetailLieuData;
  services?: string[];
  medias?: CreateLieuMediaData[];
}

export interface CreateDetailLieuData {
  description?: string;
  horaires?: string;
  histoire?: string;
  referencesHistoriques?: string;
  periode_historique?: string;
  style_architectural?: string;
  etat_conservation?: string;
  accessibilite?: string;
  visite_guidee_disponible?: boolean;
  tarif_entree?: number;
  langues_visite?: string[];
}

export interface CreateMonumentData {
  nom: string;
  description: string;
  type: TypeMonument;
  architecte?: string;
  date_construction?: string;
  style?: string;
  materiaux_principaux?: string[];
  dimensions?: string;
  capacite?: number;
  fonction_actuelle?: string;
  fonction_originale?: string;
}

export interface CreateVestigeData {
  nom: string;
  description: string;
  type: TypeVestige;
  civilisation?: string;
  periode_estimation?: string;
  date_decouverte?: string;
  archeologue_principal?: string;
  etendue_site?: number;
  profondeur_fouilles?: number;
  artefacts_principales?: string[];
  importance_historique?: string;
}

export interface CreateLieuMediaData {
  type: 'image' | 'video' | 'document';
  url: string;
  titre?: string;
  description?: string;
  legende?: string;
  photographe?: string;
  vue_type?: string;
  tags?: string[];
}

// =============================================================================
// TYPES DE PARCOURS
// =============================================================================

export interface Parcours {
  id_parcours: number;
  nom: string;
  description?: string;
  duree_estimee?: number; // en heures
  difficulte?: 'facile' | 'moyen' | 'difficile';
  type_transport?: 'pied' | 'voiture' | 'transport_public' | 'velo';
  distance_totale?: number; // en km
  points_interet?: number;
  guide_requis?: boolean;
  tarif?: number;
  saison_ideale?: string[];
  accessibilite?: string;
  createdAt: string;
  updatedAt: string;
  Lieux?: Lieu[];
}

export interface ParcoursLieu {
  id_parcours_lieu: number;
  id_parcours: number;
  id_lieu: number;
  id_evenement?: number;
  ordre: number;
  duree_visite?: number; // en minutes
  description_etape?: string;
  coordonnees_parking?: Coordinates;
  createdAt: string;
  updatedAt: string;
  Parcours?: Parcours;
  Lieu?: Lieu;
  Evenement?: import('./event').Evenement;
}

// =============================================================================
// TYPES DE STATISTIQUES
// =============================================================================

export interface PatrimoineStats {
  total_sites: number;
  sites_par_wilaya: {
    wilaya: string;
    count: number;
  }[];
  monuments_par_type: {
    type: TypeMonument;
    count: number;
  }[];
  vestiges_par_type: {
    type: TypeVestige;
    count: number;
  }[];
  sites_mieux_notes: Lieu[];
  sites_populaires: Lieu[];
  total_medias: number;
  total_services: number;
}

// =============================================================================
// CONSTANTES
// =============================================================================

export const TYPES_MONUMENT_OPTIONS = [
  { value: 'Mosquée', label: 'Mosquée', icon: 'building-library' },
  { value: 'Palais', label: 'Palais', icon: 'home-modern' },
  { value: 'Statue', label: 'Statue', icon: 'user' },
  { value: 'Tour', label: 'Tour', icon: 'building-office' },
  { value: 'Musée', label: 'Musée', icon: 'academic-cap' },
] as const;

export const TYPES_VESTIGE_OPTIONS = [
  { value: 'Ruines', label: 'Ruines', icon: 'cube-transparent' },
  { value: 'Murailles', label: 'Murailles', icon: 'shield-check' },
  { value: 'Site archéologique', label: 'Site archéologique', icon: 'magnifying-glass' },
] as const;

export const SERVICES_COURANTS = [
  'Parking',
  'Toilettes',
  'Restaurant',
  'Café',
  'Boutique souvenirs',
  'Guide touristique',
  'Audioguide',
  'Accès handicapés',
  'Wi-Fi gratuit',
  'Aire de pique-nique',
  'Vestiaire',
  'Consigne',
] as const;

export const PERIODES_HISTORIQUES = [
  'Préhistoire',
  'Antiquité',
  'Période berbère',
  'Période romaine',
  'Période byzantine',
  'Conquête arabe',
  'Période almoravide',
  'Période almohade',
  'Période mérinide',
  'Période ottomane',
  'Période coloniale française',
  'Indépendance',
  'Moderne',
] as const;

// =============================================================================
// UTILITAIRES
// =============================================================================

export const getTypePatrimoine = (lieu: Lieu): TypePatrimoine => {
  if (lieu.DetailLieu?.Monuments?.length) return 'monument';
  if (lieu.DetailLieu?.Vestiges?.length) return 'vestige';
  return 'site_culturel';
};

export const formatAdresseComplete = (lieu: Lieu): string => {
  const parties = [
    lieu.adresse,
    lieu.Commune?.nom,
    lieu.Daira?.nom,
    lieu.Wilaya?.nom
  ].filter(Boolean);
  
  return parties.join(', ');
};

export const calculateDistance = (
  point1: Coordinates, 
  point2: Coordinates
): number => {
  const R = 6371; // Rayon de la Terre en km
  const dLat = (point2.latitude - point1.latitude) * Math.PI / 180;
  const dLon = (point2.longitude - point1.longitude) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(point1.latitude * Math.PI / 180) * Math.cos(point2.latitude * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

export const getImagePrincipale = (lieu: Lieu): string | null => {
  const image = lieu.LieuMedias?.find(media => media.type === 'image');
  return image?.url || null;
};

export const hasService = (lieu: Lieu, serviceName: string): boolean => {
  return lieu.Services?.some(service => service.nom === serviceName) || false;
};
