import React, { useState, useEffect } from 'react';
import { HiMagnifyingGlass as Search } from 'react-icons/hi2';
import {
  HiSquares2X2,                  // Grid
  HiBars3,                       // List
  HiMapPin,                      // MapPin
  HiCalendar,                    // Calendar
  HiStar,                        // Star
  HiEye,                         // Eye
  HiHeart,                       // Heart
  HiChevronDown,                 // ChevronDown
  HiAdjustmentsHorizontal,       // SlidersHorizontal
  HiArrowsUpDown,                // ArrowUpDown
  HiBookOpen,                    // Book
  HiFilm,                        // Film
  HiMusicalNote,                 // Music
  HiCamera,                      // Camera
  HiTrophy,                      // Award
  HiUsers,                       // Users
  HiClock,                       // Clock
  HiBookmark,                    // Bookmark
  HiShare,                       // Share2
  HiArrowTopRightOnSquare,       // ExternalLink
  HiPlus,                        // Plus
  HiMap,                         // Map
  HiXMark,                       // X
  HiUser,                        // User
  HiChevronLeft,                 // ChevronLeft
  HiChevronRight,                // ChevronRight
  HiGlobeAlt as Globe,           // Globe
  HiArrowRightOnRectangle,       // ArrowRightOnRectangle
  HiCog6Tooth as Settings        // Settings
} from 'react-icons/hi2';

// Import des hooks
import { useAuth } from '../hooks/useAuth';
import { useOeuvresList, useEvenementsList, usePatrimoineList } from '../hooks/combined';
import { useMetadata } from '../hooks/useMetadata';
import { Loading } from '../components/UI';

// =============================================================================
// TYPES CORRIGÉS POUR LES FILTRES
// =============================================================================

interface FilterState {
  search: string;
  type?: string;
  langue?: string;
  annee_min?: number;
  annee_max?: number;
  categorie?: string;
  categories: string[];
  sort: string;
  order: 'ASC' | 'DESC';
  wilaya?: string;
  date_debut?: string;
  date_fin?: string;
  prix_max?: number;
  statut?: string;
  tab?: string;
}

// =============================================================================
// COMPOSANTS DE CARDS ADAPTÉS AU NOUVEAU DESIGN
// =============================================================================

const OeuvreCardHorizontal = ({ oeuvre, onClick }: any) => {
  const imageUrl = oeuvre.Medias?.[0]?.url || oeuvre.images?.[0] || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800';
  const auteurs = oeuvre.Users?.map((u: any) => `${u.prenom} ${u.nom}`).join(', ') || 'Auteur inconnu';

  return (
    <div className="p-4 @container">
      <div className="flex flex-col items-stretch justify-start rounded-xl @xl:flex-row @xl:items-start">
        <div
          className="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-xl cursor-pointer"
          style={{ backgroundImage: `url("${imageUrl}")` }}
          onClick={onClick}
        />
        <div className="flex w-full min-w-72 grow flex-col items-stretch justify-center gap-1 py-4 @xl:px-4">
          <h3 
            className="text-[#181511] text-lg font-bold leading-tight tracking-[-0.015em] cursor-pointer hover:opacity-80"
            onClick={onClick}
          >
            {oeuvre.titre}
          </h3>
          <p className="text-[#897b61] text-sm mb-2">{auteurs}</p>
          <div className="flex items-end gap-3 justify-between">
            <p className="text-[#897b61] text-base font-normal leading-normal line-clamp-2">
              {oeuvre.description || 'Aucune description disponible'}
            </p>
            <button
              onClick={onClick}
              className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-8 px-4 bg-[#eb9f13] text-[#181511] text-sm font-medium leading-normal hover:opacity-90 transition-opacity"
            >
              <span className="truncate">Découvrir</span>
            </button>
          </div>
          <div className="flex items-center gap-4 mt-2 text-xs text-[#897b61]">
            {oeuvre.note_moyenne && (
              <div className="flex items-center gap-1">
                <HiStar className="text-[#eb9f13]" size={14} />
                <span>{oeuvre.note_moyenne}/5</span>
              </div>
            )}
            {oeuvre.nombre_vues && (
              <div className="flex items-center gap-1">
                <HiEye size={14} />
                <span>{oeuvre.nombre_vues} vues</span>
              </div>
            )}
            {oeuvre.TypeOeuvre && (
              <span className="px-2 py-0.5 bg-[#f4f3f0] rounded-full">
                {oeuvre.TypeOeuvre.nom_type}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const EvenementCardHorizontal = ({ evenement, onClick }: any) => {
  const imageUrl = evenement.image_url || 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=800';
  const lieu = evenement.Lieu ? `${evenement.Lieu.nom}, ${evenement.Lieu.Wilaya?.nom}` : 'Lieu à définir';
  
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    });
  };

  return (
    <div className="p-4 @container">
      <div className="flex flex-col items-stretch justify-start rounded-xl @xl:flex-row @xl:items-start">
        <div
          className="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-xl cursor-pointer"
          style={{ backgroundImage: `url("${imageUrl}")` }}
          onClick={onClick}
        />
        <div className="flex w-full min-w-72 grow flex-col items-stretch justify-center gap-1 py-4 @xl:px-4">
          <h3 
            className="text-[#181511] text-lg font-bold leading-tight tracking-[-0.015em] cursor-pointer hover:opacity-80"
            onClick={onClick}
          >
            {evenement.nom_evenement}
          </h3>
          <div className="flex items-center gap-2 text-sm text-[#897b61] mb-2">
            <HiCalendar size={14} />
            <span>{formatDate(evenement.date_debut)}</span>
            <span>•</span>
            <HiMapPin size={14} />
            <span>{lieu}</span>
          </div>
          <div className="flex items-end gap-3 justify-between">
            <p className="text-[#897b61] text-base font-normal leading-normal line-clamp-2">
              {evenement.description || 'Aucune description disponible'}
            </p>
            <button
              onClick={onClick}
              className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-8 px-4 bg-[#eb9f13] text-[#181511] text-sm font-medium leading-normal hover:opacity-90 transition-opacity"
            >
              <span className="truncate">En savoir plus</span>
            </button>
          </div>
          <div className="flex items-center gap-4 mt-2 text-xs text-[#897b61]">
            {evenement.tarif === 0 ? (
              <span className="text-green-600 font-medium">Gratuit</span>
            ) : evenement.tarif ? (
              <span>{evenement.tarif} DA</span>
            ) : null}
            {evenement.nombre_participants !== undefined && (
              <div className="flex items-center gap-1">
                <HiUsers size={14} />
                <span>{evenement.nombre_participants} participants</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const LieuCardHorizontal = ({ lieu, onClick }: any) => {
  const imageUrl = lieu.LieuMedias?.[0]?.url || lieu.imagePrincipale || 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800';
  
  return (
    <div className="p-4 @container">
      <div className="flex flex-col items-stretch justify-start rounded-xl @xl:flex-row @xl:items-start">
        <div
          className="w-full bg-center bg-no-repeat aspect-video bg-cover rounded-xl cursor-pointer"
          style={{ backgroundImage: `url("${imageUrl}")` }}
          onClick={onClick}
        />
        <div className="flex w-full min-w-72 grow flex-col items-stretch justify-center gap-1 py-4 @xl:px-4">
          <h3 
            className="text-[#181511] text-lg font-bold leading-tight tracking-[-0.015em] cursor-pointer hover:opacity-80"
            onClick={onClick}
          >
            {lieu.nom}
          </h3>
          <div className="flex items-center gap-2 text-sm text-[#897b61] mb-2">
            <HiMapPin size={14} />
            <span>{lieu.Wilaya?.nom}</span>
            {lieu.DetailLieu?.periode_historique && (
              <>
                <span>•</span>
                <span>{lieu.DetailLieu.periode_historique}</span>
              </>
            )}
          </div>
          <div className="flex items-end gap-3 justify-between">
            <p className="text-[#897b61] text-base font-normal leading-normal line-clamp-2">
              {lieu.DetailLieu?.description || 'Aucune description disponible'}
            </p>
            <button
              onClick={onClick}
              className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-8 px-4 bg-[#eb9f13] text-[#181511] text-sm font-medium leading-normal hover:opacity-90 transition-opacity"
            >
              <span className="truncate">Visiter</span>
            </button>
          </div>
          <div className="flex items-center gap-4 mt-2 text-xs text-[#897b61]">
            {lieu.DetailLieu?.noteMoyenne && (
              <div className="flex items-center gap-1">
                <HiStar className="text-[#eb9f13]" size={14} />
                <span>{lieu.DetailLieu.noteMoyenne}/5</span>
              </div>
            )}
            {lieu.typePatrimoine && (
              <span className="px-2 py-0.5 bg-[#f4f3f0] rounded-full capitalize">
                {lieu.typePatrimoine}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// COMPOSANT PAGE LISTING GÉNÉRIQUE AVEC NOUVEAU DESIGN - CORRIGÉ
// =============================================================================

interface ListingPageProps {
  type: 'oeuvres' | 'evenements' | 'lieux';
  title: string;
  description: string;
  showCreateButton?: boolean;
}

const ListingPage: React.FC<ListingPageProps> = ({ 
  type, 
  title, 
  description, 
  showCreateButton = true 
}) => {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    categories: [],
    sort: 'date_creation',
    order: 'DESC',
    tab: 'all'
  });

  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  
  // Styles personnalisés unifiés avec HomePage
  const customStyles = {
    bgPrimary: 'bg-white',
    textPrimary: 'text-[#181511]',
    textSecondary: 'text-[#897b61]',
    bgSecondary: 'bg-[#f4f3f0]',
    bgAccent: 'bg-[#eb9f13]',
    borderColor: 'border-[#f4f3f0]',
    hoverAccent: 'hover:text-[#eb9f13]',
    textAccent: 'text-[#eb9f13]',
    hoverBg: 'hover:bg-[#e6e2db]'
  };

  // ✅ AJOUT : Fonction pour vérifier si l'utilisateur est admin
  const isUserAdmin = (): boolean => {
    if (!user?.Roles) return false;
    return user.Roles.some(role => role.nom_role === 'Admin');
  };

  // Gestionnaire de déconnexion
  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = '/';
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  // Fermer le menu utilisateur quand on clique ailleurs
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.user-menu-container')) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Navigation items avec état actif
  const getNavItems = () => [
    { href: '/', label: 'Accueil', key: 'accueil', active: false },
    { href: '/evenements', label: 'Événements', key: 'evenements', active: type === 'evenements' },
    { href: '/patrimoine', label: 'Patrimoine', key: 'patrimoine', active: type === 'lieux' },
    { href: '/oeuvres', label: 'Œuvres', key: 'oeuvres', active: type === 'oeuvres' },
    { href: '/a-propos', label: 'À Propos', key: 'a-propos', active: false },
  ];

  const navItems = getNavItems();
  
  // ✅ CORRIGÉ : Accès correct aux métadonnées
  const { 
    langues, 
    categories, 
    wilayas, 
    isLoading: metadataLoading 
  } = useMetadata();

  // ✅ CORRIGÉ : Hooks pour récupérer les données avec filtres compatibles
  const {
    oeuvres,
    pagination: oeuvresPagination,
    isLoading: oeuvresLoading,
    error: oeuvresError,
    page: oeuvresPage,
    goToPage: goToOeuvresPage,
  } = useOeuvresList(
    type === 'oeuvres' ? {
      ...(filters.search && { search: filters.search }),
      ...(filters.langue && { id_langue: parseInt(filters.langue) }),
      ...(filters.categorie && { id_categorie: parseInt(filters.categorie) }),
      ...(filters.tab && filters.tab !== 'all' && { id_type_oeuvre: parseInt(filters.tab) })
    } : {},
    { limit: 10 }
  );

  const {
    evenements,
    pagination: evenementsPagination,
    isLoading: evenementsLoading,
    error: evenementsError,
    page: evenementsPage,
    goToPage: goToEvenementsPage,
  } = useEvenementsList(
    type === 'evenements' ? {
      ...(filters.search && { search: filters.search }),
      ...(filters.wilaya && { id_wilaya: parseInt(filters.wilaya) }),
      ...(filters.tab && filters.tab !== 'all' && { id_type_evenement: parseInt(filters.tab) })
    } : {},
    { limit: 10 }
  );

  const {
    sites,
    pagination: sitesPagination,
    isLoading: sitesLoading,
    error: sitesError,
    page: sitesPage,
    goToPage: goToSitesPage,
  } = usePatrimoineList(
    type === 'lieux' ? {
      ...(filters.search && { search: filters.search }),
      ...(filters.wilaya && { id_wilaya: parseInt(filters.wilaya) }),
      ...(filters.tab && filters.tab !== 'all' && { 
        type_patrimoine: filters.tab as 'monument' | 'vestige' | 'site_culturel' 
      })
    } : {},
    { limit: 10 }
  );

  // Déterminer les données et états selon le type
  const getData = () => {
    switch (type) {
      case 'oeuvres':
        return {
          items: oeuvres || [],
          isLoading: oeuvresLoading,
          error: oeuvresError,
          pagination: oeuvresPagination,
          page: oeuvresPage,
          goToPage: goToOeuvresPage
        };
      case 'evenements':
        return {
          items: evenements || [],
          isLoading: evenementsLoading,
          error: evenementsError,
          pagination: evenementsPagination,
          page: evenementsPage,
          goToPage: goToEvenementsPage
        };
      case 'lieux':
        return {
          items: sites || [],
          isLoading: sitesLoading,
          error: sitesError,
          pagination: sitesPagination,
          page: sitesPage,
          goToPage: goToSitesPage
        };
      default:
        return {
          items: [],
          isLoading: false,
          error: null,
          pagination: { page: 1, limit: 10, total: 0, pages: 1 }, // ✅ CORRIGÉ: "pages" au lieu de "totalPages"
          page: 1,
          goToPage: () => {}
        };
    }
  };

  const { items, isLoading, error, pagination, page, goToPage } = getData();

  // Filtrer n'est plus nécessaire car on utilise les filtres dans les hooks
  const filteredItems = items;

  // ✅ CORRIGÉ : Tabs dynamiques selon le type - version simplifiée d'abord
  const getTabs = () => {
    if (type === 'oeuvres') {
      return [
        { id: 'all', label: 'Tous' },
        { id: '1', label: 'Livres' },
        { id: '2', label: 'Films' },
        { id: '3', label: 'Musique' },
        { id: '4', label: 'Art plastique' },
        { id: '5', label: 'Articles' },
        { id: '6', label: 'Artisanat' },
      ];
    } else if (type === 'evenements') {
      return [
        { id: 'all', label: 'Tous' },
        { id: '1', label: 'Spectacles' },
        { id: '2', label: 'Expositions' },
        { id: '3', label: 'Conférences' },
        { id: '4', label: 'Ateliers' },
        { id: '5', label: 'Festivals' },
      ];
    } else if (type === 'lieux') {
      return [
        { id: 'all', label: 'Tous' },
        { id: 'monument', label: 'Monuments' },
        { id: 'vestige', label: 'Vestiges' },
        { id: 'site_culturel', label: 'Sites culturels' }
      ];
    }
    return [{ id: 'all', label: 'Tous' }];
  };

  const tabs = getTabs();

  const renderCard = (item: any) => {
    const onClick = () => {
      const baseUrl = type === 'oeuvres' ? '/oeuvres' : 
                     type === 'evenements' ? '/evenements' : '/patrimoine';
      const id = type === 'oeuvres' ? item.id_oeuvre : 
                type === 'evenements' ? item.id_evenement : item.id_lieu;
      window.location.href = `${baseUrl}/${id}`;
    };

    if (type === 'oeuvres') {
      return <OeuvreCardHorizontal key={item.id_oeuvre} oeuvre={item} onClick={onClick} />;
    } else if (type === 'evenements') {
      return <EvenementCardHorizontal key={item.id_evenement} evenement={item} onClick={onClick} />;
    } else {
      return <LieuCardHorizontal key={item.id_lieu} lieu={item} onClick={onClick} />;
    }
  };

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-white group/design-root overflow-x-hidden" style={{ fontFamily: '"Plus Jakarta Sans", "Noto Sans", sans-serif' }}>
      <div className="layout-container flex h-full grow flex-col">
        
        {/* ✅ HEADER UNIFIÉ CORRIGÉ */}
        <header className={`flex items-center justify-between whitespace-nowrap border-b border-solid ${customStyles.borderColor} px-10 py-3`}>
          {/* Logo et titre */}
          <div className={`flex items-center gap-4 ${customStyles.textPrimary}`}>
            <div className="size-4">
              <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M4 42.4379C4 42.4379 14.0962 36.0744 24 41.1692C35.0664 46.8624 44 42.2078 44 42.2078L44 7.01134C44 7.01134 35.068 11.6577 24.0031 5.96913C14.0971 0.876274 4 7.27094 4 7.27094L4 42.4379Z"
                  fill="currentColor"
                />
              </svg>
            </div>
            <h2 className={`${customStyles.textPrimary} text-lg font-bold leading-tight tracking-[-0.015em]`}>
              Timlilit Culture – L'écho d'Algérie
            </h2>
          </div>
          
          {/* Navigation centrale */}
          <div className="flex flex-1 justify-end gap-8">
            <div className="flex items-center gap-9">
              {navItems.map(item => (
                <a 
                  key={item.key}
                  className={`text-sm font-medium leading-normal transition-colors ${
                    item.active 
                      ? customStyles.textAccent 
                      : `${customStyles.textPrimary} ${customStyles.hoverAccent}`
                  }`} 
                  href={item.href}
                >
                  {item.label}
                </a>
              ))}
            </div>
            
            {/* Actions et boutons */}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  const input = document.querySelector('input[type="search"]') as HTMLInputElement;
                  if (input) {
                    input.focus();
                  } else {
                    window.location.href = '/recherche';
                  }
                }}
                className={`flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 ${customStyles.bgSecondary} ${customStyles.textPrimary} gap-2 text-sm font-bold leading-normal tracking-[0.015em] min-w-0 px-2.5 ${customStyles.hoverBg} transition-colors`}
              >
                <Search size={20} />
              </button>
              
              <button className={`flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-10 ${customStyles.bgSecondary} ${customStyles.textPrimary} gap-2 text-sm font-bold leading-normal tracking-[0.015em] min-w-0 px-2.5 ${customStyles.hoverBg} transition-colors`}>
                <Globe size={20} />
              </button>
            </div>
            
            {/* Menu utilisateur ou connexion */}
            {isAuthenticated ? (
              <div className="relative user-menu-container">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className={`flex items-center gap-2 bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 ${customStyles.bgAccent} text-white font-bold justify-center hover:opacity-90 transition-opacity`}
                >
                  {user?.prenom?.charAt(0).toUpperCase() || 'U'}
                  <HiChevronDown className={`w-4 h-4 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
                </button>
                
                {/* Menu dropdown */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="font-semibold text-gray-900">{user?.prenom} {user?.nom}</p>
                      <p className="text-sm text-gray-500">{user?.email}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {user?.Roles?.[0]?.nom_role || 'Visiteur'}
                      </p>
                    </div>
                    
                    <a
                      href="/mon-profil"
                      className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <HiUser className="w-5 h-5" />
                      <span>Mon profil</span>
                    </a>
                    
                    <a
                      href="/mes-oeuvres"
                      className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                      <span>Mes créations</span>
                    </a>
                    
                    <a
                      href="/mes-favoris"
                      className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      <span>Mes favoris</span>
                    </a>
                    
                    {/* ✅ CORRECTION : Admin uniquement */}
                    {isUserAdmin() && (
                      <a
                        href="/admin"
                        className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <Settings className="w-5 h-5" />
                        <span>Administration</span>
                      </a>
                    )}
                    
                    <div className="border-t border-gray-100 mt-2 pt-2">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-2 text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                      >
                        <HiArrowRightOnRectangle className="w-5 h-5" />
                        <span>Se déconnecter</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <a
                href="/connexion"
                className={`flex items-center justify-center px-4 h-10 rounded-xl ${customStyles.bgAccent} ${customStyles.textPrimary} text-sm font-bold hover:opacity-90 transition-opacity`}
              >
                Se connecter
              </a>
            )}
          </div>
        </header>

        {/* Contenu principal */}
        <div className="px-40 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            {/* Titre et description */}
            <div className="flex flex-wrap justify-between gap-3 p-4">
              <div className="flex min-w-72 flex-col gap-3">
                <p className="text-[#181511] tracking-light text-[32px] font-bold leading-tight">{title}</p>
                <p className="text-[#897b61] text-sm font-normal leading-normal">{description}</p>
              </div>
              {showCreateButton && isAuthenticated && (
                <button 
                  onClick={() => window.location.href = `/${type}/nouveau`}
                  className="flex items-center gap-2 px-4 h-10 bg-[#eb9f13] text-[#181511] rounded-xl hover:opacity-90 transition-opacity text-sm font-bold"
                >
                  <HiPlus size={16} />
                  <span>Ajouter</span>
                </button>
              )}
            </div>

            {/* Barre de recherche */}
            <div className="px-4 py-3">
              <label className="flex flex-col min-w-40 h-12 w-full">
                <div className="flex w-full flex-1 items-stretch rounded-xl h-full">
                  <div className="text-[#897b61] flex border-none bg-[#f4f3f0] items-center justify-center pl-4 rounded-l-xl border-r-0">
                    <Search size={24} />
                  </div>
                  <input
                    placeholder={`Rechercher ${type === 'oeuvres' ? 'des œuvres' : type === 'evenements' ? 'des événements' : 'des lieux'}...`}
                    className="form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-[#181511] focus:outline-0 focus:ring-0 border-none bg-[#f4f3f0] focus:border-none h-full placeholder:text-[#897b61] px-4 rounded-l-none border-l-0 pl-2 text-base font-normal leading-normal"
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  />
                </div>
              </label>
            </div>

            {/* Tabs dynamiques selon le type */}
            {tabs.length > 1 && (
              <div className="pb-3">
                <div className="flex border-b border-[#e6e2db] px-4 gap-8 overflow-x-auto">
                  {tabs.map(tab => (
                    <a
                      key={tab.id}
                      className={`flex flex-col items-center justify-center border-b-[3px] pb-[13px] pt-4 cursor-pointer transition-colors whitespace-nowrap ${
                        filters.tab === tab.id 
                          ? 'border-b-[#181511] text-[#181511]' 
                          : 'border-b-transparent text-[#897b61] hover:text-[#181511]'
                      }`}
                      onClick={() => setFilters({ ...filters, tab: tab.id })}
                    >
                      <p className={`text-sm font-bold leading-normal tracking-[0.015em] ${
                        filters.tab === tab.id ? 'text-[#181511]' : 'text-[#897b61]'
                      }`}>
                        {tab.label}
                      </p>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Liste des items */}
            {error ? (
              <div className="text-center py-20">
                <div className="text-red-600 mb-4">
                  <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-[#181511] mb-2">Erreur de chargement</h3>
                <p className="text-[#897b61] mb-4">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-6 py-2 bg-[#eb9f13] text-[#181511] rounded-xl hover:opacity-90 transition-opacity font-bold"
                >
                  Réessayer
                </button>
              </div>
            ) : isLoading ? (
              <div className="flex justify-center py-20">
                <Loading text="Chargement..." />
              </div>
            ) : filteredItems.length > 0 ? (
              <div>
                {filteredItems.map(item => renderCard(item))}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="text-[#897b61] mb-4">
                  {type === 'oeuvres' && <HiBookOpen size={48} className="mx-auto" />}
                  {type === 'evenements' && <HiCalendar size={48} className="mx-auto" />}
                  {type === 'lieux' && <HiMapPin size={48} className="mx-auto" />}
                </div>
                <h3 className="text-lg font-medium text-[#181511] mb-2">Aucun résultat</h3>
                <p className="text-[#897b61]">Essayez de modifier vos critères de recherche.</p>
                {isAuthenticated && showCreateButton && (
                  <button
                    onClick={() => window.location.href = `/${type}/nouveau`}
                    className="mt-4 px-6 py-2 bg-[#eb9f13] text-[#181511] rounded-xl hover:opacity-90 transition-opacity font-bold"
                  >
                    Créer le premier
                  </button>
                )}
              </div>
            )}

            {/* ✅ CORRIGÉ : Pagination utilisant "pages" au lieu de "totalPages" */}
            {pagination && pagination.pages > 1 && (
              <div className="flex items-center justify-center p-4">
                <button 
                  onClick={() => goToPage(page - 1)}
                  disabled={page === 1}
                  className="flex size-10 items-center justify-center disabled:opacity-50"
                >
                  <HiChevronLeft size={18} />
                </button>
                
                {[...Array(Math.min(pagination.pages, 5))].map((_, index) => {
                  const pageNum = index + 1;
                  return (
                    <button
                      key={pageNum}
                      onClick={() => goToPage(pageNum)}
                      className={`text-sm leading-normal flex size-10 items-center justify-center rounded-full ${
                        page === pageNum 
                          ? 'font-bold text-[#181511] bg-[#f4f3f0]' 
                          : 'font-normal text-[#181511] hover:bg-[#f4f3f0]'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button 
                  onClick={() => goToPage(page + 1)}
                  disabled={page === pagination.pages}
                  className="flex size-10 items-center justify-center disabled:opacity-50"
                >
                  <HiChevronRight size={18} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// PAGES SPÉCIALISÉES
// =============================================================================

export const OeuvresPage: React.FC = () => (
  <ListingPage
    type="oeuvres"
    title="Œuvres culturelles"
    description="Découvrez les créations artistiques et littéraires du patrimoine algérien, des œuvres traditionnelles aux créations contemporaines."
  />
);

export const EvenementsPage: React.FC = () => (
  <ListingPage
    type="evenements"
    title="Événements à venir"
    description="Explorez une gamme diversifiée d'événements culturels, des ateliers d'artisanat traditionnel aux festivals du patrimoine. Plongez dans la riche tapisserie du patrimoine de notre communauté."
  />
);

export const PatrimoinePage: React.FC = () => (
  <ListingPage
    type="lieux"
    title="Sites patrimoniaux"
    description="Découvrez les trésors architecturaux et les sites historiques qui racontent l'histoire millénaire de l'Algérie."
  />
);