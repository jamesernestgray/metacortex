import { useAuth } from '@clerk/clerk-react';
import { apiClient, GetTokenFn } from '../services/api';

export function useApi() {
  const { getToken } = useAuth();

  // Create a wrapped API client that automatically includes the token
  const api = {
    get: async <T>(endpoint: string, params?: Record<string, any>) => {
      return apiClient.get<T>(endpoint, params, getToken as GetTokenFn);
    },
    post: async <T>(endpoint: string, data?: any) => {
      return apiClient.post<T>(endpoint, data, getToken as GetTokenFn);
    },
    patch: async <T>(endpoint: string, data: any) => {
      return apiClient.patch<T>(endpoint, data, getToken as GetTokenFn);
    },
    put: async <T>(endpoint: string, data: any) => {
      return apiClient.put<T>(endpoint, data, getToken as GetTokenFn);
    },
    delete: async <T>(endpoint: string) => {
      return apiClient.delete<T>(endpoint, getToken as GetTokenFn);
    },
  };

  return api;
}