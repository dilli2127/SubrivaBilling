// Utility functions for masking sensitive data in UI

/**
 * Masks email addresses - shows first 2 chars and domain
 * Example: john.doe@example.com -> jo***@example.com
 */
export const maskEmail = (email: string | null | undefined): string => {
  if (!email) return '';
  
  const [localPart, domain] = email.split('@');
  if (!domain) return email; // Invalid email format
  
  const visibleChars = Math.min(2, localPart.length);
  const masked = localPart.substring(0, visibleChars) + '***';
  
  return `${masked}@${domain}`;
};

/**
 * Masks phone numbers - shows last 4 digits
 * Example: 9876543210 -> XXXXX-3210
 */
export const maskPhone = (phone: string | null | undefined): string => {
  if (!phone) return '';
  
  const cleaned = phone.replace(/\D/g, ''); // Remove non-digits
  if (cleaned.length < 4) return 'XXXX';
  
  const lastFour = cleaned.slice(-4);
  const maskedPart = 'X'.repeat(Math.max(0, cleaned.length - 4));
  
  return `${maskedPart}-${lastFour}`;
};

/**
 * Masks GST number - shows first 2 and last 3 chars
 * Example: 29ABCDE1234F1Z5 -> 29***********Z5
 */
export const maskGST = (gst: string | null | undefined): string => {
  if (!gst) return '';
  
  if (gst.length <= 5) return 'XX***XX';
  
  const prefix = gst.substring(0, 2);
  const suffix = gst.substring(gst.length - 3);
  const maskedMiddle = '*'.repeat(gst.length - 5);
  
  return `${prefix}${maskedMiddle}${suffix}`;
};

/**
 * Masks PAN number - shows first and last char
 * Example: ABCDE1234F -> A********F
 */
export const maskPAN = (pan: string | null | undefined): string => {
  if (!pan) return '';
  
  if (pan.length <= 2) return 'X***X';
  
  const first = pan.charAt(0);
  const last = pan.charAt(pan.length - 1);
  const maskedMiddle = '*'.repeat(Math.max(0, pan.length - 2));
  
  return `${first}${maskedMiddle}${last}`;
};

/**
 * Masks card numbers - shows last 4 digits
 * Example: 4532123456789012 -> **** **** **** 9012
 */
export const maskCardNumber = (cardNumber: string | null | undefined): string => {
  if (!cardNumber) return '';
  
  const cleaned = cardNumber.replace(/\s/g, '');
  if (cleaned.length < 4) return '****';
  
  const lastFour = cleaned.slice(-4);
  return `**** **** **** ${lastFour}`;
};

/**
 * Masks Aadhaar number - shows last 4 digits
 * Example: 123456789012 -> XXXX XXXX 9012
 */
export const maskAadhaar = (aadhaar: string | null | undefined): string => {
  if (!aadhaar) return '';
  
  const cleaned = aadhaar.replace(/\D/g, '');
  if (cleaned.length < 4) return 'XXXX XXXX XXXX';
  
  const lastFour = cleaned.slice(-4);
  return `XXXX XXXX ${lastFour}`;
};

/**
 * Generic masking function with show/hide toggle
 */
export const createMaskedField = (
  value: string | null | undefined,
  maskFn: (val: string) => string,
  isRevealed: boolean = false
): string => {
  if (!value) return '';
  return isRevealed ? value : maskFn(value);
};

/**
 * Check if user has permission to view unmasked data
 * This should be coordinated with backend permissions
 */
export const canViewSensitiveData = (userRole: string | null): boolean => {
  const privilegedRoles = ['superadmin', 'admin', 'accountant'];
  return privilegedRoles.includes(userRole?.toLowerCase() || '');
};

