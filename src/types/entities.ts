// Base entity interface
export interface BaseEntity {
  _id: string;
  createdAt?: string;
  updatedAt?: string;
}

// Customer entity
export interface Customer extends BaseEntity {
  full_name: string;
  email?: string;
  mobile: string;
  address?: string;
  customer_type: 'regular' | 'vip' | 'wholesale';
}

// Product entity
export interface Product extends BaseEntity {
  name: string;
  description?: string;
  price: number;
  category_id: string;
  unit_id: string;
  variant_id?: string;
  sku?: string;
  barcode?: string;
  hsn_code?: string;
  global_product?: boolean;
}

// Category entity
export interface Category extends BaseEntity {
  name: string;
  short_name?: string;
  description?: string;
  parent_id?: string;
  global_category?: boolean;
}

// Vendor entity
export interface Vendor extends BaseEntity {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  contact_person?: string;
}

// Warehouse entity
export interface Warehouse extends BaseEntity {
  name: string;
  location?: string;
  capacity?: number;
  manager?: string;
}

// Rack entity
export interface Rack extends BaseEntity {
  name: string;
  capacity?: number;
  notes?: string;
}

// Unit entity
export interface Unit extends BaseEntity {
  unit_name: string;
  unit_code?: string;
  is_global?: boolean;
}

// Variant entity
export interface Variant extends BaseEntity {
  name: string;
  description?: string;
  global_variant?: boolean;
}

// Stock Audit entity
export interface StockAudit extends BaseEntity {
  product_id: string;
  warehouse_id: string;
  quantity: number;
  audit_date: string;
  notes?: string;
}

// Stock Out entity
export interface StockOut extends BaseEntity {
  product_id: string;
  warehouse_id: string;
  quantity: number;
  reason: string;
  date: string;
}

// Stock entity
export interface Stock extends BaseEntity {
  product_id: string;
  warehouse_id: string;
  batch_no: string;
  available_quantity: number;
  sell_price: number;
  buy_price?: number;
  mrp?: number;
  mfg_date?: string;
  expiry_date?: string;
  vendor_id?: string;
  rack_id?: string;
  name?: string;
  code?: string;
  ProductItem?: {
    name: string;
    VariantItem?: {
      variant_name: string;
    };
  };
  VendorItem?: {
    vendor_name: string;
  };
  WarehouseItem?: {
    warehouse_name: string;
  };
  RackItem?: {
    name: string;
  };
}

// Organization entity
export interface Organization extends BaseEntity {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  logo?: string;
  settings?: Record<string, any>;
}

// API Response types
export interface ApiResponse<T = any> {
  statusCode: string;
  message?: string;
  result: T;
  error?: string;
}

// Pagination types
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
} 

export interface StockAuditList<T>{
  _id: string;
  batch_no: string;
  category_name: string;
  ProductItem?: {
    name?: string;
    VariantItem?: {
      variant_name?: string;
    };
  };
};

// Bill Item entity
export interface BillItem {
  _id?: string;
  key?: string;
  product_id: string;
  product_name: string;
  variant_name: string;
  stock_id: string;
  batch_no?: string;
  qty: number;
  loose_qty: number;
  price: number;
  mrp: number;
  amount: number;
  tax_percentage: number;
  // Legacy fields for compatibility
  quantity?: number;
  rate?: number;
}

// Bill Settings entity
export interface BillSettings {
  isPaid: boolean;
  isPartiallyPaid: boolean;
  isRetail: boolean;
  isGstIncluded: boolean;
  discount: number;
  discountType: 'percentage' | 'amount';
  paidAmount: number;
}

// Bill Form Data entity
export interface BillFormData {
  invoice_no: string;
  date: string;
  customer_id: string;
  customer_name: string;
  billed_by_id?: string;
  billed_by_name?: string;
  payment_mode: string;
  items: BillItem[];
}