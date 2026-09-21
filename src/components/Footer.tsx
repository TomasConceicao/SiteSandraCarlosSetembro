import React from 'react';
import { Instagram, Lock } from 'lucide-react';
import { PageType } from '../types';

interface FooterProps {
  onOpenCookies: () => void;
  onOpenContact?: () => void;
  onNavigate?: (page: PageType) => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenCookies, onNavigate }) => {
  return (
    <footer
      id="contatos"
      className="bg-[#d8be9e] text-stone-900 border-t border-[#c5ab8d] scroll-mt-16 sm:scroll-mt-20 select-none transition-colors duration-200"
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-20 pt-8 sm:pt-10 md:pt-12 pb-56 sm:pb-72 md:pb-88 flex flex-col justify-start">
        {/* Top Row: Brand Name & Instagram Link right at the start of the background */}
        <div className="flex items-center justify-between gap-4">
          <span className="font-sans text-xs sm:text-[13px] uppercase tracking-[0.24em] text-[#36210f] font-bold">
            SANDRA CARLOS CONSULTORIA IMOBILIÁRIA
          </span>

          <a
            id="footer-instagram-link"
            href="https://instagram.com/sandracarlosimobiliaria"
            target="_blank"
            rel="noopener noreferrer"
            title="@sandracarlosimobiliaria"
            aria-label="Instagram @sandracarlosimobiliaria"
            className="text-[#36210f] hover:text-black transition-colors p-1 cursor-pointer"
          >
            <Instagram size={20} strokeWidth={1.5} />
          </a>
        </div>

        {/* Second Row: Contact Info & Rights / Cookie Settings */}
        <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 text-xs text-stone-800 font-sans tracking-wide">
          {/* Left Column: Direct Phone, Email & AMI License */}
          <div className="flex flex-col space-y-1.5">
            <a
              href="https://wa.me/351965881547"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-black transition-colors hover:underline underline-offset-4 font-semibold text-[#36210f]"
              title="Contactar via WhatsApp (+351 965881547)"
              aria-label="Contactar via WhatsApp (+351 965881547)"
            >
              +351 965881547
            </a>
            <a
              href="mailto:sandra.carlos@expertimo.eu"
              className="hover:text-black transition-colors hover:underline underline-offset-4 font-semibold text-[#36210f]"
            >
              sandra.carlos@expertimo.eu
            </a>

            {/* Partner / Certification Badges above AMI */}
            <div className="pt-1 pb-1 flex items-center">
              <div className="relative inline-flex items-center">
                {/* Contexto: Logótipo da rede parceira Expertimo Portugal no rodapé institucional */}
                <img
                  id="footer-expertimo-logo"
                  src="https://SEU-DOMINIO-AQUI/expertimo-portugal-parceira-imobiliaria.webp"
                  alt="Expertimo Portugal - Rede Parceira da Consultora Sandra Carlos"
                  className="h-[18px] sm:h-[19px] w-auto object-contain object-left opacity-90 hover:opacity-100 transition-opacity"
                  loading="lazy"
                  width="110"
                  height="19"
                />
                {/* Contexto: Distinção profissional de Agente Pro Expertimo Portugal */}
                <img
                  id="footer-agente-pro-logo"
                  src="https://SEU-DOMINIO-AQUI/agente-pro-expertimo-portugal.webp"
                  alt="Distinção de Mérito Agente Pro Expertimo Portugal - Sandra Carlos"
                  className="absolute -top-1.5 sm:-top-2 left-full ml-1.6 h-[10px] sm:h-[11px] w-auto object-contain opacity-95 hover:opacity-100 transition-opacity select-none pointer-events-none"
                  loading="lazy"
                  width="65"
                  height="11"
                />
              </div>
            </div>

            <span className="text-[11px] text-stone-700 tracking-widest font-medium leading-none">
              AMI 15766
            </span>
          </div>

          {/* Right Column: Cookie Settings & Copyright aligned to bottom */}
          <div className="flex flex-col sm:items-end space-y-1.5 text-left sm:text-right">
            <div className="flex items-center gap-2 sm:justify-end flex-wrap">
              <button
                id="cookie-settings-button"
                onClick={onOpenCookies}
                className="hover:text-black transition-colors hover:underline underline-offset-4 cursor-pointer focus:outline-none text-left sm:text-right text-stone-800 font-medium"
              >
                Cookie settings
              </button>
              {onNavigate && (
                <>
                  <span className="text-stone-500">•</span>
                  <button
                    onClick={() => onNavigate('admin')}
                    className="hover:text-black transition-colors hover:underline underline-offset-4 cursor-pointer focus:outline-none text-stone-800 font-medium inline-flex items-center gap-1"
                    title="Área de Gestão"
                  >
                    <Lock size={10} />
                    <span>Área de Gestão</span>
                  </button>
                </>
              )}
            </div>
            <p className="text-stone-700 font-medium leading-none">
              ⓒ 2026 Sandra Carlos Consultoria Imobiliária. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

