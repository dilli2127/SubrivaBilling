
export const API_METHODS = {
  GET: "GET",
  POST: "POST",
  PUT: "PUT",
  DELETE: "DELETE",
  PATCH: "PATCH",
};

// Auto-generate CRUD routes for any entity
export const createCrudRoutes = (baseEndpoint: string, name: string) => ({
  Create: {
    identifier: `Add${name}`,
    method: API_METHODS.PUT,
    endpoint: baseEndpoint,
  },
  Update: {
    identifier: `Update${name}`,
    method: API_METHODS.PATCH,
    endpoint: baseEndpoint,
  },
  Get: {
    identifier: `Get${name}`,
    method: API_METHODS.GET,
    endpoint: baseEndpoint,
  },
  GetAll: {
    identifier: `GetAll${name}`,
    method: API_METHODS.POST,
    endpoint: baseEndpoint,
  },
  Delete: {
    identifier: `Delete${name}`,
    method: API_METHODS.DELETE,
    endpoint: baseEndpoint,
  },
});

export const API_ROUTES = {
  Signup: {
    Create: {
      identifier: "CreateSignup",
      method: API_METHODS.POST,
      endpoint: "signup",
    },
  },
  Login: {
    Create: {
      identifier: "CreateLogin",
      method: API_METHODS.POST,
      endpoint: "login",
    },
  },
  TenantLogin: {
    Create: {
      identifier: "TeantLogin",
      method: API_METHODS.POST,
      endpoint: "tentant_login",
    },
  },
  BillingLogin: {
    Create: {
      identifier: "BillingLogin",
      method: API_METHODS.POST,
      endpoint: "billing_login",
    },
  },
  GetEivite: {
    Create: {
      identifier: "CreateEinvite",
      method: API_METHODS.PUT,
      endpoint: "e_invite",
    },
    Update: {
      identifier: "UpdateEinvite",
      method: API_METHODS.PATCH,
      endpoint: "e_invite/",
    },
    Get: {
      identifier: "GetEinvite",
      method: API_METHODS.GET,
      endpoint: "e_invite/",
    },
    Delete: {
      identifier: "DeleteEinvite",
      method: API_METHODS.DELETE,
      endpoint: "e_invite/",
    },
  },
  FileUploder: {
    Add: {
      identifier: "file-upload",
      method: API_METHODS.POST,
      endpoint: "/file-upload",
    },
    Update: {
      identifier: "UpdateLedgerDefinition",
      method: API_METHODS.POST,
      endpoint: "ledger-definition/update",
    },
    UpdateTemplate: {
      identifier: "UpdateTemplateLedgerDefinition",
      method: API_METHODS.POST,
      endpoint: "ledger-definition/mark-as-default",
    },
    Get: {
      identifier: "GetEinvite",
      method: API_METHODS.GET,
      endpoint: "e_invite/",
    },
    Delete: {
      identifier: "DeleteLedgerDefinition",
      method: API_METHODS.POST,
      endpoint: "ledger-definition/delete",
    },
  },
  DashBoard: {
    GetCount: {
      identifier: "GetCount",
      method: API_METHODS.POST,
      endpoint: "/dashboard/stats",
    },
    SalesChartData: {
      identifier: "GetSalesData",
      method: API_METHODS.POST,
      endpoint: "/dashboard/sales_chart",
    },
    PurchaseChartData: {
      identifier: "GetPurchaseChartData",
      method: API_METHODS.POST,
      endpoint: "/dashboard/purchased_chart",
    },
    StockAlert: {
      identifier: "GetStockAlert",
      method: API_METHODS.POST,
      endpoint: "/dashboard/getStockAlerts",
    },
    FinancialData: {
      identifier: "GetFinancialData",
      method: API_METHODS.POST,
      endpoint: "/dashboard/financialData",
    },
    SalesAnalytics: {
      identifier: "GetSalesAnalytics",
      method: API_METHODS.POST,
      endpoint: "/dashboard/getSalesAnalytics",
    },
  },
  StockAvailable: {
    GetProductStockCount: {
      identifier: "GetProductStockCount",
      method: API_METHODS.POST,
      endpoint: "/product_stocks",
    },
  },
  BranchStockAvailable: {
    GetBranchStockCount: {
      identifier: "GetBranchStock",
      method: API_METHODS.POST,
      endpoint: "/product_branch_stocks",
    },
  },
  StockRevertFromBranch: {
    RevertStock: {
      identifier: "RevertStock",
      method: API_METHODS.PATCH,
      endpoint: "/revert_stock",
    },
  },
  CmsImage: createCrudRoutes("/cms_image", "CmsImage"),
  Customer: createCrudRoutes("/customer", "Customer"),
  Unit: createCrudRoutes("/unit", "Unit"),
  Variant: createCrudRoutes("/variant", "Variant"),
  Category: createCrudRoutes("/category", "Category"),
  Product: createCrudRoutes("/products", "Product"),
  Vendor: createCrudRoutes("/vendor", "Vendor"),
  Warehouse: createCrudRoutes("/warehouse", "Warehouse"),
  Rack: createCrudRoutes("/rack", "Rack"),
  StockAudit: createCrudRoutes("/stock_audit", "StockAudit"),
  SalesRecord: createCrudRoutes("/sales_record", "SalesRecord"),
  PaymentHistory: createCrudRoutes("/payment_history", "PaymentHistory"),
  Expenses: createCrudRoutes("/expenses", "Expenses"),
  StockOut: createCrudRoutes("/stock_out", "StockOut"),
  InvoiceNumber: createCrudRoutes("/invoice_numbers", "InvoiceNumber"),
  Organisations: createCrudRoutes("/organisations", "Organisations"),
  Braches: createCrudRoutes("/branches", "Branches"),
  Roles: createCrudRoutes("/roles", "Roles"),
  BillingUsers: createCrudRoutes("/billing_users", "BillingUsers"),
  Tenant: createCrudRoutes("/tenant_accounts", "TenantAccounts"),
  BranchStock: createCrudRoutes("/branch_stock", "BranchStock"),
  StockStorage: createCrudRoutes("/stock_storage", "StockStorage"),
};
