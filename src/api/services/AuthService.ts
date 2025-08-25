import { apiClient } from '../clients/ApiClient';
import { authApiClient } from '../clients/AuthApiClient';
import { tokenManager } from '../../auth';
import { 
    LoginCredentials, 
    LoginResponse, 
    RefreshResponse,
    User,
    TokenPayload 
} from '../../types/auth.types';

/**
 * Authentication Service
 * Handles all authentication-related business logic
 */
export class AuthService {
    constructor() {
        // Set up auth error handler for automatic logout
        authApiClient.setAuthErrorHandler(this.handleAuthError.bind(this));
    }

    /**
     * Login user with credentials
     */
    async login(credentials: LoginCredentials): Promise<LoginResponse> {
        try {
            // Clear any existing tokens
            tokenManager.clearAllTokens();

            const response = await apiClient.post<LoginResponse>('/auth/login', {
                email: credentials.email, // Your API expects email
                password: credentials.password,
            }, {
                includeCookies: true
            });

            // Store the access token
            tokenManager.setAccessToken(response.access_token);

            return response;
        } catch (error) {
            // Ensure tokens are cleared on failed login
            tokenManager.clearAllTokens();
            throw error;
        }
    }

    /**
     * Logout user
     */
    async logout(): Promise<void> {
        try {
            // Send both refresh token (cookie) AND access token (header) for complete invalidation
            const accessToken = tokenManager.getAccessToken();
            
            await apiClient.post('/auth/logout', null, { 
                includeCookies: true, // Send httpOnly refresh token cookie
                headers: accessToken ? {
                    'Authorization': tokenManager.formatAuthorizationHeader(accessToken)
                } : undefined // Send access token if available
            });
        } catch (error) {
            // Log error but continue with local logout
            console.warn('Logout API call failed:', error);
        } finally {
            // Always clear local tokens
            tokenManager.clearAllTokens();
        }
    }

    /**
     * Refresh access token
     * Delegates to AuthApiClient to avoid duplication
     */
    async refreshToken(): Promise<RefreshResponse> {
        // Use AuthApiClient's public refresh method to avoid duplication
        return await authApiClient.refreshToken();
    }

    /**
     * Get current user information
     */
    async getCurrentUser(): Promise<User> {
        return await authApiClient.get<User>('/me');
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated(): boolean {
        return tokenManager.isAuthenticated();
    }

    /**
     * Get current user from token (offline)
     */
    getCurrentUserFromToken(): Partial<TokenPayload> | null {
        return tokenManager.getCurrentUser();
    }

    /**
     * Get access token
     */
    getAccessToken(): string | null {
        return tokenManager.getAccessToken();
    }

    /**
     * Check if current token is expired
     */
    isTokenExpired(): boolean {
        return tokenManager.isCurrentTokenExpired();
    }

    /**
     * Get time until token expiration (in seconds)
     */
    getTimeUntilExpiration(): number {
        return tokenManager.getTimeUntilExpiration();
    }

    /**
     * Handle authentication errors (called by AuthApiClient)
     */
    private handleAuthError(error: any): void {
        console.warn('Authentication error occurred:', error);
        
        // Clear all tokens
        tokenManager.clearAllTokens();
        
        // Redirect to login page
        // Note: In a real app, you might want to use React Router's navigate
        // or dispatch a Redux action instead of direct window.location
        if (typeof window !== 'undefined') {
            const currentPath = window.location.pathname;
            // Only redirect if not already on login page
            if (!currentPath.includes('/admin') && !currentPath.includes('/login')) {
                window.location.href = '/admin';
            }
        }
    }

    /**
     * Initialize authentication state (call on app startup)
     */
    async initializeAuth(): Promise<boolean> {
        try {
            // Try to refresh token to check if user is still authenticated
            await this.refreshToken();
            return true;
        } catch (error) {
            // User is not authenticated or refresh failed
            tokenManager.clearAllTokens();
            return false;
        }
    }

    /**
     * Validate token format and structure
     */
    validateToken(token: string): boolean {
        try {
            const decoded = tokenManager.decodeToken(token);
            return decoded !== null && 
                   typeof decoded.user_id === 'number' && 
                   typeof decoded.exp === 'number';
        } catch {
            return false;
        }
    }
}

// Export singleton instance
export const authService = new AuthService();
