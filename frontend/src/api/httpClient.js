const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export function getAuthToken() {
  return localStorage.getItem('pennywise_token');
}

export function setAuthToken(token) {
  if (token) {
    localStorage.setItem('pennywise_token', token);
  } else {
    localStorage.removeItem('pennywise_token');
  }
}

/**
 * Robust HTTP client with centralized interceptors, authorization, and error formatting.
 */
export async function httpClient(endpoint, options = {}) {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Handle FormData upload (e.g. CSV import)
  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  }

  const url = `${BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  try {
    const response = await fetch(url, {
      ...options,
      headers
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      // If unauthorized, notify session expired
      if (response.status === 401) {
        window.dispatchEvent(new CustomEvent('pennywise:unauthorized'));
      }

      const errorMessage =
        data.message ||
        (Array.isArray(data.detail) ? data.detail.join(', ') : data.detail) ||
        `Request failed with status ${response.status}`;

      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    if (err.name === 'TypeError' && err.message.includes('fetch')) {
      throw new Error('Unable to connect to the server. Please check your internet connection or server status.');
    }
    throw err;
  }
}
