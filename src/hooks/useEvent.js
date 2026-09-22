import { useEffect, useState } from 'react';
import useActiveScreen from './useActiveScreen';
import { eventService } from '../services/eventService';

export default function useEvent(id) {
  const active = useActiveScreen();
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState({ id, event: null, busy: true, error: '', notFound: false });
  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    setState({ id, event: null, busy: true, error: '', notFound: false });
    async function load() {
      try {
        if (!id) throw Object.assign(new Error('Este evento já não está disponível.'), { status: 404 });
        const event = await eventService.detail(id);
        if (!cancelled) setState({ id, event, busy: false, error: '', notFound: false });
      } catch (failure) {
        if (!cancelled) setState({ id, event: null, busy: false,
          error: failure.message || 'Não foi possível carregar o evento. Tenta novamente.', notFound: failure.status === 404 });
      }
    }
    load();
    return () => { cancelled = true; };
  }, [id, active, attempt]);
  return { ...state, event: state.id === id ? state.event : null, busy: state.id !== id || state.busy,
    retry: () => setAttempt(value => value + 1) };
}
