import { SitePhotos } from '../types';
import { DEFAULT_SITE_PHOTOS } from '../data/siteSettings';

export type { SitePhotos };
export { DEFAULT_SITE_PHOTOS };

export const PUBLIC_FOLDER_PHOTOS = [
  {
    label: 'Capa Home WebP (/hero-consultoria-imobiliaria-pombal-portugal.webp)',
    value: '/hero-consultoria-imobiliaria-pombal-portugal.webp',
    tag: 'home',
  },
  {
    label: 'Página Imóveis WebP (/imoveis-pombal-leiria-portugal-banner.webp)',
    value: '/imoveis-pombal-leiria-portugal-banner.webp',
    tag: 'imoveis',
  },
  {
    label: 'Retrato Sandra Carlos WebP (/sandra-carlos-consultora-imobiliaria-pombal.webp)',
    value: '/sandra-carlos-consultora-imobiliaria-pombal.webp',
    tag: 'sandra',
  },
];

export function getSitePhotos(): SitePhotos {
  return DEFAULT_SITE_PHOTOS;
}

export const getBanners = getSitePhotos;
export type PageBanners = SitePhotos;
export const AVAILABLE_PUBLIC_BANNERS = PUBLIC_FOLDER_PHOTOS;
