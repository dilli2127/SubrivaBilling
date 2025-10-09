import dayjs from 'dayjs';
import { message } from 'antd';

interface ExportOptions {
  tenantOptions: any[];
  organisationOptions: any[];
  branchOptions: any[];
  selectedTenant: string;
  selectedOrganisation: string;
  selectedBranch: string;
  dateRange: [dayjs.Dayjs, dayjs.Dayjs] | null;
  isSuperAdmin: boolean;
  isTenant: boolean;
}

// Helper to get filter labels
export const getFilterLabels = (options: ExportOptions) => {
  const getTenantLabel = () => {
    if (options.selectedTenant === 'all') return 'All Tenants';
    const tenant = options.tenantOptions.find((t: any) => t.value === options.selectedTenant);
    return tenant?.label || options.selectedTenant;
  };
  
  const getOrganisationLabel = () => {
    if (options.selectedOrganisation === 'all') return 'All Organisations';
    const org = options.organisationOptions.find((o: any) => o.value === options.selectedOrganisation);
    return org?.label || options.selectedOrganisation;
  };
  
  const getBranchLabel = () => {
    if (options.selectedBranch === 'all') return 'All Branches';
    const branch = options.branchOptions.find((b: any) => b.value === options.selectedBranch);
    return branch?.label || options.selectedBranch;
  };

  return { getTenantLabel, getOrganisationLabel, getBranchLabel };
};

// Excel export function
export const exportToExcel = (data: any, reportType: string, options: ExportOptions) => {
  let excelData: any[] = [];
  const fileName = `${reportType}_report_${dayjs().format('YYYY-MM-DD')}`;
  
  const { getTenantLabel, getOrganisationLabel, getBranchLabel } = getFilterLabels(options);
  
  switch (reportType) {
    case 'inventory':
      excelData = [
        ['Inventory Report', '', '', ''],
        ['Date Range:', options.dateRange?.[0]?.format('YYYY-MM-DD'), 'to', options.dateRange?.[1]?.format('YYYY-MM-DD')],
        ...(options.isSuperAdmin ? [['Tenant:', getTenantLabel(), '', '']] : []),
        ...((options.isSuperAdmin || options.isTenant) ? [['Organisation:', getOrganisationLabel(), '', '']] : []),
        ['Branch:', getBranchLabel(), '', ''],
        ['', '', '', ''],
        ['Total Products', 'Stock Value', 'Low Stock Items', 'Out of Stock'],
        [data.totalProducts, `₹${data.stockValue.toLocaleString()}`, data.lowStockItems, data.outOfStock],
        ['', '', '', ''],
        ['Category', 'Sales', 'Profit', 'Margin'],
        ...data.categoryData.map((item: any) => [
          item.name, 
          `₹${item.sales.toLocaleString()}`, 
          `₹${item.profit.toLocaleString()}`, 
          `${item.margin}%`
        ])
      ];
      break;
    case 'sales':
      excelData = [
        ['Sales Report', '', '', ''],
        ['Date Range:', options.dateRange?.[0]?.format('YYYY-MM-DD'), 'to', options.dateRange?.[1]?.format('YYYY-MM-DD')],
        ...(options.isSuperAdmin ? [['Tenant:', getTenantLabel(), '', '']] : []),
        ...((options.isSuperAdmin || options.isTenant) ? [['Organisation:', getOrganisationLabel(), '', '']] : []),
        ['Branch:', getBranchLabel(), '', ''],
        ['', '', '', ''],
        ['Total Sales', 'Avg Order Value', 'Conversion Rate', ''],
        [`₹${data.totalSales.toLocaleString()}`, `₹${data.avgOrderValue}`, `${data.conversionRate}%`, ''],
        ['', '', '', ''],
        ['Customer Name', 'Total Purchase', 'Orders', 'Outstanding'],
        ...data.topCustomers.map((customer: any) => [
          customer.name,
          `₹${customer.totalPurchase.toLocaleString()}`,
          customer.orders,
          `₹${customer.outstanding.toLocaleString()}`
        ])
      ];
      break;
    default:
      excelData = [
        ['Report Data', '', '', ''],
        ['Date Range:', options.dateRange?.[0]?.format('YYYY-MM-DD'), 'to', options.dateRange?.[1]?.format('YYYY-MM-DD')],
        ...(options.isSuperAdmin ? [['Tenant:', getTenantLabel(), '', '']] : []),
        ...((options.isSuperAdmin || options.isTenant) ? [['Organisation:', getOrganisationLabel(), '', '']] : []),
        ['Branch:', getBranchLabel(), '', ''],
        ['', '', '', ''],
        ...Object.entries(data).map(([key, value]) => [key, value, '', ''])
      ];
  }
  
  // Convert to CSV format for download
  const csvContent = excelData.map(row => row.join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${fileName}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  message.success(`${reportType} report exported to Excel successfully!`);
};

// PDF export function
export const exportToPDF = (data: any, reportType: string) => {
  message.info('PDF export functionality will be implemented with a PDF library');
};

// CSV export function
export const exportToCSV = (data: any, reportType: string) => {
  const csvData = Object.entries(data).map(([key, value]) => `${key},${value}`).join('\n');
  const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${reportType}_report_${dayjs().format('YYYY-MM-DD')}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  message.success(`${reportType} report exported to CSV successfully!`);
};

