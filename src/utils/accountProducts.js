export const belongsToSeller = (product, userId) => Boolean(userId) && String(product.seller?.id || product.seller?._id || product.seller) === String(userId);

export async function loadOwnProducts(service, userId, isActive = () => true) {
  if (!userId) return [];
  const items = new Map();
  let page = 1;
  while (isActive()) {
    const response = await service.page({ sellerId: userId, page, limit: 100 });
    if (!isActive()) return [];
    response.items.filter(item => belongsToSeller(item, userId)).forEach(item => items.set(item.id, item));
    if (page >= response.pagination.pages) break;
    page++;
  }
  return [...items.values()];
}

export async function loadFavoriteProducts(service, ids, isActive = () => true) {
  const items = [];
  const uniqueIds = [...new Set(ids)];
  for (let index = 0; index < uniqueIds.length && isActive(); index += 10) {
    const batch = await Promise.all(uniqueIds.slice(index, index + 10).map(async id => {
      try { return await service.getById(id); }
      catch (error) { if (error.status === 404) return null; throw error; }
    }));
    if (!isActive()) return [];
    items.push(...batch.filter(item => item && uniqueIds.includes(item.id)));
  }
  return items;
}
