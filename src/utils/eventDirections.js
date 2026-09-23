import { locationCoordinates } from './activeLocation';

export function eventCoordinates(event) {
  if (event?.geo?.type !== 'Point' || !Array.isArray(event.geo.coordinates) || event.geo.coordinates.length !== 2) return null;
  return locationCoordinates({ geo: event.geo });
}

export function eventDirectionsUrl(destination, origin, platform) {
  const end = locationCoordinates(destination);
  const start = origin == null ? null : locationCoordinates(origin);
  if (!end || (origin != null && !start)) throw new Error('Coordenadas inválidas.');
  const coordinates = point => `${point.latitude},${point.longitude}`;
  // Omitting the origin lets the maps app obtain it or ask the user to choose one.
  const params = new URLSearchParams(platform === 'ios'
    ? { daddr: coordinates(end), dirflg: 'd', ...(start ? { saddr: coordinates(start) } : {}) }
    : { api: '1', destination: coordinates(end), travelmode: 'driving', ...(start ? { origin: coordinates(start) } : {}) });
  return `${platform === 'ios' ? 'https://maps.apple.com/' : 'https://www.google.com/maps/dir/'}?${params}`;
}
