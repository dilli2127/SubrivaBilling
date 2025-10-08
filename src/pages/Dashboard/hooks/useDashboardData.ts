import { useCallback, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Dispatch } from 'redux';
import { dynamic_request, useDynamicSelector } from '../../../services/redux';
import { createApiRouteGetter } from '../../../helpers/Common_functions';

export const useDashboardData = () => {
  const dispatch: Dispatch<any> = useDispatch();
  const getApiRouteDashBoard = createApiRouteGetter('DashBoard');

  // API Routes
  const dashboardCount = getApiRouteDashBoard('GetCount');
  const SalesChartData = getApiRouteDashBoard('SalesChartData');
  const PurchaseChartData = getApiRouteDashBoard('PurchaseChartData');
  const FinancialData = getApiRouteDashBoard('SalesChartData' as any);
  const InventoryMetrics = getApiRouteDashBoard('SalesChartData' as any);
  const SalesAnalytics = getApiRouteDashBoard('SalesChartData' as any);
  const OperationsData = getApiRouteDashBoard('SalesChartData' as any);
  const RecentInvoices = getApiRouteDashBoard('SalesChartData' as any);
  const LowStockAlerts = getApiRouteDashBoard('SalesChartData' as any);
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

  // Fetch all dashboard data
  const fetchData = useCallback(() => {
    [
      dashboardCount,
      SalesChartData,
      PurchaseChartData,
      FinancialData,
      InventoryMetrics,
      SalesAnalytics,
      OperationsData,
      RecentInvoices,
      LowStockAlerts,
      TopProducts,
      TopCustomers,
    ].forEach(route => {
      dispatch(
        dynamic_request(
          { method: route.method, endpoint: route.endpoint, data: {} },
          route.identifier
        )
      );
    });
  }, [
    dispatch,
    dashboardCount,
    SalesChartData,
    PurchaseChartData,
    FinancialData,
    InventoryMetrics,
    SalesAnalytics,
    OperationsData,
    RecentInvoices,
    LowStockAlerts,
    TopProducts,
    TopCustomers,
  ]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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
    refetch: fetchData,
  };
};

