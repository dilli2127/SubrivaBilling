import { useState } from 'react';
import dayjs from 'dayjs';
import { message } from 'antd';
import { exportToExcel, exportToPDF, exportToCSV } from '../utils/exportHelpers';
import { getReportTypeFromTab } from './useReportData';

interface UseReportExportProps {
  activeTab: string;
  reportCache: {[key: string]: any};
  selectedTenant: string;
  selectedOrganisation: string;
  selectedBranch: string;
  dateRange: [dayjs.Dayjs, dayjs.Dayjs] | null;
  tenantOptions: any[];
  organisationOptions: any[];
  branchOptions: any[];
  isSuperAdmin: boolean;
  isTenant: boolean;
}

export const useReportExport = (props: UseReportExportProps) => {
  const [exportModalVisible, setExportModalVisible] = useState(false);
  const [exportFormat, setExportFormat] = useState<'pdf' | 'excel' | 'csv'>('excel');
  const [exportOptions, setExportOptions] = useState<string[]>(['summary', 'charts', 'tables']);

  const handleExport = () => {
    const reportType = getReportTypeFromTab(props.activeTab);
    const cacheKey = `${reportType}_${props.selectedTenant}_${props.selectedOrganisation}_${props.selectedBranch}_${props.dateRange?.[0]?.format('YYYY-MM-DD')}_${props.dateRange?.[1]?.format('YYYY-MM-DD')}`;
    const reportData = props.reportCache[cacheKey];
    
    if (!reportData) {
      message.error('No data available to export. Please apply filters first.');
      return;
    }
    
    const exportOpts = {
      tenantOptions: props.tenantOptions,
      organisationOptions: props.organisationOptions,
      branchOptions: props.branchOptions,
      selectedTenant: props.selectedTenant,
      selectedOrganisation: props.selectedOrganisation,
      selectedBranch: props.selectedBranch,
      dateRange: props.dateRange,
      isSuperAdmin: props.isSuperAdmin,
      isTenant: props.isTenant,
    };
    
    // Export based on active tab (report type)
    if (exportFormat === 'excel') {
      exportToExcel(reportData, reportType, exportOpts);
    } else if (exportFormat === 'pdf') {
      exportToPDF(reportData, reportType);
    } else {
      exportToCSV(reportData, reportType);
    }
    
    setExportModalVisible(false);
  };

  const handlePrint = () => {
    message.info('Preparing report for printing...');
    window.print();
  };

  return {
    exportModalVisible,
    setExportModalVisible,
    exportFormat,
    setExportFormat,
    exportOptions,
    setExportOptions,
    handleExport,
    handlePrint,
  };
};

