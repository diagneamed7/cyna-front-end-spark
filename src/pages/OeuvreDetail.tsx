import React, { useState, useEffect } from 'react';
import {
  HiHeart,
  HiBookmark,
  HiShare,
  HiStar,
  HiEye,
  HiChatBubbleBottomCenterText,
  HiCalendar,
  HiMapPin,
  HiUser,
  HiBookOpen,
  HiFilm,
  HiMusicalNote,
  HiCamera,
  HiTrophy,
  HiArrowLeft,
  HiArrowDownTray,
  HiFlag,
  HiHandThumbUp,
  HiHandThumbDown,
  HiEllipsisVertical,
  HiPencilSquare,
  HiTrash,
  HiArrowTopRightOnSquare,
  HiPlayCircle,
  HiSpeakerWave,
  HiTag,
  HiClock,
  HiGlobeAlt,
  HiUsers,
  HiChevronLeft,
  HiChevronRight,
  HiXMark,
  HiPaperAirplane,
  HiArrowUturnLeft
} from 'react-icons/hi2';


// =============================================================================
// DONNÉES SIMULÉES
// =============================================================================

const oeuvreData = {
  id_oeuvre: 1,
  titre: "L'Étranger",
  description: "Roman philosophique d'Albert Camus, publié en 1942. L'œuvre explore les thèmes de l'absurde, de l'aliénation et de la condition humaine dans l'Algérie coloniale. À travers le personnage de Meursault, Camus questionne les conventions sociales et morales de son époque.",
  annee_creation: 1942,
  statut: 'publie',
  date_creation: '2024-01-15T10:30:00',
  date_modification: '2024-02-20T14:45:00',
  note_moyenne: 4.8,
  nombre_vues: 2547,
  nombre_commentaires: 89,
  nombre_favoris: 234,
  TypeOeuvre: { 
    id_type_oeuvre: 1,
    nom_type: 'Livre',
    description: 'Œuvre littéraire publiée'
  },
  Langue: { 
    id_langue: 5,
    nom: 'Français', 
    code: 'fr' 
  },
  Categories: [
    { id_categorie: 1, nom: 'Roman' },
    { id_categorie: 4, nom: 'Philosophie' },
    { id_categorie: 8, nom: 'Littérature algérienne' }
  ],
  TagMotCles: [
    { nom: 'existentialisme' },
    { nom: 'absurde' },
    { nom: 'colonisation' },
    { nom: 'identité' }
  ],
  Users: [
    { 
      id_user: 1,
      nom: 'Camus', 
      prenom: 'Albert',
      role_dans_oeuvre: 'auteur',
      role_principal: true,
      bio: 'Écrivain, philosophe, romancier, dramaturge, essayiste et nouvelliste français.'
    }
  ],
  Saiseur: {
    id_user: 5,
    nom: 'Benali',
    prenom: 'Yasmine',
    type_user: 'chercheur'
  },
  images: [
    'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800',
    'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800'
  ],
  Livre: {
    isbn: '978-2-07-036002-1',
    nb_pages: 185,
    editeur_original: 'Gallimard',
    premiere_edition: '1942-06-19',
    traductions: ['Arabe', 'Tamazight', 'Anglais', 'Espagnol']
  },
  Evenements: [
    {
      id_evenement: 1,
      nom_evenement: 'Colloque Albert Camus',
      date_debut: '2025-07-15T09:00:00',
      Lieu: { nom: 'Université d\'Alger', Wilaya: { nom: 'Alger' } }
    }
  ],
  CritiquesEvaluations: [
    {
      id_critique: 1,
      note: 5,
      commentaire: 'Chef-d\'œuvre intemporel de la littérature française et algérienne.',
      date_creation: '2024-03-01T16:20:00',
      User: { nom: 'Messaoud', prenom: 'Rachid', type_user: 'critique' }
    }
  ]
};

const commentaires = [
  {
    id_commentaire: 1,
    contenu: 'Une œuvre magistrale qui résonne encore aujourd\'hui. La manière dont Camus explore l\'absurdité de l\'existence à travers Meursault est brillante.',
    note_qualite: 5,
    date_creation: '2024-05-20T14:30:00',
    User: { nom: 'Bencheikh', prenom: 'Amina', type_user: 'lecteur' },
    likes: 12,
    dislikes: 0,
    Reponses: [
      {
        id_commentaire: 2,
        contenu: 'Exactement ! Et le contexte algérien ajoute une dimension particulière à cette réflexion.',
        date_creation: '2024-05-20T15:45:00',
        User: { nom: 'Khelifi', prenom: 'Omar', type_user: 'etudiant' },
        likes: 3,
        dislikes: 0
      }
    ]
  },
  {
    id_commentaire: 3,
    contenu: 'Lecture obligatoire pour comprendre la philosophie de l\'absurde. Camus maîtrise parfaitement son art.',
    note_qualite: 5,
    date_creation: '2024-05-19T09:15:00',
    User: { nom: 'Saadi', prenom: 'Leila', type_user: 'professeur' },
    likes: 8,
    dislikes: 1,
    Reponses: []
  }
];

// =============================================================================
// COMPOSANT PRINCIPAL
// =============================================================================

const OeuvreDetail: React.FC = () => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [activeTab, setActiveTab] = useState('description');
  const [newComment, setNewComment] = useState('');
  const [commentRating, setCommentRating] = useState(0);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [expandedComments, setExpandedComments] = useState<Set<number>>(new Set());

  // Icône du type d'œuvre
  const getTypeIcon = () => {
    switch (oeuvreData.TypeOeuvre.nom_type.toLowerCase()) {
      case 'livre': return HiBookmark;
      case 'film': return HiFilm;
      case 'album musical': return HiMusicalNote;
      case 'photographie': return HiCamera;
      case 'artisanat': return HiTrophy;
      default: return HiBookmark;
    }
  };

  const TypeIcon = getTypeIcon();

  // Navigation entre images
  const nextImage = () => {
    setCurrentImageIndex((prev) => 
      prev === oeuvreData.images.length - 1 ? 0 : prev + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => 
      prev === 0 ? oeuvreData.images.length - 1 : prev - 1
    );
  };

  // Soumission de commentaire
  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;

    setIsSubmittingComment(true);
    try {
      // Simulation d'envoi - en réalité appel à votre API
      await new Promise(resolve => setTimeout(resolve, 1000));
      setNewComment('');
      setCommentRating(0);
      // Ici vous rechargeriez les commentaires
    } catch (error) {
      console.error('Erreur lors de l\'ajout du commentaire:', error);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // Formatage des dates
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', { 
      day: '2-digit', 
      month: 'long', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Rendu des onglets
  const tabs = [
    { id: 'description', name: 'Description', count: null },
    { id: 'details', name: 'Détails', count: null },
    { id: 'commentaires', name: 'Commentaires', count: oeuvreData.nombre_commentaires },
    { id: 'evenements', name: 'Événements', count: oeuvreData.Evenements?.length },
    { id: 'critiques', name: 'Critiques', count: oeuvreData.CritiquesEvaluations?.length }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header simple */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => window.history.back()}
                className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
              >
                <HiArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-lg font-semibold text-gray-900 truncate max-w-md">
                  {oeuvreData.titre}
                </h1>
                <p className="text-sm text-gray-500">
                  {oeuvreData.TypeOeuvre.nom_type} • {oeuvreData.annee_creation}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100">
                <HiShare size={20} />
              </button>
              <button className="p-2 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100">
                <HiEllipsisVertical size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Colonne principale */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Galerie d'images */}
            <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
              <div className="relative aspect-video bg-gray-100">
                <img 
                  src={oeuvreData.images[currentImageIndex]} 
                  alt={oeuvreData.titre}
                  className="w-full h-full object-cover cursor-pointer"
                  onClick={() => setIsImageModalOpen(true)}
                />
                
                {oeuvreData.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                    >
                      <HiChevronLeft size={20} />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                    >
                      <HiChevronRight size={20} />
                    </button>
                  </>
                )}

                {/* Indicateurs */}
                {oeuvreData.images.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                    {oeuvreData.images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-2 h-2 rounded-full transition-colors ${
                          index === currentImageIndex ? 'bg-white' : 'bg-white/50'
                        }`}
                      />
                    ))}
                  </div>
                )}

                {/* Actions rapides */}
                <div className="absolute top-4 right-4 flex space-x-2">
                  <button
                    onClick={() => setIsFavorite(!isFavorite)}
                    className={`p-2 rounded-full backdrop-blur-sm transition-colors ${
                      isFavorite 
                        ? 'bg-red-500 text-white' 
                        : 'bg-white/80 text-gray-600 hover:bg-white'
                    }`}
                  >
                    <HiHeart size={16} />
                  </button>
                  <button
                    onClick={() => setIsBookmarked(!isBookmarked)}
                    className={`p-2 rounded-full backdrop-blur-sm transition-colors ${
                      isBookmarked 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-white/80 text-gray-600 hover:bg-white'
                    }`}
                  >
                    <HiBookmark size={16} />
                  </button>
                </div>
              </div>

              {/* Vignettes */}
              {oeuvreData.images.length > 1 && (
                <div className="p-4 flex space-x-2 overflow-x-auto">
                  {oeuvreData.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                        index === currentImageIndex ? 'border-emerald-500' : 'border-gray-200'
                      }`}
                    >
                      <img 
                        src={image} 
                        alt={`${oeuvreData.titre} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Navigation par onglets */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-6">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-4 text-sm font-medium border-b-2 transition-colors ${
                        activeTab === tab.id
                          ? 'text-emerald-600 border-emerald-600'
                          : 'text-gray-500 border-transparent hover:text-gray-700'
                      }`}
                    >
                      {tab.name}
                      {tab.count !== null && (
                        <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          {tab.count}
                        </span>
                      )}
                    </button>
                  ))}
                </nav>
              </div>

              <div className="p-6">
                {/* Onglet Description */}
                {activeTab === 'description' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">À propos de cette œuvre</h3>
                      <p className="text-gray-700 leading-relaxed">{oeuvreData.description}</p>
                    </div>

                    {/* Auteurs */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Auteur(s)</h4>
                      <div className="space-y-3">
                        {oeuvreData.Users.map((auteur, index) => (
                          <div key={index} className="flex items-start space-x-3">
                            <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center text-white font-medium">
                              {auteur.prenom.charAt(0)}{auteur.nom.charAt(0)}
                            </div>
                            <div className="flex-1">
                              <h5 className="font-medium text-gray-900">
                                {auteur.prenom} {auteur.nom}
                                {auteur.role_principal && (
                                  <span className="ml-2 px-2 py-1 bg-emerald-100 text-emerald-800 text-xs rounded-full">
                                    Auteur principal
                                  </span>
                                )}
                              </h5>
                              {auteur.bio && (
                                <p className="text-sm text-gray-600 mt-1">{auteur.bio}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Tags */}
                    {oeuvreData.TagMotCles.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Mots-clés</h4>
                        <div className="flex flex-wrap gap-2">
                          {oeuvreData.TagMotCles.map((tag, index) => (
                            <span 
                              key={index}
                              className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full cursor-pointer hover:bg-blue-200 transition-colors"
                            >
                              #{tag.nom}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Onglet Détails */}
                {activeTab === 'details' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900">Informations générales</h3>
                        
                        <div className="space-y-3">
                          <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-600">Type</span>
                            <span className="font-medium flex items-center space-x-1">
                              <TypeIcon size={16} />
                              <span>{oeuvreData.TypeOeuvre.nom_type}</span>
                            </span>
                          </div>
                          
                          <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-600">Langue</span>
                            <span className="font-medium">{oeuvreData.Langue.nom}</span>
                          </div>
                          
                          <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-600">Année de création</span>
                            <span className="font-medium">{oeuvreData.annee_creation}</span>
                          </div>
                          
                          <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-600">Statut</span>
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                              {oeuvreData.statut === 'publie' ? 'Publié' : oeuvreData.statut}
                            </span>
                          </div>
                          
                          <div className="flex justify-between py-2 border-b border-gray-100">
                            <span className="text-gray-600">Ajouté par</span>
                            <span className="font-medium">
                              {oeuvreData.Saiseur.prenom} {oeuvreData.Saiseur.nom}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Détails spécifiques au livre */}
                      {oeuvreData.Livre && (
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-gray-900">Détails du livre</h3>
                          
                          <div className="space-y-3">
                            <div className="flex justify-between py-2 border-b border-gray-100">
                              <span className="text-gray-600">ISBN</span>
                              <span className="font-medium font-mono text-sm">{oeuvreData.Livre.isbn}</span>
                            </div>
                            
                            <div className="flex justify-between py-2 border-b border-gray-100">
                              <span className="text-gray-600">Pages</span>
                              <span className="font-medium">{oeuvreData.Livre.nb_pages}</span>
                            </div>
                            
                            <div className="flex justify-between py-2 border-b border-gray-100">
                              <span className="text-gray-600">Éditeur original</span>
                              <span className="font-medium">{oeuvreData.Livre.editeur_original}</span>
                            </div>
                            
                            <div className="flex justify-between py-2 border-b border-gray-100">
                              <span className="text-gray-600">Première édition</span>
                              <span className="font-medium">
                                {new Date(oeuvreData.Livre.premiere_edition).toLocaleDateString('fr-FR')}
                              </span>
                            </div>
                          </div>

                          {oeuvreData.Livre.traductions && (
                            <div>
                              <h4 className="font-medium text-gray-900 mb-2">Traductions disponibles</h4>
                              <div className="flex flex-wrap gap-2">
                                {oeuvreData.Livre.traductions.map((langue, index) => (
                                  <span 
                                    key={index}
                                    className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                                  >
                                    {langue}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Catégories */}
                    {oeuvreData.Categories.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 mb-3">Catégories</h4>
                        <div className="flex flex-wrap gap-2">
                          {oeuvreData.Categories.map((categorie, index) => (
                            <span 
                              key={index}
                              className="px-3 py-1 bg-emerald-100 text-emerald-800 text-sm rounded-full"
                            >
                              {categorie.nom}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Dates */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-3">Historique</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center space-x-2 text-gray-600">
                          <HiClock size={14} />
                          <span>Ajouté le {formatDate(oeuvreData.date_creation)}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-gray-600">
                          <HiClock size={14} />
                          <span>Modifié le {formatDate(oeuvreData.date_modification)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Onglet Commentaires */}
                {activeTab === 'commentaires' && (
                  <div className="space-y-6">
                    {/* Formulaire d'ajout de commentaire */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-medium text-gray-900 mb-4">Ajouter un commentaire</h3>
                      
                      {/* Notation */}
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Votre note</label>
                        <div className="flex space-x-1">
                          {[1, 2, 3, 4, 5].map((rating) => (
                            <button
                              key={rating}
                              onClick={() => setCommentRating(rating)}
                              className={`p-1 transition-colors ${
                                rating <= commentRating ? 'text-yellow-400' : 'text-gray-300'
                              }`}
                            >
                              <HiStar size={20} className="fill-current" />
                            </button>
                          ))}
                        </div>
                      </div>

                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder="Partagez votre avis sur cette œuvre..."
                      />
                      
                      <div className="flex justify-end mt-3">
                        <button
                          onClick={handleSubmitComment}
                          disabled={isSubmittingComment || !newComment.trim()}
                          className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isSubmittingComment ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <HiPaperAirplane size={16} />
                          )}
                          <span>Publier</span>
                        </button>
                      </div>
                    </div>

                    {/* Liste des commentaires */}
                    <div className="space-y-4">
                      {commentaires.map((commentaire) => (
                        <div key={commentaire.id_commentaire} className="bg-white border border-gray-200 rounded-lg p-4">
                          <div className="flex items-start space-x-3">
                            <div className="w-10 h-10 bg-emerald-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                              {commentaire.User.prenom.charAt(0)}{commentaire.User.nom.charAt(0)}
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="font-medium text-gray-900">
                                  {commentaire.User.prenom} {commentaire.User.nom}
                                </span>
                                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                  {commentaire.User.type_user}
                                </span>
                                {commentaire.note_qualite && (
                                  <div className="flex items-center space-x-1">
                                    {[...Array(commentaire.note_qualite)].map((_, i) => (
                                      <HiStar key={i} size={12} className="text-yellow-400 fill-current" />
                                    ))}
                                  </div>
                                )}
                              </div>
                              
                              <p className="text-gray-700 mb-2">{commentaire.contenu}</p>
                              
                              <div className="flex items-center space-x-4 text-sm text-gray-500">
                                <span>{formatDate(commentaire.date_creation)}</span>
                                
                                <button className="flex items-center space-x-1 hover:text-emerald-600">
                                  <HiHandThumbDown size={14} />
                                  <span>{commentaire.likes}</span>
                                </button>
                                
                                <button className="flex items-center space-x-1 hover:text-emerald-600">
                                  <HiArrowUturnLeft size={14} />
                                  <span>Répondre</span>
                                </button>
                              </div>

                              {/* Réponses */}
                              {commentaire.Reponses.length > 0 && (
                                <div className="mt-4 pl-4 border-l-2 border-gray-100 space-y-3">
                                  {commentaire.Reponses.map((reponse) => (
                                    <div key={reponse.id_commentaire} className="flex items-start space-x-3">
                                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                                        {reponse.User.prenom.charAt(0)}{reponse.User.nom.charAt(0)}
                                      </div>
                                      <div className="flex-1">
                                        <div className="flex items-center space-x-2 mb-1">
                                          <span className="font-medium text-gray-900 text-sm">
                                            {reponse.User.prenom} {reponse.User.nom}
                                          </span>
                                          <span className="text-xs text-gray-500">{formatDate(reponse.date_creation)}</span>
                                        </div>
                                        <p className="text-gray-700 text-sm">{reponse.contenu}</p>
                                        <button className="flex items-center space-x-1 text-xs text-gray-500 mt-1 hover:text-emerald-600">
                                          <HiArrowDownTray size={12} />
                                          <span>{reponse.likes}</span>
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Onglet Événements */}
                {activeTab === 'evenements' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Événements liés</h3>
                    {oeuvreData.Evenements && oeuvreData.Evenements.length > 0 ? (
                      <div className="space-y-3">
                        {oeuvreData.Evenements.map((evenement) => (
                          <div key={evenement.id_evenement} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                            <HiCalendar size={20} className="text-emerald-600" />
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900">{evenement.nom_evenement}</h4>
                              <p className="text-sm text-gray-600">
                                {new Date(evenement.date_debut).toLocaleDateString('fr-FR')} • {evenement.Lieu.nom}, {evenement.Lieu.Wilaya.nom}
                              </p>
                            </div>
                            <button className="p-2 text-emerald-600 hover:bg-emerald-100 rounded-lg">
                              <HiArrowTopRightOnSquare size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-8">Aucun événement lié à cette œuvre.</p>
                    )}
                  </div>
                )}

                {/* Onglet Critiques */}
                {activeTab === 'critiques' && (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Critiques professionnelles</h3>
                    {oeuvreData.CritiquesEvaluations && oeuvreData.CritiquesEvaluations.length > 0 ? (
                      <div className="space-y-4">
                        {oeuvreData.CritiquesEvaluations.map((critique) => (
                          <div key={critique.id_critique} className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                                  {critique.User.prenom.charAt(0)}{critique.User.nom.charAt(0)}
                                </div>
                                <div>
                                  <h4 className="font-medium text-gray-900">
                                    {critique.User.prenom} {critique.User.nom}
                                  </h4>
                                  <p className="text-sm text-gray-600 capitalize">{critique.User.type_user}</p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-1">
                                {[...Array(critique.note)].map((_, i) => (
                                  <HiStar key={i} size={16} className="text-yellow-400 fill-current" />
                                ))}
                              </div>
                            </div>
                            <p className="text-gray-700">{critique.commentaire}</p>
                            <p className="text-sm text-gray-500 mt-2">{formatDate(critique.date_creation)}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-8">Aucune critique professionnelle disponible.</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            
            {/* Statistiques */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistiques</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <HiStar size={16} className="text-yellow-400" />
                    <span className="text-gray-600">Note moyenne</span>
                  </div>
                  <span className="font-semibold text-gray-900">{oeuvreData.note_moyenne}/5</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <HiEye size={16} className="text-blue-500" />
                    <span className="text-gray-600">Vues</span>
                  </div>
                  <span className="font-semibold text-gray-900">{oeuvreData.nombre_vues.toLocaleString()}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <HiChatBubbleBottomCenterText size={16} className="text-green-500" />
                    <span className="text-gray-600">Commentaires</span>
                  </div>
                  <span className="font-semibold text-gray-900">{oeuvreData.nombre_commentaires}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <HiHeart size={16} className="text-red-500" />
                    <span className="text-gray-600">Favoris</span>
                  </div>
                  <span className="font-semibold text-gray-900">{oeuvreData.nombre_favoris}</span>
                </div>
              </div>
            </div>

            {/* Actions rapides */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Actions</h3>
              <div className="space-y-3">
                <button 
                  onClick={() => setIsFavorite(!isFavorite)}
                  className={`w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    isFavorite 
                      ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <HiHeart size={16} />
                  <span>{isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}</span>
                </button>
                
                <button 
                  onClick={() => setIsBookmarked(!isBookmarked)}
                  className={`w-full flex items-center justify-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                    isBookmarked 
                      ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <HiBookmark size={16} />
                  <span>{isBookmarked ? 'Mis de côté' : 'Mettre de côté'}</span>
                </button>
                
                <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                  <HiShare size={16} />
                  <span>Partager</span>
                </button>
                
                <button className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                  <HiArrowDownTray size={16} />
                  <span>Exporter</span>
                </button>
              </div>
            </div>

            {/* Œuvres similaires */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Œuvres similaires</h3>
              <div className="space-y-3">
                {[
                  { titre: 'La Peste', auteur: 'Albert Camus', note: 4.7 },
                  { titre: 'Nedjma', auteur: 'Kateb Yacine', note: 4.5 },
                  { titre: 'Le Fils du pauvre', auteur: 'Mouloud Feraoun', note: 4.3 }
                ].map((oeuvre, index) => (
                  <div key={index} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                    <div className="w-12 h-16 bg-gray-200 rounded flex items-center justify-center">
                      <HiBookOpen size={16} className="text-gray-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 text-sm">{oeuvre.titre}</h4>
                      <p className="text-xs text-gray-600">{oeuvre.auteur}</p>
                      <div className="flex items-center space-x-1 mt-1">
                        <HiStar size={12} className="text-yellow-400 fill-current" />
                        <span className="text-xs text-gray-500">{oeuvre.note}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal image */}
      {isImageModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50" onClick={() => setIsImageModalOpen(false)}>
          <div className="relative max-w-4xl max-h-full p-4">
            <button
              onClick={() => setIsImageModalOpen(false)}
              className="absolute top-4 right-4 text-white bg-black/50 rounded-full p-2 hover:bg-black/70 transition-colors z-10"
            >
              <HiXMark size={20} />
            </button>
            <img 
              src={oeuvreData.images[currentImageIndex]} 
              alt={oeuvreData.titre}
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            {oeuvreData.images.length > 1 && (
              <>
                <button
                  onClick={(e) => { e.stopPropagation(); prevImage(); }}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white bg-black/50 rounded-full p-3 hover:bg-black/70 transition-colors"
                >
                  <HiChevronLeft size={24} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); nextImage(); }}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white bg-black/50 rounded-full p-3 hover:bg-black/70 transition-colors"
                >
                  <HiChevronRight size={24} />
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default OeuvreDetail;