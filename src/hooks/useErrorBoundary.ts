// src/hooks/useErrorBoundary.ts - Hook pour la gestion d'erreurs
import { useState, useCallback } from 'react';

interface ErrorInfo {
  message: string;
  stack?: string;
  timestamp: Date;
  id: string;
}

export const useErrorBoundary = () => {
  const [errors, setErrors] = useState<ErrorInfo[]>([]);

  const captureError = useCallback((error: Error, context?: string) => {
    const errorInfo: ErrorInfo = {
      message: error.message,
      stack: error.stack,
      timestamp: new Date(),
      id: Date.now().toString()
    };

    setErrors(prev => [errorInfo, ...prev.slice(0, 9)]); // Garder max 10 erreurs

    // Log vers le service de monitoring en production
    if (process.env.NODE_ENV === 'production') {
      // logErrorToService(errorInfo, context);
    }

    console.error(`Erreur capturée ${context ? `dans ${context}` : ''}:`, error);
  }, []);

  const clearErrors = useCallback(() => {
    setErrors([]);
  }, []);

  const removeError = useCallback((id: string) => {
    setErrors(prev => prev.filter(error => error.id !== id));
  }, []);

  return {
    errors,
    captureError,
    clearErrors,
    removeError,
    hasErrors: errors.length > 0
  };
};

