import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Property, PageType } from '../types';
import { ArrowRight, Eye } from 'lucide-react';
import { getFeaturedProperties } from '../utils/featuredManager';
import { PropertyStatusOverlay } from './PropertyStatusOverlay';
import { useData } from '../context/DataContext';
import { getPropertyPath } from '../utils/slug';
import { getPropertyImageAlt } from '../utils/imageSeo';

interface FeaturedPropertiesSectionProps {
  onSelectProperty: (property: Property) => void;
  onNavigate: (page: PageType) => void;
}

export const FeaturedPropertiesSection: React.FC<FeaturedPropertiesSectionProps> = ({
  onSelectProperty,
  onNavigate,
}) => {
  const { properties, siteSettings } = useData();
  const featured = getFeaturedProperties(properties, siteSettings.featuredIds);

  if (featured.length === 0) return null;

  return (
    <section
      id="featured-properties-section"
      className="w-full bg-[#faf8f5] border-y border-stone-200/80 py-16 sm:py-24"
      aria-label="Imóveis Destacados"
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
        {/* Header da Secção de Destacados */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-16 gap-6 border-b border-stone-300/60 pb-6">
          <div>
            <h2 className="font-sans text-2xl sm:text-3xl md:text-4xl font-light tracking-[0.14em] text-stone-900 uppercase">
              {siteSettings.texts.featuredTitle}
            </h2>
            <span className="font-sans text-[11px] uppercase tracking-[0.32em] text-[#784a0d] font-semibold block mt-2">
              {siteSettings.texts.featuredSubtitle}
            </span>
          </div>

          <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
            {/* Seta para ver mais imóveis enviando para a área de imóveis com link HTML nativo */}
            <a
              id="featured-see-more-btn"
              href="/imoveis"
              onClick={(e) => {
                if (!e.metaKey && !e.ctrlKey) {
                  e.preventDefault();
                  onNavigate('imoveis');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
              className="group inline-flex items-center gap-2.5 text-stone-900 font-sans text-xs sm:text-sm uppercase tracking-[0.2em] font-semibold border-b-2 border-stone-900 pb-1 cursor-pointer transition-all duration-200 hover:text-[#784a0d] hover:border-[#784a0d] focus-visible:ring-2 focus-visible:ring-[#36210f] focus-visible:outline-none"
            >
              <span>VER MAIS IMÓVEIS</span>
              <ArrowRight
                size={16}
                className="text-[#784a0d] transition-transform duration-300 group-hover:translate-x-1.5"
              />
            </a>
          </div>
        </div>

        {/* Grid dos Imóveis Destacados - exatamente igual ao estilo da página de Casas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
          {featured.slice(0, 6).map((property, index) => (
            <motion.a
              key={property.id}
              href={getPropertyPath(property.id)}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
              onClick={(e) => {
                if (!e.metaKey && !e.ctrlKey) {
                  e.preventDefault();
                  onSelectProperty(property);
                }
              }}
              className="group cursor-pointer flex flex-col no-underline text-inherit"
            >
              {/* Card Aspect Ratio ~ 3:4 com fotografia em destaque exatamente como na página Casas */}
              <div className="relative w-full aspect-[3/4.2] overflow-hidden bg-[#36210f] transition-transform duration-500 group-hover:-translate-y-1">
                {/* Contexto: Imóvel selecionado em destaque na página inicial da Sandra Carlos Consultoria Imobiliária */}
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

                {/* Hover Details Overlay exatamente como na página Casas */}
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

              {/* Legenda abaixo do card exatamente como na página Casas */}
              <div className="mt-4 flex items-baseline justify-between text-xs text-stone-700">
                <span className="font-sans font-semibold text-stone-900 uppercase tracking-wider group-hover:text-[#b87d1d] transition-colors">
                  {property.title}
                </span>
                {property.location && (
                  <span className="font-sans text-stone-500 font-normal uppercase tracking-wider text-[11px]">
                    {property.location.split(',')[0]}
                  </span>
                )}
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
      </div>
    </section>
  );
};
