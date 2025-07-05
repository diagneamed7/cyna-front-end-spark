// components/DetailLieu.tsx - Composant pour afficher les détails d'un lieu patrimonial

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  HiMap, 
  HiClock, 
  HiInformationCircle,
  HiPhotograph,
  HiTicket,
  HiTranslate,
  HiArrowLeft,
  HiStar,
  HiCalendar
} from 'react-icons/hi';
import { FaWheelchair, FaParking, FaWifi } from 'react-icons/fa';

import { usePatrimoine } from '../hooks/usePatrimones';
import { useAuth } from '../hooks/useAuth';
import { Loading } from '../components/UI';
import type { Lieu, Monument, Vestige, Service } from '../types/place';

const DetailLieu: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { getSite, loading, error } = usePatrimoine();
  
  const [lieu, setLieu] = useState<Lieu | null>(null);
  const [activeTab, setActiveTab] = useState<'description' | 'histoire' | 'infos' | 'medias'>('description');

  useEffect(() => {
    const fetchLieu = async () => {
      if (id) {
        const site = await getSite(parseInt(id));
        setLieu(site);
      }
    };
    fetchLieu();
  }, [id, getSite]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loading text="Chargement du site patrimonial..." />
      </div>
    );
  }

  if (error || !lieu) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <HiInformationCircle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Site non trouvé</h2>
        <p className="text-gray-600 mb-6">{error || "Le site patrimonial demandé n'existe pas."}</p>
        <button
          onClick={() => navigate('/patrimoine')}
          className="px-6 py-3 bg-[#39e079] text-[#0e1a13] rounded-lg font-bold hover:opacity-90"
        >
          Retour aux sites
        </button>
      </div>
    );
  }

  // ✅ ACCÈS CORRECT À LA DESCRIPTION
  const description = lieu.DetailLieu?.description;
  const histoire = lieu.DetailLieu?.histoire;
  const horaires = lieu.DetailLieu?.horaires;
  const tarifEntree = lieu.DetailLieu?.tarif_entree;
  const accessibilite = lieu.DetailLieu?.accessibilite;
  const visiteGuidee = lieu.DetailLieu?.visite_guidee_disponible;
  const languesVisite = lieu.DetailLieu?.langues_visite || [];
  const noteMoyenne = lieu.DetailLieu?.noteMoyenne;
  const monuments = lieu.DetailLieu?.Monuments || [];
  const vestiges = lieu.DetailLieu?.Vestiges || [];

  // Fonction pour obtenir l'image principale
  const getImagePrincipale = () => {
    const firstMedia = lieu.LieuMedias?.[0];
    return firstMedia?.url || 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800';
  };

  // Fonction pour formater l'adresse complète
  const formatAdresseComplete = () => {
    const parties = [
      lieu.adresse,
      lieu.Commune?.nom,
      lieu.Daira?.nom,
      lieu.Wilaya?.nom
    ].filter(Boolean);
    return parties.join(', ');
  };

  // Fonction pour déterminer le type de patrimoine
  const getTypePatrimoine = () => {
    if (monuments.length > 0) return 'Monument historique';
    if (vestiges.length > 0) return 'Site archéologique';
    return 'Site culturel';
  };

  // Fonction pour obtenir l'icône d'accessibilité
  const getAccessibiliteIcon = () => {
    switch (accessibilite) {
      case 'total': return <FaWheelchair className="text-green-600" />;
      case 'partiel': return <FaWheelchair className="text-orange-600" />;
      case 'limite': return <FaWheelchair className="text-red-600" />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fbfa]">
      {/* Header avec image */}
      <div className="relative h-96 bg-gray-900">
        <img
          src={getImagePrincipale()}
          alt={lieu.nom}
          className="w-full h-full object-cover opacity-80"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        
        {/* Bouton retour */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 p-2 bg-white/20 backdrop-blur rounded-full text-white hover:bg-white/30 transition-colors"
        >
          <HiArrowLeft className="w-6 h-6" />
        </button>

        {/* Informations principales */}
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="max-w-6xl mx-auto">
            <span className="inline-block px-3 py-1 bg-[#39e079] text-[#0e1a13] rounded-full text-sm font-medium mb-3">
              {getTypePatrimoine()}
            </span>
            <h1 className="text-4xl font-bold text-white mb-2">{lieu.nom}</h1>
            <div className="flex items-center gap-4 text-white/90">
              <div className="flex items-center gap-1">
                <HiMap className="w-5 h-5" />
                <span>{formatAdresseComplete()}</span>
              </div>
              {noteMoyenne && (
                <div className="flex items-center gap-1">
                  <HiStar className="w-5 h-5 text-yellow-400" />
                  <span>{noteMoyenne.toFixed(1)}/5</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation par onglets */}
      <div className="sticky top-0 bg-white border-b z-10">
        <div className="max-w-6xl mx-auto px-8">
          <nav className="flex gap-8">
            {['description', 'histoire', 'infos', 'medias'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`py-4 px-2 border-b-2 font-medium transition-colors ${
                  activeTab === tab
                    ? 'border-[#39e079] text-[#39e079]'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-6xl mx-auto px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Colonne principale */}
          <div className="lg:col-span-2">
            {activeTab === 'description' && (
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h2 className="text-2xl font-bold text-[#0e1a13] mb-4">À propos</h2>
                <div className="prose prose-lg text-gray-700">
                  <p>{description || "Aucune description disponible pour ce site."}</p>
                </div>

                {/* Monuments */}
                {monuments.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-xl font-bold text-[#0e1a13] mb-4">Monuments</h3>
                    <div className="space-y-4">
                      {monuments.map((monument: Monument) => (
                        <div key={monument.id} className="border-l-4 border-[#39e079] pl-4">
                          <h4 className="font-semibold text-lg">{monument.nom}</h4>
                          <p className="text-gray-600 mt-1">{monument.description}</p>
                          <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
                            <span>Type: {monument.type}</span>
                            {monument.date_construction && (
                              <span>Construction: {monument.date_construction}</span>
                            )}
                            {monument.style && <span>Style: {monument.style}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Vestiges */}
                {vestiges.length > 0 && (
                  <div className="mt-8">
                    <h3 className="text-xl font-bold text-[#0e1a13] mb-4">Vestiges archéologiques</h3>
                    <div className="space-y-4">
                      {vestiges.map((vestige: Vestige) => (
                        <div key={vestige.id} className="border-l-4 border-[#51946b] pl-4">
                          <h4 className="font-semibold text-lg">{vestige.nom}</h4>
                          <p className="text-gray-600 mt-1">{vestige.description}</p>
                          <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
                            <span>Type: {vestige.type}</span>
                            {vestige.civilisation && (
                              <span>Civilisation: {vestige.civilisation}</span>
                            )}
                            {vestige.periode_estimation && (
                              <span>Période: {vestige.periode_estimation}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'histoire' && (
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h2 className="text-2xl font-bold text-[#0e1a13] mb-4">Histoire</h2>
                <div className="prose prose-lg text-gray-700">
                  <p>{histoire || "L'histoire de ce site n'est pas encore documentée."}</p>
                </div>
                
                {lieu.DetailLieu?.referencesHistoriques && (
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold text-gray-800 mb-2">Références historiques</h3>
                    <p className="text-gray-600 text-sm">{lieu.DetailLieu.referencesHistoriques}</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'infos' && (
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h2 className="text-2xl font-bold text-[#0e1a13] mb-4">Informations pratiques</h2>
                
                <div className="space-y-6">
                  {/* Horaires */}
                  <div>
                    <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                      <HiClock className="w-5 h-5 text-[#39e079]" />
                      Horaires d'ouverture
                    </h3>
                    <p className="text-gray-700">{horaires || "Horaires non spécifiés"}</p>
                  </div>

                  {/* Tarifs */}
                  <div>
                    <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                      <HiTicket className="w-5 h-5 text-[#39e079]" />
                      Tarifs
                    </h3>
                    <p className="text-gray-700">
                      {tarifEntree ? `${tarifEntree} DA` : "Entrée gratuite"}
                    </p>
                  </div>

                  {/* Services */}
                  {lieu.Services && lieu.Services.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Services disponibles</h3>
                      <div className="grid grid-cols-2 gap-3">
                        {lieu.Services.map((service: Service) => (
                          <div key={service.id} className="flex items-center gap-2 text-gray-700">
                            <span className="w-2 h-2 bg-[#39e079] rounded-full" />
                            {service.nom}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Accessibilité */}
                  <div>
                    <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                      {getAccessibiliteIcon()}
                      Accessibilité
                    </h3>
                    <p className="text-gray-700">
                      {accessibilite === 'total' && "Accessibilité totale pour personnes à mobilité réduite"}
                      {accessibilite === 'partiel' && "Accessibilité partielle"}
                      {accessibilite === 'limite' && "Accessibilité limitée"}
                      {!accessibilite && "Information non disponible"}
                    </p>
                  </div>

                  {/* Visites guidées */}
                  {visiteGuidee && (
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Visites guidées</h3>
                      <p className="text-gray-700">Visites guidées disponibles</p>
                      {languesVisite.length > 0 && (
                        <div className="mt-2">
                          <span className="text-sm text-gray-600">Langues: </span>
                          {languesVisite.join(', ')}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'medias' && (
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h2 className="text-2xl font-bold text-[#0e1a13] mb-4">Galerie</h2>
                
                {lieu.LieuMedias && lieu.LieuMedias.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {lieu.LieuMedias.map((media) => (
                      <div key={media.id} className="relative group">
                        <img
                          src={media.url}
                          alt={media.titre || lieu.nom}
                          className="w-full h-48 object-cover rounded-lg"
                        />
                        {media.legende && (
                          <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-2 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity">
                            <p className="text-sm">{media.legende}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">Aucune photo disponible pour ce site.</p>
                )}
              </div>
            )}
          </div>

          {/* Colonne latérale */}
          <div className="space-y-6">
            {/* Carte de localisation */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-bold text-[#0e1a13] mb-4">Localisation</h3>
              <div className="aspect-square bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                <HiMap className="w-12 h-12 text-gray-400" />
              </div>
              <button className="w-full px-4 py-2 bg-[#39e079] text-[#0e1a13] rounded-lg font-medium hover:opacity-90">
                Voir sur la carte
              </button>
            </div>

            {/* Événements à venir */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-bold text-[#0e1a13] mb-4">Événements à venir</h3>
              {lieu.Evenements && lieu.Evenements.length > 0 ? (
                <div className="space-y-3">
                  {lieu.Evenements.slice(0, 3).map((event) => (
                    <div key={event.id_evenement} className="border-l-4 border-[#51946b] pl-3">
                      <h4 className="font-medium text-sm">{event.nom_evenement}</h4>
                      <div className="flex items-center gap-1 text-xs text-gray-600 mt-1">
                        <HiCalendar className="w-3 h-3" />
                        <span>{new Date(event.date_debut || '').toLocaleDateString('fr-FR')}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 text-sm">Aucun événement prévu</p>
              )}
            </div>

            {/* Actions */}
            {isAuthenticated && (
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-bold text-[#0e1a13] mb-4">Actions</h3>
                <div className="space-y-3">
                  <button className="w-full px-4 py-2 border border-[#39e079] text-[#39e079] rounded-lg font-medium hover:bg-[#39e079] hover:text-white transition-colors">
                    Ajouter aux favoris
                  </button>
                  <button className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors">
                    Signaler une erreur
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailLieu;