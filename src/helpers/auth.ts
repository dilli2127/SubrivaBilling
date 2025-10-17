// src/helpers/auth.ts
import SessionStorageEncryption from './encryption';
import { clearCSRFToken, setCSRFToken } from './csrfToken';
import { clearPermissions } from './permissionHelper';

export interface User {
  _id?: string;
  name: string;
  username?: string;
  email: string;
  mobile: string;
  clientcode: string;
  usertype: string;
  user_type?: string;
  active: boolean;
  organization_name?: string;
  branch_id?: string;
  organisation_id?: string;
  roleItems?: any;
  user_role?: string;
  organisationItems?: any;
  branchItems?: any;
}

// Get current user data (encrypted)
export function getCurrentUser(): User | null {
  const user = SessionStorageEncryption.getItem('user');
  if (!user) {
    // Fallback to direct session storage for backward compatibility
    try {
      const fallbackUser = sessionStorage.getItem('user');
      if (fallbackUser) {
        return JSON.parse(fallbackUser);
      }
    } catch (error) {
      console.error('Failed to parse fallback user data:', error);
    }
  }
  return user;
}

// Get current user role
export function getCurrentUserRole(): string | null {
  const user = getCurrentUser();
  if (!user) return null;
  return user?.roleItems?.name || user?.usertype || user?.user_role || null;
}

// Get authentication token (access token)
export function getAuthToken(): string | null {
  // Try accessToken first (new pattern)
  const accessToken = SessionStorageEncryption.getItem('accessToken');
  if (accessToken) {
    return accessToken;
  }
  
  // Fallback to 'token' for backward compatibility
  const token = SessionStorageEncryption.getItem('token');
  if (token) {
    return token;
  }
  
  // Last resort - check direct session storage
  const fallbackToken = sessionStorage.getItem('token') || sessionStorage.getItem('accessToken');
  if (fallbackToken) {
    return fallbackToken;
  }
  
  return null;
}

// Get refresh token
export function getRefreshToken(): string | null {
  const refreshToken = SessionStorageEncryption.getItem('refreshToken');
  if (!refreshToken) {
    // Fallback to direct session storage for backward compatibility
    const fallbackRefreshToken = sessionStorage.getItem('refreshToken');
    if (fallbackRefreshToken) {
      return fallbackRefreshToken;
    }
  }
  return refreshToken;
}

// Store user data (encrypted)
export function setUserData(user: User): void {
  SessionStorageEncryption.setItem('user', user);
}

// Store auth token (encrypted) and generate CSRF token
export function setAuthToken(token: string): void {
  SessionStorageEncryption.setItem('token', token);
  // Also store as accessToken for consistency
  SessionStorageEncryption.setItem('accessToken', token);
  // Generate CSRF token on successful authentication
  setCSRFToken();
}

// Store access token (new pattern)
export function setAccessToken(accessToken: string): void {
  SessionStorageEncryption.setItem('accessToken', accessToken);
  // Also store as 'token' for backward compatibility
  SessionStorageEncryption.setItem('token', accessToken);
  // Generate CSRF token on successful authentication
  setCSRFToken();
}

// Store refresh token
export function setRefreshToken(refreshToken: string): void {
  SessionStorageEncryption.setItem('refreshToken', refreshToken);
}

// Store both access and refresh tokens
export function setTokens(accessToken: string, refreshToken: string): void {
  setAccessToken(accessToken);
  setRefreshToken(refreshToken);
}

// Clear all auth data including CSRF token and permissions
export function clearAuthData(): void {
  SessionStorageEncryption.removeItem('user');
  SessionStorageEncryption.removeItem('token');
  SessionStorageEncryption.removeItem('accessToken');
  SessionStorageEncryption.removeItem('refreshToken');
  clearCSRFToken();
  clearPermissions();
  
  // Also clear direct storage for safety
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('accessToken');
  sessionStorage.removeItem('refreshToken');
}

// Check if user is authenticated
export function isAuthenticated(): boolean {
  return !!(getAuthToken() && getCurrentUser());
}
