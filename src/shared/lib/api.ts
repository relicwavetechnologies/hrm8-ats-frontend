/**
 * API Client Configuration
 * Handles all HTTP requests to the backend
 */

const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  details?: Record<string, unknown>;
  status?: number;
}

class ApiClient {
  private baseURL: string;
  private readonly requestTimeoutMs = 25000;

  constructor(baseURL: string) {
    this.baseURL = baseURL.replace(/\/+$/, '');
  }

  private buildUrl(endpoint: string): string {
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

    // Prevent accidental double-prefix like /api/api/... when VITE_API_URL already includes /api
    if (this.baseURL.endsWith('/api') && normalizedEndpoint.startsWith('/api/')) {
      return `${this.baseURL}${normalizedEndpoint.slice(4)}`;
    }

    return `${this.baseURL}${normalizedEndpoint}`;
  }

  private async parseResponseBody(response: Response): Promise<any> {
    try {
      return await response.json();
    } catch {
      return null;
    }
  }

  private async executeRequest<T>(url: string, config: RequestInit): Promise<ApiResponse<T>> {
    const response = await fetch(url, config);
    const data = await this.parseResponseBody(response);

    if (!response.ok) {
      const derivedError =
        data?.error ||
        data?.message ||
        (typeof data === 'string' ? data : null) ||
        `HTTP ${response.status}: ${response.statusText}`;
      return {
        success: false,
        error: derivedError,
        details: data?.details,
        status: response.status,
        data: data?.data,
      } as ApiResponse<T>;
    }

    return (data || { success: true }) as ApiResponse<T>;
  }

  private shouldRetryWithSameOrigin(endpoint: string): boolean {
    return Boolean(this.baseURL) && endpoint.startsWith('/api/');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = this.buildUrl(endpoint);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.requestTimeoutMs);

    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include', // Important for cookies
      signal: controller.signal,
    };

    try {
      return await this.executeRequest<T>(url, config);
    } catch (error) {
      if (this.shouldRetryWithSameOrigin(endpoint)) {
        try {
          return await this.executeRequest<T>(endpoint, config);
        } catch (fallbackError) {
          if (fallbackError instanceof DOMException && fallbackError.name === 'AbortError') {
            return {
              success: false,
              error: 'Request timed out. Please check your connection and try again.',
            };
          }
          return {
            success: false,
            error: fallbackError instanceof Error ? fallbackError.message : 'Network error',
          };
        }
      }

      if (error instanceof DOMException && error.name === 'AbortError') {
        return {
          success: false,
          error: 'Request timed out. Please check your connection and try again.',
        };
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    } finally {
      clearTimeout(timeout);
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async upload<T>(endpoint: string, formData: FormData): Promise<ApiResponse<T>> {
    const url = this.buildUrl(endpoint);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.requestTimeoutMs);

    // Do not set Content-Type header for FormData, browser sets it with boundary
    const config: RequestInit = {
      method: 'POST',
      body: formData,
      credentials: 'include',
      signal: controller.signal,
    };

    try {
      return await this.executeRequest<T>(url, config);
    } catch (error) {
      if (this.shouldRetryWithSameOrigin(endpoint)) {
        try {
          return await this.executeRequest<T>(endpoint, config);
        } catch (fallbackError) {
          if (fallbackError instanceof DOMException && fallbackError.name === 'AbortError') {
            return {
              success: false,
              error: 'Request timed out. Please check your connection and try again.',
            };
          }
          return {
            success: false,
            error: fallbackError instanceof Error ? fallbackError.message : 'Network error',
          };
        }
      }

      if (error instanceof DOMException && error.name === 'AbortError') {
        return {
          success: false,
          error: 'Request timed out. Please check your connection and try again.',
        };
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    } finally {
      clearTimeout(timeout);
    }
  }

  async put<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async patch<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(endpoint: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
      body: body ? JSON.stringify(body) : undefined,
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
