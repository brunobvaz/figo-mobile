import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';
import useAuth from '../hooks/useAuth';
import { locationService } from '../services/locationService';
import { getStoredItem, setStoredItem } from '../storage/storage';
import { locationCoordinates, locationRegion, profileLocation } from '../utils/activeLocation';

const ActiveLocationContext = createContext(null);
const FALLBACK_MESSAGE = 'Não foi possível usar a localização atual. Continuamos a usar a localização do teu perfil.';

// Mounted per authenticated user. Only the source preference is persisted, never device coordinates.
export function ActiveLocationProvider({ children }) {
  const { user } = useAuth();
  const key = `figo.locationSource.${user.id}`;
  const profile = useMemo(() => profileLocation(user.location), [user.location]);
  const [resolvedProfile, setResolvedProfile] = useState(null);
  const [device, setDevice] = useState(null);
  const [locating, setLocating] = useState(false);
  const [error, setError] = useState('');
  const generation = useRef(0);
  const source = useRef('profile');
  const writes = useRef(Promise.resolve());
  const persist = useCallback(value => {
    writes.current = writes.current.then(() => setStoredItem(key, value));
  }, [key]);

  useEffect(() => {
    let active = true;
    setResolvedProfile(null);
    locationService.profile(user.location).then(value => {
      if (active) setResolvedProfile({ input: user.location, value });
    }).catch(() => {});
    return () => { active = false; };
  }, [user.location]);

  const selectProfile = useCallback(() => {
    generation.current++;
    source.current = 'profile';
    setDevice(null); setLocating(false); setError(''); persist('profile');
  }, [persist]);
  const selectDevice = useCallback(async (requestPermission = true) => {
    const id = ++generation.current;
    source.current = 'device';
    setLocating(true); setError(''); setDevice(null);
    try {
      const point = await locationService.current({ requestPermission });
      if (id !== generation.current) return;
      setDevice({ ...point, source: 'device' }); persist('device');
    } catch {
      if (id !== generation.current) return;
      source.current = 'profile'; setDevice(null); setError(FALLBACK_MESSAGE); persist('profile');
    } finally { if (id === generation.current) setLocating(false); }
  }, [persist]);

  useEffect(() => {
    const id = generation.current;
    getStoredItem(key, 'profile').then(value => {
      if (id === generation.current && value === 'device') selectDevice(false);
    });
    let previous = AppState.currentState;
    const subscription = AppState.addEventListener('change', next => {
      if (previous !== 'active' && next === 'active' && source.current === 'device') selectDevice(false);
      previous = next;
    });
    return () => { generation.current++; subscription.remove(); };
  }, [key, selectDevice]);

  const activeLocation = device || (resolvedProfile && resolvedProfile.input === user.location ? resolvedProfile.value : profile);
  const coordinates = useMemo(() => locationCoordinates(activeLocation), [activeLocation]);
  const region = useMemo(() => coordinates ? {} : locationRegion(activeLocation), [coordinates, activeLocation]);
  const value = { activeLocation, locationSource: activeLocation.source, coordinates, region,
    profileLocation: profile, locating, error, selectProfile, selectDevice };
  return <ActiveLocationContext.Provider value={value}>{children}</ActiveLocationContext.Provider>;
}

export const useActiveLocation = () => useContext(ActiveLocationContext);
