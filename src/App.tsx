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
import { NotFoundPage } from './pages/NotFoundPage';
import { AdminPage } from './pages/AdminPage';
import { LoginPage } from './pages/LoginPage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { TermsPage } from './pages/TermsPage';
import { FloatingContactWidget } from './components/FloatingContactWidget';
import { PageType, Property } from './types';
import { applySEO, applyPropertySEO } from './utils/seo';
import { DataProvider, useData } from './context/DataContext';
import { generateSlug, getPropertyPath } from './utils/slug';
import { trackPageView, getCookieConsentStatus } from './utils/analytics';

function AppContent() {
  const { properties, authLoading, isAuthenticated, aal } = useData();
  const [currentPage, setCurrentPage] = useState<PageType>('home');
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isCookiesOpen, setIsCookiesOpen] = useState(false);
  const [isFloatingContactOpen, setIsFloatingContactOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  // Helper to parse route from pathname or hash
  const parseCurrentRoute = (): { page: PageType; shouldScrollContact?: boolean; propertyId?: string } => {
    const path = window.location.pathname.replace(/^\/+|\/+$/g, '').toLowerCase();
    const hash = window.location.hash.replace('#', '').toLowerCase();
    const searchParams = new URLSearchParams(window.location.search);
    const legacyPropertyId = searchParams.get('id') || undefined;

    // Priority 1: Check semantic clean path /imoveis/:slug or legacy /casas/:slug
    if (path.startsWith('imoveis/')) {
      const slug = path.replace(/^imoveis\//, '').trim();
      if (slug) {
        return { page: 'imoveis', propertyId: slug };
      }
    }
    if (path.startsWith('casas/')) {
      const slug = path.replace(/^casas\//, '').trim();
      if (slug) {
        // Redirecionamento 301 client-side: atualiza URL no browser para /imoveis/:slug
        window.history.replaceState({ page: 'imoveis', propertyId: slug }, '', `/imoveis/${slug}`);
        return { page: 'imoveis', propertyId: slug };
      }
    }

    // Priority 2: Check standard clean paths
    if (path === 'login') return { page: 'login' };
    if (path === 'admin') return { page: 'admin' };
    if (path === 'politica-de-privacidade' || path === 'privacidade') return { page: 'privacidade' };
    if (path === 'termos-e-condicoes' || path === 'termos') return { page: 'termos' };
    if (path === 'sobre' || path === 'sobre-mim') return { page: 'sobre', shouldScrollContact: hash === 'contatos' || hash === 'contacto' };
    if (path === 'imoveis') return { page: 'imoveis', shouldScrollContact: hash === 'contatos' || hash === 'contacto', propertyId: legacyPropertyId };
    if (path === 'casas') {
      // Redirecionamento 301 client-side: atualiza URL no browser para /imoveis
      window.history.replaceState({ page: 'imoveis' }, '', '/imoveis');
      return { page: 'imoveis', shouldScrollContact: hash === 'contatos' || hash === 'contacto', propertyId: legacyPropertyId };
    }
    if (path === 'contacto' || path === 'contatos') return { page: 'home', shouldScrollContact: true };
    if (path === '404') return { page: '404' };

    // Priority 3: Check hash for deep links
    if (hash.startsWith('imoveis/')) {
      const slug = hash.replace(/^imoveis\//, '').trim();
      if (slug) {
        return { page: 'imoveis', propertyId: slug };
      }
    }
    if (hash.startsWith('casas/')) {
      const slug = hash.replace(/^casas\//, '').trim();
      if (slug) {
        return { page: 'imoveis', propertyId: slug };
      }
    }
    if (hash === 'login') return { page: 'login' };
    if (hash === 'admin') return { page: 'admin' };
    if (hash === 'politica-de-privacidade' || hash === 'privacidade') return { page: 'privacidade' };
    if (hash === 'termos-e-condicoes' || hash === 'termos') return { page: 'termos' };
    if (hash === 'imoveis' || hash === 'casas') return { page: 'imoveis', propertyId: legacyPropertyId };
    if (hash === 'sobre' || hash === 'sobre-mim') return { page: 'sobre' };
    if (hash === 'contatos' || hash === 'contacto') return { page: 'home', shouldScrollContact: true };
    if (hash === '404') return { page: '404' };

    // Root path
    if (path === '' || path === 'home') return { page: 'home', shouldScrollContact: hash === 'contatos' || hash === 'contacto', propertyId: legacyPropertyId };

    // Unrecognized URL -> 404
    return { page: '404' };
  };

  // Disable browser automatic scroll restoration to ensure every page loads at the top
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  const propertiesRef = React.useRef(properties);
  useEffect(() => {
    propertiesRef.current = properties;
  }, [properties]);

  // Sync route on mount and browser popstate (Back/Forward buttons)
  useEffect(() => {
    const syncRoute = (isPopState = false) => {
      const { page, shouldScrollContact, propertyId } = parseCurrentRoute();
      setCurrentPage(page);
      applySEO(page);

      if (propertyId) {
        const found = propertiesRef.current.find(
          (p) => p.id === propertyId || generateSlug(p.id) === generateSlug(propertyId)
        );
        if (found) {
          setSelectedProperty(found);
          applyPropertySEO(found);

          // Redirecionamento/compatibilidade automática: se alguém aceder pelo formato antigo (?id=:slug) ou /casas,
          // atualiza o histórico/URL para a rota canónica limpa /imoveis/:slug
          if (window.location.search.includes('id=') || window.location.pathname.startsWith('/casas')) {
            const cleanPath = getPropertyPath(found.id);
            window.history.replaceState({ page: 'imoveis', propertyId: found.id }, '', cleanPath);
          }
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
      } else if (isPopState) {
        // Apenas repõe o scroll no topo se foi uma navegação real de avançar/recuar no browser
        window.scrollTo(0, 0);
      }

      // Dispara o pageview virtual para GA4 / GTM na navegação SPA
      trackPageView(document.title, window.location.pathname);
    };

    // Executa a sincronização inicial na montagem da app (apenas posiciona no topo na carga inicial)
    syncRoute(false);

    const onPopOrHashChange = () => syncRoute(true);
    window.addEventListener('popstate', onPopOrHashChange);
    window.addEventListener('hashchange', onPopOrHashChange);

    return () => {
      window.removeEventListener('popstate', onPopOrHashChange);
      window.removeEventListener('hashchange', onPopOrHashChange);
    };
  }, []);

  // Quando as propriedades forem carregadas ou atualizadas da base de dados/Supabase em segundo plano,
  // apenas atualiza o selectedProperty SE a rota atual for um detalhe de imóvel (/imoveis/:slug),
  // sem NUNCA reiniciar o scroll do utilizador!
  useEffect(() => {
    const { propertyId } = parseCurrentRoute();
    if (propertyId && properties.length > 0) {
      const found = properties.find(
        (p) => p.id === propertyId || generateSlug(p.id) === generateSlug(propertyId)
      );
      if (found) {
        setSelectedProperty((prev) => (prev?.id === found.id ? prev : found));
      }
    }
  }, [properties]);

  // Ensure scroll is at the absolute top ONLY when currentPage actually changes between different pages
  const prevPageRef = React.useRef<PageType | null>(null);
  useEffect(() => {
    if (currentPage === 'contacto') return;

    if (prevPageRef.current !== null && prevPageRef.current !== currentPage) {
      window.scrollTo(0, 0);
      if (document.documentElement) document.documentElement.scrollTop = 0;
      if (document.body) document.body.scrollTop = 0;
    }
    prevPageRef.current = currentPage;
  }, [currentPage]);

  // Apresentação proativa de consentimento de cookies na primeira visita (RGPD)
  useEffect(() => {
    const consent = getCookieConsentStatus();
    if (!consent) {
      const timer = setTimeout(() => {
        setIsCookiesOpen(true);
      }, 700);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleNavigate = (page: PageType) => {
    setSelectedProperty(null);
    setCurrentPage(page);
    applySEO(page);

    let newPath = '/';
    if (page === 'home') newPath = '/';
    else if (page === 'privacidade') newPath = '/politica-de-privacidade';
    else if (page === 'termos') newPath = '/termos-e-condicoes';
    else newPath = `/${page}`;

    if (window.location.pathname !== newPath) {
      window.history.pushState({ page }, '', newPath);
    }

    window.scrollTo(0, 0);
    if (document.documentElement) document.documentElement.scrollTop = 0;
    if (document.body) document.body.scrollTop = 0;
  };

  const handleScrollToContact = () => {
    if (selectedProperty) {
      setSelectedProperty(null);
    }

    // Abre exclusivamente o botão/card flutuante de contacto no canto inferior
    setIsFloatingContactOpen(true);
  };

  const handleOpenContact = () => {
    setIsContactOpen(true);
  };

  const handleSelectProperty = (property: Property) => {
    setSelectedProperty(property);
    setCurrentPage('imoveis');
    applyPropertySEO(property);
    const newPath = getPropertyPath(property.id);
    if (window.location.pathname !== newPath) {
      window.history.pushState({ page: 'imoveis', propertyId: property.id }, '', newPath);
    }
    window.scrollTo(0, 0);
  };

  const handleBackFromProperty = () => {
    setSelectedProperty(null);
    setCurrentPage('imoveis');
    applySEO('imoveis');
    window.history.pushState({ page: 'imoveis' }, '', '/imoveis');
    window.scrollTo(0, 0);
  };

  // Redireciona /admin para /login sempre que a sessão não for AAL2
  useEffect(() => {
    if (!authLoading && currentPage === 'admin' && (!isAuthenticated || aal !== 'aal2')) {
      setCurrentPage('login');
      applySEO('login');
      if (window.location.pathname !== '/login') {
        window.history.replaceState({ page: 'login' }, '', '/login');
      }
    }
  }, [authLoading, currentPage, isAuthenticated, aal]);

  // Se estiver na rota /login, renderiza a página de login + 2FA
  if (currentPage === 'login') {
    return <LoginPage onNavigate={handleNavigate} />;
  }

  // Rota /admin estritamente protegida por sessão AAL2
  if (currentPage === 'admin') {
    if (authLoading) {
      return (
        <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center p-6 text-stone-700">
          <div className="text-center space-y-3">
            <div className="w-6 h-6 border-2 border-[#36210f] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs uppercase tracking-[0.2em]">A validar sessão AAL2...</p>
          </div>
        </div>
      );
    }

    if (!isAuthenticated || aal !== 'aal2') {
      return <LoginPage onNavigate={handleNavigate} />;
    }

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

              {currentPage === 'imoveis' && (
                <motion.div
                  key="imoveis"
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

              {currentPage === 'privacidade' && (
                <motion.div
                  key="privacidade"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <PrivacyPolicyPage onNavigate={handleNavigate} />
                </motion.div>
              )}

              {currentPage === 'termos' && (
                <motion.div
                  key="termos"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <TermsPage onNavigate={handleNavigate} />
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
          isOpen={isFloatingContactOpen}
          onOpenChange={setIsFloatingContactOpen}
          onOpenContact={handleOpenContact}
        />
      )}

      {/* Modals */}
      <ContactModal
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
        onOpenPrivacy={() => {
          setIsContactOpen(false);
          handleNavigate('privacidade');
        }}
      />

      <CookieModal
        isOpen={isCookiesOpen}
        onClose={() => setIsCookiesOpen(false)}
        onNavigate={handleNavigate}
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
