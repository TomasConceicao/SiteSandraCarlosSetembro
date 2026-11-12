import { Property } from '../types';
import { generateSlug, getPropertyPath } from './slug';

export interface PageSEO {
  title: string;
  description: string;
  canonicalPath: string;
  ogType?: string;
  robots?: string;
  h1: string;
  breadcrumb?: { name: string; path: string }[];
}

/**
 * Domínio canónico oficial absoluto (versão com www).
 * Todas as tags canónicas, sitemaps e metadados devem apontar sempre para este domínio.
 */
export const BASE_CANONICAL_URL = 'https://www.sandracarlos.pt';

export function getBaseOrigin(): string {
  return BASE_CANONICAL_URL;
}

export const SEO_CONFIG: Record<string, PageSEO> = {
  home: {
    title: 'Venda o Seu Imóvel em Pombal | Sandra Carlos',
    description: 'Quer vender o seu imóvel em Pombal ou Leiria? Obtenha uma avaliação rigorosa e acompanhamento dedicado com a consultora Sandra Carlos (AMI 15766).',
    canonicalPath: '/',
    ogType: 'website',
    robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    h1: 'Venda o Seu Imóvel em Pombal com Acompanhamento Exclusivo | Sandra Carlos',
  },
  sobre: {
    title: 'Consultora Imobiliária em Pombal | Sandra Carlos',
    description: 'Conheça Sandra Carlos, consultora imobiliária em Pombal com mais de 11 anos de experiência e licença AMI 15766. Mediação dedicada na venda do seu imóvel.',
    canonicalPath: '/sobre',
    ogType: 'profile',
    robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    h1: 'Experiência, rigor e proximidade em cada decisão imobiliária',
    breadcrumb: [
      { name: 'Início', path: '/' },
      { name: 'Sobre Mim', path: '/sobre' },
    ],
  },
  imoveis: {
    title: 'Imóveis para Venda em Pombal e Leiria | Sandra Carlos',
    description: 'Descubra imóveis selecionados para venda em Pombal e Leiria. Moradias e apartamentos de qualidade com mediação exclusiva da consultora Sandra Carlos.',
    canonicalPath: '/imoveis',
    ogType: 'website',
    robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
    h1: 'Imóveis Exclusivos para Venda em Pombal e Leiria',
    breadcrumb: [
      { name: 'Início', path: '/' },
      { name: 'Imóveis', path: '/imoveis' },
    ],
  },
  login: {
    title: 'Iniciar Sessão | Sandra Carlos',
    description: 'Acesso reservado de administração com autenticação de dois fatores.',
    canonicalPath: '/login',
    ogType: 'website',
    robots: 'noindex, nofollow',
    h1: 'Área Reservada',
  },
  admin: {
    title: 'Painel de Administração | Sandra Carlos',
    description: 'Área reservada de gestão interna da Sandra Carlos Consultoria Imobiliária.',
    canonicalPath: '/admin',
    ogType: 'website',
    robots: 'noindex, nofollow',
    h1: 'Painel de Administração',
  },
  privacidade: {
    title: 'Política de Privacidade e RGPD | Sandra Carlos',
    description: 'Informação legal sobre o tratamento e proteção de dados pessoais (RGPD) nos serviços de mediação imobiliária de Sandra Carlos em Pombal (AMI 15766).',
    canonicalPath: '/politica-de-privacidade',
    ogType: 'website',
    robots: 'index, follow',
    h1: 'Política de Privacidade & Proteção de Dados Pessoais',
    breadcrumb: [
      { name: 'Início', path: '/' },
      { name: 'Política de Privacidade', path: '/politica-de-privacidade' },
    ],
  },
  termos: {
    title: 'Termos e Condições de Utilização | Sandra Carlos',
    description: 'Condições gerais de utilização, enquadramento da mediação imobiliária (Lei 15/2013, AMI 15766) e resolução alternativa de litígios de Sandra Carlos.',
    canonicalPath: '/termos-e-condicoes',
    ogType: 'website',
    robots: 'index, follow',
    h1: 'Termos e Condições de Utilização',
    breadcrumb: [
      { name: 'Início', path: '/' },
      { name: 'Termos e Condições', path: '/termos-e-condicoes' },
    ],
  },
  '404': {
    title: 'Página Não Encontrada | Sandra Carlos Consultora',
    description: 'A página que procura não se encontra disponível. Regresse à página inicial para explorar a carteira de imóveis residenciais disponíveis em Pombal.',
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
  const base = getBaseOrigin();
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
        name: 'Sandra Carlos - Consultora Imobiliária',
        url: getCanonicalUrl('/'),
        description: config.description,
        telephone: '+351 965881547',
        email: 'sandra.carlos@expertimo.eu',
        priceRange: '€€€€',
        identifier: 'AMI 15766',
        memberOf: {
          '@type': 'Organization',
          name: 'Expertimo Portugal',
        },
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
        name: 'Sandra Carlos - Consultora Imobiliária',
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
 * Formata o título SEO para a página de detalhe de imóvel de forma inteligente:
 * a) Corta no último espaço completo antes do limite estrito de 60 caracteres (evitando palavras partidas).
 * b) Garante que a marca "Sandra Carlos" nunca é cortada — prioriza manter a marca intacta no fim
 *    e encurta apenas a parte descritiva do imóvel quando necessário.
 * c) Remove preposições ou conectivos órfãos no final do texto truncado.
 */
export function formatPropertySeoTitle(propertyTitle: string, location?: string): string {
  const brandSuffix = ' | Sandra Carlos';
  const loc = location ? location.split(/[,(]/)[0].trim() : 'Pombal';
  
  // 1. Tentar primeiro com a localização incluída (se não estiver já presente no título)
  const hasLoc = propertyTitle.toLowerCase().includes(loc.toLowerCase());
  const fullDesc = hasLoc ? propertyTitle.trim() : `${propertyTitle.trim()} em ${loc}`;
  const fullTitle = `${fullDesc}${brandSuffix}`;

  if (fullTitle.length <= 60) {
    return fullTitle;
  }

  // 2. Se com localização ultrapassar 60 caracteres, tentar apenas o título do imóvel + marca
  if (!hasLoc) {
    const titleWithBrand = `${propertyTitle.trim()}${brandSuffix}`;
    if (titleWithBrand.length <= 60) {
      return titleWithBrand;
    }
  }

  // 3. Se ainda assim ultrapassar os 60 caracteres, encurta de forma inteligente apenas a parte descritiva
  // Espaço disponível para a parte descritiva: 60 - 16 (' | Sandra Carlos') = 44 caracteres
  const maxDescLength = 60 - brandSuffix.length;
  const targetDesc = !hasLoc ? propertyTitle.trim() : fullDesc;
  const candidate = targetDesc.slice(0, maxDescLength);
  const lastSpaceIndex = candidate.lastIndexOf(' ');

  let truncatedDesc = lastSpaceIndex > 0 ? candidate.slice(0, lastSpaceIndex) : candidate;
  // Elimina preposições ou conectivos órfãos no final da frase cortada
  truncatedDesc = truncatedDesc.replace(/\s+(e|de|do|da|dos|das|com|em|no|na|nos|nas)\s*$/i, '').trim();

  return `${truncatedDesc}${brandSuffix}`;
}

/**
 * Updates DOM head elements dynamically for an individual property detail view.
 */
export function applyPropertySEO(property: Property): void {
  const propertyPath = getPropertyPath(property.id);
  const propertyUrl = getCanonicalUrl(propertyPath);
  const loc = property.location ? property.location.split(',')[0].trim() : 'Pombal';
  
  // Formatação inteligente de título: <= 60 caracteres, corte em espaço completo e marca sempre preservada
  const title = formatPropertySeoTitle(property.title, property.location);

  // Description strictly between 140 and 155 chars, click-oriented with AMI 15766 and CTA
  const priceSnippet = property.price ? `por ${property.price}` : 'sob consulta';
  let description = `${property.typology || 'Imóvel'} exclusivo para venda em ${loc} ${priceSnippet}. Agende a sua visita ou venda o seu imóvel com acompanhamento de Sandra Carlos (AMI 15766).`;
  if (description.length > 155) {
    description = `${description.slice(0, 151)}...`;
  } else if (description.length < 140) {
    description = `${property.typology || 'Imóvel'} exclusivo para venda em ${loc} ${priceSnippet}. Conheça todos os detalhes e marque a sua visita com a consultora Sandra Carlos (AMI 15766).`;
    if (description.length > 155) {
      description = `${description.slice(0, 151)}...`;
    }
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
  metaRobots.setAttribute('content', 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1');

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
  setMetaProperty('og:image', property.image?.startsWith('http') ? property.image : `${getBaseOrigin()}${property.image || '/sandra-carlos-consultora-imobiliaria-pombal.webp'}`);
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

  setMetaName('twitter:card', 'summary_large_image');
  setMetaName('twitter:title', title);
  setMetaName('twitter:description', description);
  setMetaName('twitter:image', property.image?.startsWith('http') ? property.image : `${getBaseOrigin()}${property.image || '/sandra-carlos-consultora-imobiliaria-pombal.webp'}`);
  setMetaName('twitter:url', propertyUrl);

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
          item: getCanonicalUrl('/imoveis'),
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
