import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Share2,
  Heart,
  MapPin,
  Maximize2,
  Play,
  ArrowLeft,
  Check,
  Phone,
  Mail,
  ExternalLink,
  Layers,
  Compass,
  Eye,
  X,
  Copy,
  CheckCircle2,
  MessageCircle,
  Facebook,
  Instagram,
  Link2,
  ArrowDown
} from 'lucide-react';
import { Property, PageType } from '../types';
import { PropertyMap } from '../components/PropertyMap';
import { PropertyStatusOverlay } from '../components/PropertyStatusOverlay';
import { useData } from '../context/DataContext';

const heroSlideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 1,
  }),
  center: {
    x: '0%',
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? '-100%' : '100%',
    opacity: 1,
  }),
};

interface PropertyDetailPageProps {
  property: Property;
  onBack: () => void;
  onSelectProperty: (property: Property) => void;
  onOpenContact: (subject?: string) => void;
  onNavigate?: (page: PageType) => void;
}

export const PropertyDetailPage: React.FC<PropertyDetailPageProps> = ({
  property,
  onBack,
  onSelectProperty,
  onOpenContact,
  onNavigate,
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [isReadMore, setIsReadMore] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isShareMenuOpen, setIsShareMenuOpen] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const shareMenuRef = useRef<HTMLDivElement>(null);
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('sandra_favorites');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const allImages = [property.image, ...(property.secondaryImages || [])];

  // Sliding animation direction (1: next/forward, -1: prev/backward)
  const [slideDirection, setSlideDirection] = useState<1 | -1>(1);
  const [isHeroPaused, setIsHeroPaused] = useState(false);

  // Sliding gallery for related houses
  const [relatedSlideIndex, setRelatedSlideIndex] = useState(0);
  const [relatedDirection, setRelatedDirection] = useState<1 | -1>(1);

  // Mobile floating button "Contactar a Sandra" tracking state & refs
  const [showMobileContactButton, setShowMobileContactButton] = useState(false);
  const descriptionSectionRef = useRef<HTMLDivElement>(null);
  const contactCardRef = useRef<HTMLDivElement>(null);

  // Reset scroll and state when property changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    setActiveImageIndex(0);
    setSlideDirection(1);
    setIsReadMore(false);
    setIsVideoPlaying(false);
    setRelatedSlideIndex(0);
  }, [property.id]);

  // Gallery Navigation with sliding animation direction
  const nextImage = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSlideDirection(1);
    setActiveImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSlideDirection(-1);
    setActiveImageIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  // Automatic 4-second timer to change main house image with sliding effect
  useEffect(() => {
    if (isGalleryOpen || isHeroPaused || allImages.length <= 1) return;

    const timer = setInterval(() => {
      setSlideDirection(1);
      setActiveImageIndex((prev) => (prev + 1) % allImages.length);
    }, 4000);

    return () => clearInterval(timer);
  }, [isGalleryOpen, isHeroPaused, allImages.length]);

  // Keyboard navigation for gallery
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isGalleryOpen) {
        if (e.key === 'ArrowRight') nextImage();
        if (e.key === 'ArrowLeft') prevImage();
        if (e.key === 'Escape') setIsGalleryOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isGalleryOpen, allImages.length]);

  // Close share menu on click outside or escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (shareMenuRef.current && !shareMenuRef.current.contains(e.target as Node)) {
        setIsShareMenuOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsShareMenuOpen(false);
      }
    };
    if (isShareMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isShareMenuOpen]);

  // Social & Direct Share actions
  const getShareUrl = () => {
    return window.location.href;
  };

  const handleShareWhatsApp = () => {
    const url = getShareUrl();
    const text = `Veja este magnífico imóvel em Pombal: ${property.title} (${property.location})\nPreço: ${property.price || 'Sob Consulta'}\n${url}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
    setIsShareMenuOpen(false);
  };

  const handleShareFacebook = () => {
    const url = getShareUrl();
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank', 'noopener,noreferrer,width=650,height=550');
    setIsShareMenuOpen(false);
  };

  const handleShareInstagram = async () => {
    const url = getShareUrl();
    try {
      await navigator.clipboard.writeText(url);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 3200);
    } catch {
      // ignore
    }
    window.open('https://www.instagram.com/', '_blank', 'noopener,noreferrer');
    setIsShareMenuOpen(false);
  };

  const handleShareEmail = () => {
    const url = getShareUrl();
    const subject = `Recomendação de Imóvel: ${property.title} - Sandra Carlos`;
    const body = `Olá,\n\nRecomendo a consulta deste imóvel em ${property.location}:\n\n${property.title}\nTipologia: ${property.typology}\nÁrea: ${property.area}\nPreço: ${property.price || 'Sob Consulta'}\n\nConsulta todas as fotografias e detalhes no website:\n${url}\n\nCom os melhores cumprimentos`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setIsShareMenuOpen(false);
  };

  const handleCopyLink = async () => {
    const url = getShareUrl();
    try {
      await navigator.clipboard.writeText(url);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2800);
    } catch {
      // fallback
    }
  };

  // Native share fallback / trigger
  const handleShare = () => {
    setIsShareMenuOpen((prev) => !prev);
  };

  const { properties: allProperties } = useData();
  // Other properties recommendation (exclude current)
  const relatedProperties = (allProperties && allProperties.length > 0 ? allProperties : [property]).filter((p) => p.id !== property.id);

  const nextHouse = () => {
    if (relatedProperties.length === 0) return;
    setRelatedDirection(1);
    setRelatedSlideIndex((prev) => (prev + 1) % relatedProperties.length);
  };

  const prevHouse = () => {
    if (relatedProperties.length === 0) return;
    setRelatedDirection(-1);
    setRelatedSlideIndex((prev) => (prev - 1 + relatedProperties.length) % relatedProperties.length);
  };

  const isCurrentFavorite = favorites.includes(property.id);

  // WhatsApp link with prefilled text
  const whatsappUrl = `https://wa.me/351965881547?text=${encodeURIComponent(
    `Olá Sandra Carlos, tenho interesse no imóvel "${property.title}" (${property.location}). Gostaria de receber mais informações e agendar uma visita.`
  )}`;

  // Mobile Floating "Contactar a Sandra" button:
  // Tracks user scroll from the start of the description down through the financial section,
  // then hides once the user reaches the "Contacte-me" card directly.
  useEffect(() => {
    const handleScroll = () => {
      // Only applicable on mobile / tablet screens (< 1024px)
      if (window.innerWidth >= 1024) {
        setShowMobileContactButton(false);
        return;
      }

      const descEl = descriptionSectionRef.current;
      const contactEl = contactCardRef.current;

      if (!descEl || !contactEl) return;

      const descRect = descEl.getBoundingClientRect();
      const contactRect = contactEl.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // Has scrolled down to start seeing the property description
      const hasEnteredDescription = descRect.top <= windowHeight * 0.78;
      // Has not yet reached the "Contacte-me" section card
      const hasNotReachedContact = contactRect.top > windowHeight * 0.45;

      if (hasEnteredDescription && hasNotReachedContact) {
        setShowMobileContactButton(true);
      } else {
        setShowMobileContactButton(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [property.id]);

  const scrollToContactMe = () => {
    const el = contactCardRef.current || document.getElementById('contacte-me-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <article id="property-detail-page" className="w-full bg-[#FDF7F6] text-stone-900 pt-[54px] sm:pt-[64px] md:pt-[76px] lg:pt-[82px]">
      {/* 1. TOP HERO GALLERY (Matching 4.jpg with 4-second sliding carousel) */}
      <section className="relative w-full bg-stone-950 select-none" aria-label="Galeria Principal do Imóvel">
        <div
          className="relative w-full h-[52vh] sm:h-[65vh] lg:h-[78vh] max-h-[860px] overflow-hidden"
          onMouseEnter={() => setIsHeroPaused(true)}
          onMouseLeave={() => setIsHeroPaused(false)}
          onTouchStart={() => setIsHeroPaused(true)}
          onTouchEnd={() => setIsHeroPaused(false)}
        >
          {/* Main Hero Image with 3s sliding transition */}
          <AnimatePresence initial={false} custom={slideDirection}>
            {/* Contexto: Fotografia principal de alta resolução no slider editorial do imóvel */}
            <motion.img
              key={activeImageIndex}
              src={allImages[activeImageIndex]}
              alt={`Sandra Carlos Consultoria Imobiliária - ${property.title} em ${property.location} - Fotografia ${activeImageIndex + 1} de ${allImages.length}`}
              custom={slideDirection}
              variants={heroSlideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: 'tween', ease: [0.22, 1, 0.36, 1], duration: 0.6 },
                opacity: { duration: 0.25 },
              }}
              className="absolute inset-0 w-full h-full object-cover cursor-pointer"
              loading="eager"
              width={1600}
              height={1067}
              onClick={() => setIsGalleryOpen(true)}
            />
          </AnimatePresence>

          {/* Vignette Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

          {/* Luxury Status Seal (Hero Variant) */}
          <PropertyStatusOverlay
            status={property.status}
            statusLabel={property.statusLabel}
            variant="hero"
          />

          {/* Gallery Arrows (< and >) with slide trigger */}
          <button
            onClick={prevImage}
            className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-20 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-stone-900/60 hover:bg-stone-900/90 text-white backdrop-blur-md flex items-center justify-center transition-all cursor-pointer border border-white/20 hover:scale-105"
            aria-label="Fotografia Anterior"
          >
            <ChevronLeft size={24} strokeWidth={2} />
          </button>

          <button
            onClick={nextImage}
            className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-20 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-stone-900/60 hover:bg-stone-900/90 text-white backdrop-blur-md flex items-center justify-center transition-all cursor-pointer border border-white/20 hover:scale-105"
            aria-label="Fotografia Seguinte"
          >
            <ChevronRight size={24} strokeWidth={2} />
          </button>

          {/* "VER GALERIA" Button (Bottom Left, like reference 4.jpg) */}
          <button
            onClick={() => setIsGalleryOpen(true)}
            className="absolute bottom-5 left-5 sm:bottom-8 sm:left-8 z-20 inline-flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 bg-black/65 hover:bg-black/85 text-white backdrop-blur-md border border-white/25 text-[10px] sm:text-[11px] uppercase tracking-[0.22em] font-medium transition-all cursor-pointer hover:border-white/50"
            aria-label="Abrir Galeria de Fotografias em Ecrã Inteiro"
          >
            <Maximize2 size={13} strokeWidth={2} />
            <span>VER GALERIA</span>
          </button>

          {/* Slide Indicator Dots (Bottom Center) */}
          <div className="absolute bottom-5 sm:bottom-8 left-1/2 -translate-x-1/2 z-20 hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-sm border border-white/10">
            {allImages.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  setSlideDirection(idx > activeImageIndex ? 1 : -1);
                  setActiveImageIndex(idx);
                }}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  idx === activeImageIndex
                    ? 'w-6 h-1.5 bg-[#D6920B]'
                    : 'w-1.5 h-1.5 bg-white/50 hover:bg-white/80'
                }`}
                aria-label={`Ver fotografia ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* 2. SLEEK DARK SUMMARY BAR (Partilhar aligned with house price, heart button removed) */}
        <div className="relative z-30 w-full bg-[#422502] border-t border-b border-[#5c3403] text-white py-5 sm:py-6 px-6 sm:px-10 lg:px-16">
          <div className="max-w-7xl mx-auto flex flex-col gap-3.5">
            {/* Title & Address */}
            <div>
              <h1 className="font-sans text-xl sm:text-2xl lg:text-3xl font-bold uppercase tracking-[0.12em] text-white">
                {property.title}
              </h1>
              <p className="text-[#d8be9e] text-xs sm:text-sm font-sans tracking-wider mt-1 flex items-center gap-1.5">
                <MapPin size={13} className="text-[#D6920B] shrink-0" />
                <span>{property.address || property.location}</span>
              </p>
            </div>

            {/* Price, Specs & Share Button on the EXACT SAME LEVEL */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-3 border-t border-[#5c3403]">
              {/* Left: House value & specifications */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-[#FDF7F6] font-sans tracking-wider">
                <span className="text-xl sm:text-2xl font-bold text-[#D6920B] mr-2">
                  {property.price || 'Sob Consulta'}
                </span>
                {property.status && property.status !== 'disponivel' && (
                  <PropertyStatusOverlay
                    status={property.status}
                    statusLabel={property.statusLabel}
                    variant="badge"
                  />
                )}
                <span className="hidden sm:inline text-[#d8be9e]/50">|</span>
                {property.bedrooms && (
                  <span>{property.bedrooms} QUARTOS</span>
                )}
                {property.bathrooms && (
                  <>
                    <span className="text-[#d8be9e]/50">&bull;</span>
                    <span>{property.bathrooms} CASAS DE BANHO</span>
                  </>
                )}
                {property.halfBaths && (
                  <>
                    <span className="text-[#d8be9e]/50">&bull;</span>
                    <span>{property.halfBaths} LAVABO</span>
                  </>
                )}
                <span className="text-[#d8be9e]/50">&bull;</span>
                <span>{property.area}</span>
              </div>

              {/* Right: Share Button at the exact same level (Heart button removed) */}
              <div className="relative self-start sm:self-center shrink-0" ref={shareMenuRef}>
                <button
                  onClick={handleShare}
                  className={`relative inline-flex items-center gap-2 px-4 py-2 text-white text-xs uppercase tracking-[0.18em] border transition-all cursor-pointer ${
                    isShareMenuOpen
                      ? 'bg-[#291601] border-[#D6920B] text-[#D6920B]'
                      : 'bg-[#291601]/90 hover:bg-[#381f02] border-[#d8be9e]/40 hover:border-[#D6920B]'
                  }`}
                  aria-label="Partilhar Imóvel"
                  aria-expanded={isShareMenuOpen}
                >
                  <Share2 size={15} />
                  <span>Partilhar</span>
                </button>

                {/* Share Dropdown Menu (Instagram, Facebook, Email, WhatsApp, Link) - Floating card positioned within mobile and desktop viewport */}
                <AnimatePresence>
                  {isShareMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 6, scale: 0.97 }}
                      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute left-0 sm:left-auto sm:right-0 top-full mt-3 z-[100] w-[calc(100vw-3rem)] max-w-xs sm:w-84 bg-stone-900 border border-stone-700/80 border-t-2 border-t-[#D6920B] shadow-[0_25px_60px_-10px_rgba(0,0,0,0.7),0_10px_20px_-5px_rgba(0,0,0,0.5)] p-3.5 sm:p-4 text-white ring-1 ring-black/50"
                    >
                      {/* Floating Indicator Arrow */}
                      <div className="absolute -top-2 left-6 sm:left-auto sm:right-6 w-3.5 h-3.5 bg-stone-900 border-t border-l border-stone-700/80 rotate-45 pointer-events-none" />

                      {/* Header */}
                      <div className="flex items-center justify-between pb-3 mb-2.5 border-b border-stone-800 relative z-10">
                        <div>
                          <span className="font-sans text-[10px] uppercase tracking-[0.24em] text-[#D6920B] font-semibold block">
                            PARTILHAR IMÓVEL
                          </span>
                          <p className="text-xs text-stone-300 font-medium truncate max-w-[190px] sm:max-w-[220px] mt-0.5">
                            {property.title}
                          </p>
                        </div>
                        <button
                          onClick={() => setIsShareMenuOpen(false)}
                          className="p-1 text-stone-400 hover:text-white transition-colors cursor-pointer"
                          aria-label="Fechar menu de partilha"
                        >
                          <X size={15} />
                        </button>
                      </div>

                      {/* Social & Direct Share Options */}
                      <div className="font-sans">
                        {/* 2-column Grid: Left (WhatsApp, Email) | Right (Facebook, Instagram) */}
                        <div className="grid grid-cols-2 gap-2 mb-2">
                          {/* 1. WhatsApp (Left Top) */}
                          <button
                            onClick={handleShareWhatsApp}
                            className="flex items-center gap-2.5 px-3 py-2.5 bg-stone-800/90 hover:bg-stone-750 border border-stone-700 hover:border-emerald-500/60 text-stone-200 text-left transition-all cursor-pointer group"
                            aria-label="Partilhar no WhatsApp"
                          >
                            <div className="w-7 h-7 rounded-full bg-emerald-950 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-800/40 group-hover:scale-105 transition-transform">
                              <MessageCircle size={14} />
                            </div>
                            <span className="text-xs font-semibold tracking-wide text-white group-hover:text-emerald-300 truncate">
                              WhatsApp
                            </span>
                          </button>

                          {/* 2. Facebook (Right Top) */}
                          <button
                            onClick={handleShareFacebook}
                            className="flex items-center gap-2.5 px-3 py-2.5 bg-stone-800/90 hover:bg-stone-750 border border-stone-700 hover:border-blue-500/60 text-stone-200 text-left transition-all cursor-pointer group"
                            aria-label="Partilhar no Facebook"
                          >
                            <div className="w-7 h-7 rounded-full bg-blue-950 text-blue-400 flex items-center justify-center shrink-0 border border-blue-800/40 group-hover:scale-105 transition-transform">
                              <Facebook size={14} />
                            </div>
                            <span className="text-xs font-semibold tracking-wide text-white group-hover:text-blue-300 truncate">
                              Facebook
                            </span>
                          </button>

                          {/* 3. Email (Left Bottom) */}
                          <button
                            onClick={handleShareEmail}
                            className="flex items-center gap-2.5 px-3 py-2.5 bg-stone-800/90 hover:bg-stone-750 border border-stone-700 hover:border-[#D6920B]/60 text-stone-200 text-left transition-all cursor-pointer group"
                            aria-label="Partilhar por Email"
                          >
                            <div className="w-7 h-7 rounded-full bg-stone-900 text-[#D6920B] flex items-center justify-center shrink-0 border border-[#D6920B]/40 group-hover:scale-105 transition-transform">
                              <Mail size={14} />
                            </div>
                            <span className="text-xs font-semibold tracking-wide text-white group-hover:text-[#D6920B] truncate">
                              Email
                            </span>
                          </button>

                          {/* 4. Instagram (Right Bottom) */}
                          <button
                            onClick={handleShareInstagram}
                            className="flex items-center gap-2.5 px-3 py-2.5 bg-stone-800/90 hover:bg-stone-750 border border-stone-700 hover:border-pink-500/60 text-stone-200 text-left transition-all cursor-pointer group"
                            aria-label="Partilhar no Instagram"
                          >
                            <div className="w-7 h-7 rounded-full bg-pink-950 text-pink-400 flex items-center justify-center shrink-0 border border-pink-800/40 group-hover:scale-105 transition-transform">
                              <Instagram size={14} />
                            </div>
                            <span className="text-xs font-semibold tracking-wide text-white group-hover:text-pink-300 truncate">
                              Instagram
                            </span>
                          </button>
                        </div>

                        {/* 5. Copiar Ligação (Spans from Left to Right across the bottom) */}
                        <button
                          onClick={handleCopyLink}
                          className="w-full flex items-center justify-center gap-2.5 px-3 py-2.5 bg-stone-800/90 hover:bg-stone-750 border border-stone-700 hover:border-[#D6920B]/60 text-stone-200 text-center transition-all cursor-pointer group"
                          aria-label="Copiar Ligação"
                        >
                          <div
                            className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 border transition-all ${
                              isCopied
                                ? 'bg-emerald-950 text-emerald-400 border-emerald-600'
                                : 'bg-stone-900 text-stone-300 border-stone-600 group-hover:scale-105 group-hover:text-[#D6920B] group-hover:border-[#D6920B]/50'
                            }`}
                          >
                            {isCopied ? <Check size={14} /> : <Link2 size={14} />}
                          </div>
                          <span className="text-xs font-semibold tracking-wide text-white group-hover:text-[#D6920B] transition-colors">
                            {isCopied ? 'Ligação Copiada!' : 'Copiar Ligação'}
                          </span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. TWO-COLUMN MAIN BODY (Matching 4.jpg: Description + Sticky Contact Me) */}
      <section className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 py-12 sm:py-16 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14">
          {/* LEFT COLUMN: Property Description & Features (~68%) */}
          <div ref={descriptionSectionRef} className="lg:col-span-8 space-y-12">
            {/* Property Description */}
            <div>
              <h2 className="font-sans text-2xl sm:text-3xl font-bold uppercase tracking-[0.14em] text-stone-900 mb-3">
                Descrição do Imóvel
              </h2>
              {property.subtitle && (
                <h3 className="font-sans text-sm sm:text-base font-semibold uppercase tracking-wider text-[#D6920B] mb-5">
                  {property.subtitle}
                </h3>
              )}

              <div className="font-sans text-stone-700 text-sm sm:text-base leading-relaxed space-y-4">
                <p>{property.description}</p>
                {property.extendedDescription && (
                  <>
                    <p>{property.extendedDescription[0]}</p>
                    <AnimatePresence>
                      {isReadMore && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="space-y-4 pt-2 overflow-hidden"
                        >
                          {property.extendedDescription.slice(1).map((para, idx) => (
                            <p key={idx}>{para}</p>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                )}
              </div>

              {property.extendedDescription && property.extendedDescription.length > 1 && (
                <button
                  onClick={() => setIsReadMore(!isReadMore)}
                  className="mt-4 inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.2em] font-semibold text-[#422502] hover:text-[#D6920B] transition-colors cursor-pointer"
                >
                  <span>{isReadMore ? 'Ler Menos' : 'Ler Mais'}</span>
                  <ChevronRight size={14} className={`transition-transform duration-200 ${isReadMore ? '-rotate-90' : 'rotate-90'}`} />
                </button>
              )}
            </div>

            {/* Destaques Arquitetónicos rápidos */}
            {property.architecturalHighlights && property.architecturalHighlights.length > 0 && (
              <div className="bg-[#FDF7F6] p-6 sm:p-8 border border-[#d8be9e]/50 shadow-xs">
                <h4 className="font-sans text-xs uppercase tracking-[0.24em] text-[#422502] font-bold mb-4">
                  DESTAQUES DA PROPRIEDADE
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {property.architecturalHighlights.map((highlight, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm text-stone-800 font-sans">
                      <Check size={16} className="text-[#D6920B] shrink-0 mt-0.5" />
                      <span>{highlight}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Property Features & Amenities - Regra de ouro: apenas renderiza secções que estejam preenchidas */}
            {Boolean(
              (property.interiorFeatures && property.interiorFeatures.length > 0) ||
              (property.exteriorFeatures && property.exteriorFeatures.length > 0) ||
              (property.detailsFeatures && property.detailsFeatures.length > 0) ||
              (property.financialDetails && property.financialDetails.length > 0)
            ) && (
              <div className="border-t border-[#d8be9e]/40 pt-10">
                <h2 className="font-sans text-2xl sm:text-3xl font-bold uppercase tracking-[0.14em] text-stone-900 mb-8">
                  Características e Comodidades
                </h2>

                {/* Interior */}
                {property.interiorFeatures && property.interiorFeatures.length > 0 && (
                  <div className="mb-10">
                    <h3 className="font-sans text-lg sm:text-xl font-bold uppercase tracking-wider text-stone-900 mb-5 pb-2 border-b border-[#d8be9e]/40">
                      Interior
                    </h3>
                    <div className="space-y-3">
                      {property.interiorFeatures.map((item, idx) => (
                        <div key={idx} className="grid grid-cols-1 sm:grid-cols-12 gap-1 sm:gap-4 py-2 border-b border-stone-200/60 text-xs sm:text-sm font-sans">
                          <span className="sm:col-span-5 text-stone-600 font-medium flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#422502] shrink-0" />
                            {item.label}
                          </span>
                          <span className="sm:col-span-7 text-stone-900 font-semibold">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Exterior */}
                {property.exteriorFeatures && property.exteriorFeatures.length > 0 && (
                  <div className="mb-10">
                    <h3 className="font-sans text-lg sm:text-xl font-bold uppercase tracking-wider text-stone-900 mb-5 pb-2 border-b border-[#d8be9e]/40">
                      Exterior
                    </h3>
                    <div className="space-y-3">
                      {property.exteriorFeatures.map((item, idx) => (
                        <div key={idx} className="grid grid-cols-1 sm:grid-cols-12 gap-1 sm:gap-4 py-2 border-b border-stone-200/60 text-xs sm:text-sm font-sans">
                          <span className="sm:col-span-5 text-stone-600 font-medium flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#422502] shrink-0" />
                            {item.label}
                          </span>
                          <span className="sm:col-span-7 text-stone-900 font-semibold">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Details (Detalhes) */}
                {property.detailsFeatures && property.detailsFeatures.length > 0 && (
                  <div className="mb-10">
                    <h3 className="font-sans text-lg sm:text-xl font-bold uppercase tracking-wider text-stone-900 mb-5 pb-2 border-b border-[#d8be9e]/40">
                      Detalhes
                    </h3>
                    <div className="space-y-3">
                      {property.detailsFeatures.map((item, idx) => (
                        <div key={idx} className="grid grid-cols-1 sm:grid-cols-12 gap-1 sm:gap-4 py-2 border-b border-stone-200/60 text-xs sm:text-sm font-sans">
                          <span className="sm:col-span-5 text-stone-600 font-medium flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#422502] shrink-0" />
                            {item.label}
                          </span>
                          <span className="sm:col-span-7 text-stone-900 font-semibold">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Financial (Financeiro) */}
                {property.financialDetails && property.financialDetails.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-sans text-lg sm:text-xl font-bold uppercase tracking-wider text-stone-900 mb-5 pb-2 border-b border-[#d8be9e]/40">
                      Financeiro
                    </h3>
                    <div className="space-y-3">
                      {property.financialDetails.map((item, idx) => (
                        <div key={idx} className="grid grid-cols-1 sm:grid-cols-12 gap-1 sm:gap-4 py-2 border-b border-stone-200/60 text-xs sm:text-sm font-sans">
                          <span className="sm:col-span-5 text-stone-600 font-medium flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#422502] shrink-0" />
                            {item.label}
                          </span>
                          <span className="sm:col-span-7 text-stone-900 font-semibold">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: STICKY "CONTACTE-ME" SIDEBAR CARD (Matching 4.jpg) */}
          {/* Accompanies the user from Property Description all the way down to Financeiro */}
          <div id="contacte-me-section" ref={contactCardRef} className="lg:col-span-4 w-full relative scroll-mt-28">
            <div className="sticky top-24 lg:top-28 w-full bg-[#422502] text-white p-7 sm:p-9 border border-[#5c3403] shadow-xl flex flex-col items-center text-center">
              <span className="font-serif text-xs uppercase tracking-[0.32em] text-[#D6920B] font-normal mb-6">
                CONTACTE-ME
              </span>

              {/* Agent Photo */}
              <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden mb-5 border-2 border-[#D6920B]/60 shadow-lg">
                {/* Contexto: Retrato da consultora Sandra Carlos na caixa de contacto do imóvel */}
                <img
                  src="https://SEU-DOMINIO-AQUI/sandra-carlos-consultora-imobiliaria-pombal.webp"
                  alt="Sandra Carlos - Consultora Imobiliária em Pombal e Portugal"
                  className="w-full h-full object-cover object-[center_21%]"
                  loading="lazy"
                  width="128"
                  height="128"
                />
              </div>

              {/* Agent Information */}
              <h3 className="font-sans text-lg sm:text-xl font-bold uppercase tracking-[0.16em] text-white">
                SANDRA CARLOS
              </h3>
              <p className="font-sans text-xs text-[#d8be9e] font-normal tracking-wider mt-1 mb-6 max-w-xs">
                Consultora Imobiliária Expertimo | Agente Pro
              </p>

              {/* Contact Direct Links */}
              <div className="w-full border-t border-b border-[#5c3403] py-4 space-y-2.5 mb-6 text-xs sm:text-sm">
                <a
                  href="tel:+351965881547"
                  className="flex items-center justify-center gap-2 text-stone-200 hover:text-[#D6920B] transition-colors"
                >
                  <Phone size={14} className="text-[#D6920B]" />
                  <span>+351 965 881 547</span>
                </a>
                <a
                  href="mailto:sandra.carlos@expertimo.eu"
                  className="flex items-center justify-center gap-2 text-stone-200 hover:text-[#D6920B] transition-colors break-all"
                >
                  <Mail size={14} className="text-[#D6920B]" />
                  <span>sandra.carlos@expertimo.eu</span>
                </a>
              </div>

              {/* Buttons */}
              <div className="w-full space-y-2.5">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-4 bg-[#261501] hover:bg-[#381f02] text-white text-xs uppercase tracking-[0.16em] font-semibold transition-colors border border-[#D6920B]/60 hover:border-[#D6920B] cursor-pointer"
                >
                  <MessageCircle size={15} className="text-emerald-400" />
                  <span>CONVERSAR POR WHATSAPP</span>
                </a>

                <button
                  onClick={() => onOpenContact(`Interesse no Imóvel: ${property.title}`)}
                  className="w-full py-3.5 px-4 bg-[#261501] hover:bg-[#381f02] text-[#d8be9e] hover:text-white text-xs uppercase tracking-[0.2em] font-semibold transition-colors cursor-pointer border border-[#5c3403] hover:border-[#D6920B]/60"
                >
                  CONTACTAR AGENTE
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. VIDEO SECTION - Regra de Ouro: apenas aparece se preenchido no admin */}
      {property.videoUrl && property.videoUrl.trim() !== '' && (
        <section className="w-full bg-[#d8be9e] text-[#422502] py-16 sm:py-20 lg:py-24 border-t border-[#c5ab8d]" aria-label="Vídeo do Imóvel">
          <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
            <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
              <span className="font-sans text-[11px] uppercase tracking-[0.3em] text-[#422502] font-semibold block mb-2">
                TOUR AUDIOVISUAL
              </span>
              <h2 className="font-sans text-2xl sm:text-3xl lg:text-4xl font-bold uppercase tracking-[0.14em] text-[#422502]">
                Vídeo do Imóvel
              </h2>
              <p className="font-sans text-xs sm:text-sm text-stone-800 font-normal tracking-wide mt-2">
                Experiencie uma visita imersiva em alta definição a esta magnífica propriedade em Pombal.
              </p>
            </div>

            {/* Cinematic Video Player / Embed Frame */}
            <div className="relative w-full aspect-[16/9] max-w-5xl mx-auto overflow-hidden bg-black border border-[#422502]/20 shadow-2xl group">
              {isVideoPlaying ? (
                <div className="w-full h-full">
                  <iframe
                    src={property.videoUrl.includes('?') ? `${property.videoUrl}&autoplay=1` : `${property.videoUrl}?autoplay=1`}
                    title={`Vídeo - ${property.title}`}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                <div
                  onClick={() => setIsVideoPlaying(true)}
                  className="relative w-full h-full cursor-pointer"
                >
                  {/* Video Cover Image */}
                  {/* Contexto: Imagem de capa do vídeo tour / apresentação imobiliária da propriedade */}
                  <img
                    src={property.videoThumbnail || property.secondaryImages?.[0] || property.image}
                    alt={`Sandra Carlos Consultoria Imobiliária - Apresentação em Vídeo e Visita Virtual de ${property.title}`}
                    className="w-full h-full object-cover filter brightness-[0.75] transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                    width="1280"
                    height="720"
                  />

                  {/* Dark Vignette Overlay */}
                  <div className="absolute inset-0 bg-[#422502]/40 group-hover:bg-[#422502]/20 transition-colors" />

                  {/* Central Play Button */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#261501]/90 group-hover:bg-[#261501] text-white border-2 border-[#D6920B] flex items-center justify-center shadow-2xl transition-transform duration-300 group-hover:scale-110">
                      <Play size={28} className="text-[#D6920B] fill-[#D6920B] translate-x-0.5" />
                    </div>
                    <span className="font-sans text-[11px] sm:text-xs uppercase tracking-[0.24em] font-semibold text-[#d8be9e] group-hover:text-white drop-shadow-md">
                      REPRODUZIR TOUR
                    </span>
                  </div>

                  {/* Video Info Tag */}
                  <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6 px-3 py-1.5 bg-[#422502]/85 backdrop-blur-sm border border-[#D6920B]/40 text-[10px] sm:text-xs uppercase tracking-widest text-[#d8be9e]">
                    Visita Guiada
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* 5. INTERACTIVE MAP SECTION - Regra de Ouro: apenas aparece se coordenadas válidas */}
      {property.mapCoordinates && typeof property.mapCoordinates.lat === 'number' && typeof property.mapCoordinates.lng === 'number' && (
        <PropertyMap property={property} />
      )}

      {/* 6. "TAMBÉM PODERÁ TER INTERESSE" (Galeria de Casas com Efeito Deslizante) */}
      {relatedProperties.length > 0 && (
      <section className="w-full bg-[#422502] text-white py-14 sm:py-20 border-t border-[#5c3403] overflow-hidden" aria-label="Imóveis Semelhantes">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
          {/* Header Banner matching 5.jpg with slide navigation buttons */}
          <div className="w-full flex items-center justify-between pb-6 sm:pb-8 border-b border-[#5c3403] mb-8 sm:mb-12">
            <div>
              <span className="font-sans text-[10px] uppercase tracking-[0.35em] text-[#D6920B] font-semibold block mb-1">
                OUTRAS OPORTUNIDADES
              </span>
              <h2 className="font-sans text-sm sm:text-base md:text-lg font-light uppercase tracking-[0.24em] text-stone-200">
                TAMBÉM PODERÁ TER INTERESSE
              </h2>
            </div>

            {/* Slider Arrow Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={prevHouse}
                className="w-10 h-10 rounded-full border border-[#6b3d04] bg-[#2a1701]/90 hover:bg-[#381f02] text-stone-200 hover:text-white flex items-center justify-center transition-all cursor-pointer hover:border-[#D6920B]"
                aria-label="Imóvel Anterior"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={nextHouse}
                className="w-10 h-10 rounded-full border border-[#6b3d04] bg-[#2a1701]/90 hover:bg-[#381f02] text-stone-200 hover:text-white flex items-center justify-center transition-all cursor-pointer hover:border-[#D6920B]"
                aria-label="Próximo Imóvel"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          {/* Sliding Track of Houses with slower, smooth glide */}
          <div className="relative overflow-hidden">
            <motion.div
              className="flex gap-6 sm:gap-8"
              animate={{
                x: `calc(-${relatedSlideIndex} * (100% / 1 + 1.5rem))`,
              }}
              transition={{
                type: 'tween',
                ease: [0.16, 1, 0.3, 1],
                duration: 1.1,
              }}
              style={{
                display: 'flex',
                width: '100%',
              }}
            >
              {relatedProperties.map((related, idx) => {
                return (
                  <motion.div
                    key={related.id}
                    onClick={() => {
                      onSelectProperty(related);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="group relative cursor-pointer overflow-hidden border border-[#5c3403] aspect-[4/5] sm:aspect-[4/5.2] flex flex-col justify-end p-6 sm:p-7 transition-all hover:border-[#D6920B] shrink-0 w-full md:w-[calc((100%-2rem*2)/3)]"
                    whileHover={{ y: -4 }}
                    transition={{ duration: 0.2 }}
                  >
                    {/* Background Image */}
                    {/* Contexto: Cartão de imóvel similar / relacionado na parte inferior da ficha do imóvel */}
                    <img
                      src={related.image}
                      alt={`Sandra Carlos Consultoria Imobiliária - ${related.title} em ${related.location}`}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 filter brightness-[0.75] group-hover:brightness-[0.88]"
                      loading="lazy"
                      width="500"
                      height="625"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#261501] via-[#261501]/50 to-transparent opacity-90 group-hover:opacity-80 transition-opacity" />

                    {/* Selo Visual de Estado em Imóveis Relacionados */}
                    <PropertyStatusOverlay
                      status={related.status}
                      statusLabel={related.statusLabel}
                      variant="card"
                    />

                    {/* Content Overlay */}
                    <div className="relative z-10 flex flex-col items-center text-center">
                      <span className="font-sans text-[10px] uppercase tracking-[0.24em] text-[#D6920B] font-semibold mb-1">
                        {related.location}
                      </span>
                      <h3 className="font-sans text-base sm:text-lg font-bold uppercase tracking-[0.14em] text-white mb-1">
                        {related.title}
                      </h3>
                      <span className="font-sans text-base sm:text-lg font-bold text-[#D6920B] mb-2">
                        {related.price || 'Sob Consulta'}
                      </span>
                      <p className="font-sans text-[11px] text-[#d8be9e] uppercase tracking-wider mb-3">
                        {related.bedrooms ? `${related.bedrooms} QUARTOS` : related.typology} &bull; {related.bathrooms ? `${related.bathrooms} CASAS DE BANHO` : 'WC'} &bull; {related.area}
                      </p>

                      <div className="inline-flex items-center gap-1.5 text-xs text-stone-200 uppercase tracking-widest group-hover:text-[#D6920B] transition-colors border-b border-[#6b3d04] group-hover:border-[#D6920B] pb-0.5">
                        <span>VER DETALHES</span>
                        <ChevronRight size={13} className="transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>

          {/* Slide Indicator Dots */}
          <div className="mt-8 flex items-center justify-center gap-2">
            {relatedProperties.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  setRelatedDirection(i > relatedSlideIndex ? 1 : -1);
                  setRelatedSlideIndex(i);
                }}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  i === relatedSlideIndex
                    ? 'w-7 h-2 bg-[#D6920B]'
                    : 'w-2 h-2 bg-[#6b3d04] hover:bg-[#8f5207]'
                }`}
                aria-label={`Deslizar para imóvel ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </section>
      )}

      {/* 7. FULLSCREEN LIGHTBOX GALLERY MODAL (Com Efeito Deslizante entre Imagens) */}
      <AnimatePresence>
        {isGalleryOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-stone-950/95 backdrop-blur-lg flex flex-col select-none"
          >
            {/* Top Bar */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-800 text-white z-20">
              <div className="flex items-center gap-3">
                <span className="font-sans text-xs uppercase tracking-[0.2em] text-[#D6920B] font-semibold">
                  GALERIA DE FOTOGRAFIAS
                </span>
                <span className="text-stone-500 text-xs">&bull;</span>
                <span className="text-[#d8be9e] text-xs font-sans">
                  {property.title} ({activeImageIndex + 1} de {allImages.length})
                </span>
              </div>

              <button
                onClick={() => setIsGalleryOpen(false)}
                className="p-2 hover:bg-stone-800 text-stone-300 hover:text-white transition-colors cursor-pointer"
                aria-label="Fechar Galeria"
              >
                <X size={22} />
              </button>
            </div>

            {/* Main Stage with sliding transition between images */}
            <div className="relative flex-grow flex items-center justify-center p-4 sm:p-8 overflow-hidden w-full">
              <button
                onClick={prevImage}
                className="absolute left-4 sm:left-8 z-30 p-3 sm:p-4 rounded-full bg-black/65 hover:bg-black/90 text-white transition-all cursor-pointer border border-white/20 hover:scale-105"
                aria-label="Fotografia Anterior"
              >
                <ChevronLeft size={28} />
              </button>

              <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                <AnimatePresence initial={false} custom={slideDirection}>
                  <motion.img
                    key={activeImageIndex}
                    src={allImages[activeImageIndex]}
                    alt={`${property.title} - Foto ${activeImageIndex + 1}`}
                    custom={slideDirection}
                    variants={heroSlideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{
                      x: { type: 'tween', ease: [0.16, 1, 0.3, 1], duration: 0.6 },
                      opacity: { duration: 0.25 },
                    }}
                    className="absolute max-h-[75vh] max-w-[90vw] object-contain shadow-2xl select-none"
                  />
                </AnimatePresence>
              </div>

              <button
                onClick={nextImage}
                className="absolute right-4 sm:right-8 z-30 p-3 sm:p-4 rounded-full bg-black/65 hover:bg-black/90 text-white transition-all cursor-pointer border border-white/20 hover:scale-105"
                aria-label="Fotografia Seguinte"
              >
                <ChevronRight size={28} />
              </button>
            </div>

            {/* Bottom Thumbnail Strip */}
            <div className="h-20 bg-black/80 border-t border-stone-800 p-2 flex items-center justify-center gap-2 overflow-x-auto z-20">
              {allImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSlideDirection(idx > activeImageIndex ? 1 : -1);
                    setActiveImageIndex(idx);
                  }}
                  className={`relative h-14 w-20 shrink-0 overflow-hidden border transition-all cursor-pointer ${
                    activeImageIndex === idx
                      ? 'border-[#D6920B] scale-105 opacity-100'
                      : 'border-transparent opacity-50 hover:opacity-85'
                  }`}
                >
                  {/* Contexto: Miniatura navegável da galeria expandida do imóvel */}
                  <img
                    src={img}
                    alt={`Miniatura ${idx + 1} de ${property.title}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    width="80"
                    height="56"
                  />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 8. MOBILE FLOATING "CONTACTAR A SANDRA" BUTTON */}
      {/* Accompanies the user scroll through description until the financial section */}
      {/* Clicking immediately scrolls directly to the "Contacte-me" section */}
      <AnimatePresence>
        {showMobileContactButton && !isGalleryOpen && (
          <motion.div
            initial={{ opacity: 0, y: 32, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.94 }}
            transition={{ type: 'spring', stiffness: 350, damping: 28 }}
            className="fixed bottom-5 inset-x-0 z-40 lg:hidden flex justify-center px-4 pointer-events-none"
          >
            <button
              onClick={scrollToContactMe}
              className="pointer-events-auto w-full max-w-sm bg-[#422502]/95 backdrop-blur-md text-white border border-[#D6920B]/70 shadow-[0_12px_36px_rgba(0,0,0,0.6),0_0_20px_rgba(214,146,11,0.25)] rounded-full py-2.5 px-4 flex items-center justify-between gap-3 cursor-pointer active:scale-[0.98] hover:border-[#D6920B] transition-all group"
              aria-label="Contactar a Sandra - Ir para Contacte-me"
            >
              {/* Sandra Photo with online indicator */}
              <div className="relative shrink-0">
                <div className="w-10 h-10 rounded-full overflow-hidden border border-[#D6920B] shadow-sm">
                  {/* Contexto: Miniatura de retrato da Sandra Carlos no botão flutuante mobile de contacto rápido */}
                  <img
                    src="https://SEU-DOMINIO-AQUI/sandra-carlos-consultora-imobiliaria-pombal.webp"
                    alt="Sandra Carlos - Consultora Imobiliária"
                    className="w-full h-full object-cover object-[center_21%]"
                    loading="lazy"
                    width="40"
                    height="40"
                  />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-[#422502] animate-pulse" />
              </div>

              {/* Title & destination hint */}
              <div className="flex-1 text-left min-w-0">
                <p className="font-sans text-[11px] font-bold uppercase tracking-[0.16em] text-white truncate group-hover:text-[#D6920B] transition-colors">
                  CONTACTAR A SANDRA
                </p>
                <p className="font-sans text-[10px] text-stone-300 tracking-wider truncate flex items-center gap-1 mt-0.5">
                  <span className="text-[#D6920B] font-medium">Ir para Contacte-me</span>
                </p>
              </div>

              {/* Action arrow badge */}
              <div className="shrink-0 w-8 h-8 rounded-full bg-[#261501] border border-[#D6920B]/60 flex items-center justify-center text-[#D6920B] group-hover:bg-[#381f02] group-hover:scale-105 transition-all shadow-inner">
                <ArrowDown size={15} className="animate-bounce" />
              </div>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </article>
  );
};
