import { useEffect, useState } from 'react';
import useActiveScreen from './useActiveScreen';
import { recipeService } from '../services/recipeService';

export default function useRecipe(id) {
  const active = useActiveScreen();
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState({ id, recipe: null, busy: true, error: '', notFound: false });
  useEffect(() => {
    if (!active) return;
    let cancelled = false;
    setState({ id, recipe: null, busy: true, error: '', notFound: false });
    async function load() {
      try {
        if (!id) throw Object.assign(new Error('Esta receita já não está disponível.'), { status: 404 });
        const recipe = await recipeService.detail(id);
        if (!cancelled) setState({ id, recipe, busy: false, error: '', notFound: false });
      } catch (failure) {
        if (!cancelled) setState({ id, recipe: null, busy: false,
          error: failure.message || 'Não foi possível carregar a receita. Tenta novamente.', notFound: failure.status === 404 });
      }
    }
    load();
    return () => { cancelled = true; };
  }, [id, active, attempt]);
  return { ...state, recipe: state.id === id ? state.recipe : null, busy: state.id !== id || state.busy,
    retry: () => setAttempt(value => value + 1) };
}
