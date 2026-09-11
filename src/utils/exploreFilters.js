import { parsePrice } from './price';

export const SORT_OPTIONS = [
  ['distance', 'Mais próximos'], ['recent', 'Mais recentes'],
  ['price_asc', 'Preço mais baixo'], ['price_desc', 'Preço mais alto'],
];
export const DISTANCES = [2, 5, 10, 25, 50];
export const UNITS = ['€/kg', '€/unidade', '€/dúzia', '€/caixa', '€/frasco'];

export function productQuery(filters, coordinates, region = {}) {
  const proximity = filters.radiusKm != null || filters.sortBy === 'distance';
  return {
    search: filters.query?.trim() || undefined,
    category: filters.category === 'Todos' ? undefined : filters.category,
    minPrice: filters.minPrice, maxPrice: filters.maxPrice,
    radiusKm: proximity && coordinates ? filters.radiusKm : undefined,
    ...(proximity && coordinates ? coordinates : {}),
    ...region,
    sort: filters.sortBy === 'distance' && !coordinates ? 'recent' : filters.sortBy || 'recent',
    availableOnly: filters.availableOnly || undefined,
    unit: filters.unit || undefined, sellerId: filters.sellerId || undefined,
    limit: 20,
  };
}

export function parsePriceRange(minimum, maximum) {
  const parse = text => text.trim() === '' ? undefined : parsePrice(text);
  const minPrice = parse(minimum), maxPrice = parse(maximum);
  if ([minPrice, maxPrice].some(value => value !== undefined && (!Number.isFinite(value) || value < 0 || value > 1000000))) {
    return { error: 'Indica preços entre 0 e 1 000 000 €.' };
  }
  if (minPrice !== undefined && maxPrice !== undefined && minPrice > maxPrice) {
    return { error: 'O preço mínimo não pode ser superior ao máximo.' };
  }
  return { minPrice, maxPrice };
}

export function resetExploreFilters(filters) {
  return { viewMode: filters.viewMode || 'list' };
}

// Temporary editorial metadata shared with Home; never assigns featured by result order.
export function applyEditorialFilters(items, filters, editorialProducts) {
  const metadata = new Map(editorialProducts.map(item => [item.id, item]));
  return items.map(item => ({ ...item,
    featured: item.featured ?? metadata.get(item.id)?.featured ?? false,
    seasonal: metadata.get(item.id)?.seasonal ?? item.seasonal ?? false,
  })).filter(item => (!filters.featured || item.featured) && (!filters.seasonal || item.seasonal));
}

export function hasExploreFilters(filters) {
  return Boolean(filters.query || (filters.category && filters.category !== 'Todos') || filters.minPrice != null
    || filters.maxPrice != null || filters.radiusKm != null || filters.featured || filters.seasonal
    || filters.availableOnly || filters.sellerId || filters.unit || (filters.sortBy && filters.sortBy !== 'recent'));
}

export function parishMarkers(products, parishes) {
  const groups = new Map();
  for (const product of products) {
    const parish = parishes.get(product.address?.parishCode);
    if (!parish || !Number.isFinite(parish.latitude) || !Number.isFinite(parish.longitude)
      || Math.abs(parish.latitude) > 90 || Math.abs(parish.longitude) > 180) continue;
    const key = `${parish.latitude}:${parish.longitude}`;
    if (!groups.has(key)) groups.set(key, { id: key, coordinate: { latitude: parish.latitude, longitude: parish.longitude }, products: [] });
    groups.get(key).products.push(product);
  }
  return [...groups.values()];
}
