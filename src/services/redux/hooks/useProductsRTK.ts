import { useGetProductsQuery } from '../api/apiSlice';

export const useProductsRTK = (params: { page?: number; limit?: number; [key: string]: any } = {}) => {
  const {
    data,
    error,
    isLoading,
    isFetching,
    refetch,
  } = useGetProductsQuery(params);

  return {
    products: (data as any)?.result || [],
    loading: isLoading,
    fetching: isFetching,
    error,
    refetch,
    total: (data as any)?.pagination?.total || 0,
    page: (data as any)?.pagination?.page || 1,
    limit: (data as any)?.pagination?.limit || 10,
  };
};
