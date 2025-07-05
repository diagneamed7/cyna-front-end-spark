import { useState, useEffect } from 'react';
import { patrimoineService } from '../services/api/patrimoine';
import type { Lieu, CreateLieuData, LieuFilters, ProximiteFilters } from '../types/place';
import type { PaginatedResponse } from '../types/base';

interface UsePatrimoineReturn {
  sites: Lieu[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  // Méthodes
  fetchSites: (filters?: LieuFilters & { page?: number; limit?: number }) => Promise<void>;
  getSite: (id: number) => Promise<Lieu | null>;
  createSite: (data: CreateLieuData) => Promise<Lieu | null>;
  updateSite: (id: number, data: Partial<CreateLieuData>) => Promise<Lieu | null>;
  deleteSite: (id: number) => Promise<boolean>;
  searchSites: (query: string, filters?: any) => Promise<void>;
  getSitesProches: (params: ProximiteFilters) => Promise<void>;
  getPopulaires: (limit?: number) => Promise<void>;
  getMonuments: (filters?: any) => Promise<void>;
  getVestiges: (filters?: any) => Promise<void>;
  addMediaToSite: (siteId: number, file: File, metadata?: any) => Promise<boolean>;
}

export const usePatrimoine = (): UsePatrimoineReturn => {
  const [sites, setSites] = useState<Lieu[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0
  });

  const fetchSites = async (filters: LieuFilters & { page?: number; limit?: number } = {}) => {
    setLoading(true);
    setError(null);
    try {
      const response: PaginatedResponse<Lieu> = await patrimoineService.getAllSites(filters);
      setSites(response.data.items);
      setPagination({
        page: response.data.page,
        limit: response.data.limit,
        total: response.data.total,
        totalPages: response.data.totalPages
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des sites');
    } finally {
      setLoading(false);
    }
  };

  const getSite = async (id: number): Promise<Lieu | null> => {
    setLoading(true);
    setError(null);
    try {
      const site = await patrimoineService.getSiteById(id);
      return site;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement du site');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const createSite = async (data: CreateLieuData): Promise<Lieu | null> => {
    setLoading(true);
    setError(null);
    try {
      const newSite = await patrimoineService.createSite(data);
      setSites(prev => [newSite, ...prev]);
      return newSite;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création du site');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateSite = async (id: number, data: Partial<CreateLieuData>): Promise<Lieu | null> => {
    setLoading(true);
    setError(null);
    try {
      const updatedSite = await patrimoineService.updateSite(id, data);
      setSites(prev => prev.map(site => 
        site.id_lieu === id ? updatedSite : site
      ));
      return updatedSite;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour du site');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteSite = async (id: number): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await patrimoineService.deleteSite(id);
      setSites(prev => prev.filter(site => site.id_lieu !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la suppression du site');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const searchSites = async (query: string, filters: any = {}) => {
    setLoading(true);
    setError(null);
    try {
      const results = await patrimoineService.search(query, filters);
      setSites(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la recherche');
    } finally {
      setLoading(false);
    }
  };

  const getSitesProches = async (params: ProximiteFilters) => {
    setLoading(true);
    setError(null);
    try {
      const nearby = await patrimoineService.getSitesProches(params);
      setSites(nearby);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la recherche de sites proches');
    } finally {
      setLoading(false);
    }
  };

  const getPopulaires = async (limit: number = 10) => {
    setLoading(true);
    setError(null);
    try {
      const popular = await patrimoineService.getPopulaires(limit);
      setSites(popular);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des sites populaires');
    } finally {
      setLoading(false);
    }
  };

  const getMonuments = async (filters: any = {}) => {
    setLoading(true);
    setError(null);
    try {
      const monuments = await patrimoineService.getAllMonuments(filters);
      setSites(monuments);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des monuments');
    } finally {
      setLoading(false);
    }
  };

  const getVestiges = async (filters: any = {}) => {
    setLoading(true);
    setError(null);
    try {
      const vestiges = await patrimoineService.getAllVestiges(filters);
      setSites(vestiges);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des vestiges');
    } finally {
      setLoading(false);
    }
  };

  const addMediaToSite = async (siteId: number, file: File, metadata: any = {}): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await patrimoineService.addMedia(siteId, file, metadata);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'ajout du média');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    sites,
    loading,
    error,
    pagination,
    fetchSites,
    getSite,
    createSite,
    updateSite,
    deleteSite,
    searchSites,
    getSitesProches,
    getPopulaires,
    getMonuments,
    getVestiges,
    addMediaToSite
  };
};