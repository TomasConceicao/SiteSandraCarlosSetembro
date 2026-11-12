import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { PageType, Property } from '../types';
import { Testimonials } from '../../components/ui/testimonials-columns-1';
import {
  ArrowRight,
  ArrowDown,
  ChevronDown,
  Compass,
  Quote,
  UserCheck,
} from 'lucide-react';
import { FeaturedPropertiesSection } from '../components/FeaturedPropertiesSection';
import { useData } from '../context/DataContext';

/**
 * =========================================================================
 * FOTO INICIAL (HERO COVER) E RETRATO PROFISSIONAL (WEBP SEO)
 * =========================================================================
 * Formato .webp com nomes de ficheiro altamente descritivos para SEO em Portugal
 */
export const HERO_IMAGE_URL = '/hero-consultoria-imobiliaria-pombal-portugal.webp';
export const SANDRA_IMAGE_URL = '/sandra-carlos-consultora-imobiliaria-pombal.webp';

interface HomePageProps {
  onScrollToContact: () => void;
  onNavigate: (page: PageType) => void;
  onOpenContact?: () => void;
  onSelectProperty?: (property: Property) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onScrollToContact,
  onNavigate,
  onSelectProperty,
}) => {
  const { siteSettings } = useData();
  const { texts, photos } = siteSettings;
  const [heroSrc, setHeroSrc] = useState(photos.homeHero);
  const [sandraSrc, setSandraSrc] = useState(photos.sandraPortrait);

  useEffect(() => {
    setHeroSrc(photos.homeHero);
    setSandraSrc(photos.sandraPortrait);
  }, [photos.homeHero, photos.sandraPortrait]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <article id="home-page" className="w-full bg-[#faf8f5] text-stone-900">
      {/* 1. HERO SECTION (Dimensões: 2048 × 1365 - Imagem Inteira Sem Cortes) */}
      <section id="hero-section" className="relative w-full" aria-label="Apresentação Visual Sandra Carlos">
        <div className="relative w-full">
          {/* Contexto: Imagem principal / Hero Banner de abertura do site da Sandra Carlos Consultoria Imobiliária com moradia contemporânea */}
          <img
            src={heroSrc}
            alt="Sandra Carlos Consultoria Imobiliária em Portugal - Moradias contemporâneas e imóveis exclusivos em Pombal e Leiria"
            className="w-full h-auto block"
            loading="eager"
            width={2048}
            height={1365}
            onError={() => {
              if (heroSrc !== '/hero.jpg') {
                setHeroSrc('/hero.jpg');
              }
            }}
          />
          {/* Atmospheric subtle vignette */}
          <div className="absolute inset-0 bg-stone-900/10 pointer-events-none" />

          {/* Seta para baixo / Indicador para arrastar */}
          <button
            id="hero-scroll-indicator"
            type="button"
            onClick={() => {
              const intro = document.getElementById('intro-section');
              if (intro) {
                intro.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            aria-label="Arraste para baixo"
            className="absolute hidden landscape:flex lg:flex bottom-16 sm:bottom-20 md:bottom-24 lg:bottom-72 xl:bottom-80 2xl:bottom-96 left-1/2 -translate-x-1/2 z-10 flex-col items-center gap-1 sm:gap-1.5 text-white/95 hover:text-white transition-all cursor-pointer group select-none"
          >
            <span className="font-sans text-[11px] sm:text-xs tracking-[0.22em] uppercase font-medium drop-shadow-md text-white/90 group-hover:text-white transition-colors">
              {texts.heroScrollLabel}
            </span>
            <motion.div
              animate={{ y: [0, 6, 0] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
              className="drop-shadow-md"
            >
              <ChevronDown size={20} className="text-white sm:w-6 sm:h-6" strokeWidth={2.2} />
            </motion.div>
          </button>
        </div>
      </section>

      {/* 2. SPLIT INTRODUCTION & SOBRE MIM RESUMIDA */}
      <section id="intro-section" className="w-full" aria-label="Apresentação Sandra Carlos">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left Column: Overall warm cream ground (#faf8f5) with Noble Editorial Spacing */}
          <div className="bg-[#faf8f5] flex flex-col justify-center px-8 sm:px-14 md:px-16 lg:px-24 py-20 sm:py-28 md:py-36">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              viewport={{ once: true }}
              className="max-w-xl"
            >
              <span className="font-sans text-[11px] uppercase tracking-[0.32em] text-[#b87d1d] font-semibold block mb-3">
                {texts.homeEyebrow}
              </span>

              {/* <h1> ÚNICO OBRIGATÓRIO PARA SEO */}
              <h1 className="font-sans text-2xl sm:text-3xl md:text-[32px] font-medium leading-[1.3] text-stone-900 uppercase tracking-[0.14em] mb-6">
                {texts.homeH1}
              </h1>

              {/* <h2> APRESENTAÇÃO & SOBRE MIM */}
              <h2 className="font-sans text-base sm:text-lg md:text-xl font-medium tracking-[0.04em] text-stone-900 mb-4 leading-snug">
                {texts.homeSubtitle}
              </h2>

              <p className="font-sans text-stone-800 text-sm sm:text-base md:text-[17px] font-light leading-[1.75] tracking-[-0.01em] mb-4">
                {texts.homeParagraph1}
              </p>

              <p className="font-sans text-stone-700 text-sm sm:text-[15px] leading-relaxed mb-4 font-light">
                {texts.homeParagraph2}
              </p>

              <p className="font-sans text-stone-900 text-sm sm:text-[15px] leading-relaxed font-normal mb-6">
                {texts.homeParagraph3}
              </p>

              {/* Três caminhos claros: Conhecer Sobre Mim, Explorar Imóveis e Continuar a Explorar */}
              <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-6 pt-5 border-t border-stone-200/70 flex-wrap">
                <a
                  id="home-about-link-btn"
                  href="/sobre"
                  onClick={(e) => {
                    if (!e.metaKey && !e.ctrlKey) {
                      e.preventDefault();
                      onNavigate('sobre');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                  }}
                  className="group inline-flex items-center gap-2 text-stone-900 font-sans text-xs sm:text-sm uppercase tracking-[0.2em] font-medium cursor-pointer transition-all duration-200 hover:text-[#b87d1d] no-underline"
                >
                  <UserCheck size={14} className="text-[#b87d1d]" />
                  <span>CONHECER SOBRE MIM</span>
                  <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
                </a>

                <a
                  id="home-explore-imoveis-btn"
                  href="/imoveis"
                  onClick={(e) => {
                    if (!e.metaKey && !e.ctrlKey) {
                      e.preventDefault();
                      onNavigate('imoveis');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                  }}
                  className="group inline-flex items-center gap-2 text-stone-700 font-sans text-xs sm:text-sm uppercase tracking-[0.2em] font-medium cursor-pointer transition-all duration-200 hover:text-[#b87d1d] no-underline"
                >
                  <Compass size={14} className="text-stone-500 group-hover:text-[#b87d1d] transition-colors" />
                  <span>EXPLORAR IMÓVEIS</span>
                  <ArrowRight size={13} className="text-[#b87d1d] transition-transform group-hover:translate-x-1" />
                </a>

                <button
                  id="home-scroll-down-btn"
                  type="button"
                  onClick={() => {
                    const target = document.getElementById('quote-section') || document.getElementById('featured-properties-section');
                    if (target) {
                      target.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="group inline-flex items-center gap-2 text-stone-700 font-sans text-xs sm:text-sm uppercase tracking-[0.2em] font-medium cursor-pointer transition-all duration-200 hover:text-[#b87d1d]"
                  aria-label="Continuar a Explorar a Página"
                >
                  <span>CONTINUAR A EXPLORAR</span>
                  <ArrowDown size={13} className="text-[#b87d1d] animate-bounce transition-transform group-hover:translate-y-0.5" />
                </button>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Deep Tobacco Brown Box (#36210f) with Inset Framed Portrait */}
          <div className="bg-[#36210f] flex items-center justify-center p-8 sm:p-14 md:p-16 lg:p-24">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              viewport={{ once: true }}
              className="bg-[#faf8f5] p-6 sm:p-8 md:p-10 shadow-2xl w-full max-w-md mx-auto"
            >
              <div className="relative aspect-[832/1248] overflow-hidden">
                {/* Contexto: Retrato profissional editorial da consultora imobiliária Sandra Carlos na secção Sobre Mim */}
                <img
                  src={sandraSrc}
                  alt="Sandra Carlos - Consultora Imobiliária Profissional em Pombal e Portugal com mais de 11 anos de experiência, Licença AMI 15766"
                  className="w-full h-full object-cover object-center filter contrast-[1.02]"
                  loading="lazy"
                  width={832}
                  height={1248}
                  onError={() => {
                    if (sandraSrc !== '/sandra.jpg') {
                      setSandraSrc('/sandra.jpg');
                    }
                  }}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 2.1 FAIXA EDITORIAL: MENSAGEM DE PROPÓSITO E ASSINATURA */}
      <section
        id="quote-section"
        className="w-full bg-[#f6f2ec] border-y border-[#e7ded2] py-16 sm:py-20 md:py-24 px-6 sm:px-12 lg:px-20 select-none relative overflow-hidden"
        aria-label="Mensagem de Propósito por Sandra Carlos"
      >
        <div className="max-w-4xl mx-auto flex flex-col items-center text-center relative z-10">
          {/* Aspas subtis em tom ocre */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true }}
            className="mb-5 sm:mb-6 text-[#b87d1d]/40"
          >
            <Quote size={30} className="rotate-180" strokeWidth={1.5} />
          </motion.div>

          {/* Frase Editorial em Serifa de Luxo */}
          <motion.blockquote
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true }}
            className="font-serif text-xl sm:text-2xl md:text-[28px] lg:text-[31px] text-[#36210f] italic leading-relaxed sm:leading-[1.55] font-light max-w-3xl"
          >
            “{texts.quoteText}”
          </motion.blockquote>

          {/* Assinatura com Linha Dourada Ocre */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true }}
            className="mt-8 flex flex-col items-center"
          >
            <div className="w-12 h-px bg-[#b87d1d] mb-4" />
            <span className="font-sans text-xs sm:text-[13px] uppercase tracking-[0.25em] text-[#36210f] font-semibold">
              {texts.quoteAuthor}
            </span>
            <span className="font-sans text-[11px] uppercase tracking-[0.2em] text-[#8c7362] font-normal mt-1">
              {texts.quoteSubtext}
            </span>
          </motion.div>
        </div>
      </section>

      {/* 3. IMÓVEIS EM DESTAQUE (Grelha de 3 a 6 imóveis com link para cada imóvel) */}
      <FeaturedPropertiesSection
        onSelectProperty={(prop) => {
          if (onSelectProperty) {
            onSelectProperty(prop);
          } else {
            onNavigate('imoveis');
          }
        }}
        onNavigate={onNavigate}
      />

      {/* 4. TESTIMONIALS SECTION (Testemunhos de clientes) */}
      <Testimonials />
    </article>
  );
};

