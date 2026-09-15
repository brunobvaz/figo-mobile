export const MAX_PRODUCT_PHOTOS = 6;
export const MAX_PHOTO_BYTES = 5 * 1024 * 1024;

export function normalizeProductPhotos(product, serverBaseUrl) {
  const source = product.images?.length ? product.images : product.imageFilename ? [{ filename: product.imageFilename }] : product.image ? [{ url: product.image }] : [];
  return source.map(photo => ({ ...photo, uri: photo.filename ? `${serverBaseUrl}/uploads/products/${encodeURIComponent(photo.filename)}` : photo.url })).filter(photo => photo.uri);
}
export const editableProductPhotos = product => (product?.images || []).map(photo => ({ ...photo, key: photo.filename || photo.url }));

export function addSelectedPhotos(current, assets) {
  const next = [...current];
  let tooLarge = 0, unsupported = 0, excess = 0;
  for (const asset of assets) {
    const key = asset.assetId || asset.uri;
    if (next.some(photo => photo.key === key || photo.uri === asset.uri)) continue;
    if ((asset.fileSize || asset.file?.size || 0) > MAX_PHOTO_BYTES) { tooLarge++; continue; }
    if (asset.mimeType && !['image/jpeg', 'image/png', 'image/webp'].includes(asset.mimeType)) { unsupported++; continue; }
    if (next.length >= MAX_PRODUCT_PHOTOS) { excess++; continue; }
    next.push({ key, uri: asset.uri, asset });
  }
  return { photos: next, tooLarge, unsupported, excess };
}
export function photoSubmission(photos) {
  const uploads = [];
  const order = photos.map(photo => {
    if (photo.asset) { const upload = uploads.length; uploads.push(photo.asset); return { upload }; }
    return photo.filename ? { filename: photo.filename } : { url: photo.url };
  });
  return { order, uploads };
}
