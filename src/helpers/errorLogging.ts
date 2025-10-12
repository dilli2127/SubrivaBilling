// Error logging utilities - sends errors to backend securely
import { stripHTML } from './sanitize';

interface ErrorLog {
  message: string;
  stack?: string;
  timestamp: string;
  userAgent: string;
  url: string;
  componentStack?: string;
  errorInfo?: any;
  userId?: string;
  sessionId?: string;
}

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: string;
  url: string;
  userAgent: string;
}

/**
 * Scrub sensitive data from error messages and stacks
 */
const scrubSensitiveData = (text: string): string => {
  if (!text) return '';
  
  let scrubbed = text;
  
  // Remove email addresses
  scrubbed = scrubbed.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[EMAIL_REDACTED]');
  
  // Remove phone numbers (10 digits)
  scrubbed = scrubbed.replace(/\b\d{10}\b/g, '[PHONE_REDACTED]');
  
  // Remove potential tokens (long alphanumeric strings)
  scrubbed = scrubbed.replace(/[a-zA-Z0-9]{32,}/g, '[TOKEN_REDACTED]');
  
  // Remove GST numbers (format: 22AAAAA0000A1Z5)
  scrubbed = scrubbed.replace(/\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}/g, '[GST_REDACTED]');
  
  // Remove PAN numbers (format: AAAAA0000A)
  scrubbed = scrubbed.replace(/[A-Z]{5}\d{4}[A-Z]{1}/g, '[PAN_REDACTED]');
  
  // Remove Aadhaar numbers (12 digits)
  scrubbed = scrubbed.replace(/\b\d{12}\b/g, '[AADHAAR_REDACTED]');
  
  // Remove potential passwords (password= or pwd=)
  scrubbed = scrubbed.replace(/(password|pwd|pass|secret|token|key)[\s]*[=:]['"]?[^\s'"]+/gi, '$1=[REDACTED]');
  
  return scrubbed;
};

/**
 * Get sanitized user context (without sensitive info)
 */
const getUserContext = (): { userId?: string; sessionId?: string } => {
  try {
    // Get session ID from sessionStorage (without decrypting user data)
    const sessionId = sessionStorage.getItem('session_id') || generateSessionId();
    
    // Store session ID if not already present
    if (!sessionStorage.getItem('session_id')) {
      sessionStorage.setItem('session_id', sessionId);
    }
    
    return {
      sessionId,
      // Don't include user ID in logs for privacy
      userId: undefined
    };
  } catch (error) {
    return {};
  }
};

/**
 * Generate unique session ID
 */
const generateSessionId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
};

/**
 * Log error to backend
 */
export const logErrorToBackend = async (
  error: Error,
  errorInfo?: any
): Promise<void> => {
  try {
    const errorLog: ErrorLog = {
      message: scrubSensitiveData(error.message || 'Unknown error'),
      stack: error.stack ? scrubSensitiveData(error.stack) : undefined,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      componentStack: errorInfo?.componentStack 
        ? scrubSensitiveData(errorInfo.componentStack) 
        : undefined,
      errorInfo: errorInfo ? scrubSensitiveData(JSON.stringify(errorInfo)) : undefined,
      ...getUserContext()
    };

    // Send to backend endpoint
    const token = sessionStorage.getItem('token'); // Get auth token if available
    const response = await fetch(`${process.env.REACT_APP_API_URL || ''}/logs/error`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'token': token })
      },
      body: JSON.stringify(errorLog),
    });

    if (!response.ok) {
      console.error('Failed to log error to backend:', response.statusText);
    }
  } catch (loggingError) {
    // Fail silently - don't break app if logging fails
    console.error('Error logging failed:', loggingError);
  }
};

/**
 * Log performance metrics to backend
 */
export const logPerformanceToBackend = async (
  metrics: PerformanceMetric[]
): Promise<void> => {
  try {
    // Only log in production or if explicitly enabled
    if (process.env.NODE_ENV !== 'production' && !process.env.REACT_APP_ENABLE_PERFORMANCE_LOGGING) {
      return;
    }

    const token = sessionStorage.getItem('token');
    const response = await fetch(`${process.env.REACT_APP_API_URL || ''}/logs/performance`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'token': token })
      },
      body: JSON.stringify({
        metrics,
        timestamp: new Date().toISOString(),
        ...getUserContext()
      }),
    });

    if (!response.ok) {
      console.error('Failed to log performance to backend:', response.statusText);
    }
  } catch (loggingError) {
    console.error('Performance logging failed:', loggingError);
  }
};

/**
 * Log custom event to backend
 */
export const logCustomEvent = async (
  eventName: string,
  eventData?: any
): Promise<void> => {
  try {
    // Scrub any sensitive data from event data
    const scrubbedData = eventData 
      ? JSON.parse(scrubSensitiveData(JSON.stringify(eventData)))
      : undefined;

    const token = sessionStorage.getItem('token');
    const response = await fetch(`${process.env.REACT_APP_API_URL || ''}/logs/event`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'token': token })
      },
      body: JSON.stringify({
        eventName,
        eventData: scrubbedData,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        ...getUserContext()
      }),
    });

    if (!response.ok) {
      console.error('Failed to log event to backend:', response.statusText);
    }
  } catch (loggingError) {
    console.error('Event logging failed:', loggingError);
  }
};

/**
 * Batch log multiple events (more efficient)
 */
export class LogBatcher {
  private queue: any[] = [];
  private batchSize: number = 10;
  private flushInterval: number = 30000; // 30 seconds
  private timer: NodeJS.Timeout | null = null;

  constructor(batchSize: number = 10, flushInterval: number = 30000) {
    this.batchSize = batchSize;
    this.flushInterval = flushInterval;
    this.startTimer();
  }

  /**
   * Add log to queue
   */
  add(logData: any): void {
    this.queue.push({
      ...logData,
      timestamp: new Date().toISOString()
    });

    if (this.queue.length >= this.batchSize) {
      this.flush();
    }
  }

  /**
   * Flush logs to backend
   */
  async flush(): Promise<void> {
    if (this.queue.length === 0) return;

    const logsToSend = [...this.queue];
    this.queue = [];

    try {
      const token = sessionStorage.getItem('token');
      await fetch(`${process.env.REACT_APP_API_URL || ''}/logs/batch`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'token': token })
        },
        body: JSON.stringify({
          logs: logsToSend,
          ...getUserContext()
        }),
      });
    } catch (error) {
      console.error('Batch logging failed:', error);
    }
  }

  /**
   * Start auto-flush timer
   */
  private startTimer(): void {
    this.timer = setInterval(() => {
      this.flush();
    }, this.flushInterval);
  }

  /**
   * Stop auto-flush and flush remaining logs
   */
  destroy(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.flush();
  }
}

// Global log batcher instance
export const globalLogBatcher = new LogBatcher();

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    globalLogBatcher.destroy();
  });
}

