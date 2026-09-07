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
  if (!response.ok) throw new Error(payload?.error?.message || 'A sessão expirou.');
  await tokenStorage.save(payload.data);
  return payload.data.accessToken;
};

const request = async (path, options = {}, allowRefresh = true) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.requestTimeout);
  try {
    const accessToken = await tokenStorage.getAccessToken();
    const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
    // Expo File multipart bodies need Expo's serializer to include their bytes.
    const requestFetch = isFormData ? expoFetch : fetch;
    const response = await requestFetch(`${config.apiBaseUrl}${path}`, {
      ...options,
      signal: controller.signal,
      headers: { Accept: 'application/json', ...(!isFormData ? { 'Content-Type': 'application/json' } : {}), ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}), ...options.headers },
    });
    const payload = await parseResponse(response);
    const canRefresh = response.status === 401 && allowRefresh && !path.startsWith('/auth/login') && !path.startsWith('/auth/refresh');
    if (canRefresh && await tokenStorage.getRefreshToken()) {
      try {
        refreshPromise ||= refreshTokens().finally(() => { refreshPromise = null; });
        await refreshPromise;
        return request(path, options, false);
      } catch {
        await tokenStorage.clear();
        unauthorizedHandler?.();
        throw new Error('A sessão expirou. Volta a iniciar sessão.');
      }
    }
    if (!response.ok) {
      const error = new Error(payload?.error?.message || 'Não foi possível concluir o pedido.');
      error.code = payload?.error?.code;
      error.status = response.status;
      error.details = payload?.error?.details;
      throw error;
    }
    return payload?.data;
  } catch (error) {
    if (controller.signal.aborted || error.name === 'AbortError') throw new Error('O pedido demorou demasiado tempo.');
    if (error instanceof TypeError) throw new Error('Não foi possível ligar ao servidor. Confirma a ligação à internet.');
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
