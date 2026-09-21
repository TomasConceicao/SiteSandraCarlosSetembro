import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Property } from '../types';
import { Star, Check, Settings2, X } from 'lucide-react';
import { getFeaturedPropertyIds, setFeaturedPropertyIds } from '../utils/featuredManager';
import { PropertyStatusOverlay } from './PropertyStatusOverlay';

interface FeaturedSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  allProperties: Property[];
  onUpdated: () => void;
}

export const FeaturedSelectorModal: React.FC<FeaturedSelectorModalProps> = ({
  isOpen,
  onClose,
  allProperties,
  onUpdated,
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>(() => getFeaturedPropertyIds());

  if (!isOpen) return null;

  const handleToggle = (id: string) => {
    if (selectedIds.includes(id)) {
      if (selectedIds.length <= 1) {
        return; // Pelo menos 1 deve estar destacado
      }
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleSave = () => {
    setFeaturedPropertyIds(selectedIds);
    onUpdated();
    onClose();
  };

  const handleResetDefault = () => {
    const defaults = allProperties.slice(0, 3).map((p) => p.id);
    setSelectedIds(defaults);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-2xl bg-[#faf8f5] border border-stone-300 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="bg-[#261501] text-white px-6 py-4 flex items-center justify-between border-b border-[#D6920B]/40">
            <div className="flex items-center gap-2.5">
              <Star size={18} className="text-[#D6920B] fill-[#D6920B]" />
              <div>
                <h3 className="font-sans text-sm sm:text-base uppercase tracking-[0.16em] font-semibold text-white">
                  Gerir Imóveis Destacados
                </h3>
                <p className="text-[11px] text-[#d8be9e] font-light">
                  Selecione os imóveis que surgem no topo de Casas e na Página Inicial ({selectedIds.length} selecionados)
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-stone-400 hover:text-white p-1 transition-colors cursor-pointer"
              aria-label="Fechar"
            >
              <X size={20} />
            </button>
          </div>

          {/* Body: Lista de Propriedades */}
          <div className="p-6 overflow-y-auto space-y-3 divide-y divide-stone-200/70 flex-1">
            <div className="flex items-center justify-between pb-2">
              <span className="text-xs uppercase tracking-wider text-stone-500 font-medium">
                Clique num imóvel para ativar ou desativar o destaque
              </span>
              <button
                type="button"
                onClick={handleResetDefault}
                className="text-xs text-[#b87d1d] hover:underline cursor-pointer font-semibold uppercase tracking-wider"
              >
                Primeiros 3 Padrão
              </button>
            </div>

            {allProperties.map((prop) => {
              const isChecked = selectedIds.includes(prop.id);
              const orderIndex = selectedIds.indexOf(prop.id);

              return (
                <div
                  key={prop.id}
                  onClick={() => handleToggle(prop.id)}
                  className={`pt-3 flex items-center gap-4 cursor-pointer p-2.5 transition-colors ${
                    isChecked
                      ? 'bg-[#36210f]/6 border-l-4 border-[#D6920B]'
                      : 'hover:bg-stone-200/40 border-l-4 border-transparent'
                  }`}
                >
                  <div className="relative w-20 h-16 sm:w-24 sm:h-18 shrink-0 overflow-hidden bg-stone-200">
                    {/* Contexto: Miniatura do imóvel na lista de seleção administrativa de destaques */}
                    <img
                      src={prop.image}
                      alt={`Sandra Carlos Consultoria - ${prop.title}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      width="96"
                      height="72"
                    />
                    {isChecked && (
                      <span className="absolute top-1 left-1 bg-[#D6920B] text-[#261501] text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-md">
                        {orderIndex + 1}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase tracking-[0.2em] text-[#b87d1d] font-semibold">
                        {prop.location.split(',')[0]}
                      </span>
                      {prop.status && prop.status !== 'disponivel' && (
                        <PropertyStatusOverlay
                          status={prop.status}
                          statusLabel={prop.statusLabel}
                          variant="badge"
                        />
                      )}
                      {isChecked && (
                        <span className="bg-[#261501] text-white text-[9px] uppercase tracking-widest px-2 py-0.5 font-medium">
                          Destacado #{orderIndex + 1}
                        </span>
                      )}
                    </div>
                    <h4 className="font-sans text-sm font-semibold text-stone-900 truncate">
                      {prop.title}
                    </h4>
                    <p className="text-xs text-stone-600 font-light truncate">
                      {prop.typology} &bull; {prop.area} {prop.price ? `• ${prop.price}` : ''}
                    </p>
                  </div>

                  <div className="shrink-0 pl-2">
                    <div
                      className={`w-6 h-6 border flex items-center justify-center transition-colors ${
                        isChecked
                          ? 'bg-[#261501] border-[#261501] text-white'
                          : 'border-stone-400 bg-white'
                      }`}
                    >
                      {isChecked && <Check size={14} strokeWidth={3} className="text-[#D6920B]" />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer Actions */}
          <div className="p-4 sm:p-5 bg-stone-100 border-t border-stone-200 flex items-center justify-between">
            <span className="text-xs text-stone-600">
              {selectedIds.length} imóvel(is) com estrela de destaque
            </span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs uppercase tracking-wider font-semibold text-stone-600 hover:text-stone-900 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="px-5 py-2 bg-[#261501] hover:bg-[#381f02] text-white text-xs uppercase tracking-[0.2em] font-semibold transition-colors cursor-pointer border border-[#D6920B]"
              >
                Aplicar Destaques
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
