const trimTrailingSlash = (value) => value.replace(/\/+$/, '');

const browserOrigin = () => {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }
  return '';
};

const isUnusableHost = (hostname) => {
  const normalized = hostname.replace(/\.$/, '');
  return normalized === '0.0.0.0' || normalized === '::';
};

const normalizeConfiguredUrl = (rawUrl, fallbackPath) => {
  const origin = browserOrigin();
  const fallback = origin ? `${origin}${fallbackPath}` : `http://localhost:5000${fallbackPath}`;
  const raw = rawUrl?.trim();

  if (!raw) return fallback;

  try {
    const url = new URL(raw, origin || 'http://localhost');
    if (isUnusableHost(url.hostname)) return fallback;
    return trimTrailingSlash(url.toString());
  } catch (_) {
    return fallback;
  }
};

export const getApiBaseUrl = () => {
  const base = normalizeConfiguredUrl(import.meta.env.VITE_API_URL, '/api');
  return base.endsWith('/api') ? base : `${base}/api`;
};

export const getFilesBaseUrl = () => {
  const base = normalizeConfiguredUrl(import.meta.env.VITE_FILES_URL, '/files');
  return base.endsWith('/files') ? base : `${base}/files`;
};
