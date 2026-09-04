import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { productService } from '../services/productService';
import { normalizeText } from '../utils/helpers';
import { formatLocation } from '../utils/formatters';
export const ProductsContext = createContext(null);
export function ProductsProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => { productService.list().then(setProducts).catch(() => setProducts([])).finally(() => setIsLoading(false)); }, []);
  const getProductById = useCallback((id) => products.find((item) => item.id === id), [products]);
  const searchProducts = useCallback((query, category = 'Todos') => { const term = normalizeText(query); return products.filter((item) => (category === 'Todos' || item.category === category) && (!term || normalizeText(`${item.title} ${item.description} ${formatLocation(item.location)} ${item.seller.name}`).includes(term))); }, [products]);
  const filterByCategory = useCallback((category) => category === 'Todos' ? products : products.filter((item) => item.category === category), [products]);
  const createProduct = useCallback(async (data, imageAsset) => { const item = await productService.create(data, imageAsset); setProducts((current) => [item, ...current]); return item; }, []);
  const updateProduct = useCallback(async (id, data, imageAsset) => { const item = await productService.update(id, data, imageAsset); setProducts((current) => current.map((product) => product.id === id ? item : product)); return item; }, []);
  const removeProduct = useCallback(async (id) => { await productService.remove(id); setProducts((current) => current.filter((product) => product.id !== id)); }, []);
  const value = useMemo(() => ({ products, isLoading, getProductById, searchProducts, filterByCategory, createProduct, updateProduct, removeProduct }), [products, isLoading, getProductById, searchProducts, filterByCategory, createProduct, updateProduct, removeProduct]);
  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>;
}
