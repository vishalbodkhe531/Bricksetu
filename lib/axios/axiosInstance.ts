import axios from 'axios';

/**
 * App-wide Axios instance.
 * All feature API modules import this — never instantiate axios ad hoc.
 * Base URL is /api so relative calls work in both local and production.
 */
export const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  // Supabase auth uses HttpOnly cookies — no manual token attachment needed.
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error.response?.status;
    const message = error.response?.data?.error ?? error.response?.data?.message ?? 'Something went wrong';

    // Redirect to login on 401
    if (status === 401 && typeof window !== 'undefined') {
      window.location.href = '/login';
    }

    return Promise.reject(new Error(message));
  }
);
