import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Card,
  Tabs,
  Form,
  Select,
  message,
  Row,
  Col,
  Typography,
} from 'antd';
import {
  SettingOutlined,
  PercentageOutlined,
  FileTextOutlined,
  PrinterOutlined,
  CheckCircleOutlined,
  BellOutlined,
  ShopOutlined,
  BankOutlined,
} from '@ant-design/icons';
import styles from './Settings.module.css';
import { apiSlice } from '../../services/redux/api/apiSlice';
import { getCurrentUser } from '../../helpers/auth';
import SessionStorageEncryption from '../../helpers/encryption';
import {
  BusinessInfoTab,
  TaxTab,
  InvoiceTab,
  PrinterTab,
  DefaultsTab,
  NotificationsTab,
  TemplateSettingsTab,
  BankDetailsTab,
} from './tabs';

const { Title, Text } = Typography;
const { Option } = Select;

// Helper function to populate organisation form data
const populateOrganisationForm = (form: any, orgData: any) => {
  if (!orgData) return;
  
  form.setFieldsValue({
    org_name: orgData.org_name || orgData.organization_name || orgData.name,
    business_type: orgData.business_type,
    email: orgData.email,
    phone: orgData.phone,
    gst_number: orgData.gst_number,
    pan_number: orgData.pan_number,
    address1: orgData.address1 || orgData.address,
    city: orgData.city,
    state: orgData.state,
    pincode: orgData.pincode,
    currency: orgData.currency,
    timezone: orgData.timezone,
    status: orgData.status !== false,
  });
};

const Settings: React.FC = () => {
  const [form] = Form.useForm();
  const [businessForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [businessLoading, setBusinessLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('business');
  const [selectedTenant, setSelectedTenant] = useState<string>('all');
  const [selectedOrganisation, setSelectedOrganisation] = useState<string>('all');

  // Get user info with memoization
  const userItem = useMemo(() => getCurrentUser(), []);
  
  // Get user role with memoization to prevent unnecessary recalculations
  const { userRole, isSuperAdmin, isTenant, isOrganisationUser, isBranchUser } = useMemo(() => {
    const scopeData = SessionStorageEncryption.getItem('scope');
    const role = scopeData?.userType || userItem?.user_type || userItem?.usertype || userItem?.user_role || '';
    return {
      userRole: role,
      isSuperAdmin: role.toLowerCase() === 'superadmin',
      isTenant: role.toLowerCase() === 'tenant',
      isOrganisationUser: role.toLowerCase() === 'organisationuser',
      isBranchUser: role.toLowerCase() === 'branchuser'
    };
  }, [userItem]);

  // Use RTK Query for data fetching
  const { data: tenantsData } = apiSlice.useGetTenantAccountsQuery({}, { skip: !isSuperAdmin });
  
  // For SuperAdmin: Filter organisations by selected tenant
  // For Tenant: Load all organisations (they will be filtered by tenant_id on backend)
  const organisationsQueryParams = useMemo(() => {
    if (isSuperAdmin && selectedTenant && selectedTenant !== 'all') {
      return { tenant_id: selectedTenant };
    }
    return {};
  }, [isSuperAdmin, selectedTenant]);
  
  const { data: organisationsData } = apiSlice.useGetOrganisationsQuery(
    organisationsQueryParams,
    { skip: !isTenant && !isSuperAdmin }
  );
  
  // For Settings by ID, we'll use RTK Query with skip option
  const [selectedSettingsId, setSelectedSettingsId] = useState<string | null>(null);
  
  // Determine if settings API should be skipped
  const shouldSkipSettings = useMemo(() => {
    if (!selectedSettingsId || selectedSettingsId === 'all') return true;
    if (isOrganisationUser || isBranchUser) return false;
    if (isSuperAdmin) return !selectedTenant || selectedTenant === 'all';
    if (isTenant) return false;
    return true;
  }, [selectedSettingsId, isSuperAdmin, isTenant, isOrganisationUser, isBranchUser, selectedTenant]);

  // Fetch settings using GetAll with organisation_id filter
  const { data: settingsData, refetch: refetchSettings } = apiSlice.useGetSettingsQuery(
    { organisation_id: selectedSettingsId, page: 1, limit: 1 },
    { 
      skip: shouldSkipSettings || !selectedSettingsId,
      refetchOnMountOrArgChange: true
    }
  );
  
  // Use RTK Query mutations
  const [updateSettings] = apiSlice.useUpdateSettingsMutation();
  const [createSettings] = apiSlice.useCreateSettingsMutation();
  const [updateOrganisation] = apiSlice.useUpdateOrganisationsMutation();

  const tenantsItems = (tenantsData as any)?.result || [];
  const organisationsItems = (organisationsData as any)?.result || [];

  // Get selected organisation data from already-loaded dropdown data
  const selectedOrganisationData = useMemo(() => {
    if (!selectedSettingsId || selectedSettingsId === 'all') return null;
    return organisationsItems?.find((item: any) => item._id === selectedSettingsId) || null;
  }, [selectedSettingsId, organisationsItems]);

  // Load settings on mount - only for organisation/branch users
  useEffect(() => {
    if ((isOrganisationUser || isBranchUser) && !selectedSettingsId) {
      const organisationId = userItem?.organisation_id || userItem?.organisationItems?._id;
      if (organisationId) {
        setSelectedSettingsId(organisationId);
        // Populate business form with user's organisation data
        populateOrganisationForm(businessForm, userItem?.organisationItems);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle tenant selection change - fetch organisations for selected tenant
  const handleTenantChange = useCallback((tenantId: string) => {
    setSelectedTenant(tenantId || 'all');
    setSelectedOrganisation('all'); // Clear organisation selection
    setSelectedSettingsId(null); // Clear settings when tenant changes
    form.resetFields(); // Reset settings form when tenant changes
    businessForm.resetFields(); // Reset business form when tenant changes
    
    if (tenantId && tenantId !== 'all') {
      // RTK Query will refetch with new filters when tenant changes
      // Organisations are filtered by tenant_id on backend
    }
    // If "all" or cleared, don't fetch organisations (keep dropdown disabled)
  }, [form, businessForm]);

  // Handle organisation selection change
  const handleOrganisationChange = useCallback((organisationId: string) => {
    setSelectedOrganisation(organisationId || 'all');
    
    if (organisationId && organisationId !== 'all') {
      // For SuperAdmin: Only proceed if tenant is selected
      if (isSuperAdmin && (!selectedTenant || selectedTenant === 'all')) {
        setSelectedSettingsId(null);
        form.resetFields();
      } else {
        setSelectedSettingsId(organisationId);
      }
    } else {
      setSelectedSettingsId(null);
      form.resetFields();
    }
  }, [form, isSuperAdmin, selectedTenant]);



  // Populate business form when organisation is selected
  useEffect(() => {
    if (selectedOrganisationData) {
      populateOrganisationForm(businessForm, selectedOrganisationData);
    } else if (selectedSettingsId && selectedSettingsId !== 'all') {
      businessForm.resetFields();
    }
  }, [selectedOrganisationData, selectedSettingsId, businessForm]);

  // Populate settings form when data loads
  useEffect(() => {
    const settingsResult = (settingsData as any)?.result || settingsData || {};
    const settings = Array.isArray(settingsResult) ? settingsResult[0] : settingsResult;
    const hasSettingsData = settings && typeof settings === 'object' && (settings._id || settings.id);
    
    if (selectedSettingsId) {
      if (hasSettingsData) {
        form.setFieldsValue({
          // Tax Settings
          tax_enabled: settings.tax_enabled ?? null,
          tax_type: settings.tax_type ?? null,

          // Invoice Settings
          invoice_prefix: settings.invoice_prefix ?? null,
          invoice_starting_number: settings.invoice_starting_number ?? null,
          invoice_footer: settings.invoice_footer ?? null,
          show_logo_on_invoice: settings.show_logo_on_invoice ?? null,
          show_terms_on_invoice: settings.show_terms_on_invoice ?? null,
          invoice_terms: settings.invoice_terms ?? null,

          // Printer Settings
          thermal_printer_enabled: settings.thermal_printer_enabled ?? null,
          printer_port: settings.printer_port ?? null,
          printer_baud_rate: settings.printer_baud_rate ?? null,
          paper_width: settings.paper_width ?? null,
          auto_print: settings.auto_print ?? null,

          // Default Values
          default_payment_mode: settings.default_payment_mode ?? null,
          default_document_type: settings.default_document_type ?? null,

          // Notification Settings
          email_notifications: settings.email_notifications ?? null,
          sms_notifications: settings.sms_notifications ?? null,
          low_stock_alert: settings.low_stock_alert ?? null,
          low_stock_threshold: settings.low_stock_threshold ?? null,
          payment_reminder: settings.payment_reminder ?? null,
          daily_report_email: settings.daily_report_email ?? null,

          // Template Settings - Use API values directly
          bill_template: settings.bill_template,
          invoice_template: settings.invoice_template,

          // Bank Details
          bank_name: settings.bank_name ?? null,
          account_holder_name: settings.account_holder_name ?? null,
          account_number: settings.account_number ?? null,
          ifsc_code: settings.ifsc_code ?? null,
          branch_name: settings.branch_name ?? null,
          account_type: settings.account_type ?? null,
          upi_id: settings.upi_id ?? null,
          swift_code: settings.swift_code ?? null,
        });
      } else {
        // No settings found - initialize with default values
        form.setFieldsValue({
          // Tax Settings
          tax_enabled: null,
          tax_type: null,

          // Invoice Settings
          invoice_prefix: null,
          invoice_starting_number: null,
          invoice_footer: null,
          show_logo_on_invoice: null,
          show_terms_on_invoice: null,
          invoice_terms: null,

          // Printer Settings
          thermal_printer_enabled: null,
          printer_port: null,
          printer_baud_rate: null,
          paper_width: null,
          auto_print: null,

          // Default Values
          default_payment_mode: null,
          default_document_type: null,

          // Notification Settings
          email_notifications: null,
          sms_notifications: null,
          low_stock_alert: null,
          low_stock_threshold: null,
          payment_reminder: null,
          daily_report_email: null,

          // Template Settings - No defaults, let backend/initial setup handle this
          bill_template: null,
          invoice_template: null,

          // Bank Details
          bank_name: null,
          account_holder_name: null,
          account_number: null,
          ifsc_code: null,
          branch_name: null,
          account_type: null,
          upi_id: null,
          swift_code: null,
        });
      }
    } else if (selectedOrganisation === 'all' && (isSuperAdmin || isTenant)) {
      form.resetFields();
    }
  }, [settingsData, selectedSettingsId, selectedOrganisation, isSuperAdmin, isTenant, form]);

  // Handle settings save
  const handleSave = useCallback(async () => {
    try {
      // Check if organization is selected for SuperAdmin and Tenant users
      if ((isSuperAdmin || isTenant) && selectedOrganisation === 'all') {
        message.error('Please select an organisation before updating settings');
        return;
      }

      const values = await form.validateFields();
      setLoading(true);

      // Determine the organisation ID to update
      let organisationId = selectedOrganisation !== 'all' ? selectedOrganisation : null;
      if (!organisationId) {
        organisationId = userItem?.organisation_id || userItem?.organisationItems?._id;
      }

      // Additional validation for SuperAdmin and Tenant users to ensure we have a valid organisation ID
      if ((isSuperAdmin || isTenant) && !organisationId) {
        message.error('Please select an organisation before updating settings');
        return;
      }

      // Save settings - Send only relevant data based on active tab
      let newSettingsData: any = {};

      // Tax & GST tab - only tax settings
      if (activeTab === 'tax') {
        newSettingsData = {
          tax_enabled: values.tax_enabled,
          tax_type: values.tax_type,
        };
      }
      // Invoice tab - only invoice settings
      else if (activeTab === 'invoice') {
        newSettingsData = {
          invoice_prefix: values.invoice_prefix,
          invoice_starting_number: values.invoice_starting_number,
          invoice_footer: values.invoice_footer,
          invoice_terms: values.invoice_terms,
          show_logo_on_invoice: values.show_logo_on_invoice,
          show_terms_on_invoice: values.show_terms_on_invoice,
        };
      }
      // Printer tab - only printer settings
      else if (activeTab === 'printer') {
        newSettingsData = {
          thermal_printer_enabled: values.thermal_printer_enabled,
          printer_port: values.printer_port,
          printer_baud_rate: values.printer_baud_rate,
          paper_width: values.paper_width,
          auto_print: values.auto_print,
        };
      }
      // Defaults tab - only default values
      else if (activeTab === 'defaults') {
        newSettingsData = {
          default_payment_mode: values.default_payment_mode,
          default_document_type: values.default_document_type,
        };
      }
      // Notifications tab - only notification settings
      else if (activeTab === 'notifications') {
        newSettingsData = {
          email_notifications: values.email_notifications,
          sms_notifications: values.sms_notifications,
          low_stock_alert: values.low_stock_alert,
          low_stock_threshold: values.low_stock_threshold,
          payment_reminder: values.payment_reminder,
          daily_report_email: values.daily_report_email,
        };
      }
      // Template tab - only template settings
      else if (activeTab === 'templates') {
        newSettingsData = {
          bill_template: values.bill_template,
          invoice_template: values.invoice_template,
        };
      }
      // Bank Details tab - only bank details
      else if (activeTab === 'bank') {
        newSettingsData = {
          bank_name: values.bank_name,
          account_holder_name: values.account_holder_name,
          account_number: values.account_number,
          ifsc_code: values.ifsc_code,
          branch_name: values.branch_name,
          account_type: values.account_type,
          upi_id: values.upi_id,
          swift_code: values.swift_code,
        };
      }

      // Check if settings exist, if not create new settings
      const settingsResult = (settingsData as any)?.result || settingsData || [];
      
      // Extract first item from array if it's an array response
      const existingSettings = Array.isArray(settingsResult) 
        ? settingsResult[0] 
        : settingsResult;
      
      // Check if we have valid existing settings with an ID
      const hasExistingSettings = existingSettings && (existingSettings._id || existingSettings.id);
      const targetOrgId = organisationId || userItem?._id;
      
      if (hasExistingSettings) {
        // Update existing settings
        const settingsId = existingSettings._id || existingSettings.id;
        await updateSettings({
          id: settingsId,
          data: {
            ...newSettingsData,
            organisation_id: targetOrgId,
          }
        }).unwrap();
        
        message.success('Settings updated successfully! 🎉');
      } else {
        // Create new settings
        await createSettings({
          ...newSettingsData,
          organisation_id: targetOrgId,
        }).unwrap();
        
        message.success(`Settings created successfully! 🎉`);
      }

      // Reload settings after save to get updated data
      if (targetOrgId) {
        await refetchSettings();
      }

    } catch (error: any) {
      console.error('❌ Error saving settings:', error);
      message.error(error.message || error.data?.message || 'Failed to save settings');
    } finally {
      setLoading(false);
    }
  }, [
    isSuperAdmin, 
    isTenant, 
    selectedOrganisation, 
    userItem, 
    activeTab, 
    updateSettings,
    createSettings,
    refetchSettings,
    settingsData,
    form,
    isOrganisationUser,
    isBranchUser
  ]);

  // Handle business information save
  const handleBusinessSave = useCallback(async () => {
    try {
      // Check if organization is selected for SuperAdmin and Tenant users
      if ((isSuperAdmin || isTenant) && selectedOrganisation === 'all') {
        message.error('Please select an organisation before updating business information');
        return;
      }

      const values = await businessForm.validateFields();
      setBusinessLoading(true);

      // Determine the organisation ID to update
      let organisationId = selectedOrganisation !== 'all' ? selectedOrganisation : null;
      if (!organisationId) {
        organisationId = userItem?.organisation_id || userItem?.organisationItems?._id;
      }

      if (!organisationId) {
        message.error('Organisation ID not found. Please select an organisation.');
        return;
      }

      // Update organisation
      await updateOrganisation({
        id: organisationId,
        data: {
          org_name: values.org_name,
          business_type: values.business_type,
          email: values.email,
          phone: values.phone,
          gst_number: values.gst_number,
          pan_number: values.pan_number,
          address1: values.address1,
          city: values.city,
          state: values.state,
          pincode: values.pincode,
          currency: values.currency,
          timezone: values.timezone,
          status: values.status,
        }
      }).unwrap();

      message.success('Business information updated successfully! 🎉');

      // RTK Query will automatically update the organisations list cache

    } catch (error: any) {
      console.error('❌ Error saving business information:', error);
      message.error(error.message || error.data?.message || 'Failed to save business information');
    } finally {
      setBusinessLoading(false);
    }
  }, [
    isSuperAdmin,
    isTenant,
    selectedOrganisation,
    userItem,
    businessForm,
    updateOrganisation,
  ]);

  const handleReset = useCallback(() => {
    form.resetFields();
    message.info('Form reset to last saved values');
  }, [form]);

  const handleBusinessReset = useCallback(() => {
    businessForm.resetFields();
    message.info('Form reset to last saved values');
  }, [businessForm]);

  const testPrinter = useCallback(() => {
    message.info('Printing test page... Check your thermal printer');
    // Add actual printer test logic here
  }, []);

  // Prepare options for dropdowns
  const tenantOptions = useMemo(() => {
    return tenantsItems?.map((tenant: any) => ({
      label: tenant.organization_name || tenant.tenant_name,
      value: tenant._id,
    })) || [];
  }, [tenantsItems]);

  const organisationOptions = useMemo(() => {
    return organisationsItems?.map((org: any) => ({
      label: org.org_name || org.organization_name || org.name,
      value: org._id,
    })) || [];
  }, [organisationsItems]);


  return (
    <div className={styles.settingsContainer}>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <Title level={2} className={styles.pageTitle}>
          <SettingOutlined />
          Settings
        </Title>
      </div>

      {/* Filter Dropdowns for SuperAdmin and Tenant */}
      {(isSuperAdmin || isTenant) && (
        <Card style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            {/* Tenant Dropdown - Only for SuperAdmin */}
            {isSuperAdmin && (
              <Col xs={24} sm={12} md={8}>
                <div style={{ marginBottom: 8 }}>
                  <Text strong>Tenant</Text>
                </div>
                <Select
                  style={{ width: '100%' }}
                  placeholder="Select Tenant"
                  value={selectedTenant}
                  onChange={handleTenantChange}
                  showSearch
                  optionFilterProp="children"
                  allowClear
                >
                  <Option value="all">All Tenants</Option>
                  {tenantOptions.map((option: any) => (
                    <Option key={option.value} value={option.value}>
                      {option.label}
                    </Option>
                  ))}
                </Select>
              </Col>
            )}

            {/* Organisation Dropdown - For SuperAdmin and Tenant */}
            {(isSuperAdmin || isTenant) && (
              <Col xs={24} sm={12} md={8}>
                <div style={{ marginBottom: 8 }}>
                  <Text strong>Organisation</Text>
                </div>
                <Select
                  style={{ width: '100%' }}
                  placeholder="Select Organisation"
                  value={selectedOrganisation}
                  onChange={handleOrganisationChange}
                  showSearch
                  optionFilterProp="children"
                  allowClear
                  disabled={isSuperAdmin && (selectedTenant === 'all' || !selectedTenant)}
                >
                  <Option value="all">All Organisations</Option>
                  {organisationOptions.map((option: any) => (
                    <Option key={option.value} value={option.value}>
                      {option.label}
                    </Option>
                  ))}
                </Select>
              </Col>
            )}
          </Row>
        </Card>
      )}

      {/* Settings Tabs */}
      <Card className={styles.tabsCard}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          type="card"
          items={[
            {
              key: 'business',
              label: (
                <span>
                  <ShopOutlined /> Business Info
                </span>
              ),
              children: (
                <BusinessInfoTab
                  form={businessForm}
                  loading={businessLoading}
                  onSave={handleBusinessSave}
                  onReset={handleBusinessReset}
                />
              ),
            },
            {
              key: 'tax',
              label: (
                <span>
                  <PercentageOutlined /> Tax & GST
                </span>
              ),
              children: (
                <TaxTab
                  form={form}
                  loading={loading}
                  onSave={handleSave}
                  onReset={handleReset}
                />
              ),
            },
            {
              key: 'invoice',
              label: (
                <span>
                  <FileTextOutlined /> Invoice
                </span>
              ),
              children: (
                <InvoiceTab
                  form={form}
                  loading={loading}
                  onSave={handleSave}
                  onReset={handleReset}
                />
              ),
            },
            {
              key: 'printer',
              label: (
                <span>
                  <PrinterOutlined /> Printer
                </span>
              ),
              children: (
                <PrinterTab
                  form={form}
                  loading={loading}
                  onSave={handleSave}
                  onReset={handleReset}
                  onTestPrinter={testPrinter}
                />
              ),
            },
            {
              key: 'defaults',
              label: (
                <span>
                  <CheckCircleOutlined /> Defaults
                </span>
              ),
              children: (
                <DefaultsTab
                  form={form}
                  loading={loading}
                  onSave={handleSave}
                  onReset={handleReset}
                />
              ),
            },
            {
              key: 'notifications',
              label: (
                <span>
                  <BellOutlined /> Notifications
                </span>
              ),
              children: (
                <NotificationsTab
                  form={form}
                  loading={loading}
                  onSave={handleSave}
                  onReset={handleReset}
                />
              ),
            },
            {
              key: 'templates',
              label: (
                <span>
                  <FileTextOutlined /> Templates
                </span>
              ),
              children: (
                <TemplateSettingsTab
                  form={form}
                  loading={loading}
                  onSave={handleSave}
                  onReset={handleReset}
                />
              ),
            },
            {
              key: 'bank',
              label: (
                <span>
                  <BankOutlined /> Bank Details
                </span>
              ),
              children: (
                <BankDetailsTab
                  form={form}
                  loading={loading}
                  onSave={handleSave}
                  onReset={handleReset}
                />
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
};

export default Settings;

