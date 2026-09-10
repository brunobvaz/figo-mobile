export const publicApiUrl = 'https://figo-backend.onrender.com/api/v1';

export function resolveApiUrl(value, development) {
  const configured = value?.trim().replace(/\/+$/, '');
  if (!configured) return development ? 'http://localhost:3000/api/v1' : publicApiUrl;
  try {
    const url = new URL(configured);
    const loopback = ['localhost', '127.0.0.1', '[::1]', '::1', '0.0.0.0', '10.0.2.2'].includes(url.hostname);
    if (!development && loopback) return publicApiUrl;
  } catch {
    throw new Error('O endereço da API configurado nesta versão é inválido.');
  }
  return configured;
}
