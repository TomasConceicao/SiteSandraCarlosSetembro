import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Property, Testimonial } from '../types';
import {
  fetchProperties,
  fetchReviews,
  getLocalProperties,
  getLocalReviews,
  saveProperty as dbSaveProperty,
  deleteProperty as dbDeleteProperty,
  saveReview as dbSaveReview,
  deleteReview as dbDeleteReview,
  isSupabaseConfigured,
  checkIsAdminAuthenticated,
  signInAdmin,
  signOutAdmin,
} from '../lib/supabase';

interface DataContextType {
  properties: Property[];
  reviews: Testimonial[];
  isLoading: boolean;
  isSupabaseConnected: boolean;
  isSupabaseReady: boolean;
  isAuthenticated: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void> | void;
  refresh: () => Promise<void>;
  refreshProperties: () => Promise<void>;
  refreshReviews: () => Promise<void>;
  saveProperty: (prop: Property) => Promise<{ success: boolean; error?: string }>;
  removeProperty: (id: string) => Promise<boolean>;
  deleteProperty: (id: string) => Promise<boolean>;
  saveReview: (review: Testimonial) => Promise<{ success: boolean; error?: string }>;
  removeReview: (id: string) => Promise<boolean>;
  deleteReview: (id: string) => Promise<boolean>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [properties, setProperties] = useState<Property[]>(() => getLocalProperties());
  const [reviews, setReviews] = useState<Testimonial[]>(() => getLocalReviews());
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Verifica estado de autenticação inicial
  useEffect(() => {
    checkIsAdminAuthenticated().then((auth) => {
      setIsAuthenticated(auth);
    });
  }, []);

  const loadAllData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [propsData, reviewsData] = await Promise.all([
        fetchProperties(),
        fetchReviews(),
      ]);
      setProperties(propsData);
      setReviews(reviewsData);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllData();

    // Listeners para atualizações dinâmicas
    const handlePropsUpdated = (e: any) => {
      if (e.detail) setProperties(e.detail);
      else fetchProperties().then(setProperties);
    };

    const handleReviewsUpdated = (e: any) => {
      if (e.detail) setReviews(e.detail);
      else fetchReviews().then(setReviews);
    };

    window.addEventListener('properties_updated', handlePropsUpdated);
    window.addEventListener('reviews_updated', handleReviewsUpdated);

    return () => {
      window.removeEventListener('properties_updated', handlePropsUpdated);
      window.removeEventListener('reviews_updated', handleReviewsUpdated);
    };
  }, [loadAllData]);

  const handleSaveProperty = async (prop: Property): Promise<{ success: boolean; error?: string }> => {
    const res = await dbSaveProperty(prop);
    if (res.success) {
      const updated = await fetchProperties();
      setProperties(updated);
    }
    return res;
  };

  const handleDeleteProperty = async (id: string): Promise<boolean> => {
    const res = await dbDeleteProperty(id);
    if (res.success) {
      const updated = await fetchProperties();
      setProperties(updated);
    }
    return Boolean(res.success);
  };

  const handleSaveReview = async (review: Testimonial): Promise<{ success: boolean; error?: string }> => {
    const res = await dbSaveReview(review);
    if (res.success) {
      const updated = await fetchReviews();
      setReviews(updated);
    }
    return res;
  };

  const handleDeleteReview = async (id: string): Promise<boolean> => {
    const res = await dbDeleteReview(id);
    if (res.success) {
      const updated = await fetchReviews();
      setReviews(updated);
    }
    return Boolean(res.success);
  };

  const handleLogin = async (email: string, pass: string) => {
    const result = await signInAdmin(email, pass);
    if (result.success) {
      setIsAuthenticated(true);
    }
    return result;
  };

  const handleLogout = async () => {
    await signOutAdmin();
    setIsAuthenticated(false);
  };

  const handleRefresh = async () => {
    await loadAllData();
  };

  return (
    <DataContext.Provider
      value={{
        properties,
        reviews,
        isLoading,
        isSupabaseConnected: isSupabaseConfigured,
        isSupabaseReady: isSupabaseConfigured,
        isAuthenticated,
        login: handleLogin,
        logout: handleLogout,
        refresh: handleRefresh,
        refreshProperties: async () => {
          const data = await fetchProperties();
          setProperties(data);
        },
        refreshReviews: async () => {
          const data = await fetchReviews();
          setReviews(data);
        },
        saveProperty: handleSaveProperty,
        removeProperty: handleDeleteProperty,
        deleteProperty: handleDeleteProperty,
        saveReview: handleSaveReview,
        removeReview: handleDeleteReview,
        deleteReview: handleDeleteReview,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export function useData(): DataContextType {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData deve ser utilizado dentro de um DataProvider');
  }
  return context;
}
