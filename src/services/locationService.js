import * as Location from 'expo-location';
import { api } from './api';
export const locationService = {
  municipalities: () => api.get('/locations/municipalities'),
  parishes: code => api.get(`/locations/parishes?municipalityCode=${encodeURIComponent(code)}`),
  async current() {
    const permission = await Location.requestForegroundPermissionsAsync();
    if (!permission.granted) throw new Error('Autoriza a localização nas definições ou pesquisa por concelho e freguesia.');
    if (!await Location.hasServicesEnabledAsync()) throw new Error('Ativa os serviços de localização do dispositivo.');
    const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
    return { latitude: position.coords.latitude, longitude: position.coords.longitude };
  }
};
