/**
 * Authenticated fetch wrapper.
 * Automatically attaches the Microsoft Entra ID Bearer token to all API requests.
 *
 * Usage: import { useApiFetch } from './auth/apiFetch';
 *        const apiFetch = useApiFetch();
 *        const data = await apiFetch('/api/entries');
 */
import { useCallback } from 'react';
import { useAuth } from './AuthContext';

export function useApiFetch() {
  const { getAccessToken } = useAuth();

  const apiFetch = useCallback(async (url, options = {}) => {
    const token = await getAccessToken();

    if (!token) {
      throw new Error('Not authenticated');
    }

    const headers = {
      ...options.headers
    };

    // Add Authorization header
    headers['Authorization'] = `Bearer ${token}`;

    // Add Content-Type for JSON if body is provided and it's not FormData
    if (options.body && !(options.body instanceof FormData) && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(url, {
      ...options,
      headers
    });

    // If we get 401, token may be expired
    if (response.status === 401) {
      console.warn('API returned 401 — token may be expired');
    }

    return response;
  }, [getAccessToken]);

  return apiFetch;
}
