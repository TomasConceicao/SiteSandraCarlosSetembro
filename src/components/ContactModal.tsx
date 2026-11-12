import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { trackLeadSubmission, trackWhatsAppClick } from '../utils/analytics';
import { useData } from '../context/DataContext';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPrivacy?: () => void;
}

export const ContactModal: React.FC<ContactModalProps> = ({ isOpen, onClose, onOpenPrivacy }) => {
  const { siteSettings } = useData();
  const { config } = siteSettings;
  const whatsappDigits = config.whatsappNumber.replace(/\D/g, '');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    interest: 'aquisição',
    message: '',
  });
  const [consentPrivacy, setConsentPrivacy] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fechar com a tecla Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!consentPrivacy) return;

    setLoading(true);

    // Disparo seguro de conversão no GA4/GTM (ZERO PII: apenas tipo de interesse e origem)
    trackLeadSubmission(formData.interest, 'Formulário Modal de Contacto');

    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 600);
  };

  const handleReset = () => {
    setSubmitted(false);
    setConsentPrivacy(false);
    setFormData({
      name: '',
      email: '',
      phone: '',
      interest: 'aquisição',
      message: '',
    });
    onClose();
  };

  const handlePrivacyLinkClick = (e: React.MouseEvent) => {
    if (onOpenPrivacy) {
      e.preventDefault();
      onClose();
      onOpenPrivacy();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="contact-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-stone-900/60 backdrop-blur-xs transition-opacity"
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-2xl bg-[#faf8f5] rounded-none border border-stone-300 shadow-2xl p-8 sm:p-12 overflow-y-auto max-h-[90vh] z-10"
          >
            {/* Close Button */}
            <button
              id="close-contact-modal"
              onClick={onClose}
              className="absolute top-6 right-6 text-stone-500 hover:text-stone-950 p-2 cursor-pointer transition-colors focus-visible:ring-2 focus-visible:ring-[#36210f]"
              aria-label="Fechar formulário de contacto"
            >
              <X size={22} strokeWidth={1.5} />
            </button>

            {submitted ? (
              <div aria-live="polite" className="py-12 text-center flex flex-col items-center">
                <CheckCircle2 className="w-12 h-12 text-[#784a0d] mb-6 stroke-[1.5]" />
                <h3 className="font-sans text-2xl sm:text-3xl text-stone-900 mb-3 font-semibold uppercase tracking-[0.16em]">
                  MENSAGEM ENVIADA
                </h3>
                <p className="text-stone-600 font-sans text-sm max-w-md leading-relaxed mb-8">
                  Agradeço o seu contacto. Entrarei em contacto consigo com a máxima brevidade e total compromisso.
                </p>
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-8 py-3 bg-[#321f12] text-white text-xs uppercase tracking-[0.2em] font-medium hover:bg-stone-800 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[#36210f] focus-visible:outline-none"
                >
                  CONCLUIR
                </button>
              </div>
            ) : (
              <div>
                <div className="mb-8">
                  <span className="text-[10px] uppercase tracking-[0.35em] text-[#784a0d] font-semibold block mb-2 font-sans">
                    CONSULTORIA IMOBILIÁRIA
                  </span>
                  <h2
                    id="contact-modal-title"
                    className="font-sans text-xl sm:text-2xl text-stone-900 font-semibold uppercase tracking-[0.16em]"
                  >
                    FALAR COM {config.consultantName.toUpperCase()}
                  </h2>
                  <p className="text-stone-600 text-xs sm:text-sm font-sans mt-2 leading-relaxed">
                    Estou ao seu dispor para o ajudar na venda ou aquisição do seu imóvel no concelho de Pombal, com o
                    rigor e a dedicação que o seu projeto merece.
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-stone-700 font-medium mb-1.5">
                        Nome Completo *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Ex.: Carolina Mendonça"
                        className="w-full bg-white/80 border border-stone-300 px-4 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#36210f] focus-visible:ring-2 focus-visible:ring-[#36210f] focus-visible:outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-stone-700 font-medium mb-1.5">
                        Endereço de E-mail *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="email@dominio.pt"
                        className="w-full bg-white/80 border border-stone-300 px-4 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#36210f] focus-visible:ring-2 focus-visible:ring-[#36210f] focus-visible:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-stone-700 font-medium mb-1.5">
                        Telefone / Telemóvel
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+351 912 345 678"
                        className="w-full bg-white/80 border border-stone-300 px-4 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#36210f] focus-visible:ring-2 focus-visible:ring-[#36210f] focus-visible:outline-none transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-stone-700 font-medium mb-1.5">
                        Âmbito de Interesse
                      </label>
                      <select
                        value={formData.interest}
                        onChange={(e) => setFormData({ ...formData, interest: e.target.value })}
                        className="w-full bg-white/80 border border-stone-300 px-4 py-2.5 text-sm text-stone-900 focus:outline-none focus:border-[#36210f] focus-visible:ring-2 focus-visible:ring-[#36210f] focus-visible:outline-none transition-colors"
                      >
                        <option value="venda">Venda de Imóvel</option>
                        <option value="aquisição">Compra / Aquisição de Casa</option>
                        <option value="avaliacao">Avaliação Imobiliária</option>
                        <option value="informacao">Pedido de Informações</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs uppercase tracking-wider text-stone-700 font-medium">
                        A sua Mensagem *
                      </label>
                      <span className="text-[11px] text-stone-500 font-mono">
                        {formData.message.length}/350 caracteres
                      </span>
                    </div>
                    <textarea
                      required
                      rows={4}
                      maxLength={350}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value.slice(0, 350) })}
                      placeholder="Descreva os detalhes da sua casa para venda ou os critérios do imóvel que procura em Pombal..."
                      className="w-full bg-white/80 border border-stone-300 px-4 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#36210f] focus-visible:ring-2 focus-visible:ring-[#36210f] focus-visible:outline-none transition-colors resize-none"
                    />
                  </div>

                  {/* Checkbox de Consentimento RGPD Obrigatório */}
                  <div className="p-3.5 bg-white border border-stone-200">
                    <label className="flex items-start gap-3 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        required
                        checked={consentPrivacy}
                        onChange={(e) => setConsentPrivacy(e.target.checked)}
                        className="mt-0.5 w-4 h-4 accent-[#36210f] border-stone-300 rounded-none cursor-pointer shrink-0 focus-visible:ring-2 focus-visible:ring-[#36210f] focus-visible:outline-none"
                      />
                      <span className="text-xs text-stone-700 leading-relaxed font-light">
                        Li e aceito o tratamento dos meus dados pessoais nos termos da{' '}
                        <a
                          href="/politica-de-privacidade"
                          onClick={handlePrivacyLinkClick}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-[#36210f] underline underline-offset-2 hover:text-[#784a0d] transition-colors focus-visible:ring-2 focus-visible:ring-[#36210f] focus-visible:outline-none"
                        >
                          Política de Privacidade
                        </a>{' '}
                        para efeitos de resposta e acompanhamento ao meu pedido de contacto. *
                      </span>
                    </label>
                  </div>

                  <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="text-xs text-stone-600 font-light">
                      <a
                        href={`https://wa.me/${whatsappDigits}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => trackWhatsAppClick('modal_contacto')}
                        className="hover:text-[#784a0d] hover:underline underline-offset-2 transition-colors font-medium focus-visible:ring-2 focus-visible:ring-[#36210f] focus-visible:outline-none"
                        title={`Contactar via WhatsApp (${config.phoneDisplay})`}
                        aria-label={`Contactar via WhatsApp (${config.phoneDisplay})`}
                      >
                        {config.phoneDisplay}
                      </a>{' '}
                      &bull;{' '}
                      <a
                        href={`mailto:${config.email}`}
                        className="hover:text-[#784a0d] hover:underline underline-offset-2 transition-colors focus-visible:ring-2 focus-visible:ring-[#36210f] focus-visible:outline-none"
                      >
                        {config.email}
                      </a>{' '}
                      &bull; AMI {config.amiLicense}
                    </div>

                    <button
                      type="submit"
                      disabled={loading || !consentPrivacy}
                      className={`inline-flex items-center justify-center gap-2 px-8 py-3 bg-[#36210f] text-white text-xs uppercase tracking-[0.2em] font-medium transition-all focus-visible:ring-2 focus-visible:ring-[#36210f] focus-visible:outline-none ${
                        !consentPrivacy || loading
                          ? 'opacity-50 cursor-not-allowed'
                          : 'hover:bg-stone-900 cursor-pointer shadow-sm'
                      }`}
                    >
                      {loading ? 'A Enviar...' : 'Enviar Pedido'}
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </form>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
