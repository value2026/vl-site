const getBaseUrl = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  if (typeof window !== 'undefined' && window.location.hostname) {
    return `http://${window.location.hostname}:5000/api`;
  }
  return 'http://localhost:5000/api';
};
const getFilesUrl = () => {
  if (import.meta.env.VITE_FILES_URL) return import.meta.env.VITE_FILES_URL;
  if (typeof window !== 'undefined' && window.location.hostname) {
    return `http://${window.location.hostname}:5000/files`;
  }
  return 'http://localhost:5000/files';
};

const BASE = getBaseUrl();
const FILES = getFilesUrl();

const token = () => localStorage.getItem('vl_token');

const apiFetch = async (endpoint, options = {}) => {
  const t = token();
  const isFormData = options.body instanceof FormData;
  const res = await fetch(`${BASE}${endpoint}`, {
    ...options,
    headers: {
      ...(t ? { Authorization: `Bearer ${t}` } : {}),
      ...(!isFormData ? { 'Content-Type': 'application/json' } : {}),
      ...(options.headers || {}),
    },
  });
  return res;
};

export const api = {
  get:    (url)           => apiFetch(url),
  post:   (url, body)     => apiFetch(url, { method: 'POST', body: JSON.stringify(body) }),
  put:    (url, body)     => apiFetch(url, { method: 'PUT',  body: JSON.stringify(body) }),
  delete: (url)           => apiFetch(url, { method: 'DELETE' }),
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
