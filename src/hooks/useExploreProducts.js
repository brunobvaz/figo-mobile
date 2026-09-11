import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import useProducts from './useProducts';
import { productService } from '../services/productService';
import { discoveryProducts } from '../utils/homeDiscovery';
import { applyEditorialFilters, productQuery } from '../utils/exploreFilters';

export default function useExploreProducts(filters, coordinates, region) {
  const { products, cacheProducts } = useProducts();
  const requestKey = JSON.stringify(productQuery(filters, coordinates, region));
  const [state, setState] = useState({ key: '', items: [], pagination: null, busy: true, error: '' });
  const [retry, setRetry] = useState(0);
  const generation = useRef(0);
  const inFlight = useRef(false);
  const previousSearch = useRef(undefined);
  const fetchPage = useCallback(async (page, id) => {
    if (inFlight.current) return;
    inFlight.current = true;
    setState(current => ({ ...current, busy: true, error: '' }));
    try {
      const response = await productService.page({ ...JSON.parse(requestKey), page });
      if (generation.current !== id) return;
      cacheProducts(response.items);
      setState(current => ({ key: requestKey, items: page === 1 ? response.items
        : [...new Map([...current.items, ...response.items].map(item => [item.id, item])).values()],
      pagination: response.pagination, busy: false, error: '' }));
    } catch (error) {
      if (generation.current === id) setState(current => ({ ...current, busy: false, error: error.message || 'Não foi possível carregar os produtos.' }));
    } finally {
      if (generation.current === id) inFlight.current = false;
    }
  }, [requestKey, cacheProducts]);
  useEffect(() => {
    const id = ++generation.current;
    inFlight.current = false;
    setState({ key: requestKey, items: [], pagination: null, busy: true, error: '' });
    const search = JSON.parse(requestKey).search;
    const delay = previousSearch.current !== undefined && search !== previousSearch.current ? 300 : 0;
    previousSearch.current = search || '';
    const timer = setTimeout(() => fetchPage(1, id), delay);
    return () => { clearTimeout(timer); generation.current++; };
  }, [requestKey, fetchPage, retry]);
  const current = state.key === requestKey;
  const editorial = useMemo(() => discoveryProducts(products), [products]);
  const visible = useMemo(() => current ? applyEditorialFilters(state.items, filters, editorial) : [],
    [current, state.items, filters.featured, filters.seasonal, editorial]);
  const hasMore = current && state.pagination?.page < state.pagination?.pages;
  return {
    products: visible, busy: !current || state.busy, error: current ? state.error : '',
    total: current ? state.pagination?.total : undefined,
    hasMore,
    loadMore: () => { if (current && !state.busy && hasMore) fetchPage(state.pagination.page + 1, generation.current); },
    retry: () => state.items.length && hasMore ? fetchPage(state.pagination.page + 1, generation.current) : setRetry(value => value + 1),
  };
}
