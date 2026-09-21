import { properties } from '../data/properties';
import { Property } from '../types';

const STORAGE_KEY = 'sc_featured_property_ids';

// Default: primeiros 3 imóveis da lista
const DEFAULT_FEATURED_IDS: string[] = properties.slice(0, 3).map((p) => p.id);

/**
 * Obtém os IDs das propriedades destacadas (armazenadas em localStorage ou padrão)
 */
export function getFeaturedPropertyIds(): string[] {
  if (typeof window === 'undefined') return DEFAULT_FEATURED_IDS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // ignore
  }
  return DEFAULT_FEATURED_IDS;
}

/**
 * Guarda os IDs das propriedades destacadas e notifica os listeners
 */
export function setFeaturedPropertyIds(ids: string[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
    window.dispatchEvent(new CustomEvent('featured_properties_updated', { detail: ids }));
  } catch {
    // ignore
  }
}

/**
 * Alterna o estado de destaque de uma propriedade
 */
export function toggleFeaturedProperty(id: string): string[] {
  const current = getFeaturedPropertyIds();
  let updated: string[];
  if (current.includes(id)) {
    // Não permite remover se for o único destacado
    if (current.length <= 1) {
      return current;
    }
    updated = current.filter((item) => item !== id);
  } else {
    updated = [...current, id];
  }
  setFeaturedPropertyIds(updated);
  return updated;
}

/**
 * Retorna as propriedades destacadas ordenadas
 */
export function getFeaturedProperties(allProperties: Property[]): Property[] {
  const ids = getFeaturedPropertyIds();
  // Mantém a ordem dos IDs selecionados
  const featured = ids
    .map((id) => allProperties.find((p) => p.id === id))
    .filter((p): p is Property => Boolean(p));

  // Fallback caso algum ID não exista
  if (featured.length === 0) {
    return allProperties.slice(0, 3);
  }
  return featured;
}

/**
 * Ordena a lista de propriedades colocando as destacadas no topo da página de Casas
 */
export function sortPropertiesWithFeaturedFirst(allProperties: Property[]): Property[] {
  const ids = getFeaturedPropertyIds();
  const featuredSet = new Set(ids);

  const featuredList = allProperties.filter((p) => featuredSet.has(p.id));
  const nonFeaturedList = allProperties.filter((p) => !featuredSet.has(p.id));

  // Preserva a ordem dos IDs para as destacadas
  featuredList.sort((a, b) => {
    const indexA = ids.indexOf(a.id);
    const indexB = ids.indexOf(b.id);
    return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
  });

  return [...featuredList, ...nonFeaturedList];
}
