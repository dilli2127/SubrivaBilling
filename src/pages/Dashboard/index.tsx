import React, { useEffect, useState, useMemo } from 'react';
import { Typography, Tabs, Tooltip, Card, Row, Col, Select, Space, Button } from 'antd';
import { getCurrentUser } from '../../helpers/auth';
import SessionStorageEncryption from '../../helpers/encryption';
import {
  BarChartOutlined,
  WalletOutlined,
  StockOutlined,
  RiseOutlined,
  CreditCardOutlined,
  TeamOutlined,
  FilterOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import {
  OverviewTab,
  FinanceTab,
  InventoryTab,
  SalesAnalysisTab,
  OperationsTab,
  PerformanceTab,
} from './tabs';
import { useDashboardData } from './hooks/useDashboardData';
import { useApiActions } from '../../services/api/useApiActions';
import { useDynamicSelector } from '../../services/redux/selector';

const { Title, Text } = Typography;
const { Option } = Select;

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('1');
  const [selectedTenant, setSelectedTenant] = useState<string>('all');
  const [selectedOrganisation, setSelectedOrganisation] = useState<string>('all');
  const [selectedBranch, setSelectedBranch] = useState<string>('all');

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

  // API hooks for dropdowns
  const { getEntityApi } = useApiActions();
  const TenantsApi = getEntityApi('Tenant');
  const OrganisationsApi = getEntityApi('Organisations');
  const BranchesApi = getEntityApi('Braches');

  // Selectors for dropdowns data
  const { items: tenantsItems } = useDynamicSelector(TenantsApi.getIdentifier('GetAll'));
  const { items: organisationsItems } = useDynamicSelector(OrganisationsApi.getIdentifier('GetAll'));
  const { items: branchesItems } = useDynamicSelector(BranchesApi.getIdentifier('GetAll'));

  // Fetch data on mount based on user role
  useEffect(() => {
    if (isSuperAdmin) {
      TenantsApi('GetAll');
    } else if (isTenant) {
      OrganisationsApi('GetAll');
    } else if (isOrganisationUser) {
      BranchesApi('GetAll');
    }
    // BranchUser: Don't fetch anything (no dropdowns needed)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuperAdmin, isTenant, isOrganisationUser, isBranchUser]);

  // Prepare dropdown options
  const tenantOptions = useMemo(() => {
    return tenantsItems?.result?.map((tenant: any) => ({
      label: tenant.organization_name || tenant.contact_name || tenant.username,
      value: tenant._id,
    })) || [];
  }, [tenantsItems]);

  const organisationOptions = useMemo(() => {
    let orgs = organisationsItems?.result || [];
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

  // Handle tenant change
  const handleTenantChange = (value: string) => {
    setSelectedTenant(value);
    setSelectedOrganisation('all');
    setSelectedBranch('all');
    if (value !== 'all') {
      OrganisationsApi('GetAll', { tenant_id: value });
    }
  };

  // Handle organisation change
  const handleOrganisationChange = (value: string) => {
    setSelectedOrganisation(value);
    setSelectedBranch('all');
    if (value !== 'all') {
      BranchesApi('GetAll', { organisation_id: value });
    }
  };

  // Memoize filters to prevent unnecessary re-renders
  const filters = useMemo(() => ({
    tenant_id: selectedTenant !== 'all' ? selectedTenant : undefined,
    organisation_id: selectedOrganisation !== 'all' ? selectedOrganisation : undefined,
    branch_id: selectedBranch !== 'all' ? selectedBranch : undefined,
  }), [selectedTenant, selectedOrganisation, selectedBranch]);

  // Get all dashboard data from custom hook with filters
  const {
    DashBoardItems,
    SalesChartDataItems,
    FinancialDataItems,
    InventoryMetricsItems,
    SalesAnalyticsItems,
    OperationsDataItems,
    recentInvoices,
    stockAlerts,
    topProducts,
    topCustomers,
    refetch,
  } = useDashboardData(activeTab, filters);

  // Keyboard navigation for tabs
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key >= '1' && e.key <= '6') {
        e.preventDefault();
        setActiveTab(e.key);
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  return (
    <div
      style={{
        padding: 24,
        backgroundColor: '#f0f2f5',
        minHeight: '100vh',
      }}
    >
      {/* Page Header */}
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ margin: 0, color: '#1890ff' }}>
          📊 Business Dashboard
        </Title>
        <Text type="secondary" style={{ fontSize: 16 }}>
          Monitor your business performance and key metrics
        </Text>
      </div>

      {/* Filter Section */}
      <Card style={{ marginBottom: 24, borderRadius: 12 }}>
        <Row gutter={16} align="middle">
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

          {/* Apply Filters Button */}
          <Col xs={24} sm={24} md={6}>
            <Button
              type="primary"
              icon={<FilterOutlined />}
              onClick={refetch}
              style={{ marginTop: 22, width: '100%' }}
              size="large"
            >
              Apply Filters
            </Button>
          </Col>

          {/* Refresh Button */}
          <Col xs={24} sm={24} md={6}>
            <Button
              icon={<ReloadOutlined />}
              onClick={refetch}
              style={{ marginTop: 22, width: '100%' }}
              size="large"
            >
              Refresh Data
            </Button>
          </Col>
        </Row>
      </Card>

      {/* Tabs */}
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        type="card"
        size="large"
        items={[
          {
            key: '1',
            label: (
              <Tooltip title="Ctrl+1">
                <span>
                  <BarChartOutlined /> Overview
                </span>
              </Tooltip>
            ),
            children: (
              <OverviewTab
                DashBoardItems={DashBoardItems}
                SalesChartDataItems={SalesChartDataItems}
                stockAlerts={stockAlerts}
              />
            ),
          },
          {
            key: '2',
            label: (
              <Tooltip title="Ctrl+2">
                <span>
                  <WalletOutlined /> Finance
                </span>
              </Tooltip>
            ),
            children: (
              <FinanceTab
                FinancialDataItems={FinancialDataItems}
                recentInvoices={recentInvoices}
              />
            ),
          },
          {
            key: '3',
            label: (
              <Tooltip title="Ctrl+3">
                <span>
                  <StockOutlined /> Inventory
                </span>
              </Tooltip>
            ),
            children: (
              <InventoryTab InventoryMetricsItems={InventoryMetricsItems} />
            ),
          },
          {
            key: '4',
            label: (
              <Tooltip title="Ctrl+4">
                <span>
                  <RiseOutlined /> Sales Analysis
                </span>
              </Tooltip>
            ),
            children: (
              <SalesAnalysisTab
                topProducts={topProducts}
                topCustomers={topCustomers}
                SalesAnalyticsItems={SalesAnalyticsItems}
              />
            ),
          },
          {
            key: '5',
            label: (
              <Tooltip title="Ctrl+5">
                <span>
                  <CreditCardOutlined /> Operations
                </span>
              </Tooltip>
            ),
            children: (
              <OperationsTab OperationsDataItems={OperationsDataItems} />
            ),
          },
          {
            key: '6',
            label: (
              <Tooltip title="Ctrl+6">
                <span>
                  <TeamOutlined /> Performance
                </span>
              </Tooltip>
            ),
            children: (
              <PerformanceTab SalesAnalyticsItems={SalesAnalyticsItems} />
            ),
          },
        ]}
      />
    </div>
  );
};

export default Dashboard;
