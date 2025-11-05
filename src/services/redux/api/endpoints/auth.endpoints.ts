import { apiSlice } from '../apiSlice';
import { API_ROUTES } from '../../../api/utils';

/**
 * Authentication API Endpoints
 * Injected into the main API slice without modifying apiSlice.ts
 */
export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Login endpoints
    login: builder.mutation({
      query: (credentials) => {
        const route = API_ROUTES.Login.Create;
        return {
          url: route.endpoint,
          method: route.method,
          body: credentials,
        };
      },
    }),

    tenantLogin: builder.mutation({
      query: (credentials) => {
        const route = API_ROUTES.TenantLogin.Create;
        return {
          url: route.endpoint,
          method: route.method,
          body: credentials,
        };
      },
    }),

    billingLogin: builder.mutation({
      query: (credentials) => {
        const route = API_ROUTES.BillingLogin.Create;
        return {
          url: route.endpoint,
          method: route.method,
          body: credentials,
        };
      },
    }),

    // Signup endpoints
    signup: builder.mutation({
      query: (credentials) => {
        const route = API_ROUTES.Signup.Create;
        return {
          url: route.endpoint,
          method: route.method,
          body: credentials,
        };
      },
    }),

    tenantSignup: builder.mutation({
      query: (credentials) => {
        return {
          url: '/tenant_accounts_signup',
          method: 'POST',
          body: credentials,
        };
      },
    }),

    billingSignup: builder.mutation({
      query: (credentials) => {
        return {
          url: '/billing_signup',
          method: 'POST',
          body: credentials,
        };
      },
    }),
  }),
  overrideExisting: false,
});

// Export hooks for usage in components
export const {
  useLoginMutation,
  useTenantLoginMutation,
  useBillingLoginMutation,
  useSignupMutation,
  useTenantSignupMutation,
  useBillingSignupMutation,
} = authApi;

