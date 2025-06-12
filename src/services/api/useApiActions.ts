import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { callApi } from "./callApi";

import {
  getApiRouteCategory,
  getApiRouteProduct,
  getApiRouteVariant,
  getApiRouteUnit,
} from "../../helpers/Common_functions";

// Define action types
type ProductAction = "GetAll" | "Create" | "Update" | "Delete";
type VariantAction = "Get" | "Create" | "Update";
type CategoryAction = "Get" | "Create" | "Update";
type UnitAction = "Get" | "Create";
type Action = "GetAll" | "Create" | "Update" | "Delete";

// Generic fetcher with useCallback + identifier support
type FetcherWithIdentifier<T extends string> = {
  (action: T, data?: any): Promise<void>;
  getIdentifier: (action: T) => string;
};

function createFetcher<T extends string>(
  getRouteFn: (action: T) => { method: string; endpoint: string; identifier: string }
): (dispatch: any) => FetcherWithIdentifier<T> {
  return (dispatch: any) => {
    const identifierMap: Record<T, string> = {} as Record<T, string>;

    // Memoized API caller
    const fetcher = useCallback(
      (action: T, data: any = {}) => {
        const route = getRouteFn(action);
        identifierMap[action] = route.identifier;

        return callApi(
          dispatch,
          {
            method: route.method,
            endpoint: route.endpoint,
            data,
          },
          route.identifier
        );
      },
      [dispatch]
    ) as FetcherWithIdentifier<T>;

    // Attach dynamic identifier retriever
    fetcher.getIdentifier = (action: T) => {
      return identifierMap[action] || getRouteFn(action).identifier;
    };

    return fetcher;
  };
}

export const useApiActions = () => {
  const dispatch = useDispatch();

  const ProductsApi = createFetcher<ProductAction>(getApiRouteProduct)(dispatch);
  const VariantsApi = createFetcher<VariantAction>(getApiRouteVariant)(dispatch);
  const CategoriesApi = createFetcher<CategoryAction>(getApiRouteCategory)(dispatch);
  const UnitsApi = createFetcher<UnitAction>(getApiRouteUnit)(dispatch);

  return {
    ProductsApi,
    VariantsApi,
    CategoriesApi,
    UnitsApi,
  };
};
