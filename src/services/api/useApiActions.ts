import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { callApi } from "./callApi";
import {
  CrudOperations,
  createCrudOperations,
} from "../../helpers/Common_functions";
import { dynamic_request } from "../redux/slices";
import { API_ROUTES } from "./utils";

// Define supported actions
type Action = "GetAll" | "Create" | "Update" | "Delete";
type DashboardAction = "GetCount" | "SalesChartData" | "PurchaseChartData";
type StockAction = "GetProductStockCount";

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

// Generic function to get API route for any entity and action
const getApiRoute = (entityName: string, action: string): ApiRoute => {
  // Special handling for entities that don't follow standard CRUD pattern
  if (entityName === "DashBoard" || entityName === "StockAvailable") {
    // For these entities, use the direct API_ROUTES access
    const route = (API_ROUTES as any)[entityName]?.[action];

    if (!route) {
      console.error(`API route for ${entityName}.${action} is not defined.`);
      throw new Error(`API route for ${entityName}.${action} is not defined.`);
    }

    return route;
  }

  // For standard CRUD entities
  const operations =
    (CrudOperations as any)[entityName] ||
    createCrudOperations(entityName as any);

  // Map action names to the correct function names
  const actionMap: Record<string, string> = {
    GetAll: "getAll",
    Create: "create",
    Update: "update",
    Delete: "delete",
    Get: "get",
  };

  const functionName = actionMap[action];
  if (!functionName || !operations[functionName]) {
    console.error(`API route for ${entityName}.${action} is not defined.`);
    throw new Error(`API route for ${entityName}.${action} is not defined.`);
  }

  const route = operations[functionName]();

  if (!route) {
    console.error(`API route for ${entityName}.${action} returned undefined.`);
    throw new Error(
      `API route for ${entityName}.${action} returned undefined.`
    );
  }

  return route;
};

/**
 * Factory function to create API action wrappers for given entity
 */
function createFetcher<T extends string>(
  entityName: string
): (dispatch: any) => FetcherWithIdentifier<T> {
  return (dispatch: any) => {
    const identifierMap: Record<T, string> = {} as Record<T, string>;

    const fetcher = useCallback(
      async (action: T, data: any = {}, id: string = "") => {
        const route = getApiRoute(entityName, action);
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
      return (
        identifierMap[action] || getApiRoute(entityName, action).identifier
      );
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
    // Generic function for any entity (recommended for new code)
    getEntityApi: (entityName: string) =>
      createFetcher<Action>(entityName)(dispatch),

    // Generic function to call API for any entity
    callEntityApi: useCallback(
      (entityName: string, action: Action, data?: any, id?: string) => {
        const route = getApiRoute(entityName, action);

        let endpoint = route.endpoint;
        if (id && (action === "Update" || action === "Delete")) {
          endpoint = `${route.endpoint}/${id}`;
        }

        dispatch(
          dynamic_request(
            {
              method: route.method,
              endpoint,
              data: data || {},
            },
            route.identifier
          ) as any
        );
      },
      [dispatch]
    ),
    // Keep only special entities that don't follow standard CRUD pattern
    DashBoard: createFetcher<DashboardAction>("DashBoard")(dispatch),
    StockAvailable: createFetcher<StockAction>("StockAvailable")(dispatch),
  };
};
