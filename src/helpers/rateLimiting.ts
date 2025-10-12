// Rate limiting and debounce/throttle utilities
import { debounce as lodashDebounce, throttle as lodashThrottle } from 'lodash';

/**
 * Debounce function - delays execution until after wait time
 * Use for: search inputs, form validation, window resize
 */
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number = 300
): ((...args: Parameters<T>) => void) => {
  return lodashDebounce(func, wait);
};

/**
 * Throttle function - limits execution to once per wait time
 * Use for: scroll events, button clicks, API calls
 */
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  wait: number = 1000
): ((...args: Parameters<T>) => void) => {
  return lodashThrottle(func, wait, { leading: true, trailing: false });
};

/**
 * Rate limiter for API calls
 * Prevents too many requests in a short time
 */
class RateLimiter {
  private timestamps: Map<string, number[]> = new Map();
  private maxRequests: number;
  private timeWindow: number; // in milliseconds

  constructor(maxRequests: number = 10, timeWindowSeconds: number = 60) {
    this.maxRequests = maxRequests;
    this.timeWindow = timeWindowSeconds * 1000;
  }

  /**
   * Check if request is allowed
   * @param key - identifier for the rate limit (e.g., API endpoint)
   */
  isAllowed(key: string): boolean {
    const now = Date.now();
    const requests = this.timestamps.get(key) || [];

    // Remove timestamps outside the time window
    const validRequests = requests.filter(
      timestamp => now - timestamp < this.timeWindow
    );

    if (validRequests.length >= this.maxRequests) {
      return false;
    }

    // Add current timestamp
    validRequests.push(now);
    this.timestamps.set(key, validRequests);

    return true;
  }

  /**
   * Get remaining requests
   */
  getRemaining(key: string): number {
    const now = Date.now();
    const requests = this.timestamps.get(key) || [];
    const validRequests = requests.filter(
      timestamp => now - timestamp < this.timeWindow
    );

    return Math.max(0, this.maxRequests - validRequests.length);
  }

  /**
   * Reset rate limit for a key
   */
  reset(key: string): void {
    this.timestamps.delete(key);
  }

  /**
   * Clear all rate limits
   */
  resetAll(): void {
    this.timestamps.clear();
  }
}

// Global rate limiters for different types of operations
export const apiRateLimiter = new RateLimiter(30, 60); // 30 requests per minute
export const searchRateLimiter = new RateLimiter(10, 10); // 10 searches per 10 seconds
export const submitRateLimiter = new RateLimiter(5, 30); // 5 submits per 30 seconds

/**
 * Debounced search handler
 */
export const createDebouncedSearch = (
  searchFn: (query: string) => void,
  delay: number = 500
) => {
  return debounce((query: string) => {
    if (searchRateLimiter.isAllowed('search')) {
      searchFn(query);
    } else {
      console.warn('Search rate limit exceeded. Please wait.');
    }
  }, delay);
};

/**
 * Throttled submit handler
 */
export const createThrottledSubmit = (
  submitFn: () => void,
  delay: number = 2000
) => {
  return throttle(() => {
    if (submitRateLimiter.isAllowed('submit')) {
      submitFn();
    } else {
      console.warn('Submit rate limit exceeded. Please wait.');
    }
  }, delay);
};

/**
 * Prevent double-click on buttons
 */
export const preventDoubleClick = (
  callback: (...args: any[]) => void,
  delay: number = 1000
) => {
  let isProcessing = false;

  return (...args: any[]) => {
    if (isProcessing) {
      console.warn('Action already in progress');
      return;
    }

    isProcessing = true;
    callback(...args);

    setTimeout(() => {
      isProcessing = false;
    }, delay);
  };
};

