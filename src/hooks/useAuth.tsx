// src/hooks/useAuth.tsx - Hook d'authentification pour votre backend Node.js avec MFA

import React, {
  useState,
  useEffect,
  useCallback,
  createContext,
  useContext,
  ReactNode
} from 'react';
import { useNotifications } from '../components/UI';
import type {
  User,
  AuthState,
  ChangePasswordData,
  UpdateProfileData
} from '../types/user';
import { authService } from '../services/api/auth';
import { MFALoginRequest, MFARegisterRequest, MFALoginResponse, MFARegisterResponse } from '../config/api';

// ─── 1) Définition du type du contexte d'authentification ─────────────────────

export interface AuthContextType extends Omit<AuthState, 'token'> {
  // On retire 'token' de AuthState pour ne pas accéder au client privé
  login: (credentials: MFALoginRequest) => Promise<User>;
  register: (data: MFARegisterRequest) => Promise<MFARegisterResponse>;
  logout: () => void;
  updateProfile: (data: UpdateProfileData) => Promise<User>;
  changePassword: (data: ChangePasswordData) => Promise<void>;
  refreshUser: () => Promise<void>;
  verifyMFA: (token: string) => Promise<boolean>;
  setupMFA: () => Promise<{ qrCode: string; secret: string }>;

  // Permissions pour votre backend
  canCreateProduct: boolean;
  canEditProduct: boolean;
  canDeleteProduct: boolean;
  canManageUsers: boolean;
  isAuthenticated: boolean;
}

// ─── 2) Création du Context (non exporté) ────────────────────────────────────

const AuthContext = createContext<AuthContextType | null>(null);

// ─── 3) Hook pour consommer le contexte ──────────────────────────────────────

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// ─── 4) Provider d'authentification ──────────────────────────────────────────

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // On supprime "token" de l'état, car on ne l'expose plus directement
  const [authState, setAuthState] = useState<Omit<AuthState, 'token'>>({
    isAuthenticated: false,
    user: null,
    // token retiré
    isLoading: true,
    error: null
  });
  const { addNotification } = useNotifications();

  // 4.1 – Au montage, on vérifie si un token valide existe via authService.checkAuthStatus()
  useEffect(() => {
    const initAuth = async () => {
      try {
        const user = await authService.checkAuthStatus();
        if (user) {
          setAuthState({
            isAuthenticated: true,
            user,
            isLoading: false,
            error: null
          });
          
          // ✅ AJOUTÉ : Redirection automatique pour les admins déjà connectés
          if (user.Roles && user.Roles.some(role => role.nom_role === 'Admin')) {
            // Vérifier si on n'est pas déjà sur la page admin
            if (window.location.pathname !== '/admin') {
              setTimeout(() => {
                window.location.href = '/admin';
              }, 1000);
            }
          }
          
          return;
        }
      } catch (e) {
        console.error('Erreur lors de la vérification du token :', e);
        authService.logout();
      }
      setAuthState({
        isAuthenticated: false,
        user: null,
        isLoading: false,
        error: null
      });
    };
    initAuth();
  }, []);

  // 4.2 – Fonction "login" avec MFA
  const login = useCallback(
    async (credentials: MFALoginRequest): Promise<User> => {
      try {
        setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
        
        // ✅ MODIFIÉ : Appel avec MFA
        const data: MFALoginResponse = await authService.login(credentials);
        // Stocke le token JWT dans le localStorage
        if (data.token) {
          localStorage.setItem('actionculture_token', data.token);
        }
        
        // Récupérer le profil utilisateur
        const userProfile: User = await authService.getProfile();
        // Stocke le user dans le localStorage
        localStorage.setItem('actionculture_user', JSON.stringify(userProfile));
        
        setAuthState({
          isAuthenticated: true,
          user: userProfile,
          isLoading: false,
          error: null
        });
        
        addNotification({
          type: 'success',
          title: 'Connexion réussie',
          message: `Bienvenue ${userProfile.prenom} !`
        });
        
        // ✅ Redirection automatique pour les admins (supporte 'admin' minuscule ou 'Admin')
        if (
          (userProfile.role && userProfile.role.toLowerCase() === 'admin') ||
          (userProfile.Roles && userProfile.Roles.some(role => (role.nom_role || '').toLowerCase() === 'admin'))
        ) {
          setTimeout(() => {
            window.location.href = '/admin';
          }, 500);
        }
        
        return userProfile;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Erreur de connexion';
        setAuthState(prev => ({ ...prev, isLoading: false, error: message }));
        addNotification({
          type: 'error',
          title: 'Erreur de connexion',
          message
        });
        throw error;
      }
    },
    [addNotification]
  );

  // 4.3 – Fonction "register" avec génération QR Code MFA
  const register = useCallback(
    async (data: MFARegisterRequest): Promise<MFARegisterResponse> => {
      try {
        setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
        
        // ✅ MODIFIÉ : Inscription avec génération QR Code MFA
        const response: MFARegisterResponse = await authService.register(data);
        
        setAuthState(prev => ({ ...prev, isLoading: false, error: null }));
        
        addNotification({
          type: 'success',
          title: 'Inscription réussie',
          message: 'Votre compte a été créé. Veuillez configurer l\'authentification à deux facteurs.'
        });
        
        return response;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Erreur d\'inscription';
        setAuthState(prev => ({ ...prev, isLoading: false, error: message }));
        addNotification({
          type: 'error',
          title: 'Erreur d\'inscription',
          message
        });
        throw error;
      }
    },
    [addNotification]
  );

  // ✅ AJOUTÉ : Fonction de vérification MFA
  const verifyMFA = useCallback(
    async (token: string): Promise<boolean> => {
      try {
        const isValid = await authService.verifyMFA(token);
        if (isValid) {
          addNotification({
            type: 'success',
            title: 'Code MFA vérifié',
            message: 'Code d\'authentification valide'
          });
        }
        return isValid;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Erreur de vérification MFA';
        addNotification({
          type: 'error',
          title: 'Erreur MFA',
          message
        });
        throw error;
      }
    },
    [addNotification]
  );

  // ✅ AJOUTÉ : Fonction de configuration MFA
  const setupMFA = useCallback(
    async (): Promise<{ qrCode: string; secret: string }> => {
      try {
        const result = await authService.setupMFA();
        addNotification({
          type: 'success',
          title: 'MFA configuré',
          message: 'Authentification à deux facteurs configurée avec succès'
        });
        return result;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Erreur de configuration MFA';
        addNotification({
          type: 'error',
          title: 'Erreur MFA',
          message
        });
        throw error;
      }
    },
    [addNotification]
  );

  // 4.4 – Fonction "logout"
  const logout = useCallback(() => {
    authService.logout(); // vide le token & cache dans apiClient
    setAuthState({
      isAuthenticated: false,
      user: null,
      isLoading: false,
      error: null
    });
    addNotification({
      type: 'info',
      title: 'Déconnexion',
      message: 'Vous avez été déconnecté avec succès'
    });
    window.location.href = '/';
  }, [addNotification]);

  // 4.5 – Fonction "updateProfile"
  const updateProfile = useCallback(
    async (profileData: UpdateProfileData): Promise<User> => {
      try {
        const updated: User = await authService.updateProfile(profileData);
        setAuthState(prev => ({ ...prev, user: updated }));
        addNotification({
          type: 'success',
          title: 'Profil mis à jour',
          message: 'Vos informations ont été sauvegardées'
        });
        return updated;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Erreur de mise à jour';
        addNotification({
          type: 'error',
          title: 'Erreur de profil',
          message
        });
        throw error;
      }
    },
    [addNotification]
  );

  // 4.6 – Fonction "changePassword"
  const changePassword = useCallback(
    async (passwordData: ChangePasswordData): Promise<void> => {
      try {
        await authService.changePassword(passwordData);
        addNotification({
          type: 'success',
          title: 'Mot de passe changé',
          message: 'Votre mot de passe a été modifié avec succès'
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Erreur de changement de mot de passe';
        addNotification({
          type: 'error',
          title: 'Erreur de mot de passe',
          message
        });
        throw error;
      }
    },
    [addNotification]
  );

  // 4.7 – Fonction "refreshUser"
  const refreshUser = useCallback(async () => {
    try {
      const user = await authService.getProfile();
      setAuthState(prev => ({ ...prev, user }));
    } catch (error) {
      console.error('Erreur lors du rafraîchissement du profil :', error);
      // Si le token est invalide, déconnecter
      if (error instanceof Error && error.message.includes('Token expiré')) {
        logout();
      }
    }
  }, [logout]);

  // ✅ MODIFIÉ : Permissions pour votre backend
  const canCreateProduct = authService.canCreateProduct(authState.user);
  const canEditProduct = authService.canEditProduct(authState.user);
  const canDeleteProduct = authService.canDeleteProduct(authState.user);
  const canManageUsers = authService.canManageUsers(authState.user);

  const contextValue: AuthContextType = {
    ...authState,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    refreshUser,
    verifyMFA,
    setupMFA,
    canCreateProduct,
    canEditProduct,
    canDeleteProduct,
    canManageUsers,
    isAuthenticated: authState.isAuthenticated
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
