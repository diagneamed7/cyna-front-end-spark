// pages/AuthPages.tsx - Pages de connexion et inscription (CORRIGÉ)

import React, { useState, useEffect } from 'react';
import {
  HiEye,
  HiEyeSlash,
  HiUser,
  HiEnvelope,
  HiPhone,
  HiCalendar,
  HiMapPin,
  HiIdentification,
  HiArrowLeft,
  HiExclamationTriangle,
  HiXCircle,
  HiKey
} from 'react-icons/hi2';

import { useAuth } from '../hooks/useAuth';
import { useMetadata } from '../hooks/useMetadata'; // CORRIGÉ: import correct
import { Loading, Alert } from '../components/UI'; // Utilise vos composants UI
import type { TypeUtilisateur } from '../types/user';
import { TYPES_UTILISATEUR_OPTIONS } from '../types/user';
import type { MFALoginRequest, MFARegisterRequest } from '../config/api';

// Type étendu pour l'inscription avec tous les champs nécessaires
interface ExtendedRegisterData extends MFARegisterRequest {
  telephone?: string;
  date_naissance?: string;
  sexe?: 'M' | 'F';
  wilaya_residence?: number;
  type_user: TypeUtilisateur;
  bio?: string;
  specialites?: string[];
  accepte_conditions: boolean;
  accepte_newsletter?: boolean;
}

// =============================================================================
// PAGE DE CONNEXION
// =============================================================================

export const LoginPage: React.FC = () => {
  const [credentials, setCredentials] = useState<Omit<MFALoginRequest, 'token'>>({
    email: '',
    password: ''
  });
  const [mfaToken, setMfaToken] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { login, isAuthenticated, isLoading } = useAuth();

  // Redirection si déjà connecté
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      window.location.href = '/';
    }
  }, [isAuthenticated, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); // Réinitialiser l'erreur
    
    if (!mfaToken.trim()) {
      setError('Veuillez saisir votre code d\'authentification à deux facteurs');
      return;
    }
    
    try {
      setIsSubmitting(true);
      const loginData: MFALoginRequest = {
        ...credentials,
        token: mfaToken
      };
      await login(loginData);
      // Redirection automatique après connexion réussie
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur de connexion';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <Loading overlay text="Vérification de l'authentification..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-patrimoine-emeraude via-patrimoine-canard to-patrimoine-or">
      <div className="flex min-h-full items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8">
          
          {/* Header avec palette patrimoine */}
          <div className="text-center">
            <div className="mx-auto h-16 w-16 bg-gradient-to-br from-patrimoine-emeraude to-patrimoine-canard rounded-xl flex items-center justify-center mb-4 shadow-patrimoine">
              <HiUser className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white">
              Connexion
            </h2>
            <p className="mt-2 text-patrimoine-creme">
              Accédez à votre compte Action Culture
            </p>
          </div>

          {/* Formulaire */}
          <div className="bg-white rounded-2xl shadow-patrimoine-lg p-8">
            {/* Affichage des erreurs */}
            {error && (
              <Alert
                type="error"
                message={error}
                onClose={() => setError(null)}
                className="mb-6"
              />
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
              
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-patrimoine-canard mb-2">
                  Adresse email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <HiEnvelope className="h-5 w-5 text-patrimoine-canard/40" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={credentials.email}
                    onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
                    className="block w-full pl-10 pr-3 py-3 border border-patrimoine-canard/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-patrimoine-emeraude focus:border-patrimoine-emeraude bg-patrimoine-creme/20"
                    placeholder="votre@email.com"
                  />
                </div>
              </div>

              {/* Mot de passe */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-patrimoine-canard mb-2">
                  Mot de passe
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={credentials.password}
                    onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                    className="block w-full pr-10 pl-3 py-3 border border-patrimoine-canard/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-patrimoine-emeraude focus:border-patrimoine-emeraude bg-patrimoine-creme/20"
                    placeholder="Votre mot de passe"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <HiEyeSlash className="h-5 w-5 text-patrimoine-canard/40" />
                    ) : (
                      <HiEye className="h-5 w-5 text-patrimoine-canard/40" />
                    )}
                  </button>
                </div>
              </div>

              {/* Code MFA */}
              <div>
                <label htmlFor="mfaToken" className="block text-sm font-medium text-patrimoine-canard mb-2">
                  Code d'authentification à deux facteurs
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <HiKey className="h-5 w-5 text-patrimoine-canard/40" />
                  </div>
                  <input
                    id="mfaToken"
                    name="mfaToken"
                    type="text"
                    required
                    value={mfaToken}
                    onChange={(e) => setMfaToken(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-patrimoine-canard/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-patrimoine-emeraude focus:border-patrimoine-emeraude bg-patrimoine-creme/20"
                    placeholder="Code à 6 chiffres"
                    maxLength={6}
                  />
                </div>
                <p className="mt-1 text-xs text-patrimoine-canard/60">
                  Saisissez le code généré par votre application d'authentification
                </p>
              </div>

              {/* Bouton de connexion */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-patrimoine hover:shadow-patrimoine focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-patrimoine-emeraude disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Connexion...
                  </>
                ) : (
                  'Se connecter'
                )}
              </button>
            </form>

            {/* Lien vers l'inscription */}
            <div className="mt-6 text-center">
              <p className="text-sm text-patrimoine-sombre">
                Pas encore de compte ?{' '}
                <a href="/inscription" className="font-medium text-patrimoine-emeraude hover:text-patrimoine-emeraude/80">
                  Créer un compte
                </a>
              </p>
            </div>
          </div>

          {/* Retour à l'accueil */}
          <div className="text-center">
            <a 
              href="/" 
              className="inline-flex items-center text-sm text-patrimoine-creme hover:text-white transition-colors"
            >
              <HiArrowLeft className="h-4 w-4 mr-1" />
              Retour à l'accueil
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

// =============================================================================
// PAGE D'INSCRIPTION
// =============================================================================

export const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState<ExtendedRegisterData>({
    nom: '',
    prenom: '',
    email: '',
    password: '',
    telephone: '',
    date_naissance: '',
    sexe: undefined,
    wilaya_residence: undefined,
    type_user: 'visiteur',
    bio: '',
    specialites: [],
    accepte_conditions: false,
    accepte_newsletter: false
  });

  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const { register, isAuthenticated, isLoading } = useAuth();
  const { options: metadata, isLoading: metadataLoading } = useMetadata();

  // Redirection si déjà connecté
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      window.location.href = '/';
    }
  }, [isAuthenticated, isLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); // Réinitialiser l'erreur
    
    // Validation
    if (formData.password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (!formData.accepte_conditions) {
      setError('Vous devez accepter les conditions d\'utilisation');
      return;
    }

    try {
      setIsSubmitting(true);
      // Extraire seulement les champs nécessaires pour MFARegisterRequest
      const registerData: MFARegisterRequest = {
        nom: formData.nom,
        prenom: formData.prenom,
        email: formData.email,
        password: formData.password
      };
      await register(registerData);
      // Redirection automatique après inscription réussie
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erreur d\'inscription';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 3));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  if (isLoading) {
    return <Loading overlay text="Vérification de l'authentification..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-patrimoine-emeraude via-patrimoine-canard to-patrimoine-or">
      <div className="flex min-h-full items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-2xl space-y-8">
          
          {/* Header */}
          <div className="text-center">
            <div className="mx-auto h-16 w-16 bg-gradient-to-br from-patrimoine-emeraude to-patrimoine-canard rounded-xl flex items-center justify-center mb-4 shadow-patrimoine">
              <HiUser className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-white">
              Créer un compte
            </h2>
            <p className="mt-2 text-patrimoine-creme">
              Rejoignez la communauté du patrimoine culturel algérien
            </p>
          </div>

          {/* Indicateur d'étapes avec palette patrimoine */}
          <div className="flex justify-center">
            <div className="flex items-center space-x-4">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200 ${
                    currentStep >= step 
                      ? 'bg-patrimoine-emeraude text-white shadow-patrimoine' 
                      : 'bg-patrimoine-creme text-patrimoine-canard'
                  }`}>
                    {step}
                  </div>
                  {step < 3 && (
                    <div className={`w-12 h-1 mx-2 rounded-full transition-all duration-200 ${
                      currentStep > step ? 'bg-patrimoine-emeraude' : 'bg-patrimoine-creme'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Formulaire */}
          <div className="bg-white rounded-2xl shadow-patrimoine-lg p-8">
            {/* Affichage des erreurs */}
            {error && (
              <Alert
                type="error"
                message={error}
                onClose={() => setError(null)}
                className="mb-6"
              />
            )}

            <form onSubmit={handleSubmit}>
              
              {/* Étape 1: Informations personnelles */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-patrimoine-canard mb-4">
                    Informations personnelles
                  </h3>
                  
                  {/* Nom et Prénom */}
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-patrimoine-canard mb-2">
                        Nom *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.nom}
                        onChange={(e) => setFormData(prev => ({ ...prev, nom: e.target.value }))}
                        className="block w-full px-3 py-3 border border-patrimoine-canard/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-patrimoine-emeraude focus:border-patrimoine-emeraude bg-patrimoine-creme/20"
                        placeholder="Votre nom"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-patrimoine-canard mb-2">
                        Prénom *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.prenom}
                        onChange={(e) => setFormData(prev => ({ ...prev, prenom: e.target.value }))}
                        className="block w-full px-3 py-3 border border-patrimoine-canard/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-patrimoine-emeraude focus:border-patrimoine-emeraude bg-patrimoine-creme/20"
                        placeholder="Votre prénom"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-sm font-medium text-patrimoine-canard mb-2">
                      Adresse email *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <HiEnvelope className="h-5 w-5 text-patrimoine-canard/40" />
                      </div>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                        className="block w-full pl-10 pr-3 py-3 border border-patrimoine-canard/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-patrimoine-emeraude focus:border-patrimoine-emeraude bg-patrimoine-creme/20"
                        placeholder="votre@email.com"
                      />
                    </div>
                  </div>

                  {/* Téléphone et Date de naissance */}
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-patrimoine-canard mb-2">
                        Téléphone
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <HiPhone className="h-5 w-5 text-patrimoine-canard/40" />
                        </div>
                        <input
                          type="tel"
                          value={formData.telephone}
                          onChange={(e) => setFormData(prev => ({ ...prev, telephone: e.target.value }))}
                          className="block w-full pl-10 pr-3 py-3 border border-patrimoine-canard/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-patrimoine-emeraude focus:border-patrimoine-emeraude bg-patrimoine-creme/20"
                          placeholder="0123456789"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-patrimoine-canard mb-2">
                        Date de naissance
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <HiCalendar className="h-5 w-5 text-patrimoine-canard/40" />
                        </div>
                        <input
                          type="date"
                          value={formData.date_naissance}
                          onChange={(e) => setFormData(prev => ({ ...prev, date_naissance: e.target.value }))}
                          className="block w-full pl-10 pr-3 py-3 border border-patrimoine-canard/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-patrimoine-emeraude focus:border-patrimoine-emeraude bg-patrimoine-creme/20"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Sexe et Wilaya */}
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-patrimoine-canard mb-2">
                        Sexe
                      </label>
                      <select
                        value={formData.sexe || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, sexe: e.target.value as 'M' | 'F' }))}
                        className="block w-full px-3 py-3 border border-patrimoine-canard/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-patrimoine-emeraude focus:border-patrimoine-emeraude bg-patrimoine-creme/20"
                      >
                        <option value="">Sélectionner</option>
                        <option value="M">Masculin</option>
                        <option value="F">Féminin</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-patrimoine-canard mb-2">
                        Wilaya de résidence
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <HiMapPin className="h-5 w-5 text-patrimoine-canard/40" />
                        </div>
                        <select
                          value={formData.wilaya_residence || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, wilaya_residence: e.target.value ? parseInt(e.target.value) : undefined }))}
                          className="block w-full pl-10 pr-3 py-3 border border-patrimoine-canard/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-patrimoine-emeraude focus:border-patrimoine-emeraude bg-patrimoine-creme/20"
                          disabled={metadataLoading}
                        >
                          <option value="">Sélectionner une wilaya</option>
                          {metadata.wilayas.map((wilaya: any) => (
                            <option key={wilaya.value} value={wilaya.value}>
                              {wilaya.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Étape 2: Type d'utilisateur et mot de passe */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-patrimoine-canard mb-4">
                    Type de compte et sécurité
                  </h3>
                  
                  {/* Type d'utilisateur */}
                  <div>
                    <label className="block text-sm font-medium text-patrimoine-canard mb-2">
                      Type de profil *
                    </label>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {TYPES_UTILISATEUR_OPTIONS.map((type) => (
                        <label
                          key={type.value}
                          className={`relative flex cursor-pointer rounded-lg border p-4 focus:outline-none transition-all duration-200 ${
                            formData.type_user === type.value
                              ? 'border-patrimoine-emeraude bg-patrimoine-emeraude/5 ring-2 ring-patrimoine-emeraude'
                              : 'border-patrimoine-canard/20 bg-white hover:bg-patrimoine-creme/30'
                          }`}
                        >
                          <input
                            type="radio"
                            name="type_user"
                            value={type.value}
                            checked={formData.type_user === type.value}
                            onChange={(e) => setFormData(prev => ({ ...prev, type_user: e.target.value as TypeUtilisateur }))}
                            className="sr-only"
                          />
                          <div className="flex flex-1">
                            <div className="flex flex-col">
                              <span className="block text-sm font-medium text-patrimoine-canard">
                                {type.label}
                              </span>
                              <span className="mt-1 flex items-center text-sm text-patrimoine-sombre/70">
                                {type.description}
                              </span>
                            </div>
                          </div>
                          <div className={`shrink-0 text-patrimoine-emeraude ${
                            formData.type_user === type.value ? 'block' : 'hidden'
                          }`}>
                            <HiIdentification className="h-5 w-5" />
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Mots de passe */}
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-patrimoine-canard mb-2">
                        Mot de passe *
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={formData.password}
                          onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                          className="block w-full pr-10 pl-3 py-3 border border-patrimoine-canard/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-patrimoine-emeraude focus:border-patrimoine-emeraude bg-patrimoine-creme/20"
                          placeholder="Votre mot de passe"
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? (
                            <HiEyeSlash className="h-5 w-5 text-patrimoine-canard/40" />
                          ) : (
                            <HiEye className="h-5 w-5 text-patrimoine-canard/40" />
                          )}
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-patrimoine-canard mb-2">
                        Confirmer le mot de passe *
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="block w-full pr-10 pl-3 py-3 border border-patrimoine-canard/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-patrimoine-emeraude focus:border-patrimoine-emeraude bg-patrimoine-creme/20"
                          placeholder="Confirmer le mot de passe"
                        />
                        <button
                          type="button"
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? (
                            <HiEyeSlash className="h-5 w-5 text-patrimoine-canard/40" />
                          ) : (
                            <HiEye className="h-5 w-5 text-patrimoine-canard/40" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Étape 3: Informations complémentaires */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <h3 className="text-lg font-medium text-patrimoine-canard mb-4">
                    Informations complémentaires
                  </h3>
                  
                  {/* Bio */}
                  <div>
                    <label className="block text-sm font-medium text-patrimoine-canard mb-2">
                      Biographie
                    </label>
                    <textarea
                      rows={4}
                      value={formData.bio}
                      onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                      className="block w-full px-3 py-3 border border-patrimoine-canard/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-patrimoine-emeraude focus:border-patrimoine-emeraude bg-patrimoine-creme/20"
                      placeholder="Parlez-nous de vous, vos spécialités, votre expérience..."
                    />
                  </div>

                  {/* Conditions et newsletter */}
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="accepte_conditions"
                          name="accepte_conditions"
                          type="checkbox"
                          required
                          checked={formData.accepte_conditions}
                          onChange={(e) => setFormData(prev => ({ ...prev, accepte_conditions: e.target.checked }))}
                          className="h-4 w-4 text-patrimoine-emeraude focus:ring-patrimoine-emeraude border-patrimoine-canard/30 rounded"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="accepte_conditions" className="font-medium text-patrimoine-canard">
                          J'accepte les{' '}
                          <a href="/conditions" className="text-patrimoine-emeraude hover:text-patrimoine-emeraude/80">
                            conditions d'utilisation
                          </a>{' '}
                          et la{' '}
                          <a href="/confidentialite" className="text-patrimoine-emeraude hover:text-patrimoine-emeraude/80">
                            politique de confidentialité
                          </a>{' '}
                          *
                        </label>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="flex items-center h-5">
                        <input
                          id="accepte_newsletter"
                          name="accepte_newsletter"
                          type="checkbox"
                          checked={formData.accepte_newsletter}
                          onChange={(e) => setFormData(prev => ({ ...prev, accepte_newsletter: e.target.checked }))}
                          className="h-4 w-4 text-patrimoine-emeraude focus:ring-patrimoine-emeraude border-patrimoine-canard/30 rounded"
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="accepte_newsletter" className="font-medium text-patrimoine-canard">
                          Je souhaite recevoir la newsletter et les actualités du patrimoine culturel
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation entre les étapes */}
              <div className="flex justify-between pt-6 mt-8 border-t border-patrimoine-canard/10">
                <button
                  type="button"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className="flex items-center px-4 py-2 text-sm font-medium text-patrimoine-canard bg-white border border-patrimoine-canard/20 rounded-lg hover:bg-patrimoine-creme/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <HiArrowLeft className="h-4 w-4 mr-1" />
                  Précédent
                </button>

                {currentStep < 3 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="flex items-center px-4 py-2 text-sm font-medium text-white bg-gradient-patrimoine border border-transparent rounded-lg hover:shadow-patrimoine transition-all duration-200"
                  >
                    Suivant
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting || !formData.accepte_conditions}
                    className="flex items-center px-6 py-2 text-sm font-medium text-white bg-gradient-patrimoine border border-transparent rounded-lg hover:shadow-patrimoine disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Création...
                      </>
                    ) : (
                      'Créer mon compte'
                    )}
                  </button>
                )}
              </div>
            </form>

            {/* Lien vers la connexion */}
            <div className="mt-6 text-center">
              <p className="text-sm text-patrimoine-sombre">
                Déjà un compte ?{' '}
                <a href="/connexion" className="font-medium text-patrimoine-emeraude hover:text-patrimoine-emeraude/80">
                  Se connecter
                </a>
              </p>
            </div>
          </div>

          {/* Retour à l'accueil */}
          <div className="text-center">
            <a 
              href="/" 
              className="inline-flex items-center text-sm text-patrimoine-creme hover:text-white transition-colors"
            >
              <HiArrowLeft className="h-4 w-4 mr-1" />
              Retour à l'accueil
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};