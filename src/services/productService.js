import { normalizeProductPhotos, photoSubmission } from '../utils/productPhotos';
import { File as ExpoFile } from 'expo-file-system';
import { isProductInSeason } from '../utils/productSeasonality';
import config from '../config/config';
import { api } from './api';

const serverBaseUrl = config.apiBaseUrl.replace(/\/api\/v1\/?$/, '');
const normalizeProduct = (product) => ({
  ...product,
  featured: product.featured === true,
  self_harvest: ['Frutas', 'Legumes'].includes(product.category) && product.self_harvest === true,
  is_active: product.is_active ?? true,
  status: product.status ?? 'active',
  seasonality: product.seasonality ?? 'all_year',
  seasonal: isProductInSeason(product),
  distance: Number.isFinite(product.distanceMeters) ? `${product.locationSource === 'parish' ? '≈ ' : ''}${(product.distanceMeters / 1000).toFixed(1).replace('.', ',')} km` : undefined,
  images: normalizeProductPhotos(product, serverBaseUrl),
  imagesRevision: product.imagesRevision || 0,
  image: normalizeProductPhotos(product, serverBaseUrl)[0]?.uri || null,
  seller: product.seller ? { ...product.seller, avatar: product.seller.avatarFilename ? `${serverBaseUrl}/uploads/avatars/${encodeURIComponent(product.seller.avatarFilename)}` : product.seller.avatar } : product.seller
});
const productForm = (product, photos) => {
  const form = new FormData();
  const fields = ['title', 'description', 'price', 'unit', 'category', 'seasonality', 'status', 'is_active', 'self_harvest'];
  if (product.locationChanged !== false) fields.push('municipalityCode', 'parishCode', 'locality', 'latitude', 'longitude', 'locationSource');
  else if (product.localityChanged) fields.push('locality');
  fields.forEach(key => { if (product[key] != null) form.append(key, String(product[key])); });
  if (Array.isArray(photos)) {
    const { order, uploads } = photoSubmission(photos);
    form.append('imageOrder', JSON.stringify(order));
    form.append('imagesRevision', String(product.imagesRevision || 0));
    uploads.forEach(asset => form.append('images', asset.file || new ExpoFile(asset.uri)));
  } else if (photos) form.append('image', photos.file || new ExpoFile(photos.uri));
  return form;
};

export const productService = {
  async page(params = {}) { const query = new URLSearchParams(Object.entries(params).filter(([, value]) => value !== undefined && value !== '')).toString(); const result = await api.get(`/products?${query}`); return { ...result, items: result.items.map(normalizeProduct) }; },
  async mine(params = {}) { const result = await api.get(`/products/mine?${new URLSearchParams(params)}`); return { ...result, items: result.items.map(normalizeProduct) }; },
  async list(params = {}) { return (await this.page(params)).items; },
  async getById(id) { return normalizeProduct(await api.get(`/products/${id}`)); },
  async create(product, imageAsset) { return normalizeProduct(await api.upload('/products', productForm(product, imageAsset), { timeoutMs: 120000 })); },
  async update(id, product, imageAsset) {
    if (!imageAsset && Object.keys(product).every(key => ['status', 'is_active'].includes(key))) {
      return normalizeProduct(await api.patch(`/products/${id}`, product));
    }
    return normalizeProduct(await api.upload(`/products/${id}`, productForm(product, imageAsset), { method: 'PATCH', timeoutMs: 120000 })); },
  remove: (id) => api.delete(`/products/${id}`)
};
