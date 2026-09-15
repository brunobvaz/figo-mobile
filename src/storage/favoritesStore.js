import AsyncStorage from '@react-native-async-storage/async-storage';
import { getStoredItem, setStoredItem } from './storage';
import { createAccountFavoritesStore } from './accountFavorites';
import { STORAGE_KEYS } from '../utils/constants';
export const favoritesStore = createAccountFavoritesStore(getStoredItem, setStoredItem, STORAGE_KEYS.FAVORITES, key => AsyncStorage.removeItem(key));
