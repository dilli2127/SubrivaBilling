/**
 * Central export for all security utilities
 * Import from this file for better organization
 */

// Encryption
export {
  default as SessionStorageEncryption
} from './encryption';

// Data Masking
export {
  maskEmail,
  maskPhone,
  maskGST,
  maskPAN,
  maskCardNumber,
  maskAadhaar,
  createMaskedField,
  canViewSensitiveData
} from './dataMasking';

// CSRF Protection
export {
  generateCSRFToken,
  setCSRFToken,
  getCSRFToken,
  clearCSRFToken,
  validateCSRFToken,
  refreshCSRFToken
} from './csrfToken';

// HTML Sanitization
export {
  sanitizeHTML,
  sanitizeRichText,
  stripHTML,
  sanitizeURL,
  createSafeHTML,
  sanitizeInput
} from './sanitize';

// Rate Limiting
export {
  debounce,
  throttle,
  apiRateLimiter,
  searchRateLimiter,
  submitRateLimiter,
  createDebouncedSearch,
  createThrottledSubmit,
  preventDoubleClick
} from './rateLimiting';

// Error Logging
export {
  logErrorToBackend,
  logPerformanceToBackend,
  logCustomEvent,
  LogBatcher,
  globalLogBatcher
} from './errorLogging';

// Auth (already exported, just re-exporting for completeness)
export {
  getCurrentUser,
  getCurrentUserRole,
  getAuthToken,
  setUserData,
  setAuthToken,
  clearAuthData,
  isAuthenticated
} from './auth';

