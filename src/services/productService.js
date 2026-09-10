import { File as ExpoFile } from 'expo-file-system';
import config from '../config/config';
import { api } from './api';

const serverBaseUrl = config.apiBaseUrl.replace(/\/api\/v1\/?$/, '');
const normalizeProduct = (product) => ({
  ...product,
  distance: Number.isFinite(product.distanceMeters) ? `${product.locationSource === 'parish' ? '≈ ' : ''}${(product.distanceMeters / 1000).toFixed(1).replace('.', ',')} km` : undefined,
  image: product.imageFilename ? `${serverBaseUrl}/uploads/products/${encodeURIComponent(product.imageFilename)}` : product.image,
  seller: product.seller ? { ...product.seller, avatar: product.seller.avatarFilename ? `${serverBaseUrl}/uploads/avatars/${encodeURIComponent(product.seller.avatarFilename)}` : product.seller.avatar } : product.seller
});
const productForm = (product, imageAsset) => {
  const form = new FormData();
  const fields = ['title', 'description', 'price', 'unit', 'category'];
  if (product.locationChanged !== false) fields.push('municipalityCode', 'parishCode', 'locality', 'latitude', 'longitude', 'locationSource');
  else if (product.localityChanged) fields.push('locality');
  fields.forEach(key => { if (product[key] != null) form.append(key, String(product[key])); });
  if (imageAsset) form.append('image', imageAsset.file || new ExpoFile(imageAsset.uri));
  return form;
};

export const productService = {
  async page(params = {}) { const query = new URLSearchParams(Object.entries(params).filter(([, value]) => value !== undefined && value !== '')).toString(); const result = await api.get(`/products?${query}`); return { ...result, items: result.items.map(normalizeProduct) }; },
  async list(params = {}) { return (await this.page(params)).items; },
  async getById(id) { return normalizeProduct(await api.get(`/products/${id}`)); },
  async create(product, imageAsset) { return normalizeProduct(await api.upload('/products', productForm(product, imageAsset))); },
  async update(id, product, imageAsset) { return normalizeProduct(await api.upload(`/products/${id}`, productForm(product, imageAsset), { method: 'PATCH' })); },
  remove: (id) => api.delete(`/products/${id}`)
};
