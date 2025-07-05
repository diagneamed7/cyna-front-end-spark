// pages/SearchPage.tsx - Page de recherche avancée avec filtres et tri

import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import {
  HiMagnifyingGlass as Search,
  HiAdjustmentsHorizontal as Adjustments,
  HiXMark,
  HiFunnel,
  HiArrowDown,
  HiBookOpen,
  HiCalendar,
  HiMapPin,
  HiSquares2X2 as Grid,
  HiBars3 as List,
  HiChevronDown,
  HiChevronUp,
  HiExclamationCircle,
  HiArrowLeft
} from 'react-icons/hi2';

// Import des hooks existants
import { 
  useOeuvresList, 
  useEvenementsList, 
  usePatrimoineList,
  useGlobalSearch 
} from '../hooks/combined';
import { useMetadata } from '../hooks/useMetadata';
import { useAuth } from '../hooks/useAuth';
import { Loading } from '../components/UI';

// Import des cards
import { OeuvreCard, EvenementCard, LieuCard } from '../components/Cards';

// Types pour les filtres
interface SearchFilters {
  type: 'all' | 'oeuvres' | 'evenements' | 'patrimoine';
  langue?: string;
  categorie?: string;
  wilaya?: string;
  annee?: string;
  sort?: string;
  order?: 'ASC' | 'DESC';
}

const SearchPage: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();
  
  // Récupération des paramètres de recherche depuis l'URL
  const queryParams = new URLSearchParams(location.search);
  const initialQuery = queryParams.get('q') || '';
  const initialType = queryParams.get('type') || 'all';

  // États locaux
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    type: initialType as SearchFilters['type'],
    sort: 'date_creation',
    order: 'DESC'
  });

  // Metadata pour les filtres
  const { options: metadata, isLoading: metadataLoading } = useMetadata();

  // Hook de recherche globale pour la recherche instantanée
  const {
    query,
    setQuery,
    oeuvres: instantOeuvres,
    evenements: instantEvenements,
    sites: instantSites,
    isSearching: instantSearching,
    hasResults: instantHasResults,
    totalResults: instantTotalResults
  } = useGlobalSearch();

  // Hooks pour les listes complètes avec pagination
  const {
    oeuvres,
    pagination: oeuvresPagination,
    isLoading: oeuvresLoading,
    error: oeuvresError,
    page: oeuvresPage,
    goToPage: goToOeuvresPage,
    refetch: refetchOeuvres
  } = useOeuvresList(
    {
      search: searchQuery,
      langue: filters.langue ? parseInt(filters.langue) : undefined,
      categorie: filters.categorie ? parseInt(filters.categorie) : undefined
      // Le statut est géré différemment selon votre API
      // Si votre API attend le statut dans les filtres, décommentez la ligne suivante :
      // statut: filters.statut
    },
    { limit: 12 }
  );

  const {
    evenements,
    pagination: evenementsPagination,
    isLoading: evenementsLoading,
    error: evenementsError,
    page: evenementsPage,
    goToPage: goToEvenementsPage,
    refetch: refetchEvenements
  } = useEvenementsList(
    {
      search: searchQuery,
      wilaya: filters.wilaya ? parseInt(filters.wilaya) : undefined
    },
    { limit: 12 }
  );

  const {
    sites,
    pagination: sitesPagination,
    isLoading: sitesLoading,
    error: sitesError,
    page: sitesPage,
    goToPage: goToSitesPage,
    refetch: refetchSites
  } = usePatrimoineList(
    {
      search: searchQuery,
      wilaya: filters.wilaya ? parseInt(filters.wilaya) : undefined
    },
    { limit: 12 }
  );

  // Mise à jour de la recherche instantanée
  useEffect(() => {
    setQuery(searchQuery);
  }, [searchQuery, setQuery]);

  // Mise à jour de l'URL lors des changements de recherche
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set('q', searchQuery);
    if (filters.type !== 'all') params.set('type', filters.type);
    
    // Utiliser window.history.replaceState au lieu de navigate
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState(null, '', newUrl);
  }, [searchQuery, filters.type]);

  // Calcul des résultats selon le type sélectionné
  const getFilteredResults = () => {
    switch (filters.type) {
      case 'oeuvres':
        return {
          oeuvres: oeuvres,
          evenements: [],
          sites: [],
          totalCount: oeuvresPagination.total
        };
      case 'evenements':
        return {
          oeuvres: [],
          evenements: evenements,
          sites: [],
          totalCount: evenementsPagination.total
        };
      case 'patrimoine':
        return {
          oeuvres: [],
          evenements: [],
          sites: sites,
          totalCount: sitesPagination.total
        };
      default:
        return {
          oeuvres: oeuvres,
          evenements: evenements,
          sites: sites,
          totalCount: oeuvresPagination.total + evenementsPagination.total + sitesPagination.total
        };
    }
  };

  const results = getFilteredResults();
  const isLoading = oeuvresLoading || evenementsLoading || sitesLoading;
  const hasError = oeuvresError || evenementsError || sitesError;

  // Options de tri
  const sortOptions = [
    { value: 'date_creation', label: 'Date de création' },
    { value: 'titre', label: 'Titre' },
    { value: 'popularite', label: 'Popularité' },
    { value: 'note_moyenne', label: 'Note moyenne' }
  ];

  // Gestion de la recherche
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Les hooks se mettent à jour automatiquement avec le searchQuery
  };

  // Composant de filtre
  const FilterSection: React.FC = () => (
    <div className={`${showFilters ? 'block' : 'hidden lg:block'} lg:w-64 flex-shrink-0`}>
      <div className="bg-white rounded-xl shadow-sm border border-patrimoine-canard/10 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-patrimoine-canard">Filtres</h3>
          <button
            onClick={() => setShowFilters(false)}
            className="lg:hidden p-1 hover:bg-patrimoine-creme/30 rounded"
          >
            <HiXMark size={20} />
          </button>
        </div>

        {/* Type de contenu */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-patrimoine-sombre mb-3">
            Type de contenu
          </label>
          <div className="space-y-2">
            {[
              { value: 'all', label: 'Tout', icon: <Grid size={16} /> },
              { value: 'oeuvres', label: 'Œuvres', icon: <HiBookOpen size={16} /> },
              { value: 'evenements', label: 'Événements', icon: <HiCalendar size={16} /> },
              { value: 'patrimoine', label: 'Patrimoine', icon: <HiMapPin size={16} /> }
            ].map((type) => (
              <label
                key={type.value}
                className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                  filters.type === type.value
                    ? 'bg-patrimoine-emeraude/10 border border-patrimoine-emeraude text-patrimoine-emeraude'
                    : 'border border-patrimoine-canard/10 hover:bg-patrimoine-creme/30'
                }`}
              >
                <input
                  type="radio"
                  name="type"
                  value={type.value}
                  checked={filters.type === type.value}
                  onChange={(e) => setFilters({ ...filters, type: e.target.value as SearchFilters['type'] })}
                  className="sr-only"
                />
                {type.icon}
                <span className="text-sm font-medium">{type.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Filtres spécifiques aux œuvres */}
        {(filters.type === 'all' || filters.type === 'oeuvres') && (
          <>
            {/* Langue */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-patrimoine-sombre mb-3">
                Langue
              </label>
              <select
                value={filters.langue || ''}
                onChange={(e) => setFilters({ ...filters, langue: e.target.value })}
                className="w-full px-3 py-2 border border-patrimoine-canard/20 rounded-lg focus:ring-2 focus:ring-patrimoine-emeraude focus:border-patrimoine-emeraude"
                disabled={metadataLoading}
              >
                <option value="">Toutes les langues</option>
                {metadata.langues.map((langue: any) => (
                  <option key={langue.value} value={langue.value}>
                    {langue.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Catégorie */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-patrimoine-sombre mb-3">
                Catégorie
              </label>
              <select
                value={filters.categorie || ''}
                onChange={(e) => setFilters({ ...filters, categorie: e.target.value })}
                className="w-full px-3 py-2 border border-patrimoine-canard/20 rounded-lg focus:ring-2 focus:ring-patrimoine-emeraude focus:border-patrimoine-emeraude"
                disabled={metadataLoading}
              >
                <option value="">Toutes les catégories</option>
                {metadata.categories.map((cat: any) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        {/* Wilaya (pour événements et patrimoine) */}
        {(filters.type === 'evenements' || filters.type === 'patrimoine') && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-patrimoine-sombre mb-3">
              Wilaya
            </label>
            <select
              value={filters.wilaya || ''}
              onChange={(e) => setFilters({ ...filters, wilaya: e.target.value })}
              className="w-full px-3 py-2 border border-patrimoine-canard/20 rounded-lg focus:ring-2 focus:ring-patrimoine-emeraude focus:border-patrimoine-emeraude"
              disabled={metadataLoading}
            >
              <option value="">Toutes les wilayas</option>
              {metadata.wilayas.map((wilaya: any) => (
                <option key={wilaya.value} value={wilaya.value}>
                  {wilaya.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Bouton réinitialiser */}
        <button
          onClick={() => setFilters({
            type: 'all',
            sort: 'date_creation',
            order: 'DESC'
          })}
          className="w-full px-4 py-2 text-sm font-medium text-patrimoine-canard bg-patrimoine-creme/30 hover:bg-patrimoine-creme/50 rounded-lg transition-colors"
        >
          Réinitialiser les filtres
        </button>
      </div>
    </div>
  );

  // Composant pour afficher aucun résultat
  const NoResults: React.FC = () => (
    <div className="text-center py-20">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-patrimoine-emeraude/10 text-patrimoine-emeraude mb-6">
        <Search size={40} />
      </div>
      <h3 className="text-2xl font-semibold text-patrimoine-canard mb-3">
        Aucun résultat trouvé
      </h3>
      <p className="text-patrimoine-sombre/70 mb-8 max-w-md mx-auto">
        Aucun contenu ne correspond à votre recherche "{searchQuery}". 
        Essayez de modifier vos filtres ou votre recherche.
      </p>
      <button
        onClick={() => {
          setSearchQuery('');
          setFilters({
            type: 'all',
            sort: 'date_creation',
            order: 'DESC'
          });
        }}
        className="px-6 py-3 bg-gradient-patrimoine text-white rounded-lg hover:shadow-patrimoine transition-all duration-200 font-medium"
      >
        Réinitialiser la recherche
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-patrimoine-creme/20">
      {/* Header de recherche */}
      <section className="bg-white border-b sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-4 mb-4">
            <button
              onClick={() => window.history.back()}
              className="p-2 hover:bg-patrimoine-creme/30 rounded-lg transition-colors"
              title="Retour"
            >
              <HiArrowLeft size={20} className="text-patrimoine-canard" />
            </button>
            <h1 className="text-2xl font-bold text-patrimoine-canard">
              Recherche
            </h1>
          </div>

          {/* Barre de recherche */}
          <form onSubmit={handleSearch} className="relative mb-4">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-patrimoine-canard/60" size={24} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher dans tout le patrimoine culturel..."
              className="w-full pl-12 pr-32 py-4 text-lg rounded-xl border border-patrimoine-canard/20 focus:ring-2 focus:ring-patrimoine-emeraude focus:border-patrimoine-emeraude bg-white"
              autoFocus
            />
            <button
              type="submit"
              disabled={isLoading}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-gradient-patrimoine text-white px-6 py-2 rounded-lg hover:shadow-patrimoine transition-all duration-200 disabled:opacity-50 font-medium"
            >
              {isLoading ? 'Recherche...' : 'Rechercher'}
            </button>
          </form>

          {/* Résultats instantanés */}
          {instantHasResults && !isLoading && (
            <div className="bg-patrimoine-emeraude/5 border border-patrimoine-emeraude/20 rounded-lg p-3 text-sm">
              <span className="text-patrimoine-emeraude font-medium">
                {instantTotalResults} résultat{instantTotalResults > 1 ? 's' : ''} trouvé{instantTotalResults > 1 ? 's' : ''}
              </span>
              <span className="text-patrimoine-sombre/60 ml-2">
                ({instantOeuvres.length} œuvre{instantOeuvres.length > 1 ? 's' : ''}, 
                {' '}{instantEvenements.length} événement{instantEvenements.length > 1 ? 's' : ''}, 
                {' '}{instantSites.length} site{instantSites.length > 1 ? 's' : ''})
              </span>
            </div>
          )}

          {/* Contrôles */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center space-x-4">
              {/* Bouton filtres mobile */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden flex items-center space-x-2 px-4 py-2 border border-patrimoine-canard/20 rounded-lg hover:bg-patrimoine-creme/30 transition-colors"
              >
                <HiFunnel size={18} />
                <span>Filtres</span>
                {(filters.langue || filters.categorie || filters.wilaya || filters.type !== 'all') && (
                  <span className="ml-1 px-2 py-0.5 bg-patrimoine-emeraude text-white text-xs rounded-full">
                    {[filters.langue, filters.categorie, filters.wilaya, filters.type !== 'all' ? '1' : ''].filter(Boolean).length}
                  </span>
                )}
              </button>

              {/* Tri */}
              <div className="relative">
                <select
                  value={`${filters.sort}-${filters.order}`}
                  onChange={(e) => {
                    const [sort, order] = e.target.value.split('-');
                    setFilters({ ...filters, sort, order: order as 'ASC' | 'DESC' });
                  }}
                  className="pl-10 pr-8 py-2 border border-patrimoine-canard/20 rounded-lg focus:ring-2 focus:ring-patrimoine-emeraude appearance-none bg-white text-sm"
                >
                  <option value="date_creation-DESC">Plus récent</option>
                  <option value="date_creation-ASC">Plus ancien</option>
                  <option value="titre-ASC">Titre A-Z</option>
                  <option value="titre-DESC">Titre Z-A</option>
                  <option value="popularite-DESC">Plus populaire</option>
                  <option value="note_moyenne-DESC">Mieux noté</option>
                </select>
                <HiArrowDown className="absolute left-3 top-1/2 transform -translate-y-1/2 text-patrimoine-canard/60" size={16} />
              </div>
            </div>

            {/* Vue */}
            <div className="hidden sm:flex border border-patrimoine-canard/20 rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-patrimoine-emeraude text-white' 
                    : 'text-patrimoine-canard/60 hover:text-patrimoine-canard'
                }`}
              >
                <Grid size={18} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-patrimoine-emeraude text-white' 
                    : 'text-patrimoine-canard/60 hover:text-patrimoine-canard'
                }`}
              >
                <List size={18} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Filtres sidebar */}
          <FilterSection />

          {/* Résultats */}
          <div className="flex-1">
            {/* Message d'erreur */}
            {hasError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex items-start space-x-3">
                  <HiExclamationCircle className="h-5 w-5 text-red-600 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium text-red-800">
                      Erreur lors du chargement des résultats
                    </h3>
                    <p className="mt-1 text-sm text-red-700">
                      Une erreur s'est produite. Veuillez réessayer.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* État de chargement */}
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loading text="Recherche en cours..." />
              </div>
            ) : results.totalCount === 0 ? (
              <NoResults />
            ) : (
              <>
                {/* Résumé des résultats */}
                <div className="mb-6">
                  <p className="text-patrimoine-sombre">
                    <span className="font-semibold">{results.totalCount}</span> résultat{results.totalCount > 1 ? 's' : ''} 
                    {searchQuery && ` pour "${searchQuery}"`}
                  </p>
                </div>

                {/* Liste des résultats */}
                <div className="space-y-8">
                  {/* Œuvres */}
                  {results.oeuvres.length > 0 && (
                    <div>
                      <h2 className="text-xl font-semibold text-patrimoine-canard mb-4 flex items-center space-x-2">
                        <HiBookOpen size={24} />
                        <span>Œuvres ({oeuvresPagination.total})</span>
                      </h2>
                      <div className={`grid gap-6 ${
                        viewMode === 'grid' 
                          ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                          : 'grid-cols-1'
                      }`}>
                        {results.oeuvres.map((oeuvre) => (
                          <OeuvreCard
                            key={oeuvre.id_oeuvre}
                            oeuvre={oeuvre}
                            onClick={() => window.location.href = `/oeuvres/${oeuvre.id_oeuvre}`}
                            compact={viewMode === 'list'}
                          />
                        ))}
                      </div>

                      {/* Pagination œuvres */}
                      {oeuvresPagination.totalPages > 1 && (
                        <div className="mt-6 flex justify-center">
                          <nav className="flex items-center space-x-2">
                            <button
                              onClick={() => goToOeuvresPage(oeuvresPage - 1)}
                              disabled={oeuvresPage === 1}
                              className="px-3 py-2 border border-patrimoine-canard/20 rounded-lg hover:bg-patrimoine-creme/30 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Précédent
                            </button>
                            <span className="px-4 py-2 text-sm text-patrimoine-sombre">
                              Page {oeuvresPage} sur {oeuvresPagination.totalPages}
                            </span>
                            <button
                              onClick={() => goToOeuvresPage(oeuvresPage + 1)}
                              disabled={oeuvresPage === oeuvresPagination.totalPages}
                              className="px-3 py-2 border border-patrimoine-canard/20 rounded-lg hover:bg-patrimoine-creme/30 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Suivant
                            </button>
                          </nav>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Événements */}
                  {results.evenements.length > 0 && (
                    <div>
                      <h2 className="text-xl font-semibold text-patrimoine-canard mb-4 flex items-center space-x-2">
                        <HiCalendar size={24} />
                        <span>Événements ({evenementsPagination.total})</span>
                      </h2>
                      <div className={`grid gap-6 ${
                        viewMode === 'grid' 
                          ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                          : 'grid-cols-1'
                      }`}>
                        {results.evenements.map((evenement) => (
                          <EvenementCard
                            key={evenement.id_evenement}
                            evenement={evenement}
                            onClick={() => window.location.href = `/evenements/${evenement.id_evenement}`}
                            compact={viewMode === 'list'}
                          />
                        ))}
                      </div>

                      {/* Pagination événements */}
                      {evenementsPagination.totalPages > 1 && (
                        <div className="mt-6 flex justify-center">
                          <nav className="flex items-center space-x-2">
                            <button
                              onClick={() => goToEvenementsPage(evenementsPage - 1)}
                              disabled={evenementsPage === 1}
                              className="px-3 py-2 border border-patrimoine-canard/20 rounded-lg hover:bg-patrimoine-creme/30 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Précédent
                            </button>
                            <span className="px-4 py-2 text-sm text-patrimoine-sombre">
                              Page {evenementsPage} sur {evenementsPagination.totalPages}
                            </span>
                            <button
                              onClick={() => goToEvenementsPage(evenementsPage + 1)}
                              disabled={evenementsPage === evenementsPagination.totalPages}
                              className="px-3 py-2 border border-patrimoine-canard/20 rounded-lg hover:bg-patrimoine-creme/30 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Suivant
                            </button>
                          </nav>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Sites patrimoniaux */}
                  {results.sites.length > 0 && (
                    <div>
                      <h2 className="text-xl font-semibold text-patrimoine-canard mb-4 flex items-center space-x-2">
                        <HiMapPin size={24} />
                        <span>Sites patrimoniaux ({sitesPagination.total})</span>
                      </h2>
                      <div className={`grid gap-6 ${
                        viewMode === 'grid' 
                          ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                          : 'grid-cols-1'
                      }`}>
                        {results.sites.map((lieu) => (
                          <LieuCard
                            key={lieu.id_lieu}
                            lieu={lieu}
                            onClick={() => window.location.href = `/patrimoine/${lieu.id_lieu}`}
                            compact={viewMode === 'list'}
                          />
                        ))}
                      </div>

                      {/* Pagination sites */}
                      {sitesPagination.totalPages > 1 && (
                        <div className="mt-6 flex justify-center">
                          <nav className="flex items-center space-x-2">
                            <button
                              onClick={() => goToSitesPage(sitesPage - 1)}
                              disabled={sitesPage === 1}
                              className="px-3 py-2 border border-patrimoine-canard/20 rounded-lg hover:bg-patrimoine-creme/30 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Précédent
                            </button>
                            <span className="px-4 py-2 text-sm text-patrimoine-sombre">
                              Page {sitesPage} sur {sitesPagination.totalPages}
                            </span>
                            <button
                              onClick={() => goToSitesPage(sitesPage + 1)}
                              disabled={sitesPage === sitesPagination.totalPages}
                              className="px-3 py-2 border border-patrimoine-canard/20 rounded-lg hover:bg-patrimoine-creme/30 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Suivant
                            </button>
                          </nav>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;