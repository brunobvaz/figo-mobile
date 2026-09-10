import { parsePrice } from './price';
export const isValidEmail = (email) => /^\S+@\S+\.\S+$/.test(email.trim());
export const isStrongPassword = (password) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{10,128}$/.test(password);
export const validateRequired = (value) => Boolean(String(value || '').trim());
const isValidCoordinate = (value, limit) => value != null && String(value).trim() !== '' && Number.isFinite(Number(value)) && Math.abs(Number(value)) <= limit;

export const validateProductLocation = (product) => {
  if (product.localityChanged && !product.locality?.trim()) return 'Indica a localidade do produto.';
  if (product.locationChanged === false) return '';
  if (!product.municipalityCode) return 'Seleciona o concelho do produto.';
  if (!product.parishCode) return 'Seleciona a freguesia do produto.';
  if (!product.locality?.trim()) return 'Indica a localidade do produto.';
  if (!isValidCoordinate(product.latitude, 90) || !isValidCoordinate(product.longitude, 180)) {
    return 'Não foi possível obter as coordenadas da freguesia. Volta a selecionar a localização antes de guardar.';
  }
  return '';
};

export const validateProduct = (product) => {
  const errors = {};
  ['title', 'description', 'price', 'unit', 'category'].forEach((field) => {
    if (!validateRequired(product[field])) errors[field] = 'Campo obrigatório';
  });
  if (product.price && (!Number.isFinite(parsePrice(product.price)) || parsePrice(product.price) <= 0)) errors.price = 'Indica um preço válido';
  const locationError = validateProductLocation(product);
  if (locationError) errors.location = locationError;
  return errors;
};
