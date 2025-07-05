// src/hooks/useAdmin.ts - Hook pour gérer les permissions d'administration

import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';

export interface AdminPermissions {
  canCreateProducts: boolean;
  canEditProducts: boolean;
  canDeleteProducts: boolean;
  canCreateCategories: boolean;
  canEditCategories: boolean;
  canDeleteCategories: boolean;
  canViewAdminPanel: boolean;
}

export const useAdmin = () => {
  const { user, isAuthenticated } = useAuth();
  const [permissions, setPermissions] = useState<AdminPermissions>({
    canCreateProducts: false,
    canEditProducts: false,
    canDeleteProducts: false,
    canCreateCategories: false,
    canEditCategories: false,
    canDeleteCategories: false,
    canViewAdminPanel: false,
  });

  // Vérifier si l'utilisateur a le rôle admin
  const isUserAdmin = (): boolean => {
    if (!user?.Roles) return false;
    return user.Roles.some(role => role.nom_role === 'Admin');
  };

  // Mettre à jour les permissions quand l'utilisateur change
  useEffect(() => {
    if (isAuthenticated && user) {
      const isAdmin = isUserAdmin();
      
      setPermissions({
        canCreateProducts: isAdmin,
        canEditProducts: isAdmin,
        canDeleteProducts: isAdmin,
        canCreateCategories: isAdmin,
        canEditCategories: isAdmin,
        canDeleteCategories: isAdmin,
        canViewAdminPanel: isAdmin,
      });
    } else {
      // Reset permissions si non connecté
      setPermissions({
        canCreateProducts: false,
        canEditProducts: false,
        canDeleteProducts: false,
        canCreateCategories: false,
        canEditCategories: false,
        canDeleteCategories: false,
        canViewAdminPanel: false,
      });
    }
  }, [isAuthenticated, user]);

  // Fonctions utilitaires pour vérifier les permissions
  const canPerformAction = (action: keyof AdminPermissions): boolean => {
    return permissions[action];
  };

  const requireAdmin = (): boolean => {
    if (!isAuthenticated) {
      throw new Error('Vous devez être connecté pour accéder à cette fonctionnalité');
    }
    
    if (!isUserAdmin()) {
      throw new Error('Vous devez avoir les permissions d\'administrateur pour accéder à cette fonctionnalité');
    }
    
    return true;
  };

  return {
    // État
    permissions,
    isAdmin: isUserAdmin(),
    
    // Vérifications de permissions
    canCreateProducts: permissions.canCreateProducts,
    canEditProducts: permissions.canEditProducts,
    canDeleteProducts: permissions.canDeleteProducts,
    canCreateCategories: permissions.canCreateCategories,
    canEditCategories: permissions.canEditCategories,
    canDeleteCategories: permissions.canDeleteCategories,
    canViewAdminPanel: permissions.canViewAdminPanel,
    
    // Fonctions utilitaires
    canPerformAction,
    requireAdmin,
    
    // Vérifications spécifiques
    canManageProducts: permissions.canCreateProducts || permissions.canEditProducts || permissions.canDeleteProducts,
    canManageCategories: permissions.canCreateCategories || permissions.canEditCategories || permissions.canDeleteCategories,
  };
}; 