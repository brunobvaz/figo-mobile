/** @typedef {'all_year'|'spring'|'summer'|'autumn'|'winter'} ProductSeasonality */
export const SEASONALITY_OPTIONS = [
  { value: 'all_year', label: 'Todo o ano', icon: 'leaf-outline' },
  { value: 'spring', label: 'Primavera', icon: 'flower-outline' },
  { value: 'summer', label: 'Verão', icon: 'sunny-outline' },
  { value: 'autumn', label: 'Outono', icon: 'leaf-outline' },
  { value: 'winter', label: 'Inverno', icon: 'snow-outline' },
];

// Meteorological seasons in Portugal: Mar–May, Jun–Aug, Sep–Nov, Dec–Feb.
export function currentProductSeason(date = new Date()) {
  const month = date.getMonth();
  if (month >= 2 && month <= 4) return 'spring';
  if (month >= 5 && month <= 7) return 'summer';
  if (month >= 8 && month <= 10) return 'autumn';
  return 'winter';
}

export function isProductInSeason(product, date = new Date()) {
  const seasonality = product.seasonality ?? 'all_year';
  return seasonality === 'all_year' || seasonality === currentProductSeason(date);
}

// Editorial selection is deliberately narrower than general availability.
export function isExplicitlyInSeason(product, season = currentProductSeason()) {
  const seasons = Array.isArray(product.seasons) ? product.seasons : [product.seasonality];
  return season !== 'all_year' && !seasons.includes('all_year') && seasons.includes(season);
}
