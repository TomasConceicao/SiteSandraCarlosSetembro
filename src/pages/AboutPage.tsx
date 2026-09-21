import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { PageType } from '../types';
import { Compass } from 'lucide-react';
import { getSitePhotos } from '../utils/bannersManager';

/**
 * =========================================================================
 * FOTO DA SANDRA CARLOS (SOBRE MIM) - DIMENSÕES RECOMENDADAS: 832 × 1248 px
 * =========================================================================
 * Pode ser gerida diretamente no Painel Admin (separador "Fotos do Site")
 * ou substituindo o ficheiro /public/sandra.jpg
 */
export const SANDRA_IMAGE_URL = '/sandra.jpg';

interface AboutPageProps {
  onScrollToContact: () => void;
  onNavigate?: (page: PageType) => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ onScrollToContact, onNavigate }) => {
  const [sandraSrc, setSandraSrc] = useState(() => {
    return getSitePhotos().sandraPortrait;
  });

  useEffect(() => {
    window.scrollTo(0, 0);

    const handlePhotosUpdate = () => {
      setSandraSrc(getSitePhotos().sandraPortrait);
    };
    window.addEventListener('site_photos_updated', handlePhotosUpdate);
    window.addEventListener('banners_updated', handlePhotosUpdate);
    return () => {
      window.removeEventListener('site_photos_updated', handlePhotosUpdate);
      window.removeEventListener('banners_updated', handlePhotosUpdate);
    };
  }, []);

  return (
    <article id="about-page" className="w-full bg-[#faf8f5] text-stone-900 pb-20 sm:pb-28">
      {/* 1. MAIN HERO PORTRAIT - Dimensões nativas: 832 × 1248 (Reduzida em 30% e com distância calibrada ao logótipo) */}
      <section
        className="w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-8 pt-14 sm:pt-[70px] md:pt-[84px]"
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
                if (sandraSrc !== 'https://SEU-DOMINIO-AQUI/sandra-carlos-consultora-imobiliaria-pombal.webp') {
                  setSandraSrc('https://SEU-DOMINIO-AQUI/sandra-carlos-consultora-imobiliaria-pombal.webp');
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
          <span className="font-sans text-[11px] uppercase tracking-[0.35em] text-[#b87d1d] font-semibold block mb-2">
            PERFIL & TRAJETÓRIA
          </span>
          <h1 className="font-sans text-2xl sm:text-3xl md:text-4xl font-light tracking-[0.12em] text-stone-900 uppercase">
            SOBRE SANDRA CARLOS &bull; CONSULTORIA IMOBILIÁRIA
          </h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 sm:gap-14 lg:gap-20">
          {/* Left Column: 5 cols */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true }}
            className="md:col-span-5 flex flex-col justify-start space-y-6"
          >
            <p className="font-sans text-stone-900 text-base sm:text-lg md:text-[19px] leading-[1.7] font-normal">
              Após 15 anos a trabalhar como profissional de seguros, em 2015 decidi mudar de rumo e iniciei o meu percurso como consultora imobiliária.
            </p>

            <p className="font-sans text-stone-700 text-sm sm:text-[15px] leading-[1.85] font-light">
              Apaixonei-me por esta área de negócio e a ela me dedico a tempo inteiro desde então, sendo o concelho de Pombal a minha principal zona de atuação.
            </p>
          </motion.div>

          {/* Right Column: 7 cols */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            viewport={{ once: true }}
            className="md:col-span-7 flex flex-col space-y-6 text-stone-700 text-sm sm:text-[15px] md:text-base font-light leading-[1.85]"
          >
            <p>
              Ao longo destes últimos 11 anos, acompanhei mais de 190 famílias que melhoraram as suas vidas, umas através da venda da sua casa e outras adquirindo casa nova. Em muitos casos, foi literalmente acompanhar a realização de um sonho e fazer parte de todos estes processos, é realmente muito gratificante.
            </p>

            <p>
              Gosto de rigor e de compromisso, sendo estes os valores que sustentam a minha forma de trabalhar em todos os processos de venda de imóveis que me são confiados.
            </p>

            <p className="text-stone-800 font-normal pt-1">
              Além de amar o que faço profissionalmente, tenho ainda como grande paixão, viajar pelo mundo.
            </p>
          </motion.div>
        </div>

        {/* Action Buttons */}
        <div className="mt-12 sm:mt-16 pt-8 border-t border-stone-200/70 flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <button
            id="about-contact-button"
            onClick={onScrollToContact}
            className="inline-flex items-center text-stone-900 font-sans text-xs sm:text-sm uppercase tracking-[0.22em] font-medium border-b-2 border-stone-900 pb-1 cursor-pointer transition-all duration-200 hover:text-[#b87d1d] hover:border-[#b87d1d]"
          >
            CONTACTAR CONSULTORIA
          </button>

          {onNavigate && (
            <button
              id="about-view-houses-button"
              onClick={() => {
                onNavigate('casas');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-2 text-stone-600 font-sans text-xs sm:text-sm uppercase tracking-[0.2em] font-medium hover:text-stone-900 transition-colors cursor-pointer py-1"
            >
              <Compass size={14} className="text-[#b87d1d]" />
              VER PORTFÓLIO DE CASAS
            </button>
          )}
        </div>
      </section>
    </article>
  );
};

