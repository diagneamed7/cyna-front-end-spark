// pages/RegisterPage.tsx - Page d'inscription pour votre backend Node.js avec MFA

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  HiOutlineUser as User,
  HiOutlineEnvelope as Email,
  HiOutlineLockClosed as Lock,
  HiOutlineEye as Eye,
  HiOutlineEyeSlash as EyeOff,
  HiArrowLeft,
  HiOutlineQrCode as QrCode
} from 'react-icons/hi2';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../components/UI';
import { validation } from '../utils';
import MFASetup from '../components/UI/MFASetup';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register, isAuthenticated } = useAuth();
  const { addNotification } = useNotifications();

  // Redirection si déjà connecté
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // États du formulaire
  const [formData, setFormData] = useState({
    email: '',
    nom: '',
    prenom: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showMFASetup, setShowMFASetup] = useState(false);
  const [registrationResult, setRegistrationResult] = useState<any>(null);

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

  // Validation du formulaire
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nom.trim()) {
      newErrors.nom = 'Le nom est requis';
    } else if (formData.nom.length < 3) {
      newErrors.nom = 'Le nom doit contenir au moins 3 caractères';
    }

    if (!formData.prenom.trim()) {
      newErrors.prenom = 'Le prénom est requis';
    } else if (formData.prenom.length < 3) {
      newErrors.prenom = 'Le prénom doit contenir au moins 3 caractères';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!validation.email(formData.email)) {
      newErrors.email = 'Email invalide';
    }

    if (!formData.password) {
      newErrors.password = 'Le mot de passe est requis';
    } else {
      const passwordValidation = validation.password(formData.password);
      if (!passwordValidation.valid) {
        newErrors.password = passwordValidation.errors[0];
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Gestion de la soumission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const result = await register({
        email: formData.email,
        nom: formData.nom,
        prenom: formData.prenom,
        password: formData.password
      });
      
      setRegistrationResult(result);
      setShowMFASetup(true);
      
    } catch (error: any) {
      const message = error?.message || 'Erreur d\'inscription';
      
      if (message.includes('email')) {
        setErrors({ email: 'Cet email est déjà utilisé' });
      } else if (message.includes('nom')) {
        setErrors({ nom: 'Ce nom est déjà pris' });
      } else if (message.includes('prenom')) {
        setErrors({ prenom: 'Ce prénom est déjà pris' });
      } else {
        setErrors({ general: message });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Gestion des changements d'input
  const handleChange = (field: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
    // Effacer l'erreur du champ
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleMFASetupComplete = () => {
    addNotification({
      type: 'success',
      title: 'Compte créé avec succès',
      message: 'Votre compte a été créé et l\'authentification MFA configurée. Vous pouvez maintenant vous connecter.'
    });
    navigate('/connexion');
  };

  const handleMFASetupCancel = () => {
    setShowMFASetup(false);
    setRegistrationResult(null);
  };

  // Si on affiche la configuration MFA
  if (showMFASetup && registrationResult) {
    return (
      <div className={`min-h-screen ${customStyles.bgPrimary} flex items-center justify-center p-4`}>
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <h2 className={`${customStyles.textPrimary} text-2xl font-bold mb-2`}>
              Configuration MFA
            </h2>
            <p className={`${customStyles.textMuted}`}>
              Votre compte a été créé ! Configurez maintenant l'authentification à deux facteurs.
            </p>
          </div>
          
          <MFASetup 
            onSetupComplete={handleMFASetupComplete}
            onCancel={handleMFASetupCancel}
            qrCode={registrationResult?.qrCode}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={`relative flex size-full min-h-screen flex-col ${customStyles.bgPrimary} group/design-root overflow-x-hidden`} style={{ fontFamily: '"Noto Serif", "Noto Sans", sans-serif' }}>
      <div className="layout-container flex h-full grow flex-col">
        
        {/* Header simplifié */}
        <header className={`flex items-center justify-between whitespace-nowrap border-b border-solid ${customStyles.borderColor} px-10 py-3`}>
          <Link to="/" className={`flex items-center gap-4 ${customStyles.textPrimary}`}>
            <div className="size-4">
              <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M4 42.4379C4 42.4379 14.0962 36.0744 24 41.1692C35.0664 46.8624 44 42.2078 44 42.2078L44 7.01134C44 7.01134 35.068 11.6577 24.0031 5.96913C14.0971 0.876274 4 7.27094 4 7.27094L4 42.4379Z"
                  fill="currentColor"
                ></path>
              </svg>
            </div>
            <h2 className={`${customStyles.textPrimary} text-lg font-bold leading-tight tracking-[-0.015em]`}>Timlilit Culture</h2>
          </Link>
          
          <Link
            to="/"
            className={`flex items-center gap-2 ${customStyles.textSecondary} text-sm font-medium ${customStyles.hoverAccent} transition-colors`}
          >
            <HiArrowLeft className="w-4 h-4" />
            Retour à l'accueil
          </Link>
        </header>

        {/* Contenu principal */}
        <div className="px-40 flex flex-1 justify-center py-5">
          <div className="layout-content-container flex flex-col w-[512px] max-w-[512px] py-5">
            
            {/* Titre avec motif berbère */}
            <div className="text-center mb-8">
              <div className="inline-block relative">
                <h2 className={`${customStyles.textPrimary} tracking-light text-[32px] font-bold leading-tight px-4 pb-3 pt-5`}>
                  Rejoignez notre communauté
                </h2>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-transparent via-[#eb9f13] to-transparent"></div>
              </div>
              <p className={`${customStyles.textMuted} text-base mt-4`}>
                Créez votre compte avec une sécurité renforcée
              </p>
            </div>

            {/* Message d'erreur général */}
            {errors.general && (
              <div className="mx-4 mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{errors.general}</p>
              </div>
            )}

            {/* Formulaire */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Nom d'utilisateur */}
              <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4">
                <label className="flex flex-col min-w-40 flex-1">
                  <span className={`${customStyles.textPrimary} text-sm font-medium mb-2`}>Nom</span>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="votre_nom"
                      className={`
                        form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl 
                        ${customStyles.textPrimary} focus:outline-0 focus:ring-2 focus:ring-[#eb9f13]/20
                        border ${errors.nom ? 'border-red-500' : customStyles.inputBorder} 
                        bg-white ${customStyles.inputFocus} h-14 
                        placeholder:${customStyles.textMuted} pl-12 pr-4 py-[15px] 
                        text-base font-normal leading-normal transition-all
                      `}
                      value={formData.nom}
                      onChange={handleChange('nom')}
                      disabled={isLoading}
                    />
                    <User className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${customStyles.textMuted}`} />
                  </div>
                  {errors.nom && (
                    <p className="text-red-500 text-xs mt-1">{errors.nom}</p>
                  )}
                </label>
              </div>

              {/* Prénom */}
              <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4">
                <label className="flex flex-col min-w-40 flex-1">
                  <span className={`${customStyles.textPrimary} text-sm font-medium mb-2`}>Prénom</span>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="votre_prenom"
                      className={`
                        form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl 
                        ${customStyles.textPrimary} focus:outline-0 focus:ring-2 focus:ring-[#eb9f13]/20
                        border ${errors.prenom ? 'border-red-500' : customStyles.inputBorder} 
                        bg-white ${customStyles.inputFocus} h-14 
                        placeholder:${customStyles.textMuted} pl-12 pr-4 py-[15px] 
                        text-base font-normal leading-normal transition-all
                      `}
                      value={formData.prenom}
                      onChange={handleChange('prenom')}
                      disabled={isLoading}
                    />
                    <User className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${customStyles.textMuted}`} />
                  </div>
                  {errors.prenom && (
                    <p className="text-red-500 text-xs mt-1">{errors.prenom}</p>
                  )}
                </label>
              </div>

              {/* Email */}
              <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4">
                <label className="flex flex-col min-w-40 flex-1">
                  <span className={`${customStyles.textPrimary} text-sm font-medium mb-2`}>Email</span>
                  <div className="relative">
                    <input
                      type="email"
                      placeholder="votre.email@exemple.com"
                      className={`
                        form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl 
                        ${customStyles.textPrimary} focus:outline-0 focus:ring-2 focus:ring-[#eb9f13]/20
                        border ${errors.email ? 'border-red-500' : customStyles.inputBorder} 
                        bg-white ${customStyles.inputFocus} h-14 
                        placeholder:${customStyles.textMuted} pl-12 pr-4 py-[15px] 
                        text-base font-normal leading-normal transition-all
                      `}
                      value={formData.email}
                      onChange={handleChange('email')}
                      disabled={isLoading}
                    />
                    <Email className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${customStyles.textMuted}`} />
                  </div>
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                  )}
                </label>
              </div>

              {/* Mot de passe */}
              <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4">
                <label className="flex flex-col min-w-40 flex-1">
                  <span className={`${customStyles.textPrimary} text-sm font-medium mb-2`}>Mot de passe</span>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Votre mot de passe"
                      className={`
                        form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl 
                        ${customStyles.textPrimary} focus:outline-0 focus:ring-2 focus:ring-[#eb9f13]/20
                        border ${errors.password ? 'border-red-500' : customStyles.inputBorder} 
                        bg-white ${customStyles.inputFocus} h-14 
                        placeholder:${customStyles.textMuted} pl-12 pr-12 py-[15px] 
                        text-base font-normal leading-normal transition-all
                      `}
                      value={formData.password}
                      onChange={handleChange('password')}
                      disabled={isLoading}
                    />
                    <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${customStyles.textMuted}`} />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className={`absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 ${customStyles.textMuted} hover:${customStyles.textAccent} transition-colors`}
                    >
                      {showPassword ? <EyeOff /> : <Eye />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                  )}
                </label>
              </div>

              {/* Bouton d'inscription */}
              <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4 pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`
                    flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl 
                    ${customStyles.bgAccent} text-white font-semibold h-14 px-6 py-[15px] 
                    hover:bg-[#d48f0f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                    focus:outline-none focus:ring-2 focus:ring-[#eb9f13]/20
                  `}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Création en cours...
                    </div>
                  ) : (
                    'Créer mon compte'
                  )}
                </button>
              </div>
            </form>

            {/* Liens utiles */}
            <div className="text-center mt-6 px-4">
              <p className={`${customStyles.textMuted} text-sm`}>
                Déjà un compte ?{' '}
                <Link 
                  to="/connexion" 
                  className={`${customStyles.textAccent} hover:underline font-medium`}
                >
                  Se connecter
                </Link>
              </p>
            </div>

            {/* Information MFA */}
            <div className={`mx-4 mt-6 p-4 ${customStyles.bgSecondary} rounded-lg`}>
              <div className="flex items-start gap-3">
                <QrCode className={`w-5 h-5 ${customStyles.textAccent} mt-0.5`} />
                <div>
                  <h3 className={`${customStyles.textPrimary} font-semibold text-sm mb-1`}>
                    Authentification à deux facteurs
                  </h3>
                  <p className={`${customStyles.textMuted} text-xs`}>
                    Après l'inscription, vous devrez configurer l'authentification à deux facteurs 
                    pour sécuriser votre compte avec une application comme Google Authenticator.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;