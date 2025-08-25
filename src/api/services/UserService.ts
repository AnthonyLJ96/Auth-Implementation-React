import { authApiClient } from '../clients/AuthApiClient';
import { User } from '../../types/auth.types';

/**
 * User Service
 * Handles all user-related API operations
 */
export class UserService {
    /**
     * Get current user profile
     */
    async getProfile(): Promise<User> {
        return await authApiClient.get<User>('/me');
    }

    // /**
    //  * Update user profile
    //  */
    // async updateProfile(userData: Partial<Omit<User, 'id'>>): Promise<User> {
    //     return await authApiClient.put<User>('/me', userData);
    // }
    //
    // /**
    //  * Change user password
    //  */
    // async changePassword(data: {
    //     currentPassword: string;
    //     newPassword: string;
    //     confirmPassword: string;
    // }): Promise<{ message: string }> {
    //     return await authApiClient.post('/me/change-password', data);
    // }
    //
    // /**
    //  * Get user by ID (admin only)
    //  */
    // async getUserById(userId: number): Promise<User> {
    //     return await authApiClient.get<User>(`/users/${userId}`);
    // }
    //
    // /**
    //  * Get all users (admin only)
    //  */
    // async getAllUsers(params?: {
    //     page?: number;
    //     limit?: number;
    //     search?: string;
    // }): Promise<{
    //     users: User[];
    //     total: number;
    //     page: number;
    //     totalPages: number;
    // }> {
    //     const searchParams = new URLSearchParams();
    //
    //     if (params?.page) searchParams.append('page', params.page.toString());
    //     if (params?.limit) searchParams.append('limit', params.limit.toString());
    //     if (params?.search) searchParams.append('search', params.search);
    //
    //     const queryString = searchParams.toString();
    //     const endpoint = queryString ? `/users?${queryString}` : '/users';
    //
    //     return await authApiClient.get(endpoint);
    // }
    //
    // /**
    //  * Create new user (admin only)
    //  */
    // async createUser(userData: {
    //     username: string;
    //     email: string;
    //     password: string;
    //     firstName?: string;
    //     lastName?: string;
    //     isStaff?: boolean;
    //     isActive?: boolean;
    // }): Promise<User> {
    //     return await authApiClient.post<User>('/users', userData);
    // }
    //
    // /**
    //  * Update user (admin only)
    //  */
    // async updateUser(userId: number, userData: Partial<Omit<User, 'id'>>): Promise<User> {
    //     return await authApiClient.put<User>(`/users/${userId}`, userData);
    // }
    //
    // /**
    //  * Delete user (admin only)
    //  */
    // async deleteUser(userId: number): Promise<{ message: string }> {
    //     return await authApiClient.delete(`/users/${userId}`);
    // }
    //
    // /**
    //  * Activate/Deactivate user (admin only)
    //  */
    // async toggleUserStatus(userId: number, isActive: boolean): Promise<User> {
    //     return await authApiClient.patch<User>(`/users/${userId}/status`, {
    //         is_active: isActive
    //     });
    // }
}

// Export singleton instance
export const userService = new UserService();
