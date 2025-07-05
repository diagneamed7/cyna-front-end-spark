// pages/LoginPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import {
  HiOutlineEnvelope as Email,
  HiOutlineLockClosed as Lock,
  HiOutlineEye as Eye,
  HiOutlineEyeSlash as EyeOff,
  HiArrowLeft,
  HiOutlineKey as Key
} from 'react-icons/hi2';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../components/UI';
import { validation } from '../utils';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();
  const { addNotification } = useNotifications();

  // Redirection si déjà connecté
  useEffect(() => {
    if (isAuthenticated) {
      const from = (location.state as any)?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  // États du formulaire
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    token: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Styles personnalisés (même palette que HomePage)
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

    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!validation.email(formData.email)) {
      newErrors.email = 'Email invalide';
    }

    if (!formData.password) {
      newErrors.password = 'Le mot de passe est requis';
    }

    if (!formData.token) {
      newErrors.token = 'Le code MFA est requis';
    } else if (formData.token.length !== 6) {
      newErrors.token = 'Le code MFA doit contenir 6 chiffres';
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
      await login({
        email: formData.email,
        password: formData.password,
        token: formData.token
      });
      
      // La redirection est gérée par le useEffect
    } catch (error: any) {
      const message = error?.message || 'Erreur de connexion';
      
      if (message.includes('credentials')) {
        setErrors({ general: 'Email ou mot de passe incorrect' });
      } else if (message.includes('MFA') || message.includes('token')) {
        setErrors({ token: 'Code MFA invalide' });
      } else if (message.includes('suspendu')) {
        setErrors({ general: 'Votre compte a été suspendu. Contactez un administrateur.' });
      } else {
        setErrors({ general: message });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Gestion des changements d'input
  const handleChange = (field: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    
    if (field === 'token') {
      value = value.replace(/\D/g, '').slice(0, 6);
    }
    
    setFormData(prev => ({
      ...prev,
      [field]: value
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
                  Bon retour parmi nous
                </h2>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-transparent via-[#eb9f13] to-transparent"></div>
              </div>
              <p className={`${customStyles.textMuted} text-base mt-4`}>
                Connectez-vous avec votre authentification à deux facteurs
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

              {/* Code MFA */}
              <div className="flex max-w-[480px] flex-wrap items-end gap-4 px-4">
                <label className="flex flex-col min-w-40 flex-1">
                  <span className={`${customStyles.textPrimary} text-sm font-medium mb-2`}>Code MFA</span>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="000000"
                      maxLength={6}
                      className={`
                        form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl 
                        ${customStyles.textPrimary} focus:outline-0 focus:ring-2 focus:ring-[#eb9f13]/20
                        border ${errors.token ? 'border-red-500' : customStyles.inputBorder} 
                        bg-white ${customStyles.inputFocus} h-14 
                        placeholder:${customStyles.textMuted} pl-12 pr-4 py-[15px] 
                        text-base font-mono tracking-widest text-center transition-all
                      `}
                      value={formData.token}
                      onChange={handleChange('token')}
                      disabled={isLoading}
                    />
                    <Key className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${customStyles.textMuted}`} />
                  </div>
                  {errors.token && (
                    <p className="text-red-500 text-xs mt-1">{errors.token}</p>
                  )}
                  <p className={`${customStyles.textMuted} text-xs mt-1`}>
                    Entrez le code à 6 chiffres de votre application MFA
                  </p>
                </label>
              </div>

              {/* Bouton de connexion */}
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
                      Connexion en cours...
                    </div>
                  ) : (
                    'Se connecter'
                  )}
                </button>
              </div>
            </form>

            <div className="text-right mt-2 px-4">
              <Link to="/forgot-password" className="text-sm text-[#51946b] hover:underline">Mot de passe oublié&nbsp;?</Link>
            </div>

            {/* Liens utiles */}
            <div className="text-center mt-6 px-4">
              <p className={`${customStyles.textMuted} text-sm`}>
                Pas encore de compte ?{' '}
                <Link 
                  to="/inscription" 
                  className={`${customStyles.textAccent} hover:underline font-medium`}
                >
                  Créer un compte
                </Link>
              </p>
            </div>
          </div>
        </div>

        {/* Footer minimal */}
        <footer className="border-t border-[#e8f2ec] py-6">
          <p className={`text-center ${customStyles.textMuted} text-sm`}>
            @2024 Timlilit Culture. Tous droits réservés.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default LoginPage;