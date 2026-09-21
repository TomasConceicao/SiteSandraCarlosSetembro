import React from 'react';
import { Sparkles, HelpCircle } from 'lucide-react';

export interface StructuredFeatureField {
  id: string;
  category: 'interior' | 'exterior' | 'details' | 'financial';
  label: string;
  placeholder: string;
  unit?: string;
  hint?: string;
}

// Lista padronizada com as características fixas solicitadas
export const PREDEFINED_FEATURES_SCHEMA: StructuredFeatureField[] = [
  // 1. Interior
  { id: 'total_quartos', category: 'interior', label: 'Total de Quartos', placeholder: 'Ex: 4' },
  { id: 'suites', category: 'interior', label: 'Suítes', placeholder: 'Ex: 2' },
  { id: 'casas_banho', category: 'interior', label: 'Casas de Banho', placeholder: 'Ex: 3' },
  { id: 'cozinha', category: 'interior', label: 'Cozinha', placeholder: 'Ex: Totalmente equipada Bosch' },
  { id: 'climatizacao', category: 'interior', label: 'Climatização', placeholder: 'Ex: Ar condicionado Daikin / Piso radiante' },
  { id: 'sala_estar', category: 'interior', label: 'Sala de Estar', placeholder: 'Ex: Ampla em open-space com lareira' },
  { id: 'roupeiros', category: 'interior', label: 'Roupeiros Embutidos', placeholder: 'Ex: Em todos os quartos + Closet' },
  { id: 'janelas_vidros', category: 'interior', label: 'Caixilharia / Janelas', placeholder: 'Ex: Vidros duplos com corte térmico' },

  // 2. Exterior
  { id: 'garagem', category: 'exterior', label: 'Garagem / Estacionamento', placeholder: 'Ex: 2 viaturas + telheiro' },
  { id: 'piscina', category: 'exterior', label: 'Piscina', placeholder: 'Ex: Privada com deck em teca e tratamento a sal' },
  { id: 'jardim', category: 'exterior', label: 'Jardim / Espaço Exterior', placeholder: 'Ex: Jardim relvado com rega automática' },
  { id: 'churrasqueira', category: 'exterior', label: 'Barbecue / Churrasqueira', placeholder: 'Ex: Coberta com forno a lenha' },
  { id: 'varandas', category: 'exterior', label: 'Varandas / Terraços', placeholder: 'Ex: Terraço panorâmico com 45 m²' },
  { id: 'vedacao', category: 'exterior', label: 'Portões / Vedações', placeholder: 'Ex: Portões automáticos com intercomunicador' },

  // 3. Detalhes Técnicos & Áreas
  { id: 'area_util', category: 'details', label: 'Área Útil', placeholder: 'Ex: 210 m²', unit: 'm²' },
  { id: 'area_bruta', category: 'details', label: 'Área Bruta de Construção', placeholder: 'Ex: 320 m²', unit: 'm²' },
  { id: 'area_terreno', category: 'details', label: 'Área Total do Terreno', placeholder: 'Ex: 850 m²', unit: 'm²' },
  { id: 'ano_construcao', category: 'details', label: 'Ano de Construção', placeholder: 'Ex: 2023' },
  { id: 'estado_conservacao', category: 'details', label: 'Estado de Conservação', placeholder: 'Ex: Novo / Impecável / Remodelado' },
  { id: 'exposicao_solar', category: 'details', label: 'Exposição Solar', placeholder: 'Ex: Nascente / Sul / Poente' },
  { id: 'paineis_solares', category: 'details', label: 'Painéis Solares / Energia', placeholder: 'Ex: Termossifão para AQS + Fotovoltaicos' },
  { id: 'certificado_energetico', category: 'details', label: 'Certificação Energética', placeholder: 'Ex: A+' },

  // 4. Financeiro & Negociação
  { id: 'preco_venda', category: 'financial', label: 'Preço Pretendido', placeholder: 'Ex: 485.000 €' },
  { id: 'condicao_negociacao', category: 'financial', label: 'Condição do Negócio', placeholder: 'Ex: Negociável / Valor fixo' },
  { id: 'condominio', category: 'financial', label: 'Quota de Condomínio', placeholder: 'Ex: Sem condomínio (Moradia isolada)' },
  { id: 'imi_anual', category: 'financial', label: 'IMI Estimado Anual', placeholder: 'Ex: 340 € / ano' },
];

export interface PredefinedFeaturesProps {
  values: Record<string, string>;
  onChange: (key: string, val: string) => void;
}

export const PredefinedFeaturesForm: React.FC<PredefinedFeaturesProps> = ({
  values,
  onChange,
}) => {
  const renderCategory = (
    category: 'interior' | 'exterior' | 'details' | 'financial',
    title: string,
    badgeColor: string
  ) => {
    const fields = PREDEFINED_FEATURES_SCHEMA.filter((f) => f.category === category);

    return (
      <div className="bg-[#faf8f5] border border-stone-200 p-4">
        <div className="flex items-center justify-between mb-3 border-b border-stone-200 pb-2">
          <span className={`text-xs uppercase tracking-[0.2em] font-bold ${badgeColor}`}>
            {title}
          </span>
          <span className="text-[10px] text-stone-500">
            Preencha apenas o que existir (o resto fica oculto)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {fields.map((field) => (
            <div
              key={field.id}
              className="p-2.5 bg-white border border-stone-200 focus-within:border-[#36210f] transition-colors"
            >
              <label className="block text-[11px] uppercase tracking-wider font-semibold text-stone-700 mb-1">
                {field.label}
              </label>
              <input
                type="text"
                value={values[field.label] || ''}
                onChange={(e) => onChange(field.label, e.target.value)}
                placeholder={field.placeholder}
                className="w-full px-2.5 py-1.5 bg-[#faf8f5] border border-stone-300 text-xs text-stone-900 focus:outline-none focus:bg-white focus:border-[#36210f]"
              />
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="p-3 bg-amber-50/80 border border-amber-200 text-[11px] text-stone-700 flex items-start gap-2">
        <HelpCircle size={15} className="text-[#b87d1d] shrink-0 mt-0.5" />
        <span>
          <strong>Como funciona:</strong> Os campos abaixo já estão definidos com os nomes oficiais. Basta escrever o valor à frente na respetiva caixa. Se deixar um campo em branco, ele será <strong>automaticamente omitido</strong> na página do imóvel.
        </span>
      </div>

      {renderCategory('interior', 'A. Interior do Imóvel', 'text-[#36210f]')}
      {renderCategory('exterior', 'B. Exterior & Envolvente', 'text-[#36210f]')}
      {renderCategory('details', 'C. Áreas & Detalhes Técnicos', 'text-[#36210f]')}
      {renderCategory('financial', 'D. Informações Financeiras', 'text-[#36210f]')}
    </div>
  );
};
