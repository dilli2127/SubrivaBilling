/**
 * Subscription Utilities
 * Helper functions for subscription management
 */

import { UsageLimits, CurrentUsage } from '../services/redux/api/endpoints/subscription.endpoints';

/**
 * Calculate days remaining until expiry
 */
export const calculateDaysRemaining = (expiryDate: string): number => {
  const expiry = new Date(expiryDate);
  const today = new Date();
  const diffTime = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

/**
 * Check if user should be warned about subscription
 */
export const shouldShowSubscriptionWarning = (daysRemaining?: number): boolean => {
  if (!daysRemaining) return false;
  return daysRemaining <= 7; // Warn if 7 days or less
};

/**
 * Format subscription status message
 */
export const getSubscriptionMessage = (
  isActive: boolean,
  daysRemaining?: number,
  expiryDate?: string
): string => {
  if (!isActive) {
    return '⚠️ Your subscription has expired. Please renew to continue using the service.';
  }

  if (daysRemaining !== undefined && daysRemaining <= 7) {
    return `⚠️ Your subscription will expire in ${daysRemaining} days. Please renew soon.`;
  }

  if (expiryDate) {
    return `✅ Subscription active until ${new Date(expiryDate).toLocaleDateString()}`;
  }

  return '✅ Subscription active';
};

/**
 * Calculate usage percentage
 */
export const calculateUsagePercentage = (current: number = 0, max: number = 0): number => {
  if (max === 0) return 0;
  return Math.min(Math.round((current / max) * 100), 100);
};

/**
 * Get progress bar color based on usage percentage
 */
export const getProgressColor = (percentage: number): string => {
  if (percentage >= 90) return '#ff4d4f';
  if (percentage >= 75) return '#faad14';
  return '#52c41a';
};

/**
 * Format label names from snake_case to Title Case
 */
export const formatLabel = (key: string): string => {
  return key
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

/**
 * Process subscription status data
 */
export const processSubscriptionStatus = (data: any) => {
  const result = data?.result;
  const expiryDate = result?.license_expiry;
  const isExpired = result?.is_expired || false;
  const isActive = result?.is_active && !isExpired;
  const daysRemaining = expiryDate ? calculateDaysRemaining(expiryDate) : undefined;

  return {
    isActive,
    expiryDate: expiryDate,
    planName: result?.plan_type || 'Standard',
    daysRemaining: daysRemaining,
    message: isActive ? 'Subscription active' : 'Subscription expired',
  };
};

/**
 * Check which limits are near exceeded (>= 80%)
 */
export const getNearLimitItems = (limits?: UsageLimits, currentUsage?: CurrentUsage): string[] => {
  const nearLimitItems: string[] = [];
  
  if (!limits || !currentUsage) return nearLimitItems;

  Object.keys(limits).forEach(key => {
    const limitKey = key as keyof UsageLimits;
    const usageKey = key.replace('max_', '') as keyof CurrentUsage;
    const limit = limits[limitKey];
    const usage = currentUsage[usageKey];
    
    if (limit && usage !== undefined) {
      const percentage = calculateUsagePercentage(usage, limit);
      if (percentage >= 80) {
        nearLimitItems.push(formatLabel(key.replace('max_', '')));
      }
    }
  });

  return nearLimitItems;
};

