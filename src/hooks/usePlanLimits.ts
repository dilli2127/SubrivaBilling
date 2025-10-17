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

import { useState, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { Dispatch } from 'redux';
import { dynamic_request, dynamic_clear, useDynamicSelector } from '../services/redux';
import { API_ROUTES } from '../services/api/utils';

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
  const dispatch: Dispatch<any> = useDispatch();
  const [error, setError] = useState<string | null>(null);

  const { loading, items } = useDynamicSelector(API_ROUTES.PlanLimits.Get.identifier);

  const fetchPlanLimits = useCallback(() => {
    setError(null);
    dispatch(
      dynamic_request(
        {
          method: API_ROUTES.PlanLimits.Get.method,
          endpoint: API_ROUTES.PlanLimits.Get.endpoint,
        },
        API_ROUTES.PlanLimits.Get.identifier
      )
    );
  }, [dispatch]);

  // Auto-fetch on mount if enabled
  useEffect(() => {
    if (autoFetch) {
      fetchPlanLimits();
    }
    
    // Cleanup on unmount
    return () => {
      dispatch(dynamic_clear(API_ROUTES.PlanLimits.Get.identifier));
    };
  }, [autoFetch, fetchPlanLimits, dispatch]);

  // Handle errors from API
  useEffect(() => {
    if (items?.statusCode && items.statusCode !== 200) {
      setError(items.exception || items.message || 'Failed to fetch plan limits');
    } else if (items?.statusCode === 200) {
      setError(null);
    }
  }, [items]);

  const planLimits: PlanLimits | null = items?.statusCode === 200 ? items.result : null;

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

