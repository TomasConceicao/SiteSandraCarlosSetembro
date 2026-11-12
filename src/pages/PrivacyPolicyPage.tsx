import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Mail, Phone, ExternalLink, ArrowLeft } from 'lucide-react';
import { Breadcrumb } from '../components/Breadcrumb';
import { PageType } from '../types';

interface PrivacyPolicyPageProps {
  onNavigate?: (page: PageType) => void;
}

export const PrivacyPolicyPage: React.FC<PrivacyPolicyPageProps> = ({ onNavigate }) => {
  return (
    <article className="min-h-screen bg-[#faf8f5] text-stone-900 pt-28 sm:pt-36 pb-24 font-sans">
      {/* Breadcrumb de Navegação Estruturada */}
      <Breadcrumb
        items={[
          { name: 'Início', page: 'home' },
          { name: 'Política de Privacidade', page: 'privacidade' },
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
            <ShieldCheck size={18} className="text-[#b87d1d]" />
            <span className="text-[11px] uppercase tracking-[0.32em] text-[#b87d1d] font-semibold">
              CONFORMIDADE LEGAL &bull; RGPD &bull; LEI N.º 58/2019
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-light text-stone-900 uppercase tracking-[0.08em] leading-tight mb-4">
            Política de Privacidade &amp; Proteção de Dados Pessoais
          </h1>

          <p className="text-stone-600 text-xs sm:text-sm font-light leading-relaxed">
            Última atualização: 23 de Setembro de 2026 &bull; Em estrita conformidade com o Regulamento Geral sobre a
            Proteção de Dados (UE 2016/679) e a legislação nacional aplicável.
          </p>
        </motion.header>

        {/* Conteúdo Estruturado */}
        <div className="space-y-10 text-stone-700 text-sm sm:text-[15px] leading-relaxed font-light">
          {/* Secção 1 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-medium text-stone-900 uppercase tracking-[0.06em]">
              1. Responsável pelo Tratamento dos Dados Pessoais
            </h2>
            <p>
              O presente website é gerido e operado pela consultora imobiliária <strong>Sandra Carlos</strong>, titular
              da licença AMI n.º <strong>15766</strong> emitida pelo IMPIC, I.P., exercendo a sua atividade de mediação
              imobiliária no concelho de Pombal e Região Centro em parceria com a rede <strong>Expertimo Portugal</strong>.
            </p>
            <p>
              Para quaisquer esclarecimentos, exercício de direitos de privacidade ou pedidos de informação relativos aos
              seus dados pessoais, pode contactar diretamente:
            </p>
            <div className="p-4 bg-[#fcfbf9] border border-stone-200 space-y-1.5 text-xs text-stone-800">
              <p>
                <strong>Responsável:</strong> Sandra Carlos &bull; Consultoria Imobiliária
              </p>
              <p>
                <strong>Licença Profissional:</strong> AMI 15766 (Expertimo Portugal)
              </p>
              <p>
                <strong>Domicílio Profissional / Área:</strong> Concelho de Pombal e Região Centro, Portugal
              </p>
              <p className="flex items-center gap-2 pt-1">
                <Mail size={14} className="text-[#b87d1d]" />
                <a href="mailto:sandra.carlos@expertimo.eu" className="underline hover:text-stone-950">
                  sandra.carlos@expertimo.eu
                </a>
              </p>
              <p className="flex items-center gap-2">
                <Phone size={14} className="text-[#b87d1d]" />
                <a href="tel:+351965881547" className="underline hover:text-stone-950">
                  +351 965881547
                </a>
              </p>
            </div>
          </section>

          {/* Secção 2 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-medium text-stone-900 uppercase tracking-[0.06em]">
              2. Princípios e Enquadramento Legal
            </h2>
            <p>
              O tratamento dos seus dados pessoais rege-se pelos princípios da licitude, lealdade, transparência,
              limitação das finalidades, minimização dos dados, exatidão, limitação da conservação, integridade e
              confidencialidade, nos termos do artigo 5.º do Regulamento (UE) 2016/679 (RGPD) e da Lei n.º 58/2019, de 8
              de agosto.
            </p>
          </section>

          {/* Secção 3 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-medium text-stone-900 uppercase tracking-[0.06em]">
              3. Dados Pessoais Recolhidos e Minimização
            </h2>
            <p>
              Em observância rigorosa do princípio da minimização, apenas recolhemos os dados estritamente necessários
              para o processamento dos seus pedidos:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-stone-700">
              <li>
                <strong>Formulários de Contacto e Avaliação:</strong> Nome completo, endereço de correio eletrónico,
                número de telefone (opcional/indicado voluntariamente), âmbito de interesse e conteúdo da mensagem.
              </li>
              <li>
                <strong>Dados de Navegação Técnica:</strong> Endereço IP (anonimizado), registo de consentimento de
                cookies e métricas estatísticas agregadas (apenas mediante consentimento prévio).
              </li>
            </ul>
          </section>

          {/* Secção 4 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-medium text-stone-900 uppercase tracking-[0.06em]">
              4. Finalidades do Tratamento e Bases de Licitude (Artigo 6.º do RGPD)
            </h2>
            <p>Os seus dados pessoais são tratados exclusivamente para as seguintes finalidades legítimas:</p>
            <div className="space-y-2.5">
              <div className="p-3 bg-white border border-stone-200">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-900">
                  A. Resposta a Pedidos de Contacto e Agendamento de Visitas
                </h3>
                <p className="text-xs text-stone-600 mt-1">
                  <strong>Base de Licitude:</strong> Diligências pré-contratuais a pedido do titular dos dados (Artigo
                  6.º, n.º 1, alínea b) do RGPD).
                </p>
              </div>

              <div className="p-3 bg-white border border-stone-200">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-900">
                  B. Celebração e Execução de Contratos de Mediação Imobiliária (CMI)
                </h3>
                <p className="text-xs text-stone-600 mt-1">
                  <strong>Base de Licitude:</strong> Execução de contrato ou cumprimento de obrigações legais
                  decorrentes da Lei n.º 15/2013 e da Lei n.º 83/2017 (Prevenção do Branqueamento de Capitais - IMPIC).
                </p>
              </div>

              <div className="p-3 bg-white border border-stone-200">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-900">
                  C. Métricas de Navegação e Análise de Desempenho
                </h3>
                <p className="text-xs text-stone-600 mt-1">
                  <strong>Base de Licitude:</strong> Consentimento livre, específico, informado e inequívoco do titular
                  (Artigo 6.º, n.º 1, alínea a) do RGPD), prestado através da barra de cookies.
                </p>
              </div>
            </div>
          </section>

          {/* Secção 5 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-medium text-stone-900 uppercase tracking-[0.06em]">
              5. Prazo de Conservação dos Dados
            </h2>
            <p>
              Os dados recolhidos através de formulários de contacto serão conservados apenas durante o período
              necessário para esclarecer e acompanhar a sua solicitação comercial (até um limite máximo de 2 anos a partir
              do último contacto ativo, caso não venha a ser celebrado contrato).
            </p>
            <p>
              Em caso de celebração de Contrato de Mediação Imobiliária (CMI) ou transação concluída, os dados e cópias
              documentais de identificação serão arquivados pelo período legal obrigatório de 7 anos, nos termos do artigo
              51.º da Lei n.º 83/2017 de 18 de agosto.
            </p>
          </section>

          {/* Secção 6 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-medium text-stone-900 uppercase tracking-[0.06em]">
              6. Destinatários e Partilha de Dados
            </h2>
            <p>
              Não comercializamos, alugamos nem cedemos os seus dados pessoais a terceiros para fins publicitários. Os
              dados apenas poderão ser transmitidos a:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-stone-700">
              <li>Entidades notariais, conservatórias e solicitadores para efeitos de instrução da escritura ou CPCB;</li>
              <li>
                Instituições financeiras e intermediários de crédito autorizados pelo Banco de Portugal, estritamente a seu
                pedido formal para apoio ao financiamento bancário;
              </li>
              <li>Autoridades judiciais, tributárias ou reguladoras (IMPIC, AT, PJ), quando exigido por lei.</li>
            </ul>
          </section>

          {/* Secção 7 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-medium text-stone-900 uppercase tracking-[0.06em]">
              7. Direitos do Titular dos Dados
            </h2>
            <p>
              Enquanto titular dos dados pessoais, assistem-lhe os seguintes direitos previstos nos artigos 15.º a 22.º do
              RGPD:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-stone-700">
              <li>
                <strong>Direito de Acesso:</strong> Obter confirmação e cópia dos dados que são objeto de tratamento;
              </li>
              <li>
                <strong>Direito de Retificação:</strong> Solicitar a correção de dados incompletos ou inexatos;
              </li>
              <li>
                <strong>Direito ao Apagamento:</strong> Exigir a eliminação dos seus dados ("direito a ser esquecido"),
                desde que não colida com prazos legais imperativos de arquivo;
              </li>
              <li>
                <strong>Direito à Limitação do Tratamento:</strong> Solicitar a suspensão temporária do tratamento;
              </li>
              <li>
                <strong>Direito de Oposição:</strong> Opor-se a qualquer momento a contactos de natureza informativa;
              </li>
              <li>
                <strong>Direito à Portabilidade:</strong> Receber os seus dados num formato estruturado e de leitura
                automática.
              </li>
            </ul>
            <p className="pt-1">
              O exercício destes direitos é gratuito e pode ser solicitado por escrito através do e-mail:{' '}
              <a
                href="mailto:sandra.carlos@expertimo.eu"
                className="font-medium text-stone-900 underline hover:text-[#b87d1d]"
              >
                sandra.carlos@expertimo.eu
              </a>
              . Responderemos a todas as solicitações no prazo máximo de 30 dias.
            </p>
          </section>

          {/* Secção 8 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-medium text-stone-900 uppercase tracking-[0.06em]">
              8. Direito de Apresentar Reclamação à Autoridade de Controlo
            </h2>
            <p>
              Sem prejuízo de qualquer outro recurso administrativo ou judicial, se considerar que o tratamento dos seus
              dados viola o RGPD, tem o direito de apresentar reclamação junto da autoridade de controlo nacional:
            </p>
            <div className="p-4 bg-white border border-stone-200 text-xs text-stone-800 space-y-1">
              <p className="font-semibold text-stone-900 uppercase tracking-wider">
                CNPD – Comissão Nacional de Proteção de Dados
              </p>
              <p>Av. D. Carlos I, 134 - 1.º, 1200-651 Lisboa, Portugal</p>
              <p>Telefone: +351 213 928 400 &bull; E-mail: geral@cnpd.pt</p>
              <p>
                Website Oficial:{' '}
                <a
                  href="https://www.cnpd.pt"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-[#36210f] hover:text-[#b87d1d] inline-flex items-center gap-1"
                >
                  <span>www.cnpd.pt</span>
                  <ExternalLink size={12} />
                </a>
              </p>
            </div>
          </section>

          {/* Secção 9 */}
          <section className="space-y-3">
            <h2 className="text-base sm:text-lg font-medium text-stone-900 uppercase tracking-[0.06em]">
              9. Segurança dos Dados
            </h2>
            <p>
              Adotamos medidas técnicas e organizativas adequadas para assegurar um nível de segurança condizente com o
              risco, incluindo comunicação encriptada por protocolo seguro HTTPS/TLS em toda a navegação, controlo estrito
              de acessos e salvaguarda contra destruição acidental ou ilícita.
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
