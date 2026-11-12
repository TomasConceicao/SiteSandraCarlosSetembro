import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import {
  AuthAssuranceLevel,
  MfaFactorSummary,
  Property,
  PropertyStatus,
  SiteSettings,
  Testimonial,
} from '../types';
import { properties as defaultProperties } from '../data/properties';
import { DEFAULT_SITE_SETTINGS } from '../data/siteSettings';
import { initialTestimonialsData, defaultTestimonialImages } from '../../components/ui/testimonials-columns-1';

export const STORAGE_BUCKET = 'site-images';

/**
 * Lê e valida URL HTTP/HTTPS exclusivamente a partir de variáveis de ambiente Vite.
 * Nunca escreve URLs nem chaves diretamente no código e nunca usa service_role key.
 */
function cleanHttpUrl(raw: unknown): string {
  if (!raw || typeof raw !== 'string') return '';
  const str = raw.trim().replace(/^['"]|['"]$/g, '');
  if (!str || str === 'undefined' || str === 'null') return '';
  if (
    str.includes('seu-projeto') ||
    str.includes('your-project') ||
    str.includes('placeholder')
  ) {
    return '';
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

function cleanAnonKey(raw: unknown): string {
  if (!raw || typeof raw !== 'string') return '';
  const str = raw.trim().replace(/^['"]|['"]$/g, '');
  if (!str || str === 'undefined' || str === 'null') return '';
  if (
    str.length < 20 ||
    str.includes('sua-supabase-anon-key') ||
    str.includes('your-anon-key') ||
    str.includes('placeholder')
  ) {
    return '';
  }
  return str;
}

const rawEnvUrl = import.meta.env.VITE_SUPABASE_URL;
const rawEnvAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabaseUrl = cleanHttpUrl(rawEnvUrl);
export const supabaseAnonKey = cleanAnonKey(rawEnvAnonKey);

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

function initSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  try {
    const safeFetch: typeof fetch = (input: RequestInfo | URL, init?: RequestInit) => {
      return window.fetch(input, init);
    };

    return createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
      global: {
        fetch: safeFetch,
      },
    });
  } catch {
    return null;
  }
}

export const supabase: SupabaseClient | null = initSupabaseClient();

// ==========================================
// AUTENTICAÇÃO & 2FA OBRIGATÓRIO (TOTP / AAL2)
// ==========================================

export interface AuthStateSummary {
  user: User | null;
  hasSession: boolean;
  aal: AuthAssuranceLevel;
  nextLevel: AuthAssuranceLevel;
  verifiedFactors: MfaFactorSummary[];
  unverifiedFactors: MfaFactorSummary[];
  isAal2: boolean;
}

export async function getAuthStatus(): Promise<AuthStateSummary> {
  const empty: AuthStateSummary = {
    user: null,
    hasSession: false,
    aal: null,
    nextLevel: null,
    verifiedFactors: [],
    unverifiedFactors: [],
    isAal2: false,
  };

  if (!supabase) return empty;

  try {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      return empty;
    }

    const [{ data: aalData }, { data: factorsData }] = await Promise.all([
      supabase.auth.mfa.getAuthenticatorAssuranceLevel(),
      supabase.auth.mfa.listFactors(),
    ]);

    const totpFactors: MfaFactorSummary[] = (factorsData?.totp || []).map((f) => ({
      id: f.id,
      friendlyName: f.friendly_name || 'App Autenticadora',
      factorType: f.factor_type,
      status: f.status === 'verified' ? 'verified' : 'unverified',
    }));

    const verifiedFactors = totpFactors.filter((f) => f.status === 'verified');
    const unverifiedFactors = totpFactors.filter((f) => f.status === 'unverified');
    const aal = (aalData?.currentLevel as AuthAssuranceLevel) || 'aal1';
    const nextLevel = (aalData?.nextLevel as AuthAssuranceLevel) || null;

    return {
      user: session.user,
      hasSession: true,
      aal,
      nextLevel,
      verifiedFactors,
      unverifiedFactors,
      isAal2: aal === 'aal2' && verifiedFactors.length > 0,
    };
  } catch {
    return empty;
  }
}

export async function signInWithEmailPassword(
  email: string,
  password: string
): Promise<{ success: boolean; error?: string; status?: AuthStateSummary }> {
  if (!supabase) {
    return {
      success: false,
      error:
        'Supabase não configurado. Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY nas variáveis de ambiente.',
    };
  }

  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      return {
        success: false,
        error:
          error.message === 'Invalid login credentials'
            ? 'Email ou palavra-passe inválidos.'
            : error.message,
      };
    }

    const status = await getAuthStatus();
    return { success: true, status };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro inesperado na autenticação.';
    return { success: false, error: message };
  }
}

export async function enrollTotpFactor(): Promise<{
  success: boolean;
  factorId?: string;
  qrCode?: string;
  secret?: string;
  uri?: string;
  error?: string;
}> {
  if (!supabase) {
    return { success: false, error: 'Supabase não configurado.' };
  }

  try {
    // Limpa fatores TOTP não verificados anteriores para evitar conflito de nomes
    const { data: existing } = await supabase.auth.mfa.listFactors();
    const unverified = (existing?.totp || []).filter((f) => f.status !== 'verified');
    for (const factor of unverified) {
      await supabase.auth.mfa.unenroll({ factorId: factor.id });
    }

    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: 'totp',
      friendlyName: 'Sandra Carlos Admin 2FA',
    });

    if (error || !data) {
      return { success: false, error: error?.message || 'Não foi possível gerar o QR code 2FA.' };
    }

    return {
      success: true,
      factorId: data.id,
      qrCode: data.totp.qr_code,
      secret: data.totp.secret,
      uri: data.totp.uri,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao configurar 2FA.';
    return { success: false, error: message };
  }
}

export async function verifyTotpCode(
  factorId: string,
  code: string
): Promise<{ success: boolean; error?: string; status?: AuthStateSummary }> {
  if (!supabase) {
    return { success: false, error: 'Supabase não configurado.' };
  }

  const sanitizedCode = code.replace(/\s+/g, '').trim();
  if (!/^\d{6}$/.test(sanitizedCode)) {
    return { success: false, error: 'Introduza um código válido de 6 dígitos.' };
  }

  try {
    const { error } = await supabase.auth.mfa.challengeAndVerify({
      factorId,
      code: sanitizedCode,
    });

    if (error) {
      return {
        success: false,
        error:
          error.message.toLowerCase().includes('invalid') ||
          error.message.toLowerCase().includes('totp')
            ? 'Código de verificação inválido ou expirado. Tente novamente.'
            : error.message,
      };
    }

    await supabase.auth.refreshSession();
    const status = await getAuthStatus();
    if (!status.isAal2) {
      return {
        success: false,
        error: 'A sessão não atingiu o nível de segurança AAL2.',
      };
    }

    return { success: true, status };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro na verificação 2FA.';
    return { success: false, error: message };
  }
}

export async function signOutAdmin(): Promise<void> {
  if (supabase) {
    await supabase.auth.signOut();
  }
}

async function ensureAal2Session(): Promise<{ ok: boolean; error?: string }> {
  if (!supabase) {
    return {
      ok: false,
      error: 'Supabase não configurado nas variáveis de ambiente.',
    };
  }
  const status = await getAuthStatus();
  if (!status.hasSession || !status.isAal2) {
    return {
      ok: false,
      error: 'Sessão de nível AAL2 (2FA) obrigatória para esta operação.',
    };
  }
  return { ok: true };
}

// ==========================================
// SUPABASE STORAGE (IMAGENS)
// ==========================================

export interface StorageFileItem {
  name: string;
  path: string;
  publicUrl: string;
  createdAt?: string;
  size?: number;
}

export function extractStoragePathFromPublicUrl(url: string): string | null {
  if (!url || !supabaseUrl) return null;
  const marker = `/storage/v1/object/public/${STORAGE_BUCKET}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  const path = url.slice(idx + marker.length).split('?')[0];
  return path ? decodeURIComponent(path) : null;
}

async function optimizeImageBlob(
  file: File,
  maxDim = 1920,
  quality = 0.85
): Promise<{ blob: Blob; ext: string; contentType: string }> {
  if (typeof window === 'undefined' || !file.type.startsWith('image/')) {
    return {
      blob: file,
      ext: file.name.split('.').pop()?.toLowerCase() || 'jpg',
      contentType: file.type || 'image/jpeg',
    };
  }

  return new Promise((resolve) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      try {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          URL.revokeObjectURL(objectUrl);
          resolve({
            blob: file,
            ext: file.name.split('.').pop()?.toLowerCase() || 'jpg',
            contentType: file.type || 'image/jpeg',
          });
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            URL.revokeObjectURL(objectUrl);
            if (blob) {
              resolve({ blob, ext: 'webp', contentType: 'image/webp' });
            } else {
              resolve({
                blob: file,
                ext: file.name.split('.').pop()?.toLowerCase() || 'jpg',
                contentType: file.type || 'image/jpeg',
              });
            }
          },
          'image/webp',
          quality
        );
      } catch {
        URL.revokeObjectURL(objectUrl);
        resolve({
          blob: file,
          ext: file.name.split('.').pop()?.toLowerCase() || 'jpg',
          contentType: file.type || 'image/jpeg',
        });
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve({
        blob: file,
        ext: file.name.split('.').pop()?.toLowerCase() || 'jpg',
        contentType: file.type || 'image/jpeg',
      });
    };
    img.src = objectUrl;
  });
}

function sanitizeFilenameBase(name: string): string {
  const withoutExt = name.replace(/\.[^/.]+$/, '');
  return (
    withoutExt
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9-_]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 48) || 'imagem'
  );
}

export async function uploadImageToStorage(
  file: File,
  folder: 'properties' | 'site' | 'reviews' = 'properties'
): Promise<{ success: boolean; url?: string; path?: string; error?: string }> {
  const authCheck = await ensureAal2Session();
  if (!authCheck.ok || !supabase) {
    return { success: false, error: authCheck.error };
  }

  try {
    const { blob, ext, contentType } = await optimizeImageBlob(file);
    const baseName = sanitizeFilenameBase(file.name);
    const uniqueId = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const storagePath = `${folder}/${uniqueId}-${baseName}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(storagePath, blob, {
        contentType,
        cacheControl: '31536000',
        upsert: false,
      });

    if (uploadError) {
      return { success: false, error: uploadError.message };
    }

    const { data: urlData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(storagePath);

    return {
      success: true,
      url: urlData.publicUrl,
      path: storagePath,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao carregar imagem.';
    return { success: false, error: message };
  }
}

export async function replaceImageInStorage(
  oldUrl: string | undefined,
  file: File,
  folder: 'properties' | 'site' | 'reviews' = 'properties'
): Promise<{ success: boolean; url?: string; path?: string; error?: string }> {
  const uploaded = await uploadImageToStorage(file, folder);
  if (!uploaded.success) return uploaded;

  if (oldUrl && supabase) {
    const oldPath = extractStoragePathFromPublicUrl(oldUrl);
    if (oldPath && oldPath !== uploaded.path) {
      // Remove ficheiro anterior substituído no bucket (best-effort)
      await supabase.storage.from(STORAGE_BUCKET).remove([oldPath]);
    }
  }

  return uploaded;
}

export async function listStorageImages(
  folder: 'properties' | 'site' | 'reviews' = 'properties'
): Promise<{ files: StorageFileItem[]; error?: string }> {
  if (!supabase) return { files: [], error: 'Supabase não configurado.' };

  try {
    const { data, error } = await supabase.storage.from(STORAGE_BUCKET).list(folder, {
      limit: 100,
      sortBy: { column: 'created_at', order: 'desc' },
    });

    if (error) {
      return { files: [], error: error.message };
    }

    const files: StorageFileItem[] = (data || [])
      .filter((item) => item.name && !item.name.startsWith('.'))
      .map((item) => {
        const path = `${folder}/${item.name}`;
        const { data: urlData } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
        return {
          name: item.name,
          path,
          publicUrl: urlData.publicUrl,
          createdAt: item.created_at,
          size: (item.metadata as { size?: number } | null)?.size,
        };
      });

    return { files };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao listar imagens.';
    return { files: [], error: message };
  }
}

export async function deleteStorageImage(
  path: string
): Promise<{ success: boolean; error?: string }> {
  const authCheck = await ensureAal2Session();
  if (!authCheck.ok || !supabase) {
    return { success: false, error: authCheck.error };
  }

  try {
    const { error } = await supabase.storage.from(STORAGE_BUCKET).remove([path]);
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erro ao remover imagem.';
    return { success: false, error: message };
  }
}

// ==========================================
// SERVIÇO DE IMÓVEIS (PROPERTIES)
// ==========================================

export function sanitizeProperty(prop: Record<string, any>): Property {
  const cleanStr = (val: unknown) =>
    typeof val === 'string' && val.trim() !== '' ? val.trim() : undefined;
  const cleanArr = (arr: unknown) =>
    Array.isArray(arr) && arr.length > 0
      ? arr.filter((x) => Boolean(x && (typeof x === 'string' ? x.trim() : x)))
      : undefined;

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
    bedrooms:
      typeof prop.bedrooms === 'number' && !isNaN(prop.bedrooms) && prop.bedrooms > 0
        ? prop.bedrooms
        : undefined,
    bathrooms:
      typeof prop.bathrooms === 'number' && !isNaN(prop.bathrooms) && prop.bathrooms > 0
        ? prop.bathrooms
        : undefined,
    halfBaths:
      typeof prop.halfBaths === 'number' && !isNaN(prop.halfBaths) && prop.halfBaths > 0
        ? prop.halfBaths
        : typeof prop.half_baths === 'number' && prop.half_baths > 0
        ? prop.half_baths
        : undefined,
    description: prop.description || '',
    extendedDescription: cleanArr(prop.extendedDescription || prop.extended_description),
    image: prop.image || '',
    secondaryImages: cleanArr(prop.secondaryImages || prop.secondary_images) || [],
    architecturalHighlights:
      cleanArr(prop.architecturalHighlights || prop.architectural_highlights) || [],
    year: prop.year ? String(prop.year).trim() : '',
    energyCertificate: cleanStr(prop.energyCertificate || prop.energy_certificate),
    price: cleanStr(prop.price),
    videoUrl: cleanStr(prop.videoUrl || prop.video_url),
    videoThumbnail: cleanStr(prop.videoThumbnail || prop.video_thumbnail),
    mapCoordinates:
      prop.mapCoordinates ||
      prop.map_coordinates ||
      (prop.lat && prop.lng
        ? {
            lat: Number(prop.lat),
            lng: Number(prop.lng),
            zoom: prop.zoom ? Number(prop.zoom) : 16,
            precision: prop.locationPrecision || prop.location_precision || 'exata',
            circleRadius:
              prop.circleRadius || prop.circle_radius
                ? Number(prop.circleRadius || prop.circle_radius)
                : undefined,
          }
        : undefined),
    interiorFeatures:
      Array.isArray(prop.interiorFeatures || prop.interior_features) &&
      (prop.interiorFeatures || prop.interior_features).length > 0
        ? (prop.interiorFeatures || prop.interior_features).filter(
            (f: any) => f && f.label && f.value
          )
        : undefined,
    exteriorFeatures:
      Array.isArray(prop.exteriorFeatures || prop.exterior_features) &&
      (prop.exteriorFeatures || prop.exterior_features).length > 0
        ? (prop.exteriorFeatures || prop.exterior_features).filter(
            (f: any) => f && f.label && f.value
          )
        : undefined,
    detailsFeatures:
      Array.isArray(prop.detailsFeatures || prop.details_features) &&
      (prop.detailsFeatures || prop.details_features).length > 0
        ? (prop.detailsFeatures || prop.details_features).filter(
            (f: any) => f && f.label && f.value
          )
        : undefined,
    financialDetails:
      Array.isArray(prop.financialDetails || prop.financial_details) &&
      (prop.financialDetails || prop.financial_details).length > 0
        ? (prop.financialDetails || prop.financial_details).filter(
            (f: any) => f && f.label && f.value
          )
        : undefined,
  };
}

/**
 * Leitura pública dos imóveis (SELECT apenas).
 */
export async function fetchProperties(): Promise<Property[]> {
  if (!supabase) {
    return defaultProperties;
  }

  try {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return defaultProperties;
    }

    return data.map(sanitizeProperty);
  } catch (err) {
    console.error('Falha de rede ao ler imóveis no Supabase:', err);
    return defaultProperties;
  }
}

export async function saveProperty(
  property: Property
): Promise<{ success: boolean; error?: string }> {
  const authCheck = await ensureAal2Session();
  if (!authCheck.ok || !supabase) {
    return { success: false, error: authCheck.error };
  }

  const sanitized = sanitizeProperty(property);

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
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Falha de ligação ao guardar imóvel.';
    return { success: false, error: message };
  }
}

export async function deleteProperty(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const authCheck = await ensureAal2Session();
  if (!authCheck.ok || !supabase) {
    return { success: false, error: authCheck.error };
  }

  try {
    const { error } = await supabase.from('properties').delete().eq('id', id);
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Falha ao remover imóvel.';
    return { success: false, error: message };
  }
}

// ==========================================
// SERVIÇO DE TESTEMUNHOS (REVIEWS)
// ==========================================

export function sanitizeReview(r: Record<string, any>): Testimonial {
  const cleanStr = (val: unknown) =>
    typeof val === 'string' && val.trim() !== '' ? val.trim() : '';
  const id = r.id || `review-${Date.now()}`;
  const defaultAsset = defaultTestimonialImages[id];
  return {
    id,
    name: r.name || 'Cliente',
    role: cleanStr(r.role),
    text: cleanStr(r.text),
    image: cleanStr(r.image) || defaultAsset?.image || '',
    fallbackImage: r.fallbackImage || r.fallback_image || defaultAsset?.fallbackImage || '',
    rating: typeof r.rating === 'number' ? r.rating : 5,
  };
}

/**
 * Leitura pública dos testemunhos (SELECT apenas).
 */
export async function fetchReviews(): Promise<Testimonial[]> {
  if (!supabase) {
    return initialTestimonialsData;
  }

  try {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return initialTestimonialsData;
    }

    return data.map(sanitizeReview);
  } catch (err) {
    console.error('Falha de rede ao ler testemunhos no Supabase:', err);
    return initialTestimonialsData;
  }
}

export async function saveReview(
  review: Testimonial
): Promise<{ success: boolean; error?: string }> {
  const authCheck = await ensureAal2Session();
  if (!authCheck.ok || !supabase) {
    return { success: false, error: authCheck.error };
  }

  const sanitized = sanitizeReview(review);

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
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Falha de ligação ao guardar testemunho.';
    return { success: false, error: message };
  }
}

export async function deleteReview(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const authCheck = await ensureAal2Session();
  if (!authCheck.ok || !supabase) {
    return { success: false, error: authCheck.error };
  }

  try {
    const { error } = await supabase.from('reviews').delete().eq('id', id);
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Falha ao apagar testemunho.';
    return { success: false, error: message };
  }
}

// ==========================================
// SERVIÇO DE TEXTOS E CONFIGURAÇÕES DO SITE
// ==========================================

export function sanitizeSiteSettings(raw: Record<string, any> | null | undefined): SiteSettings {
  if (!raw) return DEFAULT_SITE_SETTINGS;
  return {
    texts: {
      ...DEFAULT_SITE_SETTINGS.texts,
      ...(raw.texts && typeof raw.texts === 'object' ? raw.texts : {}),
    },
    config: {
      ...DEFAULT_SITE_SETTINGS.config,
      ...(raw.config && typeof raw.config === 'object' ? raw.config : {}),
    },
    photos: {
      ...DEFAULT_SITE_SETTINGS.photos,
      ...(raw.photos && typeof raw.photos === 'object' ? raw.photos : {}),
    },
    featuredIds:
      Array.isArray(raw.featured_ids) && raw.featured_ids.length > 0
        ? raw.featured_ids
        : Array.isArray(raw.featuredIds) && raw.featuredIds.length > 0
        ? raw.featuredIds
        : DEFAULT_SITE_SETTINGS.featuredIds,
  };
}

/**
 * Leitura pública das configurações e textos do site (SELECT apenas).
 */
export async function fetchSiteSettings(): Promise<SiteSettings> {
  if (!supabase) {
    return DEFAULT_SITE_SETTINGS;
  }

  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .eq('id', 'default')
      .maybeSingle();

    if (error || !data) {
      return DEFAULT_SITE_SETTINGS;
    }

    return sanitizeSiteSettings(data);
  } catch (err) {
    console.error('Falha ao ler configurações do site no Supabase:', err);
    return DEFAULT_SITE_SETTINGS;
  }
}

export async function saveSiteSettings(
  settings: SiteSettings
): Promise<{ success: boolean; error?: string }> {
  const authCheck = await ensureAal2Session();
  if (!authCheck.ok || !supabase) {
    return { success: false, error: authCheck.error };
  }

  try {
    const dbPayload = {
      id: 'default',
      texts: settings.texts,
      config: settings.config,
      photos: settings.photos,
      featured_ids: settings.featuredIds,
      updated_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('site_settings')
      .upsert(dbPayload, { onConflict: 'id' });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Falha ao guardar configurações do site.';
    return { success: false, error: message };
  }
}

// ==========================================
// SEED INICIAL (EXCLUSIVO ADMIN AAL2)
// ==========================================

export async function seedPropertiesToSupabase(): Promise<{ count: number; error?: string }> {
  const authCheck = await ensureAal2Session();
  if (!authCheck.ok || !supabase) {
    return { count: 0, error: authCheck.error };
  }
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
  const authCheck = await ensureAal2Session();
  if (!authCheck.ok || !supabase) {
    return { count: 0, error: authCheck.error };
  }
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
