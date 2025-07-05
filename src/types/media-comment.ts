// types/media-comment.ts - Types pour les médias et commentaires

import type { User } from './user';
import type { Oeuvre } from './oeuvre';
import type { Evenement } from './event';
import type { BaseMedia } from './base';

// =============================================================================
// ÉNUMÉRATIONS MÉDIAS ET COMMENTAIRES
// =============================================================================

export type StatutCommentaire = 
  | 'publie' 
  | 'en_attente' 
  | 'rejete' 
  | 'supprime';

export type TypeMedia = 
  | 'image' 
  | 'video' 
  | 'audio' 
  | 'document' 
  | 'pdf'
  | 'lien';

export type QualiteMedia = 
  | 'basse' 
  | 'moyenne' 
  | 'haute' 
  | 'originale';

export type DroitsUsage = 
  | 'libre' 
  | 'commercial' 
  | 'presse' 
  | 'personnel' 
  | 'educatif'
  | 'restriction';

// =============================================================================
// INTERFACES COMMENTAIRES
// =============================================================================

export interface Commentaire {
  id_commentaire: number;
  contenu: string;
  id_user: number;
  id_oeuvre?: number;
  id_evenement?: number;
  commentaire_parent_id?: number;
  statut: StatutCommentaire;
  note_qualite?: number; // 1-5
  langue?: string;
  sentiment?: 'positif' | 'neutre' | 'negatif';
  signalements?: number;
  likes?: number;
  date_creation: string;
  date_modification: string;
  
  // Relations
  User?: User;
  Oeuvre?: Oeuvre;
  Evenement?: Evenement;
  CommentaireParent?: Commentaire;
  Reponses?: Commentaire[];
  
  // Métadonnées
  est_auteur?: boolean;
  peut_modifier?: boolean;
  peut_supprimer?: boolean;
  nombre_reponses?: number;
  profondeur?: number;
}

export interface CritiqueEvaluation {
  id_critique: number;
  id_oeuvre: number;
  id_user: number;
  note: number; // 1-5 ou 1-10 selon le système
  commentaire?: string;
  titre_critique?: string;
  aspect_evalue?: string; // 'general', 'technique', 'artistique', 'pedagogique'
  recommande?: boolean;
  critique_professionnelle?: boolean;
  expertise_domaine?: string;
  experience_utilisateur?: string;
  avantages?: string[];
  inconvenients?: string[];
  public_cible?: string;
  date_creation: string;
  date_modification: string;
  
  // Relations
  User?: User;
  Oeuvre?: Oeuvre;
  
  // Statistiques
  votes_utile?: number;
  votes_total?: number;
  signalements?: number;
}

// =============================================================================
// INTERFACES MÉDIAS
// =============================================================================

export interface Media extends BaseMedia {
  id_media: number;
  id_oeuvre?: number;
  id_evenement?: number;
  id_lieu?: number;
  id_user?: number; // Propriétaire/uploadeur
  type_media: TypeMedia;
  titre?: string;
  legende?: string;
  alt_text?: string; // Pour accessibilité
  credit?: string;
  copyright?: string;
  source_originale?: string;
  qualite: QualiteMedia;
  droits_usage: DroitsUsage;
  taille_fichier?: number; // en bytes
  format?: string;
  resolution?: string;
  duree?: number; // pour vidéo/audio en secondes
  miniature_url?: string;
  transcription?: string; // pour audio/vidéo
  metadata?: Record<string, any>;
  tags?: string[];
  langue_contenu?: string;
  sous_titres_disponibles?: string[];
  date_prise?: string;
  lieu_prise?: string;
  equipement_utilise?: string;
  ordre_affichage?: number;
  featured?: boolean; // Média principal
  approuve?: boolean;
  telechargements?: number;
  vues?: number;
  
  // Relations
  User?: User;
  Oeuvre?: Oeuvre;
  Evenement?: Evenement;
  Lieu?: import('./place').Lieu;
}

// =============================================================================
// INTERFACES DE GALERIES ET COLLECTIONS
// =============================================================================

export interface Collection {
  id_collection: number;
  nom: string;
  description?: string;
  id_user: number;
  type_collection: 'oeuvres' | 'evenements' | 'lieux' | 'medias';
  publique: boolean;
  collaborative?: boolean;
  tags?: string[];
  image_couverture?: string;
  ordre_affichage?: 'date' | 'alphabetique' | 'manuel' | 'popularite';
  date_creation: string;
  date_modification: string;
  
  // Relations
  User?: User;
  Oeuvres?: Oeuvre[];
  Evenements?: Evenement[];
  Lieux?: import('./place').Lieu[];
  Medias?: Media[];
  
  // Statistiques
  nombre_elements?: number;
  nombre_vues?: number;
  nombre_likes?: number;
  nombre_partages?: number;
}

export interface Galerie {
  id_galerie: number;
  nom: string;
  description?: string;
  id_user: number;
  id_oeuvre?: number;
  id_evenement?: number;
  id_lieu?: number;
  type_galerie: 'photos' | 'videos' | 'mixte';
  style_affichage: 'grille' | 'mosaique' | 'carrousel' | 'liste';
  publique: boolean;
  autoriser_telechargement?: boolean;
  autoriser_commentaires?: boolean;
  diaporama_auto?: boolean;
  watermark?: boolean;
  date_creation: string;
  date_modification: string;
  
  // Relations
  User?: User;
  Medias?: Media[];
  
  // Métadonnées
  nombre_medias?: number;
  taille_totale?: number;
  derniere_activite?: string;
}

// =============================================================================
// TYPES DE FORMULAIRES
// =============================================================================

export interface CreateCommentaireData {
  contenu: string;
  id_oeuvre?: number;
  id_evenement?: number;
  commentaire_parent_id?: number;
  note_qualite?: number;
  langue?: string;
}

export interface UpdateCommentaireData {
  contenu?: string;
  note_qualite?: number;
}

export interface CreateCritiqueData {
  id_oeuvre: number;
  note: number;
  commentaire?: string;
  titre_critique?: string;
  aspect_evalue?: string;
  recommande?: boolean;
  expertise_domaine?: string;
  experience_utilisateur?: string;
  avantages?: string[];
  inconvenients?: string[];
  public_cible?: string;
}

export interface CreateMediaData {
  type_media: TypeMedia;
  url: string;
  titre?: string;
  description?: string;
  legende?: string;
  alt_text?: string;
  credit?: string;
  droits_usage: DroitsUsage;
  tags?: string[];
  langue_contenu?: string;
  id_oeuvre?: number;
  id_evenement?: number;
  id_lieu?: number;
}

export interface UploadMediaData extends CreateMediaData {
  file: File;
  qualite_souhaitee?: QualiteMedia;
  compression?: boolean;
  miniature_auto?: boolean;
  metadata_auto?: boolean;
}

export interface CreateCollectionData {
  nom: string;
  description?: string;
  type_collection: 'oeuvres' | 'evenements' | 'lieux' | 'medias';
  publique?: boolean;
  collaborative?: boolean;
  tags?: string[];
  image_couverture?: string;
}

// =============================================================================
// TYPES DE FILTRES
// =============================================================================

export interface CommentaireFilters {
  statut?: StatutCommentaire;
  id_oeuvre?: number;
  id_evenement?: number;
  id_user?: number;
  note_min?: number;
  langue?: string;
  sentiment?: string;
  date_debut?: string;
  date_fin?: string;
  avec_reponses?: boolean;
}

export interface MediaFilters {
  type_media?: TypeMedia;
  qualite?: QualiteMedia;
  droits_usage?: DroitsUsage;
  id_user?: number;
  id_oeuvre?: number;
  id_evenement?: number;
  tags?: string[];
  langue?: string;
  date_debut?: string;
  date_fin?: string;
  featured?: boolean;
  approuve?: boolean;
}

export interface CritiqueFilters {
  id_oeuvre?: number;
  id_user?: number;
  note_min?: number;
  note_max?: number;
  recommande?: boolean;
  critique_professionnelle?: boolean;
  aspect_evalue?: string;
  date_debut?: string;
  date_fin?: string;
}

// =============================================================================
// TYPES DE MODÉRATION
// =============================================================================

export interface SignalementCommentaire {
  id_signalement: number;
  id_commentaire: number;
  id_user: number; // Utilisateur qui signale
  motif: 'spam' | 'inapproprie' | 'hors_sujet' | 'faux' | 'plagiat' | 'autre';
  description?: string;
  date_signalement: string;
  traite: boolean;
  decision?: 'rejete' | 'valide' | 'supprime';
  date_traitement?: string;
  moderateur_id?: number;
}

export interface ModerationAction {
  id_action: number;
  type_contenu: 'commentaire' | 'critique' | 'media';
  id_contenu: number;
  action: 'approuver' | 'rejeter' | 'supprimer' | 'modifier' | 'signaler';
  motif?: string;
  id_moderateur: number;
  date_action: string;
  notes?: string;
}

// =============================================================================
// CONSTANTES
// =============================================================================

export const STATUTS_COMMENTAIRE_OPTIONS = [
  { value: 'publie', label: 'Publié', color: 'green' },
  { value: 'en_attente', label: 'En attente', color: 'orange' },
  { value: 'rejete', label: 'Rejeté', color: 'red' },
  { value: 'supprime', label: 'Supprimé', color: 'gray' },
] as const;

export const TYPES_MEDIA_OPTIONS = [
  { value: 'image', label: 'Image', icon: 'photo', accept: 'image/*' },
  { value: 'video', label: 'Vidéo', icon: 'film', accept: 'video/*' },
  { value: 'audio', label: 'Audio', icon: 'musical-note', accept: 'audio/*' },
  { value: 'document', label: 'Document', icon: 'document', accept: '.doc,.docx,.txt,.rtf' },
  { value: 'pdf', label: 'PDF', icon: 'document-text', accept: '.pdf' },
  { value: 'lien', label: 'Lien externe', icon: 'link', accept: '' },
] as const;

export const DROITS_USAGE_OPTIONS = [
  { value: 'libre', label: 'Usage libre', description: 'Libre d\'utilisation' },
  { value: 'commercial', label: 'Usage commercial', description: 'Usage commercial autorisé' },
  { value: 'presse', label: 'Usage presse', description: 'Réservé à la presse' },
  { value: 'personnel', label: 'Usage personnel', description: 'Usage personnel uniquement' },
  { value: 'educatif', label: 'Usage éducatif', description: 'Usage éducatif uniquement' },
  { value: 'restriction', label: 'Droits restreints', description: 'Droits d\'usage limités' },
] as const;

export const MOTIFS_SIGNALEMENT = [
  { value: 'spam', label: 'Spam' },
  { value: 'inapproprie', label: 'Contenu inapproprié' },
  { value: 'hors_sujet', label: 'Hors sujet' },
  { value: 'faux', label: 'Information fausse' },
  { value: 'plagiat', label: 'Plagiat' },
  { value: 'autre', label: 'Autre motif' },
] as const;

// =============================================================================
// UTILITAIRES
// =============================================================================

export const getCommentaireStatutColor = (statut: StatutCommentaire): string => {
  const option = STATUTS_COMMENTAIRE_OPTIONS.find(opt => opt.value === statut);
  return option?.color || 'gray';
};

export const formatTailleFichier = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getMediaTypeIcon = (type: TypeMedia): string => {
  const option = TYPES_MEDIA_OPTIONS.find(opt => opt.value === type);
  return option?.icon || 'document';
};

export const isImageType = (type: TypeMedia): boolean => {
  return type === 'image';
};

export const isVideoType = (type: TypeMedia): boolean => {
  return type === 'video';
};

export const canUserModerateCommentaire = (user: User): boolean => {
  return user.Roles?.some(role => 
    ['Administrateur', 'Modérateur'].includes(role.nom_role)
  ) || false;
};

export const calculateNoteAverage = (critiques: CritiqueEvaluation[]): number => {
  if (critiques.length === 0) return 0;
  const total = critiques.reduce((sum, critique) => sum + critique.note, 0);
  return total / critiques.length;
};

export const formatDureeMedia = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};
