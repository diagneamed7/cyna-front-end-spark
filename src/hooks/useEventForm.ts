import { useEvenements } from './useEvenements';
import type { CreateEvenementData } from '../types/event';

interface EventFormData {
  nom_evenement: string;
  description: string;
  date_debut: string;
  date_fin: string;
  lieu: string;
  adresse: string;
  wilaya: string;
  tarif: number | '';
  capacite_max: number | '';
  age_minimum: number | '';
  type_evenement: string;
  organisateur: string;
  contact_email: string;
  contact_telephone: string;
  image_url: string;
}

export const useEventForm = (initialData?: Partial<EventFormData>) => {
  const { metadata } = useMetadata();
  const { createEvenement } = useEvenements();

  const formConfig = {
    fields: {
      nom_evenement: {
        initialValue: initialData?.nom_evenement || '',
        required: true,
        validators: [
          {
            test: (value: string) => value.length >= 3,
            message: 'Le nom doit contenir au moins 3 caractères'
          }
        ]
      },
      description: {
        initialValue: initialData?.description || '',
        required: true,
        validators: [
          {
            test: (value: string) => value.length >= 20,
            message: 'La description doit contenir au moins 20 caractères'
          }
        ]
      },
      date_debut: {
        initialValue: initialData?.date_debut || '',
        required: true,
        validators: [
          {
            test: (value: string) => new Date(value) > new Date(),
            message: 'La date de début doit être dans le futur'
          }
        ]
      },
      date_fin: {
        initialValue: initialData?.date_fin || '',
        required: true,
        validators: [
          {
            test: (value: string) => {
              // Validé quand date_debut change aussi
              return true; // Validation complexe gérée séparément
            },
            message: 'La date de fin doit être après la date de début'
          }
        ]
      },
      lieu: {
        initialValue: initialData?.lieu || '',
        required: true
      },
      adresse: {
        initialValue: initialData?.adresse || '',
        required: true
      },
      wilaya: {
        initialValue: initialData?.wilaya || '',
        required: true
      },
      tarif: {
        initialValue: initialData?.tarif || '',
        validators: [
          {
            test: (value: number | '') => value === '' || Number(value) >= 0,
            message: 'Le tarif ne peut pas être négatif'
          }
        ]
      },
      capacite_max: {
        initialValue: initialData?.capacite_max || '',
        validators: [
          {
            test: (value: number | '') => value === '' || Number(value) > 0,
            message: 'La capacité doit être supérieure à 0'
          }
        ]
      },
      age_minimum: {
        initialValue: initialData?.age_minimum || '',
        validators: [
          {
            test: (value: number | '') => value === '' || (Number(value) >= 0 && Number(value) <= 99),
            message: 'L\'âge minimum doit être entre 0 et 99 ans'
          }
        ]
      },
      type_evenement: {
        initialValue: initialData?.type_evenement || '',
        required: true
      },
      organisateur: {
        initialValue: initialData?.organisateur || '',
        required: true
      },
      contact_email: {
        initialValue: initialData?.contact_email || '',
        required: true,
        validators: [
          {
            test: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
            message: 'Format d\'email invalide'
          }
        ]
      },
      contact_telephone: {
        initialValue: initialData?.contact_telephone || '',
        validators: [
          {
            test: (value: string) => !value || /^(\+213|0)[5-7][0-9]{8}$/.test(value.replace(/\s/g, '')),
            message: 'Format de téléphone algérien invalide'
          }
        ]
      },
      image_url: {
        initialValue: initialData?.image_url || ''
      }
    },
    onSubmit: async (values: EventFormData) => {
      const eventData: CreateEvenementData = {
        nom_evenement: values.nom_evenement,
        description: values.description,
        date_debut: values.date_debut,
        date_fin: values.date_fin,
        lieu: values.lieu,
        adresse: values.adresse,
        wilaya: Number(values.wilaya),
        tarif: values.tarif ? Number(values.tarif) : 0,
        capacite_max: values.capacite_max ? Number(values.capacite_max) : undefined,
        age_minimum: values.age_minimum ? Number(values.age_minimum) : undefined,
        type_evenement: Number(values.type_evenement),
        organisateur: values.organisateur,
        contact_email: values.contact_email,
        contact_telephone: values.contact_telephone,
        image_url: values.image_url
      };

      await createEvenement(eventData);
    }
  };

  const form = useForm(formConfig);

  // Validation croisée pour les dates
  const validateDates = () => {
    const { date_debut, date_fin } = form.values;
    if (date_debut && date_fin) {
      if (new Date(date_fin) <= new Date(date_debut)) {
        form.setError('date_fin', 'La date de fin doit être après la date de début');
        return false;
      } else {
        form.clearError('date_fin');
        return true;
      }
    }
    return true;
  };

  // Override setValue pour validation croisée
  const originalSetValue = form.setValue;
  form.setValue = (field, value) => {
    originalSetValue(field, value);
    if (field === 'date_debut' || field === 'date_fin') {
      setTimeout(validateDates, 0);
    }
  };

  return {
    ...form,
    metadata,
    wilayaOptions: metadata.wilayas.map(wilaya => ({
      value: wilaya.id_wilaya.toString(),
      label: wilaya.nom
    })),
    typeOptions: metadata.types_evenements.map(type => ({
      value: type.id_type_evenement.toString(),
      label: type.nom_type
    })),
    validateDates
  };
};
