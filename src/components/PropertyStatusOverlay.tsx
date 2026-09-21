import React from 'react';
import { PropertyStatus } from '../types';

interface PropertyStatusOverlayProps {
  status?: PropertyStatus;
  statusLabel?: string;
  variant?: 'card' | 'hero' | 'badge' | 'corner';
  subtitle?: string;
  className?: string;
}

// Monograma de luxo entrelaçado "SC" (Sandra Carlos) inspirado no exemplo de alta gama
export const LuxuryMonogram: React.FC<{ size?: number; className?: string }> = ({
  size = 36,
  className = 'text-white/90',
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    {/* Outer subtle circle frame */}
    <circle
      cx="24"
      cy="24"
      r="22"
      stroke="currentColor"
      strokeWidth="0.75"
      strokeDasharray="1.5 2"
      opacity="0.5"
    />
    <circle
      cx="24"
      cy="24"
      r="20"
      stroke="currentColor"
      strokeWidth="0.5"
      opacity="0.7"
    />

    {/* Letter 'S' stylized serif curves */}
    <path
      d="M28 15.5C26.5 14.2 24.5 13.8 22.5 14.2C19.5 14.8 17.5 17 17.5 19.8C17.5 22.8 19.8 24.5 23 25.4C26.5 26.4 29 27.8 29 31C29 34.2 26.2 36.5 22.5 36.5C19.5 36.5 17.2 35 16 33.2"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Letter 'C' intertwined */}
    <path
      d="M31.5 20C30 17 27 15 23.5 15C18.2 15 14 19 14 24C14 29 18.2 33 23.5 33C27 33 30 31 31.5 28"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
    {/* Serif terminals */}
    <line x1="28" y1="14" x2="28" y2="17" stroke="currentColor" strokeWidth="1.2" />
    <line x1="16" y1="32" x2="16" y2="35" stroke="currentColor" strokeWidth="1.2" />
  </svg>
);

export const PropertyStatusOverlay: React.FC<PropertyStatusOverlayProps> = ({
  status,
  statusLabel,
  variant = 'card',
  subtitle,
  className = '',
}) => {
  if (!status || status === 'disponivel') return null;

  // Definições de conteúdo consoante o estado
  const config = {
    vendido: {
      title: statusLabel || 'VENDIDO',
      stackedTitle: ['JUST', 'SOLD'],
      subtext: subtitle || 'TRANSAÇÃO CONCLUÍDA • SANDRA CARLOS',
      heroSubtext: 'IMÓVEL TRANSACIONADO COM SUCESSO',
      cornerBadge: 'VENDIDO',
      badgeBg: 'bg-[#261501]',
      badgeBorder: 'border-[#D6920B]/60',
      badgeText: 'text-[#D6920B]',
      accentColor: 'text-[#D6920B]',
      overlayDarkness: 'bg-stone-950/50 group-hover:bg-stone-950/60',
    },
    reservado: {
      title: statusLabel || 'RESERVADO',
      stackedTitle: ['UNDER', 'CONTRACT'],
      subtext: subtitle || 'PROCESSO EM CURSO • POMBAL',
      heroSubtext: 'PROPOSTA ACEITE & RESERVADA',
      cornerBadge: 'RESERVADO',
      badgeBg: 'bg-[#291a0b]',
      badgeBorder: 'border-[#D6920B]/60',
      badgeText: 'text-[#D6920B]',
      accentColor: 'text-[#D6920B]',
      overlayDarkness: 'bg-stone-950/45 group-hover:bg-stone-950/55',
    },
    novidade: {
      title: statusLabel || 'NOVIDADE',
      stackedTitle: ['NOVA', 'ENTRADA'],
      subtext: subtitle || 'NOVA ENTRADA NO MERCADO • POMBAL',
      heroSubtext: 'OPORTUNIDADE EXCLUSIVA RECENTE',
      cornerBadge: 'NOVIDADE',
      badgeBg: 'bg-[#1c1917]',
      badgeBorder: 'border-[#D6920B]/60',
      badgeText: 'text-[#D6920B]',
      accentColor: 'text-[#D6920B]',
      overlayDarkness: 'bg-stone-950/35 group-hover:bg-stone-950/45',
    },
  }[status];

  if (!config) return null;

  // 1. VARIANTE DE CARTÃO (Estilo editorial limpo: título e subtítulo centrados)
  if (variant === 'card') {
    return (
      <div
        className={`absolute inset-0 z-15 flex flex-col items-center justify-center p-6 text-center transition-all duration-500 pointer-events-none ${config.overlayDarkness} ${className}`}
      >
        {/* Headline com a fonte padrão do site (Plus Jakarta Sans) em #D6920B */}
        <h3 className="font-sans text-3xl sm:text-4xl lg:text-[40px] font-bold uppercase tracking-[0.22em] text-[#D6920B] leading-[0.95] drop-shadow-[0_3px_12px_rgba(0,0,0,0.85)]">
          {config.title}
        </h3>

        {/* Subtitle in high-contrast tracked sans */}
        <p className="mt-3 font-sans text-[10px] sm:text-[11px] uppercase tracking-[0.28em] text-stone-200/90 font-medium max-w-[240px] drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)]">
          {config.subtext}
        </p>
      </div>
    );
  }

  // 2. VARIANTE HERO (Ficha Detalhada do Imóvel: Canto superior esquerdo, em pequeno)
  if (variant === 'hero') {
    return (
      <div
        className={`absolute top-4 left-4 sm:top-6 sm:left-6 z-30 pointer-events-none flex items-center ${className}`}
      >
        <span
          className={`inline-flex items-center px-3 py-1 text-[10px] sm:text-[11px] font-sans font-bold tracking-[0.22em] uppercase backdrop-blur-md shadow-md border ${config.badgeBg}/95 ${config.badgeBorder} ${config.badgeText}`}
        >
          {config.title}
        </span>
      </div>
    );
  }

  // 3. VARIANTE CORNER (Apenas a insígnia de canto)
  if (variant === 'corner') {
    return (
      <div className={`absolute top-3.5 left-3.5 z-20 pointer-events-none ${className}`}>
        <span
          className={`inline-flex items-center px-2.5 py-1 text-[10px] font-sans font-bold tracking-[0.24em] uppercase backdrop-blur-md shadow-md border ${config.badgeBg}/95 ${config.badgeBorder} ${config.badgeText}`}
        >
          {config.cornerBadge}
        </span>
      </div>
    );
  }

  // 4. VARIANTE BADGE (Pílula em linha, ideal para barras de resumo, tabelas e modais)
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 text-[10px] sm:text-[11px] font-sans font-bold tracking-[0.22em] uppercase border shadow-sm ${config.badgeBg} ${config.badgeBorder} ${config.badgeText} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-[#D6920B] animate-pulse" />
      <span>{config.title}</span>
    </span>
  );
};
