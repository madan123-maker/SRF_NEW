/* eslint-disable @typescript-eslint/no-explicit-any */
export class APIError extends Error {
  constructor(public status: number, public message: string, public data?: any) {
    super(message);
    this.name = 'APIError';
  }
}

export async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const token = localStorage.getItem('srf_token') || '';
  
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options?.headers,
  };

  const response = await fetch(`/api/v1${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch {
      errorData = null;
    }
    throw new APIError(response.status, errorData?.message || response.statusText, errorData);
  }

  // Handle empty responses
  if (response.status === 204) {
    return {} as T;
  }

  const result = await response.json();
  return result.data as T; // Assuming standardized response `{ success: true, data: ... }`
}
