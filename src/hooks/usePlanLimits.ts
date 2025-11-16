/**
 * usePlanLimits Hook
 * 
 * Provides access to tenant plan limits and usage information.
 * This hook fetches plan limits from the backend /tenant/plan-limits endpoint.
 * 
 * NOTE: Plan limits are no longer included in the login response.
 * Use this hook to fetch them separately when needed (e.g., settings page, billing page).
 * 
 * @example
 * ```tsx
 * const { planLimits, loading, error, refetch } = usePlanLimits();
 * 
 * if (loading) return <Spin />;
 * if (error) return <Alert type="error" message={error} />;
 * 
 * // Check if user can create more branches
 * const canCreateBranch = planLimits.current_usage.branches < planLimits.limits.max_branches;
 * 
 * // Show usage percentage
 * <Progress percent={planLimits.usage_percentage.branches} />
 * ```
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useGetPlanLimitsQuery } from '../services/redux/api/endpoints';
import { isSuperAdmin } from '../helpers/permissionHelper';

export interface PlanLimits {
  plan: {
    type: string;
    status: boolean;
    license_start: string;
    license_expiry: string;
  };
  limits: {
    max_organisations: number;
    max_branches: number;
    max_users: number;
    max_custom_fields_per_entity: {
      [entity: string]: number;
      default: number;
    };
    max_entities: number;
  };
  current_usage: {
    organisations: number;
    branches: number;
    users: number;
    entities: number;
  };
  usage_percentage: {
    organisations: number;
    branches: number;
    users: number;
    entities: number;
  };
}

export interface UsePlanLimitsResult {
  planLimits: PlanLimits | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
  canCreate: (resource: 'organisations' | 'branches' | 'users' | 'entities') => boolean;
  getUsagePercentage: (resource: 'organisations' | 'branches' | 'users' | 'entities') => number;
  isNearLimit: (resource: 'organisations' | 'branches' | 'users' | 'entities', threshold?: number) => boolean;
}

/**
 * Hook to fetch and manage tenant plan limits
 * @param autoFetch - Whether to automatically fetch on mount (default: true)
 */
export function usePlanLimits(autoFetch: boolean = true): UsePlanLimitsResult {
  const [error, setError] = useState<string | null>(null);
  const superAdmin = isSuperAdmin();

  // Use RTK Query to fetch plan limits
  const { data: planLimitsResponse, isLoading: loading, error: queryError, refetch: fetchPlanLimits } = useGetPlanLimitsQuery(
    {},
    { skip: !autoFetch || superAdmin }
  );

  // Extract plan limits from response
  const planLimits: PlanLimits | null = useMemo(() => {
    if (!planLimitsResponse) return null;
    const data = (planLimitsResponse as any)?.result || planLimitsResponse;
    return data?.statusCode === 200 ? data.result : data || null;
  }, [planLimitsResponse]);

  // Handle errors from RTK Query
  useEffect(() => {
    if (queryError) {
      const errorData = (queryError as any)?.data || queryError;
      const msg = (errorData?.exception || errorData?.message || '').toString();
      // Silently ignore when tenant info is missing in token
      if (msg.toLowerCase().includes('tenant id not found')) {
        setError(null);
      } else {
        setError(msg || 'Failed to fetch plan limits');
      }
    } else {
      setError(null);
    }
  }, [queryError]);

  /**
   * Check if user can create more of a resource
   */
  const canCreate = useCallback(
    (resource: 'organisations' | 'branches' | 'users' | 'entities'): boolean => {
      if (!planLimits) return false;
      return planLimits.current_usage[resource] < planLimits.limits[`max_${resource}`];
    },
    [planLimits]
  );

  /**
   * Get usage percentage for a resource
   */
  const getUsagePercentage = useCallback(
    (resource: 'organisations' | 'branches' | 'users' | 'entities'): number => {
      if (!planLimits) return 0;
      return planLimits.usage_percentage[resource] || 0;
    },
    [planLimits]
  );

  /**
   * Check if usage is near the limit (default: 80% threshold)
   */
  const isNearLimit = useCallback(
    (resource: 'organisations' | 'branches' | 'users' | 'entities', threshold: number = 80): boolean => {
      const percentage = getUsagePercentage(resource);
      return percentage >= threshold;
    },
    [getUsagePercentage]
  );

  return {
    planLimits,
    loading,
    error,
    refetch: fetchPlanLimits,
    canCreate,
    getUsagePercentage,
    isNearLimit,
  };
}

export default usePlanLimits;

