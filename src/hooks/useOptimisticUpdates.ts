import { useCallback } from 'react';

interface OptimisticUpdateOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: any) => void;
  onSettled?: () => void;
}

export const useOptimisticUpdates = <T>() => {
  const createOptimisticUpdate = useCallback(
    <K>(
      updateFn: (oldData: K[], newItem: T) => K[],
      revertFn: (oldData: K[], newItem: T) => K[]
    ) => {
      return {
        optimisticUpdate: updateFn,
        revertUpdate: revertFn,
      };
    },
    []
  );

  const executeOptimisticUpdate = useCallback(
    async <K>(
      data: K[],
      newItem: T,
      updateFn: (oldData: K[], newItem: T) => K[],
      revertFn: (oldData: K[], newItem: T) => K[],
      apiCall: () => Promise<T>,
      options?: OptimisticUpdateOptions<T>
    ) => {
      // Apply optimistic update
      const optimisticData = updateFn(data, newItem);
      
      try {
        // Make API call
        const result = await apiCall();
        
        // Success - keep the optimistic update
        options?.onSuccess?.(result);
        return { data: optimisticData, error: null };
      } catch (error) {
        // Error - revert the optimistic update
        const revertedData = revertFn(data, newItem);
        options?.onError?.(error);
        return { data: revertedData, error };
      } finally {
        options?.onSettled?.();
      }
    },
    []
  );

  return {
    createOptimisticUpdate,
    executeOptimisticUpdate,
  };
};
