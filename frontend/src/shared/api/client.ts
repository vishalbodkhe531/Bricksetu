const API_BASE = '/api/v1';

export async function apiRequest<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    credentials: 'include',
  });

  const body = await response.json();

  if (!response.ok) {
    const errorMsg = body?.error?.message || 'An error occurred during API request.';
    const error = new Error(errorMsg) as any;
    error.code = body?.error?.code || 'API_ERROR';
    error.status = response.status;
    error.details = body?.error?.details || [];
    throw error;
  }

  return body.data;
}
