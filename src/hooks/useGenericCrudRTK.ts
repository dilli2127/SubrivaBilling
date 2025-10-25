import { useCallback, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { getEntityHooks } from '../services/redux/api/apiSlice';
import { API_ROUTES } from '../services/api/utils';
// Define EntityName type locally
type EntityName = string;

// Type for RTK query parameters
export interface RTKQueryParams {
  page?: number;
  limit?: number;
  [key: string]: any;
}

// Type for RTK mutation result
export interface RTKMutationResult<T = any> {
  data?: T;
  error?: any;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
}

// Type for RTK query result
export interface RTKQueryResult<T = any> {
  data?: T;
  error?: any;
  isLoading: boolean;
  isSuccess: boolean;
  isError: boolean;
  refetch: () => void;
}

/**
 * Custom hook that provides RTK Query functionality for any entity
 * Works with the existing createCrudRoutes system
 */
export const useGenericCrudRTK = <T extends EntityName>(entityName: T) => {
  const dispatch = useDispatch();
  
  // Get the RTK hooks for this entity
  const entityHooks = useMemo(() => getEntityHooks(entityName), [entityName]);
  
  // Check if entity exists in API_ROUTES
  const entityRoutes = useMemo(() => {
    const routes = API_ROUTES[entityName as keyof typeof API_ROUTES];
    if (!routes || typeof routes !== 'object' || !('GetAll' in routes)) {
      throw new Error(`Entity ${entityName} not found in API_ROUTES or doesn't follow CRUD pattern`);
    }
    return routes as any;
  }, [entityName]);

  // Get all records with pagination and filters
  const useGetAll = (params: RTKQueryParams = {}) => {
    const query = entityHooks.useGetQuery(params);
    return {
      ...query,
      refetch: query.refetch,
    } as RTKQueryResult;
  };

  // Get single record by ID
  const useGetById = (id: string, params: RTKQueryParams = {}) => {
    const query = entityHooks.useGetByIdQuery({ id, ...params });
    return {
      ...query,
      refetch: query.refetch,
    } as RTKQueryResult;
  };

  // Create new record
  const useCreate = () => {
    const [createMutation, result] = entityHooks.useCreateMutation();
    
    const create = useCallback(async (data: any) => {
      try {
        const response = await createMutation(data).unwrap();
        return { data: response, error: null };
      } catch (error) {
        return { data: null, error };
      }
    }, [createMutation]);

    return {
      create,
      ...result,
    } as RTKMutationResult & { create: (data: any) => Promise<{ data: any; error: any }> };
  };

  // Update existing record
  const useUpdate = () => {
    const [updateMutation, result] = entityHooks.useUpdateMutation();
    
    const update = useCallback(async (id: string, data: any) => {
      try {
        const response = await updateMutation({ id, data }).unwrap();
        return { data: response, error: null };
      } catch (error) {
        return { data: null, error };
      }
    }, [updateMutation]);

    return {
      update,
      ...result,
    } as RTKMutationResult & { update: (id: string, data: any) => Promise<{ data: any; error: any }> };
  };

  // Delete record
  const useDelete = () => {
    const [deleteMutation, result] = entityHooks.useDeleteMutation();
    
    const remove = useCallback(async (id: string) => {
      try {
        const response = await deleteMutation(id).unwrap();
        return { data: response, error: null };
      } catch (error) {
        return { data: null, error };
      }
    }, [deleteMutation]);

    return {
      delete: remove,
      remove, // Alias for delete
      ...result,
    } as RTKMutationResult & { 
      delete: (id: string) => Promise<{ data: any; error: any }>;
      remove: (id: string) => Promise<{ data: any; error: any }>;
    };
  };

  // Get entity routes for manual API calls
  const getRoutes = useCallback(() => {
    return {
      getAll: entityRoutes.GetAll,
      get: entityRoutes.Get,
      create: entityRoutes.Create,
      update: entityRoutes.Update,
      delete: entityRoutes.Delete,
    };
  }, [entityRoutes]);

  return {
    // Query hooks
    useGetAll,
    useGetById,
    
    // Mutation hooks
    useCreate,
    useUpdate,
    useDelete,
    
    // Utility functions
    getRoutes,
    
    // Entity info
    entityName,
    entityRoutes,
  };
};

// Export individual hooks for convenience
export const useEntityQuery = <T extends EntityName>(entityName: T, params: RTKQueryParams = {}) => {
  const { useGetAll } = useGenericCrudRTK(entityName);
  return useGetAll(params);
};

export const useEntityMutation = <T extends EntityName>(entityName: T) => {
  const { useCreate, useUpdate, useDelete } = useGenericCrudRTK(entityName);
  return {
    useCreate,
    useUpdate,
    useDelete,
  };
};

// Export for backward compatibility
export default useGenericCrudRTK;