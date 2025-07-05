// pages/HomePage.tsx - Version avec pagination intégrée
import React, { useState, useEffect } from 'react';
import Chatbot from './Chatbot'; // adapte le chemin si besoin

import { 
  HiMagnifyingGlass as Search,
  HiGlobeAlt as Globe,
  HiMapPin,
  HiCalendar,
  HiBookOpen,
  HiArrowRight,
  HiUser,
  HiArrowRightOnRectangle,
  HiChevronDown
} from 'react-icons/hi2';
import {
  FaTwitter,
  FaInstagram,
  FaFacebook,
  FaTiktok,
  FaYoutube
} from 'react-icons/fa';

// Import des hooks existants
import { useHomepageData, useGlobalSearch, useOeuvresList, useEvenementsList, usePatrimoineList } from '../hooks/combined';
import { useAuth } from '../hooks/useAuth';
import { useAdmin } from '../hooks/useAdmin';
import {  Pagination } from '../components/UI/Pagination';
import { FullPageLoader } from '../components/FullPageLoader';
import { Loading } from '../components/UI';
import ProductCarousel from '../components/Carousel/produitsCarousel';
// @ts-expect-error: Pas de types pour ce module JS
import CategoryCard from '../components/Cards/CategoryCard';
// @ts-expect-error: Pas de types pour ce module JS
import ProductCard from '../components/Cards/ProductCard';
// @ts-expect-error: Pas de types pour ce module JS
import { getAllCategories } from '../services/api/CategoryService';
// @ts-expect-error: Pas de types pour ce module JS
import { getAllProducts } from '../services/api/ProductService';
// Import des styles
import styles from '../styles/HomePage.module.css';
import Header from '../components/Layout/Header';
import { MainLayout } from '../components';


const HomePage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [initialLoading, setInitialLoading] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [activeSection, setActiveSection] = useState<'evenements' | 'patrimoine' | 'oeuvres' | null>(null);
  
  // Hooks pour les données avec pagination
  const {
    oeuvres: recentOeuvres,
    pagination: oeuvresPagination,
    isLoading: oeuvresLoading,
    error: oeuvresError,
    page: oeuvresPage,
    goToPage: goToOeuvresPage
  } = useOeuvresList({}, { limit: 6 });

  const {
    evenements: upcomingEvenements,
    pagination: evenementsPagination,
    isLoading: evenementsLoading,
    error: evenementsError,
    page: evenementsPage,
    goToPage: goToEvenementsPage
  } = useEvenementsList({ upcoming: true }, { limit: 6 });

  const {
    sites: popularSites,
    pagination: sitesPagination,
    isLoading: sitesLoading,
    error: sitesError,
    page: sitesPage,
    goToPage: goToSitesPage
  } = usePatrimoineList({ popular: true }, { limit: 6 });

  const { user, isAuthenticated, logout, isLoading } = useAuth();
  const { canViewAdminPanel } = useAdmin();

  // Hook de recherche globale
  const {
    query,
    setQuery,
    oeuvres: searchOeuvres,
    evenements: searchEvenements,
    sites: searchSites,
    isSearching,
    hasResults,
    clearSearch
  } = useGlobalSearch();

  // Stats de la homepage
  const { stats } = useHomepageData();

  // Combiner les états de loading
  const showLoading = initialLoading;

  // Styles personnalisés
  const customStyles = {
    bgPrimary: 'bg-[#f8fbfa]',
    textPrimary: 'text-[#0e1a13]',
    textSecondary: 'text-[#51946b]',
    bgSecondary: 'bg-[#e8f2ec]',
    bgAccent: 'bg-[#eb9f13]',
    borderColor: 'border-[#e8f2ec]',
    hoverAccent: 'hover:text-[#eb9f13]',
    textAccent: 'text-[#eb9f13]'
  };

  // Fonction de recherche
  const handleSearch = () => {
    if (searchQuery.trim()) {
      window.location.href = `/recherche?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  // Gestionnaire pour la touche Entrée
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Fonction pour effectuer une recherche en temps réel
  const handleRealTimeSearch = (value: string) => {
    setSearchQuery(value);
    
    if (value.trim().length >= 2) {
      setQuery(value.trim());
    } else if (value.trim().length === 0) {
      clearSearch();
    }
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

  // Simuler un délai minimum pour le loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setInitialLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const [categories, setCategories] = useState<any[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState<boolean>(true);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [productsLoading, setProductsLoading] = useState<boolean>(true);
  const [productsError, setProductsError] = useState<string | null>(null);

  useEffect(() => {
    getAllCategories()
      .then((data: any[]) => {
        setCategories(data.slice(0, 6));
        setCategoriesLoading(false);
      })
      .catch((err: any) => {
        setCategoriesError(err.message);
        setCategoriesLoading(false);
      });
    getAllProducts()
      .then((data: any[]) => {
        setProducts(data.slice(0, 6));
        setProductsLoading(false);
      })
      .catch((err: any) => {
        setProductsError(err.message);
        setProductsLoading(false);
      });
  }, []);

  // Fonction pour rendre une section avec pagination
  const renderSectionWithPagination = (
    title: string,
    items: any[],
    isLoading: boolean,
    error: string | null,
    pagination: any,
    page: number,
    goToPage: (page: number) => void,
    renderCard: (item: any) => React.ReactNode,
    emptyMessage: string,
    createLink?: string,
    viewAllLink: string
  ) => (
    <>
      <div className="flex items-center justify-between px-4 pb-3 pt-5">
        <h2 className={`${customStyles.textPrimary} text-[22px] font-bold leading-tight tracking-[-0.015em]`}>
          {title}
        </h2>
        <a 
          href={viewAllLink}
          className={`text-sm font-medium ${customStyles.textAccent} ${customStyles.hoverAccent} transition-colors`}
        >
          Voir tout →
        </a>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-8">
          <Loading />
        </div>
      ) : error ? (
        <div className="p-8 text-center">
          <p className="text-red-600 mb-4">Erreur lors du chargement</p>
          <button 
            onClick={() => window.location.reload()} 
            className={`px-4 py-2 ${customStyles.bgAccent} ${customStyles.textPrimary} rounded-lg font-bold`}
          >
            Réessayer
          </button>
        </div>
      ) : items.length > 0 ? (
        <>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4 p-4">
            {items.map(renderCard)}
          </div>
          {pagination && pagination.pages > 1 && (
            <div className="px-4 pb-4">
              <Pagination
                currentPage={page}
                totalPages={pagination.pages}
                onPageChange={goToPage}
                size="sm"
                variant="rounded"
                showFirstLast={false}
              />
            </div>
          )}
        </>
      ) : (
        <div className="p-8 text-center">
          <p className={customStyles.textSecondary}>{emptyMessage}</p>
          {isAuthenticated && createLink && (
            <a 
              href={createLink} 
              className={`inline-block mt-4 px-4 py-2 ${customStyles.bgAccent} ${customStyles.textPrimary} rounded-lg font-bold`}
            >
              Créer le premier
            </a>
          )}
        </div>
      )}
    </>
  );

  // ✅ AJOUTÉ : Redirection automatique pour les admins
  useEffect(() => {
    if (isAuthenticated && canViewAdminPanel && !isLoading) {
      // Redirection vers l'admin après un court délai
      const timer = setTimeout(() => {
        window.location.href = '/admin';
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, canViewAdminPanel, isLoading]);

  if (isLoading) {
    return <Loading overlay text="Chargement..." />;
  }

  // ✅ AJOUTÉ : Message de redirection pour les admins
  if (isAuthenticated && canViewAdminPanel) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Redirection vers l'administration</h1>
            <p className="text-gray-600">Vous allez être redirigé vers l'interface d'administration...</p>
            <p className="text-sm text-gray-500 mt-2">Si la redirection ne fonctionne pas, <a href="/admin" className="text-blue-600 hover:underline">cliquez ici</a></p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <div className={`relative flex size-full min-h-screen flex-col ${customStyles.bgPrimary} group/design-root overflow-x-hidden`} style={{ fontFamily: '"Noto Serif", "Noto Sans", sans-serif' }}>
      <div className="layout-container flex h-full grow flex-col">
        {/* Header global */}
        <Header />
        {/* Main Content */}
        <div className="px-40 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            {/* Remplacement du grand carré noir (Hero Section) par le carrousel produit */}
            <ProductCarousel />

            {/* Texte dynamique Cyna */}
            <div className="mt-8 mb-8 px-6 py-6 bg-white rounded-xl shadow text-center max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold text-[#eb9f13] mb-2">Cyna – La cybersécurité SaaS pour entreprises</h2>
              <p className="text-[#0e1a13] mb-2">Cyna propose des solutions de sécurité cloud (SOC, EDR, XDR) pour protéger efficacement vos systèmes, données et utilisateurs.</p>
              <ul className="text-left text-[#51946b] mb-2 mx-auto max-w-md">
                <li>🔒 <b>SOC</b> : Supervision 24/7 et réponse aux incidents.</li>
                <li>🛡️ <b>EDR</b> : Détection et protection avancée des postes de travail.</li>
                <li>🌐 <b>XDR</b> : Sécurité unifiée sur l'ensemble de votre infrastructure.</li>
              </ul>
              <p className="text-[#0e1a13] mb-2">Solutions prêtes à l'emploi, évolutives, et adaptées aux besoins des PME comme des grandes entreprises.</p>
              <p className="text-[#eb9f13] font-semibold">Sécurisez votre activité. Simplifiez votre cybersécurité. Faites confiance à Cyna.</p>
            </div>

            {/* Section Catalogue de Catégories */}
            <section className="mt-10">
              <h2 className="text-2xl font-bold mb-4 text-[#0e1a13]">Catalogue de Catégories</h2>
              {categoriesLoading ? (
                <div className="flex justify-center py-8"><Loading /></div>
              ) : categoriesError ? (
                <div className="p-8 text-center text-red-600">{categoriesError}</div>
              ) : (
                <div className="flex flex-wrap gap-6 justify-center">
                  {categories.map(category => <CategoryCard key={category.idCategorie} category={category} />)}
                </div>
              )}
            </section>
            {/* Section Catalogue de Produits */}
            <section className="mt-10">
              <h2 className="text-2xl font-bold mb-4 text-[#0e1a13]">TOP PRODUITS DU MOMENT</h2>
              {productsLoading ? (
                <div className="flex justify-center py-8"><Loading /></div>
              ) : productsError ? (
                <div className="p-8 text-center text-red-600">{productsError}</div>
              ) : (
                <div className="flex flex-wrap gap-6 justify-center">
                  {products.map(product => <ProductCard key={product.idProduit} product={product} />)}
                </div>
              )}
            </section>
            {/* CTA Section - Seulement pour les non-connectés */}
            {!isAuthenticated && (
              <div className="mt-12 p-8 bg-gradient-to-r from-[#0e1a13] to-[#1a2e20] rounded-lg text-white text-center">
                <h3 className="text-2xl font-bold mb-4">Besoin de nous contacter?</h3>
                <p className="mb-6 text-gray-200">
                  Veuillez cliquer sur Contactez-nous pour acceder au formulaire de contact ou 
                 cliquer sur Une question? pour acceder au chatbot.
                </p>
                <div className="flex gap-4 justify-center">
                  <a href="/contact" className={`px-6 py-3 ${customStyles.bgAccent} text-[#0e1a13] rounded-lg font-bold hover:opacity-90 transition-opacity`}>
                  Contactez-nous
                  </a>
                  <a href="/tchat" className="px-6 py-3 border border-white rounded-lg font-bold hover:bg-white/10 transition-colors">
                    Une question?
                  </a>
                  
                  
                </div>
                
              </div>
              
            )}
            <a href="/mention" className="px-6 py-3 border border-white rounded-lg font-bold hover:bg-white/10 transition-colors">
                    Mentions légales
                  </a>

                  <a href="/confidentialite" className="px-6 py-3 border border-white rounded-lg font-bold hover:bg-white/10 transition-colors">
                    Politique de confidentialité
                  </a>
                  <Chatbot />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;