import React from 'react';
import { Instagram, Lock } from 'lucide-react';
import { PageType } from '../types';
import { trackWhatsAppClick } from '../utils/analytics';
import { useData } from '../context/DataContext';

interface FooterProps {
  onOpenCookies: () => void;
  onOpenContact?: () => void;
  onNavigate?: (page: PageType) => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenCookies, onNavigate }) => {
  const { siteSettings } = useData();
  const { config } = siteSettings;

  const handleNav = (page: PageType, e: React.MouseEvent) => {
    if (onNavigate) {
      e.preventDefault();
      onNavigate(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <footer
      id="contatos"
      className="bg-[#d8be9e] text-stone-900 border-t border-[#c5ab8d] scroll-mt-16 sm:scroll-mt-20 select-none transition-colors duration-200"
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-20 pt-8 sm:pt-10 md:pt-12 pb-56 sm:pb-72 md:pb-88 flex flex-col justify-start">
        {/* Top Row: Brand Name & Instagram Link */}
        <div className="flex items-center justify-between gap-4 pb-2 sm:pb-3">
          <span className="font-sans text-xs sm:text-[13px] uppercase tracking-[0.22em] text-[#36210f] font-semibold">
            {config.brandName}
          </span>

          <a
            id="footer-instagram-link"
            href={config.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            title={config.instagramHandle}
            aria-label={`Instagram ${config.instagramHandle}`}
            className="text-[#36210f] hover:text-black transition-colors p-1 cursor-pointer focus-visible:ring-2 focus-visible:ring-[#36210f] focus-visible:outline-none"
          >
            <Instagram size={19} strokeWidth={1.5} />
          </a>
        </div>

        {/* Second Row: Contact Info & Partner Badges & Legal Links */}
        <div className="mt-4 sm:mt-5 flex flex-col lg:flex-row justify-between items-start gap-8 text-xs text-stone-800 font-sans">
          {/* Left Column: Direct Phone, Email, Logos & AMI */}
          <div className="flex flex-col space-y-2.5 max-w-xl">
            <div className="flex items-center gap-3 flex-wrap text-sm sm:text-[13px]">
              <a
                href={`https://wa.me/${config.whatsappNumber}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackWhatsAppClick('footer')}
                className="hover:text-black transition-colors hover:underline underline-offset-4 font-semibold text-[#36210f] focus-visible:ring-2 focus-visible:ring-[#36210f] focus-visible:outline-none"
                title={`Contactar via WhatsApp (${config.phoneDisplay})`}
                aria-label={`Contactar via WhatsApp (${config.phoneDisplay})`}
              >
                {config.phoneDisplay}
              </a>
              <span className="text-[#36210f]/60 font-normal">•</span>
              <a
                href={`mailto:${config.email}`}
                className="hover:text-black transition-colors hover:underline underline-offset-4 text-stone-800 font-medium focus-visible:ring-2 focus-visible:ring-[#36210f] focus-visible:outline-none"
              >
                {config.email}
              </a>
            </div>

            {/* Partner / Certification Badges */}
            <div className="pt-1.5 pb-0.5 flex items-center">
              <div className="relative inline-flex items-center">
                <img
                  id="footer-expertimo-logo"
                  src="/expertimo-portugal-parceira-imobiliaria.webp"
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (!target.src.includes('/expertimo-logo.png')) {
                      target.src = '/expertimo-logo.png';
                    }
                  }}
                  alt="Expertimo Portugal - Rede Parceira da Consultora Sandra Carlos"
                  className="h-[18px] sm:h-[19px] w-auto object-contain object-left opacity-90 hover:opacity-100 transition-opacity"
                  loading="lazy"
                  width="110"
                  height="19"
                />
                <img
                  id="footer-agente-pro-logo"
                  src="/agente-pro-expertimo-portugal.webp"
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (!target.src.includes('/agente-pro.png')) {
                      target.src = '/agente-pro.png';
                    }
                  }}
                  alt="Distinção de Mérito Agente Pro Expertimo Portugal - Sandra Carlos"
                  className="absolute -top-1.5 sm:-top-2 left-full ml-1.5 h-[10px] sm:h-[11px] w-auto object-contain opacity-90 hover:opacity-100 transition-opacity select-none pointer-events-none"
                  loading="lazy"
                  width="65"
                  height="11"
                />
              </div>
            </div>

            <p className="text-[11.5px] text-stone-800/90 font-medium leading-relaxed">
              {config.footerLegalNote}
            </p>
          </div>

          {/* Right Column: Legal Links & Copyright */}
          <div className="flex flex-col lg:items-end space-y-2.5 text-left lg:text-right">
            {/* Links Institucionais e Legais */}
            <nav
              aria-label="Ligações Legais de Rodapé"
              className="flex items-center gap-2 lg:justify-end flex-wrap text-stone-800 font-medium text-[11px] sm:text-xs"
            >
              <a
                href="/politica-de-privacidade"
                onClick={(e) => handleNav('privacidade', e)}
                className="hover:text-black transition-colors hover:underline underline-offset-4 focus-visible:ring-2 focus-visible:ring-[#36210f] focus-visible:outline-none"
              >
                Política de Privacidade
              </a>
              <span className="text-[#36210f]/50">•</span>
              <a
                href="/termos-e-condicoes"
                onClick={(e) => handleNav('termos', e)}
                className="hover:text-black transition-colors hover:underline underline-offset-4 focus-visible:ring-2 focus-visible:ring-[#36210f] focus-visible:outline-none"
              >
                Termos e Condições
              </a>
              <span className="text-[#36210f]/50">•</span>
              <button
                id="cookie-settings-button"
                type="button"
                onClick={onOpenCookies}
                className="hover:text-black transition-colors hover:underline underline-offset-4 cursor-pointer focus-visible:ring-2 focus-visible:ring-[#36210f] focus-visible:outline-none"
              >
                Cookies
              </button>
              <span className="text-[#36210f]/50">•</span>
              <a
                href="https://www.livroreclamacoes.pt"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-black transition-colors hover:underline underline-offset-4 focus-visible:ring-2 focus-visible:ring-[#36210f] focus-visible:outline-none"
                title="Livro de Reclamações Eletrónico"
              >
                Livro de Reclamações
              </a>
              {onNavigate && (
                <>
                  <span className="text-[#36210f]/50">•</span>
                  <button
                    type="button"
                    onClick={(e) => handleNav('admin', e)}
                    className="hover:text-black transition-colors hover:underline underline-offset-4 cursor-pointer focus-visible:ring-2 focus-visible:ring-[#36210f] focus-visible:outline-none inline-flex items-center gap-1"
                    title="Área de Gestão Interna"
                  >
                    <Lock size={10} />
                    <span>Área de Gestão</span>
                  </button>
                </>
              )}
            </nav>

            <p className="text-stone-700 text-[11px] font-normal leading-none">
              {config.copyrightText}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};
