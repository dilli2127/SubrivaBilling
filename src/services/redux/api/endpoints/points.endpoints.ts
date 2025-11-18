/**
 * Unified Points System API Endpoints
 * 
 * Handles both:
 * - Purchase rewards (5% earn rate)
 * - Return refunds (100% as points)
 */

import { apiSlice } from '../apiSlice';
import { 
  CustomerPoints, 
  PointsTransaction, 
  PointsDashboardStats,
  EarnPointsRequest,
  RedeemPointsRequest 
} from '../../../../types/customerPoints';

export const pointsApi = apiSlice.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    // ==================== Customer Points ====================
    
    // Get customer points balance
    getCustomerPoints: builder.query<CustomerPoints, string>({
      query: (customerId) => ({
        url: `/customers/${customerId}/points`,
        method: 'GET',
      }),
      providesTags: (result, error, customerId) => [{ type: 'CustomerPoints', id: customerId }],
    }),
    
    // Get customer points history
    getCustomerPointsHistory: builder.query<any, { customerId: string; page?: number; limit?: number }>({
      query: ({ customerId, page = 1, limit = 20 }) => ({
        url: `/customers/${customerId}/points/history`,
        method: 'POST',
        body: { page, limit },
      }),
      providesTags: ['PointsTransaction'],
    }),
    
    // Get all customers with points (for admin)
    getAllCustomerPoints: builder.query<any, any>({
      query: (params) => ({
        url: '/points/customers',
        method: 'POST',
        body: params,
      }),
      providesTags: ['CustomerPoints'],
    }),
    
    // ==================== Earning Points ====================
    
    // Earn points from purchase (auto-called after sale)
    earnPointsFromPurchase: builder.mutation<any, EarnPointsRequest>({
      query: (data) => ({
        url: '/points/earn-purchase',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { customer_id }) => [
        { type: 'CustomerPoints', id: customer_id },
        'PointsTransaction',
      ],
    }),
    
    // Earn points from return (auto-called when return approved)
    earnPointsFromReturn: builder.mutation<any, {
      customer_id: string;
      sales_return_id: string;
      return_number: string;
      return_amount: number;
    }>({
      query: (data) => ({
        url: '/points/earn-return',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { customer_id }) => [
        { type: 'CustomerPoints', id: customer_id },
        'PointsTransaction',
      ],
    }),
    
    // ==================== Redeeming Points ====================
    
    // Redeem points during checkout
    redeemPoints: builder.mutation<any, { customerId: string; data: RedeemPointsRequest }>({
      query: ({ customerId, data }) => ({
        url: `/customers/${customerId}/points/redeem`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { customerId }) => [
        { type: 'CustomerPoints', id: customerId },
        'PointsTransaction',
      ],
    }),
    
    // ==================== Dashboard & Reports ====================
    
    // Get points dashboard statistics
    getPointsDashboardStats: builder.query<PointsDashboardStats, void>({
      query: () => ({
        url: '/points/dashboard/stats',
        method: 'GET',
      }),
      providesTags: ['CustomerPoints'],
    }),
    
    // Get customers with expiring points
    getExpiringPoints: builder.query<any, { days?: number }>({
      query: (params) => ({
        url: '/points/expiring',
        method: 'GET',
        params,
      }),
      providesTags: ['PointsTransaction'],
    }),
  }),
});

// Export hooks for usage in components
export const {
  // Customer Points
  useGetCustomerPointsQuery,
  useGetCustomerPointsHistoryQuery,
  useGetAllCustomerPointsQuery,
  
  // Earning
  useEarnPointsFromPurchaseMutation,
  useEarnPointsFromReturnMutation,
  
  // Redemption
  useRedeemPointsMutation,
  
  // Dashboard
  useGetPointsDashboardStatsQuery,
  useGetExpiringPointsQuery,
} = pointsApi;

