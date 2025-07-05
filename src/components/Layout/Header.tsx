// components/Header.tsx - Header unifié pour toute l'application (CORRIGÉ)

import React, { useState, useEffect } from 'react';
import { 
  HiMagnifyingGlass as Search,
  HiGlobeAlt as Globe,
  HiUser,
  HiArrowRightOnRectangle,
  HiChevronDown,
  HiCog6Tooth as Settings
} from 'react-icons/hi2';
import { useAuth } from '../../hooks/useAuth';
// @ts-expect-error: Pas de types pour ce module JS
import { getAllCategories } from '../../services/api/CategoryService';

// ✅ AJOUT : Types pour les props
interface HeaderProps {
  currentPage?: 'accueil' | 'oeuvres' | 'evenements' | 'patrimoine' | 'a-propos';
  showSearch?: boolean;
  variant?: 'default' | 'listing';
}

const Header: React.FC<HeaderProps> = ({ 
  currentPage = 'accueil', 
  showSearch = true,
  variant = 'default'
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const [categories, setCategories] = useState<any[]>([]);
  const [showCategoriesMenu, setShowCategoriesMenu] = useState(false);

  // Styles personnalisés unifiés
  const customStyles = {
    bgPrimary: variant === 'listing' ? 'bg-white' : 'bg-[#f8fbfa]',
    textPrimary: 'text-[#0e1a13]',
    textSecondary: 'text-[#51946b]',
    bgSecondary: variant === 'listing' ? 'bg-[#f4f3f0]' : 'bg-[#e8f2ec]',
    bgAccent: 'bg-[#eb9f13]',
    borderColor: variant === 'listing' ? 'border-[#f4f3f0]' : 'border-[#e8f2ec]',
    hoverAccent: 'hover:text-[#eb9f13]',
    textAccent: 'text-[#eb9f13]',
    hoverBg: variant === 'listing' ? 'hover:bg-[#e6e2db]' : 'hover:bg-[#dae9e0]'
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

  useEffect(() => {
    getAllCategories()
      .then((data: any[]) => setCategories(data))
      .catch(() => setCategories([]));
  }, []);

  // Navigation items avec état actif
  const navItems = [
    { href: '/', label: 'Accueil', key: 'accueil' },
    { href: '/evenements', label: 'Événements', key: 'evenements' },
    { href: '/patrimoine', label: 'Patrimoine', key: 'patrimoine' },
    { href: '/produits', label: 'Produits', key: 'produits' }, // <-- MODIFIÉ ICI
    { href: '/a-propos', label: 'À Propos', key: 'a-propos' },
  ];

  // ✅ CORRECTION : Fonction pour vérifier si l'utilisateur est admin
  const isUserAdmin = (): boolean => {
    if (!user?.Roles) return false;
    return user.Roles.some(role => role.nom_role === 'Admin');
  };

  return (
    <header className={`flex items-center justify-between whitespace-nowrap border-b border-solid ${customStyles.borderColor} px-10 py-3 ${customStyles.bgPrimary}`}>
      {/* Logo et titre */}
      <div className={`flex items-center gap-4 ${customStyles.textPrimary}`}>
        <a href="/">
          <img src="/images/loloCyna.png" alt="Logo Cyna" style={{ height: 40, width: 'auto', display: 'block' }} />
        </a>
      </div>
      
      {/* Navigation centrale */}
      <div className="flex flex-1 justify-end gap-8">
        <div className="flex items-center gap-9">
          <a
            className={`text-sm font-medium leading-normal transition-colors ${currentPage === 'accueil' ? customStyles.textAccent : `${customStyles.textPrimary} ${customStyles.hoverAccent}`}`}
            href="/"
          >
            Accueil
          </a>
          <div className="relative">
            <button
              onClick={() => setShowCategoriesMenu(!showCategoriesMenu)}
              className={`text-sm font-medium leading-normal transition-colors ${customStyles.textPrimary} ${customStyles.hoverAccent}`}
            >
              Catégories
            </button>
            {showCategoriesMenu && (
              <div className="absolute left-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2 z-50">
                {categories.length === 0 ? (
                  <div className="px-4 py-2 text-gray-500">Aucune catégorie</div>
                ) : (
                  categories.map(cat => (
                    <a
                      key={cat.idCategorie}
                      href={`/categories/${cat.idCategorie}`}
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setShowCategoriesMenu(false)}
                    >
                      {cat.nom}
                    </a>
                  ))
                )}
              </div>
            )}
          </div>
          <a
            href="/panier"
            className={`flex items-center gap-2 px-4 h-10 rounded-lg ${customStyles.bgAccent} ${customStyles.textPrimary} text-sm font-bold hover:opacity-90 transition-opacity`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 9m13-9l2 9m-5-9V6a2 2 0 10-4 0v3" />
            </svg>
            Panier
          </a>
        </div>
        
        {/* Actions et boutons */}
        <div className="flex gap-2">
          {showSearch && (
            <button
              onClick={() => {
                const input = document.querySelector('input[type="search"]') as HTMLInputElement;
                if (input) {
                  input.focus();
                } else {
                  // Si pas d'input sur la page, aller à la page de recherche
                  window.location.href = '/recherche';
                }
              }}
              className={`flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 ${customStyles.bgSecondary} ${customStyles.textPrimary} gap-2 text-sm font-bold leading-normal tracking-[0.015em] min-w-0 px-2.5 ${customStyles.hoverBg} transition-colors`}
            >
              <Search className="w-5 h-5" />
            </button>
          )}
          
          <button className={`flex max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 ${customStyles.bgSecondary} ${customStyles.textPrimary} gap-2 text-sm font-bold leading-normal tracking-[0.015em] min-w-0 px-2.5 ${customStyles.hoverBg} transition-colors`}>
            <Globe className="w-5 h-5" />
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
            className={`flex items-center justify-center px-4 h-10 rounded-lg ${customStyles.bgAccent} ${customStyles.textPrimary} text-sm font-bold hover:opacity-90 transition-opacity`}
          >
            Se connecter
          </a>
        )}
      </div>
    </header>
  );
};

export default Header;