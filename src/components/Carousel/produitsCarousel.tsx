// components/Carousel/ProductCarousel.tsx
import React, { useState } from 'react';
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi';

const slides = [
  {
    id: 1,
    image: '/images/logo.png',
    titre: 'Offre Spéciale Été',
    texte: 'Profitez de -30% sur toute la boutique jusqu\'au 31 août !',
    lien: '/promotions'
  },
  {
    id: 2,
    image: '/images/home.png',
    titre: 'Nouveautés',
    texte: 'Découvrez nos nouveaux produits tendance.',
    lien: '/nouveautes'
  },
  {
    id: 3,
    image: '/images/welcome.png',
    titre: 'Livraison offerte',
    texte: 'Livraison gratuite dès 50€ d\'achat.',
    lien: '/livraison'
  }
];

const ProductCarousel: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => setCurrentSlide((currentSlide + 1) % slides.length);
  const prevSlide = () => setCurrentSlide((currentSlide - 1 + slides.length) % slides.length);
  const goToSlide = (index: number) => setCurrentSlide(index);

  const current = slides[currentSlide];

  return (
    <div className="relative h-[280px] w-full max-w-2xl mx-auto rounded-lg overflow-hidden shadow-md mb-8">
      {/* Image de fond */}
      <img
        src={current.image}
        alt={current.titre}
        className="w-full h-full object-cover"
        style={{ objectPosition: 'center' }}
      />
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
      {/* Contenu */}
      <div className="absolute left-4 bottom-6 z-10 text-white max-w-xs">
        <h2 className="text-xl font-bold mb-1">{current.titre}</h2>
        <p className="text-sm mb-2">{current.texte}</p>
        <a
          href={current.lien}
          className="inline-block px-4 py-1 bg-yellow-400 text-green-900 font-semibold rounded hover:bg-yellow-300 transition text-sm"
        >
          Découvrir
        </a>
      </div>
      {/* Contrôles */}
      <button
        onClick={prevSlide}
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 text-white p-1 rounded-full hover:bg-black/70 transition"
        aria-label="Précédent"
        style={{ width: 32, height: 32 }}
      >
        <HiChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 text-white p-1 rounded-full hover:bg-black/70 transition"
        aria-label="Suivant"
        style={{ width: 32, height: 32 }}
      >
        <HiChevronRight className="h-5 w-5" />
      </button>
      {/* Indicateurs */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => goToSlide(idx)}
            className={`w-2.5 h-2.5 rounded-full ${idx === currentSlide ? 'bg-yellow-400' : 'bg-white/50'} transition`}
            aria-label={`Aller à la slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default ProductCarousel;