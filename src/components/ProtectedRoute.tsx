// src/components/ProtectedRoute.tsx - Composant de protection de route pour l'administration

import * as React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useAdmin } from '../hooks/useAdmin';
import { Loading } from './UI';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
  fallback?: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
  requireAdmin = false,
  fallback
}) => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { canViewAdminPanel } = useAdmin();

  // Affichage du loader pendant le chargement
  if (authLoading) {
    return <Loading overlay text="Vérification des permissions..." />;
  }

  // Vérification de l'authentification
  if (requireAuth && !isAuthenticated) {
    return fallback || (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Accès refusé</h1>
          <p className="text-gray-600 mb-4">Vous devez être connecté pour accéder à cette page.</p>
          <a
            href="/connexion"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Se connecter
          </a>
        </div>
      </div>
    );
  }

  // Vérification des permissions d'administration
  if (requireAdmin && !canViewAdminPanel) {
    return fallback || (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Accès refusé</h1>
          <p className="text-gray-600 mb-4">Vous n'avez pas les permissions d'administrateur nécessaires.</p>
          <a
            href="/"
            className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Retour à l'accueil
          </a>
        </div>
      </div>
    );
  }

  // Affichage du contenu protégé
  return <>{children}</>;
};

export default ProtectedRoute; 