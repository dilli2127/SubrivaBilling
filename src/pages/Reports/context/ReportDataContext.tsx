import React, { createContext, useContext } from 'react';

interface ReportDataContextType {
  salesReportData: any;
  productSalesData: any;
  customerSalesData: any;
  stockReportData: any;
  profitLossData: any;
  outstandingPaymentsData: any;
  paymentCollectionData: any;
  expenseData: any;
  gstData: any;
  topProductsData: any;
  topCustomersData: any;
  stockExpiryData: any;
  loading: boolean;
}

const ReportDataContext = createContext<ReportDataContextType | undefined>(undefined);

export const ReportDataProvider: React.FC<{ value: ReportDataContextType; children: React.ReactNode }> = ({ value, children }) => {
  return <ReportDataContext.Provider value={value}>{children}</ReportDataContext.Provider>;
};

export const useReportDataContext = () => {
  const context = useContext(ReportDataContext);
  if (!context) {
    throw new Error('useReportDataContext must be used within ReportDataProvider');
  }
  return context;
};

