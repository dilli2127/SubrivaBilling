import { useDispatch } from "react-redux";
import { useCallback } from "react";
import { CrudOperations, createCrudOperations } from "./Common_functions";
import { dynamic_request } from "../services/redux/slices";
import { API_ROUTES } from "../services/api/utils";

// Type for CRUD actions
export type CrudAction = "GetAll" | "Create" | "Update" | "Delete" | "Get";

// Type for API route structure
export type ApiRoute = {
  method: string;
  endpoint: string;
  identifier: string;
};

// Type for entity names
export type EntityName = keyof typeof API_ROUTES;

// Hook for using CRUD operations with Redux
export const useCrudOperations = <T extends EntityName>(entityName: T) => {
  const dispatch = useDispatch();
  
  const operations = (CrudOperations as any)[entityName] || createCrudOperations(entityName);
  
  const callApi = useCallback((action: CrudAction, data?: any, id?: string) => {
    const route = operations[action.toLowerCase() as keyof typeof operations]();
    
    let endpoint = route.endpoint;
    if (id && (action === "Update" || action === "Delete" || action === "Get")) {
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
  }, [dispatch, operations]);

  return {
    getAll: () => callApi("GetAll"),
    create: (data: any) => callApi("Create", data),
    update: (id: string, data: any) => callApi("Update", data, id),
    delete: (id: string) => callApi("Delete", { _id: id }, id),
    get: (id: string) => callApi("Get", {}, id),
    operations,
  };
};

// Generic CRUD component factory
export const createCrudComponent = <T extends EntityName>(
  entityName: T,
  config: {
    title: string;
    formItems: any[];
    columns: any[];
    formColumns?: number;
  }
) => {
  return () => {
    const { getAll, create, update, delete: deleteItem } = useCrudOperations(entityName);
    
    // This would be used in a React component
    // For now, just return the configuration
    return {
      ...config,
      apiOperations: {
        getAll,
        create,
        update,
        delete: deleteItem,
      },
    };
  };
};

// Example usage for Organisations
export const useOrganisationsCrud = () => useCrudOperations("Organisations");

// Example usage for any new entity
export const useEntityCrud = <T extends EntityName>(entityName: T) => useCrudOperations(entityName);

// Utility function to get API routes for any entity
export const getEntityApiRoutes = <T extends EntityName>(entityName: T) => {
  const operations = (CrudOperations as any)[entityName] || createCrudOperations(entityName);
  
  return {
    get: operations.getAll(),
    create: operations.create(),
    update: operations.update(),
    delete: operations.delete(),
  };
}; 