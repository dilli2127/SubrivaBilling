import { message } from "antd";
import { API_ROUTES } from "../services/api/utils";

export const showToast = (type: "success" | "error", content: string) => {
  if (type === "success") {
    message.success(content);
  } else if (type === "error") {
    message.error(content);
  }
};

// Generic function to generate API route getters for any entity
export const createApiRouteGetter = <T extends keyof typeof API_ROUTES>(entityName: T) => {
  return (action: keyof typeof API_ROUTES[T]) => {
    const route = API_ROUTES?.[entityName]?.[action];
    if (!route) {
      console.error(`API_ROUTES.${String(entityName)}.${String(action)} is undefined.`);
      throw new Error(`API route for ${String(entityName)}.${String(action)} is not defined.`);
    }
    return route;
  };
};

// Generic CRUD factory that creates all CRUD operations for an entity
export const createCrudOperations = <T extends keyof typeof API_ROUTES>(entityName: T) => {
  const getRoute = createApiRouteGetter(entityName);
  
  return {
    getAll: () => getRoute("GetAll" as keyof typeof API_ROUTES[T]),
    create: () => getRoute("Create" as keyof typeof API_ROUTES[T]),
    update: () => getRoute("Update" as keyof typeof API_ROUTES[T]),
    delete: () => getRoute("Delete" as keyof typeof API_ROUTES[T]),
    get: () => getRoute("Get" as keyof typeof API_ROUTES[T]),
  };
};

// Auto-generated CRUD operations for all entities
export const CrudOperations = {
  CmsImage: createCrudOperations("CmsImage"),
  Customer: createCrudOperations("Customer"),
  Unit: createCrudOperations("Unit"),
  Variant: createCrudOperations("Variant"),
  Category: createCrudOperations("Category"),
  Product: createCrudOperations("Product"),
  Vendor: createCrudOperations("Vendor"),
  Warehouse: createCrudOperations("Warehouse"),
  StockAudit: createCrudOperations("StockAudit"),
  SalesRecord: createCrudOperations("SalesRecord"),
  PaymentHistory: createCrudOperations("PaymentHistory"),
  Expenses: createCrudOperations("Expenses"),
  StockOut: createCrudOperations("StockOut"),
  InvoiceNumber: createCrudOperations("InvoiceNumber"),
  Organisations: createCrudOperations("Organisations"),
  // Note: DashBoard and StockAvailable are handled specially in useApiActions
  // because they don't follow the standard CRUD pattern
} as const;
// Legacy individual functions (keeping for backward compatibility)
export const getApiRouteCmsImage = createApiRouteGetter("CmsImage");
export const getApiRouteCustomer = createApiRouteGetter("Customer");
export const getApiRouteUnit = createApiRouteGetter("Unit");
export const getApiRouteVariant = createApiRouteGetter("Variant");
export const getApiRouteCategory = createApiRouteGetter("Category");
export const getApiRouteProduct = createApiRouteGetter("Product");
export const getApiRouteVendor = createApiRouteGetter("Vendor");
export const getApiRouteWareHouse = createApiRouteGetter("Warehouse");
export const getApiRouteStockAudit = createApiRouteGetter("StockAudit");
export const getApiRouteRetailBill = createApiRouteGetter("SalesRecord");
export const getApiRoutePaymentHistory = createApiRouteGetter("PaymentHistory");
export const getApiRouteExpenses = createApiRouteGetter("Expenses");
export const getApiRouteStockOut = createApiRouteGetter("StockOut");
export const getApiRouteInvoiceNumber = createApiRouteGetter("InvoiceNumber");
export const getApiRouteDashBoard = createApiRouteGetter("DashBoard");
export const getApiRouteStockAvailable = createApiRouteGetter("StockAvailable");
export const getApiRouteOrganisations = createApiRouteGetter("Organisations");
