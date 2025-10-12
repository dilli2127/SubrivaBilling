// CSRF Token management utilities
import CryptoJS from 'crypto-js';

const CSRF_TOKEN_KEY = 'csrf-token';
const CSRF_TOKEN_EXPIRY_KEY = 'csrf-token-expiry';
const TOKEN_LIFETIME_MS = 60 * 60 * 1000; // 1 hour

/**
 * Generate a cryptographically secure random CSRF token
 */
export const generateCSRFToken = (): string => {
  // Generate random token using crypto-js
  const randomBytes = CryptoJS.lib.WordArray.random(32);
  const token = randomBytes.toString(CryptoJS.enc.Hex);
  return token;
};

/**
 * Store CSRF token in session storage with expiry
 */
export const setCSRFToken = (token?: string): string => {
  const csrfToken = token || generateCSRFToken();
  const expiry = Date.now() + TOKEN_LIFETIME_MS;
  
  sessionStorage.setItem(CSRF_TOKEN_KEY, csrfToken);
  sessionStorage.setItem(CSRF_TOKEN_EXPIRY_KEY, expiry.toString());
  
  return csrfToken;
};

/**
 * Get CSRF token from session storage
 * Regenerates if expired or missing
 */
export const getCSRFToken = (): string => {
  const token = sessionStorage.getItem(CSRF_TOKEN_KEY);
  const expiry = sessionStorage.getItem(CSRF_TOKEN_EXPIRY_KEY);
  
  // Check if token exists and is not expired
  if (token && expiry && Date.now() < parseInt(expiry, 10)) {
    return token;
  }
  
  // Token expired or doesn't exist - generate new one
  return setCSRFToken();
};

/**
 * Remove CSRF token (on logout)
 */
export const clearCSRFToken = (): void => {
  sessionStorage.removeItem(CSRF_TOKEN_KEY);
  sessionStorage.removeItem(CSRF_TOKEN_EXPIRY_KEY);
};

/**
 * Validate CSRF token (for state-changing operations)
 */
export const validateCSRFToken = (token: string): boolean => {
  const storedToken = sessionStorage.getItem(CSRF_TOKEN_KEY);
  const expiry = sessionStorage.getItem(CSRF_TOKEN_EXPIRY_KEY);
  
  if (!storedToken || !expiry) {
    return false;
  }
  
  // Check expiry
  if (Date.now() >= parseInt(expiry, 10)) {
    clearCSRFToken();
    return false;
  }
  
  // Constant-time comparison to prevent timing attacks
  return token === storedToken;
};

/**
 * Refresh CSRF token (extend expiry)
 */
export const refreshCSRFToken = (): string => {
  const currentToken = sessionStorage.getItem(CSRF_TOKEN_KEY);
  
  if (currentToken) {
    // Extend expiry for existing token
    return setCSRFToken(currentToken);
  }
  
  // Generate new token
  return setCSRFToken();
};

