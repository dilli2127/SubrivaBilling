import { handleApiResponse } from './handleApiResponse';
import { useEffect, useRef } from 'react';

// RTK Query mutation result type
interface RTKMutationResult {
  isLoading?: boolean;
  isSuccess?: boolean;
  isError?: boolean;
  data?: any;
  error?: any;
  reset?: () => void;
}

export const useHandleApiResponse = ({
  action,
  title,
  mutationResult,
  refetch,
  entityApi,
}: {
  action: 'create' | 'update' | 'delete';
  title: string;
  mutationResult: RTKMutationResult;
  refetch?: () => void;
  entityApi?: any;
}) => {
  const {
    isLoading,
    isSuccess,
    isError,
    data,
    error,
    reset,
  } = mutationResult;

  // Track previous loading state to detect transitions
  const prevLoadingRef = useRef<boolean>(false);
  // Track if we've already handled this result to prevent duplicate notifications
  const handledRef = useRef<string>('');

  useEffect(() => {
    // Track transition from loading to not-loading
    const wasLoading = prevLoadingRef.current;
    prevLoadingRef.current = isLoading || false;

    // Skip if still loading
    if (isLoading) {
      return;
    }

    // Only process if we just transitioned from loading to not-loading
    if (!wasLoading) {
      return;
    }

    // Create a unique key for this result to prevent duplicate handling
    const resultKey = `${isSuccess}-${isError}-${data?.statusCode || ''}-${error?.status || ''}`;
    
    // Skip if we've already handled this exact result
    // Since we're tracking loading transitions, this should only trigger once per mutation
    if (handledRef.current === resultKey) {
      return;
    }

    // Handle success case
    if (isSuccess && data) {
      const success = data?.statusCode === 200 || data?.status === 'success' || isSuccess;

      // Prepare refetch function for handleApiResponse
      const refetchFn = refetch || (entityApi ? () => entityApi('GetAll') : undefined);

      handleApiResponse({
        action,
        title,
        success: true,
        getAllItems: refetchFn,
      });

      handledRef.current = resultKey;

      // Reset mutation state if reset function is available
      if (reset) {
        // Delay reset slightly to ensure state updates are processed
        setTimeout(() => {
          reset();
          // Clear handled ref to allow handling new mutations
          handledRef.current = '';
        }, 100);
      }
    }

    // Handle error case
    if (isError && error) {
      const errorMessage = 
        error?.data?.message || 
        error?.message || 
        error?.error || 
        `Failed to ${action} ${title}`;

      handleApiResponse({
        action,
        title,
        success: false,
        errorMessage,
      });

      handledRef.current = resultKey;

      // Reset mutation state if reset function is available
      if (reset) {
        // Delay reset slightly to ensure state updates are processed
        setTimeout(() => {
          reset();
          // Clear handled ref to allow handling new mutations
          handledRef.current = '';
        }, 100);
      }
    }
  }, [
    isLoading,
    isSuccess,
    isError,
    data,
    error,
    action,
    title,
    refetch,
    entityApi,
    reset,
  ]);
};
