const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

let authToken = null;

export function setAuthToken(token) {
  authToken = token;
  try {
    if (token) localStorage.setItem('gt_token', token);
    else localStorage.removeItem('gt_token');
  } catch {}
}

export function getAuthToken() {
  if (authToken) return authToken;
  try {
    const stored = localStorage.getItem('gt_token');
    authToken = stored || null;
  } catch {}
  return authToken;
}

async function request(path, { method = 'GET', body, headers = {}, auth = true } = {}) {
  const url = path.startsWith('http') ? path : `${API_BASE_URL}${path}`;

  const finalHeaders = {
    'Content-Type': 'application/json',
    ...headers,
  };

  if (auth && getAuthToken()) {
    finalHeaders['Authorization'] = `Bearer ${getAuthToken()}`;
  }

  const res = await fetch(url, {
    method,
    headers: finalHeaders,
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'include',
  });

  const contentType = res.headers.get('content-type');
  const isJson = contentType && contentType.includes('application/json');
  const data = isJson ? await res.json().catch(() => ({})) : await res.text();

  if (!res.ok) {
    const error = new Error(data?.error || res.statusText || 'Request failed');
    error.status = res.status;
    error.details = data?.details;
    throw error;
  }

  return data;
}

export const http = {
  get: (path, options = {}) => request(path, { ...options, method: 'GET' }),
  post: (path, body, options = {}) => request(path, { ...options, method: 'POST', body }),
  put: (path, body, options = {}) => request(path, { ...options, method: 'PUT', body }),
  del: (path, options = {}) => request(path, { ...options, method: 'DELETE' }),
};

export default { http, setAuthToken, getAuthToken }; 