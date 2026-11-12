import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Property, PageType } from '../types';
import { Eye, MapPin, ChevronDown, Check, ArrowRight } from 'lucide-react';
import { sortPropertiesWithFeaturedFirst } from '../utils/featuredManager';
import { PropertyStatusOverlay } from '../components/PropertyStatusOverlay';
import { Breadcrumb } from '../components/Breadcrumb';
import { useData } from '../context/DataContext';
import { getPropertyPath } from '../utils/slug';
import { getPropertyImageAlt } from '../utils/imageSeo';

interface HousesPageProps {
  onSelectProperty: (property: Property) => void;
  onOpenContact?: () => void;
  onNavigate?: (page: PageType) => void;
}

export const HousesPage: React.FC<HousesPageProps> = ({ onSelectProperty, onNavigate }) => {
  const { properties, siteSettings } = useData();
  const [showExtendedText, setShowExtendedText] = useState(false);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [isLocationMenuOpen, setIsLocationMenuOpen] = useState(false);
  const locationMenuRef = useRef<HTMLDivElement>(null);

  const featuredIds = siteSettings.featuredIds;
  const heroBanner = siteSettings.photos.housesHero;
  const { texts } = siteSettings;

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Fechar o menu vertical LOCAL ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (locationMenuRef.current && !locationMenuRef.current.contains(event.target as Node)) {
        setIsLocationMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Localizações extraídas dinamicamente a partir dos imóveis registados
  const availableLocations = useMemo(() => {
    const map = new Map<string, { count: number; displayName: string }>();
    properties.forEach((p) => {
      const loc = p.location.trim();
      const existing = map.get(loc);
      if (existing) {
        existing.count += 1;
      } else {
        const displayName = loc.replace(', Portugal', '');
        map.set(loc, { count: 1, displayName });
      }
    });
    return Array.from(map.entries()).map(([raw, data]) => ({
      raw,
      displayName: data.displayName,
      count: data.count,
    }));
  }, []);

  const isAllSelected = selectedLocations.length === 0;

  const handleToggleLocation = (locRaw: string) => {
    if (isAllSelected) {
      setSelectedLocations([locRaw]);
    } else {
      if (selectedLocations.includes(locRaw)) {
        const next = selectedLocations.filter((item) => item !== locRaw);
        setSelectedLocations(next);
      } else {
        setSelectedLocations([...selectedLocations, locRaw]);
      }
    }
  };

  const handleSelectAll = () => {
    setSelectedLocations([]);
  };

  // Filtragem de imóveis por localização com destacados no topo
  const filteredProperties = useMemo(() => {
    let base = properties;
    if (selectedLocations.length > 0) {
      base = base.filter((p) => selectedLocations.includes(p.location.trim()));
    }
    return sortPropertiesWithFeaturedFirst(base, featuredIds);
  }, [properties, selectedLocations, featuredIds]);

  const locationButtonLabel = useMemo(() => {
    if (isAllSelected) return 'LOCAL';
    if (selectedLocations.length === 1) {
      const item = availableLocations.find((l) => l.raw === selectedLocations[0]);
      return `LOCAL: ${item ? item.displayName : '1'}`;
    }
    if (selectedLocations.length === 2) {
      const names = selectedLocations
        .map((raw) => availableLocations.find((l) => l.raw === raw)?.displayName)
        .filter(Boolean);
      return `LOCAL: ${names.join(', ')}`;
    }
    return `LOCAL: ${selectedLocations.length} SELECIONADOS`;
  }, [isAllSelected, selectedLocations, availableLocations]);

  return (
    <article id="imoveis-page" className="w-full bg-[#faf8f5] text-stone-900 pb-28 sm:pb-36">
      {/* 1. HERO BANNER */}
      <section className="w-full relative" aria-label="Imagem de Destaque">
        <div className="w-full h-[45vh] sm:h-[55vh] lg:h-[65vh] max-h-[720px] overflow-hidden">
          {/* Contexto: Imagem principal / Hero Banner do catálogo de imóveis em Pombal e Portugal */}
          <img
            src={heroBanner}
            alt="Sandra Carlos Consultoria Imobiliária - Catálogo de Moradias e Apartamentos em Pombal e Distrito de Leiria"
            className="w-full h-full object-cover object-center"
            loading="eager"
            width="2200"
            height="1400"
          />
          <div className="absolute inset-0 bg-stone-900/10 pointer-events-none" />
        </div>
      </section>

      {/* BREADCRUMB NAVEGÁVEL COM LINKS NATIVOS (Início > Imóveis) */}
      <div className="w-full bg-[#faf8f5] border-b border-stone-200/70">
        <Breadcrumb
          items={[{ name: 'Imóveis' }]}
          onNavigate={onNavigate}
        />
      </div>

      {/* 2. EDITORIAL PRINCIPLES SECTION */}
      <section className="max-w-5xl mx-auto px-6 sm:px-10 lg:px-16 pt-14 sm:pt-20 pb-12 sm:pb-16" aria-label="Apresentação do Portfólio">
        {/* Unique H1 for Imóveis Page */}
        <div className="mb-8 border-b border-stone-200/70 pb-6">
          <span className="font-sans text-[11px] uppercase tracking-[0.35em] text-[#784a0d] font-semibold block mb-2">
            {texts.housesEyebrow}
          </span>
          <h1 className="font-sans text-2xl sm:text-3xl md:text-4xl font-light tracking-[0.14em] text-stone-900 uppercase">
            {texts.housesH1}
          </h1>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-3xl"
        >
          <div className="space-y-2 text-stone-800 font-light">
            <p className="font-sans text-base sm:text-lg md:text-[18px] leading-[1.65] text-stone-900 font-normal">
              {texts.housesIntro1}
            </p>
            <p className="font-sans text-sm sm:text-base md:text-[16px] leading-[1.75] text-stone-700">
              {texts.housesIntro2}
            </p>
          </div>

          <div className="mt-4">
            <button
              id="imoveis-read-more"
              onClick={() => setShowExtendedText(!showExtendedText)}
              className="font-sans text-stone-900 text-[11px] sm:text-xs font-semibold uppercase tracking-[0.2em] border-b-2 border-stone-900 pb-0.5 cursor-pointer hover:text-[#784a0d] hover:border-[#784a0d] transition-colors focus-visible:ring-2 focus-visible:ring-[#36210f] focus-visible:outline-none"
            >
              {showExtendedText ? 'RECOLHER TEXTO' : 'LER MAIS'}
            </button>
          </div>

          <AnimatePresence>
            {showExtendedText && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.4 }}
                className="overflow-hidden mt-6 space-y-4 text-xs sm:text-sm md:text-[15px] text-stone-700 font-light leading-relaxed border-l-2 border-[#784a0d]/70 pl-5 bg-stone-100/50 p-4 border-y border-r border-stone-200/60"
              >
                <p>
                  A compra ou venda de uma casa é uma das decisões patrimoniais mais importantes da sua vida. Por isso, nenhuma propriedade entra nesta seleção por acaso.
                </p>
                <p>
                  Analiso cada imóvel com o mesmo rigor contratual que apliquei ao longo de 15 anos no setor segurador e mais de 11 anos no mercado imobiliário de Pombal. Isso significa documentação conferida, avaliação realista do valor de mercado e segurança jurídica total do primeiro contacto até à escritura.
                </p>
                <p>
                  Quer procure o seu próximo lar, quer pretenda vender com a certeza de um processo bem conduzido, o foco é um só: proteger o seu tempo e o seu património.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Header Controls: Total Counter + Dynamic LOCAL Menu */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-12 pt-6 border-t border-stone-200/60 gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-[0.20em] text-stone-700 font-semibold">
              TODOS OS IMÓVEIS ({filteredProperties.length})
            </span>
            {!isAllSelected && (
              <button
                onClick={handleSelectAll}
                className="text-[11px] uppercase tracking-wider text-[#784a0d] hover:underline font-semibold cursor-pointer ml-2 focus-visible:ring-2 focus-visible:ring-[#36210f] focus-visible:outline-none"
                title="Limpar filtro de localização"
              >
                (Limpar Filtro)
              </button>
            )}
          </div>

          <div className="flex items-center space-x-3 text-xs self-start sm:self-auto">
            {/* Menu vertical LOCAL: com suporte a seleção múltipla */}
            <div className="relative" ref={locationMenuRef}>
              <button
                id="menu-local-button"
                onClick={() => setIsLocationMenuOpen((prev) => !prev)}
                aria-expanded={isLocationMenuOpen}
                aria-haspopup="listbox"
                className={`px-3 py-1.5 text-[11px] uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center gap-1.5 border ${
                  isLocationMenuOpen || !isAllSelected
                    ? 'bg-[#36210f] text-white border-[#36210f]'
                    : 'bg-stone-100/90 text-stone-700 border-stone-200/80 hover:border-stone-400 hover:text-stone-900'
                }`}
              >
                <MapPin size={12} className={!isAllSelected ? 'text-[#d4a86a]' : 'text-stone-500'} />
                <span className="font-medium">{locationButtonLabel}</span>
                {!isAllSelected && selectedLocations.length > 1 && (
                  <span className="bg-[#b87d1d] text-white text-[9px] px-1.5 py-0.2 rounded-full font-bold">
                    {selectedLocations.length}
                  </span>
                )}
                <ChevronDown
                  size={12}
                  className={`transition-transform duration-200 ${isLocationMenuOpen ? 'rotate-180' : ''}`}
                />
              </button>

              {/* Menu suspenso vertical com seleção múltipla */}
              <AnimatePresence>
                {isLocationMenuOpen && (
                  <motion.div
                    id="menu-local-dropdown"
                    initial={{ opacity: 0, y: 6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.98 }}
                    transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
                    role="listbox"
                    aria-multiselectable="true"
                    className="absolute right-0 top-full mt-1.5 w-60 sm:w-68 bg-[#faf8f5] border border-stone-300/90 shadow-2xl z-30 py-2 rounded-none"
                  >
                    <div className="px-3 pb-2 border-b border-stone-200/70 mb-1 flex items-center justify-between text-[10px] text-stone-700 uppercase tracking-[0.2em]">
                      <span>Filtrar por Local</span>
                      {!isAllSelected && (
                        <button
                          onClick={handleSelectAll}
                          className="text-[#784a0d] hover:underline cursor-pointer font-semibold focus-visible:ring-2 focus-visible:ring-[#36210f] focus-visible:outline-none"
                        >
                          Limpar
                        </button>
                      )}
                    </div>

                    <div className="flex flex-col max-h-72 overflow-y-auto divide-y divide-stone-100">
                      {/* Opção para ver todas as localizações */}
                      <button
                        onClick={handleSelectAll}
                        role="option"
                        aria-selected={isAllSelected}
                        className={`w-full text-left px-3 py-2 text-[11px] uppercase tracking-[0.16em] transition-colors flex items-center justify-between cursor-pointer focus-visible:ring-2 focus-visible:ring-[#36210f] focus-visible:outline-none ${
                          isAllSelected
                            ? 'bg-[#36210f] text-white font-medium'
                            : 'text-stone-800 hover:bg-stone-200/60 hover:text-stone-950'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center ${
                              isAllSelected
                                ? 'border-white bg-white/20 text-white'
                                : 'border-stone-400 bg-white'
                            }`}
                          >
                            {isAllSelected && <Check size={10} strokeWidth={3} />}
                          </div>
                          <span>TODOS OS LOCAIS</span>
                        </div>
                        <span className={`text-[10px] ${isAllSelected ? 'text-stone-200' : 'text-stone-700'}`}>
                          ({properties.length})
                        </span>
                      </button>

                      {/* Lista dinâmica de localizações */}
                      {availableLocations.map((loc) => {
                        const isSelected = selectedLocations.includes(loc.raw);
                        return (
                          <button
                            key={loc.raw}
                            onClick={() => handleToggleLocation(loc.raw)}
                            role="option"
                            aria-selected={isSelected}
                            className={`w-full text-left px-3 py-2 text-[11px] uppercase tracking-[0.16em] transition-colors flex items-center justify-between cursor-pointer focus-visible:ring-2 focus-visible:ring-[#36210f] focus-visible:outline-none ${
                              isSelected
                                ? 'bg-stone-200/80 text-[#36210f] font-semibold'
                                : 'text-stone-800 hover:bg-stone-200/60 hover:text-[#784a0d]'
                            }`}
                          >
                            <div className="flex items-center gap-2 truncate pr-2">
                              <div
                                className={`w-3.5 h-3.5 rounded-sm border flex items-center justify-center shrink-0 ${
                                  isSelected
                                    ? 'border-[#36210f] bg-[#36210f] text-white'
                                    : 'border-stone-400 bg-white'
                                }`}
                              >
                                {isSelected && <Check size={10} strokeWidth={3} />}
                              </div>
                              <span className="truncate">{loc.displayName}</span>
                            </div>
                            <span className={`text-[10px] shrink-0 ${isSelected ? 'text-[#36210f] font-bold' : 'text-stone-700'}`}>
                              ({loc.count})
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Botão de fechar menu */}
                    <div className="mt-2 pt-2 px-3 border-t border-stone-200/70 flex justify-end">
                      <button
                        onClick={() => setIsLocationMenuOpen(false)}
                        className="text-[10px] uppercase tracking-[0.2em] font-semibold text-stone-700 hover:text-[#36210f] cursor-pointer py-1 px-2 hover:bg-stone-200/50 rounded focus-visible:ring-2 focus-visible:ring-[#36210f] focus-visible:outline-none"
                      >
                        FECHAR
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* 3. GRID OF PROPERTIES */}
      <section className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16" aria-label="Lista de Imóveis">
        <h2 className="sr-only">Catálogo de Habitações Disponíveis</h2>
        {filteredProperties.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-stone-700 font-sans text-sm uppercase tracking-widest mb-4">
              Nenhuma propriedade encontrada para os locais selecionados.
            </p>
            <button
              onClick={handleSelectAll}
              className="px-4 py-2 bg-[#36210f] text-white text-xs uppercase tracking-widest hover:bg-[#784a0d] transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[#36210f] focus-visible:outline-none"
            >
              Ver Todos os Locais
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
            {filteredProperties.map((property, index) => (
              <motion.a
                key={property.id}
                href={getPropertyPath(property.id)}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
                onClick={(e) => {
                  if (!e.metaKey && !e.ctrlKey) {
                    e.preventDefault();
                    onSelectProperty(property);
                  }
                }}
                className="group cursor-pointer flex flex-col no-underline text-inherit focus-visible:ring-2 focus-visible:ring-[#36210f] focus-visible:outline-none"
              >
                {/* Card Aspect Ratio ~ 3:4 com fotografia em destaque */}
                <div className="relative w-full aspect-[3/4.2] overflow-hidden bg-[#36210f] transition-transform duration-500 group-hover:-translate-y-1">
                  {/* Contexto: Fotografia de fachada / capa do imóvel no catálogo geral da Sandra Carlos */}
                  <img
                    src={property.image}
                    alt={getPropertyImageAlt(property, 0, 'card')}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 filter brightness-95"
                    loading="lazy"
                    width="600"
                    height="840"
                  />
                  <div className="absolute inset-0 bg-[#36210f]/15 group-hover:bg-[#36210f]/35 transition-colors duration-300" />

                  {/* Selo Visual de Estado de Alta Gama (Vendido, Reservado, Novidade) */}
                  <PropertyStatusOverlay
                    status={property.status}
                    statusLabel={property.statusLabel}
                    variant="card"
                  />

                  {/* Hover Details Overlay */}
                  <div className="absolute inset-0 p-6 sm:p-8 flex flex-col justify-end text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-stone-950/85 via-stone-950/40 to-transparent">
                    {property.location && (
                      <span className="font-sans text-[10px] uppercase tracking-[0.25em] text-[#d4a86a] font-medium mb-1">
                        {property.location}
                      </span>
                    )}
                    <h3 className="font-sans text-xl sm:text-2xl font-medium uppercase tracking-[0.16em] text-white">
                      {property.title}
                    </h3>
                    {[property.typology, property.area].filter(Boolean).length > 0 && (
                      <p className="font-sans text-xs text-stone-300 font-normal mt-1 uppercase tracking-wider">
                        {[property.typology, property.area].filter(Boolean).join(' • ')}
                      </p>
                    )}
                    <span className="mt-4 inline-flex items-center gap-1.5 text-xs text-[#d4a86a] uppercase tracking-[0.2em] font-medium font-sans">
                      <Eye size={14} />
                      VER DOSSIÊ ARQUITETÓNICO
                    </span>
                  </div>
                </div>

                {/* Caption below card */}
                <div className="mt-4 flex items-baseline justify-between text-xs text-stone-800">
                  <span className="font-sans font-semibold text-stone-900 uppercase tracking-wider group-hover:text-[#784a0d] transition-colors">
                    {property.title}
                  </span>
                  <span className="font-sans text-stone-700 font-medium uppercase tracking-wider text-[11px]">
                    {property.location.split(',')[0]}
                  </span>
                </div>

                {/* Botão de ação explícito para mobile e desktop */}
                <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-stone-200/70">
                  <span className="inline-flex items-center gap-1.5 font-sans text-[11px] uppercase tracking-[0.18em] font-semibold text-[#b87d1d] group-hover:text-[#36210f] transition-colors">
                    <span>Ver Detalhes</span>
                    <ArrowRight size={12} className="transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                  {property.typology && (
                    <span className="font-sans text-[11px] text-stone-400 uppercase tracking-wider font-medium">
                      {property.typology}
                    </span>
                  )}
                </div>
              </motion.a>
            ))}
          </div>
        )}
      </section>
    </article>
  );
};

