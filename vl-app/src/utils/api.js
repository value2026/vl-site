import { getApiBaseUrl, getFilesBaseUrl } from './url';

const BASE = getApiBaseUrl();
const FILES = getFilesBaseUrl();

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

const apiFetch = async (endpoint, options = {}) => {
  const getHeaders = (t) => ({
    ...(t ? { Authorization: `Bearer ${t}` } : {}),
    ...(!(options.body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}),
    ...(options.headers || {}),
  });

  const doRequest = (t) => fetch(`${BASE}${endpoint}`, { ...options, headers: getHeaders(t) });

  const res = await doRequest(localStorage.getItem('vl_token'));

  if (res.status === 401 || (res.status === 403 && endpoint !== '/auth/login')) {
    const clone = res.clone();
    try {
      const data = await clone.json();
      
      if (data?.message === 'Invalid or expired token') {
        const refreshToken = localStorage.getItem('vl_refresh_token');
        if (!refreshToken) {
          window.dispatchEvent(new CustomEvent('vl_session_expired', { detail: { reason: 'TOKEN_EXPIRED' } }));
          return res;
        }

        if (isRefreshing) {
          try {
            const token = await new Promise((resolve, reject) => {
              failedQueue.push({ resolve, reject });
            });
            return await doRequest(token);
          } catch (e) {
            return res;
          }
        }

        isRefreshing = true;
        try {
          const refreshRes = await fetch(`${BASE}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken })
          });
          const refreshData = await refreshRes.json();

          if (refreshRes.ok && refreshData.token) {
            localStorage.setItem('vl_token', refreshData.token);
            if (refreshData.refreshToken) {
              localStorage.setItem('vl_refresh_token', refreshData.refreshToken);
            }
            isRefreshing = false;
            processQueue(null, refreshData.token);
            return await doRequest(refreshData.token);
          } else {
            throw new Error('Refresh failed');
          }
        } catch (err) {
          isRefreshing = false;
          processQueue(err, null);
          window.dispatchEvent(new CustomEvent('vl_session_expired', { detail: { reason: 'TOKEN_EXPIRED' } }));
          return res;
        }
      } else if (data?.message === 'Access token required') {
        window.dispatchEvent(new CustomEvent('vl_session_expired', { detail: { reason: 'INVALID_TOKEN' } }));
      }
    } catch (_) {
      // ignore parse errors
    }
  }

  return res;
};

export const apiUrl = (endpoint = '') => `${BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

export const api = {
  get:    (url)           => apiFetch(url),
  post:   (url, body)     => apiFetch(url, { method: 'POST', body: JSON.stringify(body) }),
  put:    (url, body)     => apiFetch(url, { method: 'POST',  body: JSON.stringify(body) }),
  delete: (url)           => apiFetch(url, { method: 'POST' }),
  upload: (url, formData) => apiFetch(url, { method: 'POST', body: formData }),
};

export const safeJson = async (res) => {
  const contentType = res.headers?.get('content-type') || '';
  if (contentType.includes('application/json')) {
    try {
      return await res.json();
    } catch (e) {
      return { message: 'Invalid JSON response received from server' };
    }
  }
  const text = await res.text();
  if (res.status === 413) {
    return { message: 'File is too large (413 Request Entity Too Large). Please upload a ZIP file under 100MB.' };
  }
  if (res.status === 404) {
    return { message: 'Upload endpoint not found (404).' };
  }
  try {
    return JSON.parse(text);
  } catch (e) {
    return { message: res.statusText || `Server returned error status ${res.status}` };
  }
};

export const fileUrl = (path) => `${FILES}/${path}`;

export const getSlug = (str) => {
  if (!str) return '';
  return str
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};
