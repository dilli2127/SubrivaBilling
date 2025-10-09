import { useState, useCallback, useEffect } from 'react';
import { message } from 'antd';
import dayjs from 'dayjs';
import { useSpecialApiFetchers } from '../../../services/api/specialApiFetchers';
import { useDynamicSelector } from '../../../services/redux/selector';

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
  
  const { Reports } = useSpecialApiFetchers();
  
  // Get selectors for all report types
  const salesReportData = useDynamicSelector(Reports.getIdentifier('GetSalesReport'));
  const productSalesData = useDynamicSelector(Reports.getIdentifier('GetProductSalesReport'));
  const customerSalesData = useDynamicSelector(Reports.getIdentifier('GetCustomerSalesReport'));
  const stockReportData = useDynamicSelector(Reports.getIdentifier('GetStockReport'));
  const profitLossData = useDynamicSelector(Reports.getIdentifier('GetProfitLossReport'));
  const outstandingPaymentsData = useDynamicSelector(Reports.getIdentifier('GetOutstandingPaymentsReport'));
  const paymentCollectionData = useDynamicSelector(Reports.getIdentifier('GetPaymentCollectionReport'));
  const expenseData = useDynamicSelector(Reports.getIdentifier('GetExpenseReport'));
  const gstData = useDynamicSelector(Reports.getIdentifier('GetGSTReport'));
  const topProductsData = useDynamicSelector(Reports.getIdentifier('GetTopProductsReport'));
  const topCustomersData = useDynamicSelector(Reports.getIdentifier('GetTopCustomersReport'));
  const stockExpiryData = useDynamicSelector(Reports.getIdentifier('GetStockExpiryReport'));

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
    
    // Prepare API filters
    const apiFilters = {
      start_date: dateRange?.[0]?.format('YYYY-MM-DD'),
      end_date: dateRange?.[1]?.format('YYYY-MM-DD'),
    };
    
    // Fetch data based on report type
    try {
      switch (reportType) {
        case 'sales':
          Reports('GetSalesReport', apiFilters);
          Reports('GetProductSalesReport', apiFilters);
          Reports('GetTopProductsReport', { ...apiFilters, limit: 10 });
          break;
        case 'customer':
          Reports('GetCustomerSalesReport', apiFilters);
          Reports('GetTopCustomersReport', { ...apiFilters, limit: 10 });
          break;
        case 'inventory':
          Reports('GetStockReport', {});
          Reports('GetStockExpiryReport', { days_threshold: 30 });
          break;
        case 'financial':
          Reports('GetProfitLossReport', apiFilters);
          Reports('GetExpenseReport', apiFilters);
          Reports('GetGSTReport', apiFilters);
          break;
        case 'payment':
          Reports('GetPaymentCollectionReport', apiFilters);
          Reports('GetOutstandingPaymentsReport', {});
          break;
        case 'comprehensive':
          // Fetch all necessary reports for comprehensive view
          Reports('GetSalesReport', apiFilters);
          Reports('GetProfitLossReport', apiFilters);
          Reports('GetCustomerSalesReport', apiFilters);
          Reports('GetStockReport', {});
          Reports('GetPaymentCollectionReport', apiFilters);
          break;
      }
      
      // Set loading to false after a short delay to allow API calls to start
      setTimeout(() => {
        setLoading(false);
      }, 500);
    } catch (error) {
      setLoading(false);
      message.error('Failed to fetch report data');
      console.error('Report fetch error:', error);
    }
  }, [activeTab, selectedTenant, selectedOrganisation, selectedBranch, dateRange, reportCache, Reports]);

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

