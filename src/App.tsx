/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUp } from 'lucide-react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ContactModal } from './components/ContactModal';
import { CookieModal } from './components/CookieModal';
import { PropertyDetailPage } from './pages/PropertyDetailPage';
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { HousesPage } from './pages/HousesPage';
import { TipsPage } from './pages/TipsPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { AdminPage } from './pages/AdminPage';
import { TipArticleModal } from './components/TipArticleModal';
import { FloatingContactWidget } from './components/FloatingContactWidget';
import { PageType, Property, TipArticle } from './types';
import { applySEO, applyPropertySEO } from './utils/seo';
import { DataProvider, useData } from './context/DataContext';

function AppContent() {
  const { properties } = useData();
  const [currentPage, setCurrentPage] = useState<PageType>('home');
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isCookiesOpen, setIsCookiesOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<TipArticle | null>(null);

  // Helper to parse route from pathname or hash
  const parseCurrentRoute = (): { page: PageType; shouldScrollContact?: boolean; propertyId?: string } => {
    const path = window.location.pathname.replace(/^\/+|\/+$/g, '').toLowerCase();
    const hash = window.location.hash.replace('#', '').toLowerCase();
    const searchParams = new URLSearchParams(window.location.search);
    const propertyId = searchParams.get('id') || undefined;

    // Priority 1: Check clean path
    if (path === 'admin') return { page: 'admin' };
    if (path === 'sobre' || path === 'sobre-mim') return { page: 'sobre', shouldScrollContact: hash === 'contatos' || hash === 'contacto' };
    if (path === 'casas') return { page: 'casas', shouldScrollContact: hash === 'contatos' || hash === 'contacto', propertyId };
    if (path === 'contacto' || path === 'contatos') return { page: 'home', shouldScrollContact: true };
    if (path === '404') return { page: '404' };

    // Priority 2: Check hash for deep links
    if (hash === 'admin') return { page: 'admin' };
    if (hash === 'casas') return { page: 'casas', propertyId };
    if (hash === 'sobre' || hash === 'sobre-mim') return { page: 'sobre' };
    if (hash === 'contatos' || hash === 'contacto') return { page: 'home', shouldScrollContact: true };
    if (hash === '404') return { page: '404' };

    // Root path
    if (path === '' || path === 'home') return { page: 'home', shouldScrollContact: hash === 'contatos' || hash === 'contacto', propertyId };

    // Unrecognized URL -> 404
    return { page: '404' };
  };

  // Disable browser automatic scroll restoration to ensure every page loads at the top
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  // Sync route on mount and browser popstate (Back/Forward buttons)
  useEffect(() => {
    const syncRoute = () => {
      const { page, shouldScrollContact, propertyId } = parseCurrentRoute();
      setCurrentPage(page);
      applySEO(page);

      if (propertyId) {
        const found = properties.find((p) => p.id === propertyId);
        if (found) {
          setSelectedProperty(found);
          applyPropertySEO(found);
        } else {
          setSelectedProperty(null);
          applySEO(page);
        }
      } else {
        setSelectedProperty(null);
        applySEO(page);
      }

      if (shouldScrollContact) {
        setTimeout(() => {
          const el = document.getElementById('contatos');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 150);
      } else {
        window.scrollTo(0, 0);
      }
    };

    syncRoute();
    window.addEventListener('popstate', syncRoute);
    window.addEventListener('hashchange', syncRoute);

    return () => {
      window.removeEventListener('popstate', syncRoute);
      window.removeEventListener('hashchange', syncRoute);
    };
  }, [properties]);

  // Ensure scroll is at the absolute top whenever currentPage changes (including AnimatePresence transitions)
  useEffect(() => {
    if (currentPage === 'contacto') return;

    const resetScroll = () => {
      window.scrollTo(0, 0);
      if (document.documentElement) document.documentElement.scrollTop = 0;
      if (document.body) document.body.scrollTop = 0;
    };

    resetScroll();
    const rafId = requestAnimationFrame(resetScroll);
    const t1 = setTimeout(resetScroll, 100);
    const t2 = setTimeout(resetScroll, 420);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [currentPage]);

  const handleNavigate = (page: PageType) => {
    setSelectedProperty(null);
    setCurrentPage(page);
    applySEO(page);

    const newPath = page === 'home' ? '/' : `/${page}`;
    if (window.location.pathname !== newPath) {
      window.history.pushState({ page }, '', newPath);
    }

    window.scrollTo(0, 0);
    if (document.documentElement) document.documentElement.scrollTop = 0;
    if (document.body) document.body.scrollTop = 0;
  };

  const handleScrollToContact = () => {
    const scrollToContactSection = () => {
      if (currentPage === 'home' || currentPage === 'contacto') {
        const homeSection = document.getElementById('home-contatos-section');
        if (homeSection) {
          homeSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
          return;
        }
      }

      const el = document.getElementById('contatos');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    };

    scrollToContactSection();
    setTimeout(scrollToContactSection, 60);
    setTimeout(scrollToContactSection, 180);
  };

  const handleOpenContact = () => {
    setIsContactOpen(true);
  };

  const handleSelectProperty = (property: Property) => {
    setSelectedProperty(property);
    setCurrentPage('casas');
    applyPropertySEO(property);
    const newPath = `/casas?id=${property.id}`;
    if (window.location.pathname + window.location.search !== newPath) {
      window.history.pushState({ page: 'casas', propertyId: property.id }, '', newPath);
    }
    window.scrollTo(0, 0);
  };

  const handleBackFromProperty = () => {
    setSelectedProperty(null);
    applySEO('casas');
    window.history.pushState({ page: 'casas' }, '', '/casas');
    window.scrollTo(0, 0);
  };

  // If viewing admin page, render the Admin dashboard directly
  if (currentPage === 'admin') {
    return (
      <AdminPage
        onNavigate={handleNavigate}
        onSelectProperty={handleSelectProperty}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#faf8f5] text-stone-900 font-sans selection:bg-[#36210f] selection:text-white">
      {/* Brand Header */}
      <Header
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onScrollToContact={handleScrollToContact}
        onBackProperty={selectedProperty ? handleBackFromProperty : undefined}
      />

      {/* Main Content with subtle page transitions */}
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          {selectedProperty ? (
            <motion.div
              key={`prop-${selectedProperty.id}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
            >
              <PropertyDetailPage
                property={selectedProperty}
                onBack={handleBackFromProperty}
                onSelectProperty={handleSelectProperty}
                onOpenContact={() => {
                  setIsContactOpen(true);
                }}
                onNavigate={(page) => {
                  setSelectedProperty(null);
                  handleNavigate(page);
                }}
              />
            </motion.div>
          ) : (
            <>
              {(currentPage === 'home' || currentPage === 'contacto') && (
                <motion.div
                  key="home"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <HomePage
                    onScrollToContact={handleScrollToContact}
                    onNavigate={handleNavigate}
                    onOpenContact={handleOpenContact}
                    onSelectProperty={handleSelectProperty}
                  />
                </motion.div>
              )}

              {(currentPage === 'sobre' || currentPage === 'sobre-mim') && (
                <motion.div
                  key="sobre"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <AboutPage
                    onScrollToContact={handleScrollToContact}
                    onNavigate={handleNavigate}
                  />
                </motion.div>
              )}

              {currentPage === 'casas' && (
                <motion.div
                  key="casas"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <HousesPage
                    onSelectProperty={handleSelectProperty}
                    onOpenContact={handleOpenContact}
                    onNavigate={handleNavigate}
                  />
                </motion.div>
              )}

              {currentPage === '404' && (
                <motion.div
                  key="404"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <NotFoundPage onNavigate={handleNavigate} />
                </motion.div>
              )}
            </>
          )}
        </AnimatePresence>
      </main>

      {/* Voltar ao Topo: adapta-se à cor de fundo da secção que está imediatamente acima do footer */}
      {selectedProperty ? (
        <div className="w-full bg-[#422502] border-t border-[#5c3403] py-3 sm:py-3.5 select-none">
          <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-20 flex items-center justify-between">
            <button
              id="voltar-ao-topo-btn"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="group inline-flex items-center gap-2 font-sans text-[9px] sm:text-[10px] uppercase tracking-[0.22em] text-[#d8be9e] hover:text-white font-semibold transition-colors cursor-pointer"
              aria-label="Voltar ao Topo"
            >
              <ArrowUp
                size={12}
                strokeWidth={2}
                className="text-[#D6920B] group-hover:-translate-y-0.5 transition-transform"
              />
              <span>Voltar ao Topo</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="w-full bg-[#FDF7F6] border-t border-[#ede5e3] py-2.5 sm:py-3 select-none">
          <div className="max-w-7xl mx-auto px-6 sm:px-12 lg:px-20 flex items-center justify-between">
            <button
              id="voltar-ao-topo-btn"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="group inline-flex items-center gap-1.5 font-sans text-[9px] sm:text-[9.5px] uppercase tracking-[0.22em] text-[#422502] hover:text-black font-semibold transition-colors cursor-pointer"
              aria-label="Voltar ao Topo"
            >
              <ArrowUp
                size={11}
                strokeWidth={2}
                className="text-[#422502] group-hover:-translate-y-0.5 transition-transform"
              />
              <span>Voltar ao Topo</span>
            </button>
          </div>
        </div>
      )}

      {/* Minimalist Studio Footer with Contatos Destination */}
      <Footer
        onOpenCookies={() => setIsCookiesOpen(true)}
        onOpenContact={handleOpenContact}
        onNavigate={handleNavigate}
      />

      {/* Widget Flutuante de Contacto e WhatsApp */}
      {!selectedProperty && (
        <FloatingContactWidget
          onOpenContact={handleOpenContact}
        />
      )}

      {/* Modals */}
      <ContactModal
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
      />

      <CookieModal
        isOpen={isCookiesOpen}
        onClose={() => setIsCookiesOpen(false)}
      />

      <TipArticleModal
        article={selectedArticle}
        onClose={() => setSelectedArticle(null)}
        onOpenContact={handleOpenContact}
      />
    </div>
  );
}

export default function App() {
  return (
    <DataProvider>
      <AppContent />
    </DataProvider>
  );
}
