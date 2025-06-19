export const API_METHODS = {
  GET: "GET",
  POST: "POST",
  PUT: "PUT",
  DELETE: "DELETE",
  PATCH: "PATCH",
};

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
  CmsImage: {
    Create: {
      identifier: "AddCmsImage",
      method: API_METHODS.PUT,
      endpoint: "/cms_image",
    },
    Update: {
      identifier: "UpdateCmsImage",
      method: API_METHODS.PATCH,
      endpoint: "/cms_image",
    },
    Get: {
      identifier: "GetCmsImage",
      method: API_METHODS.GET,
      endpoint: "/cms_image",
    },
    GetAll: {
      identifier: "GetCmsImage",
      method: API_METHODS.POST,
      endpoint: "/cms_image",
    },
    GetAllGalleryImages: {
      identifier: "GetAllGalleryImages",
      method: API_METHODS.POST,
      endpoint: "/get_all_gallery_images",
    },
    Delete: {
      identifier: "DeleteCmsImage",
      method: API_METHODS.DELETE,
      endpoint: "/cms_image",
    },
  },
  Customer: {
    Create: {
      identifier: "AddCustomer",
      method: API_METHODS.PUT,
      endpoint: "/customer",
    },
    Update: {
      identifier: "UpdatCustomer",
      method: API_METHODS.PATCH,
      endpoint: "/customer",
    },
    Get: {
      identifier: "GetCustomer",
      method: API_METHODS.GET,
      endpoint: "/customer",
    },
    GetAll: {
      identifier: "GetAllCustomer",
      method: API_METHODS.POST,
      endpoint: "/customer",
    },
    Delete: {
      identifier: "DeleteCustomer",
      method: API_METHODS.DELETE,
      endpoint: "/customer",
    },
  },
  Unit: {
    Create: {
      identifier: "AddUnit",
      method: API_METHODS.PUT,
      endpoint: "/unit",
    },
    Update: {
      identifier: "UpdatUnit",
      method: API_METHODS.PATCH,
      endpoint: "/unit",
    },
    Get: {
      identifier: "GetUnit",
      method: API_METHODS.GET,
      endpoint: "/unit",
    },
    GetAll: {
      identifier: "GetAllUnit",
      method: API_METHODS.POST,
      endpoint: "/unit",
    },
    Delete: {
      identifier: "DeleteUnit",
      method: API_METHODS.DELETE,
      endpoint: "/unit",
    },
  },
  Variant: {
    Create: {
      identifier: "AddVariant",
      method: API_METHODS.PUT,
      endpoint: "/variant",
    },
    Update: {
      identifier: "UpdatVariant",
      method: API_METHODS.PATCH,
      endpoint: "/variant",
    },
    Get: {
      identifier: "GetVariant",
      method: API_METHODS.GET,
      endpoint: "/variant",
    },
    GetAll: {
      identifier: "GetAllVariant",
      method: API_METHODS.POST,
      endpoint: "/variant",
    },
    Delete: {
      identifier: "DeleteVariant",
      method: API_METHODS.DELETE,
      endpoint: "/variant",
    },
  },
  Category: {
    Create: {
      identifier: "AddCategory",
      method: API_METHODS.PUT,
      endpoint: "/category",
    },
    Update: {
      identifier: "UpdatCategory",
      method: API_METHODS.PATCH,
      endpoint: "/category",
    },
    Get: {
      identifier: "GetCategory",
      method: API_METHODS.GET,
      endpoint: "/category",
    },
    GetAll: {
      identifier: "GetAllCategory",
      method: API_METHODS.POST,
      endpoint: "/category",
    },
    Delete: {
      identifier: "DeleteCategory",
      method: API_METHODS.DELETE,
      endpoint: "/category",
    },
  },
  Product: {
    Create: {
      identifier: "AddProduct",
      method: API_METHODS.PUT,
      endpoint: "/products",
    },
    Update: {
      identifier: "UpdatProduct",
      method: API_METHODS.PATCH,
      endpoint: "/products",
    },
    Get: {
      identifier: "GetProduct",
      method: API_METHODS.GET,
      endpoint: "/products",
    },
    GetAll: {
      identifier: "GetAllProduct",
      method: API_METHODS.POST,
      endpoint: "/products",
    },
    Delete: {
      identifier: "DeleteProduct",
      method: API_METHODS.DELETE,
      endpoint: "/products",
    },
  },
  Vendor: {
    Create: {
      identifier: "AddVendor",
      method: API_METHODS.PUT,
      endpoint: "/vendor",
    },
    Update: {
      identifier: "UpdatVendor",
      method: API_METHODS.PATCH,
      endpoint: "/vendor",
    },
    Get: {
      identifier: "GetVendor",
      method: API_METHODS.GET,
      endpoint: "/vendor",
    },
    GetAll: {
      identifier: "GetAllVendor",
      method: API_METHODS.POST,
      endpoint: "/vendor",
    },
    Delete: {
      identifier: "DeleteVendor",
      method: API_METHODS.DELETE,
      endpoint: "/vendor",
    },
  },
  Warehouse: {
    Create: {
      identifier: "AddWarehouse",
      method: API_METHODS.PUT,
      endpoint: "/warehouse",
    },
    Update: {
      identifier: "UpdatWarehouse",
      method: API_METHODS.PATCH,
      endpoint: "/warehouse",
    },
    Get: {
      identifier: "GetWarehouse",
      method: API_METHODS.GET,
      endpoint: "/warehouse",
    },
    GetAll: {
      identifier: "GetAllWarehouse",
      method: API_METHODS.POST,
      endpoint: "/warehouse",
    },
    Delete: {
      identifier: "DeleteWarehouse",
      method: API_METHODS.DELETE,
      endpoint: "/warehouse",
    },
  },
  StockAudit: {
    Create: {
      identifier: "AddStockAudit",
      method: API_METHODS.PUT,
      endpoint: "/stock_audit",
    },
    Update: {
      identifier: "UpdatStockAudit",
      method: API_METHODS.PATCH,
      endpoint: "/stock_audit",
    },
    Get: {
      identifier: "GetStockAudit",
      method: API_METHODS.GET,
      endpoint: "/stock_audit",
    },
    GetAll: {
      identifier: "GetAllStockAudit",
      method: API_METHODS.POST,
      endpoint: "/stock_audit",
    },
    Delete: {
      identifier: "DeleteStockAudit",
      method: API_METHODS.DELETE,
      endpoint: "/stock_audit",
    },
  },
  SalesRecord: {
    Create: {
      identifier: "AddRetailBill",
      method: API_METHODS.PUT,
      endpoint: "/sales_record",
    },
    Update: {
      identifier: "UpdatRetailBill",
      method: API_METHODS.PATCH,
      endpoint: "/sales_record",
    },
    Get: {
      identifier: "GetRetailBill",
      method: API_METHODS.GET,
      endpoint: "/sales_record",
    },
    GetAll: {
      identifier: "GetAllRetailBill",
      method: API_METHODS.POST,
      endpoint: "/sales_record",
    },
    Delete: {
      identifier: "DeleteRetailBill",
      method: API_METHODS.DELETE,
      endpoint: "/sales_record",
    },
  },
  PaymentHistory: {
    Create: {
      identifier: "AddPaymentHistory",
      method: API_METHODS.PUT,
      endpoint: "/payment_history",
    },
    Update: {
      identifier: "UpdatPaymentHistory",
      method: API_METHODS.PATCH,
      endpoint: "/payment_history",
    },
    Get: {
      identifier: "GetPaymentHistory",
      method: API_METHODS.GET,
      endpoint: "/payment_history",
    },
    GetAll: {
      identifier: "GetAllPaymentHistory",
      method: API_METHODS.POST,
      endpoint: "/payment_history",
    },
    Delete: {
      identifier: "DeletePaymentHistory",
      method: API_METHODS.DELETE,
      endpoint: "/payment_history",
    },
  },
  Expenses: {
    Create: {
      identifier: "AddExpenses",
      method: API_METHODS.PUT,
      endpoint: "/expenses",
    },
    Update: {
      identifier: "UpdatExpenses",
      method: API_METHODS.PATCH,
      endpoint: "/expenses",
    },
    Get: {
      identifier: "GetPExpenses",
      method: API_METHODS.GET,
      endpoint: "/expenses",
    },
    GetAll: {
      identifier: "GetAllExpenses",
      method: API_METHODS.POST,
      endpoint: "/expenses",
    },
    Delete: {
      identifier: "DeleteExpenses",
      method: API_METHODS.DELETE,
      endpoint: "/expenses",
    },
  },
  StockOut: {
    Create: {
      identifier: "AddStockOut",
      method: API_METHODS.PUT,
      endpoint: "/stock_out",
    },
    Update: {
      identifier: "UpdatStockOut",
      method: API_METHODS.PATCH,
      endpoint: "/stock_out",
    },
    Get: {
      identifier: "GetPStockOut",
      method: API_METHODS.GET,
      endpoint: "/stock_out",
    },
    GetAll: {
      identifier: "GetAllStockOut",
      method: API_METHODS.POST,
      endpoint: "/stock_out",
    },
    Delete: {
      identifier: "DeleteStockOut",
      method: API_METHODS.DELETE,
      endpoint: "/stock_out",
    },
  },
  InvoiceNumber: {
    Create: {
      identifier: "AddInvoiceNumber",
      method: API_METHODS.PUT,
      endpoint: "/invoice_numbers",
    },
    Update: {
      identifier: "UpdatInvoiceNumber",
      method: API_METHODS.PATCH,
      endpoint: "/invoice_numbers",
    },
    Get: {
      identifier: "GetInvoiceNumber",
      method: API_METHODS.GET,
      endpoint: "/invoice_numbers",
    },
    GetAll: {
      identifier: "GetAllInvoiceNumber",
      method: API_METHODS.POST,
      endpoint: "/invoice_numbers",
    },
    Delete: {
      identifier: "DeleteInvoiceNumber",
      method: API_METHODS.DELETE,
      endpoint: "/invoice_numbers",
    },
  }
};
