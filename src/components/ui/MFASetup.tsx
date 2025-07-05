// src/components/UI/MFASetup.tsx - Composant de configuration MFA

import React, { useState, useEffect } from 'react';
import {
  HiOutlineQrCode as QrCode,
  HiOutlineCheck as Check,
  HiOutlineInformationCircle as Info
} from 'react-icons/hi2';

interface MFASetupProps {
  onSetupComplete: () => void;
  onCancel: () => void;
  qrCode?: string; // QR code reçu lors de l'inscription
}

const MFASetup: React.FC<MFASetupProps> = ({ onSetupComplete, onCancel, qrCode }) => {
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Styles personnalisés
  const customStyles = {
    bgPrimary: 'bg-[#f8fbfa]',
    textPrimary: 'text-[#0e1a13]',
    textSecondary: 'text-[#51946b]',
    bgSecondary: 'bg-[#e8f2ec]',
    bgAccent: 'bg-[#eb9f13]',
    borderColor: 'border-[#e8f2ec]',
    hoverAccent: 'hover:text-[#eb9f13]',
    textAccent: 'text-[#eb9f13]',
    inputBorder: 'border-[#dde0e3]',
    inputFocus: 'focus:border-[#eb9f13]',
    textMuted: 'text-[#6a7581]'
  };

  // Gestion de la vérification du code
  const handleVerifyCode = async () => {
    if (!verificationCode.trim()) {
      setError('Veuillez entrer le code de vérification');
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      // ✅ SIMULATION : Pour l'instant, on simule une vérification réussie
      // Plus tard, vous pourrez appeler votre API pour vérifier le code
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulation d'un délai
      
      setSuccess(true);
      
      // Attendre un peu avant de rediriger
      setTimeout(() => {
        onSetupComplete();
      }, 2000);
      
    } catch (error) {
      setError('Code de vérification invalide. Veuillez réessayer.');
    } finally {
      setIsVerifying(false);
    }
  };

  // Gestion de l'annulation
  const handleCancel = () => {
    if (confirm('Êtes-vous sûr de vouloir annuler la configuration MFA ? Votre compte sera moins sécurisé.')) {
      onCancel();
    }
  };

  return (
    <div className={`${customStyles.bgPrimary} rounded-xl p-6 border ${customStyles.borderColor}`}>
      {/* En-tête */}
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
          <QrCode className={`w-8 h-8 ${customStyles.textAccent}`} />
        </div>
        <h3 className={`${customStyles.textPrimary} text-xl font-bold mb-2`}>
          Configuration MFA
        </h3>
        <p className={`${customStyles.textMuted} text-sm`}>
          Scannez le QR code avec votre application d'authentification
        </p>
      </div>

      {/* QR Code */}
      <div className="text-center mb-6">
        {qrCode ? (
          <div className="inline-block p-4 bg-white rounded-lg border">
            <img 
              src={qrCode} 
              alt="QR Code MFA" 
              className="w-48 h-48"
            />
          </div>
        ) : (
          <div className="inline-block p-4 bg-white rounded-lg border">
            <div className="w-48 h-48 bg-gray-100 rounded flex items-center justify-center">
              <QrCode className="w-16 h-16 text-gray-400" />
            </div>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className={`${customStyles.bgSecondary} rounded-lg p-4 mb-6`}>
        <div className="flex items-start gap-3">
          <Info className={`w-5 h-5 ${customStyles.textAccent} mt-0.5`} />
          <div>
            <h4 className={`${customStyles.textPrimary} font-semibold text-sm mb-2`}>
              Comment configurer MFA ?
            </h4>
            <ol className={`${customStyles.textMuted} text-sm space-y-1`}>
              <li>1. Téléchargez Google Authenticator ou une app similaire</li>
              <li>2. Scannez le QR code ci-dessus</li>
              <li>3. Entrez le code à 6 chiffres généré</li>
              <li>4. Cliquez sur "Vérifier et terminer"</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Code de vérification */}
      <div className="mb-6">
        <label className={`${customStyles.textPrimary} text-sm font-medium mb-2 block`}>
          Code de vérification
        </label>
        <input
          type="text"
          placeholder="123456"
          value={verificationCode}
          onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          className={`
            w-full px-4 py-3 rounded-lg border ${customStyles.inputBorder} 
            ${customStyles.textPrimary} ${customStyles.inputFocus}
            focus:outline-none focus:ring-2 focus:ring-[#eb9f13]/20
            text-center text-lg font-mono tracking-widest
          `}
          maxLength={6}
          disabled={isVerifying || success}
        />
        {error && (
          <p className="text-red-500 text-sm mt-2">{error}</p>
        )}
      </div>

      {/* Boutons */}
      <div className="flex gap-3">
        <button
          onClick={handleCancel}
          disabled={isVerifying || success}
          className={`
            flex-1 px-4 py-3 rounded-lg border ${customStyles.borderColor}
            ${customStyles.textPrimary} hover:${customStyles.bgSecondary}
            transition-colors disabled:opacity-50 disabled:cursor-not-allowed
          `}
        >
          Annuler
        </button>
        
        <button
          onClick={handleVerifyCode}
          disabled={!verificationCode.trim() || isVerifying || success}
          className={`
            flex-1 px-4 py-3 rounded-lg ${customStyles.bgAccent} text-white
            hover:bg-[#d48f0f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed
            flex items-center justify-center gap-2
          `}
        >
          {isVerifying ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Vérification...
            </>
          ) : success ? (
            <>
              <Check className="w-4 h-4" />
              Configuration réussie !
            </>
          ) : (
            'Vérifier et terminer'
          )}
        </button>
      </div>

      {/* Message de succès */}
      {success && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2">
            <Check className="w-5 h-5 text-green-600" />
            <p className="text-green-800 text-sm">
              Configuration MFA réussie ! Redirection en cours...
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MFASetup; 