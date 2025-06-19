import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { callApi } from "./callApi";

import {
  getApiRouteCategory,
  getApiRouteProduct,
  getApiRouteVariant,
  getApiRouteUnit,
  getApiRouteVendor,
  getApiRouteWareHouse,
  getApiRouteStockAudit,
  getApiRouteCustomer,
  getApiRouteRetailBill,
  getApiRoutePaymentHistory,
  getApiRouteExpenses,
  getApiRouteStockOut,
  getApiRouteInvoiceNumber,
  getApiRouteDashBoard,
} from "../../helpers/Common_functions";

// Define supported actions
type Action = "GetAll" | "Create" | "Update" | "Delete";

// Define the structure of a route
type ApiRoute = {
  method: string;
  endpoint: string;
  identifier: string;
};

// Define the fetcher return type
type FetcherWithIdentifier<T extends string> = {
  (action: T, data?: any, id?: string): Promise<void>;
  getIdentifier: (action: T) => string;
};

/**
 * Factory function to create API action wrappers for given route generators
 */
function createFetcher<T extends string>(
  getRouteFn: (action: T) => ApiRoute
): (dispatch: any) => FetcherWithIdentifier<T> {
  return (dispatch: any) => {
    const identifierMap: Record<T, string> = {} as Record<T, string>;

    const fetcher = useCallback(
      async (action: T, data: any = {}, id: string = "") => {
        const route = getRouteFn(action);
        identifierMap[action] = route.identifier;

        // Ensure no double slashes when concatenating endpoint and id
        const normalizedEndpoint = route.endpoint.endsWith("/")
          ? `${route.endpoint}${id}`
          : id
          ? `${route.endpoint}/${id}`
          : route.endpoint;

        return callApi(
          dispatch,
          {
            method: route.method,
            endpoint: normalizedEndpoint,
            data,
          },
          route.identifier
        );
      },
      [dispatch]
    ) as FetcherWithIdentifier<T>;

    // Add helper to retrieve the route's identifier
    fetcher.getIdentifier = (action: T) => {
      return identifierMap[action] || getRouteFn(action).identifier;
    };

    return fetcher;
  };
}

/**
 * Hook to expose all API modules in a unified structure
 */
export const useApiActions = () => {
  const dispatch = useDispatch();

  return {
    ProductsApi: createFetcher<Action>(getApiRouteProduct)(dispatch),
    VariantsApi: createFetcher<Action>(getApiRouteVariant)(dispatch),
    CategoriesApi: createFetcher<Action>(getApiRouteCategory)(dispatch),
    UnitsApi: createFetcher<Action>(getApiRouteUnit)(dispatch),
    VendorApi: createFetcher<Action>(getApiRouteVendor)(dispatch),
    WarehouseApi: createFetcher<Action>(getApiRouteWareHouse)(dispatch),
    StockAuditApi: createFetcher<Action>(getApiRouteStockAudit)(dispatch),
    CustomerApi: createFetcher<Action>(getApiRouteCustomer)(dispatch),
    SalesRecord: createFetcher<Action>(getApiRouteRetailBill)(dispatch),
    PaymentHistory: createFetcher<Action>(getApiRoutePaymentHistory)(dispatch),
    ExpensesApi: createFetcher<Action>(getApiRouteExpenses)(dispatch),
    StockOutApi: createFetcher<Action>(getApiRouteStockOut)(dispatch),
    InvoiceNumberApi:createFetcher<Action>(getApiRouteInvoiceNumber)(dispatch),
    // DashBoard:createFetcher<Action>(getApiRouteDashBoard)(dispatch)
  };
};
