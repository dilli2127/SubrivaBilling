import { useState, useEffect, useRef, useMemo, useCallback } from 'react';

export interface InfiniteDropdownOptions {
  queryHook: any; // RTK Query hook (UseQuery type)
  limit?: number; // Items per page (default: 20)
  searchDebounceMs?: number; // Debounce delay (default: 300ms)
  scrollThreshold?: number; // Scroll percentage to trigger load (default: 0.7 = 70%)
}

export interface InfiniteDropdownResult {
  items: any[]; // All accumulated items
  loading: boolean; // Loading state
  searchString: string; // Current search string
  setSearchString: (value: string) => void; // Update search
  hasMore: boolean; // Whether more items exist
  handlePopupScroll: (e: React.UIEvent<HTMLDivElement>) => void; // Scroll handler
  onDropdownVisibleChange: (open: boolean) => void; // Handle dropdown open/close
}

/**
 * Reusable hook for infinite scroll dropdowns with server-side search
 * 
 * @example
 * const categoryDropdown = useInfiniteDropdown({
 *   queryHook: apiSlice.useGetCategoryQuery,
 *   limit: 20,
 * });
 * 
 * <Select
 *   onSearch={categoryDropdown.setSearchString}
 *   onPopupScroll={categoryDropdown.handlePopupScroll}
 *   onDropdownVisibleChange={categoryDropdown.onDropdownVisibleChange}
 *   loading={categoryDropdown.loading && categoryDropdown.items.length === 0}
 *   filterOption={false}
 * >
 *   {categoryDropdown.items.map(item => ...)}
 * </Select>
 */
export const useInfiniteDropdown = ({
  queryHook,
  limit = 20,
  searchDebounceMs = 300,
  scrollThreshold = 0.7,
}: InfiniteDropdownOptions): InfiniteDropdownResult => {
  // State
  const [searchString, setSearchString] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [allItems, setAllItems] = useState<any[]>([]);
  const [hasMore, setHasMore] = useState(true);
  
  // Refs
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLoadingMoreRef = useRef(false);
  const isInitialSearchRef = useRef(true);

  // Debounce search input
  useEffect(() => {
    if (isInitialSearchRef.current) {
      isInitialSearchRef.current = false;
      return;
    }

    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }
    
    searchTimerRef.current = setTimeout(() => {
      setDebouncedSearch(searchString);
      // Reset to page 1 when search changes
      setPage(1);
      setAllItems([]);
      setHasMore(true);
      isLoadingMoreRef.current = false;
    }, searchDebounceMs);

    return () => {
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current);
      }
    };
  }, [searchString, searchDebounceMs]);

  // Fetch data using the provided query hook
  // Enable refetchOnMountOrArgChange to ensure fresh data on component mount
  const { data, isLoading, isFetching, refetch } = queryHook(
    {
      pageNumber: page,
      pageLimit: limit,
      searchString: debouncedSearch,
    },
    {
      refetchOnMountOrArgChange: true, // Always fetch fresh data on mount
      refetchOnFocus: false,
      refetchOnReconnect: true, // Refetch if connection was lost
    }
  );

  // Accumulate items for infinite scroll
  useEffect(() => {
    if (data) {
      const newItems = (data as any)?.result || [];
      const totalCount = (data as any).pagination?.totalCount || (data as any).pagination?.total || 0;
      
      if (page === 1) {
        // First page - replace all items
        setAllItems(newItems);
        setHasMore(newItems.length < totalCount && newItems.length > 0);
      } else {
        // Subsequent pages - append items
        setAllItems(prev => {
          // Avoid duplicates by checking IDs
          const existingIds = new Set(prev.map((item: any) => item._id));
          const uniqueNewItems = newItems.filter((item: any) => !existingIds.has(item._id));
          const updated = [...prev, ...uniqueNewItems];
          
          // Update hasMore based on the new total
          // Stop loading if no new items were added
          setHasMore(updated.length < totalCount && uniqueNewItems.length > 0);
          
          return updated;
        });
      }
      
      // Reset loading flag when data arrives
      isLoadingMoreRef.current = false;
    }
  }, [data, page]);

  // Handle dropdown scroll for infinite loading
  const handlePopupScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    const scrollTop = target.scrollTop;
    const scrollHeight = target.scrollHeight;
    const clientHeight = target.clientHeight;
    
    // Calculate scroll percentage
    const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;
    
    // Load more when user scrolls past threshold
    // Prevent multiple simultaneous loads
    if (
      scrollPercentage > scrollThreshold && 
      hasMore && 
      !isLoading && 
      !isLoadingMoreRef.current
    ) {
      isLoadingMoreRef.current = true;
      setPage(prev => prev + 1);
    }
  }, [hasMore, isLoading, scrollThreshold]);

  // Handle dropdown visibility changes
  const onDropdownVisibleChange = useCallback((open: boolean) => {
    if (open && allItems.length === 0 && !isLoading && !isFetching) {
      refetch();
    }
  }, [allItems.length, isLoading, isFetching, refetch]);

  return useMemo(() => ({
    items: allItems,
    loading: isLoading,
    searchString,
    setSearchString,
    hasMore,
    handlePopupScroll,
    onDropdownVisibleChange,
  }), [allItems, isLoading, searchString, hasMore, handlePopupScroll, onDropdownVisibleChange]);
};

