import { apiSlice } from '../apiSlice';

/**
 * Subscription API Endpoints
 * Handles subscription status and plan limits
 * 
 * subscription-status API is called:
 * - On user login (cached for 5 min)
 * - Every 1 hour in sidebar (automatic polling)
 * - When user navigates to Settings > Subscription tab
 * 
 * my-plan-limits API is called:
 * - Only when user navigates to Settings > Subscription tab
 */

export interface UsageLimits {
  max_organisations?: number;
  max_branches?: number;
  max_users?: number;
  max_entities?: number;
  max_custom_fields?: number;
  max_sales_records?: number;
  max_customers?: number;
  max_products?: number;
}

export interface CurrentUsage {
  organisations?: number;
  branches?: number;
  users?: number;
  entities?: number;
  invoices?: number;
  bills?: number;
  sales_records?: number;
  customers?: number;
  products?: number;
}

export interface SubscriptionStatusResponse {
  statusCode: number;
  result: {
    license_expiry: string;
    is_expired: boolean;
    is_active: boolean;
    plan_type: string;
  };
  message?: string;
}

export interface PlanLimitsResponse {
  statusCode: number;
  result: {
    limits: UsageLimits;
    current_usage: CurrentUsage;
  };
  message?: string;
}

export const subscriptionApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Get subscription status - called on login and settings page
    getSubscriptionStatus: builder.query<SubscriptionStatusResponse, void>({
      query: () => ({
        url: '/subscription-status',
        method: 'GET',
      }),
      providesTags: ['Subscription'],
      // Cache for 5 minutes
      keepUnusedDataFor: 300,
    }),

    // Get my plan limits - called on settings page only
    getMyPlanLimits: builder.query<PlanLimitsResponse, void>({
      query: () => ({
        url: '/my-plan-limits',
        method: 'GET',
      }),
      providesTags: ['PlanLimits'],
      // Cache for 5 minutes
      keepUnusedDataFor: 300,
    }),
  }),
  overrideExisting: false,
});

// Export hooks for usage in components
export const {
  useGetSubscriptionStatusQuery,
  useGetMyPlanLimitsQuery,
  useLazyGetSubscriptionStatusQuery,
  useLazyGetMyPlanLimitsQuery,
} = subscriptionApi;

