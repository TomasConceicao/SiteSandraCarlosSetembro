import { Property } from '../types';

export interface PageSEO {
  title: string;
  description: string;
  canonicalPath: string;
  ogType?: string;
  robots?: string;
  h1: string;
  breadcrumb?: { name: string; path: string }[];
}

export const BASE_CANONICAL_URL = 'https://SEU-DOMINIO-AQUI/';

export const SEO_CONFIG: Record<string, PageSEO> = {
  home: {
    // Palavra-chave no início ("Consultoria Imobiliária em Portugal"), <= 60 caracteres
    title: 'Consultoria Imobiliária em Portugal | Sandra Carlos',
    // Descrição até 142 caracteres, com CTA claro no final
    description: 'Comprar ou vender casa em Portugal com rigor, dedicação e acompanhamento de excelência. Conheça as melhores oportunidades e marque a sua visita.',
    canonicalPath: '/',
    ogType: 'website',
    robots: 'index, follow',
    h1: 'Consultoria Imobiliária em Portugal | Sandra Carlos',
  },
  sobre: {
    // Palavra-chave no início ("Sandra Carlos Consultora"), <= 60 caracteres
    title: 'Sandra Carlos Consultora | 11 Anos de Experiência',
    // Descrição até 142 caracteres, com CTA claro no final
    description: 'Mais de 11 anos de compromisso, ética e rigor no mercado imobiliário do concelho de Pombal. Conheça a minha dedicação e fale comigo hoje.',
    canonicalPath: '/sobre',
    ogType: 'profile',
    robots: 'index, follow',
    h1: 'Sobre Sandra Carlos &bull; Consultoria Imobiliária',
    breadcrumb: [
      { name: 'Início', path: '/' },
      { name: 'Sobre Mim', path: '/sobre' },
    ],
  },
  dicas: {
    // Palavra-chave no início ("Dicas Imobiliárias Pombal"), <= 60 caracteres
    title: 'Dicas Imobiliárias Pombal | Guia de Compra e Venda',
    // Descrição até 142 caracteres, com CTA claro no final
    description: 'Artigos práticos e análises de mercado para valorizar o seu património e comprar com segurança em Pombal. Descubra os nossos conselhos úteis.',
    canonicalPath: '/dicas',
    ogType: 'blog',
    // Página em preparação: noindex, follow até estar oficialmente ativa
    robots: 'noindex, follow',
    h1: 'Dicas & Guia Imobiliário &bull; Sandra Carlos',
    breadcrumb: [
      { name: 'Início', path: '/' },
      { name: 'Dicas', path: '/dicas' },
    ],
  },
  casas: {
    // Palavra-chave no início ("Casas e Imóveis em Pombal"), <= 60 caracteres
    title: 'Casas e Imóveis em Pombal | Sandra Carlos Imobiliária',
    // Descrição até 142 caracteres, com CTA claro no final
    description: 'Moradias e apartamentos exclusivos para venda em Pombal e arredores com consultoria dedicada. Explore o catálogo e agende a sua visita.',
    canonicalPath: '/casas',
    ogType: 'website',
    robots: 'index, follow',
    h1: 'Casas & Imóveis &bull; Portfólio Selecionado em Pombal',
    breadcrumb: [
      { name: 'Início', path: '/' },
      { name: 'Imóveis', path: '/casas' },
    ],
  },
  '404': {
    title: 'Página Não Encontrada | Sandra Carlos Consultora',
    description: 'A página que procura não se encontra disponível ou foi alterada. Regresse à página inicial para explorar os imóveis disponíveis em Pombal.',
    canonicalPath: '/404',
    ogType: 'website',
    robots: 'noindex, follow',
    h1: '404 &bull; Página Não Encontrada',
    breadcrumb: [
      { name: 'Início', path: '/' },
      { name: 'Erro 404', path: '/404' },
    ],
  },
};

/**
 * Builds the canonical URL with clean slash handling.
 */
export function getCanonicalUrl(path: string): string {
  const base = BASE_CANONICAL_URL.endsWith('/')
    ? BASE_CANONICAL_URL.slice(0, -1)
    : BASE_CANONICAL_URL;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${cleanPath === '/' ? '/' : cleanPath}`;
}

/**
 * Updates DOM head elements dynamically for static application routes.
 */
export function applySEO(pageKey: string): void {
  const config = SEO_CONFIG[pageKey] || SEO_CONFIG.home;
  const fullCanonicalUrl = getCanonicalUrl(config.canonicalPath);

  // 1. Update Title
  document.title = config.title;

  // 2. Update Meta Description
  let metaDesc = document.querySelector('meta[name="description"]');
  if (!metaDesc) {
    metaDesc = document.createElement('meta');
    metaDesc.setAttribute('name', 'description');
    document.head.appendChild(metaDesc);
  }
  metaDesc.setAttribute('content', config.description);

  // 3. Update Robots
  let metaRobots = document.querySelector('meta[name="robots"]');
  if (!metaRobots) {
    metaRobots = document.createElement('meta');
    metaRobots.setAttribute('name', 'robots');
    document.head.appendChild(metaRobots);
  }
  metaRobots.setAttribute('content', config.robots || 'index, follow');

  // 4. Update Canonical Link
  let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!canonicalLink) {
    canonicalLink = document.createElement('link');
    canonicalLink.setAttribute('rel', 'canonical');
    document.head.appendChild(canonicalLink);
  }
  canonicalLink.setAttribute('href', fullCanonicalUrl);

  // 5. Update OpenGraph Tags
  const setMetaProperty = (property: string, content: string) => {
    let el = document.querySelector(`meta[property="${property}"]`);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute('property', property);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  };

  setMetaProperty('og:title', config.title);
  setMetaProperty('og:description', config.description);
  setMetaProperty('og:url', fullCanonicalUrl);
  setMetaProperty('og:type', config.ogType || 'website');
  setMetaProperty('og:site_name', 'Sandra Carlos Consultoria Imobiliária');
  setMetaProperty('og:locale', 'pt_PT');

  // 6. Update Schema.org JSON-LD Structured Data
  let scriptSchema = document.getElementById('schema-structured-data') as HTMLScriptElement | null;
  if (!scriptSchema) {
    scriptSchema = document.createElement('script');
    scriptSchema.id = 'schema-structured-data';
    scriptSchema.type = 'application/ld+json';
    document.head.appendChild(scriptSchema);
  }

  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'RealEstateAgent',
        '@id': `${getCanonicalUrl('/')}#organization`,
        name: 'Sandra Carlos Consultoria Imobiliária',
        url: getCanonicalUrl('/'),
        description: config.description,
        telephone: '+351 965881547',
        email: 'sandra.carlos@expertimo.eu',
        priceRange: '€€€€',
        identifier: 'AMI 15766',
        address: {
          '@type': 'PostalAddress',
          addressLocality: 'Pombal',
          addressRegion: 'Leiria',
          addressCountry: 'PT',
        },
        areaServed: ['Pombal', 'Louriçal', 'Redinha', 'Meirinhas', 'Pelariga', 'Guia', 'Leiria'],
        sameAs: ['https://instagram.com/sandracarlosimobiliaria'],
      },
      {
        '@type': 'WebSite',
        '@id': `${getCanonicalUrl('/')}#website`,
        url: getCanonicalUrl('/'),
        name: 'Sandra Carlos Consultoria Imobiliária',
        publisher: {
          '@id': `${getCanonicalUrl('/')}#organization`,
        },
      },
      ...(config.breadcrumb
        ? [
            {
              '@type': 'BreadcrumbList',
              itemListElement: config.breadcrumb.map((item, index) => ({
                '@type': 'ListItem',
                position: index + 1,
                name: item.name,
                item: getCanonicalUrl(item.path),
              })),
            },
          ]
        : []),
    ],
  };

  scriptSchema.textContent = JSON.stringify(structuredData);
}

/**
 * Updates DOM head elements dynamically for an individual property detail view.
 */
export function applyPropertySEO(property: Property): void {
  const propertyUrl = getCanonicalUrl(`/casas?id=${property.id}`);
  
  // Truncate and format title with keyword at start: e.g. "Moradia em Pombal | T4..." <= 60 chars
  const rawTitle = `${property.title} em ${property.location} | Sandra Carlos`;
  const title = rawTitle.length > 60 ? `${rawTitle.slice(0, 57)}...` : rawTitle;

  // Description up to 142 chars with price/typology + CTA
  const priceSnippet = property.price ? `${property.price}. ` : '';
  const areaSnippet = property.area ? `${property.area}. ` : '';
  const baseDesc = `${property.typology || 'Imóvel'} para venda em ${property.location}. ${priceSnippet}${areaSnippet}`;
  const cta = 'Agende já a sua visita com Sandra Carlos.';
  let description = `${baseDesc}${cta}`;
  if (description.length > 142) {
    const availableSpace = 142 - cta.length - 4;
    description = `${baseDesc.slice(0, availableSpace)}... ${cta}`;
  }

  // 1. Update Title
  document.title = title;

  // 2. Update Meta Description
  let metaDesc = document.querySelector('meta[name="description"]');
  if (!metaDesc) {
    metaDesc = document.createElement('meta');
    metaDesc.setAttribute('name', 'description');
    document.head.appendChild(metaDesc);
  }
  metaDesc.setAttribute('content', description);

  // 3. Update Robots
  let metaRobots = document.querySelector('meta[name="robots"]');
  if (!metaRobots) {
    metaRobots = document.createElement('meta');
    metaRobots.setAttribute('name', 'robots');
    document.head.appendChild(metaRobots);
  }
  metaRobots.setAttribute('content', 'index, follow');

  // 4. Update Canonical Link
  let canonicalLink = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
  if (!canonicalLink) {
    canonicalLink = document.createElement('link');
    canonicalLink.setAttribute('rel', 'canonical');
    document.head.appendChild(canonicalLink);
  }
  canonicalLink.setAttribute('href', propertyUrl);

  // 5. Update OpenGraph Tags
  const setMetaProperty = (propertyAttr: string, content: string) => {
    let el = document.querySelector(`meta[property="${propertyAttr}"]`);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute('property', propertyAttr);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  };

  setMetaProperty('og:title', title);
  setMetaProperty('og:description', description);
  setMetaProperty('og:url', propertyUrl);
  setMetaProperty('og:type', 'article');
  setMetaProperty('og:image', property.image || `${BASE_CANONICAL_URL}sandra-carlos-consultora-imobiliaria-pombal.webp`);
  setMetaProperty('og:site_name', 'Sandra Carlos Consultoria Imobiliária');
  setMetaProperty('og:locale', 'pt_PT');

  // 6. Update Twitter Tags
  const setMetaName = (nameAttr: string, content: string) => {
    let el = document.querySelector(`meta[name="${nameAttr}"]`);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute('name', nameAttr);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  };

  setMetaName('twitter:title', title);
  setMetaName('twitter:description', description);
  setMetaName('twitter:image', property.image || `${BASE_CANONICAL_URL}sandra.jpg`);

  // 7. Structured Data for RealEstateListing / SingleFamilyResidence
  let scriptSchema = document.getElementById('schema-structured-data') as HTMLScriptElement | null;
  if (!scriptSchema) {
    scriptSchema = document.createElement('script');
    scriptSchema.id = 'schema-structured-data';
    scriptSchema.type = 'application/ld+json';
    document.head.appendChild(scriptSchema);
  }

  const numericPrice = property.price ? property.price.replace(/[^0-9]/g, '') : undefined;

  const propertySchema = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: property.title,
    description: property.description || description,
    url: propertyUrl,
    image: property.image,
    offers: {
      '@type': 'Offer',
      price: numericPrice || undefined,
      priceCurrency: 'EUR',
      availability: property.status === 'vendido' ? 'https://schema.org/Sold' : 'https://schema.org/InStock',
    },
    about: {
      '@type': 'Accommodation',
      name: property.title,
      description: property.description,
      address: {
        '@type': 'PostalAddress',
        addressLocality: property.location,
        addressCountry: 'PT',
      },
      numberOfRooms: property.bedrooms ? Number(property.bedrooms) : undefined,
      numberOfBathroomsTotal: property.bathrooms ? Number(property.bathrooms) : undefined,
      floorSize: property.area ? {
        '@type': 'QuantitativeValue',
        value: property.area,
      } : undefined,
    },
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Início',
          item: getCanonicalUrl('/'),
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Imóveis',
          item: getCanonicalUrl('/casas'),
        },
        {
          '@type': 'ListItem',
          position: 3,
          name: property.title,
          item: propertyUrl,
        },
      ],
    },
  };

  scriptSchema.textContent = JSON.stringify(propertySchema);
}
