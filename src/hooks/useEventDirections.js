import { useEffect, useRef, useState } from 'react';
import { Linking, Platform } from 'react-native';
import * as Location from 'expo-location';
import { useIsFocused } from '@react-navigation/native';
import { deviceLocation } from '../utils/activeLocation';
import { eventCoordinates, eventDirectionsUrl } from '../utils/eventDirections';

const initialState = { pending: false, error: '', chooseOrigin: false };

export default function useEventDirections(eventId) {
  const focused = useIsFocused();
  const [state, setState] = useState(initialState);
  const operation = useRef(null);
  // Keep the action alive across foreground refreshes triggered by a permission dialog,
  // but never open a map after navigating away or switching to another event.
  useEffect(() => {
    setState(initialState);
    return () => { operation.current = null; };
  }, [eventId, focused]);

  async function open(event, { chooseOrigin = false } = {}) {
    if (!focused || operation.current) return;
    const destination = eventCoordinates(event);
    if (!destination) {
      setState({ ...initialState, error: 'Este evento ainda não tem coordenadas disponíveis.' });
      return;
    }
    const request = {};
    operation.current = request;
    setState({ pending: true, error: '', chooseOrigin: false });
    try {
      let origin = null;
      if (!chooseOrigin) {
        try {
          origin = await deviceLocation(Location, { resolveAddress: false });
        } catch {
          if (operation.current === request) setState({ pending: false, chooseOrigin: true,
            error: 'Não foi possível obter a tua localização. Verifica a permissão e os serviços de localização, ou define a origem no mapa.' });
          return;
        }
      }
      if (operation.current !== request) return;
      const url = eventDirectionsUrl(destination, origin, Platform.OS);
      try {
        await Linking.openURL(url);
      } catch {
        // HTTPS also supports the browser if the native Apple Maps handler is absent.
        if (Platform.OS !== 'ios' || operation.current !== request) throw new Error('Mapas indisponíveis.');
        await Linking.openURL(eventDirectionsUrl(destination, origin, 'android'));
      }
      if (operation.current === request) setState(initialState);
    } catch {
      if (operation.current === request) setState({ pending: false, chooseOrigin,
        error: 'Não foi possível abrir o mapa. Tenta novamente.' });
    } finally {
      if (operation.current === request) operation.current = null;
    }
  }
  return { ...state, open };
}
