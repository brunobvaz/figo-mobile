import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { getStoredItem, setStoredItem } from '../storage/storage';
import { STORAGE_KEYS } from '../utils/constants';
export const FavoritesContext = createContext(null);
export function FavoritesProvider({ children }) {
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => { getStoredItem(STORAGE_KEYS.FAVORITES, []).then((ids) => { setFavoriteIds(ids); setIsLoading(false); }); }, []);
  const toggleFavorite = useCallback((productId) => { setFavoriteIds((current) => { const next = current.includes(productId) ? current.filter((id) => id !== productId) : [...current, productId]; setStoredItem(STORAGE_KEYS.FAVORITES, next); return next; }); }, []);
  const isFavorite = useCallback((id) => favoriteIds.includes(id), [favoriteIds]);
  const value = useMemo(() => ({ favoriteIds, isLoading, toggleFavorite, isFavorite }), [favoriteIds, isLoading, toggleFavorite, isFavorite]);
  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}
