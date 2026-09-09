export const parsePrice = value => {
  const text = String(value ?? '').trim();
  return /^\d+(?:[.,]\d{1,2})?$/.test(text) ? Number(text.replace(',', '.')) : NaN;
};
export const formatPriceInput = value => {
  const price = parsePrice(value);
  return Number.isFinite(price) ? price.toFixed(2).replace('.', ',') : String(value ?? '');
};
