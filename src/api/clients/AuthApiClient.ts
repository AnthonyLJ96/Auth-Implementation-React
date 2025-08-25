import { ApiClient, RequestConfig, ApiError } from './ApiClient';
import { tokenManager } from '../../auth';
import { RefreshResponse } from '../../types/auth.types';

/**
 * Authenticated API Client - Handles token injection and refresh
 * Extends base ApiClient with authentication capabilities
 */
export class AuthApiClient extends ApiClient {
    private refreshPromise: Promise<string> | null = null;
    private onAuthError?: (error: ApiError) => void;

    constructor(baseURL?: string) {
        super(baseURL);
    }

    /**
     * Set callback for authentication errors (e.g., redirect to login)
     */
    setAuthErrorHandler(handler: (error: ApiError) => void): void {
        this.onAuthError = handler;
    }

    /**
     * Public method to refresh access token
     */
    async refreshToken(): Promise<RefreshResponse> {
        const accessToken = await this.refreshAccessToken();
        return {
            access_token: accessToken,
            expires_in: tokenManager.getTimeUntilExpiration()
        } as RefreshResponse;
    }

    /**
     * Refresh access token using refresh token (cookie-based)
     */
    private async refreshAccessToken(): Promise<string> {
        // Prevent multiple simultaneous refresh requests
        if (this.refreshPromise) {
            return this.refreshPromise;
        }

        this.refreshPromise = super.post<RefreshResponse>('/auth/refresh', null, { 
                skipAuth: true,
                includeCookies: true // Send httpOnly refresh token cookie
            })
            .then((response: RefreshResponse) => {
                tokenManager.setAccessToken(response.access_token);
                this.refreshPromise = null;
                return response.access_token;
            })
            .catch((error: ApiError) => {
                this.refreshPromise = null;
                tokenManager.clearAllTokens();
                
                // Handle authentication error
                if (this.onAuthError) {
                    this.onAuthError(error);
                }
                
                throw error;
            });

        return this.refreshPromise;
    }

    /**
     * Get valid access token (refresh if needed)
     */
    private async getValidAccessToken(): Promise<string> {
        const currentToken = tokenManager.getAccessToken();
        
        // If no token or expired, try to refresh
        if (!currentToken || tokenManager.isCurrentTokenExpired()) {
            return await this.refreshAccessToken();
        }

        return currentToken;
    }

    /**
     * Override request method to inject authentication
     */
    async request<T = any>(endpoint: string, config: RequestConfig = {}): Promise<T> {
        // Skip auth for specific requests (like login, refresh)
        if (config.skipAuth) {
            return super.request<T>(endpoint, config);
        }

        try {
            // Get valid access token
            const accessToken = await this.getValidAccessToken();
            
            // Inject Authorization header
            const authHeaders = {
                ...config.headers,
                'Authorization': tokenManager.formatAuthorizationHeader(accessToken),
            };

            return await super.request<T>(endpoint, {
                ...config,
                headers: authHeaders,
            });
        } catch (error) {
            if (error instanceof ApiError && error.status === 401) {
                // Token might be invalid, try to refresh once more
                try {
                    tokenManager.clearAccessToken();
                    const newToken = await this.refreshAccessToken();
                    
                    const retryHeaders = {
                        ...config.headers,
                        'Authorization': tokenManager.formatAuthorizationHeader(newToken),
                    };

                    return await super.request<T>(endpoint, {
                        ...config,
                        headers: retryHeaders,
                    });
                } catch (refreshError) {
                    // Both original request and refresh failed
                    if (this.onAuthError && refreshError instanceof ApiError) {
                        this.onAuthError(refreshError);
                    }
                    throw refreshError;
                }
            }
            
            throw error;
        }
    }
}

// Create authenticated API client instance
export const authApiClient = new AuthApiClient();
