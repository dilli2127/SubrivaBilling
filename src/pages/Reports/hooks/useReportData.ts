import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { message } from 'antd';
import dayjs from 'dayjs';
import { apiSlice } from '../../../services/redux/api/apiSlice';
import {
  useGetSalesReportQuery,
  useGetStockReportQuery,
  useGetProfitLossReportQuery,
  useGetOutstandingPaymentsReportQuery,
  useGetPaymentCollectionReportQuery,
  useGetExpenseReportQuery,
  useGetGSTReportQuery,
  useGetTopProductsReportQuery,
  useGetTopCustomersReportQuery,
  useGetStockExpiryReportQuery,
  useGetProductSalesReportQuery,
  useGetCustomerSalesReportQuery,
} from '../../../services/redux/api/endpoints';

export type ReportType = 'comprehensive' | 'financial' | 'sales' | 'customer' | 'inventory' | 'staff' | 'payment';

interface UseReportDataProps {
  activeTab: string;
  selectedTenant: string;
  selectedOrganisation: string;
  selectedBranch: string;
  dateRange: [dayjs.Dayjs, dayjs.Dayjs] | null;
  isSuperAdmin: boolean;
}

// Map tab keys to report types
export const getReportTypeFromTab = (tabKey: string): ReportType => {
  switch (tabKey) {
    case '1': return 'comprehensive';
    case '2': return 'financial';
    case '3': return 'sales';
    case '4': return 'customer';
    case '5': return 'inventory';
    case '6': return 'staff';
    case '7': return 'payment';
    default: return 'comprehensive';
  }
};

export const useReportData = (props: UseReportDataProps) => {
  const { activeTab, selectedTenant, selectedOrganisation, selectedBranch, dateRange } = props;
  const [loading, setLoading] = useState(false);
  const [reportCache, setReportCache] = useState<{[key: string]: any}>({});
  const loadingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  // Prepare API filters - memoized to prevent unnecessary refetches
  const apiFilters = useMemo(() => ({
    start_date: dateRange?.[0]?.format('YYYY-MM-DD'),
    end_date: dateRange?.[1]?.format('YYYY-MM-DD'),
  }), [dateRange]);
  
  // Memoize additional filter objects to prevent recreation on every render
  const topProductsFilters = useMemo(() => ({
    ...apiFilters,
    pageLimit: 10,
  }), [apiFilters]);

  const topCustomersFilters = useMemo(() => ({
    ...apiFilters,
    pageLimit: 10,
  }), [apiFilters]);
  
  const stockExpiryFilters = useMemo(() => ({
    days_threshold: 30,
  }), []);
  
  const emptyFilters = useMemo(() => ({}), []);
  
  // Use RTK Query for all report types
  const reportType = getReportTypeFromTab(activeTab);
  
  // Conditionally fetch reports based on ONLY the active tab (no comprehensive fetching all)
  const shouldFetchSales = reportType === 'sales';
  const shouldFetchProductSales = reportType === 'sales';
  const shouldFetchTopProducts = reportType === 'sales';
  
  const shouldFetchCustomer = reportType === 'customer';
  const shouldFetchTopCustomers = reportType === 'customer';
  
  const shouldFetchInventory = reportType === 'inventory';
  const shouldFetchStockExpiry = reportType === 'inventory';
  
  const shouldFetchFinancial = reportType === 'financial';
  const shouldFetchExpense = reportType === 'financial';
  const shouldFetchGST = reportType === 'financial';
  
  const shouldFetchPayment = reportType === 'payment';
  const shouldFetchOutstanding = reportType === 'payment';
  
  // For Comprehensive tab, fetch minimal summary data only
  const shouldFetchComprehensive = reportType === 'comprehensive';
  const shouldFetchSalesForComp = shouldFetchComprehensive;
  const shouldFetchProfitLossForComp = shouldFetchComprehensive;
  const shouldFetchCustomerForComp = shouldFetchComprehensive;
  const shouldFetchStockForComp = shouldFetchComprehensive;
  const shouldFetchPaymentForComp = shouldFetchComprehensive;
  
  const { data: salesReportResponse, refetch: refetchSales } = useGetSalesReportQuery(
    apiFilters,
    { 
      skip: !shouldFetchSales && !shouldFetchSalesForComp,
      refetchOnMountOrArgChange: false,
      refetchOnFocus: false,
      refetchOnReconnect: false,
    }
  );
  const { data: productSalesResponse, refetch: refetchProductSales } = useGetProductSalesReportQuery(
    apiFilters,
    { 
      skip: !shouldFetchProductSales && !shouldFetchSalesForComp,
      refetchOnMountOrArgChange: false,
      refetchOnFocus: false,
      refetchOnReconnect: false,
    }
  );
  const { data: customerSalesResponse, refetch: refetchCustomerSales } = useGetCustomerSalesReportQuery(
    apiFilters,
    { 
      skip: !shouldFetchCustomer && !shouldFetchCustomerForComp,
      refetchOnMountOrArgChange: false,
      refetchOnFocus: false,
      refetchOnReconnect: false,
    }
  );
  const { data: stockReportResponse, refetch: refetchStock } = useGetStockReportQuery(
    emptyFilters,
    { 
      skip: !shouldFetchInventory && !shouldFetchStockForComp,
      refetchOnMountOrArgChange: false,
      refetchOnFocus: false,
      refetchOnReconnect: false,
    }
  );
  const { data: profitLossResponse, refetch: refetchProfitLoss } = useGetProfitLossReportQuery(
    apiFilters,
    { 
      skip: !shouldFetchFinancial && !shouldFetchProfitLossForComp,
      refetchOnMountOrArgChange: false,
      refetchOnFocus: false,
      refetchOnReconnect: false,
    }
  );
  const { data: outstandingPaymentsResponse, refetch: refetchOutstanding } = useGetOutstandingPaymentsReportQuery(
    emptyFilters,
    { 
      skip: !shouldFetchOutstanding,
      refetchOnMountOrArgChange: false,
      refetchOnFocus: false,
      refetchOnReconnect: false,
    }
  );
  const { data: paymentCollectionResponse, refetch: refetchPaymentCollection } = useGetPaymentCollectionReportQuery(
    apiFilters,
    { 
      skip: !shouldFetchPayment && !shouldFetchPaymentForComp,
      refetchOnMountOrArgChange: false,
      refetchOnFocus: false,
      refetchOnReconnect: false,
    }
  );
  const { data: expenseResponse, refetch: refetchExpense } = useGetExpenseReportQuery(
    apiFilters,
    { 
      skip: !shouldFetchExpense,
      refetchOnMountOrArgChange: false,
      refetchOnFocus: false,
      refetchOnReconnect: false,
    }
  );
  const { data: gstResponse, refetch: refetchGST } = useGetGSTReportQuery(
    apiFilters,
    { 
      skip: !shouldFetchGST,
      refetchOnMountOrArgChange: false,
      refetchOnFocus: false,
      refetchOnReconnect: false,
    }
  );
  const { data: topProductsResponse, refetch: refetchTopProducts } = useGetTopProductsReportQuery(
    topProductsFilters,
    { 
      skip: !shouldFetchTopProducts,
      refetchOnMountOrArgChange: false,
      refetchOnFocus: false,
      refetchOnReconnect: false,
    }
  );
  const { data: topCustomersResponse, refetch: refetchTopCustomers } = useGetTopCustomersReportQuery(
    topCustomersFilters,
    { 
      skip: !shouldFetchTopCustomers,
      refetchOnMountOrArgChange: false,
      refetchOnFocus: false,
      refetchOnReconnect: false,
    }
  );
  const { data: stockExpiryResponse, refetch: refetchStockExpiry } = useGetStockExpiryReportQuery(
    stockExpiryFilters,
    { 
      skip: !shouldFetchStockExpiry,
      refetchOnMountOrArgChange: false,
      refetchOnFocus: false,
      refetchOnReconnect: false,
    }
  );
  
  // Extract result from responses
  const salesReportData = useMemo(() => ({
    result: (salesReportResponse as any)?.result || salesReportResponse,
    loading: false,
  }), [salesReportResponse]);
  
  const productSalesData = useMemo(() => ({
    result: (productSalesResponse as any)?.result || productSalesResponse,
    loading: false,
  }), [productSalesResponse]);
  
  const customerSalesData = useMemo(() => ({
    result: (customerSalesResponse as any)?.result || customerSalesResponse,
    loading: false,
  }), [customerSalesResponse]);
  
  const stockReportData = useMemo(() => ({
    result: (stockReportResponse as any)?.result || stockReportResponse,
    loading: false,
  }), [stockReportResponse]);
  
  const profitLossData = useMemo(() => ({
    result: (profitLossResponse as any)?.result || profitLossResponse,
    loading: false,
  }), [profitLossResponse]);
  
  const outstandingPaymentsData = useMemo(() => ({
    result: (outstandingPaymentsResponse as any)?.result || outstandingPaymentsResponse,
    loading: false,
  }), [outstandingPaymentsResponse]);
  
  const paymentCollectionData = useMemo(() => ({
    result: (paymentCollectionResponse as any)?.result || paymentCollectionResponse,
    loading: false,
  }), [paymentCollectionResponse]);
  
  const expenseData = useMemo(() => ({
    result: (expenseResponse as any)?.result || expenseResponse,
    loading: false,
  }), [expenseResponse]);
  
  const gstData = useMemo(() => ({
    result: (gstResponse as any)?.result || gstResponse,
    loading: false,
  }), [gstResponse]);
  
  const topProductsData = useMemo(() => ({
    result: (topProductsResponse as any)?.result || topProductsResponse,
    loading: false,
  }), [topProductsResponse]);
  
  const topCustomersData = useMemo(() => ({
    result: (topCustomersResponse as any)?.result || topCustomersResponse,
    loading: false,
  }), [topCustomersResponse]);
  
  const stockExpiryData = useMemo(() => ({
    result: (stockExpiryResponse as any)?.result || stockExpiryResponse,
    loading: false,
  }), [stockExpiryResponse]);

  // Update cache when data changes
  useEffect(() => {
    const reportType = getReportTypeFromTab(activeTab);
    const cacheKey = `${reportType}_${selectedTenant}_${selectedOrganisation}_${selectedBranch}_${dateRange?.[0]?.format('YYYY-MM-DD')}_${dateRange?.[1]?.format('YYYY-MM-DD')}`;
    
    let newData: any = null;
    
    switch (reportType) {
      case 'sales':
        if (salesReportData?.result || productSalesData?.result || topProductsData?.result) {
          newData = {
            salesReport: salesReportData?.result,
            productSales: productSalesData?.result,
            topProducts: topProductsData?.result,
          };
        }
        break;
      case 'customer':
        if (customerSalesData?.result || topCustomersData?.result) {
          newData = {
            customerSales: customerSalesData?.result,
            topCustomers: topCustomersData?.result,
          };
        }
        break;
      case 'inventory':
        if (stockReportData?.result || stockExpiryData?.result) {
          newData = {
            stock: stockReportData?.result,
            expiry: stockExpiryData?.result,
          };
        }
        break;
      case 'financial':
        if (profitLossData?.result || expenseData?.result || gstData?.result) {
          newData = {
            profitLoss: profitLossData?.result,
            expenses: expenseData?.result,
            gst: gstData?.result,
          };
        }
        break;
      case 'payment':
        if (paymentCollectionData?.result || outstandingPaymentsData?.result) {
          newData = {
            collections: paymentCollectionData?.result,
            outstanding: outstandingPaymentsData?.result,
          };
        }
        break;
      case 'comprehensive':
        if (salesReportData?.result || profitLossData?.result) {
          newData = {
            sales: salesReportData?.result,
            profitLoss: profitLossData?.result,
            customers: customerSalesData?.result,
            stock: stockReportData?.result,
            payments: paymentCollectionData?.result,
          };
        }
        break;
    }
    
    if (newData) {
      setReportCache(prev => ({
        ...prev,
        [cacheKey]: newData
      }));
    }
  }, [
    activeTab, selectedTenant, selectedOrganisation, selectedBranch, dateRange,
    salesReportData, productSalesData, customerSalesData, stockReportData,
    profitLossData, outstandingPaymentsData, paymentCollectionData,
    expenseData, gstData, topProductsData, topCustomersData, stockExpiryData
  ]);

  const fetchReportData = useCallback(() => {
    const reportType = getReportTypeFromTab(activeTab);
    
    // Create cache key based on filters
    const cacheKey = `${reportType}_${selectedTenant}_${selectedOrganisation}_${selectedBranch}_${dateRange?.[0]?.format('YYYY-MM-DD')}_${dateRange?.[1]?.format('YYYY-MM-DD')}`;
    
    // Check if data is already cached
    if (reportCache[cacheKey]) {
      message.success('Report data loaded from cache');
      return;
    }
    
    setLoading(true);
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
      loadingTimeoutRef.current = null;
    }
    
    // Refetch data based on report type using RTK Query refetch functions
    try {
      switch (reportType) {
        case 'sales':
          refetchSales();
          refetchProductSales();
          refetchTopProducts();
          break;
        case 'customer':
          refetchCustomerSales();
          refetchTopCustomers();
          break;
        case 'inventory':
          refetchStock();
          refetchStockExpiry();
          break;
        case 'financial':
          refetchProfitLoss();
          refetchExpense();
          refetchGST();
          break;
        case 'payment':
          refetchPaymentCollection();
          refetchOutstanding();
          break;
        case 'comprehensive':
          // Fetch all necessary reports for comprehensive view
          refetchSales();
          refetchProfitLoss();
          refetchCustomerSales();
          refetchStock();
          refetchPaymentCollection();
          break;
      }
      
      // Set loading to false after a short delay to allow API calls to start
      loadingTimeoutRef.current = setTimeout(() => {
        setLoading(false);
        loadingTimeoutRef.current = null;
      }, 500);
    } catch (error) {
      setLoading(false);
      message.error('Failed to fetch report data');
      console.error('Report fetch error:', error);
    }
  }, [activeTab, selectedTenant, selectedOrganisation, selectedBranch, dateRange, reportCache, 
      refetchSales, refetchProductSales, refetchTopProducts, refetchCustomerSales, refetchTopCustomers,
      refetchStock, refetchStockExpiry, refetchProfitLoss, refetchExpense, refetchGST,
      refetchPaymentCollection, refetchOutstanding]);

  // Cleanup any pending loading timers on unmount
  useEffect(() => {
    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
    };
  }, []);

  return {
    loading,
    reportCache,
    fetchReportData,
    // Expose individual report data for easy access
    salesReportData,
    productSalesData,
    customerSalesData,
    stockReportData,
    profitLossData,
    outstandingPaymentsData,
    paymentCollectionData,
    expenseData,
    gstData,
    topProductsData,
    topCustomersData,
    stockExpiryData,
  };
};

