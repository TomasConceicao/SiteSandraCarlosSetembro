import { properties as defaultProperties } from '../data/properties';
import { Property } from '../types';

const DEFAULT_FEATURED_IDS: string[] = defaultProperties.slice(0, 3).map((p) => p.id);

/**
 * Retorna as propriedades destacadas ordenadas a partir da lista de IDs guardada no Supabase
 */
export function getFeaturedProperties(
  allProperties: Property[],
  featuredIds: string[] = DEFAULT_FEATURED_IDS
): Property[] {
  const ids = featuredIds && featuredIds.length > 0 ? featuredIds : DEFAULT_FEATURED_IDS;
  const featured = ids
    .map((id) => allProperties.find((p) => p.id === id))
    .filter((p): p is Property => Boolean(p));

  if (featured.length === 0) {
    return allProperties.slice(0, 3);
  }
  return featured;
}

/**
 * Ordena a lista de propriedades colocando as destacadas no topo da página de Imóveis
 */
export function sortPropertiesWithFeaturedFirst(
  allProperties: Property[],
  featuredIds: string[] = DEFAULT_FEATURED_IDS
): Property[] {
  const ids = featuredIds && featuredIds.length > 0 ? featuredIds : DEFAULT_FEATURED_IDS;
  const featuredSet = new Set(ids);

  const featuredList = allProperties.filter((p) => featuredSet.has(p.id));
  const nonFeaturedList = allProperties.filter((p) => !featuredSet.has(p.id));

  featuredList.sort((a, b) => {
    const indexA = ids.indexOf(a.id);
    const indexB = ids.indexOf(b.id);
    return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
  });

  return [...featuredList, ...nonFeaturedList];
}
