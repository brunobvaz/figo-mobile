const cleanName = value => typeof value === 'string'
  ? value.replace(/\b\d{4}-\d{3}\b/g, '').replace(/^[\s,·-]+|[\s,·-]+$/g, '').trim() : '';

export function locationCoordinates(location) {
  const latitude = location?.latitude ?? location?.geo?.coordinates?.[1];
  const longitude = location?.longitude ?? location?.geo?.coordinates?.[0];
  return Number.isFinite(latitude) && Math.abs(latitude) <= 90
    && Number.isFinite(longitude) && Math.abs(longitude) <= 180 ? { latitude, longitude } : null;
}

export function profileLocation(location) {
  return { source: 'profile', ...locationCoordinates(location),
    municipality: cleanName(location?.municipality || location?.municipalityName || location?.city || (typeof location === 'string' ? location : '')),
    parish: cleanName(location?.parish || location?.parishName),
    municipalityCode: location?.municipalityCode,
    parishCode: location?.parishCode };
}

export function locationRegion(location) {
  return location?.municipalityCode ? { municipalityCode: location.municipalityCode,
    ...(location.parishCode ? { parishCode: location.parishCode } : {}) } : {};
}

export function locationLabel(location) {
  return location?.municipality || location?.parish || (location?.source === 'device' ? 'Localização atual' : 'Definir localização');
}

export async function deviceLocation(Location, { requestPermission = true } = {}) {
  let permission = await Location.getForegroundPermissionsAsync();
  if (!permission.granted && requestPermission && permission.canAskAgain !== false) permission = await Location.requestForegroundPermissionsAsync();
  if (!permission.granted) throw new Error('Autoriza a localização nas definições ou pesquisa por concelho e freguesia.');
  if (!await Location.hasServicesEnabledAsync()) throw new Error('Ativa os serviços de localização do dispositivo.');
  let timer;
  try {
    return await Promise.race([
      (async () => {
        const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        const point = locationCoordinates(position.coords);
        if (!point) throw new Error('Localização indisponível.');
        let place;
        try { [place] = await Location.reverseGeocodeAsync(point); } catch { /* Coordinates remain useful without a place name. */ }
        return { ...point, municipality: place?.city || place?.subregion || place?.district, parish: place?.district };
      })(),
      new Promise((_, reject) => { timer = setTimeout(() => reject(new Error('Não foi possível obter a localização a tempo.')), 15000); })
    ]);
  } finally { clearTimeout(timer); }
}
