import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { AuthAssuranceLevel, Property, SiteSettings, Testimonial } from '../types';
import { properties as defaultProperties } from '../data/properties';
import { DEFAULT_SITE_SETTINGS } from '../data/siteSettings';
import { initialTestimonialsData } from '../../components/ui/testimonials-columns-1';
import {
  AuthStateSummary,
  deleteProperty as dbDeleteProperty,
  deleteReview as dbDeleteReview,
  fetchProperties,
  fetchReviews,
  fetchSiteSettings,
  getAuthStatus,
  isSupabaseConfigured,
  saveProperty as dbSaveProperty,
  saveReview as dbSaveReview,
  saveSiteSettings as dbSaveSiteSettings,
  signOutAdmin,
  supabase,
} from '../lib/supabase';

interface DataContextType {
  properties: Property[];
  reviews: Testimonial[];
  siteSettings: SiteSettings;
  isLoading: boolean;
  isSupabaseConnected: boolean;
  isSupabaseReady: boolean;
  authLoading: boolean;
  authStatus: AuthStateSummary;
  user: User | null;
  aal: AuthAssuranceLevel;
  isAuthenticated: boolean;
  refreshAuthStatus: () => Promise<AuthStateSummary>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  refreshProperties: () => Promise<void>;
  refreshReviews: () => Promise<void>;
  refreshSiteSettings: () => Promise<void>;
  saveProperty: (prop: Property) => Promise<{ success: boolean; error?: string }>;
  removeProperty: (id: string) => Promise<{ success: boolean; error?: string }>;
  deleteProperty: (id: string) => Promise<{ success: boolean; error?: string }>;
  saveReview: (review: Testimonial) => Promise<{ success: boolean; error?: string }>;
  removeReview: (id: string) => Promise<{ success: boolean; error?: string }>;
  deleteReview: (id: string) => Promise<{ success: boolean; error?: string }>;
  saveSiteSettings: (settings: SiteSettings) => Promise<{ success: boolean; error?: string }>;
  toggleFeaturedProperty: (id: string) => Promise<{ success: boolean; ids: string[]; error?: string }>;
}

const emptyAuthStatus: AuthStateSummary = {
  user: null,
  hasSession: false,
  aal: null,
  nextLevel: null,
  verifiedFactors: [],
  unverifiedFactors: [],
  isAal2: false,
};

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [properties, setProperties] = useState<Property[]>(defaultProperties);
  const [reviews, setReviews] = useState<Testimonial[]>(initialTestimonialsData);
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [authStatus, setAuthStatus] = useState<AuthStateSummary>(emptyAuthStatus);

  const refreshAuthStatus = useCallback(async (): Promise<AuthStateSummary> => {
    const status = await getAuthStatus();
    setAuthStatus(status);
    setAuthLoading(false);
    return status;
  }, []);

  useEffect(() => {
    let mounted = true;

    refreshAuthStatus();

    if (!supabase) {
      setAuthLoading(false);
      return;
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      if (mounted) {
        refreshAuthStatus();
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [refreshAuthStatus]);

  const loadAllData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [propsData, reviewsData, settingsData] = await Promise.all([
        fetchProperties(),
        fetchReviews(),
        fetchSiteSettings(),
      ]);
      setProperties(propsData);
      setReviews(reviewsData);
      setSiteSettings(settingsData);
    } catch (err) {
      console.error('Erro ao carregar dados públicos do Supabase:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const handleSaveProperty = async (prop: Property): Promise<{ success: boolean; error?: string }> => {
    const res = await dbSaveProperty(prop);
    if (res.success) {
      const updated = await fetchProperties();
      setProperties(updated);
    }
    return res;
  };

  const handleDeleteProperty = async (id: string): Promise<{ success: boolean; error?: string }> => {
    const res = await dbDeleteProperty(id);
    if (res.success) {
      const updated = await fetchProperties();
      setProperties(updated);
    }
    return res;
  };

  const handleSaveReview = async (
    review: Testimonial
  ): Promise<{ success: boolean; error?: string }> => {
    const res = await dbSaveReview(review);
    if (res.success) {
      const updated = await fetchReviews();
      setReviews(updated);
    }
    return res;
  };

  const handleDeleteReview = async (id: string): Promise<{ success: boolean; error?: string }> => {
    const res = await dbDeleteReview(id);
    if (res.success) {
      const updated = await fetchReviews();
      setReviews(updated);
    }
    return res;
  };

  const handleSaveSiteSettings = async (
    settings: SiteSettings
  ): Promise<{ success: boolean; error?: string }> => {
    const res = await dbSaveSiteSettings(settings);
    if (res.success) {
      setSiteSettings(settings);
    }
    return res;
  };

  const handleToggleFeaturedProperty = async (
    id: string
  ): Promise<{ success: boolean; ids: string[]; error?: string }> => {
    const current = siteSettings.featuredIds || [];
    let updated: string[];
    if (current.includes(id)) {
      if (current.length <= 1) {
        return {
          success: false,
          ids: current,
          error: 'É necessário manter pelo menos 1 imóvel em destaque.',
        };
      }
      updated = current.filter((item) => item !== id);
    } else {
      updated = [...current, id];
    }

    const nextSettings: SiteSettings = {
      ...siteSettings,
      featuredIds: updated,
    };
    const res = await handleSaveSiteSettings(nextSettings);
    return {
      success: res.success,
      ids: res.success ? updated : current,
      error: res.error,
    };
  };

  const handleLogout = async () => {
    await signOutAdmin();
    setAuthStatus(emptyAuthStatus);
  };

  const handleRefresh = async () => {
    await loadAllData();
  };

  return (
    <DataContext.Provider
      value={{
        properties,
        reviews,
        siteSettings,
        isLoading,
        isSupabaseConnected: isSupabaseConfigured,
        isSupabaseReady: isSupabaseConfigured,
        authLoading,
        authStatus,
        user: authStatus.user,
        aal: authStatus.aal,
        isAuthenticated: authStatus.isAal2,
        refreshAuthStatus,
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
        refreshSiteSettings: async () => {
          const data = await fetchSiteSettings();
          setSiteSettings(data);
        },
        saveProperty: handleSaveProperty,
        removeProperty: handleDeleteProperty,
        deleteProperty: handleDeleteProperty,
        saveReview: handleSaveReview,
        removeReview: handleDeleteReview,
        deleteReview: handleDeleteReview,
        saveSiteSettings: handleSaveSiteSettings,
        toggleFeaturedProperty: handleToggleFeaturedProperty,
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
