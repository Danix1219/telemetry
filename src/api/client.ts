
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

// Utilidad para construir query params (?page=1&pageSize=50...)
export const buildQueryString = (params?: Record<string, any>): string => {
  if (!params) return '';
  
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '') {
      const stringValue = value instanceof Date ? value.toISOString() : String(value);
      query.append(key, stringValue);
    }
  }
  const queryString = query.toString();
  return queryString ? `?${queryString}` : '';
};

// Wrapper genérico para las peticiones HTTP
export const apiClient = async <T>(endpoint: string, options?: RequestInit): Promise<T> => {
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: { ...defaultHeaders, ...options?.headers },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.error || errorData?.title || errorData?.detail || `Error HTTP: ${response.status}`);
  }

  // Si la respuesta es un 204 No Content, no intentamos parsear JSON
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
};