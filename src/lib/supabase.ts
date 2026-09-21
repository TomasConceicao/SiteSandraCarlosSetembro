import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { Property, PropertyStatus, Testimonial } from '../types';
import { properties as defaultProperties } from '../data/properties';
import { initialTestimonialsData } from '../../components/ui/testimonials-columns-1';

// Credenciais do Supabase (URL e Publishable key fornecidos)
export const DEFAULT_SUPABASE_URL = 'https://nlcwrorinmlcevvesyoa.supabase.co';
export const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_4ZKAMhTveJivpTlb2AyUrg_LnWfiEij';

/**
 * Limpa e valida uma string de URL garantindo que tenha protocolo HTTP ou HTTPS
 */
function cleanHttpUrl(raw: unknown): string {
  if (!raw) return '';
  let str = String(raw).trim().replace(/^['"]|['"]$/g, '');
  if (!str || str === 'undefined' || str === 'null') return '';

  // Se não tiver protocolo, adiciona https://
  if (!/^https?:\/\//i.test(str)) {
    str = 'https://' + str;
  }

  try {
    const parsed = new URL(str);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.origin;
    }
  } catch {
    return '';
  }
  return '';
}

const resolveSupabaseUrl = (): string => {
  if (typeof window !== 'undefined') {
    try {
      const fromStorage = localStorage.getItem('VITE_SUPABASE_URL');
      const cleaned = cleanHttpUrl(fromStorage);
      if (cleaned && !cleaned.includes('placeholder') && !cleaned.includes('your-project')) {
        return cleaned;
      }
      if (fromStorage) {
        localStorage.removeItem('VITE_SUPABASE_URL');
      }
    } catch {
      // ignore
    }
  }

  const envVal = (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_SUPABASE_URL;
  const cleanedEnv = cleanHttpUrl(envVal);
  if (cleanedEnv && !cleanedEnv.includes('placeholder') && !cleanedEnv.includes('your-project')) {
    return cleanedEnv;
  }

  return DEFAULT_SUPABASE_URL;
};

const resolveSupabaseAnonKey = (): string => {
  if (typeof window !== 'undefined') {
    try {
      const fromStorage = localStorage.getItem('VITE_SUPABASE_ANON_KEY');
      if (fromStorage && fromStorage.trim() && fromStorage !== 'undefined' && fromStorage !== 'null') {
        const cleaned = fromStorage.trim().replace(/^['"]|['"]$/g, '');
        if (cleaned.length > 10 && !cleaned.includes('placeholder')) {
          return cleaned;
        }
      }
      if (fromStorage) {
        localStorage.removeItem('VITE_SUPABASE_ANON_KEY');
      }
    } catch {
      // ignore
    }
  }

  const envVal = (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_SUPABASE_ANON_KEY;
  if (envVal && envVal.trim() && envVal !== 'undefined' && envVal !== 'null') {
    const cleaned = envVal.trim().replace(/^['"]|['"]$/g, '');
    if (cleaned.length > 10 && !cleaned.includes('placeholder')) {
      return cleaned;
    }
  }

  return DEFAULT_SUPABASE_ANON_KEY;
};

export const supabaseUrl = resolveSupabaseUrl();
export const supabaseAnonKey = resolveSupabaseAnonKey();

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  (supabaseUrl.startsWith('http://') || supabaseUrl.startsWith('https://')) &&
  supabaseUrl !== 'https://your-project.supabase.co' &&
  !supabaseUrl.includes('placeholder')
);

// Cliente Supabase seguro com tratamento de erros preventivo
function initSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  try {
    // Garantir uso seguro do fetch nativo sem depender de reescrita global
    const safeFetch: typeof fetch = (input: RequestInfo | URL, init?: RequestInit) => {
      return window.fetch(input, init);
    };

    return createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
      global: {
        fetch: safeFetch,
      },
    });
  } catch (err) {
    console.warn('Não foi possível inicializar o cliente Supabase:', err);
    return null;
  }
}

export const supabase: SupabaseClient | null = initSupabaseClient();

// ==========================================
// SERVIÇO DE AUTENTICAÇÃO
// ==========================================

export async function getCurrentUser(): Promise<User | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) return null;
    return data.user;
  } catch {
    return null;
  }
}

export async function signInAdmin(email: string, password: string): Promise<{ success: boolean; error?: string }> {
  // Acesso de administrador direto com credenciais predefinidas
  if (email.trim().toLowerCase() === 'admin@sandracarlos.pt' && password === 'admin123') {
    const mockSession = { email: 'admin@sandracarlos.pt', role: 'authenticated', expires: Date.now() + 86400000 };
    localStorage.setItem('sc_local_admin_session', JSON.stringify(mockSession));
    window.dispatchEvent(new Event('auth_state_changed'));
    return { success: true };
  }

  if (!supabase) {
    return {
      success: false,
      error: 'Credenciais inválidas. Para aceder, utilize: admin@sandracarlos.pt / admin123',
    };
  }

  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password,
    });

    if (error) {
      return { success: false, error: error.message || 'Credenciais inválidas.' };
    }

    window.dispatchEvent(new Event('auth_state_changed'));
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Erro inesperado na autenticação.' };
  }
}

export async function signOutAdmin(): Promise<void> {
  localStorage.removeItem('sc_local_admin_session');
  if (supabase) {
    await supabase.auth.signOut();
  }
  window.dispatchEvent(new Event('auth_state_changed'));
}

export function isLocalAdminAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const raw = localStorage.getItem('sc_local_admin_session');
    if (!raw) return false;
    const data = JSON.parse(raw);
    return Boolean(data && data.expires && data.expires > Date.now());
  } catch {
    return false;
  }
}

export async function checkIsAdminAuthenticated(): Promise<boolean> {
  if (isLocalAdminAuthenticated()) return true;
  if (supabase) {
    const user = await getCurrentUser();
    return Boolean(user);
  }
  return false;
}

// ==========================================
// SERVIÇO DE IMÓVEIS (PROPERTIES)
// ==========================================

const LOCAL_PROPERTIES_KEY = 'sc_properties_db';

export function getLocalProperties(): Property[] {
  if (typeof window === 'undefined') return defaultProperties;
  try {
    const raw = localStorage.getItem(LOCAL_PROPERTIES_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // fallback
  }
  return defaultProperties;
}

export function setLocalProperties(props: Property[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_PROPERTIES_KEY, JSON.stringify(props));
    window.dispatchEvent(new CustomEvent('properties_updated', { detail: props }));
  } catch {
    // ignore
  }
}

/**
 * Normaliza um registo da base de dados garantindo que campos vazios são limpos (undefined)
 * para cumprir a regra de ouro:
 * "se do admin alguma das caixas para preencher nao for preenchida nao aparece na pagina do site"
 */
export function sanitizeProperty(prop: any): Property {
  const cleanStr = (val: any) => (typeof val === 'string' && val.trim() !== '' ? val.trim() : undefined);
  const cleanArr = (arr: any) => (Array.isArray(arr) && arr.length > 0 ? arr.filter((x) => Boolean(x && typeof x === 'string' ? x.trim() : x)) : undefined);

  return {
    id: prop.id,
    title: prop.title || '',
    subtitle: cleanStr(prop.subtitle),
    status: (prop.status as PropertyStatus) || 'disponivel',
    statusLabel: cleanStr(prop.statusLabel || prop.status_label),
    location: prop.location || '',
    address: cleanStr(prop.address),
    locationPrecision: prop.locationPrecision || prop.location_precision || 'exata',
    typology: prop.typology || '',
    area: prop.area || '',
    bedrooms: typeof prop.bedrooms === 'number' && !isNaN(prop.bedrooms) && prop.bedrooms > 0 ? prop.bedrooms : undefined,
    bathrooms: typeof prop.bathrooms === 'number' && !isNaN(prop.bathrooms) && prop.bathrooms > 0 ? prop.bathrooms : undefined,
    halfBaths: typeof prop.halfBaths === 'number' && !isNaN(prop.halfBaths) && prop.halfBaths > 0 ? prop.halfBaths : (typeof prop.half_baths === 'number' && prop.half_baths > 0 ? prop.half_baths : undefined),
    description: prop.description || '',
    extendedDescription: cleanArr(prop.extendedDescription || prop.extended_description),
    image: prop.image || '',
    secondaryImages: cleanArr(prop.secondaryImages || prop.secondary_images) || [],
    architecturalHighlights: cleanArr(prop.architecturalHighlights || prop.architectural_highlights) || [],
    year: prop.year ? String(prop.year).trim() : '',
    energyCertificate: cleanStr(prop.energyCertificate || prop.energy_certificate),
    price: cleanStr(prop.price),
    videoUrl: cleanStr(prop.videoUrl || prop.video_url),
    videoThumbnail: cleanStr(prop.videoThumbnail || prop.video_thumbnail),
    mapCoordinates: prop.mapCoordinates || prop.map_coordinates || (prop.lat && prop.lng ? {
      lat: Number(prop.lat),
      lng: Number(prop.lng),
      zoom: prop.zoom ? Number(prop.zoom) : 16,
      precision: prop.locationPrecision || prop.location_precision || 'exata',
      circleRadius: prop.circleRadius || prop.circle_radius ? Number(prop.circleRadius || prop.circle_radius) : undefined,
    } : undefined),
    interiorFeatures: Array.isArray(prop.interiorFeatures || prop.interior_features) && (prop.interiorFeatures || prop.interior_features).length > 0
      ? (prop.interiorFeatures || prop.interior_features).filter((f: any) => f && f.label && f.value)
      : undefined,
    exteriorFeatures: Array.isArray(prop.exteriorFeatures || prop.exterior_features) && (prop.exteriorFeatures || prop.exterior_features).length > 0
      ? (prop.exteriorFeatures || prop.exterior_features).filter((f: any) => f && f.label && f.value)
      : undefined,
    detailsFeatures: Array.isArray(prop.detailsFeatures || prop.details_features) && (prop.detailsFeatures || prop.details_features).length > 0
      ? (prop.detailsFeatures || prop.details_features).filter((f: any) => f && f.label && f.value)
      : undefined,
    financialDetails: Array.isArray(prop.financialDetails || prop.financial_details) && (prop.financialDetails || prop.financial_details).length > 0
      ? (prop.financialDetails || prop.financial_details).filter((f: any) => f && f.label && f.value)
      : undefined,
  };
}

export async function fetchProperties(): Promise<Property[]> {
  if (!supabase) {
    return getLocalProperties();
  }

  try {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      console.warn('Erro ou lista vazia ao carregar do Supabase:', error);
      return getLocalProperties();
    }

    return data.map(sanitizeProperty);
  } catch (err) {
    console.error('Falha de rede com Supabase:', err);
    return getLocalProperties();
  }
}

export async function saveProperty(property: Property): Promise<{ success: boolean; error?: string }> {
  // Garantir higienização
  const sanitized = sanitizeProperty(property);

  if (!supabase) {
    const current = getLocalProperties();
    const index = current.findIndex((p) => p.id === sanitized.id);
    let updated: Property[];
    if (index >= 0) {
      updated = [...current];
      updated[index] = sanitized;
    } else {
      updated = [sanitized, ...current];
    }
    setLocalProperties(updated);
    return { success: true };
  }

  try {
    const dbPayload = {
      id: sanitized.id,
      title: sanitized.title,
      subtitle: sanitized.subtitle || null,
      status: sanitized.status || 'disponivel',
      status_label: sanitized.statusLabel || null,
      location: sanitized.location,
      address: sanitized.address || null,
      location_precision: sanitized.locationPrecision || 'exata',
      typology: sanitized.typology,
      area: sanitized.area,
      bedrooms: sanitized.bedrooms || null,
      bathrooms: sanitized.bathrooms || null,
      half_baths: sanitized.halfBaths || null,
      description: sanitized.description,
      extended_description: sanitized.extendedDescription || null,
      image: sanitized.image,
      secondary_images: sanitized.secondaryImages || [],
      architectural_highlights: sanitized.architecturalHighlights || [],
      year: sanitized.year || null,
      energy_certificate: sanitized.energyCertificate || null,
      price: sanitized.price || null,
      video_url: sanitized.videoUrl || null,
      video_thumbnail: sanitized.videoThumbnail || null,
      map_coordinates: sanitized.mapCoordinates || null,
      interior_features: sanitized.interiorFeatures || null,
      exterior_features: sanitized.exteriorFeatures || null,
      details_features: sanitized.detailsFeatures || null,
      financial_details: sanitized.financialDetails || null,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('properties')
      .upsert(dbPayload, { onConflict: 'id' });

    if (error) {
      // Guarda localmente para não perder dados mesmo com erro no Supabase
      const current = getLocalProperties();
      const index = current.findIndex((p) => p.id === sanitized.id);
      if (index >= 0) {
        current[index] = sanitized;
      } else {
        current.unshift(sanitized);
      }
      setLocalProperties(current);
      return { success: false, error: error.message };
    }

    // Atualiza também cache local
    const current = getLocalProperties();
    const index = current.findIndex((p) => p.id === sanitized.id);
    if (index >= 0) {
      current[index] = sanitized;
    } else {
      current.unshift(sanitized);
    }
    setLocalProperties(current);

    return { success: true };
  } catch (err: any) {
    // Salvaguarda local garantida
    const current = getLocalProperties();
    const index = current.findIndex((p) => p.id === sanitized.id);
    if (index >= 0) {
      current[index] = sanitized;
    } else {
      current.unshift(sanitized);
    }
    setLocalProperties(current);

    const msg = err?.message || 'Falha de ligação';
    return { success: false, error: `${msg} (o imóvel foi guardado localmente)` };
  }
}

export async function deleteProperty(id: string): Promise<{ success: boolean; error?: string }> {
  if (!supabase) {
    const current = getLocalProperties();
    const updated = current.filter((p) => p.id !== id);
    setLocalProperties(updated);
    return { success: true };
  }

  try {
    const { error } = await supabase.from('properties').delete().eq('id', id);
    if (error) {
      return { success: false, error: error.message };
    }

    const current = getLocalProperties();
    const updated = current.filter((p) => p.id !== id);
    setLocalProperties(updated);

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Falha ao remover imóvel' };
  }
}

// ==========================================
// SERVIÇO DE TESTEMUNHOS / REVIEWS
// ==========================================

const LOCAL_REVIEWS_KEY = 'sc_reviews_db';

export function getLocalReviews(): Testimonial[] {
  if (typeof window === 'undefined') return initialTestimonialsData;
  try {
    const raw = localStorage.getItem(LOCAL_REVIEWS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // ignore
  }
  return initialTestimonialsData;
}

export function setLocalReviews(reviews: Testimonial[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_REVIEWS_KEY, JSON.stringify(reviews));
    window.dispatchEvent(new CustomEvent('reviews_updated', { detail: reviews }));
  } catch {
    // ignore
  }
}

export function sanitizeReview(r: any): Testimonial {
  const cleanStr = (val: any) => (typeof val === 'string' && val.trim() !== '' ? val.trim() : '');
  return {
    id: r.id || `review-${Date.now()}`,
    name: r.name || 'Cliente',
    role: cleanStr(r.role),
    text: cleanStr(r.text),
    image: cleanStr(r.image),
    fallbackImage: r.fallbackImage || r.fallback_image || '',
    rating: typeof r.rating === 'number' ? r.rating : 5,
  };
}

export async function fetchReviews(): Promise<Testimonial[]> {
  if (!supabase) {
    return getLocalReviews();
  }

  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return getLocalReviews();
    }

    return data.map(sanitizeReview);
  } catch (err) {
    console.error('Falha de rede com Supabase Reviews:', err);
    return getLocalReviews();
  }
}

export async function saveReview(review: Testimonial): Promise<{ success: boolean; error?: string }> {
  const sanitized = sanitizeReview(review);

  if (!supabase) {
    const current = getLocalReviews();
    const index = current.findIndex((r) => r.id === sanitized.id);
    let updated: Testimonial[];
    if (index >= 0) {
      updated = [...current];
      updated[index] = sanitized;
    } else {
      updated = [sanitized, ...current];
    }
    setLocalReviews(updated);
    return { success: true };
  }

  try {
    const dbPayload = {
      id: sanitized.id,
      name: sanitized.name,
      role: sanitized.role || null,
      text: sanitized.text || '',
      image: sanitized.image || null,
      fallback_image: sanitized.fallbackImage || null,
      rating: sanitized.rating ?? 5,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('reviews')
      .upsert(dbPayload, { onConflict: 'id' });

    if (error) {
      const current = getLocalReviews();
      const index = current.findIndex((r) => r.id === sanitized.id);
      if (index >= 0) {
        current[index] = sanitized;
      } else {
        current.unshift(sanitized);
      }
      setLocalReviews(current);
      return { success: false, error: error.message };
    }

    const current = getLocalReviews();
    const index = current.findIndex((r) => r.id === sanitized.id);
    if (index >= 0) {
      current[index] = sanitized;
    } else {
      current.unshift(sanitized);
    }
    setLocalReviews(current);

    return { success: true };
  } catch (err: any) {
    const current = getLocalReviews();
    const index = current.findIndex((r) => r.id === sanitized.id);
    if (index >= 0) {
      current[index] = sanitized;
    } else {
      current.unshift(sanitized);
    }
    setLocalReviews(current);
    const msg = err?.message || 'Falha de ligação';
    return { success: false, error: `${msg} (o testemunho foi guardado localmente)` };
  }
}

export async function deleteReview(id: string): Promise<{ success: boolean; error?: string }> {
  if (!supabase) {
    const current = getLocalReviews();
    const updated = current.filter((r) => r.id !== id);
    setLocalReviews(updated);
    return { success: true };
  }

  try {
    const { error } = await supabase.from('reviews').delete().eq('id', id);
    if (error) {
      return { success: false, error: error.message };
    }

    const current = getLocalReviews();
    const updated = current.filter((r) => r.id !== id);
    setLocalReviews(updated);

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Falha ao apagar review' };
  }
}

// ==========================================
// FUNÇÕES DE SINCRONIZAÇÃO E SEEDING
// ==========================================

export async function seedPropertiesToSupabase(): Promise<{ count: number; error?: string }> {
  if (!supabase) return { count: 0, error: 'Supabase não configurado' };
  let successCount = 0;
  let lastError: string | undefined;
  for (const prop of defaultProperties) {
    const res = await saveProperty(prop);
    if (res.success) {
      successCount++;
    } else {
      lastError = res.error;
    }
  }
  return { count: successCount, error: successCount === 0 && lastError ? lastError : undefined };
}

export async function seedReviewsToSupabase(): Promise<{ count: number; error?: string }> {
  if (!supabase) return { count: 0, error: 'Supabase não configurado' };
  let successCount = 0;
  let lastError: string | undefined;
  for (const r of initialTestimonialsData) {
    const res = await saveReview(r);
    if (res.success) {
      successCount++;
    } else {
      lastError = res.error;
    }
  }
  return { count: successCount, error: successCount === 0 && lastError ? lastError : undefined };
}

