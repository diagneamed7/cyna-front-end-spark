// src/services/api/auth.ts - Service d'authentification pour votre backend Node.js avec MFA

import { ApiClient } from './client';
import { API_ENDPOINTS, MFALoginRequest, MFARegisterRequest, MFARegisterResponse, MFALoginResponse } from '../../config/api';
import type { 
  User,
  AuthResponse,
  ChangePasswordData,
  UpdateProfileData,
  PhotoUploadResponse
} from '../../types/user';

export class AuthService {
  private client: ApiClient;

  constructor() {
    this.client = new ApiClient();
  }

  // ==========================================================================
  // AUTHENTIFICATION MFA
  // ==========================================================================

  // ✅ MODIFIÉ : Fonction de connexion avec MFA
  async login(credentials: MFALoginRequest): Promise<MFALoginResponse> {
    try {
      console.log('🔐 Tentative de connexion avec MFA:', { email: credentials.email });
      
      const response = await this.client.post<MFALoginResponse>(
        API_ENDPOINTS.AUTH.LOGIN,
        credentials
      );
      
      console.log('✅ Connexion réussie:', response);
      
      // Stocker le token
      this.client.setToken(response.token);
      
      return response;
    } catch (error) {
      console.error('❌ Erreur de connexion:', error);
      
      // Messages d'erreur plus descriptifs
      if (error instanceof Error) {
        const message = error.message.toLowerCase();
        if (message.includes('unauthorized') || message.includes('401')) {
          throw new Error('Email ou mot de passe incorrect');
        } else if (message.includes('validation') || message.includes('400')) {
          throw new Error('Code d\'authentification à deux facteurs invalide');
        } else if (message.includes('timeout') || message.includes('408')) {
          throw new Error('Délai d\'attente dépassé. Veuillez réessayer.');
        } else if (message.includes('network') || message.includes('fetch')) {
          throw new Error('Erreur de connexion au serveur. Vérifiez votre connexion internet.');
        } else {
          throw new Error(error.message || 'Erreur de connexion');
        }
      }
      
      throw new Error('Erreur de connexion au serveur');
    }
  }

  // ✅ MODIFIÉ : Méthode d'inscription avec génération QR Code MFA
  async register(data: MFARegisterRequest): Promise<MFARegisterResponse> {
    try {
      console.log('📝 Tentative d\'inscription avec MFA...');
      console.log('📤 Données envoyées:', { ...data, password: '[REDACTED]' });
      console.log('🌐 URL de la requête:', API_ENDPOINTS.AUTH.REGISTER);
      
      const response = await this.client.post<MFARegisterResponse>(
        API_ENDPOINTS.AUTH.REGISTER, 
        data,
        { skipAuth: true, cache: false }
      );
      
      console.log('✅ Inscription réussie, QR Code MFA généré');
      console.log('📥 Réponse reçue:', response);
      return response;
    } catch (error) {
      console.error('❌ Erreur d\'inscription:', error);
      console.error('❌ Détails de l\'erreur:', {
        message: error instanceof Error ? error.message : 'Erreur inconnue',
        status: (error as any)?.response?.status,
        statusText: (error as any)?.response?.statusText,
        data: (error as any)?.response?.data
      });
      throw error;
    }
  }

  // ✅ AJOUTÉ : Méthode pour vérifier le code MFA
  async verifyMFA(token: string): Promise<boolean> {
    try {
      console.log('🔍 Vérification du code MFA...');
      
      const response = await this.client.post<{ valid: boolean }>(
        API_ENDPOINTS.AUTH.VERIFY_MFA, 
        { token },
        { skipAuth: true, cache: false }
      );
      
      console.log('✅ Code MFA vérifié');
      return response.valid;
    } catch (error) {
      console.error('❌ Erreur de vérification MFA:', error);
      throw error;
    }
  }

  // ✅ AJOUTÉ : Méthode pour configurer MFA
  async setupMFA(): Promise<{ qrCode: string; secret: string }> {
    try {
      console.log('⚙️ Configuration MFA...');
      
      const response = await this.client.post<{ qrCode: string; secret: string }>(
        API_ENDPOINTS.AUTH.SETUP_MFA, 
        {},
        { cache: false }
      );
      
      console.log('✅ MFA configuré');
      return response;
    } catch (error) {
      console.error('❌ Erreur de configuration MFA:', error);
      throw error;
    }
  }

  logout(): void {
    console.log('👋 Déconnexion');
    this.client.clearToken();
    this.client.clearCache();
  }

  // ==========================================================================
  // PROFIL UTILISATEUR
  // ==========================================================================

  async getProfile(): Promise<User> {
    try {
      return await this.client.get<User>(
        API_ENDPOINTS.USERS.PROFILE, 
        undefined, 
        { cache: true }
      );
    } catch (error) {
      console.error('❌ Erreur de récupération du profil:', error);
      
      // Si le token est invalide, nettoyer et relancer l'erreur
      if (error instanceof Error && error.message.includes('Token expiré')) {
        this.logout();
      }
      
      throw error;
    }
  }

  async updateProfile(data: UpdateProfileData): Promise<User> {
    try {
      console.log('📝 Mise à jour du profil...');
      
      const response = await this.client.put<User>(
        API_ENDPOINTS.USERS.PROFILE,
        data, 
        { cache: false }
      );
      
      console.log('✅ Profil mis à jour');
      return response;
    } catch (error) {
      console.error('❌ Erreur de mise à jour du profil:', error);
      throw error;
    }
  }

  async changePassword(data: ChangePasswordData): Promise<void> {
    try {
      console.log('🔒 Changement de mot de passe...');
      
      await this.client.patch<void>(
        API_ENDPOINTS.AUTH.CHANGE_PASSWORD, 
        data, 
        { cache: false }
      );
      
      console.log('✅ Mot de passe changé');
    } catch (error) {
      console.error('❌ Erreur de changement de mot de passe:', error);
      throw error;
    }
  }

  // ==========================================================================
  // VÉRIFICATIONS DE STATUT
  // ==========================================================================

  async checkAuthStatus(): Promise<User | null> {
    try {
      // Vérifier si on a un token valide
      const info = this.client.getInfo();
      if (!info.hasToken) {
        return null;
      }

      // Essayer de récupérer le profil
      const user = await this.getProfile();
      return user;
    } catch (error) {
      console.error('❌ Erreur de vérification du statut:', error);
      this.logout();
      return null;
    }
  }

  // ==========================================================================
  // PERMISSIONS ET RÔLES
  // ==========================================================================

  hasRole(user: User | null, role: string): boolean {
    if (!user?.Roles) return false;
    return user.Roles.some(r => r.nom_role.toLowerCase() === role.toLowerCase());
  }

  hasAnyRole(user: User | null, roles: string[]): boolean {
    if (!user?.Roles) return false;
    return roles.some(role => user.Roles!.some(r => r.nom_role.toLowerCase() === role.toLowerCase()));
  }

  hasPermission(user: User | null, permission: string): boolean {
    if (!user?.Roles) return false;
    
    // ✅ MODIFIÉ : Adapter aux rôles de votre backend
    return user.Roles.some(role => 
      role.permissions && role.permissions.includes(permission)
    );
  }

  isAdmin(user: User | null): boolean {
    return this.hasRole(user, 'admin');
  }

  isUser(user: User | null): boolean {
    return this.hasRole(user, 'user');
  }

  canCreateProduct(user: User | null): boolean {
    return this.hasPermission(user, 'create_product');
  }

  canEditProduct(user: User | null): boolean {
    return this.hasPermission(user, 'edit_product');
  }

  canDeleteProduct(user: User | null): boolean {
    return this.hasPermission(user, 'delete_product');
  }

  canManageUsers(user: User | null): boolean {
    return this.hasPermission(user, 'manage_users');
  }

  // ==========================================================================
  // MESSAGES D'ERREUR
  // ==========================================================================

  getPermissionDeniedMessage(action: string): string {
    return `Vous n'avez pas les permissions nécessaires pour ${action}.`;
  }

  getMFASetupMessage(): string {
    return 'Veuillez configurer l\'authentification à deux facteurs pour sécuriser votre compte.';
  }

  getMFARequiredMessage(): string {
    return 'Un code d\'authentification à deux facteurs est requis pour vous connecter.';
  }
}

// Export d'une instance par défaut
export const authService = new AuthService();