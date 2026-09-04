export const formatPrice = (price) => new Intl.NumberFormat('pt-PT', { style: 'currency', currency: 'EUR' }).format(price);
export const formatDate = (value) => new Intl.DateTimeFormat('pt-PT', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(value));
export const formatLocation = (location) => {
  if (!location) return '';
  if (typeof location === 'string') return location;
  return [location.city, location.postalCode].filter(Boolean).join(' · ');
};
