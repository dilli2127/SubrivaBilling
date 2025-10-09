import React, { useState, useEffect, useMemo } from 'react';
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
import { useApiActions } from '../../services/api/useApiActions';
import { useDynamicSelector } from '../../services/redux/selector';
import { useReportData } from './hooks/useReportData';
import { useReportExport } from './hooks/useReportExport';

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
    const data = sessionStorage.getItem('user');
    return data ? JSON.parse(data) : null;
  }, []);

  const userRole = userItem?.roleItems?.name || userItem?.usertype || userItem?.user_role || '';
  const isSuperAdmin = userRole.toLowerCase() === 'superadmin';
  const isTenant = userRole.toLowerCase() === 'tenant';

  // API hooks
  const { getEntityApi } = useApiActions();
  const TenantsApi = getEntityApi('Tenant');
  const OrganisationsApi = getEntityApi('Organisations');
  const BranchesApi = getEntityApi('Braches');

  // Selectors for dropdowns data
  const { items: tenantsItems } = useDynamicSelector(TenantsApi.getIdentifier('GetAll'));
  const { items: organisationsItems } = useDynamicSelector(OrganisationsApi.getIdentifier('GetAll'));
  const { items: branchesItems } = useDynamicSelector(BranchesApi.getIdentifier('GetAll'));

  // Fetch data on mount
  useEffect(() => {
    if (isSuperAdmin) {
      TenantsApi('GetAll');
    }
    if (isSuperAdmin || isTenant) {
      OrganisationsApi('GetAll');
    }
    BranchesApi('GetAll');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuperAdmin, isTenant]);

  // Prepare dropdown options
  const tenantOptions = useMemo(() => {
    return tenantsItems?.result?.map((tenant: any) => ({
      label: tenant.organization_name || tenant.contact_name || tenant.username,
      value: tenant._id,
    })) || [];
  }, [tenantsItems]);

  const organisationOptions = useMemo(() => {
    let orgs = organisationsItems?.result || [];
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
    let branches = branchesItems?.result || [];
    // Filter by selected organisation if applicable
    if (selectedOrganisation !== 'all') {
      branches = branches.filter((branch: any) => 
        branch.organisation_id === selectedOrganisation || branch.org_id === selectedOrganisation
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
    // Refetch organisations for selected tenant
    if (value !== 'all') {
      OrganisationsApi('GetAll', { tenant_id: value });
    } else {
      OrganisationsApi('GetAll');
    }
  };

  // Handle organisation change - reset branch filter
  const handleOrganisationChange = (value: string) => {
    setSelectedOrganisation(value);
    setSelectedBranch('all');
    // Refetch branches for selected organisation
    if (value !== 'all') {
      BranchesApi('GetAll', { organisation_id: value });
    } else {
      BranchesApi('GetAll');
    }
  };

  // Use custom hooks
  const { loading, reportCache, fetchReportData } = useReportData({
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

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

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

          {/* Organisation Dropdown - For SuperAdmin and Tenant */}
          {(isSuperAdmin || isTenant) && (
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

          {/* Branch Dropdown - For All Users */}
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
              <Tooltip title="Staff Performance (Ctrl+6)">
                <span><TeamOutlined /> Staff</span>
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
