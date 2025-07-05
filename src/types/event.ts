// types/event.ts - Types pour les événements culturels

import type { User } from './user';
import type { Lieu } from './place';
import type { Oeuvre } from './oeuvre';
import type { Organisation } from './organisation';
import type { TypeEvenement } from './classification';
import type { BaseMedia } from './base';

// =============================================================================
// ÉNUMÉRATIONS ÉVÉNEMENTS
// =============================================================================

export type StatutEvenement = 
  | 'planifie' 
  | 'en_cours' 
  | 'termine' 
  | 'annule' 
  | 'reporte';

export type StatutParticipation = 
  | 'inscrit' 
  | 'confirme' 
  | 'present' 
  | 'absent' 
  | 'annule';

export type RoleParticipation = 
  | 'organisateur'
  | 'intervenant'
  | 'participant'
  | 'benevole'
  | 'sponsor'
  | 'media'
  | 'invite'
  | 'artiste'
  | 'conferencier';

export type TypeActivite = 
  | 'conference'
  | 'atelier'
  | 'spectacle'
  | 'exposition'
  | 'visite'
  | 'degustation'
  | 'projection'
  | 'concert'
  | 'lecture'
  | 'debat'
  | 'formation'
  | 'ceremonie'
  | 'autre';

export type RoleOrganisation = 
  | 'organisateur_principal'
  | 'co_organisateur'
  | 'partenaire'
  | 'sponsor'
  | 'media_partner'
  | 'soutien';

// =============================================================================
// INTERFACES PRINCIPALES
// =============================================================================

export interface Evenement {
  id_evenement: number;
  nom_evenement: string;
  description?: string;
  date_debut?: string;
  date_fin?: string;
  contact_email?: string;
  contact_telephone?: string;
  image_url?: string;
  id_lieu: number;
  id_user: number;
  id_type_evenement: number;
  statut?: StatutEvenement;
  capacite_max?: number;
  tarif?: number;
  inscription_requise?: boolean;
  age_minimum?: number;
  langues?: string[];
  accessibilite?: string;
  materiel_fourni?: string[];
  prerequis?: string[];
  certificat_delivre?: boolean;
  date_limite_inscription?: string;
  date_creation: string;
  date_modification: string;
  
  // Relations
  TypeEvenement?: TypeEvenement;
  Lieu?: Lieu;
  User?: User; // Organisateur principal
  Programmes?: Programme[];
  Oeuvres?: Oeuvre[];
  Users?: User[]; // Participants
  Organisations?: Organisation[];
  Medias?: EvenementMedia[];
  
  // Métadonnées calculées
  nombre_participants?: number;
  nombre_inscrits?: number;
  est_complet?: boolean;
  duree_totale?: number;
  note_moyenne?: number;
}

export interface Programme {
  id_programme: number;
  titre: string;
  description?: string;
  id_evenement: number;
  id_lieu?: number;
  heure_debut?: string;
  heure_fin?: string;
  lieu_specifique?: string;
  ordre?: number;
  statut?: StatutEvenement;
  type_activite?: TypeActivite;
  duree_estimee?: number; // en minutes
  nb_participants_max?: number;
  materiel_requis?: string[];
  niveau_requis?: 'debutant' | 'intermediaire' | 'avance' | 'expert';
  langue_principale?: string;
  traduction_disponible?: boolean;
  enregistrement_autorise?: boolean;
  diffusion_live?: boolean;
  support_numerique?: boolean;
  notes_organisateur?: string;
  date_creation: string;
  date_modification: string;
  
  // Relations
  Evenement?: Evenement;
  Lieu?: Lieu;
  Users?: User[]; // Intervenants
}

// =============================================================================
// RELATIONS ET PARTICIPATIONS
// =============================================================================

export interface EvenementUser {
  id_EventUser: number;
  id_evenement?: number;
  id_user?: number;
  role_participation: RoleParticipation;
  date_inscription?: string;
  statut_participation: StatutParticipation;
  notes?: string;
  evaluation_evenement?: number; // 1-5
  commentaire_evaluation?: string;
  recommande?: boolean;
  presence_confirmee?: boolean;
  certificat_genere?: boolean;
  createdAt: string;
  updatedAt: string;
  
  // Relations
  Evenement?: Evenement;
  User?: User;
}

export interface EvenementOeuvre {
  id_EventOeuvre: number;
  id_evenement: number;
  id_oeuvre: number;
  id_presentateur?: number;
  ordre_presentation?: number;
  duree_presentation?: number;
  description_presentation?: string;
  materiel_exposition?: string[];
  notes_techniques?: string;
  
  // Relations
  Evenement?: Evenement;
  Oeuvre?: Oeuvre;
  Presentateur?: User;
}

export interface EvenementOrganisation {
  id: number;
  id_evenement: number;
  id_organisation: number;
  role: RoleOrganisation;
  contribution?: string;
  montant_sponsoring?: number;
  logo_affichage?: boolean;
  mention_communication?: boolean;
  invitation_vip?: number;
  date_creation: string;
  date_modification: string;
  
  // Relations
  Evenement?: Evenement;
  Organisation?: Organisation;
}

export interface ProgrammeIntervenant {
  id_programme: number;
  id_user: number;
  role_intervenant?: 'principal' | 'co_intervenant' | 'moderateur' | 'invite';
  ordre_intervention?: number;
  duree_intervention?: number;
  sujet_intervention?: string;
  biographie_courte?: string;
  honoraires?: number;
  frais_deplacement?: number;
  logement_requis?: boolean;
  materiel_technique?: string[];
  createdAt: string;
  updatedAt: string;
  
  // Relations
  Programme?: Programme;
  User?: User;
}

// =============================================================================
// MÉDIAS D'ÉVÉNEMENTS
// =============================================================================

export interface EvenementMedia extends BaseMedia {
  id_media: number;
  id_evenement: number;
  titre?: string;
  legende?: string;
  photographe?: string;
  moment_capture?: 'avant' | 'pendant' | 'apres';
  programme_associe?: number;
  droits_usage?: 'libre' | 'commercial' | 'presse' | 'interne';
  qualite?: 'basse' | 'moyenne' | 'haute' | 'originale';
  tags?: string[];
  
  // Relations
  Evenement?: Evenement;
}

// =============================================================================
// TYPES DE FORMULAIRES
// =============================================================================

export interface CreateEvenementData {
  nom_evenement: string;
  description?: string;
  date_debut?: string;
  date_fin?: string;
  id_lieu: number;
  id_type_evenement: number;
  contact_email?: string;
  contact_telephone?: string;
  image_url?: string;
  capacite_max?: number;
  tarif?: number;
  inscription_requise?: boolean;
  age_minimum?: number;
  langues?: string[];
  accessibilite?: string;
  
  // Données associées
  oeuvres?: {
    id_oeuvre: number;
    id_presentateur?: number;
    ordre_presentation?: number;
    duree_presentation?: number;
  }[];
  participants?: {
    id_user: number;
    role_participation: RoleParticipation;
  }[];
  organisations?: {
    id_organisation: number;
    role: RoleOrganisation;
    contribution?: string;
  }[];
  programmes?: CreateProgrammeData[];
}

export interface CreateProgrammeData {
  titre: string;
  description?: string;
  heure_debut?: string;
  heure_fin?: string;
  type_activite?: TypeActivite;
  lieu_specifique?: string;
  ordre?: number;
  nb_participants_max?: number;
  materiel_requis?: string[];
  niveau_requis?: string;
  langue_principale?: string;
  intervenants?: number[];
}

export interface InscriptionEvenementData {
  role_participation?: RoleParticipation;
  notes?: string;
  besoins_specifiques?: string;
  allergies?: string[];
  transport_requis?: boolean;
  logement_requis?: boolean;
  accompagnants?: number;
}

// =============================================================================
// TYPES DE FILTRES ET RECHERCHE
// =============================================================================

export interface EvenementFilters {
  type?: number;
  lieu?: number;
  wilaya?: number;
  organisateur?: number;
  date_debut?: string;
  date_fin?: string;
  status?: 'active' | 'past' | 'upcoming' | 'cancelled';
  tarif_max?: number;
  gratuit?: boolean;
  inscription_ouverte?: boolean;
  capacite_disponible?: boolean;
  langues?: string[];
  age_minimum_max?: number;
  accessibilite?: string;
  search?: string;
  type_activite?: TypeActivite;
}

export interface SearchEvenementsParams extends EvenementFilters {
  q?: string;
  sort?: 'date' | 'nom' | 'popularite' | 'tarif' | 'creation';
  order?: 'ASC' | 'DESC';
  limit?: number;
  page?: number;
  with_participants?: boolean;
  with_programmes?: boolean;
}

// =============================================================================
// TYPES DE STATISTIQUES
// =============================================================================

export interface EvenementStats {
  total_evenements: number;
  evenements_par_type: {
    type: string;
    count: number;
  }[];
  evenements_par_wilaya: {
    wilaya: string;
    count: number;
  }[];
  evenements_a_venir: number;
  participants_total: number;
  taux_participation_moyen: number;
  organisateurs_actifs: number;
}

// =============================================================================
// CONSTANTES
// =============================================================================

export const STATUTS_EVENEMENT_OPTIONS = [
  { value: 'planifie', label: 'Planifié', color: 'blue' },
  { value: 'en_cours', label: 'En cours', color: 'green' },
  { value: 'termine', label: 'Terminé', color: 'gray' },
  { value: 'annule', label: 'Annulé', color: 'red' },
  { value: 'reporte', label: 'Reporté', color: 'orange' },
] as const;

export const ROLES_PARTICIPATION_OPTIONS = [
  { value: 'organisateur', label: 'Organisateur', permissions: ['admin'] },
  { value: 'intervenant', label: 'Intervenant', permissions: ['speak'] },
  { value: 'participant', label: 'Participant', permissions: ['attend'] },
  { value: 'benevole', label: 'Bénévole', permissions: ['help'] },
  { value: 'sponsor', label: 'Sponsor', permissions: ['support'] },
  { value: 'media', label: 'Média', permissions: ['press'] },
  { value: 'invite', label: 'Invité', permissions: ['vip'] },
  { value: 'artiste', label: 'Artiste', permissions: ['perform'] },
  { value: 'conferencier', label: 'Conférencier', permissions: ['speak'] },
] as const;

export const TYPES_ACTIVITE_OPTIONS = [
  { value: 'conference', label: 'Conférence', icon: 'academic-cap', duree: 120 },
  { value: 'atelier', label: 'Atelier', icon: 'wrench-screwdriver', duree: 180 },
  { value: 'spectacle', label: 'Spectacle', icon: 'star', duree: 90 },
  { value: 'exposition', label: 'Exposition', icon: 'photograph', duree: 60 },
  { value: 'visite', label: 'Visite', icon: 'map', duree: 120 },
  { value: 'projection', label: 'Projection', icon: 'film', duree: 120 },
  { value: 'concert', label: 'Concert', icon: 'musical-note', duree: 120 },
  { value: 'lecture', label: 'Lecture', icon: 'book-open', duree: 60 },
  { value: 'debat', label: 'Débat', icon: 'chat-bubble-left-right', duree: 90 },
] as const;

// =============================================================================
// UTILITAIRES
// =============================================================================

export const isEvenementActive = (evenement: Evenement): boolean => {
  if (!evenement.date_fin) return false;
  return new Date(evenement.date_fin) >= new Date();
};

export const isEvenementAVenir = (evenement: Evenement): boolean => {
  if (!evenement.date_debut) return false;
  return new Date(evenement.date_debut) > new Date();
};

export const getEvenementStatutColor = (statut: StatutEvenement): string => {
  const option = STATUTS_EVENEMENT_OPTIONS.find(opt => opt.value === statut);
  return option?.color || 'gray';
};

export const canUserParticipate = (evenement: Evenement, user: User): boolean => {
  if (!isEvenementActive(evenement)) return false;
  if (evenement.est_complet) return false;
  if (evenement.age_minimum && user.date_naissance) {
    const age = new Date().getFullYear() - new Date(user.date_naissance).getFullYear();
    if (age < evenement.age_minimum) return false;
  }
  return true;
};

export const calculateDureeEvenement = (evenement: Evenement): number => {
  if (!evenement.date_debut || !evenement.date_fin) return 0;
  const debut = new Date(evenement.date_debut);
  const fin = new Date(evenement.date_fin);
  return (fin.getTime() - debut.getTime()) / (1000 * 60 * 60); // en heures
};

export const formatDureeEvenement = (minutes: number): string => {
  const heures = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (heures === 0) return `${mins}min`;
  if (mins === 0) return `${heures}h`;
  return `${heures}h${mins.toString().padStart(2, '0')}`;
};
