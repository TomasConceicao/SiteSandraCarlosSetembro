import { SiteConfig, SitePhotos, SiteSettings, SiteTexts } from '../types';
import { properties as defaultProperties } from './properties';

export const DEFAULT_SITE_PHOTOS: SitePhotos = {
  homeHero: '/hero-consultoria-imobiliaria-pombal-portugal.webp',
  housesHero: '/imoveis-pombal-leiria-portugal-banner.webp',
  sandraPortrait: '/sandra-carlos-consultora-imobiliaria-pombal.webp',
};

export const DEFAULT_SITE_TEXTS: SiteTexts = {
  heroScrollLabel: 'Arraste para baixo',
  homeEyebrow: 'CONSULTORIA IMOBILIÁRIA LOCAL • PORTUGAL',
  homeH1: 'Venda o Seu Imóvel em Pombal com Acompanhamento Exclusivo | Sandra Carlos',
  homeSubtitle: 'Acompanhamento imobiliário com rigor, proximidade e confiança.',
  homeParagraph1:
    'Com foco no concelho de Pombal e na Região Centro, acompanho famílias e investidores na venda, compra e investimento em imóveis.',
  homeParagraph2:
    'Com mais de 11 anos de experiência e mais de 190 famílias acompanhadas, asseguro um serviço personalizado em todas as etapas do processo — da estratégia à documentação, negociação e concretização do negócio.',
  homeParagraph3:
    'Ética, rigor e compromisso para tomar decisões imobiliárias com tranquilidade.',
  quoteText:
    'Viajar é uma das minhas grandes paixões. Talvez por isso valorize tanto a sensação de chegar ao lugar certo. No imobiliário, é isso que procuro proporcionar: segurança para avançar e confiança para começar um novo capítulo.',
  quoteAuthor: 'SANDRA CARLOS',
  quoteSubtext: 'CONSULTORIA IMOBILIÁRIA • EXPERTIMO PORTUGAL',
  featuredTitle: 'IMÓVEIS DESTACADOS',
  featuredSubtitle: 'SELEÇÃO EXCLUSIVA',
  housesEyebrow: 'CONSULTORIA IMOBILIÁRIA',
  housesH1: 'Imóveis Exclusivos para Venda em Pombal e Leiria',
  housesIntro1: 'Imóveis selecionados em Pombal com verificação jurídica e rigor técnico.',
  housesIntro2:
    'Cada propriedade do catálogo é avaliada ao detalhe para garantir que o seu investimento é seguro e sem imprevistos.',
  aboutEyebrow: 'SANDRA CARLOS • CONSULTORIA IMOBILIÁRIA • AMI 15766',
  aboutH1: 'Experiência, rigor e proximidade em cada decisão imobiliária',
  aboutLeftHeading: 'HISTÓRIA & TRAJETÓRIA',
  aboutLeftP1:
    'Após 15 anos no setor dos seguros, em 2015 encontrei no imobiliário uma forma ainda mais direta de acompanhar pessoas em decisões importantes para as suas vidas.',
  aboutLeftP2:
    'Desde então, dedico-me em exclusivo à mediação imobiliária, com foco no concelho de Pombal e na Região Centro. Ao longo de mais de 11 anos, acompanhei mais de 190 famílias na venda, compra e concretização de novos projetos de vida.',
  aboutRightHeading: 'DIFERENCIAÇÃO & COMPROMISSO',
  aboutRightP1:
    'A experiência no setor dos seguros reforçou aquilo que continua a definir a minha forma de trabalhar: atenção ao detalhe, sentido de responsabilidade, rigor e compromisso.',
  aboutRightP2:
    'Cada imóvel tem uma história. E cada cliente merece um acompanhamento próximo, transparente e personalizado — desde a preparação do imóvel ou procura da casa certa, até à concretização do negócio.',
  aboutCtaTitle: 'Vamos conversar sobre o seu próximo passo?',
  aboutCtaText:
    'Se pretende vender, comprar ou investir em Pombal e na Região Centro, estou disponível para o acompanhar com clareza e dedicação.',
  testimonialsEyebrow: 'CONFIANÇA & RESULTADOS',
  testimonialsTitle: 'TESTEMUNHOS',
  testimonialsSubtitle:
    'O que dizem as famílias e parceiros que confiaram no meu acompanhamento em Pombal',
};

export const DEFAULT_SITE_CONFIG: SiteConfig = {
  brandName: 'SANDRA CARLOS CONSULTORIA IMOBILIÁRIA',
  consultantName: 'Sandra Carlos',
  amiLicense: 'AMI 15766',
  partnerNetwork: 'Expertimo Portugal',
  phoneDisplay: '+351 965 881 547',
  whatsappNumber: '351965881547',
  email: 'sandra.carlos@expertimo.eu',
  instagramHandle: '@sandracarlosimobiliaria',
  instagramUrl: 'https://instagram.com/sandracarlosimobiliaria',
  locationText: 'Pombal, Portugal',
  footerLegalNote: 'Licença AMI 15766 • Expertimo Portugal • Pombal',
  copyrightText: 'ⓒ 2026 Sandra Carlos Consultoria Imobiliária. Todos os direitos reservados.',
};

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  texts: DEFAULT_SITE_TEXTS,
  config: DEFAULT_SITE_CONFIG,
  photos: DEFAULT_SITE_PHOTOS,
  featuredIds: defaultProperties.slice(0, 3).map((p) => p.id),
};
