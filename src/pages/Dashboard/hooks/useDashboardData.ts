import { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Dispatch } from 'redux';
import { dynamic_request, useDynamicSelector } from '../../../services/redux';
import { createApiRouteGetter } from '../../../helpers/Common_functions';

interface DashboardFilters {
  tenant_id?: string;
  organisation_id?: string;
  branch_id?: string;
}

export const useDashboardData = (activeTab: string, filters: DashboardFilters = {}) => {
  const dispatch: Dispatch<any> = useDispatch();
  const getApiRouteDashBoard = createApiRouteGetter('DashBoard');
  const [loadedTabs, setLoadedTabs] = useState<Set<string>>(new Set(['1'])); // Tab 1 loads by default

  // API Routes
  const dashboardCount = getApiRouteDashBoard('GetCount');
  const SalesChartData = getApiRouteDashBoard('SalesChartData');
  const PurchaseChartData = getApiRouteDashBoard('PurchaseChartData');
  const FinancialData = getApiRouteDashBoard('FinancialData' as any);
  const InventoryMetrics = getApiRouteDashBoard('InventoryMetrics' as any);
  const SalesAnalytics = getApiRouteDashBoard('SalesChartData' as any);
  const OperationsData = getApiRouteDashBoard('SalesChartData' as any);
  const RecentInvoices = getApiRouteDashBoard('SalesChartData' as any);
  const LowStockAlerts = getApiRouteDashBoard('StockAlert' as any);
  const TopProducts = getApiRouteDashBoard('SalesChartData' as any);
  const TopCustomers = getApiRouteDashBoard('SalesChartData' as any);

  // Redux Selectors
  const { items: DashBoardItems } = useDynamicSelector(
    dashboardCount.identifier
  );

  const { items: SalesChartDataItems } = useDynamicSelector(
    SalesChartData.identifier
  );

  const { items: FinancialDataItems } = useDynamicSelector(
    FinancialData.identifier
  );

  const { items: InventoryMetricsItems } = useDynamicSelector(
    InventoryMetrics.identifier
  );

  const { items: SalesAnalyticsItems } = useDynamicSelector(
    SalesAnalytics.identifier
  );

  const { items: OperationsDataItems } = useDynamicSelector(
    OperationsData.identifier
  );

  const { items: RecentInvoicesItems } = useDynamicSelector(
    RecentInvoices.identifier
  );

  const { items: LowStockAlertsItems } = useDynamicSelector(
    LowStockAlerts.identifier
  );

  const { items: TopProductsItems } = useDynamicSelector(
    TopProducts.identifier
  );

  const { items: TopCustomersItems } = useDynamicSelector(
    TopCustomers.identifier
  );

  // Helper function to dispatch API request with filters
  const fetchApiData = useCallback((route: any) => {
    dispatch(
      dynamic_request(
        { method: route.method, endpoint: route.endpoint, data: filters },
        route.identifier
      )
    );
  }, [dispatch, filters]);

  // Fetch data based on active tab
  const fetchTabData = useCallback((tabKey: string) => {
    switch (tabKey) {
      case '1': // Overview Tab
        fetchApiData(dashboardCount);
        fetchApiData(SalesChartData);
        fetchApiData(PurchaseChartData);
        fetchApiData(LowStockAlerts);
        break;
      case '2': // Finance Tab
        fetchApiData(FinancialData);
        fetchApiData(RecentInvoices);
        break;
      case '3': // Inventory Tab
        fetchApiData(InventoryMetrics);
        break;
      case '4': // Sales Analysis Tab
        fetchApiData(SalesAnalytics);
        fetchApiData(TopProducts);
        fetchApiData(TopCustomers);
        break;
      case '5': // Operations Tab
        fetchApiData(OperationsData);
        break;
      case '6': // Performance Tab
        fetchApiData(SalesAnalytics);
        break;
      default:
        break;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchApiData]);

  // Load data for active tab only once
  useEffect(() => {
    if (!loadedTabs.has(activeTab)) {
      fetchTabData(activeTab);
      setLoadedTabs(prev => {
        const newSet = new Set(prev);
        newSet.add(activeTab);
        return newSet;
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // Initial load for tab 1
  useEffect(() => {
    fetchTabData('1');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Refetch data when filters change
  useEffect(() => {
    if (filters.tenant_id || filters.organisation_id || filters.branch_id) {
      // Clear loaded tabs to force refetch with new filters
      setLoadedTabs(new Set());
      fetchTabData(activeTab);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.tenant_id, filters.organisation_id, filters.branch_id]);

  // Return all data
  return {
    DashBoardItems,
    SalesChartDataItems,
    FinancialDataItems,
    InventoryMetricsItems,
    SalesAnalyticsItems,
    OperationsDataItems,
    recentInvoices: RecentInvoicesItems?.result || [],
    stockAlerts: LowStockAlertsItems?.result || [],
    topProducts: TopProductsItems?.result || [],
    topCustomers: TopCustomersItems?.result || [],
    refetch: () => fetchTabData(activeTab),
  };
};

