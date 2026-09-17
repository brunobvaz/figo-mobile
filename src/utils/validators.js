import { parsePrice } from './price';
export const isValidEmail = (email) => /^\S+@\S+\.\S+$/.test(email.trim());
export const isStrongPassword = (password) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{10,128}$/.test(password);
export const validateRequired = (value) => Boolean(String(value || '').trim());
const isValidCoordinate = (value, limit) => value != null && String(value).trim() !== '' && Number.isFinite(Number(value)) && Math.abs(Number(value)) <= limit;

export const validateProductLocation = (product) => {
  if (product.localityChanged && !product.locality?.trim()) return 'Indica a localidade do produto.';
  if ((product.localityChanged || product.locationChanged !== false) && product.locality?.trim().length > 120) return 'A localidade pode ter até 120 caracteres.';
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
  const titleLength = product.title?.trim().length || 0;
  const descriptionLength = product.description?.trim().length || 0;
  if (titleLength && (titleLength < 2 || titleLength > 120)) errors.title = 'O título deve ter entre 2 e 120 caracteres.';
  if (descriptionLength && (descriptionLength < 10 || descriptionLength > 2000)) errors.description = 'A descrição deve ter entre 10 e 2000 caracteres.';
  if (product.price && (!Number.isFinite(parsePrice(product.price)) || parsePrice(product.price) <= 0)) errors.price = 'Indica um preço válido';
  else if (parsePrice(product.price) > 1_000_000) errors.price = 'O preço não pode ultrapassar 1 000 000 €.';
  const locationError = validateProductLocation(product);
  if (locationError) errors.location = locationError;
  return errors;
};
