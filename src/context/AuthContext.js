import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { authService } from '../services/authService';
import { setUnauthorizedHandler } from '../services/api';

export const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    let active = true;
    setUnauthorizedHandler(() => { if (active) setUser(null); });
    authService.restoreSession()
      .then((currentUser) => { if (active) setUser(currentUser); })
      .catch(() => { if (active) setUser(null); })
      .finally(() => { if (active) setIsLoading(false); });
    return () => { active = false; setUnauthorizedHandler(null); };
  }, []);
  const login = useCallback(async (credentials) => { setIsLoading(true); try { const session = await authService.login(credentials); setUser(session.user); } finally { setIsLoading(false); } }, []);
  const verifyRegistrationOtp = useCallback(async (data) => { setIsLoading(true); try { const session = await authService.verifyRegistrationOtp(data); setUser(session.user); return session; } finally { setIsLoading(false); } }, []);
  const logout = useCallback(async () => { await authService.logout(); setUser(null); }, []);
  const logoutAll = useCallback(async () => { await authService.logoutAll(); setUser(null); }, []);
  const updateProfile = useCallback(async (changes) => { const nextUser = await authService.updateProfile(changes); setUser(nextUser); return nextUser; }, []);
  const updateAvatar = useCallback(async (asset) => { const nextUser = await authService.updateAvatar(asset); setUser(nextUser); return nextUser; }, []);
  const enableSeller = useCallback(async () => { const nextUser = await authService.enableSeller(); setUser(nextUser); return nextUser; }, []);
  const value = useMemo(() => ({ user, isLoading, isAuthenticated: Boolean(user), login, verifyRegistrationOtp, logout, logoutAll, updateProfile, updateAvatar, enableSeller }), [user, isLoading, login, verifyRegistrationOtp, logout, logoutAll, updateProfile, updateAvatar, enableSeller]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
