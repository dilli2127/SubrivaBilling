import { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Dispatch } from 'redux';
import { dynamic_request, useDynamicSelector } from '../../../services/redux';
import { createApiRouteGetter } from '../../../helpers/Common_functions';

export const useDashboardData = (activeTab: string) => {
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

  // Helper function to dispatch API request
  const fetchApiData = useCallback((route: any) => {
    dispatch(
      dynamic_request(
        { method: route.method, endpoint: route.endpoint, data: {} },
        route.identifier
      )
    );
  }, [dispatch]);

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
  }, [
    dispatch,
    dashboardCount,
    SalesChartData,
    FinancialData,
    InventoryMetrics,
    SalesAnalytics,
    OperationsData,
    RecentInvoices,
    LowStockAlerts,
    TopProducts,
    TopCustomers,
    fetchApiData,
  ]);

  // Load data for active tab only once
  useEffect(() => {
    if (!loadedTabs.has(activeTab)) {
      fetchTabData(activeTab);
      setLoadedTabs(prev => new Set(prev).add(activeTab));
    }
  }, [activeTab, loadedTabs, fetchTabData]);

  // Initial load for tab 1
  useEffect(() => {
    fetchTabData('1');
  }, []);

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

