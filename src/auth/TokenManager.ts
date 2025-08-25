import { TokenPayload } from '../types/auth.types';

/**
 * Pure Token Manager - Handles only token operations
 * Does NOT make API calls - that's the responsibility of AuthService
 */
export class TokenManager {
    private accessToken: string | null = null;

    /**
     * Set the access token
     */
    setAccessToken(token: string): void {
        this.accessToken = token;
    }

    /**
     * Get the current access token
     */
    getAccessToken(): string | null {
        return this.accessToken;
    }

    /**
     * Clear the access token
     */
    clearAccessToken(): void {
        this.accessToken = null;
    }

    /**
     * Clear all tokens (for logout)
     */
    clearAllTokens(): void {
        this.clearAccessToken();
    }

    /**
     * Decode JWT token payload
     */
    decodeToken(token: string): TokenPayload | null {
        try {
            const base64Payload = token.split('.')[1];
            if (!base64Payload) {
                throw new Error('Invalid token format');
            }
            
            const payload = JSON.parse(atob(base64Payload));
            return payload as TokenPayload;
        } catch (error) {
            console.error('Failed to decode token:', error);
            return null;
        }
    }

    /**
     * Check if a token is expired
     */
    isTokenExpired(token: string | null): boolean {
        if (!token) return true;

        const payload = this.decodeToken(token);
        if (!payload || !payload.exp) return true;

        const currentTime = Math.floor(Date.now() / 1000);
        // Add a small buffer (30 seconds) to handle clock skew
        const expirationWithBuffer = payload.exp - 30;
        
        return currentTime >= expirationWithBuffer;
    }

    /**
     * Check if current access token is expired
     */
    isCurrentTokenExpired(): boolean {
        return this.isTokenExpired(this.accessToken);
    }

    /**
     * Get user information from token
     */
    getUserFromToken(token?: string | null): Partial<TokenPayload> | null {
        const tokenToUse = token || this.accessToken;
        if (!tokenToUse) return null;
        
        return this.decodeToken(tokenToUse);
    }

    /**
     * Get current user information from stored token
     */
    getCurrentUser(): Partial<TokenPayload> | null {
        return this.getUserFromToken();
    }

    /**
     * Check if user is authenticated (has valid token)
     */
    isAuthenticated(): boolean {
        return this.accessToken !== null && !this.isCurrentTokenExpired();
    }

    /**
     * Get token expiration time
     */
    getTokenExpiration(token?: string | null): Date | null {
        const tokenToUse = token || this.accessToken;
        if (!tokenToUse) return null;

        const payload = this.decodeToken(tokenToUse);
        if (!payload || !payload.exp) return null;

        return new Date(payload.exp * 1000);
    }

    /**
     * Get remaining time until token expires (in seconds)
     */
    getTimeUntilExpiration(token?: string | null): number {
        const expiration = this.getTokenExpiration(token);
        if (!expiration) return 0;

        const currentTime = new Date();
        const remainingTime = Math.max(0, Math.floor((expiration.getTime() - currentTime.getTime()) / 1000));
        
        return remainingTime;
    }

    /**
     * Format token for Authorization header
     */
    formatAuthorizationHeader(token?: string | null): string {
        const tokenToUse = token || this.accessToken;
        if (!tokenToUse) {
            throw new Error('No token available');
        }
        return `Bearer ${tokenToUse}`;
    }
}

// Export singleton instance
export const tokenManager = new TokenManager();
