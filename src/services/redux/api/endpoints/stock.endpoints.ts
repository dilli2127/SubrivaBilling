import { apiSlice } from '../apiSlice';
import { API_ROUTES } from '../../../api/utils';

/**
 * Stock Operations API Endpoints
 * Injected into the main API slice without modifying apiSlice.ts
 */
export const stockApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Stock Operations
    revertStockFromBranch: builder.mutation({
      query: (data: { [key: string]: any }) => {
        const route = API_ROUTES.StockRevertFromBranch.RevertStock;
        return {
          url: route.endpoint,
          method: route.method,
          body: data,
        };
      },
    }),

    // Stock Available endpoints
    getProductStockCount: builder.query({
      query: (params: { [key: string]: any } = {}) => {
        const route = API_ROUTES.StockAvailable.GetProductStockCount;
        return {
          url: route.endpoint,
          method: route.method,
          body: params,
        };
      },
    }),

    getBranchStockCount: builder.query({
      query: (params: { [key: string]: any } = {}) => {
        const route = API_ROUTES.BranchStockAvailable.GetBranchStockCount;
        return {
          url: route.endpoint,
          method: route.method,
          body: params,
        };
      },
    }),
  }),
  overrideExisting: false,
});

// Export hooks for usage in components
export const {
  useRevertStockFromBranchMutation,
  useGetProductStockCountQuery,
  useGetBranchStockCountQuery,
} = stockApi;

