import { useMemo } from 'react';
import { useGetCustomerPointsQuery } from '../../../services/redux/api/endpoints';

interface UseCustomerPointsOptions {
  customerId?: string;
  enabled?: boolean;
}

interface CustomerPointsData {
  available_points: number;
  total_earned: number;
  total_redeemed: number;
  points_value: number; // Value of 1 point in rupees
  tier?: string;
}

/**
 * Hook to fetch and manage customer points
 * Automatically fetches when customer is selected
 */
export const useCustomerPoints = ({ customerId, enabled = true }: UseCustomerPointsOptions) => {
  const {
    data: pointsData,
    isLoading,
    error,
    refetch,
  } = useGetCustomerPointsQuery(customerId || '', {
    skip: !customerId || !enabled,
  });

  // Extract customer points data from API response
  const customerPoints: CustomerPointsData | null = useMemo(() => {
    if (!pointsData) return null;

    const result = (pointsData as any)?.result || pointsData;

    return {
      available_points: Number(result?.available_points || 0),
      total_earned: Number(result?.total_earned || 0),
      total_redeemed: Number(result?.total_redeemed || 0),
      points_value: Number(result?.points_value) || 1, // Default 1 point = ₹1
      tier: result?.tier || 'bronze',
    };
  }, [pointsData]);

  // Validate points redemption
  const validatePointsRedemption = useMemo(() => {
    return (pointsToRedeem: number): { valid: boolean; error?: string } => {
      if (!customerPoints) {
        return { valid: false, error: 'Customer points not found' };
      }

      if (pointsToRedeem < 0) {
        return { valid: false, error: 'Points cannot be negative' };
      }

      if (pointsToRedeem > customerPoints.available_points) {
        return {
          valid: false,
          error: `Only ${customerPoints.available_points} points available`,
        };
      }

      if (pointsToRedeem > 0 && pointsToRedeem < 1) {
        return { valid: false, error: 'Points must be at least 1' };
      }

      return { valid: true };
    };
  }, [customerPoints]);

  // Calculate discount amount from points
  const calculateDiscountFromPoints = useMemo(() => {
    return (points: number): number => {
      if (!customerPoints || points <= 0) return 0;
      return points * customerPoints.points_value;
    };
  }, [customerPoints]);

  return {
    customerPoints,
    isLoading,
    error,
    refetch,
    validatePointsRedemption,
    calculateDiscountFromPoints,
    hasPoints: customerPoints ? customerPoints.available_points > 0 : false,
  };
};

