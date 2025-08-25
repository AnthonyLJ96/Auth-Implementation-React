import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '../api/services';
import { LoginCredentials } from '../types/auth.types';
import { useProfile } from '../hooks';

interface AuthContextType {
    isAuthenticated: undefined | boolean;
    isLoading: boolean;
    login: (credentials: LoginCredentials) => Promise<void>;
    logout: () => Promise<void>;
    refreshAuthState: () => Promise<void>;
}

const defaultAuthContext: AuthContextType = {
    isAuthenticated: undefined,
    isLoading: true,
    login: async () => {},
    logout: async () => {},
    refreshAuthState: async () => {},
};

export const AuthContext = createContext<AuthContextType>(defaultAuthContext);

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [isAuthenticated, setIsAuthenticated] = useState<undefined | boolean>(undefined);
    const [isLoading, setIsLoading] = useState(true);
    
    // ✅ Use the custom hook for profile management
    const { refetch: refetchProfile, clearProfile } = useProfile();

    // Initialize auth state on component mount
    useEffect(() => {
        initializeAuthState();
    }, []);

    const initializeAuthState = async () => {
        try {
            setIsLoading(true);

            // Check if user has valid access token in localStorage
            const isAuth = authService.isAuthenticated();
            console.log('Initial auth check (access token exists):', isAuth);
            
            if (isAuth) {
                // User has access token - check if it's still valid
                console.log('Access token found, checking validity...');
                setIsAuthenticated(true);
                await refetchProfile();
            } else {
                // No access token found - try to refresh using httpOnly cookie
                console.log('No access token found, attempting to refresh from cookie...');
                try {
                    // Try to refresh token using the httpOnly refresh cookie
                    await authService.refreshToken();
                    // Now we should have a new access token
                    const newAccessToken = authService.getAccessToken();
                    if (newAccessToken) {
                        console.log('New access token obtained, user is authenticated');
                        setIsAuthenticated(true);
                        // Fetch user profile with the new token
                        await refetchProfile();
                    } else {
                        console.log('Token refresh succeeded but no access token stored');
                        setIsAuthenticated(false);
                    }
                } catch (refreshError) {
                    // No valid refresh token or refresh failed
                    setIsAuthenticated(false);
                    
                    // Clear any stale tokens
                    authService.logout().catch(() => {
                        // Silent cleanup - don't throw errors during initialization
                    });
                }
            }
        } catch (error) {
            console.error('Error initializing auth state:', error);
            setIsAuthenticated(false);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (credentials: LoginCredentials): Promise<void> => {
        try {
            console.log('Context login with credentials:', credentials.email);
            
            // ✅ AuthContext only handles authentication logic
            await authService.login(credentials);
            if (authService.isAuthenticated()) {
                setIsAuthenticated(true);
                // ✅ Profile hook handles profile fetching
                await refetchProfile();
                console.log('Login successful');
            } else {
                throw new Error('Login succeeded but token is invalid');
            }
        } catch (error) {
            console.error('Login failed:', error);
            setIsAuthenticated(false);
            throw error;
        }
    };

    const logout = async (): Promise<void> => {
        try {
            console.log('Logging out user');
            // ✅ AuthContext only handles auth logout
            await authService.logout();
        } catch (error) {
            console.error('Logout error:', error);
            // Continue with local logout even if API call fails
        } finally {
            // ✅ Only reset auth state, profile is handled by useProfile
            setIsAuthenticated(false);
            clearProfile();
        }
    };

    const refreshAuthState = async (): Promise<void> => {
        console.log('Manually refreshing auth state...');
        await initializeAuthState();
    };

    const contextValue: AuthContextType = {
        // auth: profileUser, // ✅ Use profile from the hook
        isAuthenticated,
        isLoading,
        login,
        logout,
        refreshAuthState,
    };

    if (isAuthenticated === undefined) {
        return null;
    }
    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
}
