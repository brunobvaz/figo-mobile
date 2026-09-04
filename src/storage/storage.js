import AsyncStorage from '@react-native-async-storage/async-storage';
export const getStoredItem = async (key, fallback = null) => { try { const value = await AsyncStorage.getItem(key); return value ? JSON.parse(value) : fallback; } catch (error) { console.warn(`Não foi possível ler ${key}`, error); return fallback; } };
export const setStoredItem = async (key, value) => { try { await AsyncStorage.setItem(key, JSON.stringify(value)); } catch (error) { console.warn(`Não foi possível guardar ${key}`, error); } };
export const removeStoredItem = async (key) => { try { await AsyncStorage.removeItem(key); } catch (error) { console.warn(`Não foi possível remover ${key}`, error); } };
