/**
 * Gestor de Fotos Principais do Site (Home Hero, Casas Hero e Foto de Perfil Sandra Carlos)
 * Suporta:
 * 1. Ficheiros em /public (ex: /hero.jpg, /pagina_imoveis_2.png, /sandra.jpg)
 * 2. Upload direto de imagem do computador (otimizado e comprimido via Canvas para não exceder limites de armazenamento)
 * 3. Persistência local segura (localStorage) e propagação em tempo real para todo o site
 */

const STORAGE_KEY = 'sc_site_photos_v1';

export interface SitePhotos {
  homeHero: string;
  housesHero: string;
  sandraPortrait: string;
}

export const DEFAULT_SITE_PHOTOS: SitePhotos = {
  homeHero: 'https://SEU-DOMINIO-AQUI/hero-consultoria-imobiliaria-pombal-portugal.webp',
  housesHero: 'https://SEU-DOMINIO-AQUI/imoveis-pombal-leiria-portugal-banner.webp',
  sandraPortrait: 'https://SEU-DOMINIO-AQUI/sandra-carlos-consultora-imobiliaria-pombal.webp',
};

// Imagens existentes na pasta /public
export const PUBLIC_FOLDER_PHOTOS = [
  { label: 'Capa Home WebP (/hero-consultoria-imobiliaria-pombal-portugal.webp)', value: 'https://SEU-DOMINIO-AQUI/hero-consultoria-imobiliaria-pombal-portugal.webp', tag: 'home' },
  { label: 'Página Imóveis WebP (/imoveis-pombal-leiria-portugal-banner.webp)', value: 'https://SEU-DOMINIO-AQUI/imoveis-pombal-leiria-portugal-banner.webp', tag: 'casas' },
  { label: 'Retrato Sandra Carlos WebP (/sandra-carlos-consultora-imobiliaria-pombal.webp)', value: 'https://SEU-DOMINIO-AQUI/sandra-carlos-consultora-imobiliaria-pombal.webp', tag: 'sandra' },
  { label: 'Arquitetura Editorial (Unsplash WebP)', value: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&fm=webp&w=2200&q=85', tag: 'casas' },
];

export function getSitePhotos(): SitePhotos {
  if (typeof window === 'undefined') return DEFAULT_SITE_PHOTOS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        homeHero: parsed.homeHero || DEFAULT_SITE_PHOTOS.homeHero,
        housesHero: parsed.housesHero || DEFAULT_SITE_PHOTOS.housesHero,
        sandraPortrait: parsed.sandraPortrait || DEFAULT_SITE_PHOTOS.sandraPortrait,
      };
    }
  } catch {
    // fallback
  }
  return DEFAULT_SITE_PHOTOS;
}

export function saveSitePhotos(photos: SitePhotos): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(photos));
    window.dispatchEvent(new CustomEvent('site_photos_updated', { detail: photos }));
    // Compatibilidade com eventos antigos
    window.dispatchEvent(new CustomEvent('banners_updated', { detail: photos }));
  } catch (err) {
    console.warn('Erro ao guardar fotos do site:', err);
  }
}

// Retro-compatibilidade com código que importe getBanners
export const getBanners = getSitePhotos;
export const saveBanners = saveSitePhotos;
export type PageBanners = SitePhotos;
export const AVAILABLE_PUBLIC_BANNERS = PUBLIC_FOLDER_PHOTOS;
