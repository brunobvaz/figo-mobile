// The persisted conversation owns the association; route hints only serve a chat being created.
export async function loadConversationProduct({ conversationId, productId, productTitle }, chatService, productService) {
  let title = productTitle || 'Produto indisponível';
  let associatedId;
  try {
    if (conversationId) {
      const conversation = await chatService.detail(conversationId);
      associatedId = conversation.productId;
      title = conversation.productTitle || title;
    } else associatedId = productId;
    if (!associatedId) return { title, product: null };
    const product = await productService.getById(associatedId);
    return { title: product.title || title, product, productId: associatedId };
  } catch {
    return { title, product: null, productId: associatedId };
  }
}

export function canOpenConversationProduct(product) {
  return Boolean(product && ['active', 'sold'].includes(product.status));
}
