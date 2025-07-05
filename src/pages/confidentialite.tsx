import React from 'react';

const PolitiqueConfidentialite = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 py-10 bg-gradient-to-br from-[#f0f8ff] to-white text-[#333] font-sans">
      <h1 className="text-3xl font-bold text-[#eb9f13] mb-6 relative animate-fadeInUp">
        Politique de confidentialité
        <span className="block w-16 h-1 bg-[#eb9f13] mt-2 rounded"></span>
      </h1>

      <p className="mb-4 animate-fadeInUp delay-100">
        Cette politique explique comment nous collectons, utilisons et protégeons vos données personnelles.
      </p>

      <h2 className="text-2xl font-semibold text-[#eb9f13] mt-8 mb-2 animate-fadeInUp delay-200">Données collectées</h2>
      <p className="mb-4 animate-fadeInUp delay-200">
        Nous collectons les données suivantes : nom, prénom, adresse email, adresse IP, données de navigation (via cookies).
      </p>

      <h2 className="text-2xl font-semibold text-[#eb9f13] mt-8 mb-2 animate-fadeInUp delay-300">Utilisation des données</h2>
      <p className="mb-4 animate-fadeInUp delay-300">
        Les données sont utilisées pour :<br />
        - Répondre à vos demandes via le formulaire de contact<br />
        - Envoyer des newsletters si vous y avez consenti<br />
        - Analyser le trafic du site (Google Analytics, etc.)
      </p>

      <h2 className="text-2xl font-semibold text-[#eb9f13] mt-8 mb-2 animate-fadeInUp delay-400">Base légale</h2>
      <p className="mb-4 animate-fadeInUp delay-400">
        Les traitements sont fondés sur le consentement ou sur l’intérêt légitime du responsable de traitement.
      </p>

      <h2 className="text-2xl font-semibold text-[#eb9f13] mt-8 mb-2 animate-fadeInUp delay-500">Durée de conservation</h2>
      <p className="mb-4 animate-fadeInUp delay-500">
        Les données sont conservées pour une durée maximale de 3 ans après le dernier contact.
      </p>

      <h2 className="text-2xl font-semibold text-[#eb9f13] mt-8 mb-2 animate-fadeInUp delay-600">Vos droits</h2>
      <p className="mb-4 animate-fadeInUp delay-600">
        Conformément au RGPD, vous disposez des droits suivants :<br />
        - Droit d’accès<br />
        - Droit de rectification<br />
        - Droit à l’effacement<br />
        - Droit d’opposition<br />
        - Droit à la portabilité
      </p>
      <p className="mb-4 animate-fadeInUp delay-700">
        Pour exercer vos droits, contactez : <strong className="text-[#eb9f13]">dpo@votresite.com</strong>
      </p>

      <h2 className="text-2xl font-semibold text-[#eb9f13] mt-8 mb-2 animate-fadeInUp delay-800">Cookies</h2>
      <p className="mb-4 animate-fadeInUp delay-800">
        Des cookies peuvent être utilisés pour améliorer l’expérience utilisateur.<br />
        Vous pouvez configurer vos préférences via notre bannière de cookies lors de votre première visite.
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
        .delay-500 { animation-delay: 0.5s; }
        .delay-600 { animation-delay: 0.6s; }
        .delay-700 { animation-delay: 0.7s; }
        .delay-800 { animation-delay: 0.8s; }

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

export default PolitiqueConfidentialite;
