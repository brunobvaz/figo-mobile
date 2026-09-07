import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { chatService } from '../services/chatService';

const ChatContext = createContext(null);
export const useChat = () => useContext(ChatContext);
export function ChatProvider({ children }) {
  const [conversations, setConversations] = useState([]);
  const [unreadTotal, setUnreadTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const pages = useRef(1);
  const mounted = useRef(true);
  const inFlight = useRef(null);
  const refresh = useCallback(() => {
    if (inFlight.current) return inFlight.current;
    inFlight.current = (async () => {
      try {
        const results = [];
        for (let page = 1; page <= pages.current; page++) results.push(await chatService.list(page));
        if (!mounted.current) return;
        setConversations([...new Map(results.flatMap((result) => result.items).map((item) => [item.id, item])).values()]);
        setUnreadTotal(results[0].unreadTotal);
        setHasMore(results[0].pagination.total > pages.current * 50);
        setError(null);
      } catch (failure) { if (mounted.current) setError(failure.message); }
      finally { if (mounted.current) setLoading(false); inFlight.current = null; }
    })();
    return inFlight.current;
  }, []);
  const loadMore = useCallback(async () => {
    if (inFlight.current || !hasMore) return;
    pages.current += 1;
    await refresh();
  }, [hasMore, refresh]);
  useEffect(() => {
    mounted.current = true;
    refresh();
    const timer = setInterval(() => { if (AppState.currentState === 'active') refresh(); }, 8000);
    const listener = AppState.addEventListener('change', (state) => { if (state === 'active') refresh(); });
    return () => { mounted.current = false; clearInterval(timer); listener.remove(); };
  }, [refresh]);
  return <ChatContext.Provider value={{ conversations, unreadTotal, loading, error, hasMore, refresh, loadMore }}>{children}</ChatContext.Provider>;
}
