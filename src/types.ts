export type PageType =
  | 'home'
  | 'sobre'
  | 'sobre-mim'
  | 'imoveis'
  | 'contacto'
  | 'login'
  | 'admin'
  | 'privacidade'
  | 'termos'
  | '404';

export type PropertyStatus =
  | 'disponivel'
  | 'reservado'
  | 'vendido'
  | 'novidade'
  | 'new'
  | 'reserved'
  | 'sold'
  | 'none';
export type LocationPrecision = 'exata' | 'certa';

export interface Testimonial {
  id: string;
  text?: string;
  image?: string;
  fallbackImage?: string;
  name: string;
  role?: string;
  rating?: number;
}

export interface PropertyFeatureItem {
  label: string;
  value: string;
}

export interface PropertyMapCoordinates {
  lat: number;
  lng: number;
  zoom?: number;
  precision?: LocationPrecision; // 'exata' (ponto no local exato) ou 'certa' (círculo com raio de zona aproximada)
  circleRadius?: number; // Raio em metros para a opção 'certa' (padrão: 350m)
}

export interface Property {
  id: string;
  title: string;
  subtitle?: string;
  status?: PropertyStatus;
  statusLabel?: string;
  location: string;
  address?: string;
  locationPrecision?: LocationPrecision;
  typology: string;
  area: string;
  bedrooms?: string | number;
  bathrooms?: string | number;
  halfBaths?: number;
  energyCertificate?: string;
  description: string;
  extendedDescription?: string[];
  image: string;
  secondaryImages?: string[];
  architecturalHighlights?: string[];
  year: string;
  price?: string;
  videoUrl?: string;
  videoThumbnail?: string;
  mapCoordinates?: PropertyMapCoordinates;
  interiorFeatures?: PropertyFeatureItem[];
  exteriorFeatures?: PropertyFeatureItem[];
  detailsFeatures?: PropertyFeatureItem[];
  financialDetails?: PropertyFeatureItem[];
}

export interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}

export interface SitePhotos {
  homeHero: string;
  housesHero: string;
  sandraPortrait: string;
}

export interface SiteTexts {
  heroScrollLabel: string;
  homeEyebrow: string;
  homeH1: string;
  homeSubtitle: string;
  homeParagraph1: string;
  homeParagraph2: string;
  homeParagraph3: string;
  quoteText: string;
  quoteAuthor: string;
  quoteSubtext: string;
  featuredTitle: string;
  featuredSubtitle: string;
  housesEyebrow: string;
  housesH1: string;
  housesIntro1: string;
  housesIntro2: string;
  aboutEyebrow: string;
  aboutH1: string;
  aboutLeftHeading: string;
  aboutLeftP1: string;
  aboutLeftP2: string;
  aboutRightHeading: string;
  aboutRightP1: string;
  aboutRightP2: string;
  aboutCtaTitle: string;
  aboutCtaText: string;
  testimonialsEyebrow: string;
  testimonialsTitle: string;
  testimonialsSubtitle: string;
}

export interface SiteConfig {
  brandName: string;
  consultantName: string;
  amiLicense: string;
  partnerNetwork: string;
  phoneDisplay: string;
  whatsappNumber: string;
  email: string;
  instagramHandle: string;
  instagramUrl: string;
  locationText: string;
  footerLegalNote: string;
  copyrightText: string;
}

export interface SiteSettings {
  texts: SiteTexts;
  config: SiteConfig;
  photos: SitePhotos;
  featuredIds: string[];
}

export type AuthAssuranceLevel = 'aal1' | 'aal2' | null;

export interface MfaFactorSummary {
  id: string;
  friendlyName?: string;
  factorType: string;
  status: 'verified' | 'unverified';
}
