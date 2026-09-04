import { File as ExpoFile } from 'expo-file-system';
import config from '../config/config';
import { api } from './api';

const serverBaseUrl = config.apiBaseUrl.replace(/\/api\/v1\/?$/, '');
const normalizeProduct = (product) => ({
  ...product,
  image: product.imageFilename ? `${serverBaseUrl}/uploads/products/${encodeURIComponent(product.imageFilename)}` : product.image,
  seller: product.seller ? { ...product.seller, avatar: product.seller.avatarFilename ? `${serverBaseUrl}/uploads/avatars/${encodeURIComponent(product.seller.avatarFilename)}` : product.seller.avatar } : product.seller
});
const productForm = (product, imageAsset) => {
  const form = new FormData();
  ['title', 'description', 'price', 'unit', 'category', 'location'].forEach((key) => form.append(key, String(product[key])));
  if (imageAsset) form.append('image', imageAsset.file || new ExpoFile(imageAsset.uri));
  return form;
};

export const productService = {
  async list() { const result = await api.get('/products'); return result.items.map(normalizeProduct); },
  async getById(id) { return normalizeProduct(await api.get(`/products/${id}`)); },
  async create(product, imageAsset) { return normalizeProduct(await api.upload('/products', productForm(product, imageAsset))); },
  async update(id, product, imageAsset) { return normalizeProduct(await api.upload(`/products/${id}`, productForm(product, imageAsset), { method: 'PATCH' })); },
  remove: (id) => api.delete(`/products/${id}`)
};
