import { useCallback, useEffect, useState, useMemo } from 'react';
import { apiSlice } from '../../../services/redux/api/apiSlice';

interface DashboardFilters {
  tenant_id?: string;
  organisation_id?: string;
  branch_id?: string;
}

export const useDashboardData = (activeTab: string, filters: DashboardFilters = {}) => {
  const [loadedTabs, setLoadedTabs] = useState<Set<string>>(new Set());

  // RTK Query hooks
  const { 
    data: statsData, 
    refetch: refetchStats 
  } = apiSlice.useGetDashboardStatsQuery(filters, {
    skip: !loadedTabs.has('1')
  });

  const { 
    data: salesChartData, 
    refetch: refetchSalesChart 
  } = apiSlice.useGetSalesChartQuery(filters, {
    skip: !loadedTabs.has('1')
  });

  const { 
    refetch: refetchPurchaseChart 
  } = apiSlice.useGetPurchaseChartQuery(filters, {
    skip: !loadedTabs.has('1')
  });

  const { 
    data: stockAlertsData, 
    refetch: refetchStockAlerts 
  } = apiSlice.useGetStockAlertsQuery(filters, {
    skip: !loadedTabs.has('1')
  });

  // Load data for active tab only once
  useEffect(() => {
    if (!loadedTabs.has(activeTab)) {
      setLoadedTabs(prev => {
        const newSet = new Set(prev);
        newSet.add(activeTab);
        return newSet;
      });
    }
  }, [activeTab, loadedTabs]);

  // Refetch data when filters change
  useEffect(() => {
    if (filters.tenant_id || filters.organisation_id || filters.branch_id) {
      // Clear loaded tabs to force refetch with new filters
      setLoadedTabs(new Set([activeTab]));
    }
  }, [filters.tenant_id, filters.organisation_id, filters.branch_id, activeTab]);

  const refetch = useCallback(() => {
    refetchStats();
    refetchSalesChart();
    refetchPurchaseChart();
    refetchStockAlerts();
  }, [refetchStats, refetchSalesChart, refetchPurchaseChart, refetchStockAlerts]);

  // Memoize return object to prevent unnecessary re-renders
  const returnData = useMemo(() => ({
    DashBoardItems: statsData,
    SalesChartDataItems: salesChartData,
    FinancialDataItems: undefined, // Will be implemented when needed
    InventoryMetricsItems: undefined, // Will be implemented when needed
    SalesAnalyticsItems: salesChartData,
    OperationsDataItems: undefined, // Will be implemented when needed
    recentInvoices: [],
    stockAlerts: (stockAlertsData as any)?.result || [],
    topProducts: [],
    topCustomers: [],
    refetch,
  }), [
    statsData,
    salesChartData,
    stockAlertsData,
    refetch
  ]);

  // Return memoized data
  return returnData;
};

