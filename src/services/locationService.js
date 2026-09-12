import * as Location from 'expo-location';
import { api } from './api';
import { deviceLocation, locationCoordinates, profileLocation } from '../utils/activeLocation';
export const locationService = {
  municipalities: () => api.get('/locations/municipalities'),
  parishes: code => api.get(`/locations/parishes?municipalityCode=${encodeURIComponent(code)}`),
  async profile(location) {
    const result = profileLocation(location);
    if (locationCoordinates(result)) return result;
    if ((!result.municipalityCode && result.municipality) || (result.municipalityCode && !result.parishCode)) {
      const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
      const { items } = await this.municipalities();
      const matches = items.filter(item => result.municipalityCode ? item.code === result.municipalityCode : normalize(item.name) === normalize(result.municipality));
      if (matches.length === 1) Object.assign(result, locationCoordinates(matches[0]), { municipalityCode: matches[0].code, municipality: matches[0].name });
    }
    if (result.municipalityCode && result.parishCode) {
      const { items } = await this.parishes(result.municipalityCode);
      const parish = items.find(item => item.code === result.parishCode);
      if (parish) Object.assign(result, locationCoordinates(parish), { parish: parish.name });
    }
    return result;
  },
  current: options => deviceLocation(Location, options)
};
