// src/helpers/auth.ts
import SessionStorageEncryption from './encryption';

export interface User {
  _id?: string;
  name: string;
  username?: string;
  email: string;
  mobile: string;
  clientcode: string;
  usertype: string;
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
        console.log('Using fallback user data from session storage');
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

// Get authentication token
export function getAuthToken(): string | null {
  const token = SessionStorageEncryption.getItem('token');
  if (!token) {
    // Fallback to direct session storage for backward compatibility
    const fallbackToken = sessionStorage.getItem('token');
    if (fallbackToken) {
      console.log('Using fallback token from session storage');
      return fallbackToken;
    }
  }
  return token;
}

// Store user data (encrypted)
export function setUserData(user: User): void {
  SessionStorageEncryption.setItem('user', user);
}

// Store auth token (encrypted)
export function setAuthToken(token: string): void {
  SessionStorageEncryption.setItem('token', token);
}

// Clear all auth data
export function clearAuthData(): void {
  SessionStorageEncryption.removeItem('user');
  SessionStorageEncryption.removeItem('token');
}

// Check if user is authenticated
export function isAuthenticated(): boolean {
  return !!(getAuthToken() && getCurrentUser());
}
