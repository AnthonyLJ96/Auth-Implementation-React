import { useContext } from 'react';
import { AuthContext } from '../context';

/**
 * Custom hook to consume AuthContext
 * Provides better error handling and TypeScript support
 */
export const useAuth = () => {
    const context = useContext(AuthContext);
    
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    
    return context;
};
