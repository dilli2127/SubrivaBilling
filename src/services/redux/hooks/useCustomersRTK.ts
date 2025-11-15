import { apiSlice } from '../api/apiSlice';

export const useCustomersRTK = (params: { pageNumber?: number; pageLimit?: number; [key: string]: any } = {}) => {
  const {
    data,
    error,
    isLoading,
    isFetching,
    refetch,
  } = apiSlice.useGetCustomerQuery(params);

  return {
    customers: (data as any)?.result || [],
    loading: isLoading,
    fetching: isFetching,
    error,
    refetch,
    total: (data as any)?.pagination?.total || 0,
    page: (data as any)?.pagination?.page || 1,
    limit: (data as any)?.pagination?.limit || 10,
  };
};
