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
}

// Category entity
export interface Category extends BaseEntity {
  name: string;
  description?: string;
  parent_id?: string;
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

// Unit entity
export interface Unit extends BaseEntity {
  name: string;
  short_name?: string;
}

// Variant entity
export interface Variant extends BaseEntity {
  name: string;
  description?: string;
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

export interface StockAuditList<>{
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