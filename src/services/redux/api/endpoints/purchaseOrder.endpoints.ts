/**
 * Purchase Order API Endpoints
 * 
 * Complete Purchase Order management with:
 * - CRUD operations
 * - Approval workflow
 * - Status management
 * - GRN conversion
 * - Receipt tracking
 */

import { apiSlice } from '../apiSlice';
import { PurchaseOrder, PurchaseOrderReceipt, PODashboardStats } from '../../../../types/purchaseOrder';

export const purchaseOrderApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ==================== CRUD Operations ====================
    
    // Get all Purchase Orders
    getPurchaseOrders: builder.query<any, any>({
      query: (params) => ({
        url: '/purchase_orders',
        method: 'GET',
        params,
      }),
      providesTags: ['PurchaseOrder'],
    }),
    
    // Get single Purchase Order by ID
    getPurchaseOrderById: builder.query<any, string>({
      query: (id) => ({
        url: `/purchase_orders/${id}`,
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: 'PurchaseOrder', id }],
    }),
    
    // Create Purchase Order
    createPurchaseOrder: builder.mutation<any, Partial<PurchaseOrder>>({
      query: (data) => ({
        url: '/purchase_orders',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['PurchaseOrder'],
    }),
    
    // Update Purchase Order
    updatePurchaseOrder: builder.mutation<any, { id: string; data: Partial<PurchaseOrder> }>({
      query: ({ id, data }) => ({
        url: `/purchase_orders/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'PurchaseOrder', id },
        'PurchaseOrder',
      ],
    }),
    
    // Delete Purchase Order
    deletePurchaseOrder: builder.mutation<any, string>({
      query: (id) => ({
        url: `/purchase_orders/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['PurchaseOrder'],
    }),
    
    // ==================== Approval Workflow ====================
    
    // Submit PO for Approval
    submitPurchaseOrder: builder.mutation<any, { id: string; comments?: string }>({
      query: ({ id, comments }) => ({
        url: `/purchase_orders/${id}/submit`,
        method: 'PATCH',
        body: { comments },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'PurchaseOrder', id },
        'PurchaseOrder',
      ],
    }),
    
    // Approve PO
    approvePurchaseOrder: builder.mutation<any, { id: string; comments?: string }>({
      query: ({ id, comments }) => ({
        url: `/purchase_orders/${id}/approve`,
        method: 'PATCH',
        body: { comments },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'PurchaseOrder', id },
        'PurchaseOrder',
      ],
    }),
    
    // Reject PO
    rejectPurchaseOrder: builder.mutation<any, { id: string; reason: string }>({
      query: ({ id, reason }) => ({
        url: `/purchase_orders/${id}/reject`,
        method: 'PATCH',
        body: { reason },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'PurchaseOrder', id },
        'PurchaseOrder',
      ],
    }),
    
    // ==================== Status & Actions ====================
    
    // Send PO to Vendor
    sendPurchaseOrder: builder.mutation<any, { id: string; email?: string; message?: string }>({
      query: ({ id, email, message }) => ({
        url: `/purchase_orders/${id}/send`,
        method: 'PATCH',
        body: { email, message },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'PurchaseOrder', id },
        'PurchaseOrder',
      ],
    }),
    
    // Cancel PO
    cancelPurchaseOrder: builder.mutation<any, { id: string; reason?: string }>({
      query: ({ id, reason }) => ({
        url: `/purchase_orders/${id}/cancel`,
        method: 'PATCH',
        body: { reason },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'PurchaseOrder', id },
        'PurchaseOrder',
      ],
    }),
    
    // Close PO
    closePurchaseOrder: builder.mutation<any, { id: string; notes?: string }>({
      query: ({ id, notes }) => ({
        url: `/purchase_orders/${id}/close`,
        method: 'PATCH',
        body: { notes },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'PurchaseOrder', id },
        'PurchaseOrder',
      ],
    }),
    
    // ==================== GRN / Receipt Operations ====================
    
    // Convert PO to GRN (Goods Receipt Note)
    convertPOToGRN: builder.mutation<any, {
      id: string;
      items: Array<{
        po_line_item_id: string;
        received_quantity: number;
        rejected_quantity?: number;
        batch_no?: string;
        mfg_date?: string;
        expiry_date?: string;
        notes?: string;
      }>;
      vendor_invoice_no?: string;
      vendor_invoice_date?: string;
      notes?: string;
      create_stock_entries?: boolean;
    }>({
      query: ({ id, ...data }) => ({
        url: `/purchase_orders/${id}/convert-to-grn`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'PurchaseOrder', id },
        'PurchaseOrder',
        'PurchaseOrderReceipt',
        'StockAudit',
      ],
    }),
    
    // Get all Receipts/GRNs
    getPurchaseOrderReceipts: builder.query<any, any>({
      query: (params) => ({
        url: '/purchase_order_receipts',
        method: 'GET',
        params,
      }),
      providesTags: ['PurchaseOrderReceipt'],
    }),
    
    // Get Receipt by ID
    getPurchaseOrderReceiptById: builder.query<any, string>({
      query: (id) => ({
        url: `/purchase_order_receipts/${id}`,
        method: 'GET',
      }),
      providesTags: (result, error, id) => [{ type: 'PurchaseOrderReceipt', id }],
    }),
    
    // Get Receipts for specific PO
    getReceiptsForPO: builder.query<any, string>({
      query: (poId) => ({
        url: `/purchase_order_receipts`,
        method: 'GET',
        params: { purchase_order_id: poId },
      }),
      providesTags: ['PurchaseOrderReceipt'],
    }),
    
    // ==================== Dashboard & Reports ====================
    
    // Get PO Dashboard Stats
    getPODashboardStats: builder.query<PODashboardStats, void>({
      query: () => ({
        url: '/purchase_orders/stats/dashboard',
        method: 'GET',
      }),
      providesTags: ['PurchaseOrder'],
    }),
    
    // Get Pending Approvals
    getPendingApprovals: builder.query<any, void>({
      query: () => ({
        url: '/purchase_orders',
        method: 'GET',
        params: { status: 'pending_approval' },
      }),
      providesTags: ['PurchaseOrder'],
    }),
    
    // Get Overdue POs
    getOverduePOs: builder.query<any, void>({
      query: () => ({
        url: '/purchase_orders',
        method: 'GET',
        params: { overdue: true },
      }),
      providesTags: ['PurchaseOrder'],
    }),
    
    // Get PO vs GRN Comparison
    getPOvsGRNComparison: builder.query<any, string>({
      query: (poId) => ({
        url: `/purchase_orders/${poId}/comparison`,
        method: 'GET',
      }),
      providesTags: (result, error, poId) => [{ type: 'PurchaseOrder', id: poId }],
    }),
    
    // ==================== Payment Operations ====================
    
    // Create Payment for Purchase Order
    // POST /purchase_orders/:id/payments
    createPOPayment: builder.mutation<any, {
      purchase_order_id: string;
      payment_date: string;
      payment_amount: number;
      payment_mode: string;
      transaction_id?: string;
      cheque_number?: string;
      bank_name?: string;
      reference_number?: string;
      notes?: string;
      paid_by_id?: string;
      paid_by_name?: string;
      organisation_id: string;
      branch_id?: string;
      tenant_id: string;
    }>({
      query: ({ purchase_order_id, ...data }) => ({
        url: `/purchase_orders/${purchase_order_id}/payments`,
        method: 'POST',
        body: data,
      }),
      invalidatesTags: (result, error, { purchase_order_id }) => [
        { type: 'PurchaseOrder', id: purchase_order_id },
        'PurchaseOrder',
        { type: 'PurchaseOrderPayment', id: `LIST-${purchase_order_id}` },
        'PurchaseOrderPayment',
      ],
    }),
    
    // Get all Payments for a Purchase Order
    // GET /purchase_orders/:id/payments
    getPOPayments: builder.query<any, string>({
      query: (poId) => ({
        url: `/purchase_orders/${poId}/payments`,
        method: 'GET',
      }),
      providesTags: (result, error, poId) => [
        { type: 'PurchaseOrderPayment', id: `LIST-${poId}` },
        'PurchaseOrderPayment',
      ],
    }),
    
    // Get Payment by ID
    // GET /purchase_orders/:id/payments/:payment_id
    getPOPaymentById: builder.query<any, { poId: string; paymentId: string }>({
      query: ({ poId, paymentId }) => ({
        url: `/purchase_orders/${poId}/payments/${paymentId}`,
        method: 'GET',
      }),
      providesTags: (result, error, { paymentId }) => [
        { type: 'PurchaseOrderPayment', id: paymentId }
      ],
    }),
    
    // Update Payment
    // PATCH /purchase_orders/:id/payments/:payment_id
    updatePOPayment: builder.mutation<any, {
      poId: string;
      paymentId: string;
      data: {
        payment_date?: string;
        payment_amount?: number;
        payment_mode?: string;
        transaction_id?: string;
        cheque_number?: string;
        bank_name?: string;
        reference_number?: string;
        notes?: string;
      };
    }>({
      query: ({ poId, paymentId, data }) => ({
        url: `/purchase_orders/${poId}/payments/${paymentId}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (result, error, { poId, paymentId }) => [
        { type: 'PurchaseOrderPayment', id: paymentId },
        { type: 'PurchaseOrderPayment', id: `LIST-${poId}` },
        'PurchaseOrderPayment',
        { type: 'PurchaseOrder', id: poId },
        'PurchaseOrder',
      ],
    }),
    
    // Delete Payment
    // DELETE /purchase_orders/:id/payments/:payment_id
    deletePOPayment: builder.mutation<any, { poId: string; paymentId: string }>({
      query: ({ poId, paymentId }) => ({
        url: `/purchase_orders/${poId}/payments/${paymentId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, { poId, paymentId }) => [
        { type: 'PurchaseOrderPayment', id: paymentId },
        { type: 'PurchaseOrderPayment', id: `LIST-${poId}` },
        'PurchaseOrderPayment',
        { type: 'PurchaseOrder', id: poId },
        'PurchaseOrder',
      ],
    }),
  }),
});

// Export hooks for usage in components
export const {
  // CRUD
  useGetPurchaseOrdersQuery,
  useGetPurchaseOrderByIdQuery,
  useCreatePurchaseOrderMutation,
  useUpdatePurchaseOrderMutation,
  useDeletePurchaseOrderMutation,
  
  // Approval Workflow
  useSubmitPurchaseOrderMutation,
  useApprovePurchaseOrderMutation,
  useRejectPurchaseOrderMutation,
  
  // Actions
  useSendPurchaseOrderMutation,
  useCancelPurchaseOrderMutation,
  useClosePurchaseOrderMutation,
  
  // GRN/Receipts
  useConvertPOToGRNMutation,
  useGetPurchaseOrderReceiptsQuery,
  useGetPurchaseOrderReceiptByIdQuery,
  useGetReceiptsForPOQuery,
  
  // Dashboard & Reports
  useGetPODashboardStatsQuery,
  useGetPendingApprovalsQuery,
  useGetOverduePOsQuery,
  useGetPOvsGRNComparisonQuery,
  
  // Payments
  useCreatePOPaymentMutation,
  useGetPOPaymentsQuery,
  useGetPOPaymentByIdQuery,
  useUpdatePOPaymentMutation,
  useDeletePOPaymentMutation,
} = purchaseOrderApi;

