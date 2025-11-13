/**
 * Sales Returns Type Definitions
 */

export type ReturnReason = 
  | 'damaged'
  | 'wrong_item'
  | 'expired'
  | 'defective'
  | 'customer_request'
  | 'other';

export type RefundType = 
  | 'cash'
  | 'card'
  | 'upi'
  | 'bank_transfer'
  | 'points';

export type RefundStatus = 
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed';

export type ReturnStatus = 
  | 'draft'
  | 'pending_approval'
  | 'approved'
  | 'rejected'
  | 'completed'
  | 'cancelled';

export type ApprovalStatus = 
  | 'pending'
  | 'approved'
  | 'rejected';

export type ItemCondition = 
  | 'good'
  | 'damaged'
  | 'expired'
  | 'defective';

export type RestockStatus = 
  | 'pending'
  | 'restocked'
  | 'scrapped'
  | 'rma';

export interface SalesReturnItem {
  _id?: string;
  sales_return_id?: string;
  sales_record_item_id?: string;
  
  // Product Details
  product_id: string;
  product_name: string;
  variant_id?: string;
  variant_name?: string;
  category_id?: string;
  category_name?: string;
  unit_id?: string;
  unit_name?: string;
  
  // Stock Reference
  stock_id?: string;
  batch_no?: string;
  expiry_date?: string;
  
  // Quantities
  quantity: number;
  loose_qty?: number;
  max_quantity?: number; // Original sale quantity
  
  // Pricing
  unit_price: number;
  tax_percentage?: number;
  discount?: number;
  discount_type?: 'percentage' | 'amount';
  line_total: number;
  
  // Condition
  item_condition?: ItemCondition;
  condition_notes?: string;
  
  // Restocking
  restock_status?: RestockStatus;
  restocked_to_warehouse_id?: string;
  restocked_date?: string;
  
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SalesReturn {
  _id: string;
  return_number: string;
  return_date: string;
  
  // Original Sale Reference
  sales_record_id: string;
  invoice_number?: string;
  invoice_date?: string;
  
  // Customer Details
  customer_id: string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  
  // Return Details
  return_reason?: ReturnReason;
  return_reason_notes?: string;
  
  // Financial
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  
  // Refund Information
  refund_type: RefundType;
  refund_amount: number;
  refund_status?: RefundStatus;
  refund_date?: string;
  refund_reference?: string;
  
  // Approval Workflow
  status: ReturnStatus;
  approval_status?: ApprovalStatus;
  approved_by?: string;
  approved_by_name?: string;
  approved_date?: string;
  rejection_reason?: string;
  
  // Stock Impact
  stock_returned?: boolean;
  stock_returned_date?: string;
  
  // Additional Information
  notes?: string;
  internal_notes?: string;
  attachments?: any[];
  
  // Audit Fields
  created_by_id: string;
  created_by_name?: string;
  updated_by_id?: string;
  updated_by_name?: string;
  
  // Multi-tenancy
  organisation_id: string;
  branch_id?: string;
  tenant_id: string;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  
  // Relations
  items?: SalesReturnItem[];
  CustomerItem?: any;
  SalesRecordItem?: any;
  approvals?: ReturnApproval[];
}

export interface ReturnApproval {
  _id: string;
  sales_return_id: string;
  return_number?: string;
  action: 'submit' | 'approve' | 'reject' | 'cancel';
  action_date: string;
  user_id: string;
  user_name?: string;
  user_role?: string;
  comments?: string;
  previous_status?: string;
  new_status?: string;
  createdAt: string;
}

export interface SalesReturnDashboardStats {
  total_returns: number;
  pending_approval: number;
  approved_returns: number;
  rejected_returns: number;
  total_refund_amount: number;
  cash_refunds: number;
  store_credit_issued: number;
  items_returned: number;
  returns_this_month: number;
  returns_last_month: number;
}

