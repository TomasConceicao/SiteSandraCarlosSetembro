import React, { useState, useEffect } from 'react';
import { X, Check, Shield, ChevronDown, ChevronUp, Cookie } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  COOKIE_CONSENT_KEY,
  COOKIE_ANALYTICS_KEY,
  updateAnalyticsConsent,
  hasAnalyticsConsent,
} from '../utils/analytics';
import { PageType } from '../types';

interface CookieModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate?: (page: PageType) => void;
}

export const CookieModal: React.FC<CookieModalProps> = ({ isOpen, onClose, onNavigate }) => {
  const [showDetails, setShowDetails] = useState(false);
  const [analyticsAllowed, setAnalyticsAllowed] = useState(false);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setAnalyticsAllowed(hasAnalyticsConsent());
    }
  }, [isOpen]);

  // Listener para fechar com a tecla Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleAcceptAll = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted');
    updateAnalyticsConsent(true);
    setSavedMessage('Preferências guardadas com sucesso.');
    setTimeout(() => {
      setSavedMessage(null);
      onClose();
    }, 400);
  };

  const handleRejectAll = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, 'rejected');
    updateAnalyticsConsent(false);
    setSavedMessage('Cookies não essenciais rejeitados.');
    setTimeout(() => {
      setSavedMessage(null);
      onClose();
    }, 400);
  };

  const handleSaveCustom = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, analyticsAllowed ? 'accepted' : 'rejected');
    updateAnalyticsConsent(analyticsAllowed);
    setSavedMessage('Definições personalizadas guardadas.');
    setTimeout(() => {
      setSavedMessage(null);
      onClose();
    }, 400);
  };

  const handleGoToPrivacy = (e: React.MouseEvent) => {
    if (onNavigate) {
      e.preventDefault();
      onClose();
      onNavigate('privacidade');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="cookie-modal-title"
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-6 md:p-10"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs transition-opacity"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-2xl bg-[#faf8f5] border border-stone-300 shadow-2xl p-6 sm:p-8 md:p-10 z-10 max-h-[90vh] overflow-y-auto"
          >
            {/* Fechar rápido */}
            <button
              id="close-cookie-modal-btn"
              onClick={onClose}
              className="absolute top-5 right-5 text-stone-500 hover:text-stone-900 p-1.5 cursor-pointer transition-colors focus-visible:ring-2 focus-visible:ring-[#36210f]"
              aria-label="Fechar janela de cookies"
            >
              <X size={20} />
            </button>

            {/* Cabeçalho */}
            <div className="flex items-center gap-2.5 mb-2">
              <Cookie size={18} className="text-[#784a0d] shrink-0" />
              <span className="text-[10px] uppercase tracking-[0.32em] text-[#784a0d] font-semibold font-sans">
                PRIVACIDADE &amp; CONSENTIMENTO DE COOKIES
              </span>
            </div>

            <h2
              id="cookie-modal-title"
              className="font-sans text-xl sm:text-2xl text-stone-900 font-semibold uppercase tracking-[0.14em] mb-3"
            >
              Gestão de Privacidade e Cookies
            </h2>

            <p className="text-stone-700 font-sans text-xs sm:text-sm leading-relaxed mb-5 font-light">
              Utilizamos cookies estritamente necessários para o correto funcionamento e segurança da plataforma, e
              cookies analíticos (Google Analytics 4 / GTM) para compreender a utilização e melhorar a experiência de
              navegação, em conformidade com o RGPD e a legislação portuguesa. Os cookies analíticos só são ativados com
              o seu consentimento prévio e expresso.
            </p>

            {/* Secção de Detalhes Expansível */}
            <div className="mb-6">
              <button
                type="button"
                onClick={() => setShowDetails(!showDetails)}
                className="inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.18em] font-medium text-stone-800 hover:text-[#784a0d] transition-colors cursor-pointer py-1 focus-visible:ring-2 focus-visible:ring-[#36210f] focus-visible:outline-none"
                aria-expanded={showDetails}
              >
                <span>{showDetails ? 'Ocultar Detalhes e Tabela de Cookies' : 'Ver Detalhes e Política de Cookies'}</span>
                {showDetails ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
              </button>

              <AnimatePresence>
                {showDetails && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden mt-4 pt-4 border-t border-stone-200 space-y-4"
                  >
                    {/* Cookie Essencial */}
                    <div className="flex items-start justify-between p-3.5 bg-white border border-stone-200">
                      <div>
                        <div className="flex items-center gap-2">
                          <Shield size={14} className="text-stone-600" />
                          <h3 className="text-xs font-semibold text-stone-900 uppercase tracking-wider">
                            Cookies Estritamente Necessários
                          </h3>
                        </div>
                        <p className="text-[11px] text-stone-600 mt-1 leading-relaxed">
                          Indispensáveis para a memorização de consentimento, proteção CSRF e navegação segura. Não podem
                          ser desativados.
                        </p>
                      </div>
                      <span className="text-[10px] uppercase tracking-wider text-stone-500 font-semibold shrink-0 ml-3 bg-stone-100 px-2 py-1">
                        Sempre Ativo
                      </span>
                    </div>

                    {/* Cookie Analítico */}
                    <div className="flex items-start justify-between p-3.5 bg-white border border-stone-200">
                      <div>
                        <h3 className="text-xs font-semibold text-stone-900 uppercase tracking-wider">
                          Cookies de Desempenho &amp; Análise (GA4)
                        </h3>
                        <p className="text-[11px] text-stone-600 mt-1 leading-relaxed">
                          Recolhem métricas estatísticas agregadas e anónimas (sem dados pessoais identificáveis) sobre
                          páginas visitadas e conversões, permitindo otimizar a velocidade e relevância dos conteúdos.
                        </p>
                      </div>
                      <div className="shrink-0 ml-3 pt-0.5">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={analyticsAllowed}
                            onChange={(e) => setAnalyticsAllowed(e.target.checked)}
                            className="sr-only peer"
                            aria-label="Ativar cookies de desempenho e análise"
                          />
                          <div className="w-9 h-5 bg-stone-300 peer-focus:outline-none peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#36210f]"></div>
                        </label>
                      </div>
                    </div>

                    {/* Tabela Informativa de Cookies */}
                    <div className="mt-4 pt-2">
                      <h4 className="text-[11px] font-semibold uppercase tracking-wider text-stone-900 mb-2">
                        Tabela Informativa de Cookies Utilizados:
                      </h4>
                      <div className="overflow-x-auto border border-stone-200">
                        <table className="w-full text-left text-[11px] text-stone-700">
                          <thead className="bg-stone-100 text-stone-900 font-medium uppercase tracking-wider">
                            <tr>
                              <th className="p-2 border-b border-stone-200">Cookie</th>
                              <th className="p-2 border-b border-stone-200">Fornecedor</th>
                              <th className="p-2 border-b border-stone-200">Duração</th>
                              <th className="p-2 border-b border-stone-200">Finalidade</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-stone-200 bg-white">
                            <tr>
                              <td className="p-2 font-mono text-[10px] text-stone-900">sc_cookie_consent</td>
                              <td className="p-2">Sandra Carlos (Próprio)</td>
                              <td className="p-2">1 ano</td>
                              <td className="p-2">Registo da decisão de consentimento do utilizador.</td>
                            </tr>
                            <tr>
                              <td className="p-2 font-mono text-[10px] text-stone-900">sc_analytics_consent</td>
                              <td className="p-2">Sandra Carlos (Próprio)</td>
                              <td className="p-2">1 ano</td>
                              <td className="p-2">Registo da autorização de medição estatística.</td>
                            </tr>
                            <tr>
                              <td className="p-2 font-mono text-[10px] text-stone-900">_ga</td>
                              <td className="p-2">Google Analytics</td>
                              <td className="p-2">2 anos</td>
                              <td className="p-2">Distingue utilizadores de forma pseudonimizada e anónima.</td>
                            </tr>
                            <tr>
                              <td className="p-2 font-mono text-[10px] text-stone-900">_ga_*</td>
                              <td className="p-2">Google Analytics</td>
                              <td className="p-2">2 anos</td>
                              <td className="p-2">Mantém o estado da sessão de navegação.</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="text-[11px] text-stone-500 pt-1">
                      Para informações completas sobre o tratamento dos seus dados e os seus direitos, consulte a nossa{' '}
                      <a
                        href="/politica-de-privacidade"
                        onClick={handleGoToPrivacy}
                        className="text-[#36210f] underline font-medium hover:text-[#b87d1d]"
                      >
                        Política de Privacidade
                      </a>
                      .
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Mensagem de confirmação */}
            {savedMessage && (
              <div className="mb-4 p-2.5 bg-green-50 border border-green-200 text-green-800 text-xs flex items-center gap-2 font-medium">
                <Check size={14} className="text-green-700" />
                <span>{savedMessage}</span>
              </div>
            )}

            {/* Barra de Ações */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-3 border-t border-stone-200">
              {showDetails ? (
                <>
                  <button
                    type="button"
                    onClick={handleRejectAll}
                    className="px-5 py-2.5 text-xs uppercase tracking-[0.16em] text-stone-700 hover:text-stone-950 font-medium transition-colors cursor-pointer border border-stone-300 hover:bg-stone-100 focus-visible:ring-2 focus-visible:ring-[#36210f] focus-visible:outline-none"
                  >
                    Rejeitar Não Essenciais
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveCustom}
                    className="px-6 py-2.5 bg-[#36210f] hover:bg-stone-900 text-white text-xs uppercase tracking-[0.18em] font-semibold transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[#36210f] focus-visible:outline-none"
                  >
                    Guardar Escolha
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setShowDetails(true)}
                    className="px-4 py-2.5 text-xs uppercase tracking-[0.16em] text-stone-700 hover:text-stone-950 font-medium transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[#36210f] focus-visible:outline-none"
                  >
                    Personalizar
                  </button>
                  <button
                    type="button"
                    onClick={handleRejectAll}
                    className="px-5 py-2.5 text-xs uppercase tracking-[0.16em] text-stone-800 hover:text-stone-950 font-medium transition-colors cursor-pointer border border-stone-300 hover:bg-stone-100 focus-visible:ring-2 focus-visible:ring-[#36210f] focus-visible:outline-none"
                  >
                    Rejeitar Não Essenciais
                  </button>
                  <button
                    type="button"
                    onClick={handleAcceptAll}
                    className="px-6 py-2.5 bg-[#36210f] hover:bg-stone-900 text-white text-xs uppercase tracking-[0.18em] font-semibold transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[#36210f] focus-visible:outline-none"
                  >
                    Aceitar Todos
                  </button>
                </>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
