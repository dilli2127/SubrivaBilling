/**
 * Unified Customer Points System Types
 * Handles both purchase rewards and return refunds as points
 */

export type TransactionType = 
  | 'earn_purchase'   // Earned from buying (5% of amount)
  | 'earn_return'     // Earned from return (100% of amount)
  | 'redeem'          // Used points for discount
  | 'expire'          // Points expired
  | 'bonus'           // Admin bonus
  | 'adjust';         // Manual adjustment

export type CustomerTier = 
  | 'bronze'
  | 'silver'
  | 'gold'
  | 'platinum';

export interface CustomerPoints {
  _id: string;
  customer_id: string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  
  // Points Balance
  total_earned: number;
  total_used: number;
  total_expired: number;
  available_points: number;
  points_value: number; // = available_points × 1
  
  // Tier
  tier: CustomerTier;
  earn_rate: number; // % earning rate based on tier
  
  // Statistics
  total_purchases: number;
  total_returns: number;
  lifetime_value: number;
  
  // Multi-tenancy
  organisation_id: string;
  branch_id?: string;
  tenant_id: string;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  
  // Relations
  CustomerItem?: any;
  transactions?: PointsTransaction[];
}

export interface PointsTransaction {
  _id: string;
  customer_id: string;
  customer_name?: string;
  
  // Transaction Details
  transaction_type: TransactionType;
  transaction_date: string;
  
  // Points
  points: number; // Positive for earn, negative for redeem
  points_value: number;
  
  // Reference
  reference_type?: string; // 'sales_record', 'sales_return', 'manual'
  reference_id?: string;
  reference_number?: string;
  
  // Details
  description?: string;
  notes?: string;
  
  // Balance
  balance_before?: number;
  balance_after: number;
  
  // Expiry
  expiry_date?: string;
  is_expired: boolean;
  
  // Metadata
  invoice_amount?: number;
  earn_rate?: number;
  
  // Audit
  created_by_id?: string;
  created_by_name?: string;
  
  // Multi-tenancy
  organisation_id: string;
  branch_id?: string;
  tenant_id: string;
  
  // Timestamp
  createdAt: string;
}

export interface PointsConfiguration {
  _id: string;
  
  // Basic Settings
  points_per_rupee: number; // Default: 1
  rupee_per_point: number; // Default: 1
  
  // Earning Rates
  purchase_earn_rate: number; // Default: 5% on purchases
  return_earn_rate: number; // Default: 100% on returns
  
  // Redemption Rules
  min_points_to_redeem: number; // Default: 10
  max_redeem_percentage: number; // Default: 50%
  
  // Expiry
  points_expiry_months: number; // Default: 12
  
  // Tier Thresholds
  bronze_threshold: number;
  silver_threshold: number;
  gold_threshold: number;
  platinum_threshold: number;
  
  // Tier Rates
  bronze_earn_rate: number;
  silver_earn_rate: number;
  gold_earn_rate: number;
  platinum_earn_rate: number;
  
  // Multi-tenancy
  organisation_id?: string;
  tenant_id: string;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

export interface PointsDashboardStats {
  total_customers_with_points: number;
  total_active_points: number;
  total_points_value: number; // Total ₹ value
  points_earned_this_month: number;
  points_redeemed_this_month: number;
  points_expiring_soon: number; // Next 30 days
  top_customers: Array<{
    customer_name: string;
    available_points: number;
    tier: CustomerTier;
  }>;
}

export interface EarnPointsRequest {
  customer_id: string;
  sales_record_id: string;
  invoice_number: string;
  invoice_amount: number;
  created_by_id: string;
  created_by_name: string;
}

export interface RedeemPointsRequest {
  points_to_redeem: number;
  sales_record_id: string;
  invoice_number: string;
  invoice_amount: number;
}

export interface PointsEarnResponse {
  points_earned: number;
  points_value: number;
  new_balance: number;
  tier: CustomerTier;
}

export interface PointsRedeemResponse {
  points_redeemed: number;
  discount_value: number;
  new_balance: number;
}

