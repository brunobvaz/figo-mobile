import { useEffect, useState } from 'react';
import useProducts from './useProducts';
import { chatService } from '../services/chatService';
import { productService } from '../services/productService';
import { loadConversationProduct } from '../utils/conversationProduct';

export default function useConversationProduct({ conversationId, productId, productTitle, focused }) {
  const { cacheProducts } = useProducts();
  const key = conversationId || productId;
  const [state, setState] = useState(null);
  useEffect(() => {
    if (!focused) return;
    let active = true;
    setState(null);
    loadConversationProduct({ conversationId, productId, productTitle }, chatService, productService).then(result => {
      if (!active) return;
      // ProductDetailsScreen reads this existing cache, including when opened from an old chat.
      if (result.product) cacheProducts([result.product]);
      setState({ ...result, key });
    });
    return () => { active = false; };
  }, [conversationId, productId, productTitle, focused, key, cacheProducts]);
  return state && state.key === key ? { title: state.title, product: state.product, productId: state.productId, loading: false } : { title: productTitle, product: null, loading: true };
}
