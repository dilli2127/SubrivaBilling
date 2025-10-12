// HTML sanitization utilities to prevent XSS attacks
import DOMPurify from 'dompurify';

/**
 * Sanitize HTML content to prevent XSS
 * Use before rendering any user-generated HTML
 */
export const sanitizeHTML = (dirty: string): string => {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li', 'span'],
    ALLOWED_ATTR: ['href', 'title', 'target', 'class'],
    ALLOW_DATA_ATTR: false,
  });
};

/**
 * Sanitize HTML for rich text editors
 * More permissive tag set for formatted content
 */
export const sanitizeRichText = (dirty: string): string => {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [
      'b', 'i', 'em', 'strong', 'u', 's', 'a', 'p', 'br', 
      'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'blockquote', 'code', 'pre', 'span', 'div', 'hr', 'table',
      'thead', 'tbody', 'tr', 'th', 'td'
    ],
    ALLOWED_ATTR: ['href', 'title', 'target', 'class', 'id'],
    // Note: style attribute removed for security - inline styles can be risky
    ALLOW_DATA_ATTR: false,
  });
};

/**
 * Strip all HTML tags - use for plain text fields
 */
export const stripHTML = (dirty: string): string => {
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  });
};

/**
 * Sanitize URL to prevent javascript: and data: URLs
 */
export const sanitizeURL = (url: string): string => {
  const sanitized = DOMPurify.sanitize(url, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  });
  
  // Check for dangerous protocols
  const lowerURL = sanitized.toLowerCase().trim();
  if (
    lowerURL.startsWith('javascript:') ||
    lowerURL.startsWith('data:') ||
    lowerURL.startsWith('vbscript:')
  ) {
    return '#';
  }
  
  return sanitized;
};

/**
 * Safe component for rendering sanitized HTML
 * Usage: <div {...createSafeHTML(userContent)} />
 */
export const createSafeHTML = (dirty: string): { dangerouslySetInnerHTML: { __html: string } } => {
  return {
    dangerouslySetInnerHTML: {
      __html: sanitizeHTML(dirty)
    }
  };
};

/**
 * Sanitize form input to prevent XSS in text fields
 */
export const sanitizeInput = (value: string): string => {
  // Remove any HTML tags and encode special characters
  return stripHTML(value)
    .replace(/[<>]/g, '')
    .trim();
};

