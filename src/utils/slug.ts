/**
 * Utilitários para geração e manipulação de slugs semânticos de URLs.
 * Garante URLs limpas em minúsculas, separadas por hífen, sem acentos e sem caracteres especiais.
 */

/**
 * Converte qualquer texto num slug amigável para SEO:
 * - Converte para minúsculas
 * - Remove acentos e diacríticos (normalização NFD)
 * - Remove caracteres que não sejam letras, números, espaços ou hífens
 * - Substitui espaços e múltiplos hífens por um único hífen
 * - Remove hífens no início e no final
 */
export function generateSlug(text: string): string {
  if (!text) return '';
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacríticos
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // remove caracteres especiais
    .replace(/[\s_-]+/g, '-') // unifica espaços e underscores em hífen
    .replace(/^-+|-+$/g, ''); // remove hífens das extremidades
}

/**
 * Retorna o caminho relativo canónico e semântico para a página de detalhe de um imóvel.
 * Exemplo: getPropertyPath('moradia-pombal-centro') -> '/imoveis/moradia-pombal-centro'
 */
export function getPropertyPath(slugOrId: string): string {
  const clean = generateSlug(slugOrId);
  return `/imoveis/${clean}`;
}

/**
 * Verifica se um slug é válido segundo as diretrizes de SEO.
 */
export function isValidSlug(slug: string): boolean {
  if (!slug) return false;
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}
