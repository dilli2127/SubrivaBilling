import { useState, useCallback } from 'react';
import { message } from 'antd';
import dayjs from 'dayjs';
import {
  mockSalesData,
  mockCustomerSegments,
  mockProductPerformance,
  mockPaymentMethods,
  mockTopCustomers,
  mockStaffPerformance,
} from '../utils/mockData';

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

// Generate mock data based on report type
export const generateReportData = (reportType: ReportType) => {
  switch (reportType) {
    case 'inventory':
      return {
        totalProducts: 1245,
        stockValue: 850000,
        lowStockItems: 42,
        outOfStock: 18,
        categoryData: mockProductPerformance,
        stockMovement: mockSalesData
      };
    case 'financial':
      return {
        totalRevenue: 328000,
        totalExpenses: 230894,
        netProfit: 97106,
        cashFlow: mockSalesData
      };
    case 'sales':
      return {
        totalSales: 328000,
        avgOrderValue: 356,
        conversionRate: 24.5,
        topCustomers: mockTopCustomers,
        salesData: mockSalesData
      };
    case 'customer':
      return {
        totalCustomers: 510,
        newThisMonth: 45,
        vipCustomers: 85,
        customerSegments: mockCustomerSegments
      };
    case 'staff':
      return {
        totalStaff: 24,
        staffPerformance: mockStaffPerformance,
        avgConversion: 75.8,
        targetAchievement: 91
      };
    case 'payment':
      return {
        totalCollected: 356000,
        pending: 28000,
        overdue: 11000,
        collectionRate: 92.7,
        paymentMethods: mockPaymentMethods
      };
    default:
      return {
        totalRevenue: 328000,
        netProfit: 97106,
        totalOrders: 921,
        activeCustomers: 510,
        salesData: mockSalesData,
        customerSegments: mockCustomerSegments
      };
  }
};

export const useReportData = (props: UseReportDataProps) => {
  const { activeTab, selectedTenant, selectedOrganisation, selectedBranch, dateRange, isSuperAdmin } = props;
  const [loading, setLoading] = useState(false);
  const [reportCache, setReportCache] = useState<{[key: string]: any}>({});

  const fetchReportData = useCallback(() => {
    setLoading(true);
    
    const reportType = getReportTypeFromTab(activeTab);
    
    // Create cache key based on filters
    const cacheKey = `${reportType}_${selectedTenant}_${selectedOrganisation}_${selectedBranch}_${dateRange?.[0]?.format('YYYY-MM-DD')}_${dateRange?.[1]?.format('YYYY-MM-DD')}`;
    
    // Check if data is already cached
    if (reportCache[cacheKey]) {
      setLoading(false);
      message.success('Report data loaded from cache');
      return;
    }
    
    // Simulate API call based on active tab
    // In production, you would pass these filters to your API:
    const apiFilters = {
      ...(isSuperAdmin && selectedTenant !== 'all' && { tenant_id: selectedTenant }),
      ...(selectedOrganisation !== 'all' && { organisation_id: selectedOrganisation }),
      ...(selectedBranch !== 'all' && { branch_id: selectedBranch }),
      startDate: dateRange?.[0]?.format('YYYY-MM-DD'),
      endDate: dateRange?.[1]?.format('YYYY-MM-DD'),
    };
    
    setTimeout(() => {
      // Cache the data
      const reportData = generateReportData(reportType);
      setReportCache(prev => ({
        ...prev,
        [cacheKey]: reportData
      }));
      
      setLoading(false);
      message.success(`${reportType} report data refreshed successfully`);
    }, 1000);
  }, [activeTab, selectedTenant, selectedOrganisation, selectedBranch, dateRange, reportCache, isSuperAdmin]);

  return {
    loading,
    reportCache,
    fetchReportData,
  };
};

