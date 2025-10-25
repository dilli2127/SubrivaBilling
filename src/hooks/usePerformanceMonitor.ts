import { useEffect, useRef, useCallback } from 'react';

/**
 * Hook to monitor component performance and detect memory leaks
 */
export const usePerformanceMonitor = (componentName: string) => {
  const renderCount = useRef(0);
  const startTime = useRef(performance.now());
  const lastRenderTime = useRef(performance.now());

  // Track render count
  useEffect(() => {
    renderCount.current += 1;
    const currentTime = performance.now();
    const timeSinceLastRender = currentTime - lastRenderTime.current;
    lastRenderTime.current = currentTime;

    // Log performance warnings
    if (renderCount.current > 10) {
      console.warn(`⚠️ ${componentName} has rendered ${renderCount.current} times - possible performance issue`);
    }

    if (timeSinceLastRender < 16) {
      console.warn(`⚠️ ${componentName} rendered too quickly (${timeSinceLastRender.toFixed(2)}ms) - possible infinite re-render`);
    }
  });

  // Track memory usage (if available)
  useEffect(() => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const usedMB = memory.usedJSHeapSize / 1048576;
      const totalMB = memory.totalJSHeapSize / 1048576;
      
      if (usedMB > 100) {
        console.warn(`⚠️ High memory usage detected: ${usedMB.toFixed(2)}MB / ${totalMB.toFixed(2)}MB`);
      }
    }
  }, []);

  // Cleanup function
  const cleanup = useCallback(() => {
    const totalTime = performance.now() - startTime.current;
    console.log(`📊 ${componentName} Performance Stats:`, {
      totalRenders: renderCount.current,
      totalTime: `${totalTime.toFixed(2)}ms`,
      avgRenderTime: `${(totalTime / renderCount.current).toFixed(2)}ms`,
    });
  }, [componentName]);

  return {
    renderCount: renderCount.current,
    cleanup,
  };
};

/**
 * Hook to detect memory leaks in event listeners
 */
export const useMemoryLeakDetector = () => {
  const listeners = useRef<Set<() => void>>(new Set());

  const addListener = useCallback((cleanup: () => void) => {
    listeners.current.add(cleanup);
  }, []);

  const removeListener = useCallback((cleanup: () => void) => {
    listeners.current.delete(cleanup);
  }, []);

  // Cleanup all listeners on unmount
  useEffect(() => {
    return () => {
      listeners.current.forEach(cleanup => cleanup());
      listeners.current.clear();
    };
  }, []);

  return {
    addListener,
    removeListener,
    listenerCount: listeners.current.size,
  };
};

/**
 * Hook to optimize expensive calculations
 */
export const useExpensiveCalculation = <T>(
  calculation: () => T,
  dependencies: any[],
  options?: {
    debounceMs?: number;
    maxCacheSize?: number;
  }
) => {
  const cache = useRef<Map<string, T>>(new Map());
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const debounceMs = options?.debounceMs || 100;
  const maxCacheSize = options?.maxCacheSize || 50;

  const getCachedResult = useCallback((key: string) => {
    return cache.current.get(key);
  }, []);

  const setCachedResult = useCallback((key: string, result: T) => {
    // Clear cache if it gets too large
    if (cache.current.size >= maxCacheSize) {
      const firstKey = cache.current.keys().next().value;
      if (firstKey !== undefined) {
        cache.current.delete(firstKey);
      }
    }
    cache.current.set(key, result);
  }, [maxCacheSize]);

  const calculateWithDebounce = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      const key = JSON.stringify(dependencies);
      const cached = getCachedResult(key);
      
      if (cached) {
        return cached;
      }

      const result = calculation();
      setCachedResult(key, result);
    }, debounceMs);
  }, [calculation, dependencies, debounceMs, getCachedResult, setCachedResult]);

  useEffect(() => {
    calculateWithDebounce();
  }, dependencies);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    cacheSize: cache.current.size,
    clearCache: () => cache.current.clear(),
  };
};
