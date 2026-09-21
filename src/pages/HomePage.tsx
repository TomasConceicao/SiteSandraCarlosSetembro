import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { PageType, Property } from '../types';
import { Testimonials } from '../../components/ui/testimonials-columns-1';
import {
  ArrowRight,
  ChevronDown,
  Compass,
  UserCheck,
  ShieldCheck,
  Award,
  Clock,
  HeartHandshake,
  MapPin,
  MessageCircle,
  Phone,
  Mail,
  BookOpen,
} from 'lucide-react';
import { FeaturedPropertiesSection } from '../components/FeaturedPropertiesSection';
import { getSitePhotos } from '../utils/bannersManager';

/**
 * =========================================================================
 * FOTO INICIAL (HERO COVER) E RETRATO PROFISSIONAL (WEBP SEO)
 * =========================================================================
 * Formato .webp com nomes de ficheiro altamente descritivos para SEO em Portugal
 */
export const HERO_IMAGE_URL = 'https://SEU-DOMINIO-AQUI/hero-consultoria-imobiliaria-pombal-portugal.webp';
export const SANDRA_IMAGE_URL = 'https://SEU-DOMINIO-AQUI/sandra-carlos-consultora-imobiliaria-pombal.webp';

interface HomePageProps {
  onScrollToContact: () => void;
  onNavigate: (page: PageType) => void;
  onOpenContact?: () => void;
  onSelectProperty?: (property: Property) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onScrollToContact,
  onNavigate,
  onOpenContact,
  onSelectProperty,
}) => {
  const [heroSrc, setHeroSrc] = useState(() => {
    const photos = getSitePhotos();
    return photos.homeHero;
  });
  const [sandraSrc, setSandraSrc] = useState(() => {
    const photos = getSitePhotos();
    return photos.sandraPortrait;
  });

  useEffect(() => {
    window.scrollTo(0, 0);

    const handlePhotosUpdate = () => {
      const photos = getSitePhotos();
      setHeroSrc(photos.homeHero);
      setSandraSrc(photos.sandraPortrait);
    };
    window.addEventListener('site_photos_updated', handlePhotosUpdate);
    window.addEventListener('banners_updated', handlePhotosUpdate);
    return () => {
      window.removeEventListener('site_photos_updated', handlePhotosUpdate);
      window.removeEventListener('banners_updated', handlePhotosUpdate);
    };
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
              if (heroSrc !== 'https://SEU-DOMINIO-AQUI/hero-consultoria-imobiliaria-pombal-portugal.webp') {
                setHeroSrc('https://SEU-DOMINIO-AQUI/hero-consultoria-imobiliaria-pombal-portugal.webp');
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
              Arraste para baixo
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
                CONSULTORIA IMOBILIÁRIA LOCAL &bull; PORTUGAL
              </span>

              {/* <h1> ÚNICO OBRIGATÓRIO PARA SEO */}
              <h1 className="font-sans text-2xl sm:text-3xl md:text-[34px] font-medium leading-[1.3] text-stone-900 uppercase tracking-[0.14em] mb-6">
                Consultoria Imobiliária em Portugal | Sandra Carlos
              </h1>

              {/* <h2> SOBRE MIM RESUMIDA */}
              <h2 className="font-sans text-xs sm:text-sm uppercase tracking-[0.24em] text-[#b87d1d] font-semibold mb-3">
                Sobre Mim &bull; Compromisso, Rigor e Confiança
              </h2>

              <p className="font-sans text-stone-800 text-base sm:text-lg md:text-[19px] font-light leading-[1.75] tracking-[-0.01em] max-w-sm mb-4">
                Com foco no concelho de Pombal e na região centro de Portugal, acompanho famílias e investidores com dedicação total na venda e compra de imóveis. Um percurso consolidado em mais de 11 anos de experiência, ética, rigor e proximidade.
              </p>

              <p className="font-sans text-stone-600 text-sm sm:text-base leading-relaxed max-w-sm mb-6">
                Acompanhamento personalizado em todas as etapas burocráticas, legais e de financiamento para que realize a sua transação com tranquilidade e garantia jurídica (AMI 15766).
              </p>

              {/* Links internos obrigatórios: Sobre Mim, Explorar Imóveis e Blog / Dicas */}
              <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-start sm:items-center gap-5 pt-5 border-t border-stone-200/70 flex-wrap">
                <button
                  id="home-about-link-btn"
                  onClick={() => {
                    onNavigate('sobre');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="group inline-flex items-center gap-2 text-stone-900 font-sans text-xs sm:text-sm uppercase tracking-[0.2em] font-medium border-b-2 border-stone-900 pb-1 cursor-pointer transition-all duration-200 hover:text-[#b87d1d] hover:border-[#b87d1d]"
                >
                  <UserCheck size={14} className="text-[#b87d1d]" />
                  <span>CONHECER SOBRE MIM</span>
                  <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
                </button>

                <button
                  id="home-explore-casas-btn"
                  onClick={() => {
                    onNavigate('casas');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="group inline-flex items-center gap-2 text-stone-700 font-sans text-xs sm:text-sm uppercase tracking-[0.2em] font-medium border-b-2 border-transparent pb-1 cursor-pointer transition-all duration-200 hover:text-stone-950 hover:border-stone-400"
                >
                  <Compass size={14} className="text-stone-500" />
                  <span>EXPLORAR IMÓVEIS</span>
                </button>

                <button
                  id="home-tips-link-btn"
                  onClick={() => {
                    onNavigate('dicas');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="group inline-flex items-center gap-2 text-stone-700 font-sans text-xs sm:text-sm uppercase tracking-[0.2em] font-medium border-b-2 border-transparent pb-1 cursor-pointer transition-all duration-200 hover:text-stone-950 hover:border-stone-400"
                >
                  <BookOpen size={14} className="text-stone-500" />
                  <span>BLOG & DICAS</span>
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
                    if (sandraSrc !== 'https://SEU-DOMINIO-AQUI/sandra-carlos-consultora-imobiliaria-pombal.webp') {
                      setSandraSrc('https://SEU-DOMINIO-AQUI/sandra-carlos-consultora-imobiliaria-pombal.webp');
                    }
                  }}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 3. IMÓVEIS EM DESTAQUE (Grelha de 3 a 6 imóveis com link para cada imóvel) */}
      <FeaturedPropertiesSection
        onSelectProperty={(prop) => {
          if (onSelectProperty) {
            onSelectProperty(prop);
          } else {
            onNavigate('casas');
          }
        }}
        onNavigate={onNavigate}
      />

      {/* 4. PORQUÊ ESCOLHER A SANDRA CARLOS */}
      <section
        id="why-choose-section"
        className="w-full bg-[#fcfbf9] border-b border-stone-200/80 py-20 sm:py-28"
        aria-label="Porquê escolher a Sandra Carlos"
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="text-center max-w-2xl mx-auto mb-16 sm:mb-20">
            <span className="font-sans text-[11px] uppercase tracking-[0.32em] text-[#b87d1d] font-semibold block mb-3">
              DIFERENCIAIS DE EXCELÊNCIA
            </span>
            <h2 className="font-sans text-2xl sm:text-3xl md:text-4xl font-light tracking-[0.14em] text-stone-900 uppercase">
              Porquê escolher a Sandra Carlos
            </h2>
            <div className="w-12 h-[2px] bg-[#b87d1d] mx-auto mt-4 mb-5" />
            <p className="font-sans text-stone-600 text-sm sm:text-base leading-relaxed">
              Comprar ou vender casa é uma das decisões financeiras e pessoais mais importantes da vida. Conheça as razões que tornam o meu serviço imobiliário uma referência no mercado em Portugal.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-[#faf8f5] border border-stone-200/70 p-8 flex flex-col items-start transition-transform duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 rounded-none bg-[#36210f] text-[#b87d1d] flex items-center justify-center mb-6">
                <Clock size={24} strokeWidth={1.75} />
              </div>
              <h3 className="font-sans text-base font-semibold uppercase tracking-[0.14em] text-stone-900 mb-3">
                Mais de 11 Anos de Experiência
              </h3>
              <p className="font-sans text-stone-600 text-xs sm:text-sm leading-relaxed">
                Profundo conhecimento prático das dinâmicas de preços, valorização de solo e tendências no mercado imobiliário em Portugal.
              </p>
            </div>

            <div className="bg-[#faf8f5] border border-stone-200/70 p-8 flex flex-col items-start transition-transform duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 rounded-none bg-[#36210f] text-[#b87d1d] flex items-center justify-center mb-6">
                <ShieldCheck size={24} strokeWidth={1.75} />
              </div>
              <h3 className="font-sans text-base font-semibold uppercase tracking-[0.14em] text-stone-900 mb-3">
                Rigor & Segurança Jurídica
              </h3>
              <p className="font-sans text-stone-600 text-xs sm:text-sm leading-relaxed">
                Atuação devidamente licenciada sob a licença AMI 15766 com rigorosa conferência de cadernetas, certidões e contratos.
              </p>
            </div>

            <div className="bg-[#faf8f5] border border-stone-200/70 p-8 flex flex-col items-start transition-transform duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 rounded-none bg-[#36210f] text-[#b87d1d] flex items-center justify-center mb-6">
                <HeartHandshake size={24} strokeWidth={1.75} />
              </div>
              <h3 className="font-sans text-base font-semibold uppercase tracking-[0.14em] text-stone-900 mb-3">
                Acompanhamento Próximo
              </h3>
              <p className="font-sans text-stone-600 text-xs sm:text-sm leading-relaxed">
                Cada cliente é único. Atendimento direto e sem intermediários desde a avaliação até à celebração da escritura definitiva.
              </p>
            </div>

            <div className="bg-[#faf8f5] border border-stone-200/70 p-8 flex flex-col items-start transition-transform duration-300 hover:-translate-y-1">
              <div className="w-12 h-12 rounded-none bg-[#36210f] text-[#b87d1d] flex items-center justify-center mb-6">
                <Award size={24} strokeWidth={1.75} />
              </div>
              <h3 className="font-sans text-base font-semibold uppercase tracking-[0.14em] text-stone-900 mb-3">
                Rede Expertimo & Agente Pro
              </h3>
              <p className="font-sans text-stone-600 text-xs sm:text-sm leading-relaxed">
                Alcance nacional e internacional com suporte da rede Expertimo Portugal e qualificação de topo como Agente Pro.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. ZONAS DE ATUAÇÃO COM SEO LOCAL EM PORTUGAL */}
      <section
        id="service-areas-section"
        className="w-full bg-[#faf8f5] border-b border-stone-200/80 py-20 sm:py-28"
        aria-label="Zonas de atuação"
      >
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 sm:mb-16 gap-6 border-b border-stone-300/60 pb-6">
            <div>
              <span className="font-sans text-[11px] uppercase tracking-[0.32em] text-[#b87d1d] font-semibold block mb-2">
                PRESENÇA REGIONAL &bull; PORTUGAL
              </span>
              <h2 className="font-sans text-2xl sm:text-3xl md:text-4xl font-light tracking-[0.14em] text-stone-900 uppercase">
                Zonas de atuação
              </h2>
            </div>
            <p className="font-sans text-stone-600 text-sm max-w-md">
              Especialização na região centro de Portugal com enfoque primordial no concelho de Pombal e ligações estratégicas aos concelhos vizinhos.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="p-6 bg-white border border-stone-200/80">
              <div className="flex items-center gap-3 mb-3 text-[#36210f]">
                <MapPin size={18} className="text-[#b87d1d]" />
                <h3 className="font-sans text-base font-semibold uppercase tracking-[0.16em]">
                  Pombal (Centro & Freguesias)
                </h3>
              </div>
              <p className="font-sans text-stone-600 text-xs sm:text-sm leading-relaxed">
                Forte atuação urbana e rural: Pombal Centro, Louriçal, Almagreira, Pelariga, Meirinhas, Redinha, Guia, Ilha e Mata Mourisca.
              </p>
            </div>

            <div className="p-6 bg-white border border-stone-200/80">
              <div className="flex items-center gap-3 mb-3 text-[#36210f]">
                <MapPin size={18} className="text-[#b87d1d]" />
                <h3 className="font-sans text-base font-semibold uppercase tracking-[0.16em]">
                  Distrito de Leiria
                </h3>
              </div>
              <p className="font-sans text-stone-600 text-xs sm:text-sm leading-relaxed">
                Projetos residenciais e quintas em Leiria, Ansião, Soure, Figueira da Foz e no eixo rodoviário IC2 / A1.
              </p>
            </div>

            <div className="p-6 bg-white border border-stone-200/80">
              <div className="flex items-center gap-3 mb-3 text-[#36210f]">
                <MapPin size={18} className="text-[#b87d1d]" />
                <h3 className="font-sans text-base font-semibold uppercase tracking-[0.16em]">
                  Investimento em Portugal
                </h3>
              </div>
              <p className="font-sans text-stone-600 text-xs sm:text-sm leading-relaxed">
                Consultoria para compradores nacionais e estrangeiros que pretendem investir em habitação própria permanente ou propriedades de rendimento.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 6. CTA PARA CONTACTO DEDICADO */}
      <section
        id="home-contatos-section"
        className="w-full bg-[#36210f] text-white py-20 sm:py-24"
        aria-label="Contacto e Marcação de Consulta"
      >
        <div className="max-w-5xl mx-auto px-6 sm:px-10 text-center">
          <span className="font-sans text-[11px] uppercase tracking-[0.32em] text-[#d4a86a] font-semibold block mb-3">
            ATENDIMENTO PERSONALIZADO
          </span>
          <h2 className="font-sans text-2xl sm:text-3xl md:text-4xl font-light tracking-[0.14em] uppercase text-white mb-6">
            Deseja Comprar ou Vender Imóvel em Portugal?
          </h2>
          <p className="font-sans text-stone-300 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto mb-10">
            Fale diretamente com a consultora Sandra Carlos. Agende uma reunião sem compromisso para avaliarmos a sua casa ou encontrarmos a propriedade ideal para a sua família.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 flex-wrap">
            <a
              href="https://wa.me/351965881547?text=Ol%C3%A1%20Sandra,%20gostaria%20de%20marcar%20uma%20consulta%20imobili%C3%A1ria."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 px-8 py-4 bg-[#b87d1d] hover:bg-[#a66f17] text-white font-sans text-xs uppercase tracking-[0.24em] font-semibold transition-colors duration-200 shadow-md cursor-pointer"
            >
              <MessageCircle size={16} />
              <span>FALAR VIA WHATSAPP</span>
            </a>

            <button
              type="button"
              onClick={() => {
                if (onOpenContact) {
                  onOpenContact();
                } else {
                  onScrollToContact();
                }
              }}
              className="inline-flex items-center gap-2.5 px-8 py-4 bg-transparent border border-white/40 hover:border-white text-white font-sans text-xs uppercase tracking-[0.24em] font-semibold transition-colors duration-200 cursor-pointer"
            >
              <Mail size={16} />
              <span>ENVIAR MENSAGEM</span>
            </button>

            <a
              href="tel:+351965881547"
              className="inline-flex items-center gap-2 text-stone-300 hover:text-white font-sans text-xs uppercase tracking-[0.2em] font-medium transition-colors py-2 px-4"
            >
              <Phone size={14} className="text-[#d4a86a]" />
              <span>+351 965 881 547</span>
            </a>
          </div>
        </div>
      </section>

      {/* 7. TESTIMONIALS SECTION (Testemunhos de clientes) */}
      <Testimonials />
    </article>
  );
};

