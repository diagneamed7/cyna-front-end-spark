import React from 'react';

const MentionsLegales = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10 bg-gradient-to-br from-[#f0f8ff] to-white text-[#333] font-sans">
      <h1 className="text-3xl font-bold text-[#eb9f13] mb-6 relative animate-fadeInUp">
        Mentions légales
        <span className="block w-16 h-1 bg-[#eb9f13] mt-2 rounded"></span>
      </h1>

      <h2 className="text-2xl font-semibold text-[#eb9f13] mt-8 mb-2 animate-fadeInUp delay-100">Éditeur du site</h2>
      <p className="mb-4 animate-fadeInUp delay-100">
        Nom de l’entreprise : <strong className="text-[#eb9f13]">CYNA</strong><br />
        Forme juridique : SAS<br />
        Siège social : Adresse complète<br />
        SIRET : XXXXXXXX XXXXX<br />
        Responsable de publication : Nom et prénom<br />
        Email de contact : contact@cyna.com
      </p>

      <h2 className="text-2xl font-semibold text-[#eb9f13] mt-8 mb-2 animate-fadeInUp delay-200">Hébergeur</h2>
      <p className="mb-4 animate-fadeInUp delay-200">
        Nom de l’hébergeur : OVH<br />
        Adresse : Adresse de l’hébergeur<br />
        Téléphone : Numéro de l’hébergeur
      </p>

      <h2 className="text-2xl font-semibold text-[#eb9f13] mt-8 mb-2 animate-fadeInUp delay-300">Propriété intellectuelle</h2>
      <p className="mb-4 animate-fadeInUp delay-300">
        Le contenu de ce site (textes, images, logo, etc.) est protégé par le droit d’auteur.
        Toute reproduction est interdite sans autorisation préalable.
      </p>

      <h2 className="text-2xl font-semibold text-[#eb9f13] mt-8 mb-2 animate-fadeInUp delay-400">Responsabilité</h2>
      <p className="mb-4 animate-fadeInUp delay-400">
        L’éditeur du site décline toute responsabilité en cas d’erreur ou d’omission dans les contenus diffusés.
      </p>

      <style>{`
        .animate-fadeInUp {
          opacity: 0;
          transform: translateY(20px);
          animation: fadeInUp 0.6s ease forwards;
        }
        .delay-100 { animation-delay: 0.1s; }
        .delay-200 { animation-delay: 0.2s; }
        .delay-300 { animation-delay: 0.3s; }
        .delay-400 { animation-delay: 0.4s; }

        @keyframes fadeInUp {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default MentionsLegales;
