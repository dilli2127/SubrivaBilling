import { useCallback, useEffect, useState, useMemo } from 'react';
import { apiSlice } from '../../../services/redux/api/apiSlice';
import {
  useGetDashboardStatsQuery,
  useGetSalesChartQuery,
  useGetPurchaseChartQuery,
  useGetStockAlertsQuery,
  useGetFinancialDataQuery,
  useGetSalesAnalyticsQuery,
  useGetInventoryMetricsQuery,
  useGetPlanLimitsQuery,
} from '../../../services/redux/api/endpoints';

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
  } = useGetDashboardStatsQuery(filters, {
    skip: !loadedTabs.has('1')
  });

  const { 
    data: salesChartData, 
    refetch: refetchSalesChart 
  } = useGetSalesChartQuery(filters, {
    skip: !loadedTabs.has('1')
  });

  const { 
    data: purchaseChartData,
    refetch: refetchPurchaseChart 
  } = useGetPurchaseChartQuery(filters, {
    skip: !loadedTabs.has('1')
  });

  const { 
    data: stockAlertsData, 
    refetch: refetchStockAlerts 
  } = useGetStockAlertsQuery(filters, {
    skip: !loadedTabs.has('1')
  });

  const { 
    data: financialData, 
    refetch: refetchFinancialData 
  } = useGetFinancialDataQuery(filters, {
    skip: !loadedTabs.has('2')
  });

  const { 
    data: salesAnalyticsData, 
    refetch: refetchSalesAnalytics 
  } = useGetSalesAnalyticsQuery(filters, {
    skip: !loadedTabs.has('4') && !loadedTabs.has('6')
  });

  const { 
    data: inventoryMetricsData, 
    refetch: refetchInventoryMetrics 
  } = useGetInventoryMetricsQuery(filters, {
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
  const SalesChartDataItems = useMemo(() => {
    const salesList = (salesChartData as any)?.result ?? salesChartData ?? [];
    const purchaseList = (purchaseChartData as any)?.result ?? purchaseChartData ?? [];

    // Merge by date so the chart can render both `sales` and `purchase` lines
    const byDate: Record<string, { date: string; sales?: number; purchase?: number }> = {};

    if (Array.isArray(salesList)) {
      salesList.forEach((item: any) => {
        const date = item?.date ?? item?.day ?? item?.period;
        if (!date) return;
        const amount = Number(item?.sales ?? item?.amount ?? item?.value ?? 0);
        if (!byDate[date]) byDate[date] = { date } as any;
        byDate[date].sales = amount;
      });
    }

    if (Array.isArray(purchaseList)) {
      purchaseList.forEach((item: any) => {
        const date = item?.date ?? item?.day ?? item?.period;
        if (!date) return;
        const amount = Number(item?.purchase ?? item?.amount ?? item?.value ?? 0);
        if (!byDate[date]) byDate[date] = { date } as any;
        byDate[date].purchase = amount;
      });
    }

    const merged = Object.values(byDate)
      .sort((a, b) => (a.date > b.date ? 1 : a.date < b.date ? -1 : 0));

    return { result: merged } as any;
  }, [salesChartData, purchaseChartData]);

  const returnData = useMemo(() => ({
    DashBoardItems: statsData,
    SalesChartDataItems,
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
    SalesChartDataItems,
    financialData,
    inventoryMetricsData,
    salesAnalyticsData,
    stockAlertsData,
    refetch
  ]);

  // Return memoized data
  return returnData;
};

