import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../store';
import { API_ROUTES } from '../../api/utils';
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

  // Get all entity names from API_ROUTES that use createCrudRoutes
  const crudEntities = Object.keys(API_ROUTES).filter(entityName => {
    const entity = API_ROUTES[entityName as keyof typeof API_ROUTES];
    return entity && typeof entity === 'object' && 'GetAll' in entity;
  });

  // Create endpoints for each CRUD entity
  crudEntities.forEach(entityName => {
    const entityRoutes = API_ROUTES[
      entityName as keyof typeof API_ROUTES
    ] as any;

    // Get the actual entity name from the createCrudRoutes call
    // For entities like "Tenant" that use "TenantAccounts", we need to use the actual entity name
    const actualEntityName =
      entityRoutes.GetAll?.identifier?.replace('GetAll', '') || entityName;

    // Handle pluralization for RTK Query endpoints
    // For simple entities that don't already end with 's', add 's' to make them plural
    // For compound words like "BranchStock", "StockStorage", etc., keep them as is
    const isCompoundWord =
      actualEntityName.includes('Stock') ||
      actualEntityName.includes('Storage') ||
      actualEntityName.includes('Account') ||
      actualEntityName.includes('History') ||
      actualEntityName.includes('Number') ||
      actualEntityName.includes('Definition') ||
      actualEntityName.includes('Metadata') ||
      actualEntityName.includes('Record');

    const endpointName = isCompoundWord
      ? actualEntityName
      : actualEntityName.endsWith('s')
        ? actualEntityName
        : `${actualEntityName}s`;

    // Get All endpoint
    endpoints[`get${endpointName}`] = builder.query({
      query: (
        params: { page?: number; limit?: number; [key: string]: any } = {}
      ) => {
        const route = entityRoutes.GetAll;
        return {
          url: route.endpoint,
          method: route.method,
          body: { page: 1, limit: 10, ...params },
        };
      },
      providesTags: [entityName],
    });

    // Get by ID endpoint
    endpoints[`get${endpointName}ById`] = builder.query({
      query: ({ id, ...params }: { id: string; [key: string]: any }) => {
        const route = entityRoutes.Get;
        return {
          url: `${route.endpoint}/${id}`,
          method: route.method,
          body: params,
        };
      },
      providesTags: (result: any, error: any, { id }: { id: string }) => [
        { type: entityName, id },
      ],
    });

    // Create endpoint
    endpoints[`create${endpointName}`] = builder.mutation({
      query: (data: any) => {
        const route = entityRoutes.Create;
        return {
          url: route.endpoint,
          method: route.method,
          body: data,
        };
      },
      invalidatesTags: [entityName],
    });

    // Update endpoint
    endpoints[`update${endpointName}`] = builder.mutation({
      query: ({ id, data }: { id: string; data: any }) => {
        const route = entityRoutes.Update;
        return {
          url: `${route.endpoint}/${id}`,
          method: route.method,
          body: data,
        };
      },
      invalidatesTags: (result: any, error: any, { id }: { id: string }) => [
        { type: entityName, id },
        entityName,
      ],
    });

    // Delete endpoint
    endpoints[`delete${endpointName}`] = builder.mutation({
      query: (id: string) => {
        const route = entityRoutes.Delete;
        return {
          url: `${route.endpoint}/${id}`,
          method: route.method,
        };
      },
      invalidatesTags: (result: any, error: any, id: string) => [
        { type: entityName, id },
        entityName,
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
    'Product',
    'Customer',
    'Sale',
    'Inventory',
    'User',
    'Invoice',
    'Dashboard',
    'Category',
    'Unit',
    'Variant',
    'Vendor',
    'Rack',
    'Warehouse',
    'StockAudit',
    'SalesRecord',
    'PaymentHistory',
    'Expenses',
    'StockOut',
    'InvoiceNumber',
    'Organisations',
    'Braches',
    'Roles',
    'BillingUsers',
    'Tenant',
    'BranchStock',
    'StockStorage',
    'Settings',
    'FieldMetadata',
    'EntityDefinition',
    'PlanLimits',
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

// Export all generated hooks
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

  // Plan Limits
  useGetPlanLimitsQuery,

  // Dynamic CRUD hooks - these are generated automatically by RTK Query
  // Products
  useGetProductsQuery,
  useGetProductByIdQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,

  // Customers
  useGetCustomersQuery,
  useGetCustomerByIdQuery,
  useCreateCustomerMutation,
  useUpdateCustomerMutation,
  useDeleteCustomerMutation,

  // Users
  useGetUsersQuery,
  useGetUserByIdQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,

  // Billing Users
  useGetBillingUsersQuery,
  useGetBillingUserByIdQuery,
  useCreateBillingUserMutation,
  useUpdateBillingUserMutation,
  useDeleteBillingUserMutation,

  // Branch Stock
  useGetBranchStockQuery,
  useGetBranchStockByIdQuery,
  useCreateBranchStockMutation,
  useUpdateBranchStockMutation,
  useDeleteBranchStockMutation,

  // Categories
  useGetCategoriesQuery,
  useGetCategoryByIdQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,

  // Units
  useGetUnitsQuery,
  useGetUnitByIdQuery,
  useCreateUnitMutation,
  useUpdateUnitMutation,
  useDeleteUnitMutation,

  // Variants
  useGetVariantsQuery,
  useGetVariantByIdQuery,
  useCreateVariantMutation,
  useUpdateVariantMutation,
  useDeleteVariantMutation,

  // Vendors
  useGetVendorsQuery,
  useGetVendorByIdQuery,
  useCreateVendorMutation,
  useUpdateVendorMutation,
  useDeleteVendorMutation,

  // Racks
  useGetRacksQuery,
  useGetRackByIdQuery,
  useCreateRackMutation,
  useUpdateRackMutation,
  useDeleteRackMutation,

  // Warehouses
  useGetWarehousesQuery,
  useGetWarehouseByIdQuery,
  useCreateWarehouseMutation,
  useUpdateWarehouseMutation,
  useDeleteWarehouseMutation,

  // Stock Audit
  useGetStockAuditQuery,
  useGetStockAuditByIdQuery,
  useCreateStockAuditMutation,
  useUpdateStockAuditMutation,
  useDeleteStockAuditMutation,

  // Sales Record
  useGetSalesRecordQuery,
  useGetSalesRecordByIdQuery,
  useCreateSalesRecordMutation,
  useUpdateSalesRecordMutation,
  useDeleteSalesRecordMutation,

  // Payment History
  useGetPaymentHistoryQuery,
  useGetPaymentHistoryByIdQuery,
  useCreatePaymentHistoryMutation,
  useUpdatePaymentHistoryMutation,
  useDeletePaymentHistoryMutation,

  // Expenses
  useGetExpensesQuery,
  useGetExpenseByIdQuery,
  useCreateExpenseMutation,
  useUpdateExpenseMutation,
  useDeleteExpenseMutation,

  // Stock Out
  useGetStockOutQuery,
  useGetStockOutByIdQuery,
  useCreateStockOutMutation,
  useUpdateStockOutMutation,
  useDeleteStockOutMutation,

  // Invoice Number
  useGetInvoiceNumberQuery,
  useGetInvoiceNumberByIdQuery,
  useCreateInvoiceNumberMutation,
  useUpdateInvoiceNumberMutation,
  useDeleteInvoiceNumberMutation,

  // Organisations
  useGetOrganisationsQuery,
  useGetOrganisationByIdQuery,
  useCreateOrganisationMutation,
  useUpdateOrganisationMutation,
  useDeleteOrganisationMutation,

  // Branches
  useGetBranchesQuery,
  useGetBranchByIdQuery,
  useCreateBranchMutation,
  useUpdateBranchMutation,
  useDeleteBranchMutation,

  // Roles
  useGetRolesQuery,
  useGetRoleByIdQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,

  // Tenant
  useGetTenantAccountsQuery,
  useGetTenantAccountByIdQuery,
  useCreateTenantAccountMutation,
  useUpdateTenantAccountMutation,
  useDeleteTenantAccountMutation,

  // Stock Storage
  useGetStockStorageQuery,
  useGetStockStorageByIdQuery,
  useCreateStockStorageMutation,
  useUpdateStockStorageMutation,
  useDeleteStockStorageMutation,

  // Settings
  useGetSettingsQuery,
  useGetSettingByIdQuery,
  useCreateSettingMutation,
  useUpdateSettingMutation,
  useDeleteSettingMutation,

  // Field Metadata
  useGetFieldMetadataQuery,
  useGetFieldMetadataByIdQuery,
  useCreateFieldMetadataMutation,
  useUpdateFieldMetadataMutation,
  useDeleteFieldMetadataMutation,

  // Entity Definition
  useGetEntityDefinitionQuery,
  useGetEntityDefinitionByIdQuery,
  useCreateEntityDefinitionMutation,
  useUpdateEntityDefinitionMutation,
  useDeleteEntityDefinitionMutation,
} = apiSlice;

// Helper function to get RTK hooks for any entity
export const getEntityHooks = (entityName: string) => {
  // Capitalize first letter
  const capitalizedEntity =
    entityName.charAt(0).toUpperCase() + entityName.slice(1);

  // Handle compound words and pluralization
  const isCompoundWord =
    capitalizedEntity.includes('Stock') ||
    capitalizedEntity.includes('Storage') ||
    capitalizedEntity.includes('Account') ||
    capitalizedEntity.includes('History') ||
    capitalizedEntity.includes('Number') ||
    capitalizedEntity.includes('Definition') ||
    capitalizedEntity.includes('Metadata') ||
    capitalizedEntity.includes('Record');

  // For singular entity names, pluralize them for the hook names
  // e.g., "Product" -> "Products", "Customer" -> "Customers"
  const pluralEntity = isCompoundWord
    ? capitalizedEntity
    : capitalizedEntity.endsWith('s')
      ? capitalizedEntity
      : `${capitalizedEntity}s`;

  // Check if hooks exist, if not, try singular form
  const getQueryHook =
    (apiSlice as any)[`useGet${pluralEntity}Query`] ||
    (apiSlice as any)[`useGet${capitalizedEntity}Query`];

  const getByIdQueryHook =
    (apiSlice as any)[`useGet${pluralEntity}ByIdQuery`] ||
    (apiSlice as any)[`useGet${capitalizedEntity}ByIdQuery`];

  const createMutationHook =
    (apiSlice as any)[`useCreate${pluralEntity}Mutation`] ||
    (apiSlice as any)[`useCreate${capitalizedEntity}Mutation`];

  const updateMutationHook =
    (apiSlice as any)[`useUpdate${pluralEntity}Mutation`] ||
    (apiSlice as any)[`useUpdate${capitalizedEntity}Mutation`];

  const deleteMutationHook =
    (apiSlice as any)[`useDelete${pluralEntity}Mutation`] ||
    (apiSlice as any)[`useDelete${capitalizedEntity}Mutation`];

  return {
    useGetQuery: getQueryHook,
    useGetByIdQuery: getByIdQueryHook,
    useCreateMutation: createMutationHook,
    useUpdateMutation: updateMutationHook,
    useDeleteMutation: deleteMutationHook,
  };
};
