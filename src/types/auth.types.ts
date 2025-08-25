export interface User {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    is_active: boolean;
    is_staff: boolean;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface LoginResponse {
    access_token: string;
    expires_in: number;
    token_type: number;
}

export interface RefreshResponse {
    access_token: string;
    expires_in: number;
}

export interface ApiError {
    error: string;
}

export interface TokenPayload {
    user_id: number;
    username: string;
    email: string;
    exp: number;
    iat: number;
    jti: string;
}

// API Response types
export type ApiResponse<T> = T | ApiError;

// Request options type
export interface RequestOptions extends RequestInit {
    headers?: Record<string, string>;
}
