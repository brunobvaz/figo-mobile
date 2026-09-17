import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import useProducts from './useProducts';
import useActiveScreen from './useActiveScreen';
import { productService } from '../services/productService';
import { applyEditorialFilters, productQuery } from '../utils/exploreFilters';

export default function useExploreProducts(filters, coordinates, region, enabled = true) {
  const { products, cacheProducts } = useProducts();
  const screenActive = useActiveScreen();
  const active = enabled && screenActive;
  const requestKey = JSON.stringify(productQuery(filters, coordinates, region));
  const [state, setState] = useState({ key: '', items: [], pagination: null, busy: true, refreshing: false, error: '' });
  const generation = useRef(0);
  const inFlight = useRef(null);
  const loadedPages = useRef(1);
  const previousKey = useRef(null);
  const previousSearch = useRef(undefined);
  const failedPage = useRef(1);
  const fetchPage = useCallback((page, id, manual = false) => {
    if (generation.current !== id) return Promise.resolve();
    if (inFlight.current) {
      if (manual) setState(current => ({ ...current, refreshing: true }));
      // A pull or foreground refresh must still reload the first page if a
      // pagination request is running. Other refreshes share the same request.
      if (page === 1 && inFlight.current.page > 1) {
        return inFlight.current.promise.then(() => fetchPage(1, id, manual));
      }
      return inFlight.current.promise;
    }
    const request = { page, promise: null };
    inFlight.current = request;
    setState(current => ({ ...current, busy: true, refreshing: manual, error: '' }));
    request.promise = (async () => {
      try {
        const items = [];
        let pagination;
        // Revalidate all loaded pages so new/deleted adverts do not leave gaps
        // or discard products the user has already scrolled to.
        const lastPage = page === 1 ? loadedPages.current : page;
        for (let nextPage = page; nextPage <= lastPage; nextPage++) {
          const response = await productService.page({ ...JSON.parse(requestKey), page: nextPage });
          if (generation.current !== id) return;
          items.push(...response.items);
          pagination = response.pagination;
          if (nextPage >= pagination.pages) break;
        }
        cacheProducts(items);
        loadedPages.current = pagination.page;
        failedPage.current = 1;
        setState(current => ({ key: requestKey,
          items: [...new Map([...(page === 1 ? [] : current.items), ...items].map(item => [item.id, item])).values()],
          pagination, busy: false, refreshing: false, error: '' }));
      } catch (error) {
        if (generation.current === id) {
          failedPage.current = page;
          setState(current => ({ ...current, error: error.message || 'Não foi possível carregar os produtos.' }));
        }
      } finally {
        if (generation.current === id) {
          inFlight.current = null;
          setState(current => ({ ...current, busy: false, refreshing: false }));
        }
      }
    })();
    return request.promise;
  }, [requestKey, cacheProducts]);
  useEffect(() => {
    if (!active) return;
    const id = ++generation.current;
    inFlight.current = null;
    if (previousKey.current !== requestKey) loadedPages.current = 1;
    previousKey.current = requestKey;
    setState(current => current.key === requestKey
      ? { ...current, busy: true, refreshing: false, error: '' }
      : { key: requestKey, items: [], pagination: null, busy: true, refreshing: false, error: '' });
    const search = JSON.parse(requestKey).search || '';
    const delay = previousSearch.current !== undefined && search !== previousSearch.current ? 300 : 0;
    previousSearch.current = search;
    const timer = setTimeout(() => fetchPage(1, id), delay);
    const poll = setInterval(() => fetchPage(1, id), 30000);
    return () => { clearTimeout(timer); clearInterval(poll); generation.current++; };
  }, [requestKey, fetchPage, active]);
  const refresh = useCallback(() => active ? fetchPage(1, generation.current, true) : Promise.resolve(), [active, fetchPage]);
  const current = enabled && state.key === requestKey;
  const visible = useMemo(() => current ? applyEditorialFilters(state.items.map(item => products.find(cached => cached.id === item.id) || item).filter(item => item.is_active !== false && item.status !== 'deleted' && (!filters.availableOnly || item.status === 'active')), filters) : [],
    [current, state.items, products, filters.availableOnly, filters.featured, filters.seasonal, filters.season]);
  const hasMore = current && state.pagination?.page < state.pagination?.pages;
  return {
    products: visible, busy: enabled && (!current || state.busy), error: current ? state.error : '',
    refreshing: active && current && state.refreshing,
    refresh,
    total: current ? state.pagination?.total : undefined,
    hasMore,
    loadMore: () => { if (active && current && !state.busy && hasMore) return fetchPage(state.pagination.page + 1, generation.current); },
    retry: () => { if (active) return fetchPage(failedPage.current, generation.current); },
  };
}
