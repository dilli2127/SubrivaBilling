import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { callApi } from "./callApi";

import {
  getApiRouteCategory,
  getApiRouteProduct,
  getApiRouteVariant,
  getApiRouteUnit,
} from "../../helpers/Common_functions";

type Action = "GetAll" | "Create" | "Update" | "Delete";

type FetcherWithIdentifier<T extends string> = {
  (action: T, data?: any): Promise<void>;
  getIdentifier: (action: T) => string;
};

function createFetcher<T extends string>(
  getRouteFn: (action: T) => {
    method: string;
    endpoint: string;
    identifier: string;
  }
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

  const ProductsApi = createFetcher<Action>(getApiRouteProduct)(dispatch);
  const VariantsApi = createFetcher<Action>(getApiRouteVariant)(dispatch);
  const CategoriesApi = createFetcher<Action>(getApiRouteCategory)(dispatch);
  const UnitsApi = createFetcher<Action>(getApiRouteUnit)(dispatch);

  return {
    ProductsApi,
    VariantsApi,
    CategoriesApi,
    UnitsApi,
  };
};
