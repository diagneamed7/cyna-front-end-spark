import { useState, useEffect } from 'react';
import { evenementService } from '../services/api/evenements';
import type { Evenement, CreateEvenementData, EvenementFilters, InscriptionEvenementData } from '../types/event';
import type { User } from '../types/user';
import type { PaginatedResponse } from '../types/base';

interface UseEvenementsReturn {
  evenements: Evenement[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  // Méthodes
  fetchEvenements: (filters?: EvenementFilters & { page?: number; limit?: number }) => Promise<void>;
  getEvenement: (id: number) => Promise<Evenement | null>;
  createEvenement: (data: CreateEvenementData) => Promise<Evenement | null>;
  updateEvenement: (id: number, data: Partial<CreateEvenementData>) => Promise<Evenement | null>;
  deleteEvenement: (id: number) => Promise<boolean>;
  getUpcomingEvents: (limit?: number, wilaya?: number) => Promise<void>;
  searchEvenements: (query: string, filters?: EvenementFilters) => Promise<void>;
  inscribeToEvent: (id: number, data?: InscriptionEvenementData) => Promise<boolean>;
  unsubscribeFromEvent: (id: number) => Promise<boolean>;
  getEventParticipants: (id: number) => Promise<User[]>;
  getMyEvents: (filters?: EvenementFilters) => Promise<void>;
  getMyInscriptions: (filters?: any) => Promise<void>;
}

export const useEvenements = (): UseEvenementsReturn => {
  const [evenements, setEvenements] = useState<Evenement[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0
  });

  const fetchEvenements = async (filters: EvenementFilters & { page?: number; limit?: number } = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response: PaginatedResponse<Evenement> = await evenementService.getAll(filters);
      setEvenements(response.data.items);
      setPagination({
        page: response.data.page,
        limit: response.data.limit,
        total: response.data.total,
        totalPages: response.data.totalPages
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des événements');
    } finally {
      setLoading(false);
    }
  };

  const getEvenement = async (id: number): Promise<Evenement | null> => {
    setLoading(true);
    setError(null);
    try {
      const evenement = await evenementService.getById(id);
      return evenement;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement de l\'événement');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const createEvenement = async (data: CreateEvenementData): Promise<Evenement | null> => {
    setLoading(true);
    setError(null);
    try {
      const newEvenement = await evenementService.create(data);
      setEvenements(prev => [newEvenement, ...prev]);
      return newEvenement;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création de l\'événement');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateEvenement = async (id: number, data: Partial<CreateEvenementData>): Promise<Evenement | null> => {
    setLoading(true);
    setError(null);
    try {
      const updatedEvenement = await evenementService.update(id, data);
      setEvenements(prev => prev.map(evenement => 
        evenement.id_evenement === id ? updatedEvenement : evenement
      ));
      return updatedEvenement;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour de l\'événement');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteEvenement = async (id: number): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await evenementService.delete(id);
      setEvenements(prev => prev.filter(evenement => evenement.id_evenement !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression de l\'événement');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getUpcomingEvents = async (limit: number = 10, wilaya?: number) => {
    setLoading(true);
    setError(null);
    try {
      const upcoming = await evenementService.getUpcoming(limit, wilaya);
      setEvenements(upcoming);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des événements à venir');
    } finally {
      setLoading(false);
    }
  };

  const searchEvenements = async (query: string, filters: EvenementFilters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const results = await evenementService.search(query, filters);
      setEvenements(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la recherche');
    } finally {
      setLoading(false);
    }
  };

  const inscribeToEvent = async (id: number, data: InscriptionEvenementData = {}): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await evenementService.inscrire(id, data);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'inscription');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const unsubscribeFromEvent = async (id: number): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await evenementService.desinscrire(id);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la désinscription');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const getEventParticipants = async (id: number): Promise<User[]> => {
    setLoading(true);
    setError(null);
    try {
      const participants = await evenementService.getParticipants(id);
      return participants;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des participants');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const getMyEvents = async (filters: EvenementFilters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const myEvents = await evenementService.getMyEvents(filters);
      setEvenements(myEvents);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement de vos événements');
    } finally {
      setLoading(false);
    }
  };

  const getMyInscriptions = async (filters: any = {}) => {
    setLoading(true);
    setError(null);
    try {
      const inscriptions = await evenementService.getMyInscriptions(filters);
      setEvenements(inscriptions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement de vos inscriptions');
    } finally {
      setLoading(false);
    }
  };

  return {
    evenements,
    loading,
    error,
    pagination,
    fetchEvenements,
    getEvenement,
    createEvenement,
    updateEvenement,
    deleteEvenement,
    getUpcomingEvents,
    searchEvenements,
    inscribeToEvent,
    unsubscribeFromEvent,
    getEventParticipants,
    getMyEvents,
    getMyInscriptions
  };
};