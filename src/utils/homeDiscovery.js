import { isExplicitlyInSeason } from './productSeasonality';

// Featured selection remains temporary; seasonality follows the saved product availability.
export function discoveryProducts(products) {
  return products.map((product, index) => ({
    ...product,
    featured: product.featured ?? index < 6,
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
