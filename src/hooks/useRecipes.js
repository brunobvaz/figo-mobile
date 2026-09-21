import { useCallback, useEffect, useRef, useState } from 'react';
import useActiveScreen from './useActiveScreen';
import { editorialService } from '../services/editorialService';

export default function useRecipes(filter) {
  const active = useActiveScreen();
  const [state, setState] = useState({ filter, items: [], pagination: null, busy: true, refreshing: false, error: '' });
  const generation = useRef(0);
  const inFlight = useRef(null);
  const failedPage = useRef(1);
  const load = useCallback((page, version, refreshing = false) => {
    if (generation.current !== version) return Promise.resolve();
    if (inFlight.current) {
      // A pull-to-refresh during pagination must still refresh the first page.
      if (page === 1 && inFlight.current.page > 1)
        return inFlight.current.promise.then(() => load(1, version, refreshing));
      return inFlight.current.promise;
    }
    const request = { page, promise: null };
    inFlight.current = request;
    failedPage.current = page;
    setState(current => ({ ...current, busy: true, refreshing, error: '' }));
    request.promise = (async () => {
      try {
        const result = await editorialService.getSeasonalRecipes({ filter, page });
        if (generation.current !== version) return;
        setState(current => ({ filter,
          items: [...new Map([...(page === 1 ? [] : current.items), ...result.items].map(item => [item.id, item])).values()],
          pagination: result.pagination, busy: false, refreshing: false, error: '' }));
      } catch (failure) {
        if (generation.current === version) setState(current => ({ ...current, error: failure.message || 'Não foi possível carregar as receitas. Tenta novamente.' }));
      } finally {
        if (generation.current === version) {
          inFlight.current = null;
          setState(current => ({ ...current, busy: false, refreshing: false }));
        }
      }
    })();
    return request.promise;
  }, [filter]);
  useEffect(() => {
    if (!active) return;
    const version = ++generation.current;
    inFlight.current = null;
    failedPage.current = 1;
    setState({ filter, items: [], pagination: null, busy: true, refreshing: false, error: '' });
    load(1, version);
    return () => { generation.current++; };
  }, [active, filter, load]);
  const current = state.filter === filter;
  const hasMore = current && state.pagination?.page < state.pagination?.pages;
  return {
    items: current ? state.items : [], busy: !current || state.busy,
    refreshing: active && current && state.refreshing, error: current ? state.error : '', hasMore,
    refresh: () => active ? load(1, generation.current, true) : Promise.resolve(),
    retry: () => active ? load(failedPage.current, generation.current) : Promise.resolve(),
    loadMore: () => { if (active && current && hasMore && !state.busy) return load(state.pagination.page + 1, generation.current); }
  };
}
