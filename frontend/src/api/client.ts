import axios from 'axios';

function normalizeIPv4(urlStr: string): string {
  try {
    const u = new URL(urlStr);
    if (u.hostname === 'localhost') u.hostname = '127.0.0.1';
    return u.toString().replace(/\/$/, '');
  } catch {
    return urlStr;
  }
}

function resolveApiBase(): string {
  const envUrl = import.meta.env.VITE_API_BASE as string | undefined;
  if (envUrl) return normalizeIPv4(envUrl);
  if (typeof window !== 'undefined' && window.location?.origin) {
    const u = new URL(window.location.origin);
    if (u.hostname === 'localhost') u.hostname = '127.0.0.1';
    u.port = '3000';
    u.pathname = '';
    return u.toString().replace(/\/$/, '');
  }
  return 'http://127.0.0.1:3000';
}

const resolvedApiBase = resolveApiBase();
// eslint-disable-next-line no-console
console.log('API base URL:', resolvedApiBase);

export const api = axios.create({
  baseURL: resolvedApiBase,
  timeout: 8000,
});

api.get('/health')
  .then(() => {
    // eslint-disable-next-line no-console
    console.log('Health OK');
  })
  .catch(() => {
    // eslint-disable-next-line no-console
    console.log(`Backend is unreachable at ${resolvedApiBase} (health check failed)`);
  });
