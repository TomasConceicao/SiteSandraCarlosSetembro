import { Property } from '../types';

/**
 * Utilitários de Otimização Semântica de Imagens e Linkagem de Imóveis (SEO & Performance)
 */

/**
 * Gera um atributo `alt` semântico, rico e contextual para fotografias de imóveis,
 * eliminando descrições vazias ou genéricas e reforçando entidades locais (Pombal, Leiria, etc.).
 */
export function getPropertyImageAlt(
  property: Property,
  index = 0,
  context?: 'cover' | 'gallery' | 'lightbox' | 'thumb' | 'related' | 'card'
): string {
  if (!property) return 'Fotografia de imóvel em Pombal | Sandra Carlos Consultoria Imobiliária';

  const title = property.title?.trim() || 'Imóvel';
  const location = property.location?.trim() || 'Pombal';
  const typology = property.typology?.trim() || 'Imóvel';

  // Contexto 1: Cartão de Imóveis Relacionados
  if (context === 'related') {
    return `Sandra Carlos Consultoria Imobiliária - Sugestão de ${typology}: ${title} em ${location}`;
  }

  // Contexto 2: Capa principal / Fachada / Cartão de Grelha
  if (index === 0 || context === 'cover' || context === 'card') {
    return `Fachada exterior e arquitetura de ${title} (${typology}) em ${location} - Sandra Carlos Consultoria Imobiliária`;
  }

  // Contexto 3: Imagens da galeria interna conforme a sequência visual típica
  const roomLabels = [
    'Fachada principal e envolvente exterior',
    'Ampla sala de estar e áreas de convívio com luminosidade natural',
    'Cozinha moderna com acabamentos de qualidade e zona de refeições',
    'Suíte master com roupeiros embutidos e conforto térmico',
    'Casas de banho com louças modernas e revestimentos nobres',
    'Espaço exterior, varanda privativa e jardim',
    'Garagem fechada e detalhes arquitetónicos exclusivos',
  ];

  const specificLabel = roomLabels[index] || `Pormenor e acabamentos interiores (foto ${index + 1})`;

  return `${specificLabel} de ${title} em ${location} | Sandra Carlos (AMI 15766)`;
}

/**
 * Algoritmo inteligente de seleção e ordenação de imóveis semelhantes:
 * Pontua com base em proximidade geográfica (Pombal / Leiria), tipologia (Moradia vs Apartamento)
 * e escala habitacional para reforçar relevância semântica e combater páginas órfãs.
 */
export function getSimilarProperties(
  currentProperty: Property,
  allProperties: Property[],
  maxCount = 4
): Property[] {
  if (!allProperties || allProperties.length === 0) return [];

  // Exclui o próprio imóvel
  const candidates = allProperties.filter((p) => p.id !== currentProperty.id);

  if (candidates.length <= maxCount) return candidates;

  const currentLoc = (currentProperty.location || '').toLowerCase();
  const currentTypology = (currentProperty.typology || '').toLowerCase();
  const currentBedrooms = Number(currentProperty.bedrooms) || 0;

  const isCurrentMoradia = currentTypology.includes('moradia') || currentTypology.includes('casa');
  const isCurrentApartamento = currentTypology.includes('apartamento');

  const scored = candidates.map((p) => {
    let score = 0;
    const pLoc = (p.location || '').toLowerCase();
    const pTypology = (p.typology || '').toLowerCase();
    const pBedrooms = Number(p.bedrooms) || 0;

    // 1. Relevância Geográfica Local (Pombal, Centro, Louriçal, Leiria)
    if (currentLoc && pLoc) {
      if (pLoc === currentLoc) {
        score += 15;
      } else if (
        (currentLoc.includes('pombal') && pLoc.includes('pombal')) ||
        (currentLoc.includes('leiria') && pLoc.includes('leiria'))
      ) {
        score += 10;
      }
    }

    // 2. Relevância por Tipologia Arquitetónica
    const isCandidateMoradia = pTypology.includes('moradia') || pTypology.includes('casa');
    const isCandidateApartamento = pTypology.includes('apartamento');

    if (isCurrentMoradia && isCandidateMoradia) {
      score += 12;
    } else if (isCurrentApartamento && isCandidateApartamento) {
      score += 12;
    }

    // 3. Proximidade de Quartos / Capacidade Familiar
    if (currentBedrooms > 0 && pBedrooms > 0) {
      const diff = Math.abs(currentBedrooms - pBedrooms);
      if (diff === 0) score += 6;
      else if (diff === 1) score += 3;
    }

    // 4. Bónus de Disponibilidade (imóveis ativos/novidade têm ligeira preferência)
    if (p.status === 'disponivel' || p.status === 'novidade' || p.status === 'new') {
      score += 2;
    }

    return { property: p, score };
  });

  // Ordena por pontuação decrescente
  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, maxCount).map((item) => item.property);
}
