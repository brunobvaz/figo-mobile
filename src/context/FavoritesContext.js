import { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getStoredItem, setStoredItem } from '../storage/storage';
import { createAccountFavoritesStore } from '../storage/accountFavorites';
import { STORAGE_KEYS } from '../utils/constants';
import useAuth from '../hooks/useAuth';
export const FavoritesContext = createContext(null);
const store = createAccountFavoritesStore(getStoredItem, setStoredItem, STORAGE_KEYS.FAVORITES);

export function FavoritesProvider({ children }) {
  const { user } = useAuth();
  return <AccountFavoritesProvider key={user?.id || 'anonymous'} userId={user?.id}>{children}</AccountFavoritesProvider>;
}

function AccountFavoritesProvider({ children, userId }) {
  const [favoriteIds, setFavoriteIds] = useState([]);
  const ids = useRef([]);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    let active = true;
    store.load(userId).then(saved => {
      if (!active) return;
      ids.current = saved;
      setFavoriteIds(saved);
      setIsLoading(false);
    });
    return () => { active = false; };
  }, [userId]);
  const toggleFavorite = useCallback(productId => {
    if (!userId || isLoading) return;
    const current = ids.current;
    const next = current.includes(productId) ? current.filter(id => id !== productId) : [...current, productId];
    ids.current = next;
    setFavoriteIds(next);
    store.save(userId, next);
  }, [userId, isLoading]);
  const isFavorite = useCallback(id => favoriteIds.includes(id), [favoriteIds]);
  const value = useMemo(() => ({ favoriteIds, isLoading, toggleFavorite, isFavorite }), [favoriteIds, isLoading, toggleFavorite, isFavorite]);
  return <FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>;
}
