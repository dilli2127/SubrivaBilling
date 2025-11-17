import React, { useState, useEffect, useMemo } from 'react';
import { getCurrentUser } from '../../helpers/auth';
import SessionStorageEncryption from '../../helpers/encryption';
import {
  Card,
  Row,
  Col,
  Typography,
  DatePicker,
  Select,
  Button,
  Space,
  Tabs,
  Modal,
  Radio,
  Checkbox,
  Form,
  Tooltip,
  Tag,
} from 'antd';
import {
  BarChartOutlined,
  DownloadOutlined,
  PrinterOutlined,
  FileExcelOutlined,
  FilePdfOutlined,
  ReloadOutlined,
  FilterOutlined,
  FundOutlined,
  DollarOutlined,
  ShoppingCartOutlined,
  UserOutlined,
  StockOutlined,
  TeamOutlined,
  CalendarOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import styles from './Reports.module.css';
import {
  useGetTenantAccountsQuery,
  useGetOrganisationsQuery,
  useGetBranchesQuery,
} from '../../services/redux/api/apiSlice';
import { useReportData } from './hooks/useReportData';
import { useReportExport } from './hooks/useReportExport';
import { ReportDataProvider } from './context/ReportDataContext';

// Import report components
import ComprehensiveReport from './components/ComprehensiveReport';
import FinancialReport from './components/FinancialReport';
import SalesReport from './components/SalesReport';
import CustomerReport from './components/CustomerReport';
import InventoryReport from './components/InventoryReport';
import StaffReport from './components/StaffReport';
import PaymentReport from './components/PaymentReport';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const Reports: React.FC = () => {
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs, dayjs.Dayjs] | null>([
    dayjs().subtract(30, 'days'),
    dayjs(),
  ]);
  const [selectedTenant, setSelectedTenant] = useState<string>('all');
  const [selectedOrganisation, setSelectedOrganisation] = useState<string>('all');
  const [selectedBranch, setSelectedBranch] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('1');
  const [form] = Form.useForm();

  // Get user role
  const userItem = useMemo(() => {
    return getCurrentUser();
  }, []);

  // Get user type from scope first (preferred), fallback to user_type
  const scopeData = SessionStorageEncryption.getItem('scope');
  const userRole = scopeData?.userType || userItem?.user_type || userItem?.usertype || userItem?.user_role || '';
  const isSuperAdmin = userRole.toLowerCase() === 'superadmin';
  const isTenant = userRole.toLowerCase() === 'tenant';
  const isOrganisationUser = userRole.toLowerCase() === 'organisationuser';
  const isBranchUser = userRole.toLowerCase() === 'branchuser';

  // Use RTK Query for dropdowns data - conditionally based on user role
  // Only fetch tenants for SuperAdmin
  const { data: tenantsData } = useGetTenantAccountsQuery({}, { skip: !isSuperAdmin });
  
  // Only fetch organisations for SuperAdmin and Tenant (not for OrganisationUser or BranchUser)
  const { data: organisationsData } = useGetOrganisationsQuery({}, { 
    skip: !isSuperAdmin && !isTenant 
  });
  
  // Only fetch branches for SuperAdmin, Tenant, and OrganisationUser (not for BranchUser)
  const { data: branchesData } = useGetBranchesQuery({}, { 
    skip: isBranchUser 
  });

  const tenantsItems = (tenantsData as any)?.result || [];
  const organisationsItems = (organisationsData as any)?.result || [];
  const branchesItems = (branchesData as any)?.result || [];

  // RTK Query automatically fetches data on mount, no manual fetch needed

  // Prepare dropdown options
  const tenantOptions = useMemo(() => {
    return (Array.isArray(tenantsItems) ? tenantsItems : []).map((tenant: any) => ({
      label: tenant.organization_name || tenant.contact_name || tenant.username,
      value: tenant._id,
    }));
  }, [tenantsItems]);

  const organisationOptions = useMemo(() => {
    let orgs = Array.isArray(organisationsItems) ? organisationsItems : [];
    // Filter by selected tenant if applicable
    if (isSuperAdmin && selectedTenant !== 'all') {
      orgs = orgs.filter((org: any) => org.tenant_id === selectedTenant);
    }
    return orgs.map((org: any) => ({
      label: org.org_name || org.name,
      value: org._id,
    }));
  }, [organisationsItems, selectedTenant, isSuperAdmin]);

  const branchOptions = useMemo(() => {
    let branches = Array.isArray(branchesItems) ? branchesItems : [];
    // Filter by selected organisation if applicable
    if (selectedOrganisation !== 'all') {
      branches = branches.filter((branch: any) => 
        branch.organisation_id === selectedOrganisation 
      );
    }
    return branches.map((branch: any) => ({
      label: branch.branch_name || branch.name,
      value: branch._id,
    }));
  }, [branchesItems, selectedOrganisation]);

  // Handle tenant change - reset dependent filters
  const handleTenantChange = (value: string) => {
    setSelectedTenant(value);
    setSelectedOrganisation('all');
    setSelectedBranch('all');
    // RTK Query will automatically refetch organisations when filters change
    // Filtering is handled client-side in organisationOptions useMemo
  };

  // Handle organisation change - reset branch filter
  const handleOrganisationChange = (value: string) => {
    setSelectedOrganisation(value);
    setSelectedBranch('all');
    // RTK Query will automatically refetch branches when filters change
    // Filtering is handled client-side in branchOptions useMemo
  };

  // Use custom hooks
  const {
    loading,
    reportCache,
    fetchReportData,
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
  } = useReportData({
    activeTab,
    selectedTenant,
    selectedOrganisation,
    selectedBranch,
    dateRange,
    isSuperAdmin,
  });

  const {
    exportModalVisible,
    setExportModalVisible,
    exportFormat,
    setExportFormat,
    exportOptions,
    setExportOptions,
    handleExport,
    handlePrint,
  } = useReportExport({
    activeTab,
    reportCache,
    selectedTenant,
    selectedOrganisation,
    selectedBranch,
    dateRange,
    tenantOptions,
    organisationOptions,
    branchOptions,
    isSuperAdmin,
    isTenant,
  });

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey) {
        switch(e.key) {
          case '1': case '2': case '3': case '4': case '5': case '6': case '7':
            e.preventDefault();
            setActiveTab(e.key);
            break;
          case 'r': case 'R':
            e.preventDefault();
            fetchReportData();
            break;
          case 'e': case 'E':
            e.preventDefault();
            setExportModalVisible(true);
            break;
          case 'p': case 'P':
            e.preventDefault();
            handlePrint();
            break;
        }
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [fetchReportData, handlePrint, setExportModalVisible]);

  // Note: RTK Query automatically fetches data on mount when skip=false
  // Only manually refetch when user clicks "Apply Filters" or "Refresh" buttons
  // Removing automatic fetch on mount to prevent duplicate API calls

  return (
    <div className={styles.container}>
      {/* Header Section */}
      <Card style={{ marginBottom: 24, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
          <Col>
            <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
              <BarChartOutlined style={{ marginRight: 8 }} />
              Advanced Business Reports
            </Title>
            <Text type="secondary">Comprehensive analytics & insights with advanced reporting</Text>
          </Col>
          <Col>
            <Space wrap>
              <Tooltip title="Refresh Data (Ctrl+R)">
                <Button
                  icon={<ReloadOutlined />}
                  onClick={fetchReportData}
                  loading={loading}
                >
                  Refresh
                </Button>
              </Tooltip>
              <Tooltip title="Export Report (Ctrl+E)">
                <Button
                  icon={<DownloadOutlined />}
                  onClick={() => setExportModalVisible(true)}
                  type="primary"
                >
                  Export
                </Button>
              </Tooltip>
              <Tooltip title="Print Report (Ctrl+P)">
                <Button
                  icon={<PrinterOutlined />}
                  onClick={handlePrint}
                >
                  Print
                </Button>
              </Tooltip>
              <Tooltip title="Settings">
                <Button
                  icon={<SettingOutlined />}
                  type="dashed"
                />
              </Tooltip>
            </Space>
          </Col>
        </Row>

        {/* Filters */}
        <Row gutter={16} align="middle">
          <Col xs={24} sm={12} md={6}>
            <Space direction="vertical" size={2} style={{ width: '100%' }}>
              <Text strong><CalendarOutlined /> Date Range:</Text>
              <RangePicker
                value={dateRange}
                onChange={(dates) => setDateRange(dates as [dayjs.Dayjs, dayjs.Dayjs] | null)}
                style={{ width: '100%' }}
              />
            </Space>
          </Col>

          {/* Tenant Dropdown - Only for SuperAdmin */}
          {isSuperAdmin && (
            <Col xs={24} sm={12} md={6}>
              <Space direction="vertical" size={2} style={{ width: '100%' }}>
                <Text strong>Tenant:</Text>
                <Select
                  value={selectedTenant}
                  onChange={handleTenantChange}
                  style={{ width: '100%' }}
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option: any) =>
                    String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                >
                  <Option value="all">All Tenants</Option>
                  {tenantOptions.map((option: any) => (
                    <Option key={option.value} value={option.value}>
                      {option.label}
                    </Option>
                  ))}
                </Select>
              </Space>
            </Col>
          )}

          {/* Organisation Dropdown - For SuperAdmin and Tenant only (not OrganisationUser or BranchUser) */}
          {(isSuperAdmin || isTenant) && !isOrganisationUser && !isBranchUser && (
            <Col xs={24} sm={12} md={6}>
              <Space direction="vertical" size={2} style={{ width: '100%' }}>
                <Text strong>Organisation:</Text>
                <Select
                  value={selectedOrganisation}
                  onChange={handleOrganisationChange}
                  style={{ width: '100%' }}
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option: any) =>
                    String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  disabled={isSuperAdmin && selectedTenant === 'all'}
                  placeholder={isSuperAdmin && selectedTenant === 'all' ? 'Select tenant first' : 'Select organisation'}
                >
                  <Option value="all">All Organisations</Option>
                  {organisationOptions.map((option: any) => (
                    <Option key={option.value} value={option.value}>
                      {option.label}
                    </Option>
                  ))}
                </Select>
              </Space>
            </Col>
          )}

          {/* Branch Dropdown - For SuperAdmin, Tenant, and OrganisationUser (not BranchUser) */}
          {(isSuperAdmin || isTenant || isOrganisationUser) && !isBranchUser && (
            <Col xs={24} sm={12} md={6}>
              <Space direction="vertical" size={2} style={{ width: '100%' }}>
                <Text strong>Branch:</Text>
                <Select
                  value={selectedBranch}
                  onChange={setSelectedBranch}
                  style={{ width: '100%' }}
                  showSearch
                  optionFilterProp="children"
                  filterOption={(input, option: any) =>
                    String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  disabled={(isSuperAdmin || isTenant) && selectedOrganisation === 'all'}
                  placeholder={(isSuperAdmin || isTenant) && selectedOrganisation === 'all' ? 'Select organisation first' : 'Select branch'}
                >
                  <Option value="all">All Branches</Option>
                  {branchOptions.map((option: any) => (
                    <Option key={option.value} value={option.value}>
                      {option.label}
                    </Option>
                  ))}
                </Select>
              </Space>
            </Col>
          )}

          <Col xs={24} sm={24} md={6}>
            <Button
              type="primary"
              icon={<FilterOutlined />}
              onClick={fetchReportData}
              loading={loading}
              style={{ marginTop: 22, width: '100%' }}
              size="large"
            >
              Apply Filters
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Report Content Tabs */}
      <ReportDataProvider
        value={{
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
          loading,
        }}
      >
        <Tabs 
          activeKey={activeTab}
          onChange={setActiveTab}
          type="card" 
          size="large"
          style={{ backgroundColor: '#fff', padding: 16, borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
          items={[
            {
              key: '1',
              label: (
                <Tooltip title="Comprehensive Overview (Ctrl+1)">
                  <span><BarChartOutlined /> Comprehensive</span>
                </Tooltip>
              ),
              children: <ComprehensiveReport />,
            },
            {
              key: '2',
              label: (
                <Tooltip title="Financial Analysis (Ctrl+2)">
                  <span><FundOutlined /> Financial</span>
                </Tooltip>
              ),
              children: <FinancialReport />,
            },
            {
              key: '3',
              label: (
                <Tooltip title="Sales Analytics (Ctrl+3)">
                  <span><ShoppingCartOutlined /> Sales</span>
                </Tooltip>
              ),
              children: <SalesReport />,
            },
            {
              key: '4',
              label: (
                <Tooltip title="Customer Analytics (Ctrl+4)">
                  <span><UserOutlined /> Customers</span>
                </Tooltip>
              ),
              children: <CustomerReport />,
            },
            {
              key: '5',
              label: (
                <Tooltip title="Inventory Report (Ctrl+5)">
                  <span><StockOutlined /> Inventory</span>
                </Tooltip>
              ),
              children: <InventoryReport />,
            },
          {
            key: '6',
            label: (
              <Tooltip title="Staff Performance (Under Development)">
                <span>
                  <TeamOutlined /> Staff 
                  <Tag color="orange" style={{ marginLeft: 8, fontSize: 10 }}>Dev</Tag>
                </span>
              </Tooltip>
            ),
            children: <StaffReport />,
          },
            {
              key: '7',
              label: (
                <Tooltip title="Payment Analysis (Ctrl+7)">
                  <span><DollarOutlined /> Payments</span>
                </Tooltip>
              ),
              children: <PaymentReport />,
            },
          ]}
        />
      </ReportDataProvider>

      {/* Export Modal */}
      <Modal
        title={<><DownloadOutlined /> Export Report</>}
        open={exportModalVisible}
        onCancel={() => setExportModalVisible(false)}
        onOk={handleExport}
        okText="Export"
        cancelText="Cancel"
        width={500}
      >
        <Form form={form} layout="vertical">
          <Form.Item label="Export Format">
            <Radio.Group 
              value={exportFormat} 
              onChange={(e) => setExportFormat(e.target.value)}
              buttonStyle="solid"
            >
              <Radio.Button value="pdf"><FilePdfOutlined /> PDF</Radio.Button>
              <Radio.Button value="excel"><FileExcelOutlined /> Excel</Radio.Button>
              <Radio.Button value="csv">CSV</Radio.Button>
            </Radio.Group>
          </Form.Item>
          <Form.Item label="Include in Export">
            <Checkbox.Group 
              value={exportOptions}
              onChange={(values) => setExportOptions(values as string[])}
              style={{ width: '100%' }}
            >
              <Row>
                <Col span={24}><Checkbox value="summary">Summary Statistics</Checkbox></Col>
                <Col span={24}><Checkbox value="charts">Charts & Graphs</Checkbox></Col>
                <Col span={24}><Checkbox value="tables">Detailed Tables</Checkbox></Col>
                <Col span={24}><Checkbox value="trends">Trend Analysis</Checkbox></Col>
              </Row>
            </Checkbox.Group>
          </Form.Item>
          <Form.Item label="Date Range">
            <RangePicker style={{ width: '100%' }} value={dateRange} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Reports;
