/**
 * Quotation API Endpoints
 * 
 * Complete Quotation management with:
 * - CRUD operations
 * - Status management
 * - Convert to invoice
 * - Send to customer
 */

import { apiSlice } from '../apiSlice';
import { Quotation, QuotationDashboardStats } from '../../../../types/quotation';

export const quotationApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ==================== CRUD Operations ====================
    
    // Get all Quotations
    getQuotations: builder.query<any, any>({
      query: (params) => ({
        url: '/quotations',
        method: 'GET',
        params,
      }),
      providesTags: ['Quotation'],
    }),
    
    // Get single Quotation by ID
    getQuotationById: builder.query<any, string>({
      query: (id) => ({
        url: `/quotations/${id}`,
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: 'Quotation', id }],
    }),
    
    // Create Quotation
    createQuotation: builder.mutation<any, Partial<Quotation>>({
      query: (data) => ({
        url: '/quotations',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Quotation'],
    }),
    
    // Update Quotation
    updateQuotation: builder.mutation<any, { id: string; data: Partial<Quotation> }>({
      query: ({ id, data }) => ({
        url: `/quotations/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Quotation', id },
        'Quotation',
      ],
    }),
    
    // Delete Quotation
    deleteQuotation: builder.mutation<any, string>({
      query: (id) => ({
        url: `/quotations/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Quotation'],
    }),
    
    // ==================== Status & Actions ====================
    
    // Send Quotation to Customer
    sendQuotation: builder.mutation<any, { id: string; email?: string; message?: string }>({
      query: ({ id, email, message }) => ({
        url: `/quotations/${id}/send`,
        method: 'POST',
        body: { email, message },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Quotation', id },
        'Quotation',
      ],
    }),
    
    // Mark Quotation as Accepted
    acceptQuotation: builder.mutation<any, { id: string; notes?: string }>({
      query: ({ id, notes }) => ({
        url: `/quotations/${id}/accept`,
        method: 'PATCH',
        body: { notes },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Quotation', id },
        'Quotation',
      ],
    }),
    
    // Mark Quotation as Rejected
    rejectQuotation: builder.mutation<any, { id: string; reason?: string }>({
      query: ({ id, reason }) => ({
        url: `/quotations/${id}/reject`,
        method: 'PATCH',
        body: { reason },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Quotation', id },
        'Quotation',
      ],
    }),
    
    // Convert Quotation to Invoice/Sales Record
    convertQuotationToInvoice: builder.mutation<any, {
      id: string;
      invoice_date?: string;
      payment_mode?: string;
      is_paid?: boolean;
      is_partially_paid?: boolean;
      paid_amount?: number;
      notes?: string;
    }>({
      query: ({ id, ...data }) => ({
        url: `/quotations/${id}/convert`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Quotation', id },
        'Quotation',
        'SalesRecord',
      ],
    }),
    
    // ==================== Dashboard & Reports ====================
    
    // Get Quotation Dashboard Stats
    getQuotationDashboardStats: builder.query<QuotationDashboardStats, void>({
      query: () => ({
        url: '/quotations/stats/dashboard',
        method: 'GET',
      }),
      providesTags: ['Quotation'],
    }),
    
    // Get Expired Quotations
    getExpiredQuotations: builder.query<any, void>({
      query: () => ({
        url: '/quotations',
        method: 'GET',
        params: { expired: true },
      }),
      providesTags: ['Quotation'],
    }),
    
    // Get Pending Quotations (sent but not responded)
    getPendingQuotations: builder.query<any, void>({
      query: () => ({
        url: '/quotations',
        method: 'GET',
        params: { status: 'sent' },
      }),
      providesTags: ['Quotation'],
    }),
  }),
});

// Export hooks for usage in components
export const {
  // CRUD
  useGetQuotationsQuery,
  useGetQuotationByIdQuery,
  useCreateQuotationMutation,
  useUpdateQuotationMutation,
  useDeleteQuotationMutation,
  
  // Actions
  useSendQuotationMutation,
  useAcceptQuotationMutation,
  useRejectQuotationMutation,
  useConvertQuotationToInvoiceMutation,
  
  // Dashboard & Reports
  useGetQuotationDashboardStatsQuery,
  useGetExpiredQuotationsQuery,
  useGetPendingQuotationsQuery,
} = quotationApi;

