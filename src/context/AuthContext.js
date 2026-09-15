import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { authService } from '../services/authService';
import { clearPushUser, setPushUser } from '../services/pushNotifications';
import { setUnauthorizedHandler } from '../services/api';
import { tokenStorage } from '../storage/tokenStorage';
import { accountClosureStorage } from '../storage/accountClosureStorage';
import { favoritesStore } from '../storage/favoritesStore';

export const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accountClosure, setAccountClosure] = useState(null);
  const [pendingDeletion, setPendingDeletion] = useState(null);
  const [isRestoring, setIsRestoring] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    let active = true;
    const unauthorized = async code => {
      clearPushUser();
      if (active) setUser(null);
      if (['USER_DELETED', 'USER_DELETION_PENDING'].includes(code)) {
        await favoritesStore.clear(await tokenStorage.getAccountId());
      }
    };
    setUnauthorizedHandler(unauthorized);
    (async () => {
      const closure = await accountClosureStorage.read();
      if (closure) {
        if (active) setPendingDeletion(closure);
        const previousId = await tokenStorage.getAccountId();
        if (!(await tokenStorage.getRefreshToken()) || previousId === closure.userId) {
          if (active) setAccountClosure(closure);
          await tokenStorage.clear(); return;
        }
      }
      const currentUser = await authService.restoreSession();
      if (active) setUser(currentUser);
    })().catch(async error => {
      if (active) setUser(null);
      if (error.status === 401 || error.status === 403) { await tokenStorage.clear(); await unauthorized(error.code); }
    }).finally(() => { if (active) { setIsLoading(false); setIsRestoring(false); } });
    return () => { active = false; setUnauthorizedHandler(null); };
  }, []);
  const login = useCallback(async credentials => { setIsLoading(true); try { const session = await authService.login(credentials); setUser(session.user); } finally { setIsLoading(false); } }, []);
  const reactivate = useCallback(async credentials => { setIsLoading(true); try { const session = await authService.reactivate(credentials); setUser(session.user); } finally { setIsLoading(false); } }, []);
  const closeAccount = useCallback(async (mode, credentials) => {
    const result = await authService.closeAccount(mode, credentials);
    clearPushUser();
    // Unmount authenticated screens immediately; no further local writes.
    setUser(null); setAccountClosure(result);
    if (result.receipt) setPendingDeletion(result);
    await tokenStorage.clear();
    if (mode === 'delete' && result.status !== 'requesting') await favoritesStore.clear(result.userId);
    return result;
  }, []);
  const dismissAccountClosure = useCallback(async (keepReceipt = false) => {
    if (!keepReceipt) { await accountClosureStorage.clear(); setPendingDeletion(null); }
    setAccountClosure(null);
  }, []);
  const showAccountClosure = useCallback(() => { if (pendingDeletion) setAccountClosure(pendingDeletion); }, [pendingDeletion]);
  const verifyRegistrationOtp = useCallback(async data => { setIsLoading(true); try { const session = await authService.verifyRegistrationOtp(data); setUser(session.user); return session; } finally { setIsLoading(false); } }, []);
  const logout = useCallback(async () => { try { await authService.logout(); setUser(null); } catch (error) { setPushUser(user?.id); throw error; } }, [user?.id]);
  const logoutAll = useCallback(async () => { try { await authService.logoutAll(); setUser(null); } catch (error) { setPushUser(user?.id); throw error; } }, [user?.id]);
  const updateProfile = useCallback(async changes => { const nextUser = await authService.updateProfile(changes); setUser(current => current?.id === nextUser.id ? nextUser : current); return nextUser; }, []);
  const updateAvatar = useCallback(async asset => { const nextUser = await authService.updateAvatar(asset); setUser(current => current?.id === nextUser.id ? nextUser : current); return nextUser; }, []);
  const value = useMemo(() => ({ user, accountClosure, pendingDeletion, showAccountClosure, dismissAccountClosure, closeAccount, reactivate, isLoading, isRestoring, isAuthenticated: Boolean(user), login, verifyRegistrationOtp, logout, logoutAll, updateProfile, updateAvatar }), [user, accountClosure, pendingDeletion, showAccountClosure, dismissAccountClosure, closeAccount, reactivate, isLoading, isRestoring, login, verifyRegistrationOtp, logout, logoutAll, updateProfile, updateAvatar]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
