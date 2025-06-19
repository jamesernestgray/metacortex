import { API_BASE_URL, API_VERSION } from '../config/api';

// Types for API responses
export interface ApiError {
  detail: string;
  status: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pages: number;
}

// Type for getToken function from Clerk
export type GetTokenFn = () => Promise<string | null>;

// API Client class
class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = `${API_BASE_URL}${API_VERSION}`;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    getToken?: GetTokenFn
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    // Get token from Clerk if getToken function is provided
    if (getToken) {
      try {
        console.log('Getting auth token...');
        const token = await getToken();
        console.log('Got token:', token ? 'Yes' : 'No');
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      } catch (error) {
        console.error('Failed to get auth token:', error);
        throw new Error('Authentication failed. Please sign in again.');
      }
    }

    const url = `${this.baseUrl}${endpoint}`;
    console.log('API Request:', {
      url,
      method: options.method || 'GET',
      headers: { ...headers, Authorization: headers.Authorization ? '[REDACTED]' : undefined }
    });

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      console.log('API Response:', {
        url,
        status: response.status,
        ok: response.ok
      });

      if (!response.ok) {
        const error: ApiError = {
          detail: 'An error occurred',
          status: response.status,
        };

        try {
          const data = await response.json();
          error.detail = data.detail || error.detail;
        } catch {
          // Use default error message
        }

        throw error;
      }

      // Handle 204 No Content
      if (response.status === 204) {
        return {} as T;
      }

      const data = await response.json();
      console.log('API Response data:', data);
      return data;
    } catch (error) {
      console.error('API Request failed:', error);
      console.error('Error details:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      
      if (error instanceof TypeError && error.message === 'Failed to fetch') {
        throw new Error('Network error: Unable to connect to the server. Please check if the backend is running.');
      }
      throw error;
    }
  }

  // GET request
  async get<T>(endpoint: string, params?: Record<string, any>, getToken?: GetTokenFn): Promise<T> {
    let queryString = '';
    
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => searchParams.append(key, String(v)));
          } else {
            searchParams.append(key, String(value));
          }
        }
      });
      queryString = searchParams.toString();
    }

    const fullEndpoint = queryString ? `${endpoint}?${queryString}` : endpoint;
    
    return this.request<T>(fullEndpoint, {
      method: 'GET',
    }, getToken);
  }

  // POST request
  async post<T>(endpoint: string, data?: any, getToken?: GetTokenFn): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }, getToken);
  }

  // PATCH request
  async patch<T>(endpoint: string, data: any, getToken?: GetTokenFn): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }, getToken);
  }

  // PUT request
  async put<T>(endpoint: string, data: any, getToken?: GetTokenFn): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    }, getToken);
  }

  // DELETE request
  async delete<T>(endpoint: string, getToken?: GetTokenFn): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    }, getToken);
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Helper function for handling API errors in components
export const handleApiError = (error: any): string => {
  if (error.detail) {
    return error.detail;
  }
  
  if (error.message) {
    return error.message;
  }
  
  return 'An unexpected error occurred';
};