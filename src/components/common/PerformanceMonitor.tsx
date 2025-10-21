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

  // Track memory usage
  useEffect(() => {
    if (enablePerformanceTracking && 'memory' in performance) {
      const updateMemoryUsage = () => {
        const memory = (performance as any).memory;
        if (memory) {
          setMetrics(prev => ({ 
            ...prev, 
            memoryUsage: memory.usedJSHeapSize / 1024 / 1024 // Convert to MB
          }));
        }
      };

      const interval = setInterval(updateMemoryUsage, 5000); // Update every 5 seconds
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

  // Track user interactions
  useEffect(() => {
    if (enablePerformanceTracking) {
      const events = ['click', 'keydown', 'scroll', 'input'];
      events.forEach(event => {
        document.addEventListener(event, handleUserInteraction, { passive: true });
      });

      return () => {
        events.forEach(event => {
          document.removeEventListener(event, handleUserInteraction);
        });
      };
    }
  }, [enablePerformanceTracking, handleUserInteraction]);

  // Notify parent component of metrics updates
  useEffect(() => {
    onMetricsUpdate?.(metrics);
  }, [metrics, onMetricsUpdate]);

  // Log performance warnings
  useEffect(() => {
    if (metrics.pageLoadTime > 3000) {
      console.warn(`Slow page load detected: ${metrics.pageLoadTime}ms`);
    }
    
    if (metrics.memoryUsage > 100) {
      console.warn(`High memory usage detected: ${metrics.memoryUsage}MB`);
    }
    
    if (metrics.errorCount > 5) {
      console.warn(`High error count detected: ${metrics.errorCount} errors`);
    }
  }, [metrics]);

  // This component doesn't render anything visible
  return null;
};

export default PerformanceMonitor; 