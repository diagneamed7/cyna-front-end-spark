// src/hooks/useForm.ts - Hook générique pour la gestion des formulaires
import { useState, useCallback } from 'react';

interface ValidationRule<T> {
  test: (value: T) => boolean;
  message: string;
}

interface FieldConfig<T> {
  initialValue: T;
  validators?: ValidationRule<T>[];
  required?: boolean;
}

interface FormConfig<T extends Record<string, any>> {
  fields: {
    [K in keyof T]: FieldConfig<T[K]>;
  };
  onSubmit?: (values: T) => void | Promise<void>;
}

interface UseFormReturn<T extends Record<string, any>> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isValid: boolean;
  isSubmitting: boolean;
  setValue: <K extends keyof T>(field: K, value: T[K]) => void;
  setFieldTouched: <K extends keyof T>(field: K, touched?: boolean) => void;
  setError: <K extends keyof T>(field: K, error: string) => void;
  clearError: <K extends keyof T>(field: K) => void;
  resetForm: () => void;
  validateField: <K extends keyof T>(field: K) => boolean;
  validateForm: () => boolean;
  handleSubmit: (e?: React.FormEvent) => Promise<void>;
}

export const useForm = <T extends Record<string, any>>(
  config: FormConfig<T>
): UseFormReturn<T> => {
  // Initialisation des valeurs
  const initialValues = Object.keys(config.fields).reduce((acc, key) => {
    acc[key as keyof T] = config.fields[key as keyof T].initialValue;
    return acc;
  }, {} as T);

  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setValue = useCallback(<K extends keyof T>(field: K, value: T[K]) => {
    setValues(prev => ({ ...prev, [field]: value }));
    // Valider le champ si il a été touché
    if (touched[field]) {
      setTimeout(() => validateField(field), 0);
    }
  }, [touched]);

  const setFieldTouched = useCallback(<K extends keyof T>(field: K, isTouched: boolean = true) => {
    setTouched(prev => ({ ...prev, [field]: isTouched }));
  }, []);

  const setError = useCallback(<K extends keyof T>(field: K, error: string) => {
    setErrors(prev => ({ ...prev, [field]: error }));
  }, []);

  const clearError = useCallback(<K extends keyof T>(field: K) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const validateField = useCallback(<K extends keyof T>(field: K): boolean => {
    const fieldConfig = config.fields[field];
    const value = values[field];
    
    // Vérifier si requis
    if (fieldConfig.required && (!value || (typeof value === 'string' && !value.trim()))) {
      setError(field, 'Ce champ est requis');
      return false;
    }

    // Appliquer les validateurs
    if (fieldConfig.validators) {
      for (const validator of fieldConfig.validators) {
        if (!validator.test(value)) {
          setError(field, validator.message);
          return false;
        }
      }
    }

    clearError(field);
    return true;
  }, [values, setError, clearError, config.fields]);

  const validateForm = useCallback((): boolean => {
    let isFormValid = true;
    
    Object.keys(config.fields).forEach(field => {
      const fieldKey = field as keyof T;
      const isFieldValid = validateField(fieldKey);
      if (!isFieldValid) {
        isFormValid = false;
      }
      setFieldTouched(fieldKey, true);
    });

    return isFormValid;
  }, [config.fields, validateField, setFieldTouched]);

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }

    if (!validateForm()) {
      return;
    }

    if (config.onSubmit) {
      setIsSubmitting(true);
      try {
        await config.onSubmit(values);
      } catch (error) {
        console.error('Erreur lors de la soumission:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  }, [validateForm, config.onSubmit, values]);

  const isValid = Object.keys(errors).length === 0;

  return {
    values,
    errors,
    touched,
    isValid,
    isSubmitting,
    setValue,
    setFieldTouched,
    setError,
    clearError,
    resetForm,
    validateField,
    validateForm,
    handleSubmit
  };
};
