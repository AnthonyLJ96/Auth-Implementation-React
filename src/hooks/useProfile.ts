import { useState, useEffect } from 'react';
import { User, userService } from '../api/services';

interface UseProfileReturn {
    user: User | null;
    isLoading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
    fetchProfile: () => Promise<User>;
    clearProfile: () => void;
}

/**
 * Custom hook to manage user profile data
 * Follows single responsibility principle - only handles user profile logic
 * Separates concerns from authentication logic
 */
export const useProfile = (): UseProfileReturn => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchProfile = async (): Promise<User> => {
        try {
            setIsLoading(true);
            setError(null);
            
            const userProfile = await userService.getProfile();
            setUser(userProfile);
            return userProfile;
        } catch (err) {
            console.error('Failed to fetch user profile:', err);
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch profile';
            setError(errorMessage);
            setUser(null);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    // Auto-fetch on mount
    // useEffect(() => {
    //     fetchProfile().catch(() => {
    //         // Error is already handled in fetchProfile
    //     });
    // }, []);

    const refetch = async (): Promise<void> => {
        await fetchProfile();
    };

    const clearProfile = (): void => {
        setUser(null);
    }

    return {
        user,
        isLoading,
        error,
        refetch,
        fetchProfile,
        clearProfile,
    };
};
