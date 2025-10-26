import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../store';
import { API_ROUTES, getCrudEntities, getDynamicTagTypes } from '../../api/utils';
import { getAuthToken } from '../../../helpers/auth';
import { getCSRFToken } from '../../../helpers/csrfToken';

// Base query with authentication using existing auth system
const baseQuery = fetchBaseQuery({
  baseUrl: process.env.REACT_APP_API_URL || 'http://localhost:8247/',
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

  if (result.error && result.error.status === 401) {
    // Try to refresh token using existing auth system
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
    });
  });

  return endpoints;
};

// Define the main API slice
export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    'Dashboard',
    'PlanLimits',
    ...getDynamicTagTypes(), // Dynamically generated tag types from CRUD entities
  ],
  endpoints: builder => {
    // Get dynamic endpoints
    const dynamicEndpoints = createDynamicEndpoints(builder);

    return {
      // Dynamic CRUD endpoints for all entities
      ...dynamicEndpoints,

      // Special endpoints that don't follow CRUD pattern
      login: builder.mutation({
        query: credentials => {
          const route = API_ROUTES.Login.Create;
          return {
            url: route.endpoint,
            method: route.method,
            body: credentials,
          };
        },
      }),

      tenantLogin: builder.mutation({
        query: credentials => {
          const route = API_ROUTES.TenantLogin.Create;
          return {
            url: route.endpoint,
            method: route.method,
            body: credentials,
          };
        },
      }),

      billingLogin: builder.mutation({
        query: credentials => {
          const route = API_ROUTES.BillingLogin.Create;
          return {
            url: route.endpoint,
            method: route.method,
            body: credentials,
          };
        },
      }),

      // Dashboard endpoints
      getDashboardStats: builder.query({
        query: (params: { [key: string]: any } = {}) => {
          const route = API_ROUTES.DashBoard.GetCount;
          return {
            url: route.endpoint,
            method: route.method,
            body: params,
          };
        },
        providesTags: ['Dashboard'],
      }),

      getSalesChart: builder.query({
        query: (params: { [key: string]: any } = {}) => {
          const route = API_ROUTES.DashBoard.SalesChartData;
          return {
            url: route.endpoint,
            method: route.method,
            body: params,
          };
        },
        providesTags: ['Dashboard'],
      }),

      getPurchaseChart: builder.query({
        query: (params: { [key: string]: any } = {}) => {
          const route = API_ROUTES.DashBoard.PurchaseChartData;
          return {
            url: route.endpoint,
            method: route.method,
            body: params,
          };
        },
        providesTags: ['Dashboard'],
      }),

      getStockAlerts: builder.query({
        query: (params: { [key: string]: any } = {}) => {
          const route = API_ROUTES.DashBoard.StockAlert;
          return {
            url: route.endpoint,
            method: route.method,
            body: params,
          };
        },
        providesTags: ['Dashboard'],
      }),

      getFinancialData: builder.query({
        query: (params: { [key: string]: any } = {}) => {
          const route = API_ROUTES.DashBoard.FinancialData;
          return {
            url: route.endpoint,
            method: route.method,
            body: params,
          };
        },
        providesTags: ['Dashboard'],
      }),

      getSalesAnalytics: builder.query({
        query: (params: { [key: string]: any } = {}) => {
          const route = API_ROUTES.DashBoard.SalesAnalytics;
          return {
            url: route.endpoint,
            method: route.method,
            body: params,
          };
        },
        providesTags: ['Dashboard'],
      }),

      getInventoryMetrics: builder.query({
        query: (params: { [key: string]: any } = {}) => {
          const route = API_ROUTES.DashBoard.InventoryMetrics;
          return {
            url: route.endpoint,
            method: route.method,
            body: params,
          };
        },
        providesTags: ['Dashboard'],
      }),

      // Plan Limits
      getPlanLimits: builder.query({
        query: (params: { [key: string]: any } = {}) => {
          const route = API_ROUTES.PlanLimits.Get;
          return {
            url: route.endpoint,
            method: route.method,
            body: params,
          };
        },
        providesTags: ['PlanLimits'],
      }),
    };
  },
});

// Export all generated hooks dynamically
export const {
  // Authentication
  useLoginMutation,
  useTenantLoginMutation,
  useBillingLoginMutation,

  // Dashboard
  useGetDashboardStatsQuery,
  useGetSalesChartQuery,
  useGetPurchaseChartQuery,
  useGetStockAlertsQuery,
  useGetFinancialDataQuery,
  useGetSalesAnalyticsQuery,
  useGetInventoryMetricsQuery,

  // Plan Limits
  useGetPlanLimitsQuery,

  // All CRUD hooks are automatically generated by RTK Query based on createCrudRoutes
  // No need to hardcode them - they are dynamically available as:
  // useGet{EntityName}Query, useGet{EntityName}ByIdQuery, useCreate{EntityName}Mutation, etc.
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
