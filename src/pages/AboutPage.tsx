import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { PageType } from '../types';
import { Compass, Award, Building2, PhoneCall, ArrowRight, ShieldCheck } from 'lucide-react';
import { Breadcrumb } from '../components/Breadcrumb';
import { useData } from '../context/DataContext';

/**
 * =========================================================================
 * FOTO DA SANDRA CARLOS (SOBRE MIM) - DIMENSÕES RECOMENDADAS: 832 × 1248 px
 * =========================================================================
 */
export const SANDRA_IMAGE_URL = '/sandra.jpg';

interface AboutPageProps {
  onScrollToContact: () => void;
  onNavigate?: (page: PageType) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onScrollToContact, onNavigate }) => {
  const { siteSettings } = useData();
  const { texts, photos } = siteSettings;
  const [sandraSrc, setSandraSrc] = useState(photos.sandraPortrait);

  useEffect(() => {
    setSandraSrc(photos.sandraPortrait);
  }, [photos.sandraPortrait]);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <article id="about-page" className="w-full bg-[#faf8f5] text-stone-900 pb-20 sm:pb-28">
      {/* BREADCRUMB NAVEGÁVEL COM LINKS NATIVOS (Início > Sobre Mim) */}
      <div className="w-full bg-[#faf8f5] border-b border-stone-200/70">
        <Breadcrumb
          items={[{ name: 'Sobre Mim' }]}
          onNavigate={onNavigate}
        />
      </div>

      {/* 1. MAIN HERO PORTRAIT - Dimensões nativas: 832 × 1248 (Reduzida em 30% e com distância calibrada ao logótipo) */}
      <section
        className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pt-10 sm:pt-14 md:pt-16"
        aria-label="Retrato da Consultora"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="w-full flex justify-center"
        >
          <div className="relative w-[70%] max-w-md sm:max-w-lg md:max-w-xl aspect-[832/1248] overflow-hidden shadow-sm">
            {/* Contexto: Retrato principal em destaque da consultora imobiliária Sandra Carlos na página biográfica Sobre Mim */}
            <img
              src={sandraSrc}
              alt="Sandra Carlos - Consultora Imobiliária em Pombal e Portugal com mais de 11 anos de experiência e Licença AMI 15766"
              className="w-full h-full object-cover object-center"
              loading="eager"
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
      </section>

      {/* 2. TWO-COLUMN EDITORIAL PHILOSOPHY SECTION */}
      <section className="max-w-5xl mx-auto px-6 sm:px-10 pt-16 sm:pt-24" aria-label="Biografia e Percurso">
        {/* Header Block with Semantic H1 */}
        <div className="mb-12 border-b border-stone-200/70 pb-6">
          <span className="font-sans text-[11px] uppercase tracking-[0.35em] text-[#784a0d] font-semibold block mb-2">
            {texts.aboutEyebrow}
          </span>
          <h1 className="font-sans text-2xl sm:text-3xl md:text-4xl font-light tracking-[0.06em] text-stone-900 uppercase leading-snug">
            {texts.aboutH1}
          </h1>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 gap-10 sm:gap-14 lg:gap-16 items-start"
        >
          {/* Left Column: História Curta (Quem é) */}
          <div className="flex flex-col justify-start space-y-6">
            <span className="font-sans text-[11px] uppercase tracking-[0.25em] text-stone-700 font-semibold block">
              {texts.aboutLeftHeading}
            </span>

            <p className="font-sans text-stone-900 text-base sm:text-lg md:text-[18px] leading-[1.7] font-normal md:min-h-[5.5rem] lg:min-h-[5.2rem]">
              {texts.aboutLeftP1}
            </p>

            <p className="font-sans text-stone-800 text-sm sm:text-[15px] leading-[1.85] font-light">
              {texts.aboutLeftP2}
            </p>
          </div>

          {/* Right Column: Diferenciação (Porque inspira confiança) */}
          <div className="flex flex-col justify-start space-y-6">
            <span className="font-sans text-[11px] uppercase tracking-[0.25em] text-stone-700 font-semibold block">
              {texts.aboutRightHeading}
            </span>

            <p className="font-sans text-stone-900 text-base sm:text-lg md:text-[18px] leading-[1.7] font-normal md:min-h-[5.5rem] lg:min-h-[5.2rem]">
              {texts.aboutRightP1}
            </p>

            <p className="font-sans text-stone-800 text-sm sm:text-[15px] leading-[1.85] font-light">
              {texts.aboutRightP2}
            </p>
          </div>
        </motion.div>

        {/* 4. Toque Pessoal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className="mt-12 sm:mt-16 p-6 sm:p-8 bg-[#fcfbf9] border-l-3 border-[#784a0d] border-y border-r border-stone-200/60"
        >
          <span className="font-sans text-[10px] uppercase tracking-[0.28em] text-[#784a0d] font-semibold block mb-2">
            TOQUE PESSOAL &bull; UMA PAIXÃO QUE INSPIRA
          </span>
          <p className="font-sans text-stone-800 text-sm sm:text-base md:text-[17px] leading-[1.8] font-light italic">
            &ldquo;{texts.quoteText}&rdquo;
          </p>
        </motion.div>

        {/* 5. CTA Principal StorySelling */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className="mt-10 sm:mt-12 p-8 sm:p-10 bg-[#FAF7F2] border border-[#d8be9e]/70 flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
        >
          <div className="max-w-xl">
            <h3 className="font-sans text-lg sm:text-xl font-medium tracking-[0.04em] text-stone-900 mb-2">
              {texts.aboutCtaTitle}
            </h3>
            <p className="font-sans text-stone-700 text-sm sm:text-base leading-relaxed font-light">
              {texts.aboutCtaText}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full md:w-auto shrink-0">
            <button
              id="about-contact-button"
              onClick={onScrollToContact}
              className="inline-flex items-center justify-center gap-2 bg-[#36210f] hover:bg-stone-900 text-white font-sans text-xs uppercase tracking-[0.22em] font-semibold py-3.5 px-7 cursor-pointer transition-all duration-200 shadow-sm active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-[#36210f] focus-visible:outline-none"
            >
              FALAR COMIGO
            </button>

            {onNavigate && (
              <a
                id="about-view-imoveis-link"
                href="/imoveis"
                onClick={(e) => {
                  if (!e.metaKey && !e.ctrlKey) {
                    e.preventDefault();
                    onNavigate('imoveis');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
                className="inline-flex items-center justify-center gap-2 border border-stone-800 hover:bg-stone-100 text-stone-900 font-sans text-xs uppercase tracking-[0.2em] font-medium py-3.5 px-6 transition-colors cursor-pointer no-underline focus-visible:ring-2 focus-visible:ring-[#36210f] focus-visible:outline-none"
              >
                <Compass size={14} className="text-[#784a0d]" />
                <span>VER PORTFÓLIO DE IMÓVEIS</span>
              </a>
            )}
          </div>
        </motion.div>
      </section>

      {/* 3. SECÇÃO EDITORIAL DE CONVERSÃO & LINKAGEM INTERNA CONTEXTUAL */}
      <section
        className="max-w-5xl mx-auto px-6 sm:px-10 mt-16 sm:mt-24"
        aria-label="Avaliação de Imóvel e Carteira Exclusiva"
      >
        <div className="bg-[#FDF7F6] border border-[#d8be9e]/70 p-8 sm:p-12 md:p-16 relative overflow-hidden shadow-xs">
          {/* Subtle decorative accent */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#d8be9e]/15 -rotate-45 pointer-events-none" />

          <div className="max-w-3xl">
            <span className="font-sans text-[11px] uppercase tracking-[0.3em] text-[#784a0d] font-semibold block mb-3">
              AVALIAÇÃO & CONSULTORIA PERSONALIZADA EM POMBAL
            </span>

            <h2 className="font-sans text-xl sm:text-2xl md:text-3xl font-light tracking-[0.08em] text-stone-900 uppercase mb-4 leading-snug">
              Quer Vender ou Conhecer o Valor Real do Seu Imóvel?
            </h2>

            <p className="font-sans text-stone-700 text-sm sm:text-base leading-relaxed mb-6 font-light">
              Com mais de 11 anos de experiência consolidada no mercado imobiliário de Pombal e concelhos vizinhos (Leiria, Ansião, Soure), realizo uma avaliação de mercado criteriosa e gratuita, estruturando todo o plano de divulgação e acompanhamento burocrático para uma transação segura e sem imprevistos.
            </p>

            {/* Badges de confiança */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-4 mb-8 border-y border-[#d8be9e]/40 text-xs text-stone-800 font-sans">
              <div className="flex items-center gap-2">
                <Award size={18} className="text-[#784a0d] shrink-0" />
                <span>+11 Anos de Experiência</span>
              </div>
              <div className="flex items-center gap-2">
                <Building2 size={18} className="text-[#784a0d] shrink-0" />
                <span>+190 Famílias Acompanhadas</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-[#784a0d] shrink-0" />
                <span>Garantia Legal AMI 15766</span>
              </div>
            </div>

            {/* Links de Ação Contextuais */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <button
                type="button"
                onClick={onScrollToContact}
                className="inline-flex items-center justify-center gap-2 bg-[#36210f] hover:bg-stone-900 text-white font-sans text-xs uppercase tracking-[0.2em] font-semibold py-3.5 px-6 transition-all cursor-pointer shadow-sm active:scale-[0.99] focus-visible:ring-2 focus-visible:ring-[#36210f] focus-visible:outline-none"
              >
                <PhoneCall size={14} className="text-[#D6920B]" />
                <span>PEDIR AVALIAÇÃO DO MEU IMÓVEL</span>
              </button>

              <a
                href="/imoveis"
                onClick={(e) => {
                  if (onNavigate && !e.metaKey && !e.ctrlKey) {
                    e.preventDefault();
                    onNavigate('imoveis');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }
                }}
                className="inline-flex items-center justify-center gap-2 border border-stone-800 hover:bg-stone-100 text-stone-900 font-sans text-xs uppercase tracking-[0.2em] font-medium py-3.5 px-6 transition-all cursor-pointer no-underline focus-visible:ring-2 focus-visible:ring-[#36210f] focus-visible:outline-none"
              >
                <span>EXPLORAR CARTEIRA DE IMÓVEIS</span>
                <ArrowRight size={14} className="text-[#784a0d]" />
              </a>
            </div>
          </div>
        </div>
      </section>
    </article>
  );
};

