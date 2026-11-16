/**
 * Centralized API Client Configuration
 * 
 * Provides consistent HTTP client configuration for external API calls
 * with standardized timeouts, retry logic, error mapping, and cancellation support.
 */

import { env } from "../config/env";

interface ApiClientConfig {
  baseUrl: string;
  timeout: number; // milliseconds
  retries: number;
  retryDelay: number; // milliseconds
  retryableStatuses: number[];
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  signal?: AbortSignal;
}

interface ApiError {
  message: string;
  statusCode?: number;
  isRetryable: boolean;
  isNetworkError: boolean;
  isTimeout: boolean;
}

function isApiError(error: unknown): error is ApiError {
  return !!error && typeof error === 'object' && !(error instanceof Error) && 'isRetryable' in error;
}

const DEFAULT_CONFIG: ApiClientConfig = {
  baseUrl: '',
  timeout: 30000, // 30 seconds default
  retries: 3,
  retryDelay: 1000, // 1 second base delay
  retryableStatuses: [408, 429, 500, 502, 503, 504],
};

class ApiClient {
  private config: ApiClientConfig;

  constructor(config: Partial<ApiClientConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Make an HTTP request with retry logic and timeout handling
   */
  async request<T>(url: string, options: RequestOptions = {}): Promise<T> {
    const {
      method = 'GET',
      headers = {},
      body,
      timeout = this.config.timeout,
      signal,
    } = options;

    const fullUrl = `${this.config.baseUrl}${url}`;
    let lastError: ApiError | null = null;

    for (let attempt = 0; attempt <= this.config.retries; attempt++) {
      // AC-1: New controller + timer per attempt so timeouts and aborts don't leak across retries
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const combinedSignal = signal 
        ? this.combineSignals(signal, controller.signal)
        : controller.signal;

      try {
        const response = await fetch(fullUrl, {
          method,
          headers: {
            'Content-Type': 'application/json',
            ...headers,
          },
          body: body ? JSON.stringify(body) : undefined,
          signal: combinedSignal,
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          return await response.json() as T;
        }

        const error = this.createError(response.status, response.statusText);
        
        // Don't retry non-retryable errors
        if (!error.isRetryable || attempt === this.config.retries) {
          throw error;
        }

        lastError = error;
        
        // Exponential backoff for retries
        const delay = this.config.retryDelay * Math.pow(2, attempt);
        await this.sleep(delay);

      } catch (error) {
        clearTimeout(timeoutId);

        // An HTTP error thrown above keeps its status code; anything else is
        // a fetch failure.
        const apiError = isApiError(error) ? error : this.handleFetchError(error);
        
        if (!apiError.isRetryable || attempt === this.config.retries) {
          throw apiError;
        }

        lastError = apiError;
        
        const delay = this.config.retryDelay * Math.pow(2, attempt);
        await this.sleep(delay);
      } finally {
        clearTimeout(timeoutId);
      }
    }

    throw lastError || new Error('Request failed after retries');
  }

  /**
   * Convenience methods for common HTTP verbs
   */
  async get<T>(url: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<T> {
    return this.request<T>(url, { ...options, method: 'GET' });
  }

  async post<T>(url: string, body: any, options?: Omit<RequestOptions, 'method'>): Promise<T> {
    return this.request<T>(url, { ...options, method: 'POST', body });
  }

  async put<T>(url: string, body: any, options?: Omit<RequestOptions, 'method'>): Promise<T> {
    return this.request<T>(url, { ...options, method: 'PUT', body });
  }

  async patch<T>(url: string, body: any, options?: Omit<RequestOptions, 'method'>): Promise<T> {
    return this.request<T>(url, { ...options, method: 'PATCH', body });
  }

  async delete<T>(url: string, options?: Omit<RequestOptions, 'method' | 'body'>): Promise<T> {
    return this.request<T>(url, { ...options, method: 'DELETE' });
  }

  /**
   * Create a standardized API error
   */
  private createError(statusCode: number, statusText: string): ApiError {
    const isRetryable = this.config.retryableStatuses.includes(statusCode);
    
    return {
      message: statusText || `HTTP ${statusCode}`,
      statusCode,
      isRetryable,
      isNetworkError: false,
      isTimeout: statusCode === 408,
    };
  }

  /**
   * Handle fetch errors (network, timeout, abort)
   */
  private handleFetchError(error: unknown): ApiError {
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return {
          message: 'Request timeout or cancelled',
          isRetryable: true,
          isNetworkError: false,
          isTimeout: true,
        };
      }

      // Network errors (ECONNREFUSED, ENOTFOUND, etc.)
      if (error.message.includes('fetch') || error.message.includes('network')) {
        return {
          message: 'Network error',
          isRetryable: true,
          isNetworkError: true,
          isTimeout: false,
        };
      }
    }

    return {
      message: 'Unknown error',
      isRetryable: false,
      isNetworkError: false,
      isTimeout: false,
    };
  }

  /**
   * Combine multiple abort signals
   */
  private combineSignals(...signals: AbortSignal[]): AbortSignal {
    const controller = new AbortController();
    
    for (const signal of signals) {
      if (signal.aborted) {
        controller.abort();
        break;
      }
      
      signal.addEventListener('abort', () => {
        controller.abort();
      });
    }
    
    return controller.signal;
  }

  /**
   * Sleep utility for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Update client configuration
   */
  updateConfig(config: Partial<ApiClientConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

/**
 * Create pre-configured API clients for different services
 */
export function createApiClient(config: Partial<ApiClientConfig> = {}): ApiClient {
  return new ApiClient(config);
}

/**
 * Daily.co API client configuration
 */
export const dailyApiClient = createApiClient({
  baseUrl: env.dailyDomain,
  timeout: 30000,
  retries: 3,
});

export type { ApiClient, ApiError, ApiClientConfig, RequestOptions };
