export type DashboardAction = "GetCount" | "SalesChartData" | "PurchaseChartData";
export type StockRevertAction = "RevertStock";
export type StockAction = "GetProductStockCount";
export type BranchStockAction = "GetBranchStockCount"
export type Action = "GetAll" | "Get" | "Create" | "Update" | "Delete";
export type RevertStockAction = "RevertStock";
export type ReportsAction = 
  | "GetSalesReport" 
  | "GetProductSalesReport" 
  | "GetCustomerSalesReport" 
  | "GetStockReport" 
  | "GetProfitLossReport" 
  | "GetOutstandingPaymentsReport" 
  | "GetPaymentCollectionReport" 
  | "GetExpenseReport" 
  | "GetGSTReport" 
  | "GetTopProductsReport" 
  | "GetTopCustomersReport" 
  | "GetStockExpiryReport"; 