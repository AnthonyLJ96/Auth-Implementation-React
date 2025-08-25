# 🚀 API Architecture Migration Guide

## Overview

Your React project has been refactored with a senior-level architecture that separates concerns properly:

- **Pure Token Management**: No more API calls in TokenManager
- **Service Layer**: Clean business logic separation
- **HTTP Clients**: Reusable with interceptors and error handling
- **Type Safety**: Full TypeScript support

## 📁 New Directory Structure

```
src/
├── api/
│   ├── clients/
│   │   ├── ApiClient.ts          # Base HTTP client
│   │   └── AuthApiClient.ts      # Authenticated HTTP client
│   ├── services/
│   │   ├── AuthService.ts        # Authentication business logic
│   │   ├── UserService.ts        # User operations
│   │   └── index.ts              # Service exports
│   └── user.tsx                  # Legacy (backward compatibility)
├── auth/
│   ├── TokenManager.ts           # Pure token operations
│   └── index.ts                  # Auth exports
└── utils/
    └── TokenManager.ts           # OLD - Replace imports
```

## 🔄 Migration Examples

### Before (Old Way)

```typescript
// ❌ Old approach - mixed concerns
import { tokenManager } from '../utils/TokenManager';

// Login
const response = await fetch(`${WebServiceConfig.url}/auth/login`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    credentials: 'include',
    body: JSON.stringify(body),
});

// Get user with manual token handling
const accessToken = await tokenManager.getValidAccessToken();
const userResponse = await fetch(`${WebServiceConfig.url}/me`, {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
    },
    credentials: 'include',
});
```

### After (New Way)

```typescript
// ✅ New approach - clean separation
import { authService, userService } from '../api/services';

// Login
const loginData = await authService.login({
    username: 'user@example.com',
    password: 'password123'
});

// Get user - automatic token handling
const user = await userService.getProfile();
```

## 📋 Common Migration Patterns

### 1. Authentication Operations

```typescript
// OLD
import { tokenManager } from '../utils/TokenManager';
import { login, getMe } from '../api/user';

// NEW
import { authService, userService } from '../api/services';

// Login
const result = await authService.login(credentials);

// Logout
await authService.logout();

// Check if authenticated
const isAuth = authService.isAuthenticated();

// Get current user
const user = await userService.getProfile();
```

### 2. Token Management

```typescript
// OLD
import { tokenManager } from '../utils/TokenManager';
const token = await tokenManager.getValidAccessToken();

// NEW
import { tokenManager } from '../auth';
import { authService } from '../api/services';

// Get token (rarely needed - services handle this)
const token = authService.getAccessToken();

// Check token status
const isExpired = authService.isTokenExpired();

// Get user from token (offline)
const user = authService.getCurrentUserFromToken();
```

### 3. React Component Usage

```typescript
// Example: Login Component
import React, { useState } from 'react';
import { authService } from '../api/services';
import type { LoginCredentials } from '../api/services';

export const LoginForm: React.FC = () => {
    const [loading, setLoading] = useState(false);
    
    const handleLogin = async (credentials: LoginCredentials) => {
        setLoading(true);
        try {
            const result = await authService.login(credentials);
            console.log('Login successful:', result);
            // Redirect or update state
        } catch (error) {
            console.error('Login failed:', error);
            // Handle error (show toast, etc.)
        } finally {
            setLoading(false);
        }
    };
    
    // ... rest of component
};
```

### 4. React Hook Usage

```typescript
// Example: Custom Auth Hook
import { useEffect, useState } from 'react';
import { authService } from '../api/services';
import type { User } from '../api/services';

export const useAuth = () => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        const initAuth = async () => {
            try {
                if (authService.isAuthenticated()) {
                    const userData = await authService.getCurrentUser();
                    setUser(userData);
                }
            } catch (error) {
                console.error('Auth initialization failed:', error);
            } finally {
                setLoading(false);
            }
        };
        
        initAuth();
    }, []);
    
    const login = async (credentials: LoginCredentials) => {
        const result = await authService.login(credentials);
        setUser(result.user);
        return result;
    };
    
    const logout = async () => {
        await authService.logout();
        setUser(null);
    };
    
    return {
        user,
        loading,
        login,
        logout,
        isAuthenticated: authService.isAuthenticated()
    };
};
```

## 🔧 Key Benefits

### 1. **Separation of Concerns**
- `TokenManager`: Only handles token operations
- `AuthService`: Authentication business logic
- `UserService`: User-related operations
- `ApiClient`: HTTP communication

### 2. **Automatic Error Handling**
```typescript
// Automatic token refresh and error handling
try {
    const user = await userService.getProfile();
} catch (error) {
    // Automatically handles 401s, token refresh, etc.
    console.error('Request failed:', error.message);
}
```

### 3. **Type Safety**
```typescript
// Full TypeScript support
const loginData: LoginResponse = await authService.login(credentials);
const userData: User = await userService.getProfile();
```

### 4. **Centralized Configuration**
```typescript
// Easy to configure base URLs, headers, etc.
const apiClient = new ApiClient('https://api.myapp.com');
```

## 🚨 Breaking Changes

### Import Updates Required

1. **TokenManager imports**:
   ```typescript
   // OLD
   import { tokenManager } from '../utils/TokenManager';
   
   // NEW
   import { tokenManager } from '../auth';
   ```

2. **API calls**:
   ```typescript
   // OLD
   import { login, getMe } from '../api/user';
   
   // NEW
   import { authService, userService } from '../api/services';
   ```

### Method Changes

| Old Method | New Method |
|------------|------------|
| `tokenManager.getValidAccessToken()` | `authService.getAccessToken()` |
| `login(credentials)` | `authService.login(credentials)` |
| `getMe()` | `userService.getProfile()` |
| `tokenManager.refreshAccessToken()` | `authService.refreshToken()` |

## 🎯 Next Steps

1. **Update imports** in your existing files
2. **Test authentication flow** with new services
3. **Remove old TokenManager** from utils once migration is complete
4. **Add new API services** as needed (products, orders, etc.)

## 💡 Tips

- The old API file (`api/user.tsx`) provides backward compatibility during migration
- Services handle all HTTP logic - no need for manual fetch calls
- Error handling is automatic with proper types
- Token refresh happens automatically in authenticated requests

Your code is now structured like a senior developer would write it! 🎉
