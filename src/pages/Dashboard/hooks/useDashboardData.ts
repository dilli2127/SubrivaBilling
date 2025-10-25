import { useCallback, useEffect, useState } from 'react';
import { 
  useGetDashboardStatsQuery,
  useGetSalesChartQuery,
  useGetPurchaseChartQuery,
  useGetStockAlertsQuery,
} from '../../../services/redux/api/apiSlice';

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
    isLoading: statsLoading, 
    error: statsError,
    refetch: refetchStats 
  } = useGetDashboardStatsQuery(filters, {
    skip: !loadedTabs.has('1')
  });

  const { 
    data: salesChartData, 
    isLoading: salesChartLoading, 
    error: salesChartError,
    refetch: refetchSalesChart 
  } = useGetSalesChartQuery(filters, {
    skip: !loadedTabs.has('1')
  });

  const { 
    data: purchaseChartData, 
    isLoading: purchaseChartLoading, 
    error: purchaseChartError,
    refetch: refetchPurchaseChart 
  } = useGetPurchaseChartQuery(filters, {
    skip: !loadedTabs.has('1')
  });

  const { 
    data: stockAlertsData, 
    isLoading: stockAlertsLoading, 
    error: stockAlertsError,
    refetch: refetchStockAlerts 
  } = useGetStockAlertsQuery(filters, {
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
  }, [activeTab]);

  // Refetch data when filters change
  useEffect(() => {
    if (filters.tenant_id || filters.organisation_id || filters.branch_id) {
      // Clear loaded tabs to force refetch with new filters
      setLoadedTabs(new Set());
      setLoadedTabs(prev => {
        const newSet = new Set(prev);
        newSet.add(activeTab);
        return newSet;
      });
    }
  }, [filters.tenant_id, filters.organisation_id, filters.branch_id, activeTab]);

  const refetch = useCallback(() => {
    refetchStats();
    refetchSalesChart();
    refetchPurchaseChart();
    refetchStockAlerts();
  }, [refetchStats, refetchSalesChart, refetchPurchaseChart, refetchStockAlerts]);

  // Return all data
  return {
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
  };
};

