/**
 * Utilitários de Medição de Conversão e Integração de Analytics / GTM / Search Console
 * 
 * Diretrizes estritas de privacidade e conformidade:
 * - Apenas carrega scripts de terceiros (GA4 / GTM) se as variáveis de ambiente existirem.
 * - ZERO recolha ou envio de Dados Pessoais Identificáveis (PII) nos eventos.
 * - Suporta Google Tag Manager (dataLayer) e Google Analytics 4 (gtag).
 */

declare global {
  interface Window {
    dataLayer?: any[];
    gtag?: (...args: any[]) => void;
  }
}

/**
 * Valida se uma variável de ambiente foi definida e possui conteúdo válido
 */
const isValidConfigValue = (val: unknown): val is string => {
  if (typeof val !== 'string') return false;
  const trimmed = val.trim();
  return trimmed.length > 0 && !trimmed.startsWith('%');
};

/**
 * Constantes de consentimento de Cookies RGPD
 */
export const COOKIE_CONSENT_KEY = 'sc_cookie_consent'; // 'accepted' | 'rejected' | 'custom'
export const COOKIE_ANALYTICS_KEY = 'sc_analytics_consent'; // 'true' | 'false'
export const COOKIE_CONSENT_DATE_KEY = 'sc_cookie_consent_date';

/**
 * Valida se existe consentimento prévio para recolha analítica (RGPD Opt-in)
 */
export function hasAnalyticsConsent(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem(COOKIE_ANALYTICS_KEY) === 'true';
}

/**
 * Obtém o estado de consentimento geral
 */
export function getCookieConsentStatus(): 'accepted' | 'rejected' | 'custom' | null {
  if (typeof window === 'undefined') return null;
  return (localStorage.getItem(COOKIE_CONSENT_KEY) as 'accepted' | 'rejected' | 'custom') || null;
}

let trackingScriptsLoaded = false;

/**
 * Carrega os scripts de GA4 e GTM apenas após consentimento explícito
 */
export function loadTrackingScripts(): void {
  if (typeof window === 'undefined' || trackingScriptsLoaded) return;
  if (!hasAnalyticsConsent()) return;

  const gaId = import.meta.env.VITE_GA_ID;
  const gtmId = import.meta.env.VITE_GTM_ID;

  // Ativa rastreio GA caso estivesse desativado
  if (isValidConfigValue(gaId)) {
    (window as any)[`ga-disable-${gaId.trim()}`] = false;
  }

  // 1. Google Tag Manager (GTM)
  if (isValidConfigValue(gtmId)) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      'gtm.start': new Date().getTime(),
      event: 'gtm.js',
    });

    const gtmScript = document.createElement('script');
    gtmScript.id = 'gtm-script-tag';
    gtmScript.async = true;
    gtmScript.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(gtmId.trim())}`;
    document.head.appendChild(gtmScript);
  }

  // 2. Google Analytics 4 (GA4)
  if (isValidConfigValue(gaId)) {
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () {
      window.dataLayer?.push(arguments);
    };

    window.gtag('js', new Date());
    window.gtag('config', gaId.trim(), {
      anonymize_ip: true,
      send_page_view: false, // Controlado manualmente para Single Page Application
    });

    const gaScript = document.createElement('script');
    gaScript.id = 'ga-script-tag';
    gaScript.async = true;
    gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId.trim())}`;
    document.head.appendChild(gaScript);
  }

  trackingScriptsLoaded = true;
}

/**
 * Atualiza o consentimento do utilizador para cookies analíticos e reage em conformidade
 */
export function updateAnalyticsConsent(allowed: boolean): void {
  if (typeof window === 'undefined') return;

  localStorage.setItem(COOKIE_ANALYTICS_KEY, allowed ? 'true' : 'false');
  localStorage.setItem(COOKIE_CONSENT_DATE_KEY, new Date().toISOString());

  const gaId = import.meta.env.VITE_GA_ID;

  if (allowed) {
    loadTrackingScripts();
  } else {
    // Desativa recolha de GA4 imediatamente
    if (isValidConfigValue(gaId)) {
      (window as any)[`ga-disable-${gaId.trim()}`] = true;
    }
  }

  // Dispara evento customizado para componentes reactivos
  window.dispatchEvent(new CustomEvent('cookie_consent_updated', { detail: { allowed } }));
}

/**
 * Inicializa a verificação técnica do Search Console e carrega analytics APENAS se houver consentimento prévio
 */
export function initAnalytics(): void {
  if (typeof window === 'undefined') return;

  const gscCode = import.meta.env.VITE_GSC_VERIFICATION;

  // 1. Google Search Console Meta Tag (Meta tag técnica de validação de propriedade DNS/Search Console sem cookies)
  if (isValidConfigValue(gscCode)) {
    let metaTag = document.querySelector('meta[name="google-site-verification"]');
    if (!metaTag) {
      metaTag = document.createElement('meta');
      metaTag.setAttribute('name', 'google-site-verification');
      document.head.appendChild(metaTag);
    }
    metaTag.setAttribute('content', gscCode.trim());
  } else {
    const rawMeta = document.querySelector('meta[name="google-site-verification"]');
    if (rawMeta && rawMeta.getAttribute('content')?.startsWith('%')) {
      rawMeta.remove();
    }
  }

  // 2. Bloqueio prévio estrito: só carrega GA4/GTM se houver consentimento registado
  if (hasAnalyticsConsent()) {
    loadTrackingScripts();
  }
}

/**
 * Função interna segura para envio de eventos (dataLayer + gtag)
 */
function sendAnalyticsEvent(eventName: string, params: Record<string, any> = {}): void {
  if (typeof window === 'undefined') return;

  // Push seguro para dataLayer
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: eventName,
    ...params,
    timestamp: new Date().toISOString(),
  });

  // Disparo para gtag se ativo
  if (typeof window.gtag === 'function') {
    window.gtag('event', eventName, params);
  }
}

/**
 * Registo de Conversão: Clique no Botão de WhatsApp (Contacto Rápido)
 * SEM DADOS PESSOAIS (PII)
 */
export function trackWhatsAppClick(placement: string, propertyTitle?: string): void {
  sendAnalyticsEvent('whatsapp_click', {
    conversion_type: 'whatsapp_contact',
    placement: placement || 'geral',
    property_title: propertyTitle ? propertyTitle.trim() : 'Geral / Consultoria',
  });
}

/**
 * Registo de Conversão: Clique em Chamada Telefónica Direta
 * SEM DADOS PESSOAIS (PII)
 */
export function trackPhoneCallClick(placement: string, propertyTitle?: string): void {
  sendAnalyticsEvent('phone_call_click', {
    conversion_type: 'phone_call',
    placement: placement || 'geral',
    property_title: propertyTitle ? propertyTitle.trim() : 'Geral / Consultoria',
  });
}

/**
 * Registo de Conversão Crítica: Submissão de Formulário de Lead / Avaliação de Imóvel
 * GARANTIA: Nunca envia nome, telefone, email ou texto da mensagem (ZERO PII).
 */
export function trackLeadSubmission(
  interestType: string,
  contextSource = 'Contacto Geral'
): void {
  const isAvaliacao = interestType === 'avaliacao' || interestType === 'venda';

  sendAnalyticsEvent('generate_lead', {
    conversion_type: isAvaliacao ? 'avaliacao_imovel_lead' : 'contacto_lead',
    interest_category: interestType || 'informacao',
    source: contextSource,
  });
}

/**
 * Registo de Visualização de Página (SPA Virtual Pageview)
 */
export function trackPageView(pageTitle: string, path: string): void {
  sendAnalyticsEvent('page_view', {
    page_title: pageTitle,
    page_location: path,
  });
}
