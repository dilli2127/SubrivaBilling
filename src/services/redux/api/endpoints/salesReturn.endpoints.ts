/**
 * Sales Return API Endpoints
 * 
 * Complete Sales Return management with:
 * - CRUD operations
 * - Approval workflow
 * - Status management
 * - Points-based refunds
 * - Refund tracking
 */

import { apiSlice } from '../apiSlice';
import { SalesReturn, SalesReturnDashboardStats } from '../../../../types/salesReturn';

export const salesReturnApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ==================== CRUD Operations ====================
    
    // Get all Sales Returns
    getSalesReturns: builder.query<any, any>({
      query: (params) => ({
        url: '/sales_returns',
        method: 'GET',
        params,
      }),
      providesTags: ['SalesReturn'],
    }),
    
    // Get single Sales Return by ID
    getSalesReturnById: builder.query<any, string>({
      query: (id) => ({
        url: `/sales_returns/${id}`,
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: 'SalesReturn', id }],
    }),
    
    // Create Sales Return
    createSalesReturn: builder.mutation<any, Partial<SalesReturn>>({
      query: (data) => ({
        url: '/sales_returns',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['SalesReturn'],
    }),
    
    // Update Sales Return
    updateSalesReturn: builder.mutation<any, { id: string; data: Partial<SalesReturn> }>({
      query: ({ id, data }) => ({
        url: `/sales_returns/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'SalesReturn', id },
        'SalesReturn',
      ],
    }),
    
    // Delete Sales Return
    deleteSalesReturn: builder.mutation<any, string>({
      query: (id) => ({
        url: `/sales_returns/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['SalesReturn'],
    }),
    
    // ==================== Approval Workflow ====================
    
    // Submit Return for Approval
    submitSalesReturn: builder.mutation<any, { id: string; comments?: string }>({
      query: ({ id, comments }) => ({
        url: `/sales_returns/${id}/submit`,
        method: 'PATCH',
        body: { comments },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'SalesReturn', id },
        'SalesReturn',
      ],
    }),
    
    // Approve Return
    approveSalesReturn: builder.mutation<any, { id: string; comments?: string; auto_restock?: boolean }>({
      query: ({ id, comments, auto_restock = true }) => ({
        url: `/sales_returns/${id}/approve`,
        method: 'PATCH',
        body: { comments, auto_restock },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'SalesReturn', id },
        'SalesReturn',
        'StockAudit', // Invalidate stock if restocked
      ],
    }),
    
    // Reject Return
    rejectSalesReturn: builder.mutation<any, { id: string; reason: string }>({
      query: ({ id, reason }) => ({
        url: `/sales_returns/${id}/reject`,
        method: 'PATCH',
        body: { reason },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'SalesReturn', id },
        'SalesReturn',
      ],
    }),
    
    // ==================== Status & Actions ====================
    
    // Complete Return (mark as completed)
    completeSalesReturn: builder.mutation<any, { id: string; notes?: string }>({
      query: ({ id, notes }) => ({
        url: `/sales_returns/${id}/complete`,
        method: 'PATCH',
        body: { notes },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'SalesReturn', id },
        'SalesReturn',
      ],
    }),
    
    // Cancel Return
    cancelSalesReturn: builder.mutation<any, { id: string; reason?: string }>({
      query: ({ id, reason }) => ({
        url: `/sales_returns/${id}/cancel`,
        method: 'PATCH',
        body: { reason },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'SalesReturn', id },
        'SalesReturn',
      ],
    }),
    
    // ==================== Dashboard & Reports ====================
    
    // Get Sales Return Dashboard Stats
    getReturnDashboardStats: builder.query<SalesReturnDashboardStats, void>({
      query: () => ({
        url: '/sales_returns/stats/dashboard',
        method: 'GET',
      }),
      providesTags: ['SalesReturn'],
    }),
    
    // Get Pending Approvals
    getPendingReturnApprovals: builder.query<any, void>({
      query: () => ({
        url: '/sales_returns',
        method: 'GET',
        params: { status: 'pending_approval' },
      }),
      providesTags: ['SalesReturn'],
    }),
    
    // Get Recent Returns
    getRecentReturns: builder.query<any, { limit?: number }>({
      query: (params) => ({
        url: '/sales_returns',
        method: 'GET',
        params: { ...params, sort: 'createdAt', order: 'DESC' },
      }),
      providesTags: ['SalesReturn'],
    }),
  }),
});

// Export hooks for usage in components
export const {
  // CRUD
  useGetSalesReturnsQuery,
  useGetSalesReturnByIdQuery,
  useCreateSalesReturnMutation,
  useUpdateSalesReturnMutation,
  useDeleteSalesReturnMutation,
  
  // Approval Workflow
  useSubmitSalesReturnMutation,
  useApproveSalesReturnMutation,
  useRejectSalesReturnMutation,
  
  // Actions
  useCompleteSalesReturnMutation,
  useCancelSalesReturnMutation,
  
  // Dashboard & Reports
  useGetReturnDashboardStatsQuery,
  useGetPendingReturnApprovalsQuery,
  useGetRecentReturnsQuery,
} = salesReturnApi;

