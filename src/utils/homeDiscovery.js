import { isExplicitlyInSeason } from './productSeasonality';

// Editorial selection is explicit in the API; old adverts are never featured automatically.
export function discoveryProducts(products) {
  return products.filter(product => product.is_active !== false && product.status !== 'deleted').map(product => ({
    ...product,
    featured: product.featured === true,
    seasonal: isExplicitlyInSeason(product),
  }));
}

export function nearbyProducts(products) {
  return [...products].sort((a, b) =>
    (Number.isFinite(a.distanceMeters) ? a.distanceMeters : Infinity)
    - (Number.isFinite(b.distanceMeters) ? b.distanceMeters : Infinity));
}

export const quickCategories = [
  ['Frutas', '🍊'], ['Legumes', '🥬'], ['Ovos', '🥚'],
  ['Mel', '🍯'], ['Laticínios', '🧀'], ['Mais', '•••'],
];
