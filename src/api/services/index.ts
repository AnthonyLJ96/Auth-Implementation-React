// API Clients
export { apiClient } from '../clients/ApiClient';
export { authApiClient } from '../clients/AuthApiClient';
export type { ApiError, RequestConfig } from '../clients/ApiClient';

// Services
export { authService, AuthService } from './AuthService';
export { userService, UserService } from './UserService';

// Re-export commonly used types
export type {
    User,
    LoginCredentials,
    LoginResponse,
    RefreshResponse,
    TokenPayload,
    ApiResponse,
} from '../../types/auth.types';
