import { fetch as expoFetch } from 'expo/fetch';
import config from '../config/config';
import { tokenStorage } from '../storage/tokenStorage';

let refreshPromise = null;
let unauthorizedHandler = null;
export const setUnauthorizedHandler = (handler) => { unauthorizedHandler = handler; };

const parseResponse = async (response) => {
  const text = await response.text();
  if (!text) return null;
  try { return JSON.parse(text); } catch { throw new Error('A API devolveu uma resposta inválida.'); }
};

const refreshTokens = async () => {
  const refreshToken = await tokenStorage.getRefreshToken();
  if (!refreshToken) throw new Error('A sessão expirou.');
  const response = await fetch(`${config.apiBaseUrl}/auth/refresh`, {
    method: 'POST', headers: { Accept: 'application/json', 'Content-Type': 'application/json' }, body: JSON.stringify({ refreshToken })
  });
  const payload = await parseResponse(response);
  if (!response.ok) { const error = new Error(payload?.error?.message || 'A sessão expirou.'); error.code = payload?.error?.code; error.status = response.status; throw error; }
  await tokenStorage.save(payload.data);
  return payload.data.accessToken;
};

const request = async (path, options = {}, allowRefresh = true) => {
  const { timeoutMs = config.requestTimeout, ...fetchOptions } = options;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const accessToken = await tokenStorage.getAccessToken();
    const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
    // Expo File multipart bodies need Expo's serializer to include their bytes.
    const requestFetch = isFormData ? expoFetch : fetch;
    const response = await requestFetch(`${config.apiBaseUrl}${path}`, {
      ...fetchOptions,
      signal: controller.signal,
      headers: { Accept: 'application/json', ...(!isFormData ? { 'Content-Type': 'application/json' } : {}), ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}), ...options.headers },
    });
    const payload = await parseResponse(response);
    const canRefresh = response.status === 401 && allowRefresh && !path.startsWith('/auth/login') && !path.startsWith('/auth/refresh') && !path.startsWith('/auth/account/') && payload?.error?.code !== 'AUTH_INVALID_CURRENT_PASSWORD';
    if (canRefresh && await tokenStorage.getRefreshToken()) {
      try {
        refreshPromise ||= refreshTokens().finally(() => { refreshPromise = null; });
        await refreshPromise;
        return request(path, options, false);
      } catch (error) {
        if (!error.status) throw error;
        await tokenStorage.clear();
        await unauthorizedHandler?.(error.code);
        throw error;
      }
    }
    if (!response.ok) {
      if (accessToken && !path.startsWith('/auth/account/') && !path.startsWith('/auth/login') && ['USER_DEACTIVATED', 'USER_DELETED', 'USER_DELETION_PENDING', 'USER_SUSPENDED'].includes(payload?.error?.code)) {
        await tokenStorage.clear();
        await unauthorizedHandler?.(payload.error.code);
      }
      const error = new Error(payload?.error?.message || 'Não foi possível concluir o pedido.');
      error.code = payload?.error?.code;
      error.status = response.status;
      error.details = payload?.error?.details;
      throw error;
    }
    return payload?.data;
  } catch (error) {
    if (controller.signal.aborted || error.name === 'AbortError') throw new Error('O pedido demorou demasiado tempo.');
    if (error instanceof TypeError && /network request failed|failed to fetch|networkerror|load failed|network connection/i.test(error.message)) {
      throw new Error(`Não foi possível ligar a ${new URL(config.apiBaseUrl).host}. Tenta novamente por Wi-Fi ou dados móveis.`);
    }
    throw error;
  } finally { clearTimeout(timeout); }
};

export const api = {
  get: (path, options) => request(path, { ...options, method: 'GET' }),
  post: (path, body, options) => request(path, { ...options, method: 'POST', body: JSON.stringify(body) }),
  upload: (path, formData, options = {}) => request(path, { ...options, method: options.method || 'POST', body: formData }),
  patch: (path, body, options) => request(path, { ...options, method: 'PATCH', body: JSON.stringify(body) }),
  put: (path, body, options) => request(path, { ...options, method: 'PUT', body: JSON.stringify(body) }),
  delete: (path, options) => request(path, { ...options, method: 'DELETE' }),
};
