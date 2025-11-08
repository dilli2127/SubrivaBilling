import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../store';
import { API_ROUTES, getCrudEntities, getDynamicTagTypes } from '../../api/utils';
import { getAuthToken } from '../../../helpers/auth';
import { getCSRFToken } from '../../../helpers/csrfToken';
import { getActiveApiUrl } from '../../../helpers/apiModeHelper';

// Base query with authentication using existing auth system
const baseQuery = fetchBaseQuery({
  baseUrl: getActiveApiUrl(),
  prepareHeaders: (headers, { getState }) => {
    // Get token using existing auth helper
    const token = getAuthToken();
    if (token) {
      headers.set('Token', token);
      headers.set('authorization', `Bearer ${token}`);
    }

    // Add CSRF token using existing helper
    const csrfToken = getCSRFToken();
    if (csrfToken) {
      headers.set('X-CSRF-Token', csrfToken);
    }

    return headers;
  },
});

// Enhanced base query with error handling using existing auth system
const baseQueryWithReauth = async (args: any, api: any, extraOptions: any) => {
  let result = await baseQuery(args, api, extraOptions);

  // Check for 401 in TWO places:
  // 1. HTTP 401 error (result.error.status === 401)
  // 2. HTTP 200 with statusCode: 401 in body (result.data.statusCode === 401)
  const isHttpError401 = result.error && result.error.status === 401;
  const isBodyError401 = result.data && (result.data as any).statusCode === 401;
  
  if (isHttpError401 || isBodyError401) {
    // Check if it's a permission denied error (not token expiration)
    const errorData: any = isBodyError401 ? result.data : result.error?.data;
    const errorMessage = errorData?.exception || errorData?.message || '';
    
    if (errorMessage.toLowerCase().includes('access denied') || 
        errorMessage.toLowerCase().includes('insufficient permissions') ||
        errorMessage.toLowerCase().includes('permission')) {
      // Permission denied - don't clear auth, just return error
      return result;
    }
    
    // Token expired - try to refresh token
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      const refreshResult = await baseQuery(
        {
          url: '/auth/refresh-token',
          method: 'POST',
          body: { refreshToken },
        },
        api,
        extraOptions
      );

      if (refreshResult.data) {
        const { accessToken, refreshToken: newRefreshToken } = (
          refreshResult.data as any
        ).result;
        localStorage.setItem('accessToken', accessToken);
        if (newRefreshToken) {
          localStorage.setItem('refreshToken', newRefreshToken);
        }

        // Retry original request
        result = await baseQuery(args, api, extraOptions);
      } else {
        // Refresh failed, redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '#/billing_login';
      }
    } else {
      localStorage.removeItem('accessToken');
      window.location.href = '#/billing_login';
    }
  }

  return result;
};

// Helper function to create dynamic endpoints based on API_ROUTES
const createDynamicEndpoints = (builder: any) => {
  const endpoints: any = {};
  
  // Get all CRUD entities dynamically
  const crudEntities = getCrudEntities();

  // Create endpoints for each CRUD entity
  crudEntities.forEach(entity => {
    const { name, routes, key } = entity;

    // Get All endpoint
    endpoints[`get${name}`] = builder.query({
      query: (
        params: { page?: number; limit?: number; [key: string]: any } = {}
      ) => {
        const route = routes.GetAll;
        return {
          url: route.endpoint,
          method: route.method,
          body: { page: 1, limit: 10, ...params },
        };
      },
      providesTags: [name],
    });

    // Get by ID endpoint
    endpoints[`get${name}ById`] = builder.query({
      query: ({ id, ...params }: { id: string; [key: string]: any }) => {
        const route = routes.Get;
        return {
          url: `${route.endpoint}/${id}`,
          method: route.method,
          body: params,
        };
      },
      providesTags: (result: any, error: any, { id }: { id: string }) => [
        { type: name, id },
      ],
    });

    // Create endpoint
    endpoints[`create${name}`] = builder.mutation({
      query: (data: any) => {
        const route = routes.Create;
        return {
          url: route.endpoint,
          method: route.method,
          body: data,
        };
      },
      invalidatesTags: [name],
      async onQueryStarted(arg: any, { dispatch, getState, queryFulfilled }: any) {
        try {
          const { data } = await queryFulfilled;
          const createdItem = (data as any)?.result ?? data;

          const apiState = (getState() as any)[apiSlice.reducerPath];
          const queries = apiState?.queries || {};

          Object.values(queries).forEach((entry: any) => {
            if (entry?.endpointName === `get${name}`) {
              const originalArgs = entry.originalArgs ?? {};
              dispatch(
                apiSlice.util.updateQueryData(`get${name}`, originalArgs, (draft: any) => {
                  if (!draft) return;
                  const list = Array.isArray(draft.result) ? draft.result : [];
                  draft.result = [createdItem, ...list];
                  if (draft.pagination) {
                    // Handle both totalCount and total for backward compatibility
                    if (typeof draft.pagination.totalCount === 'number') {
                      draft.pagination.totalCount += 1;
                    } else if (typeof draft.pagination.total === 'number') {
                      draft.pagination.total += 1;
                    }
                  }
                  const limit = originalArgs?.limit ?? 10;
                  if (Array.isArray(draft.result) && draft.result.length > limit) {
                    draft.result = draft.result.slice(0, limit);
                  }
                })
              );
            }
          });
        } catch (err) {
          // No-op: rely on tag invalidation to reconcile
        }
      },
    });

    // Update endpoint
    endpoints[`update${name}`] = builder.mutation({
      query: ({ id, data }: { id: string; data: any }) => {
        const route = routes.Update;
        return {
          url: `${route.endpoint}/${id}`,
          method: route.method,
          body: data,
        };
      },
      invalidatesTags: (result: any, error: any, { id }: { id: string }) => [
        { type: name, id },
        name,
      ],
      async onQueryStarted(
        { id, data }: { id: string; data: any },
        { dispatch, getState, queryFulfilled }: any
      ) {
        const apiState = (getState() as any)[apiSlice.reducerPath];
        const queries = apiState?.queries || {};
        const patches: Array<{ undo: () => void }> = [];

        try {
          // Optimistically update list caches
          Object.values(queries).forEach((entry: any) => {
            if (entry?.endpointName === `get${name}`) {
              const originalArgs = entry.originalArgs ?? {};
              const patch = dispatch(
                apiSlice.util.updateQueryData(`get${name}`, originalArgs, (draft: any) => {
                  if (!draft || !Array.isArray(draft.result)) return;
                  const idx = draft.result.findIndex((item: any) => item?._id === id);
                  if (idx !== -1) {
                    draft.result[idx] = { ...draft.result[idx], ...data };
                  }
                })
              );
              patches.push(patch);
            }
            if (entry?.endpointName === `get${name}ById`) {
              const originalArgs = entry.originalArgs ?? {};
              if (originalArgs?.id === id) {
                const patch = dispatch(
                  apiSlice.util.updateQueryData(`get${name}ById`, originalArgs, (draft: any) => {
                    if (!draft) return;
                    if (draft.result && typeof draft.result === 'object') {
                      draft.result = { ...draft.result, ...data };
                    }
                  })
                );
                patches.push(patch);
              }
            }
          });

          // Reconcile with server response
          const { data: serverData } = await queryFulfilled;
          const updated = (serverData as any)?.result ?? serverData;
          Object.values(queries).forEach((entry: any) => {
            if (entry?.endpointName === `get${name}`) {
              const originalArgs = entry.originalArgs ?? {};
              dispatch(
                apiSlice.util.updateQueryData(`get${name}`, originalArgs, (draft: any) => {
                  if (!draft || !Array.isArray(draft.result)) return;
                  const idx = draft.result.findIndex((item: any) => item?._id === id);
                  if (idx !== -1) {
                    draft.result[idx] = updated;
                  }
                })
              );
            }
            if (entry?.endpointName === `get${name}ById`) {
              const originalArgs = entry.originalArgs ?? {};
              if (originalArgs?.id === id) {
                dispatch(
                  apiSlice.util.updateQueryData(`get${name}ById`, originalArgs, (draft: any) => {
                    if (!draft) return;
                    draft.result = updated;
                  })
                );
              }
            }
          });
        } catch (err) {
          // Undo all optimistic patches on failure
          patches.forEach(p => p.undo && p.undo());
        }
      },
    });

    // Delete endpoint
    endpoints[`delete${name}`] = builder.mutation({
      query: (id: string) => {
        const route = routes.Delete;
        return {
          url: `${route.endpoint}/${id}`,
          method: route.method,
        };
      },
      invalidatesTags: (result: any, error: any, id: string) => [
        { type: name, id },
        name,
      ],
      async onQueryStarted(id: string, { dispatch, getState, queryFulfilled }: any) {
        const apiState = (getState() as any)[apiSlice.reducerPath];
        const queries = apiState?.queries || {};
        const patches: Array<{ undo: () => void }> = [];

        try {
          // Optimistically remove from list caches
          Object.values(queries).forEach((entry: any) => {
            if (entry?.endpointName === `get${name}`) {
              const originalArgs = entry.originalArgs ?? {};
              const patch = dispatch(
                apiSlice.util.updateQueryData(`get${name}`, originalArgs, (draft: any) => {
                  if (!draft || !Array.isArray(draft.result)) return;
                  const before = draft.result.length;
                  draft.result = draft.result.filter((item: any) => item?._id !== id);
                  if (draft.pagination) {
                    const after = draft.result.length;
                    if (after < before) {
                      // Handle both totalCount and total for backward compatibility
                      if (typeof draft.pagination.totalCount === 'number') {
                        draft.pagination.totalCount -= 1;
                      } else if (typeof draft.pagination.total === 'number') {
                        draft.pagination.total -= 1;
                      }
                    }
                  }
                })
              );
              patches.push(patch);
            }
            if (entry?.endpointName === `get${name}ById`) {
              const originalArgs = entry.originalArgs ?? {};
              if (originalArgs?.id === id) {
                const patch = dispatch(
                  apiSlice.util.updateQueryData(`get${name}ById`, originalArgs, (draft: any) => {
                    if (!draft) return;
                    draft.result = undefined;
                  })
                );
                patches.push(patch);
              }
            }
          });

          await queryFulfilled;
        } catch (err) {
          // Undo optimistic patches on failure
          patches.forEach(p => p.undo && p.undo());
        }
      },
    });
  });

  return endpoints;
};

// Define the main API slice
export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  // Performance defaults
  refetchOnFocus: false,
  refetchOnReconnect: false,
  refetchOnMountOrArgChange: false,
  keepUnusedDataFor: 60,
  tagTypes: [
    'Dashboard',
    'PlanLimits',
    ...getDynamicTagTypes(), // Dynamically generated tag types from CRUD entities
  ],
  endpoints: builder => {
    // Get dynamic CRUD endpoints
    const dynamicEndpoints = createDynamicEndpoints(builder);

    return {
      // All CRUD endpoints are dynamically generated
      // Custom non-CRUD endpoints are injected via separate endpoint files
      // See: src/services/redux/api/endpoints/ for modular endpoints
      ...dynamicEndpoints,
    };
  },
});

/**
 * CRUD Hooks Export
 * 
 * All CRUD hooks are automatically generated by RTK Query and available as:
 * - useGet{EntityName}Query
 * - useGet{EntityName}ByIdQuery  
 * - useCreate{EntityName}Mutation
 * - useUpdate{EntityName}Mutation
 * - useDelete{EntityName}Mutation
 * 
 * For custom non-CRUD endpoints (Auth, Dashboard, Reports, Stock), 
 * import from: src/services/redux/api/endpoints/
 * 
 * Example:
 * import { useLoginMutation } from '@/services/redux/api/endpoints';
 * import { useGetSalesReportQuery } from '@/services/redux/api/endpoints';
 */

// Export commonly used CRUD hooks for convenience
export const {
  // Tenant Accounts
  useGetTenantAccountsQuery,
  useGetTenantAccountsByIdQuery,
  useCreateTenantAccountsMutation,
  useUpdateTenantAccountsMutation,
  useDeleteTenantAccountsMutation,
  
  // Organizations
  useGetOrganisationsQuery,
  useGetOrganisationsByIdQuery,
  useCreateOrganisationsMutation,
  useUpdateOrganisationsMutation,
  useDeleteOrganisationsMutation,
  
  // Branches
  useGetBranchesQuery,
  useGetBranchesByIdQuery,
  useCreateBranchesMutation,
  useUpdateBranchesMutation,
  useDeleteBranchesMutation,
} = apiSlice;

// Helper function to get RTK hooks for any entity dynamically
export const getEntityHooks = (entityName: string) => {
  // Capitalize first letter
  const capitalizedEntity = entityName.charAt(0).toUpperCase() + entityName.slice(1);

  // Get the hooks directly from the apiSlice
  const getQueryHook = (apiSlice as any)[`useGet${capitalizedEntity}Query`];
  const getByIdQueryHook = (apiSlice as any)[`useGet${capitalizedEntity}ByIdQuery`];
  const createMutationHook = (apiSlice as any)[`useCreate${capitalizedEntity}Mutation`];
  const updateMutationHook = (apiSlice as any)[`useUpdate${capitalizedEntity}Mutation`];
  const deleteMutationHook = (apiSlice as any)[`useDelete${capitalizedEntity}Mutation`];

  return {
    useGetQuery: getQueryHook,
    useGetByIdQuery: getByIdQueryHook,
    useCreateMutation: createMutationHook,
    useUpdateMutation: updateMutationHook,
    useDeleteMutation: deleteMutationHook,
  };
};

// Helper function to get all available entity names
export const getAvailableEntities = () => {
  return getCrudEntities().map(entity => entity.name);
};

// Helper function to check if an entity has RTK Query hooks
export const hasEntityHooks = (entityName: string) => {
  const capitalizedEntity = entityName.charAt(0).toUpperCase() + entityName.slice(1);
  return !!(apiSlice as any)[`useGet${capitalizedEntity}Query`];
};
