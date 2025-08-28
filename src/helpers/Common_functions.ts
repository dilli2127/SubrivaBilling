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

// Auto-generated CRUD operations for all entities (minimal - only for fallback)
export const CrudOperations = {
  Unit: createCrudOperations("Unit"),
  // Note: DashBoard and StockAvailable are handled specially in useApiActions
  // because they don't follow the standard CRUD pattern
} as const;