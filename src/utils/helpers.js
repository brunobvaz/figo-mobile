export const createId = (prefix = 'item') => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
export const normalizeText = (value = '') => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
