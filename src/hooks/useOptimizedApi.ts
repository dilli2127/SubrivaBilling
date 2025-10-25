import { useMemo, useCallback } from 'react';
import { apiSlice } from '../services/redux/api/apiSlice';

/**
 * Optimized hook for API calls with built-in memoization
 * Prevents unnecessary re-renders and API calls
 */
export const useOptimizedApi = () => {
  // Memoize common API calls to prevent recreation
  const commonQueries = useMemo(() => ({
    // Products
    useGetProductQuery: apiSlice.useGetProductQuery,
    useGetVariantQuery: apiSlice.useGetVariantQuery,
    useGetCategoryQuery: apiSlice.useGetCategoryQuery,
    
    // Users & Organizations
    useGetRolesQuery: apiSlice.useGetRolesQuery,
    useGetOrganisationsQuery: apiSlice.useGetOrganisationsQuery,
    useGetBranchesQuery: apiSlice.useGetBranchesQuery,
    
    // Inventory
    useGetWarehouseQuery: apiSlice.useGetWarehouseQuery,
    useGetRackQuery: apiSlice.useGetRackQuery,
    useGetVendorQuery: apiSlice.useGetVendorQuery,
    
    // Dashboard
    useGetDashboardStatsQuery: apiSlice.useGetDashboardStatsQuery,
    useGetSalesChartQuery: apiSlice.useGetSalesChartQuery,
    useGetPurchaseChartQuery: apiSlice.useGetPurchaseChartQuery,
    useGetStockAlertsQuery: apiSlice.useGetStockAlertsQuery,
  }), []);

  // Memoized data transformer
  const transformApiData = useCallback((data: any) => {
    if (!data) return { result: [], pagination: null };
    
    return {
      result: data.result || [],
      pagination: data.pagination || null,
      total: data.pagination?.total || 0,
      current: data.pagination?.current || 1,
      pageSize: data.pagination?.pageSize || 10,
    };
  }, []);

  // Memoized error handler
  const handleApiError = useCallback((error: any) => {
    console.error('API Error:', error);
    return {
      message: error?.data?.message || 'An error occurred',
      status: error?.status || 500,
    };
  }, []);

  return {
    ...commonQueries,
    transformApiData,
    handleApiError,
  };
};

/**
 * Hook for optimized data fetching with automatic memoization
 */
export const useOptimizedData = <T>(
  queryFn: () => { data: any; isLoading: boolean; error: any },
  transformFn?: (data: any) => T
) => {
  const { data, isLoading, error } = queryFn();
  
  const transformedData = useMemo(() => {
    if (!data) return null;
    return transformFn ? transformFn(data) : data;
  }, [data, transformFn]);

  const memoizedError = useMemo(() => {
    if (!error) return null;
    return {
      message: error?.data?.message || 'An error occurred',
      status: error?.status || 500,
    };
  }, [error]);

  return {
    data: transformedData,
    isLoading,
    error: memoizedError,
    hasData: !!transformedData,
    isEmpty: !isLoading && !transformedData,
  };
};

/**
 * Hook for optimized list data with pagination
 */
export const useOptimizedList = <T>(
  queryFn: () => { data: any; isLoading: boolean; error: any },
  options?: {
    pageSize?: number;
    currentPage?: number;
    searchTerm?: string;
  }
) => {
  const { data, isLoading, error } = queryFn();
  
  const listData = useMemo(() => {
    if (!data?.result) return [];
    return data.result as T[];
  }, [data?.result]);

  const pagination = useMemo(() => {
    if (!data?.pagination) return null;
    return {
      current: data.pagination.current || 1,
      pageSize: data.pagination.pageSize || 10,
      total: data.pagination.total || 0,
      totalPages: Math.ceil((data.pagination.total || 0) / (data.pagination.pageSize || 10)),
    };
  }, [data?.pagination]);

  const filteredData = useMemo(() => {
    if (!options?.searchTerm || !listData.length) return listData;
    
    const searchLower = options.searchTerm.toLowerCase();
    return listData.filter((item: any) => 
      Object.values(item).some(value => 
        typeof value === 'string' && value.toLowerCase().includes(searchLower)
      )
    );
  }, [listData, options?.searchTerm]);

  return {
    data: filteredData,
    isLoading,
    error,
    pagination,
    hasData: listData.length > 0,
    isEmpty: !isLoading && listData.length === 0,
    totalItems: listData.length,
    filteredItems: filteredData.length,
  };
};
