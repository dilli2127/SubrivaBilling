import { apiSlice } from '../apiSlice';
import { API_ROUTES } from '../../../api/utils';

/**
 * Dashboard API Endpoints
 * Injected into the main API slice without modifying apiSlice.ts
 */
export const dashboardApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Dashboard Statistics
    getDashboardStats: builder.query({
      query: (params: { [key: string]: any } = {}) => {
        const route = API_ROUTES.DashBoard.GetCount;
        return {
          url: `${route.endpoint}?_=${Date.now()}`, // Cache busting
          method: route.method,
          body: params,
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
          },
        };
      },
      providesTags: ['Dashboard'],
    }),

    // Chart Data
    getSalesChart: builder.query({
      query: (params: { [key: string]: any } = {}) => {
        const route = API_ROUTES.DashBoard.SalesChartData;
        return {
          url: `${route.endpoint}?_=${Date.now()}`, // Cache busting
          method: route.method,
          body: params,
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
          },
        };
      },
      providesTags: ['Dashboard'],
    }),

    getPurchaseChart: builder.query({
      query: (params: { [key: string]: any } = {}) => {
        const route = API_ROUTES.DashBoard.PurchaseChartData;
        return {
          url: `${route.endpoint}?_=${Date.now()}`, // Cache busting
          method: route.method,
          body: params,
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
          },
        };
      },
      providesTags: ['Dashboard'],
    }),

    // Alerts & Notifications
    getStockAlerts: builder.query({
      query: (params: { [key: string]: any } = {}) => {
        const route = API_ROUTES.DashBoard.StockAlert;
        return {
          url: `${route.endpoint}?_=${Date.now()}`, // Cache busting
          method: route.method,
          body: params,
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
          },
        };
      },
      providesTags: ['Dashboard'],
    }),

    // Financial Data
    getFinancialData: builder.query({
      query: (params: { [key: string]: any } = {}) => {
        const route = API_ROUTES.DashBoard.FinancialData;
        return {
          url: `${route.endpoint}?_=${Date.now()}`, // Cache busting
          method: route.method,
          body: params,
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
          },
        };
      },
      providesTags: ['Dashboard'],
    }),

    // Analytics
    getSalesAnalytics: builder.query({
      query: (params: { [key: string]: any } = {}) => {
        const route = API_ROUTES.DashBoard.SalesAnalytics;
        return {
          url: `${route.endpoint}?_=${Date.now()}`, // Cache busting
          method: route.method,
          body: params,
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
          },
        };
      },
      providesTags: ['Dashboard'],
    }),

    getInventoryMetrics: builder.query({
      query: (params: { [key: string]: any } = {}) => {
        const route = API_ROUTES.DashBoard.InventoryMetrics;
        return {
          url: `${route.endpoint}?_=${Date.now()}`, // Cache busting
          method: route.method,
          body: params,
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
          },
        };
      },
      providesTags: ['Dashboard'],
    }),

    // Plan Limits
    getPlanLimits: builder.query({
      query: (params: { [key: string]: any } = {}) => {
        const route = API_ROUTES.PlanLimits.Get;
        return {
          url: `${route.endpoint}?_=${Date.now()}`, // Cache busting
          method: route.method,
          body: params,
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
          },
        };
      },
      providesTags: ['PlanLimits'],
    }),
  }),
  overrideExisting: false,
});

// Export hooks for usage in components
export const {
  useGetDashboardStatsQuery,
  useGetSalesChartQuery,
  useGetPurchaseChartQuery,
  useGetStockAlertsQuery,
  useGetFinancialDataQuery,
  useGetSalesAnalyticsQuery,
  useGetInventoryMetricsQuery,
  useGetPlanLimitsQuery,
} = dashboardApi;

