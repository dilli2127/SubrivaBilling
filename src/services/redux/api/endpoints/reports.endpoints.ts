import { apiSlice } from '../apiSlice';
import { API_ROUTES } from '../../../api/utils';

/**
 * Reports API Endpoints
 * Injected into the main API slice without modifying apiSlice.ts
 */
export const reportsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // Sales Reports
    getSalesReport: builder.query({
      query: (params: { [key: string]: any } = {}) => {
        const route = API_ROUTES.Reports.GetSalesReport;
        return {
          url: route.endpoint,
          method: route.method,
          body: params,
        };
      },
    }),

    getProductSalesReport: builder.query({
      query: (params: { [key: string]: any } = {}) => {
        const route = API_ROUTES.Reports.GetProductSalesReport;
        return {
          url: route.endpoint,
          method: route.method,
          body: params,
        };
      },
    }),

    getCustomerSalesReport: builder.query({
      query: (params: { [key: string]: any } = {}) => {
        const route = API_ROUTES.Reports.GetCustomerSalesReport;
        return {
          url: route.endpoint,
          method: route.method,
          body: params,
        };
      },
    }),


    // Stock & Inventory Reports
    getStockReport: builder.query({
      query: (params: { [key: string]: any } = {}) => {
        const route = API_ROUTES.Reports.GetStockReport;
        return {
          url: route.endpoint,
          method: route.method,
          body: params,
        };
      },
    }),

    getStockExpiryReport: builder.query({
      query: (params: { [key: string]: any } = {}) => {
        const route = API_ROUTES.Reports.GetStockExpiryReport;
        return {
          url: route.endpoint,
          method: route.method,
          body: params,
        };
      },
    }),

    // Financial Reports
    getProfitLossReport: builder.query({
      query: (params: { [key: string]: any } = {}) => {
        const route = API_ROUTES.Reports.GetProfitLossReport;
        return {
          url: route.endpoint,
          method: route.method,
          body: params,
        };
      },
    }),

    // Payment Reports
    getOutstandingPaymentsReport: builder.query({
      query: (params: { [key: string]: any } = {}) => {
        const route = API_ROUTES.Reports.GetOutstandingPaymentsReport;
        return {
          url: route.endpoint,
          method: route.method,
          body: params,
        };
      },
    }),

    getPaymentCollectionReport: builder.query({
      query: (params: { [key: string]: any } = {}) => {
        const route = API_ROUTES.Reports.GetPaymentCollectionReport;
        return {
          url: route.endpoint,
          method: route.method,
          body: params,
        };
      },
    }),

    // Expense & Tax Reports
    getExpenseReport: builder.query({
      query: (params: { [key: string]: any } = {}) => {
        const route = API_ROUTES.Reports.GetExpenseReport;
        return {
          url: route.endpoint,
          method: route.method,
          body: params,
        };
      },
    }),

    getGSTReport: builder.query({
      query: (params: { [key: string]: any } = {}) => {
        const route = API_ROUTES.Reports.GetGSTReport;
        return {
          url: route.endpoint,
          method: route.method,
          body: params,
        };
      },
    }),

    // Analytics Reports
    getTopProductsReport: builder.query({
      query: (params: { [key: string]: any } = {}) => {
        const route = API_ROUTES.Reports.GetTopProductsReport;
        return {
          url: route.endpoint,
          method: route.method,
          body: params,
        };
      },
    }),

    getTopCustomersReport: builder.query({
      query: (params: { [key: string]: any } = {}) => {
        const route = API_ROUTES.Reports.GetTopCustomersReport;
        return {
          url: route.endpoint,
          method: route.method,
          body: params,
        };
      },
    }),
  }),
  overrideExisting: false,
});

// Export hooks for usage in components
export const {
  useGetSalesReportQuery,
  useGetProductSalesReportQuery,
  useGetCustomerSalesReportQuery,
  useGetStockReportQuery,
  useGetStockExpiryReportQuery,
  useGetProfitLossReportQuery,
  useGetOutstandingPaymentsReportQuery,
  useGetPaymentCollectionReportQuery,
  useGetExpenseReportQuery,
  useGetGSTReportQuery,
  useGetTopProductsReportQuery,
  useGetTopCustomersReportQuery,
} = reportsApi;

