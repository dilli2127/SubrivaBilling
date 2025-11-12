import { BaseEntity } from './entities';

// Purchase Order Status
export type POStatus = 
  | 'draft'           // Created but not sent
  | 'pending_approval' // Submitted for approval
  | 'approved'        // Approved by manager
  | 'rejected'        // Rejected by manager
  | 'sent'            // Sent to vendor
  | 'confirmed'       // Vendor confirmed
  | 'partially_received' // Some items received
  | 'fully_received'  // All items received
  | 'cancelled'       // Cancelled
  | 'closed';         // Completed and closed

// Payment Terms
export type PaymentTerms = 
  | 'immediate'       // Pay immediately
  | 'net_15'          // Pay within 15 days
  | 'net_30'          // Pay within 30 days
  | 'net_60'          // Pay within 60 days
  | 'net_90'          // Pay within 90 days
  | 'custom';         // Custom terms

// Purchase Order Line Item
export interface POLineItem extends BaseEntity {
  purchase_order_id: string;
  product_id: string;
  product_name?: string;
  variant_name?: string;
  description?: string;
  quantity: number;
  unit_price: number;
  tax_percentage: number;
  discount: number;
  discount_type: 'percentage' | 'amount';
  line_total: number;
  received_quantity: number;
  pending_quantity: number;
  expected_delivery_date?: string;
  notes?: string;
  
  // Relations
  ProductItem?: {
    _id: string;
    name: string;
    code?: string;
    VariantItem?: {
      variant_name: string;
      pack_size?: number;
    };
    CategoryItem?: {
      tax_percentage: number;
    };
  };
}

// Purchase Order Main Entity
export interface PurchaseOrder extends BaseEntity {
  po_number: string;
  po_date: string;
  vendor_id: string;
  vendor_name?: string;
  vendor_email?: string;
  vendor_phone?: string;
  
  // Status & Workflow
  status: POStatus;
  approval_status?: 'pending' | 'approved' | 'rejected';
  approved_by?: string;
  approved_date?: string;
  rejection_reason?: string;
  
  // Dates
  expected_delivery_date?: string;
  actual_delivery_date?: string;
  
  // Payment Terms
  payment_terms: PaymentTerms;
  payment_terms_days?: number;
  payment_due_date?: string;
  
  // Shipping Details
  shipping_address?: string;
  shipping_city?: string;
  shipping_state?: string;
  shipping_pincode?: string;
  shipping_method?: string;
  shipping_cost?: number;
  
  // Financial
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  paid_amount: number;
  outstanding_amount: number;
  
  // Line Items
  items: POLineItem[];
  
  // Receipts/GRN
  received_count: number; // Number of times goods received
  is_partially_received: boolean;
  is_fully_received: boolean;
  
  // Additional Info
  notes?: string;
  terms_conditions?: string;
  internal_notes?: string;
  
  // Created By
  created_by_id?: string;
  created_by_name?: string;
  
  // Warehouse
  warehouse_id?: string;
  warehouse_name?: string;
  
  // Relations
  VendorItem?: {
    _id: string;
    vendor_name: string;
    company_name?: string;
    email?: string;
    phone?: string;
    address?: string;
  };
  
  CreatedByUser?: {
    _id: string;
    username: string;
    email?: string;
  };
  
  ApprovedByUser?: {
    _id: string;
    username: string;
  };
  
  WarehouseItem?: {
    _id: string;
    warehouse_name: string;
    warehouse_code?: string;
  };
}

// Purchase Order Receipt/GRN
export interface PurchaseOrderReceipt extends BaseEntity {
  grn_number: string;
  grn_date: string;
  purchase_order_id: string;
  po_number?: string;
  vendor_id: string;
  vendor_invoice_no?: string;
  vendor_invoice_date?: string;
  
  received_by_id: string;
  received_by_name?: string;
  
  warehouse_id?: string;
  
  items: {
    po_line_item_id: string;
    product_id: string;
    product_name?: string;
    ordered_quantity: number;
    received_quantity: number;
    rejected_quantity: number;
    accepted_quantity: number;
    batch_no?: string;
    mfg_date?: string;
    expiry_date?: string;
    notes?: string;
  }[];
  
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  
  notes?: string;
  quality_check_status?: 'pending' | 'passed' | 'failed';
  quality_check_notes?: string;
  
  // Link to Stock Audit entries created
  stock_audit_ids?: string[];
  
  // Relations
  PurchaseOrderItem?: PurchaseOrder;
  VendorItem?: {
    _id: string;
    vendor_name: string;
    company_name?: string;
  };
}

// PO Approval Request
export interface POApprovalRequest {
  purchase_order_id: string;
  requested_by_id: string;
  requested_date: string;
  approver_id?: string;
  approval_status: 'pending' | 'approved' | 'rejected';
  comments?: string;
  approved_date?: string;
}

// PO Status History
export interface POStatusHistory extends BaseEntity {
  purchase_order_id: string;
  from_status: POStatus;
  to_status: POStatus;
  changed_by_id: string;
  changed_by_name?: string;
  change_reason?: string;
  notes?: string;
}

// Filter/Search Types
export interface POFilters {
  status?: POStatus[];
  vendor_id?: string;
  from_date?: string;
  to_date?: string;
  search?: string;
  approval_status?: string;
}

// Dashboard Stats
export interface PODashboardStats {
  total_pos: number;
  draft_pos: number;
  pending_approval_pos: number;
  approved_pos: number;
  sent_pos: number;
  partially_received_pos: number;
  total_po_value: number;
  outstanding_po_value: number;
  overdue_pos: number;
  pending_receipts: number;
}

