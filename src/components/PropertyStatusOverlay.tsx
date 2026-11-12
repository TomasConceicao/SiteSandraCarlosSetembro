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
  if (!status || status === 'disponivel' || status === 'none') return null;

  // Normalização de chaves de estado (suporte pt e en)
  const normalizedStatus =
    status === 'sold' ? 'vendido' :
    status === 'reserved' ? 'reservado' :
    status === 'new' ? 'novidade' :
    status;

  // Definições de conteúdo e estilo refinado de luxo por estado
  const config = {
    vendido: {
      title: statusLabel || 'VENDIDO',
      subtext: subtitle || 'TRANSAÇÃO CONCLUÍDA',
      badgeBg: 'bg-[#261501]/95',
      badgeBorder: 'border-[#D6920B]/60',
      badgeText: 'text-[#D6920B]',
      dotColor: 'bg-[#D6920B]',
      overlayDarkness: 'bg-stone-950/45 group-hover:bg-stone-950/55',
    },
    reservado: {
      title: statusLabel || 'RESERVADO',
      subtext: subtitle || 'PROCESSO EM CURSO',
      badgeBg: 'bg-[#291a0b]/95',
      badgeBorder: 'border-[#D6920B]/60',
      badgeText: 'text-[#D6920B]',
      dotColor: 'bg-[#D6920B]',
      overlayDarkness: 'bg-stone-950/40 group-hover:bg-stone-950/50',
    },
    novidade: {
      title: statusLabel || 'NOVIDADE',
      subtext: subtitle || 'NOVA ENTRADA NO MERCADO',
      badgeBg: 'bg-[#1c1917]/95',
      badgeBorder: 'border-[#D6920B]/60',
      badgeText: 'text-[#D6920B]',
      dotColor: 'bg-[#D6920B]',
      overlayDarkness: 'bg-stone-950/30 group-hover:bg-stone-950/40',
    },
  }[normalizedStatus];

  if (!config) return null;

  // 1. VARIANTE DE CARTÃO (Imóveis em Destaque, Catálogo Casas, Imóveis Relacionados)
  // Selo centrado por cima da imagem ("overlay"), agora num tamanho proporcional e compacto que nunca sai dos limites
  if (variant === 'card') {
    return (
      <div
        className={`absolute inset-0 z-15 flex flex-col items-center justify-center p-3 sm:p-5 text-center transition-all duration-500 pointer-events-none ${config.overlayDarkness} ${className}`}
      >
        <div className="flex flex-col items-center justify-center max-w-[88%] mx-auto">
          {/* Título de estado centrado com proporção equilibrada (sem transbordar) */}
          <h3 className="font-sans text-base sm:text-lg md:text-xl font-bold uppercase tracking-[0.16em] sm:tracking-[0.20em] text-[#D6920B] leading-none drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)] whitespace-nowrap">
            {config.title}
          </h3>

          {/* Divisor fino em ouro acentuando o design de luxo */}
          <div
            className="w-6 sm:w-8 h-[1px] bg-[#D6920B]/80 my-1.5 sm:my-2 shadow-sm"
            aria-hidden="true"
          />

          {/* Subtítulo informativo em caixa alta */}
          <p className="font-sans text-[8px] sm:text-[9px] uppercase tracking-[0.18em] sm:tracking-[0.22em] text-stone-200/90 font-medium max-w-[180px] sm:max-w-[210px] leading-tight drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]">
            {config.subtext}
          </p>
        </div>
      </div>
    );
  }

  // 2. VARIANTE HERO (Ficha Detalhada do Imóvel: Canto superior da fotografia principal)
  if (variant === 'hero') {
    return (
      <div
        className={`absolute top-3.5 left-3.5 sm:top-5 sm:left-5 z-30 pointer-events-none select-none max-w-[calc(100%-28px)] ${className}`}
      >
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 sm:px-3.5 sm:py-1.5 font-sans text-[9.5px] sm:text-[11px] font-bold tracking-[0.18em] sm:tracking-[0.20em] uppercase backdrop-blur-md shadow-lg border ${config.badgeBg} ${config.badgeBorder} ${config.badgeText} rounded-none whitespace-nowrap`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${config.dotColor} shrink-0 shadow-[0_0_6px_#D6920B]`}
            aria-hidden="true"
          />
          <span className="truncate">{config.title}</span>
        </span>
      </div>
    );
  }

  // 3. VARIANTE CORNER (Modal Rápido de Imóvel e Miniaturas)
  if (variant === 'corner') {
    return (
      <div
        className={`absolute top-2.5 left-2.5 sm:top-3 sm:left-3 z-20 pointer-events-none select-none max-w-[calc(100%-20px)] ${className}`}
      >
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 font-sans text-[9px] sm:text-[9.5px] font-bold tracking-[0.16em] uppercase backdrop-blur-md shadow-md border ${config.badgeBg} ${config.badgeBorder} ${config.badgeText} rounded-none whitespace-nowrap`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${config.dotColor} shrink-0 shadow-[0_0_5px_#D6920B]`}
            aria-hidden="true"
          />
          <span className="truncate">{config.title}</span>
        </span>
      </div>
    );
  }

  // 4. VARIANTE BADGE (Em linha para tabelas de características, cabeçalhos de detalhe e modais)
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 font-sans text-[9.5px] sm:text-[10px] font-bold tracking-[0.16em] uppercase border shadow-sm ${config.badgeBg} ${config.badgeBorder} ${config.badgeText} rounded-none whitespace-nowrap ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dotColor} shrink-0`} aria-hidden="true" />
      <span>{config.title}</span>
    </span>
  );
};
