// types/place-helpers.ts - Types et fonctions utilitaires pour Lieu

import type { 
  Lieu, 
  DetailLieu, 
  Monument, 
  Vestige, 
  Service, 
  LieuMedia,
  TypePatrimoine
} from './place';
import type { Coordinates } from './geography';

// =============================================================================
// TYPE HELPERS - Pour un accès simplifié
// =============================================================================

/**
 * Type représentant un Lieu avec ses détails complets
 * Garantit que DetailLieu est présent
 */
export type LieuAvecDetails = Lieu & {
  DetailLieu: DetailLieu;
};

/**
 * Type représentant un Lieu avec médias
 * Garantit qu'au moins un média est présent
 */
export type LieuAvecMedias = Lieu & {
  LieuMedias: LieuMedia[];
};

/**
 * Vue simplifiée d'un lieu pour les listes
 */
export interface LieuResume {
  id: number;
  nom: string;
  type: TypePatrimoine;
  adresseComplete: string;
  description?: string;
  imagePrincipale?: string;
  noteMoyenne?: number;
  distance?: number;
  services: string[];
}

// =============================================================================
// FUNCTIONS UTILITAIRES
// =============================================================================

/**
 * Vérifie si un lieu a des détails complets
 */
export function hasDetailLieu(lieu: Lieu): lieu is LieuAvecDetails {
  return lieu.DetailLieu !== undefined && lieu.DetailLieu !== null;
}

/**
 * Vérifie si un lieu a des médias
 */
export function hasMedias(lieu: Lieu): lieu is LieuAvecMedias {
  return Array.isArray(lieu.LieuMedias) && lieu.LieuMedias.length > 0;
}

/**
 * Obtient la description d'un lieu de manière sécurisée
 */
export function getDescription(lieu: Lieu): string {
  return lieu.DetailLieu?.description || 'Aucune description disponible';
}

/**
 * Obtient l'histoire d'un lieu
 */
export function getHistoire(lieu: Lieu): string {
  return lieu.DetailLieu?.histoire || 'Histoire non documentée';
}

/**
 * Obtient les horaires d'un lieu
 */
export function getHoraires(lieu: Lieu): string {
  return lieu.DetailLieu?.horaires || 'Horaires non spécifiés';
}

/**
 * Obtient le tarif d'entrée
 */
export function getTarifEntree(lieu: Lieu): number | null {
  return lieu.DetailLieu?.tarif_entree ?? null;
}

/**
 * Obtient la note moyenne
 */
export function getNoteMoyenne(lieu: Lieu): number | null {
  return lieu.DetailLieu?.noteMoyenne ?? null;
}

/**
 * Obtient tous les monuments d'un lieu
 */
export function getMonuments(lieu: Lieu): Monument[] {
  return lieu.DetailLieu?.Monuments || [];
}

/**
 * Obtient tous les vestiges d'un lieu
 */
export function getVestiges(lieu: Lieu): Vestige[] {
  return lieu.DetailLieu?.Vestiges || [];
}

/**
 * Obtient l'image principale d'un lieu
 */
export function getImagePrincipale(lieu: Lieu): string | null {
  const firstImage = lieu.LieuMedias?.find(media => media.type === 'image');
  return firstImage?.url || null;
}

/**
 * Obtient toutes les images d'un lieu
 */
export function getImages(lieu: Lieu): LieuMedia[] {
  return lieu.LieuMedias?.filter(media => media.type === 'image') || [];
}

/**
 * Formate l'adresse complète d'un lieu
 */
export function formatAdresseComplete(lieu: Lieu): string {
  const parties = [
    lieu.adresse,
    lieu.Localite?.nom,
    lieu.Commune?.nom,
    lieu.Daira?.nom,
    lieu.Wilaya?.nom
  ].filter(Boolean);
  
  return parties.join(', ');
}

/**
 * Détermine le type de patrimoine
 */
export function getTypePatrimoine(lieu: Lieu): TypePatrimoine {
  if (lieu.DetailLieu?.Monuments?.length) return 'monument';
  if (lieu.DetailLieu?.Vestiges?.length) return 'vestige';
  return 'site_culturel';
}

/**
 * Obtient la liste des noms de services
 */
export function getServicesNames(lieu: Lieu): string[] {
  return lieu.Services?.map(service => service.nom) || [];
}

/**
 * Vérifie si un service spécifique existe
 */
export function hasService(lieu: Lieu, serviceName: string): boolean {
  return lieu.Services?.some(service => service.nom === serviceName) || false;
}

/**
 * Calcule la distance entre deux points (en km)
 */
export function calculateDistance(point1: Coordinates, point2: Coordinates): number {
  const R = 6371; // Rayon de la Terre en km
  const dLat = (point2.latitude - point1.latitude) * Math.PI / 180;
  const dLon = (point2.longitude - point1.longitude) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(point1.latitude * Math.PI / 180) * 
    Math.cos(point2.latitude * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return Math.round(R * c * 10) / 10; // Arrondi à 0.1 km
}

/**
 * Convertit un Lieu complet en LieuResume pour les listes
 */
export function toLieuResume(lieu: Lieu): LieuResume {
  return {
    id: lieu.id_lieu,
    nom: lieu.nom,
    type: getTypePatrimoine(lieu),
    adresseComplete: formatAdresseComplete(lieu),
    description: getDescription(lieu).slice(0, 150) + '...',
    imagePrincipale: getImagePrincipale(lieu) || undefined,
    noteMoyenne: getNoteMoyenne(lieu) || undefined,
    distance: lieu.distance,
    services: getServicesNames(lieu)
  };
}

// =============================================================================
// CLASSES HELPER (OPTIONNEL)
// =============================================================================

/**
 * Classe wrapper pour faciliter l'accès aux propriétés d'un lieu
 */
export class LieuHelper {
  constructor(private lieu: Lieu) {}

  get nom(): string {
    return this.lieu.nom;
  }

  get description(): string {
    return getDescription(this.lieu);
  }

  get histoire(): string {
    return getHistoire(this.lieu);
  }

  get horaires(): string {
    return getHoraires(this.lieu);
  }

  get tarif(): number | null {
    return getTarifEntree(this.lieu);
  }

  get note(): number | null {
    return getNoteMoyenne(this.lieu);
  }

  get imagePrincipale(): string | null {
    return getImagePrincipale(this.lieu);
  }

  get adresseComplete(): string {
    return formatAdresseComplete(this.lieu);
  }

  get typePatrimoine(): TypePatrimoine {
    return getTypePatrimoine(this.lieu);
  }

  get monuments(): Monument[] {
    return getMonuments(this.lieu);
  }

  get vestiges(): Vestige[] {
    return getVestiges(this.lieu);
  }

  get services(): string[] {
    return getServicesNames(this.lieu);
  }

  hasService(serviceName: string): boolean {
    return hasService(this.lieu, serviceName);
  }

  toResume(): LieuResume {
    return toLieuResume(this.lieu);
  }
}

// =============================================================================
// HOOKS CUSTOM (OPTIONNEL)
// =============================================================================

/**
 * Hook pour utiliser un lieu avec helper
 */
export function useLieuHelper(lieu: Lieu | null): LieuHelper | null {
  return lieu ? new LieuHelper(lieu) : null;
}

// =============================================================================
// EXEMPLES D'UTILISATION
// =============================================================================

/*
// Utilisation simple avec fonctions
const description = getDescription(lieu);
const hasParking = hasService(lieu, 'Parking');

// Utilisation avec helper
const helper = new LieuHelper(lieu);
console.log(helper.description);
console.log(helper.adresseComplete);

// Utilisation dans un composant
const LieuComponent = ({ lieu }: { lieu: Lieu }) => {
  const helper = useLieuHelper(lieu);
  
  if (!helper) return null;
  
  return (
    <div>
      <h1>{helper.nom}</h1>
      <p>{helper.description}</p>
      <span>{helper.adresseComplete}</span>
      {helper.tarif && <p>Tarif: {helper.tarif} DA</p>}
    </div>
  );
};
*/