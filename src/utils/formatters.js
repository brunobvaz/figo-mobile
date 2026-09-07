export const formatPrice = (price) => new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(price);
export const formatDate = (value) => {
  if (value === null || value === undefined || value === '') return '';
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return '';
  return new Intl.DateTimeFormat('pt-PT', { day: 'numeric', month: 'short', year: 'numeric' }).format(date);
};
export const formatLocation = (location) => {
  if (!location) return '';
  if (typeof location === 'string') return location;
  return [location.city, location.postalCode].filter(Boolean).join(' · ');
};
