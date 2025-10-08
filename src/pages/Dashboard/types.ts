// Shared types for Dashboard components
export interface DashboardData {
  result?: any;
}

export interface DashboardItemsResponse {
  result?: {
    todaysSales?: number;
    todaysSalesGrowth?: number;
    pendingReceivables?: number;
    pendingInvoicesCount?: number;
    monthlyRevenue?: number;
    monthlyTarget?: number;
    totalCustomers?: number;
    newCustomersThisMonth?: number;
    totalProducts?: number;
    lowStockCount?: number;
    todaysOrders?: number;
    profitMargin?: number;
    [key: string]: any;
  };
}

export interface FinancialDataResponse {
  result?: {
    todaysProfit?: number;
    todaysProfitMargin?: number;
    pendingPayables?: number;
    vendorsCount?: number;
    monthlyExpenses?: number;
    expensesGrowth?: number;
    cashFlow?: number;
    currentWeekSales?: number;
    lastWeekSales?: number;
    weekOverWeekGrowth?: number;
    currentMonthSales?: number;
    lastMonthSales?: number;
    monthOverMonthGrowth?: number;
    currentYearSales?: number;
    lastYearSales?: number;
    yearOverYearGrowth?: number;
    paymentCollectionRate?: number;
    collectedAmount?: number;
    pendingAmount?: number;
    overdueAmount?: number;
    [key: string]: any;
  };
}

export interface InventoryDataResponse {
  result?: {
    totalStockValue?: number;
    totalItems?: number;
    deadStockCount?: number;
    fastMovingCount?: number;
    slowMovingCount?: number;
    inStockCount?: number;
    outOfStockCount?: number;
    lowStockCount?: number;
    reorderCount?: number;
    categoryWiseStock?: any[];
    deadStockItems?: any[];
    fastMovingItems?: any[];
    slowMovingItems?: any[];
    [key: string]: any;
  };
}

export interface SalesAnalyticsResponse {
  result?: {
    topCategories?: any[];
    avgOrderValue?: number;
    conversionRate?: number;
    totalOrders?: number;
    totalRevenue?: number;
    salesTargetProgress?: number;
    branchPerformance?: any[];
    staffPerformance?: any[];
    userActivityLog?: any[];
    bestBranch?: { name: string };
    topPerformer?: { name: string };
    [key: string]: any;
  };
}

export interface OperationsDataResponse {
  result?: {
    totalVendors?: number;
    returnsThisMonth?: number;
    totalOrders?: number;
    returnRate?: number;
    pendingOrders?: number;
    paymentMethods?: any[];
    cashSales?: number;
    cashSalesPercentage?: number;
    creditSales?: number;
    creditSalesPercentage?: number;
    recentReturns?: any[];
    topVendors?: any[];
    [key: string]: any;
  };
}

