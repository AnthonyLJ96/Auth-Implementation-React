import { WebServiceConfig } from '../../config/WebService.config';

export class ApiError extends Error {
    public status: number;
    public code?: string;

    constructor(message: string, status: number, code?: string) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.code = code;
        
        // Maintains proper stack trace for where our error was thrown (only available on V8)
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, ApiError);
        }
    }
}

export interface ApiResponse<T = any> {
    data: T;
    success: boolean;
    message?: string;
}

export interface RequestConfig extends RequestInit {
    headers?: Record<string, string>;
    skipAuth?: boolean;
    includeCookies?: boolean; // Only for refresh token endpoints
}

export class ApiClient {
    private readonly baseURL: string;
    private readonly defaultHeaders: Record<string, string>;

    constructor(baseURL?: string) {
        this.baseURL = baseURL || WebServiceConfig.url || '';
        this.defaultHeaders = {
            'Content-Type': 'application/json',
        };
    }

    private async handleResponse<T>(response: Response): Promise<T> {
        const contentType = response.headers.get('Content-Type');
        const isJson = contentType?.includes('application/json');
        
        let data: any;
        try {
            data = isJson ? await response.json() : await response.text();
        } catch (error) {
            throw new ApiError('Failed to parse response', response.status);
        }

        if (!response.ok) {
            throw new ApiError(
                data?.message || data?.error || `HTTP ${response.status}: ${response.statusText}`,
                response.status,
                data?.code
            );
        }

        return data;
    }

    private buildUrl(endpoint: string): string {
        const baseUrl = this.baseURL.endsWith('/') ? this.baseURL.slice(0, -1) : this.baseURL;
        const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
        return `${baseUrl}${path}`;
    }

    private mergeHeaders(customHeaders?: Record<string, string>): Record<string, string> {
        return {
            ...this.defaultHeaders,
            ...customHeaders,
        };
    }

    async request<T = any>(
        endpoint: string, 
        config: RequestConfig = {}
    ): Promise<T> {
        const { headers: customHeaders, includeCookies, ...restConfig } = config;
        
        const requestConfig: RequestInit = {
            // Only include cookies for refresh token endpoints
            credentials: includeCookies ? 'include' : 'omit',
            ...restConfig,
            headers: this.mergeHeaders(customHeaders),
        };

        try {
            const response = await fetch(this.buildUrl(endpoint), requestConfig);
            return await this.handleResponse<T>(response);
        } catch (error) {
            if (error instanceof ApiError) {
                throw error;
            }
            
            // Network or other errors
            throw new ApiError(
                error instanceof Error ? error.message : 'Network error occurred',
                0
            );
        }
    }

    // Convenience methods
    async get<T = any>(endpoint: string, config?: RequestConfig): Promise<T> {
        return this.request<T>(endpoint, { ...config, method: 'GET' });
    }

    async post<T = any>(endpoint: string, data?: any, config?: RequestConfig): Promise<T> {
        return this.request<T>(endpoint, {
            ...config,
            method: 'POST',
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    async put<T = any>(endpoint: string, data?: any, config?: RequestConfig): Promise<T> {
        return this.request<T>(endpoint, {
            ...config,
            method: 'PUT',
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    async patch<T = any>(endpoint: string, data?: any, config?: RequestConfig): Promise<T> {
        return this.request<T>(endpoint, {
            ...config,
            method: 'PATCH',
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    async delete<T = any>(endpoint: string, config?: RequestConfig): Promise<T> {
        return this.request<T>(endpoint, { ...config, method: 'DELETE' });
    }
}

// Create a default instance
export const apiClient = new ApiClient();
