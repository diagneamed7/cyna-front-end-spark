// src/pages/ArtisanatPage.tsx - Page dédiée à l'artisanat algérien
import React, { useState, useEffect } from 'react';
import { 
  HiMagnifyingGlass as Search,
  HiAdjustmentsHorizontal as Filter,
  HiOutlineSparkles,
  HiCube,
  HiMapPin,
  HiUser,
  HiClock,
  HiTag,
  HiHeart,
  HiOutlineHeart,
  HiArrowLeft,
  HiPlus
} from 'react-icons/hi2';

// Import des hooks
import { useOeuvres } from '../hooks/useOeuvre';
import { useMetadata } from '../hooks/useMetadata';
import { useAuth } from '../hooks/useAuth';
import { Loading, Pagination } from '../components/UI';

// Types
import type { Oeuvre, Artisanat, OeuvreFilters } from '../types/oeuvre';

const ArtisanatPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { materiaux, techniques, wilayas, categories } = useMetadata();
  
  // État des filtres
  const [filters, setFilters] = useState<OeuvreFilters>({
    type: 6, // ID du type "Artisanat" - à ajuster selon votre base de données
    statut: 'publie'
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Hook pour récupérer les œuvres d'artisanat
  const {
    oeuvres,
    loading,
    error,
    pagination,
    fetchOeuvres,
    canCreateOeuvre
  } = useOeuvres();

  // Charger les œuvres d'artisanat
  useEffect(() => {
    fetchOeuvres({
      ...filters,
      page: currentPage,
      limit: viewMode === 'grid' ? 12 : 10,
      search: searchQuery
    });
  }, [filters, currentPage, viewMode, searchQuery]);

  // Styles
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

  // Fonction de formatage des détails artisanat
  const formatArtisanatDetails = (artisanat?: Artisanat) => {
    if (!artisanat) return null;
    
    const details = [];
    if (artisanat.Materiau?.nom) details.push(artisanat.Materiau.nom);
    if (artisanat.Technique?.nom) details.push(artisanat.Technique.nom);
    if (artisanat.region_origine) details.push(artisanat.region_origine);
    
    return details.join(' • ');
  };

  // Gestion de la recherche
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchOeuvres({
      ...filters,
      page: 1,
      search: searchQuery
    });
  };

  // Rendu d'une carte artisanat
  const renderArtisanatCard = (oeuvre: Oeuvre) => {
    const details = formatArtisanatDetails(oeuvre.Artisanat);
    
    return (
      <div 
        key={oeuvre.id_oeuvre}
        className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group cursor-pointer"
        onClick={() => window.location.href = `/oeuvres/${oeuvre.id_oeuvre}`}
      >
        {/* Image */}
        <div className="relative h-48 bg-gray-100 overflow-hidden">
          {oeuvre.Medias?.[0]?.url ? (
            <img 
              src={oeuvre.Medias[0].url} 
              alt={oeuvre.titre}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <HiCube className="w-12 h-12 text-gray-300" />
            </div>
          )}
          
          {/* Badge prix si disponible */}
          {oeuvre.Artisanat?.prix && (
            <div className={`absolute top-2 right-2 px-2 py-1 ${customStyles.bgAccent} text-white text-sm font-bold rounded`}>
              {oeuvre.Artisanat.prix} DA
            </div>
          )}
        </div>

        {/* Contenu */}
        <div className="p-4">
          <h3 className={`${customStyles.textPrimary} font-semibold text-lg mb-2 line-clamp-2`}>
            {oeuvre.titre}
          </h3>
          
          {details && (
            <p className={`${customStyles.textSecondary} text-sm mb-2`}>
              {details}
            </p>
          )}
          
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <HiUser className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">
                {oeuvre.Users?.[0]?.prenom} {oeuvre.Users?.[0]?.nom}
              </span>
            </div>
            
            <div className="flex items-center gap-3">
              {oeuvre.note_moyenne && (
                <div className="flex items-center gap-1">
                  <span className={customStyles.textAccent}>★</span>
                  <span className="text-gray-600">{oeuvre.note_moyenne.toFixed(1)}</span>
                </div>
              )}
              <button 
                className="text-gray-400 hover:text-red-500 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  // Logique pour ajouter aux favoris
                }}
              >
                <HiOutlineHeart className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={`min-h-screen ${customStyles.bgPrimary}`}>
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => window.history.back()}
                className={`p-2 rounded-lg ${customStyles.bgSecondary} ${customStyles.textPrimary} hover:opacity-80 transition-opacity`}
              >
                <HiArrowLeft className="w-5 h-5" />
              </button>
              <h1 className={`text-2xl font-bold ${customStyles.textPrimary}`}>
                Artisanat Algérien
              </h1>
            </div>
            
            {/* Actions */}
            <div className="flex items-center gap-4">
              {isAuthenticated && canCreateOeuvre && (
                <a
                  href="/oeuvres/nouvelle?type=artisanat"
                  className={`flex items-center gap-2 px-4 py-2 ${customStyles.bgAccent} text-white rounded-lg font-medium hover:opacity-90 transition-opacity`}
                >
                  <HiPlus className="w-5 h-5" />
                  <span>Ajouter une création</span>
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-[#0e1a13] to-[#1a2e20] text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">
              Découvrez l'Artisanat Traditionnel Algérien
            </h2>
            <p className="text-lg text-gray-200 max-w-2xl mx-auto">
              Explorez les créations uniques de nos artisans : bijoux berbères, poterie kabyle, 
              tapis traditionnels, maroquinerie et bien plus encore.
            </p>
          </div>
          
          {/* Barre de recherche */}
          <form onSubmit={handleSearch} className="mt-8 max-w-2xl mx-auto">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher par nom, artisan, matériau, technique..."
                className="w-full px-4 py-3 pr-32 rounded-lg text-gray-800 placeholder-gray-500"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowFilters(!showFilters)}
                  className={`p-2 rounded ${showFilters ? customStyles.bgAccent + ' text-white' : 'bg-gray-200 text-gray-600'} hover:opacity-80 transition-all`}
                >
                  <Filter className="w-5 h-5" />
                </button>
                <button
                  type="submit"
                  className={`px-4 py-2 ${customStyles.bgAccent} text-white rounded font-medium hover:opacity-90 transition-opacity`}
                >
                  <Search className="w-5 h-5" />
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      {/* Filtres avancés */}
      {showFilters && (
        <div className="bg-white border-b border-gray-200 py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Filtre par matériau */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Matériau
                </label>
                <select 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#eb9f13]/50"
                  onChange={(e) => setFilters({...filters, materiau: e.target.value ? parseInt(e.target.value) : undefined})}
                >
                  <option value="">Tous les matériaux</option>
                  {materiaux.map((m: any) => (
                    <option key={m.id_materiau} value={m.id_materiau}>
                      {m.nom}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filtre par technique */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Technique
                </label>
                <select 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#eb9f13]/50"
                  onChange={(e) => setFilters({...filters, technique: e.target.value ? parseInt(e.target.value) : undefined})}
                >
                  <option value="">Toutes les techniques</option>
                  {techniques.map((t: any) => (
                    <option key={t.id_technique} value={t.id_technique}>
                      {t.nom}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filtre par wilaya */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Région
                </label>
                <select 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#eb9f13]/50"
                  onChange={(e) => setFilters({...filters, wilaya: e.target.value ? parseInt(e.target.value) : undefined})}
                >
                  <option value="">Toutes les wilayas</option>
                  {wilayas.map((w: any) => (
                    <option key={w.id_wilaya} value={w.id_wilaya}>
                      {w.nom}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filtre par catégorie */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Catégorie
                </label>
                <select 
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#eb9f13]/50"
                  onChange={(e) => setFilters({...filters, categorie: e.target.value ? parseInt(e.target.value) : undefined})}
                >
                  <option value="">Toutes les catégories</option>
                  {categories.filter((c: any) => ['Bijoux', 'Poterie', 'Tissage', 'Maroquinerie', 'Bois', 'Métal'].includes(c.nom))
                    .map((c: any) => (
                      <option key={c.id_categorie} value={c.id_categorie}>
                        {c.nom}
                      </option>
                    ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Statistiques rapides */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className={`${customStyles.bgSecondary} rounded-lg p-4 text-center`}>
            <HiOutlineSparkles className={`w-8 h-8 ${customStyles.textAccent} mx-auto mb-2`} />
            <p className="text-2xl font-bold">{pagination.total}</p>
            <p className="text-sm text-gray-600">Créations artisanales</p>
          </div>
          <div className={`${customStyles.bgSecondary} rounded-lg p-4 text-center`}>
            <HiUser className={`w-8 h-8 ${customStyles.textAccent} mx-auto mb-2`} />
            <p className="text-2xl font-bold">{new Set(oeuvres.map(o => o.saisi_par)).size}</p>
            <p className="text-sm text-gray-600">Artisans</p>
          </div>
          <div className={`${customStyles.bgSecondary} rounded-lg p-4 text-center`}>
            <HiMapPin className={`w-8 h-8 ${customStyles.textAccent} mx-auto mb-2`} />
            <p className="text-2xl font-bold">{new Set(oeuvres.map(o => o.Artisanat?.region_origine).filter(Boolean)).size}</p>
            <p className="text-sm text-gray-600">Régions représentées</p>
          </div>
          <div className={`${customStyles.bgSecondary} rounded-lg p-4 text-center`}>
            <HiTag className={`w-8 h-8 ${customStyles.textAccent} mx-auto mb-2`} />
            <p className="text-2xl font-bold">{new Set(oeuvres.flatMap(o => o.Categories?.map(c => c.id_categorie) || [])).size}</p>
            <p className="text-sm text-gray-600">Catégories</p>
          </div>
        </div>
      </div>

      {/* Liste des œuvres */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {/* Contrôles d'affichage */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-gray-600">
            {pagination.total} création{pagination.total > 1 ? 's' : ''} trouvée{pagination.total > 1 ? 's' : ''}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? customStyles.bgAccent + ' text-white' : 'bg-gray-200 text-gray-600'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? customStyles.bgAccent + ' text-white' : 'bg-gray-200 text-gray-600'}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Affichage des résultats */}
        {loading ? (
          <Loading />
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600 mb-4">{error}</p>
            <button 
              onClick={() => fetchOeuvres(filters)}
              className={`px-4 py-2 ${customStyles.bgAccent} text-white rounded-lg font-medium`}
            >
              Réessayer
            </button>
          </div>
        ) : oeuvres.length === 0 ? (
          <div className="text-center py-12">
            <HiCube className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">Aucune création artisanale trouvée</p>
            {isAuthenticated && canCreateOeuvre && (
              <a
                href="/oeuvres/nouvelle?type=artisanat"
                className={`inline-flex items-center gap-2 px-4 py-2 ${customStyles.bgAccent} text-white rounded-lg font-medium`}
              >
                <HiPlus className="w-5 h-5" />
                <span>Ajouter la première création</span>
              </a>
            )}
          </div>
        ) : (
          <>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {oeuvres.map(renderArtisanatCard)}
              </div>
            ) : (
              <div className="space-y-4">
                {oeuvres.map((oeuvre) => (
                  <div 
                    key={oeuvre.id_oeuvre}
                    className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 flex gap-4 cursor-pointer"
                    onClick={() => window.location.href = `/oeuvres/${oeuvre.id_oeuvre}`}
                  >
                    {/* Image */}
                    <div className="w-32 h-32 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {oeuvre.Medias?.[0]?.url ? (
                        <img 
                          src={oeuvre.Medias[0].url} 
                          alt={oeuvre.titre}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <HiCube className="w-8 h-8 text-gray-300" />
                        </div>
                      )}
                    </div>
                    
                    {/* Détails */}
                    <div className="flex-1">
                      <h3 className={`${customStyles.textPrimary} font-semibold text-lg mb-1`}>
                        {oeuvre.titre}
                      </h3>
                      <p className={`${customStyles.textSecondary} text-sm mb-2`}>
                        {formatArtisanatDetails(oeuvre.Artisanat)}
                      </p>
                      <p className="text-gray-600 text-sm line-clamp-2 mb-2">
                        {oeuvre.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <HiUser className="w-4 h-4" />
                            {oeuvre.Users?.[0]?.prenom} {oeuvre.Users?.[0]?.nom}
                          </span>
                          <span className="flex items-center gap-1">
                            <HiClock className="w-4 h-4" />
                            {new Date(oeuvre.date_creation).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                        {oeuvre.Artisanat?.prix && (
                          <span className={`${customStyles.textAccent} font-bold`}>
                            {oeuvre.Artisanat.prix} DA
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="mt-8">
                <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.totalPages}
                  onPageChange={setCurrentPage}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ArtisanatPage;