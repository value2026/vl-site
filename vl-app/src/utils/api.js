const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const FILES = import.meta.env.VITE_FILES_URL || 'http://localhost:5000/files';

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

export const fileUrl = (path) => `${FILES}/${path}`;
