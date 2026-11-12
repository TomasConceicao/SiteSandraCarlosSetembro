import React, { useState, useEffect, useRef } from 'react';
import { Instagram, Menu, X, ArrowLeft } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { PageType } from '../types';

interface HeaderProps {
  currentPage: PageType;
  onNavigate: (page: PageType) => void;
  onScrollToContact: () => void;
  onBackProperty?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentPage,
  onNavigate,
  onScrollToContact,
  onBackProperty,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [logoTimestamp] = useState(() => Date.now());
  const menuRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);

  // Monitor scroll in real time with hardware requestAnimationFrame
  // Direct velocity & offset tracking matching mouse wheel and finger swipe speed
  useEffect(() => {
    let rafId: number | null = null;
    let lastP = -1;

    const updateScroll = () => {
      const y = window.scrollY || 0;
      // Scroll range: 0px to 80px smoothly shrinks logo by 30% and compacts header
      const p = Math.min(Math.max(y / 80, 0), 1);

      if (Math.abs(p - lastP) > 0.001 || p === 0 || p === 1) {
        lastP = p;
        if (headerRef.current) {
          headerRef.current.style.setProperty('--sp', p.toFixed(4));
        }
        setIsScrolled(p > 0.05);
      }
      rafId = null;
    };

    const handleScroll = () => {
      if (rafId === null) {
        rafId = window.requestAnimationFrame(updateScroll);
      }
    };

    updateScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
    };
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  // Encolher/fechar menu ao deslizar com o rato para cima ou para baixo (wheel ou scroll)
  useEffect(() => {
    if (!isMenuOpen) return;

    const initialScrollY = window.scrollY;

    const handleWindowScroll = () => {
      if (Math.abs(window.scrollY - initialScrollY) > 6) {
        setIsMenuOpen(false);
      }
    };

    const handleWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaY) > 4) {
        setIsMenuOpen(false);
      }
    };

    const handleTouchMove = () => {
      setIsMenuOpen(false);
    };

    window.addEventListener('scroll', handleWindowScroll, { passive: true });
    window.addEventListener('wheel', handleWheel, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleWindowScroll);
      window.removeEventListener('wheel', handleWheel);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [isMenuOpen]);

  return (
    <header
      id="main-header"
      ref={headerRef}
      className={`fixed top-0 left-0 right-0 z-40 select-none border-b transition-colors duration-200 ${
        isMenuOpen ? 'menu-open-forced pointer-events-auto' : ''
      } ${
        isScrolled ? 'pointer-events-auto' : 'pointer-events-none'
      }`}
    >
      <div className="w-full px-3 sm:px-3.5 pointer-events-auto flex items-start justify-between relative">
        {/* Left spacer for visual optical balance */}
        <div className="w-auto sm:w-1/4 hidden sm:block pointer-events-none" />

        {/* Center Brand Identity: Official Logo via /logo.png */}
        <div className="flex-1 min-w-0 text-center flex flex-col items-center justify-center pt-0 pb-0">
          <a
            id="brand-logo-button"
            href="/"
            onClick={(e) => {
              if (!e.metaKey && !e.ctrlKey) {
                e.preventDefault();
                onNavigate('home');
                window.scrollTo(0, 0);
              }
            }}
            className={`dynamic-header-logo-btn group cursor-pointer focus:outline-none inline-flex items-center justify-center text-center hover:opacity-85 ${
              onBackProperty ? 'header-logo-property' : ''
            }`}
            aria-label="Ir para a página inicial"
          >
            {/* Contexto: Logótipo institucional oficial da Sandra Carlos Consultoria Imobiliária no cabeçalho */}
            <img
              src={`/logo-sandra-carlos-consultoria-imobiliaria.webp?v=${logoTimestamp}`}
              onError={(e) => {
                const target = e.currentTarget;
                if (!target.src.includes('/logo.png')) {
                  target.src = `/logo.png?v=${logoTimestamp}`;
                }
              }}
              alt="Sandra Carlos Consultoria Imobiliária Pombal Portugal"
              className="dynamic-header-logo-img w-auto object-contain select-none group-hover:scale-[1.02] transition-transform duration-200"
              width="240"
              height="80"
              loading="eager"
            />
          </a>
        </div>

        {/* Right side: Instagram icon at far right with equal top/lateral margin, menu links in exact open position */}
        <div
          ref={menuRef}
          className="w-auto sm:w-1/4 pt-1 sm:pt-1.5 pb-0 flex justify-end items-start transition-all duration-300 mr-2.5 sm:mr-0 shrink-0"
        >
          <div className="flex items-start gap-2 sm:gap-3.5">
            {/* Menu Column: top row for MENU trigger (when scrolled), and stacked links in the exact same position */}
            <div className="flex flex-col items-end min-w-[76px] sm:min-w-[100px]">
              {/* Top slot for MENU trigger: aligned with Instagram icon height */}
              <div className="h-7 sm:h-8 flex items-center justify-end">
                <AnimatePresence mode="wait">
                  {!isMenuOpen ? (
                    <motion.button
                      id="header-menu-button"
                      key="btn-menu"
                      initial={{ opacity: 0, x: 4 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 4 }}
                      transition={{ duration: 0.18 }}
                      onClick={() => setIsMenuOpen(true)}
                      className="font-sans text-[11px] sm:text-xs uppercase tracking-[0.24em] font-semibold text-[#422502] hover:text-[#b87d1d] py-1 px-1 cursor-pointer transition-colors flex items-center gap-1.5 focus:outline-none"
                      aria-label="Abrir Menu"
                      aria-expanded={false}
                    >
                      <span>MENU</span>
                      <Menu size={14} strokeWidth={1.8} />
                    </motion.button>
                  ) : (
                    <motion.div
                      key="btn-menu-open"
                      initial={{ opacity: 0, x: 4 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 4 }}
                      transition={{ duration: 0.18 }}
                      className="flex items-center font-sans text-[11px] sm:text-xs uppercase tracking-[0.24em] font-semibold text-[#422502] py-1"
                    >
                      <span className="text-[#422502] px-0.5 sm:px-1">MENU</span>
                      <span className="text-[#422502]/40 mx-1">|</span>
                      <button
                        id="header-close-button"
                        onClick={() => setIsMenuOpen(false)}
                        className="hover:text-[#b87d1d] text-[#422502] px-0.5 sm:px-1 cursor-pointer transition-colors flex items-center gap-1 focus:outline-none"
                        aria-label="Fechar Menu"
                        aria-expanded={true}
                      >
                        <span>CLOSE</span>
                        <X size={13} strokeWidth={2} />
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Voltar button placed right under MENU when on a property page */}
              <AnimatePresence>
                {onBackProperty && !isMenuOpen && (
                  <motion.a
                    id="header-back-button"
                    key="header-back-button"
                    href="/imoveis"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.18 }}
                    onClick={(e) => {
                      if (!e.metaKey && !e.ctrlKey) {
                        e.preventDefault();
                        onBackProperty();
                      }
                    }}
                    className="font-sans text-[10px] sm:text-[11px] uppercase tracking-[0.2em] font-semibold text-[#422502] hover:text-[#b87d1d] py-0.5 px-1 cursor-pointer transition-colors flex items-center gap-1.5 focus:outline-none whitespace-nowrap group -mt-0.5 no-underline"
                    aria-label="Voltar aos Imóveis"
                  >
                    <ArrowLeft size={12} strokeWidth={1.8} className="group-hover:-translate-x-0.5 transition-transform" />
                    <span className="hidden sm:inline">VOLTAR AOS IMÓVEIS</span>
                    <span className="sm:hidden">VOLTAR</span>
                  </motion.a>
                )}
              </AnimatePresence>

              {/* Stacked links: IMÓVEIS, SOBRE MIM, CONTATOS displayed only when menu is opened */}
              <AnimatePresence>
                {isMenuOpen && (
                  <motion.nav
                    id="header-nav-menu"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                    aria-label="Menu principal"
                    className="pt-1 pb-0.5 flex flex-col items-end space-y-0.5 sm:space-y-1 text-right w-full overflow-hidden"
                  >
                    <a
                      id="nav-link-imoveis"
                      href="/imoveis"
                      onClick={(e) => {
                        if (!e.metaKey && !e.ctrlKey) {
                          e.preventDefault();
                          onNavigate('imoveis');
                          setIsMenuOpen(false);
                          window.scrollTo(0, 0);
                        }
                      }}
                      className={`font-sans text-[11px] sm:text-xs uppercase tracking-[0.22em] transition-colors cursor-pointer py-0.5 no-underline ${
                        currentPage === 'imoveis'
                          ? 'text-[#422502] font-bold border-b border-[#422502]'
                          : 'text-[#422502] hover:text-[#b87d1d] font-medium'
                      }`}
                    >
                      IMÓVEIS
                    </a>

                    <a
                      id="nav-link-sobre"
                      href="/sobre"
                      onClick={(e) => {
                        if (!e.metaKey && !e.ctrlKey) {
                          e.preventDefault();
                          onNavigate('sobre');
                          setIsMenuOpen(false);
                          window.scrollTo(0, 0);
                        }
                      }}
                      className={`font-sans text-[11px] sm:text-xs uppercase tracking-[0.22em] transition-colors cursor-pointer py-0.5 no-underline ${
                        currentPage === 'sobre'
                          ? 'text-[#422502] font-bold border-b border-[#422502]'
                          : 'text-[#422502] hover:text-[#b87d1d] font-medium'
                      }`}
                    >
                      SOBRE MIM
                    </a>

                    <a
                      id="nav-link-contatos"
                      href="/#contatos"
                      onClick={(e) => {
                        if (!e.metaKey && !e.ctrlKey) {
                          e.preventDefault();
                          onScrollToContact();
                          setIsMenuOpen(false);
                        }
                      }}
                      className="font-sans text-[11px] sm:text-xs uppercase tracking-[0.22em] text-[#422502] hover:text-[#b87d1d] font-medium transition-colors cursor-pointer py-0.5 no-underline"
                    >
                      CONTATOS
                    </a>
                  </motion.nav>
                )}
              </AnimatePresence>
            </div>

            {/* Instagram icon placed at the far top-right corner with matching top and lateral spacing */}
            <div className="h-7 sm:h-8 flex items-center justify-center">
              <a
                id="header-instagram-link"
                href="https://instagram.com/sandracarlosimobiliaria"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram @sandracarlosimobiliaria"
                title="Instagram @sandracarlosimobiliaria"
                className="text-[#422502] hover:text-[#b87d1d] transition-colors p-1 cursor-pointer flex items-center justify-center shrink-0"
              >
                <Instagram size={17} strokeWidth={1.5} />
              </a>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
