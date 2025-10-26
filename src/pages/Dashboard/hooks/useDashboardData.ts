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

  const { 
    data: financialData, 
    refetch: refetchFinancialData 
  } = apiSlice.useGetFinancialDataQuery(filters, {
    skip: !loadedTabs.has('2')
  });

  const { 
    data: salesAnalyticsData, 
    refetch: refetchSalesAnalytics 
  } = apiSlice.useGetSalesAnalyticsQuery(filters, {
    skip: !loadedTabs.has('4') && !loadedTabs.has('6')
  });

  const { 
    data: inventoryMetricsData, 
    refetch: refetchInventoryMetrics 
  } = apiSlice.useGetInventoryMetricsQuery(filters, {
    skip: !loadedTabs.has('3')
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
    refetchFinancialData();
    refetchSalesAnalytics();
    refetchInventoryMetrics();
  }, [refetchStats, refetchSalesChart, refetchPurchaseChart, refetchStockAlerts, refetchFinancialData, refetchSalesAnalytics, refetchInventoryMetrics]);

  // Memoize return object to prevent unnecessary re-renders
  const returnData = useMemo(() => ({
    DashBoardItems: statsData,
    SalesChartDataItems: salesChartData,
    FinancialDataItems: financialData,
    InventoryMetricsItems: inventoryMetricsData,
    SalesAnalyticsItems: salesAnalyticsData,
    OperationsDataItems: undefined, // Will be implemented when needed
    recentInvoices: [],
    stockAlerts: (stockAlertsData as any)?.result || [],
    topProducts: [],
    topCustomers: [],
    refetch,
  }), [
    statsData,
    salesChartData,
    financialData,
    inventoryMetricsData,
    salesAnalyticsData,
    stockAlertsData,
    refetch
  ]);

  // Return memoized data
  return returnData;
};

