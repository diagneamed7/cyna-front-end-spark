// types/organization.ts - Types pour les organisations et éditeurs

import type { TypeOrganisation } from './classification';
import type { User } from './user';
import type { Oeuvre } from './oeuvre';

// =============================================================================
// ÉNUMÉRATIONS ORGANISATIONS
// =============================================================================

export type TypeEditeur = 
  | 'maison_edition'
  | 'label_musique'
  | 'studio_cinema'
  | 'galerie_art'
  | 'editeur_scientifique'
  | 'presse'
  | 'editeur_numerique'
  | 'autre';

export type RoleEditeur = 
  | 'editeur_principal'
  | 'co_editeur'
  | 'distributeur'
  | 'editeur_original'
  | 'editeur_traduction'
  | 'editeur_numerique'
  | 'reedition'
  | 'autre';

export type StatutEdition = 
  | 'en_cours'
  | 'publie'
  | 'epuise'
  | 'annule';

export type RoleDansOrganisation = 
  | 'membre'
  | 'responsable'
  | 'directeur'
  | 'collaborateur';

// =============================================================================
// INTERFACES PRINCIPALES
// =============================================================================

export interface Organisation {
  id_organisation: number;
  nom: string;
  id_type_organisation: number;
  description?: string;
  site_web?: string;
  email?: string;
  telephone?: string;
  adresse?: string;
  ville?: string;
  wilaya_id?: number;
  logo_url?: string;
  date_creation?: string;
  actif?: boolean;
  nombre_membres?: number;
  
  // Relations
  TypeOrganisation?: TypeOrganisation;
  Users?: User[];
  Evenements?: import('./event').Evenement[];
}

export interface Editeur {
  id_editeur: number;
  nom: string;
  type_editeur: TypeEditeur;
  pays?: string;
  ville?: string;
  adresse?: string;
  site_web?: string;
  email?: string;
  telephone?: string;
  description?: string;
  annee_creation?: number;
  logo_url?: string;
  specialites?: string[];
  nombre_publications?: number;
  actif: boolean;
  date_creation: string;
  date_modification: string;
  
  // Relations
  Oeuvres?: Oeuvre[];
}

// =============================================================================
// RELATIONS UTILISATEUR-ORGANISATION
// =============================================================================

export interface UserOrganisation {
  id: number;
  id_user: number;
  id_organisation: number;
  role_dans_organisation: RoleDansOrganisation;
  date_debut?: string;
  date_fin?: string;
  actif: boolean;
  responsabilites?: string[];
  description_poste?: string;
  createdAt: string;
  updatedAt: string;
  
  // Relations
  User?: User;
  Organisation?: Organisation;
}

// =============================================================================
// RELATIONS ŒUVRE-ÉDITEUR
// =============================================================================

export interface OeuvreEditeur {
  id: number;
  id_oeuvre: number;
  id_editeur: number;
  role_editeur: RoleEditeur;
  date_edition?: string;
  isbn_editeur?: string;
  tirage?: number;
  prix_vente?: number;
  langue_edition?: string;
  format?: string;
  statut_edition: StatutEdition;
  notes?: string;
  date_creation: string;
  date_modification: string;
  
  // Relations
  Oeuvre?: Oeuvre;
  Editeur?: Editeur;
}

// =============================================================================
// TYPES DE FORMULAIRES
// =============================================================================

export interface CreateOrganisationData {
  nom: string;
  id_type_organisation: number;
  description?: string;
  site_web?: string;
  email?: string;
  telephone?: string;
  adresse?: string;
  ville?: string;
  wilaya_id?: number;
  logo_url?: string;
}

export interface UpdateOrganisationData extends Partial<CreateOrganisationData> {
  actif?: boolean;
}

export interface CreateEditeurData {
  nom: string;
  type_editeur: TypeEditeur;
  pays?: string;
  ville?: string;
  adresse?: string;
  site_web?: string;
  email?: string;
  telephone?: string;
  description?: string;
  annee_creation?: number;
  logo_url?: string;
  specialites?: string[];
}

export interface UpdateEditeurData extends Partial<CreateEditeurData> {
  actif?: boolean;
}

export interface AssignUserToOrganisationData {
  id_user: number;
  id_organisation: number;
  role_dans_organisation: RoleDansOrganisation;
  date_debut?: string;
  responsabilites?: string[];
  description_poste?: string;
}

// =============================================================================
// TYPES DE FILTRES
// =============================================================================

export interface OrganisationFilters {
  type_organisation?: number;
  wilaya?: number;
  ville?: string;
  actif?: boolean;
  search?: string;
  membre_id?: number;
}

export interface EditeurFilters {
  type_editeur?: TypeEditeur;
  pays?: string;
  ville?: string;
  actif?: boolean;
  annee_creation_min?: number;
  annee_creation_max?: number;
  search?: string;
  specialite?: string;
}

// =============================================================================
// TYPES DE STATISTIQUES
// =============================================================================

export interface OrganisationStats {
  total_organisations: number;
  organisations_par_type: {
    type: string;
    count: number;
  }[];
  organisations_par_wilaya: {
    wilaya: string;
    count: number;
  }[];
  organisations_actives: number;
  moyenne_membres_par_organisation: number;
}

export interface EditeurStats {
  total_editeurs: number;
  editeurs_par_type: {
    type: TypeEditeur;
    count: number;
  }[];
  editeurs_par_pays: {
    pays: string;
    count: number;
  }[];
  editeurs_actifs: number;
  total_publications: number;
}

// =============================================================================
// CONSTANTES
// =============================================================================

export const TYPES_EDITEUR_OPTIONS = [
  { value: 'maison_edition', label: 'Maison d\'édition', icon: 'book' },
  { value: 'label_musique', label: 'Label musical', icon: 'musical-note' },
  { value: 'studio_cinema', label: 'Studio de cinéma', icon: 'film' },
  { value: 'galerie_art', label: 'Galerie d\'art', icon: 'photograph' },
  { value: 'editeur_scientifique', label: 'Éditeur scientifique', icon: 'academic-cap' },
  { value: 'presse', label: 'Presse', icon: 'newspaper' },
  { value: 'editeur_numerique', label: 'Éditeur numérique', icon: 'computer-desktop' },
  { value: 'autre', label: 'Autre', icon: 'ellipsis-horizontal' },
] as const;

export const ROLES_EDITEUR_OPTIONS = [
  { value: 'editeur_principal', label: 'Éditeur principal' },
  { value: 'co_editeur', label: 'Co-éditeur' },
  { value: 'distributeur', label: 'Distributeur' },
  { value: 'editeur_original', label: 'Éditeur original' },
  { value: 'editeur_traduction', label: 'Éditeur de traduction' },
  { value: 'editeur_numerique', label: 'Éditeur numérique' },
  { value: 'reedition', label: 'Réédition' },
  { value: 'autre', label: 'Autre' },
] as const;

export const ROLES_ORGANISATION_OPTIONS = [
  { value: 'membre', label: 'Membre', permissions: ['read'] },
  { value: 'responsable', label: 'Responsable', permissions: ['read', 'write', 'manage_members'] },
  { value: 'directeur', label: 'Directeur', permissions: ['read', 'write', 'manage_members', 'admin'] },
  { value: 'collaborateur', label: 'Collaborateur', permissions: ['read', 'write'] },
] as const;

export const STATUTS_EDITION_OPTIONS = [
  { value: 'en_cours', label: 'En cours', color: 'yellow' },
  { value: 'publie', label: 'Publié', color: 'green' },
  { value: 'epuise', label: 'Épuisé', color: 'red' },
  { value: 'annule', label: 'Annulé', color: 'gray' },
] as const;

// =============================================================================
// UTILITAIRES
// =============================================================================

export const getEditeurTypeLabel = (type: TypeEditeur): string => {
  const option = TYPES_EDITEUR_OPTIONS.find(opt => opt.value === type);
  return option?.label || 'Type inconnu';
};

export const getEditeurTypeIcon = (type: TypeEditeur): string => {
  const option = TYPES_EDITEUR_OPTIONS.find(opt => opt.value === type);
  return option?.icon || 'ellipsis-horizontal';
};

export const getUserRoleInOrganisation = (
  user: User, 
  organisationId: number
): RoleDansOrganisation | null => {
  const membership = user.Organisations?.find(
    org => org.id_organisation === organisationId
  );
  return membership ? membership?.role_dans_organisation || null : null;
};

export const canUserManageOrganisation = (
  user: User, 
  organisationId: number
): boolean => {
  const role = getUserRoleInOrganisation(user, organisationId);
  return role === 'directeur' || role === 'responsable';
};

export const isUserMemberOfOrganisation = (
  user: User, 
  organisationId: number
): boolean => {
  return getUserRoleInOrganisation(user, organisationId) !== null;
};
