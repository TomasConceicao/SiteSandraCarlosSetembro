export type PageType = 'home' | 'sobre' | 'casas' | 'dicas' | 'contacto' | 'admin' | '404';

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

export interface TipArticle {
  id: string;
  slug: string;
  title: string;
  date: string;
  author: string;
  categories: string[];
  excerpt: string;
  content: string[];
  checklist?: string[];
  image: string;
  readTime: string;
  featured?: boolean;
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
