import { BaseEntity } from './entities';

// Quotation Status
export type QuotationStatus = 
  | 'draft'           // Created but not sent
  | 'sent'            // Sent to customer
  | 'accepted'        // Customer accepted
  | 'rejected'        // Customer rejected
  | 'expired'         // Validity period expired
  | 'converted';      // Converted to invoice

// Quotation Line Item
export interface QuotationLineItem extends BaseEntity {
  quotation_id: string;
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
  stock_audit_id?: string;  // Reference to stock audit batch
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

// Quotation Main Entity
export interface Quotation extends BaseEntity {
  quotation_number: string;
  quotation_date: string;
  customer_id: string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  
  // Status & Workflow
  status: QuotationStatus;
  
  // Validity
  valid_until: string;  // Quote expires after this date
  
  // Conversion
  converted_to_invoice_id?: string;
  converted_to_invoice_no?: string;  // Invoice number when converted
  converted_date?: string;
  converted_to_sales_record_id?: string;
  
  // Financial
  subtotal: number;
  tax_amount: number;
  discount_amount: number;
  value_of_goods?: number;  // Value of goods after discount, before tax (or with tax extracted if GST included)
  total_amount: number;
  is_gst_included?: boolean;  // Whether GST is included in prices
  
  // Line Items
  items: QuotationLineItem[];
  
  // Additional Info
  notes?: string;
  terms_conditions?: string;
  internal_notes?: string;
  
  // Created By
  created_by_id?: string;
  created_by_name?: string;
  
  // Branch
  branch_id?: string;
  branch_name?: string;
  
  // Relations
  CustomerItem?: {
    _id: string;
    customer_name: string;
    company_name?: string;
    email?: string;
    phone?: string;
    address?: string;
    gst_number?: string;
  };
  
  CreatedByUser?: {
    _id: string;
    username: string;
    email?: string;
  };
  
  BranchItem?: {
    _id: string;
    branch_name: string;
    branch_code?: string;
  };
}

// Filter/Search Types
export interface QuotationFilters {
  status?: QuotationStatus[];
  customer_id?: string;
  from_date?: string;
  to_date?: string;
  search?: string;
  expired?: boolean;
}

// Dashboard Stats
export interface QuotationDashboardStats {
  total_quotations: number;
  draft_quotations: number;
  sent_quotations: number;
  accepted_quotations: number;
  rejected_quotations: number;
  expired_quotations: number;
  converted_quotations: number;
  total_quotation_value: number;
  conversion_rate: number; // Percentage
  pending_quotations: number;
}

