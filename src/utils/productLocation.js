export function applyProductAddress(current, patch, parish) {
  const administrativeChange = ['municipalityCode', 'parishCode'].some(key => key in patch && patch[key] !== current[key]);
  if (!administrativeChange) return { ...current, ...patch, localityChanged: true };
  const validPoint = Number.isFinite(parish?.latitude) && Math.abs(parish.latitude) <= 90
    && Number.isFinite(parish?.longitude) && Math.abs(parish.longitude) <= 180
    && parish.code === patch.parishCode && parish.municipalityCode === patch.municipalityCode;
  return {
    ...current, ...patch, locality: '',
    latitude: validPoint ? parish.latitude : '', longitude: validPoint ? parish.longitude : '',
    locationSource: validPoint ? 'parish' : undefined, locationChanged: true
  };
}
