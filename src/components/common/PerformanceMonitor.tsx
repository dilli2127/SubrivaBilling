import React, { useEffect, useCallback, useState } from 'react';
import { logErrorToBackend } from '../../helpers/errorLogging';

interface PerformanceMetrics {
  pageLoadTime: number;
  memoryUsage: number;
  errorCount: number;
  userInteractions: number;
}

interface PerformanceMonitorProps {
  onMetricsUpdate?: (metrics: PerformanceMetrics) => void;
  enableErrorTracking?: boolean;
  enablePerformanceTracking?: boolean;
}

const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  onMetricsUpdate,
  enableErrorTracking = true,
  enablePerformanceTracking = true,
}) => {
  const [metrics, setMetrics] = React.useState<PerformanceMetrics>({
    pageLoadTime: 0,
    memoryUsage: 0,
    errorCount: 0,
    userInteractions: 0,
  });

  // Memory cleanup utility
  const triggerMemoryCleanup = useCallback(() => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      if (memory && memory.usedJSHeapSize > 100 * 1024 * 1024) { // 100MB
        // Force garbage collection if available (Chrome DevTools)
        if (window.gc) {
          window.gc();
        }
        console.info('Memory cleanup triggered');
      }
    }
  }, []);

  // Track page load performance
  useEffect(() => {
    if (enablePerformanceTracking) {
      const startTime = performance.now();
      
      const handleLoad = () => {
        const loadTime = performance.now() - startTime;
        setMetrics(prev => ({ ...prev, pageLoadTime: loadTime }));
      };

      if (document.readyState === 'complete') {
        handleLoad();
      } else {
        window.addEventListener('load', handleLoad);
        return () => window.removeEventListener('load', handleLoad);
      }
    }
  }, [enablePerformanceTracking]);

  // Track memory usage with optimized interval
  useEffect(() => {
    if (enablePerformanceTracking && 'memory' in performance) {
      const updateMemoryUsage = () => {
        const memory = (performance as any).memory;
        if (memory) {
          const currentMemory = memory.usedJSHeapSize / 1024 / 1024; // Convert to MB
          setMetrics(prev => {
            // Only update if memory usage changed significantly (avoid unnecessary re-renders)
            if (Math.abs(prev.memoryUsage - currentMemory) > 1) {
              return { 
                ...prev, 
                memoryUsage: currentMemory
              };
            }
            return prev;
          });
        }
      };

      // Initial check
      updateMemoryUsage();
      
      // Check every 10 seconds instead of 5 to reduce overhead
      const interval = setInterval(updateMemoryUsage, 10000);
      return () => clearInterval(interval);
    }
  }, [enablePerformanceTracking]);

  // Memoized error handlers
  const handleError = useCallback((event: ErrorEvent) => {
    console.error('Global error:', event.error);
    setMetrics(prev => ({ ...prev, errorCount: prev.errorCount + 1 }));
    
    // Log to backend securely
    if (event.error instanceof Error) {
      logErrorToBackend(event.error).catch(console.error);
    }
  }, []);

  const handleUnhandledRejection = useCallback((event: PromiseRejectionEvent) => {
    console.error('Unhandled promise rejection:', event.reason);
    setMetrics(prev => ({ ...prev, errorCount: prev.errorCount + 1 }));
    
    // Log to backend securely
    const error = event.reason instanceof Error 
      ? event.reason 
      : new Error(String(event.reason));
    logErrorToBackend(error).catch(console.error);
  }, []);

  // Track errors
  useEffect(() => {
    if (enableErrorTracking) {
      window.addEventListener('error', handleError);
      window.addEventListener('unhandledrejection', handleUnhandledRejection);

      return () => {
        window.removeEventListener('error', handleError);
        window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      };
    }
  }, [enableErrorTracking, handleError, handleUnhandledRejection]);

  // Memoized user interaction handler
  const handleUserInteraction = useCallback(() => {
    setMetrics(prev => ({ ...prev, userInteractions: prev.userInteractions + 1 }));
  }, []);

  // Track user interactions with optimized cleanup
  useEffect(() => {
    if (enablePerformanceTracking) {
      const events = ['click', 'keydown', 'scroll', 'input'];
      const eventHandlers = new Map();
      
      events.forEach(event => {
        const handler = () => handleUserInteraction();
        eventHandlers.set(event, handler);
        document.addEventListener(event, handler, { passive: true });
      });

      return () => {
        events.forEach(event => {
          const handler = eventHandlers.get(event);
          if (handler) {
            document.removeEventListener(event, handler);
            eventHandlers.delete(event);
          }
        });
      };
    }
  }, [enablePerformanceTracking, handleUserInteraction]);

  // Notify parent component of metrics updates
  useEffect(() => {
    onMetricsUpdate?.(metrics);
  }, [metrics]); // Remove onMetricsUpdate from dependencies to prevent unnecessary re-renders

  // Log performance warnings with improved thresholds
  useEffect(() => {
    if (metrics.pageLoadTime > 3000) {
      console.warn(`Slow page load detected: ${metrics.pageLoadTime}ms`);
    }
    
    // More granular memory warnings
    if (metrics.memoryUsage > 150) {
      console.error(`Critical memory usage detected: ${metrics.memoryUsage}MB - Consider refreshing the page`);
      triggerMemoryCleanup();
    } else if (metrics.memoryUsage > 100) {
      console.warn(`High memory usage detected: ${metrics.memoryUsage}MB - Monitor for memory leaks`);
      triggerMemoryCleanup();
    } else if (metrics.memoryUsage > 80) {
      console.info(`Memory usage is elevated: ${metrics.memoryUsage}MB`);
    }
    
    if (metrics.errorCount > 10) {
      console.error(`Critical error count detected: ${metrics.errorCount} errors`);
    } else if (metrics.errorCount > 5) {
      console.warn(`High error count detected: ${metrics.errorCount} errors`);
    }
  }, [metrics, triggerMemoryCleanup]);

  // This component doesn't render anything visible
  return null;
};

export default PerformanceMonitor; 