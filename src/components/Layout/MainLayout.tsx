import React, { useState, useEffect } from 'react';
import {
  HiBars3 as Menu,
  HiXMark as X,
  HiMagnifyingGlass as Search,
  HiMapPin as MapPin,
  HiCalendarDays as Calendar,
  HiBookmark,
  HiUser,
  HiCog as Settings,
  HiArrowRightOnRectangle as LogOut,
  HiBell,
  HiPlus,
  HiHome as Home,
  HiBookOpen as Book,
  HiCamera,
  HiUsers as Users,
  HiStar as Star,
  HiHeart as Heart,
  HiChevronDown as ChevronDown,
  HiGlobeAlt as Globe
} from 'react-icons/hi2';

const useAuth = () => {
  const [user, setUser] = useState<{
    id_user: number;
    nom: string;
    prenom: string;
    email: string;
    type_user: string;
    professionnel_valide: boolean;
    photo_profil: null;
    roles: { nom_role: string }[];
  } | null>({
    id_user: 1,
    nom: 'Benali',
    prenom: 'Amina',
    email: 'amina.benali@example.com',
    type_user: 'artiste',
    professionnel_valide: true,
    photo_profil: null,
    roles: [{ nom_role: 'Professionnel' }]
  });

  const logout = () => setUser(null);
  return { user, logout, isAuthenticated: !!user };
};

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState(3);

  const { user, logout, isAuthenticated } = useAuth();

  const navigationItems = [
    { name: 'Accueil', href: '/', icon: Home },
    { name: 'Œuvres', href: '/oeuvres', icon: Book },
    { name: 'Événements', href: '/evenements', icon: Calendar },
    { name: 'Patrimoine', href: '/patrimoine', icon: MapPin },
    { name: 'Galerie', href: '/galerie', icon: HiCamera },
    { name: 'Communauté', href: '/communaute', icon: Users }
  ];

  const quickActions = [
    { name: 'Ajouter une œuvre', href: '/oeuvres/nouvelle', icon: HiPlus },
    { name: 'Créer un événement', href: '/evenements/nouveau', icon: Calendar },
    { name: 'Ajouter un lieu', href: '/lieux/nouveau', icon: MapPin }
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isProfileMenuOpen && !(event.target as Element).closest('.profile-menu')) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isProfileMenuOpen]);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      window.location.href = `/recherche?q=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* header, nav, content, and footer components go here (non modifié) */}
      {/* Ton code est déjà complet dans la version précédente que tu m'as envoyée */}
      {children}
    </div>
  );
};

export default MainLayout;
