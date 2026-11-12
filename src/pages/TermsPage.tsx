import React from 'react';
import { motion } from 'framer-motion';
import { FileText, ExternalLink, ArrowLeft } from 'lucide-react';
import { Breadcrumb } from '../components/Breadcrumb';
import { PageType } from '../types';

interface TermsPageProps {
  onNavigate?: (page: PageType) => void;
}

export const TermsPage: React.FC<TermsPageProps> = ({ onNavigate }) => {
  return (
    <article className="min-h-screen bg-[#faf8f5] text-stone-900 pt-28 sm:pt-36 pb-24 font-sans">
      {/* Breadcrumb de Navegação Estruturada */}
      <Breadcrumb
        items={[
          { name: 'Início', page: 'home' },
          { name: 'Termos e Condições', page: 'termos' },
        ]}
        onNavigate={onNavigate}
      />

      <div className="max-w-4xl mx-auto px-6 sm:px-10 lg:px-12 mt-6">
        {/* Cabeçalho Editorial */}
        <motion.header
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="border-b border-stone-200/80 pb-8 mb-12"
        >
          <div className="flex items-center gap-2 mb-3">
            <FileText size={18} className="text-[#b87d1d]" />
            <span className="text-[11px] uppercase tracking-[0.32em] text-[#b87d1d] font-semibold">
              ENQUADRAMENTO LEGAL &bull; LEI N.º 15/2013 &bull; AMI 15766
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-light text-stone-900 uppercase tracking-[0.08em] leading-tight mb-4">
            Termos e Condições de Utilização
          </h1>

          <p className="text-stone-600 text-xs sm:text-sm font-light leading-relaxed">
            Última atualização: 23 de Setembro de 2026 &bull; Regula a utilização do website e a prestação de serviços de
            consultoria imobiliária.
          </p>
        </motion.header>

        {/* Artigos Estruturados */}
        <div className="space-y-10 text-stone-700 text-sm sm:text-[15px] leading-relaxed font-light">
          {/* 1. Objeto e Identificação */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-medium text-stone-900 uppercase tracking-[0.06em]">
              1. Identificação do Titular e Objeto do Website
            </h2>
            <p>
              O presente website é propriedade da consultora imobiliária <strong>Sandra Carlos</strong>, portadora da
              licença profissional <strong>AMI 15766</strong> emitida pelo Instituto dos Mercados Públicos, do Imobiliário
              e da Construção (IMPIC, I.P.), exercendo a mediação imobiliária em parceria com a rede{' '}
              <strong>Expertimo Portugal</strong> no concelho de Pombal e Região Centro.
            </p>
            <p>
              A plataforma tem por objeto a divulgação do portfólio de imóveis em carteira, a prestação de informações
              institucionais sobre o mercado imobiliário local e a disponibilização de canais diretos de contacto para
              pedidos de avaliação e consultoria.
            </p>
          </section>

          {/* 2. Enquadramento da Atividade Imobiliária */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-medium text-stone-900 uppercase tracking-[0.06em]">
              2. Enquadramento Legal da Mediação Imobiliária
            </h2>
            <p>
              A atividade de mediação imobiliária exercida rege-se integralmente pelo regime jurídico estabelecido pela{' '}
              <strong>Lei n.º 15/2013, de 8 de fevereiro</strong>, obedecendo aos mais rigorosos deveres de ética,
              sigilo, rigor e proteção dos interesses das partes intervenientes.
            </p>
          </section>

          {/* 3. Inexistência de Transações Monetárias no Website */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-medium text-stone-900 uppercase tracking-[0.06em]">
              3. Isenção de Transações Monetárias e Pagamentos Online
            </h2>
            <div className="p-4 bg-white border border-stone-200">
              <p className="text-stone-800">
                <strong>Aviso Informativo Importante:</strong> O website tem natureza puramente expositiva e de
                contacto. Não são processados quaisquer pagamentos eletrónicos, cobranças de reservas, depósitos bancários
                ou contratos através da plataforma web.
              </p>
              <p className="text-stone-600 text-xs mt-2">
                Qualquer negócio imobiliário, sinal ou pagamento de honorários de mediação decorre estritamente fora da
                plataforma através da assinatura presencial ou qualificada de Contrato de Mediação Imobiliária (CMI),
                Contrato-Promessa de Compra e Venda (CPCV) e Escritura Pública Notarial.
              </p>
            </div>
          </section>

          {/* 4. Propriedade Intelectual e Proteção de Imagens */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-medium text-stone-900 uppercase tracking-[0.06em]">
              4. Direitos de Autor e Propriedade Intelectual
            </h2>
            <p>
              Todos os elementos visuais, fotografias profissionais de imóveis, logótipos (incluindo marca registada
              Sandra Carlos, insígnia Agente Pro e Expertimo Portugal), redações editoriais, infografias e código-fonte
              são propriedade exclusiva de Sandra Carlos ou utilizados sob licença expressa, estando protegidos pelo
              Código do Direito de Autor e dos Direitos Conexos e Código da Propriedade Industrial.
            </p>
            <p>
              É expressamente interdita a cópia, reprodução total ou parcial, descarregamento automatizado (web
              scraping), retransmissão ou publicação em outros portais ou redes sem autorização escrita prévia.
            </p>
          </section>

          {/* 5. Exatidão das Informações sobre Imóveis */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-medium text-stone-900 uppercase tracking-[0.06em]">
              5. Natureza Informativa e Validação Documental dos Imóveis
            </h2>
            <p>
              As características, áreas brutas, áreas úteis, tipologias, fotografias e valores indicados nas fichas de
              imóveis têm caráter meramente informativo e baseiam-se na documentação facultada pelos respetivos
              proprietários e na caderneta predial.
            </p>
            <p>
              Todas as informações devem ser confirmadas no decurso da visita presencial e mediante a conferência dos
              documentos legais oficiais (Certidão Permanente do Registo Predial, Caderneta Predial Urbana e Certificado
              de Desempenho Energético emitido pela ADENE).
            </p>
          </section>

          {/* 6. Livro de Reclamações Eletrónico */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-medium text-stone-900 uppercase tracking-[0.06em]">
              6. Livro de Reclamações Eletrónico
            </h2>
            <p>
              Em cumprimento do Decreto-Lei n.º 74/2017 de 9 de junho, disponibilizamos aos nossos clientes e
              utilizadores o acesso direto ao Livro de Reclamações Eletrónico português:
            </p>
            <div className="p-4 bg-white border border-stone-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs uppercase tracking-wider font-semibold text-stone-900 block">
                  Plataforma Oficial do Governo de Portugal
                </span>
                <span className="text-xs text-stone-600">
                  Apresentação e acompanhamento de reclamações ou elogios por via eletrónica.
                </span>
              </div>
              <a
                href="https://www.livroreclamacoes.pt"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-[#36210f] hover:bg-stone-900 text-white text-xs uppercase tracking-wider font-semibold py-2.5 px-5 transition-colors shrink-0"
              >
                <span>Aceder ao Livro</span>
                <ExternalLink size={13} />
              </a>
            </div>
          </section>

          {/* 7. Resolução Alternativa de Litígios (RAL) */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-medium text-stone-900 uppercase tracking-[0.06em]">
              7. Resolução Alternativa de Litígios de Consumo (Lei n.º 144/2015)
            </h2>
            <p>
              Em cumprimento do artigo 18.º da Lei n.º 144/2015, informa-se que em caso de litígio de consumo, o
              consumidor pode recorrer a uma Entidade de Resolução Alternativa de Litígios de Consumo (RAL):
            </p>
            <div className="p-4 bg-white border border-stone-200 text-xs text-stone-800 space-y-2">
              <p className="font-semibold text-stone-900 uppercase tracking-wider">
                CNIACC – Centro Nacional de Informação e Arbitragem de Conflitos de Consumo
              </p>
              <p>Faculdade de Direito da Universidade Nova de Lisboa - Campus de Campolide, 1099-032 Lisboa</p>
              <p>Telefone: +351 213 847 484 &bull; E-mail: cniacc@unl.pt</p>
              <p>
                Website Oficial:{' '}
                <a
                  href="https://www.cniacc.pt"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-[#36210f] hover:text-[#b87d1d] inline-flex items-center gap-1"
                >
                  <span>www.cniacc.pt</span>
                  <ExternalLink size={12} />
                </a>
              </p>
              <div className="pt-2 border-t border-stone-200 mt-2 text-stone-600">
                Os consumidores residentes no município de Pombal podem ainda recorrer aos serviços de apoio do{' '}
                <strong>CIAC – Centro de Informação Autárquico ao Consumidor de Pombal</strong> (Câmara Municipal de
                Pombal).
              </div>
            </div>
          </section>

          {/* 8. Lei Aplicável e Foro Competente */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-medium text-stone-900 uppercase tracking-[0.06em]">
              8. Lei Aplicável e Jurisdição
            </h2>
            <p>
              Os presentes Termos e Condições regem-se pela lei portuguesa. Para a resolução de qualquer litígio emergente
              da interpretação ou execução das presentes condições que não possa ser dirimido por via amigável ou RAL, é
              competente o Tribunal da Comarca de Leiria (Instância Local de Pombal), com renúncia expressa a qualquer
              outro.
            </p>
          </section>
        </div>

        {/* Botão de Regresso */}
        <div className="mt-16 pt-8 border-t border-stone-200/80 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              if (onNavigate) {
                onNavigate('home');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }
            }}
            className="inline-flex items-center gap-2 text-stone-800 hover:text-[#b87d1d] font-sans text-xs uppercase tracking-[0.2em] font-medium transition-colors cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span>Voltar à Página Inicial</span>
          </button>
        </div>
      </div>
    </article>
  );
};
