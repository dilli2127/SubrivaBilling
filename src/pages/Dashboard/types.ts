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
    todayProfit?: {
      amount: number;
      margin: number;
      revenue: number;
      cogs: number;
    };
    pendingPayables?: {
      amount: number;
      vendorCount: number;
    };
    monthlyExpenses?: {
      amount: number;
      growth: number;
      lastMonth: number;
    };
    cashFlow?: {
      amount: number;
      status: string;
      revenue: number;
      expenses: number;
    };
    currentWeekSales?: {
      amount: number;
      lastWeek: number;
      growth: number;
    };
    currentMonthSales?: {
      amount: number;
      lastMonth: number;
      growth: number | null;
    };
    currentYearSales?: {
      amount: number;
      lastYear: number;
      growth: number;
    };
    paymentCollectionRate?: number;
    collectedAmount?: number;
    pendingAmount?: number;
    overdueAmount?: number;
    [key: string]: any;
  };
}

export interface InventoryDataResponse {
  result?: {
    totalStockValue?: {
      value: number;
      items: number;
    };
    deadStock?: {
      count: number;
      description: string;
      items: any[];
    };
    fastMoving?: {
      count: number;
      description: string;
      items: any[];
    };
    slowMoving?: {
      count: number;
      description: string;
      items: any[];
    };
    stockStatusBreakdown?: {
      inStock: number;
      outOfStock: number;
      lowStock: number;
      reorderNeeded: number;
    };
    inventoryTurnover?: {
      chartData: any[];
      averageTurnover: number;
    };
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

