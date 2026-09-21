import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Phone, Mail, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

interface FloatingContactWidgetProps {
  onOpenContact: () => void;
}

export const FloatingContactWidget: React.FC<FloatingContactWidgetProps> = ({
  onOpenContact,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showBalloon, setShowBalloon] = useState(true);
  const widgetRef = useRef<HTMLDivElement>(null);

  const whatsappUrl = `https://wa.me/351965881547?text=${encodeURIComponent(
    'Olá Sandra Carlos, gostaria de obter mais informações sobre os seus serviços imobiliários.'
  )}`;

  // Fecha ao clicar fora do widget
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (widgetRef.current && !widgetRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Fecha com a tecla Escape
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <aside
      id="floating-contact-widget"
      aria-label="Atendimento e Contacto Direto"
      ref={widgetRef}
      className="fixed z-40 select-none flex flex-col items-end"
      style={{
        bottom: 'max(16px, env(safe-area-inset-bottom, 16px))',
        right: 'max(16px, env(safe-area-inset-right, 16px))',
      }}
    >
      {/* 1. Pop-up Card Expandido (Opção 2: Bege Areia / Linho Quente - Harmonia com o Rodapé) */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="floating-contact-card"
            initial={{ opacity: 0, y: 16, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.94 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="mb-3 w-[calc(100vw-32px)] max-w-[310px] sm:max-w-[330px] bg-[#f5efe8] text-stone-900 p-6 sm:p-7 border border-[#c5ab8d] rounded-lg shadow-[0_16px_40px_rgba(54,33,15,0.16)] flex flex-col items-center text-center relative"
          >
            {/* Botão de Fechar */}
            <button
              id="floating-contact-close-btn"
              onClick={() => setIsOpen(false)}
              className="absolute top-3.5 right-3.5 text-[#8c7362] hover:text-[#36210f] p-1 transition-colors cursor-pointer focus:outline-none"
              aria-label="Fechar pop-up"
            >
              <X size={17} strokeWidth={2} />
            </button>

            {/* Cabeçalho Editorial */}
            <span className="font-serif text-[11px] sm:text-xs uppercase tracking-[0.32em] text-[#b87d1d] font-semibold mb-4">
              CONTACTE-ME
            </span>

            {/* Foto da Sandra: Enquadramento correto (object-[center_21%]) */}
            <div className="relative w-20 h-20 sm:w-22 sm:h-22 rounded-full overflow-hidden mb-3.5 border-2 border-[#c5ab8d] shadow-md">
              {/* Contexto: Retrato da consultora Sandra Carlos no widget de contacto flutuante e WhatsApp */}
              <img
                src="https://SEU-DOMINIO-AQUI/sandra-carlos-consultora-imobiliaria-pombal.webp"
                alt="Sandra Carlos - Consultora Imobiliária em Pombal e Portugal"
                className="w-full h-full object-cover object-[center_21%]"
                loading="lazy"
                width="88"
                height="88"
              />
            </div>

            {/* Nome e Cargo em tons castanho chocolate */}
            <h3 className="font-sans text-base sm:text-lg font-bold uppercase tracking-[0.16em] text-[#36210f]">
              SANDRA CARLOS
            </h3>
            <div className="mt-1 mb-5 flex flex-col items-center">
              <p className="font-sans text-[11px] sm:text-xs text-[#6b5142] font-normal tracking-wider">
                Consultora Imobiliária Expertimo
              </p>
              <p className="font-sans text-[10px] sm:text-[11px] text-[#b87d1d] font-semibold tracking-[0.16em] uppercase mt-0.5">
                Agente Pro
              </p>
            </div>

            {/* Botões de Ação */}
            <div className="w-full space-y-2.5">
              {/* 1. Botão WhatsApp por cima */}
              <a
                id="floating-whatsapp-btn"
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsOpen(false)}
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 bg-[#25D366] hover:bg-[#20bd5a] text-white text-xs uppercase tracking-[0.16em] font-semibold transition-colors rounded-sm shadow-xs cursor-pointer"
              >
                <MessageCircle size={16} className="text-white" />
                <span>CONVERSAR POR WHATSAPP</span>
              </a>

              {/* 2. Botão de Email por baixo */}
              <button
                id="floating-email-btn"
                onClick={() => {
                  setIsOpen(false);
                  onOpenContact();
                }}
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 bg-[#36210f] hover:bg-[#4a2e16] text-white text-xs uppercase tracking-[0.16em] font-semibold transition-colors border border-[#c5ab8d]/50 rounded-sm cursor-pointer"
              >
                <Mail size={15} className="text-[#D6920B]" />
                <span>ENVIAR MENSAGEM</span>
              </button>
            </div>

            {/* 3. Número de telemóvel por baixo com divisor em bege areia */}
            <div className="w-full pt-3.5 mt-3.5 border-t border-[#c5ab8d]/50 flex items-center justify-center">
              <a
                id="floating-phone-btn"
                href="tel:+351965881547"
                className="inline-flex items-center justify-center gap-2 text-[#36210f] hover:text-[#b87d1d] transition-colors text-xs sm:text-sm font-sans tracking-wide py-0.5 font-medium"
              >
                <Phone size={14} className="text-[#b87d1d]" />
                <span>+351 965 881 547</span>
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Balão de Conversa (Speech Balloon) em Bege Areia com "Fale com a Sandra" */}
      <AnimatePresence>
        {!isOpen && showBalloon && (
          <motion.div
            id="floating-contact-balloon"
            initial={{ opacity: 0, y: 8, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.94 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="relative mb-2 mr-1 flex items-start gap-2.5 bg-[#f5efe8] text-stone-900 py-2.5 pl-3 pr-2.5 rounded-lg shadow-[0_8px_24px_rgba(54,33,15,0.14)] border border-[#c5ab8d] cursor-pointer max-w-[240px] sm:max-w-[260px] group"
            onClick={() => setIsOpen(true)}
            role="button"
            tabIndex={0}
            aria-label="Abrir conversa com a Sandra"
          >
            {/* Foto miniatura da Sandra com pontinho verde ativo */}
            <div className="relative shrink-0 mt-0.5">
              {/* Contexto: Miniatura da Sandra Carlos no balão de ajuda e contacto direto */}
              <img
                src="https://SEU-DOMINIO-AQUI/sandra-carlos-consultora-imobiliaria-pombal.webp"
                alt="Sandra Carlos - Consultora Imobiliária"
                className="w-7 h-7 rounded-full object-cover object-[center_21%] border border-[#c5ab8d]"
                loading="lazy"
                width="28"
                height="28"
              />
              <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-500 border border-white" />
            </div>

            {/* Texto convidativo: "Precisa de ajuda?" e "Fale com a Sandra" */}
            <div className="flex-1 min-w-0 pr-1 text-left">
              <p className="font-sans text-xs font-bold text-[#36210f] leading-tight group-hover:text-[#b87d1d] transition-colors">
                Precisa de ajuda?
              </p>
              <p className="font-sans text-[11px] text-[#6b5142] leading-tight mt-0.5 font-medium">
                Fale com a Sandra
              </p>
            </div>

            {/* Botão X para fechar apenas o balão */}
            <button
              id="floating-balloon-close-btn"
              onClick={(e) => {
                e.stopPropagation();
                setShowBalloon(false);
              }}
              className="text-[#8c7362] hover:text-[#36210f] p-0.5 rounded transition-colors cursor-pointer shrink-0 mt-0.5"
              aria-label="Dispensar mensagem"
            >
              <X size={13} strokeWidth={2} />
            </button>

            {/* Triângulo / Seta do balão a apontar para a bola */}
            <div className="absolute -bottom-1.5 right-6 w-3 h-3 bg-[#f5efe8] border-r border-b border-[#c5ab8d] rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. Botão Flutuante Principal: Sempre em Bola Circular */}
      <button
        id="floating-contact-trigger-btn"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-13 h-13 sm:w-14 sm:h-14 rounded-full flex items-center justify-center shadow-[0_8px_24px_rgba(54,33,15,0.35)] border transition-all duration-300 cursor-pointer focus:outline-none active:scale-95 ${
          isOpen
            ? 'bg-[#36210f] text-white border-[#D6920B]'
            : 'bg-[#422502] hover:bg-[#36210f] text-white border-[#D6920B]/80 hover:border-[#D6920B] hover:scale-105'
        }`}
        aria-expanded={isOpen}
        aria-label={isOpen ? 'Fechar contacto' : 'Fale Comigo - Contacto e WhatsApp'}
      >
        <AnimatePresence mode="wait">
          {isOpen ? (
            <motion.div
              key="icon-close"
              initial={{ opacity: 0, rotate: -45, scale: 0.8 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: 45, scale: 0.8 }}
              transition={{ duration: 0.18 }}
              className="flex items-center justify-center"
            >
              <X size={21} strokeWidth={2.2} className="text-white" />
            </motion.div>
          ) : (
            <motion.div
              key="icon-chat"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.18 }}
              className="relative flex items-center justify-center"
            >
              <MessageCircle size={24} strokeWidth={2} className="text-white" />
              {/* Ponto indicador de mensagem em verde WhatsApp */}
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#25D366] border-2 border-[#422502]" />
            </motion.div>
          )}
        </AnimatePresence>
      </button>
    </aside>
  );
};
