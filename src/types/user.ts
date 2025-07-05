// types/user.ts - Corrigé selon la documentation PDF

import type { Wilaya } from './geography';
import type { Oeuvre } from './oeuvre';
import type { Evenement } from './event';

// =============================================================================
// ÉNUMÉRATIONS UTILISATEUR - MISES À JOUR SELON DOC
// =============================================================================

export type TypeUtilisateur = 
  | 'visiteur'
  | 'ecrivain'           // Ajouté selon doc
  | 'artisan'            // Ajouté selon doc
  | 'acteur'             // Ajouté selon doc
  | 'journaliste'        // Déjà présent
  | 'scientifique'       // Remplace 'chercheur'
  | 'artiste'            // Déjà présent
  | 'realisateur'        // Ajouté selon doc
  | 'musicien'           // Ajouté selon doc
  | 'photographe'        // Ajouté selon doc
  | 'danseur'            // Ajouté selon doc
  | 'sculpteur';         // Ajouté selon doc

export type StatutCompte = 
  | 'actif'
  | 'suspendu'
  | 'en_attente_validation'
  | 'desactive';           // Ajouté selon doc

// Selon le document PDF, il y a 3 rôles principaux
export type NomRole = 
  | 'Visiteur'
  | 'Professionnel'
  | 'Admin';

// =============================================================================
// INTERFACES PRINCIPALES - MISES À JOUR
// =============================================================================

export interface User {
  id_user: number;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  date_naissance?: string;
  sexe?: 'M' | 'F';
  wilaya_residence?: number;
  adresse?: string;
  photo_url?: string;
  type_user: TypeUtilisateur;
  statut_compte: StatutCompte;
  
  // Champs spécifiques selon la doc PDF
  professionnel_valide: boolean;
  date_validation_professionnel?: string;
  validateur_professionnel_id?: number;
  documents_justificatifs?: Record<string, any>;
  
  langues_parlees?: string[];
  bio?: string;
  site_web?: string;
  reseaux_sociaux?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
  specialites?: string[];
  certifications?: string[];
  date_creation: string;
  date_derniere_connexion?: string;
  
  // Relations
  Wilaya?: Wilaya;
  Roles?: Role[];
  UserRoles?: UserRole[]; 
  Oeuvres?: Oeuvre[];
  Evenements?: Evenement[];
  Organisations?: UserOrganisation[];
  
  // Métadonnées calculées
  nombre_oeuvres?: number;
  nombre_evenements?: number;
  note_moyenne?: number;
  popularite_score?: number;
}

// Role simplifié selon la documentation
export interface Role {
  id_role: number;
  nom_role: NomRole;
  description?: string;
  permissions: string[];  // Array de strings comme "oeuvres:create"
  niveau_priorite: number;
  actif: boolean;
  date_creation: string;
  date_modification: string;
}

export interface UserRole {
  id: number;
  id_user: number;
  id_role: number;
  date_attribution: string;
  attribue_par?: number;
  actif: boolean;
  User?: User;
  Role?: Role;
}

// Nouvelle table selon la documentation
export interface UserOrganisation {
  id: number;
  id_user: number;
  id_organisation: number;
  role_dans_organisation: 'membre' | 'responsable' | 'directeur' | 'collaborateur';
  date_debut: string;
  date_fin?: string;
  actif: boolean;
  responsabilites?: string[];
  createdAt: string;
  updatedAt: string;
}

// =============================================================================
// TYPES D'AUTHENTIFICATION
// =============================================================================

export interface LoginCredentials {
  email: string;
  password: string;
  remember_me?: boolean;
}

export interface RegisterData {
  nom: string;
  prenom: string;
  email: string;
  password: string;
  confirm_password: string;
  telephone?: string;
  date_naissance?: string;
  sexe?: 'M' | 'F';
  wilaya_residence?: number;
  type_user: TypeUtilisateur;
  photo_profil?: File; 
  bio?: string;
  specialites?: string[];
  accepte_conditions: boolean;
  accepte_newsletter?: boolean;
}

export interface AuthResponse {
  user: User;
  token: string;
  expires_at: string;
  permissions: string[];
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface ChangePasswordData {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export interface UpdateProfileData {
  nom?: string;
  prenom?: string;
  telephone?: string;
  wilaya_residence?: number;
  adresse?: string;
  photo_url?:string
  photo_profil?: File;
  bio?: string;
  site_web?: string;
  reseaux_sociaux?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
  specialites?: string[];
  langues_parlees?: string[];
}

// =============================================================================
// TYPES DE FILTRES ET RECHERCHE
// =============================================================================

export interface UserFilters {
  type_user?: TypeUtilisateur;
  statut_compte?: StatutCompte;
  role?: NomRole;
  wilaya?: number;
  professionnel_valide?: boolean;
  specialite?: string;
  date_creation_debut?: string;
  date_creation_fin?: string;
  actif_recemment?: boolean;
  search?: string;
}

export interface SearchUsersParams extends UserFilters {
  q?: string;
  sort?: 'nom' | 'date_creation' | 'derniere_connexion' | 'popularite';
  order?: 'ASC' | 'DESC';
  limit?: number;
  page?: number;
  with_stats?: boolean;
}

// =============================================================================
// TYPES DE VALIDATION PROFESSIONNELLE
// =============================================================================

export interface DemandeValidationPro {
  id_demande: number;
  id_user: number;
  type_demande: 'validation_initiale' | 'revalidation' | 'changement_type';
  nouveau_type_user?: TypeUtilisateur;
  documents_fournis: {
    cv?: string;
    portfolio?: string;
    diplomes?: string[];
    attestations?: string[];
    references?: string[];
  };
  justification: string;
  statut: 'en_attente' | 'en_cours' | 'approuvee' | 'rejetee';
  commentaires_admin?: string;
  date_soumission: string;
  date_traitement?: string;
  traite_par?: number;
  User?: User;
  Admin?: User;
}

// =============================================================================
// TYPES DE STATISTIQUES UTILISATEUR
// =============================================================================

export interface UserStats {
  id_user: number;
  nombre_oeuvres_creees: number;
  nombre_oeuvres_validees: number;
  nombre_evenements_organises: number;
  nombre_participations_evenements: number;
  nombre_commentaires: number;
  note_moyenne_recue: number;
  nombre_likes_recus: number;
  nombre_vues_profil: number;
  score_reputation: number;
  date_derniere_activite: string;
  streak_connexions: number;
  badges_obtenus: string[];
}

// =============================================================================
// TYPES DE PRÉFÉRENCES UTILISATEUR
// =============================================================================

export interface UserPreferences {
  id_preference: number;
  id_user: number;
  langue_interface: string;
  notifications_email: boolean;
  notifications_push: boolean;
  newsletter: boolean;
  visibilite_profil: 'public' | 'amis' | 'prive';
  affichage_contact: boolean;
  theme: 'clair' | 'sombre' | 'auto';
  timezone: string;
  format_date: string;
  items_par_page: number;
  tri_par_defaut: string;
  filtres_favoris: Record<string, any>;
  date_modification: string;
}

// =============================================================================
// TYPES DE NOTIFICATIONS
// =============================================================================

export interface Notification {
  id_notification: number;
  id_user: number;
  type: 'info' | 'success' | 'warning' | 'error';
  titre: string;
  message: string;
  lue: boolean;
  action_url?: string;
  action_libelle?: string;
  metadata?: Record<string, any>;
  date_creation: string;
  date_lecture?: string;
  User?: User;
}

// =============================================================================
// CONSTANTES MISES À JOUR SELON LA DOCUMENTATION
// =============================================================================

export const TYPES_UTILISATEUR_OPTIONS = [
  { value: 'visiteur', label: 'Visiteur', description: 'Consultation uniquement' },
  { value: 'ecrivain', label: 'Écrivain', description: 'Auteur de livres et textes' },
  { value: 'artisan', label: 'Artisan', description: 'Créateur d\'objets artisanaux' },
  { value: 'acteur', label: 'Acteur', description: 'Artiste de théâtre et cinéma' },
  { value: 'journaliste', label: 'Journaliste', description: 'Professionnel des médias' },
  { value: 'scientifique', label: 'Scientifique', description: 'Chercheur et académique' },
  { value: 'artiste', label: 'Artiste', description: 'Créateur d\'œuvres artistiques' },
  { value: 'realisateur', label: 'Réalisateur', description: 'Cinéaste et créateur audiovisuel' },
  { value: 'musicien', label: 'Musicien', description: 'Compositeur et interprète musical' },
  { value: 'photographe', label: 'Photographe', description: 'Artiste photographe' },
  { value: 'danseur', label: 'Danseur', description: 'Artiste de la danse' },
  { value: 'sculpteur', label: 'Sculpteur', description: 'Artiste sculpteur' },
] as const;

export const STATUTS_COMPTE_OPTIONS = [
  { value: 'actif', label: 'Actif', color: 'green' },
  { value: 'en_attente_validation', label: 'En attente', color: 'orange' },
  { value: 'suspendu', label: 'Suspendu', color: 'red' },
  { value: 'desactive', label: 'Désactivé', color: 'gray' },
] as const;

// Rôles selon la documentation PDF
export const ROLES_SYSTEME = [
  'Visiteur',
  'Professionnel', 
  'Admin',
] as const;

// =============================================================================
// PERMISSIONS SELON LA DOCUMENTATION
// =============================================================================
// ✅ AJOUT : Interface pour les données d'upload
export interface PhotoUploadResponse {
  success: boolean;
  data: {
    filename: string;
    originalName: string;
    url: string;
    size: number;
  };
  message?: string;
  error?: string;
}
export const PERMISSIONS = {
  // Consultation (tous)
  'oeuvres:read': 'Consulter les œuvres',
  'evenements:read': 'Consulter les événements',
  
  // Interaction (connectés)
  'commentaires:create': 'Créer des commentaires',
  'commentaires:update_own': 'Modifier ses commentaires',
  'commentaires:delete_own': 'Supprimer ses commentaires',
  'evenements:inscription': 'S\'inscrire aux événements',
  
  // Création (professionnels validés)
  'oeuvres:create': 'Créer des œuvres',
  'oeuvres:update_own': 'Modifier ses œuvres',
  'oeuvres:delete_own': 'Supprimer ses œuvres',
  'evenements:create': 'Créer des événements (avec organisation)',
  'evenements:update_own': 'Modifier ses événements',
  'evenements:delete_own': 'Supprimer ses événements',
  
  // Administration (admin)
  'users:read': 'Lister les utilisateurs',
  'users:validate_professional': 'Valider les professionnels',
  'users:moderate': 'Gérer les utilisateurs',
  'oeuvres:validate': 'Valider les œuvres',
  'oeuvres:moderate': 'Modérer les œuvres',
  'commentaires:moderate': 'Modérer les commentaires',
  'evenements:moderate': 'Modérer les événements',
  'admin:access': 'Accès administration',
  'admin:analytics': 'Accès aux statistiques',
  'admin:system': 'Gestion système',
} as const;

// =============================================================================
// MAPPING AUTOMATIQUE RÔLE SELON TYPE
// =============================================================================

export const getRoleByUserType = (type_user: TypeUtilisateur): NomRole => {
  if (type_user === 'visiteur') {
    return 'Visiteur';
  }
  // Tous les autres types sont des professionnels
  return 'Professionnel';
};

// =============================================================================
// UTILITAIRES SPÉCIFIQUES AU SYSTÈME DOCUMENTÉ
// =============================================================================

export const isUserProfessional = (user: User): boolean => {
  return user.type_user !== 'visiteur';
};

export const isProfessionalValidated = (user: User): boolean => {
  return isUserProfessional(user) && user.professionnel_valide === true;
};

export const canUserCreateContent = (user: User): boolean => {
  return isProfessionalValidated(user);
};

export const canUserCreateEvents = (user: User): boolean => {
  return isProfessionalValidated(user) && 
         user.Organisations !== undefined && 
         user.Organisations.length > 0;
};

export const isAdmin = (user: User): boolean => {
  return user.Roles?.some((role: Role) => role.nom_role === 'Admin') || false;
};

export const hasPermission = (user: User, permission: string): boolean => {
  if (!user.Roles) return false;
  
  return user.Roles.some((role: Role) => 
    role.permissions.includes(permission)
  );
};

export const getUserRole = (user: User): NomRole | null => {
  return user.Roles?.[0]?.nom_role || null;
};

export const formatUserName = (user: User): string => {
  return `${user.prenom} ${user.nom}`;
};

export const getUserInitials = (user: User): string => {
  return `${user.prenom.charAt(0)}${user.nom.charAt(0)}`.toUpperCase();
};

// Fonction utilitaire pour l'âge
export const getUserAge = (user: User): number | null => {
  if (!user.date_naissance) return null;
  
  const today = new Date();
  const birthDate = new Date(user.date_naissance);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

// Fonction pour vérifier les permissions avec types explicites
export const checkUserPermission = (user: User, resource: string, action: string): boolean => {
  if (!user.Roles) return false;
  
  const requiredPermission = `${resource}:${action}`;
  return user.Roles.some((role: Role) => 
    role.permissions.includes(requiredPermission)
  );
};

// Fonction pour obtenir le label du type d'utilisateur
export const getUserTypeLabel = (type: TypeUtilisateur): string => {
  const option = TYPES_UTILISATEUR_OPTIONS.find((opt) => opt.value === type);
  return option?.label || 'Type inconnu';
};

// Fonction pour obtenir la couleur du statut
export const getStatutCompteColor = (statut: StatutCompte): string => {
  const option = STATUTS_COMPTE_OPTIONS.find((opt) => opt.value === statut);
  return option?.color || 'gray';
};
