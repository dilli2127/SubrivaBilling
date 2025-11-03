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
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import styles from './Settings.module.css';
import { apiSlice } from '../../services/redux/api/apiSlice';
import { getCurrentUser } from '../../helpers/auth';
import SessionStorageEncryption from '../../helpers/encryption';
import {
  TaxTab,
  InvoiceTab,
  PrinterTab,
  DefaultsTab,
  NotificationsTab,
} from './tabs';

const { Title, Text } = Typography;
const { Option } = Select;

const Settings: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('tax');
  const navigate = useNavigate();
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
  
  // For SuperAdmin: Skip settings API if tenant is not selected
  // For Tenant: Skip settings API if organisation is not selected
  // For Organisation/Branch users: Never skip (they directly call settings API)
  const shouldSkipSettings = useMemo(() => {
    // If no settings ID is selected, always skip
    if (!selectedSettingsId || selectedSettingsId === 'all') {
      console.log('⏭️ Skipping settings API: No settings ID');
      return true;
    }
    
    // Organisation/Branch users: Once settings ID is set, never skip
    if (isOrganisationUser || isBranchUser) {
      console.log('✅ Not skipping: Organisation/Branch user');
      return false;
    }
    
    // SuperAdmin: Skip if tenant not selected (organisation check is handled by selectedSettingsId)
    if (isSuperAdmin) {
      const shouldSkip = !selectedTenant || selectedTenant === 'all';
      console.log('🔵 SuperAdmin skip check:', { shouldSkip, selectedTenant });
      return shouldSkip;
    }
    
    // Tenant: Once settings ID is set (which means organisation is selected), don't skip
    if (isTenant) {
      console.log('✅ Not skipping: Tenant user with settings ID');
      return false;
    }
    
    // Default: skip if no settings ID
    console.log('⏭️ Skipping settings API: Default case');
    return true;
  }, [selectedSettingsId, isSuperAdmin, isTenant, isOrganisationUser, isBranchUser, selectedTenant]);

  // Fetch settings using GetAll with organisation_id filter
  const { data: settingsData, refetch: refetchSettings, isLoading: isLoadingSettings } = apiSlice.useGetSettingsQuery(
    { organisation_id: selectedSettingsId, page: 1, limit: 1 },
    { 
      skip: shouldSkipSettings || !selectedSettingsId,
      refetchOnMountOrArgChange: true // Enable refetch when ID changes
    }
  );

  // Debug: Log when settings query state changes
  useEffect(() => {
    console.log('📊 Settings Query State:', {
      selectedSettingsId,
      shouldSkipSettings,
      isLoading: isLoadingSettings,
      hasData: !!settingsData,
      settingsData,
      userRole,
      isSuperAdmin,
      isTenant,
      selectedTenant,
      selectedOrganisation
    });
  }, [selectedSettingsId, shouldSkipSettings, isLoadingSettings, settingsData, userRole, isSuperAdmin, isTenant, selectedTenant, selectedOrganisation]);
  
  // Use RTK Query mutations
  const [updateSettings] = apiSlice.useUpdateSettingsMutation();
  const [createSettings] = apiSlice.useCreateSettingsMutation();

  const tenantsItems = (tenantsData as any)?.result || [];
  const organisationsItems = (organisationsData as any)?.result || [];

  // Load settings on mount - only for organisation/branch users (directly hit settings API)
  useEffect(() => {
    // For organisation/branch users, load settings immediately using their organisation_id
    if ((isOrganisationUser || isBranchUser) && !selectedSettingsId) {
      const organisationId = userItem?.organisation_id || userItem?.organisationItems?._id;
      if (organisationId) {
        setSelectedSettingsId(organisationId);
      }
    }
    // For tenant users, don't load settings until organisation is selected
    // For superadmin, don't load settings until tenant and organisation are selected
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle tenant selection change - fetch organisations for selected tenant
  const handleTenantChange = useCallback((tenantId: string) => {
    setSelectedTenant(tenantId || 'all');
    setSelectedOrganisation('all'); // Clear organisation selection
    setSelectedSettingsId(null); // Clear settings when tenant changes
    form.resetFields(); // Reset form when tenant changes
    
    if (tenantId && tenantId !== 'all') {
      // RTK Query will refetch with new filters when tenant changes
      // Organisations are filtered by tenant_id on backend
    }
    // If "all" or cleared, don't fetch organisations (keep dropdown disabled)
  }, [form]);

  // Handle organisation selection change - fetch settings for selected organisation
  const handleOrganisationChange = useCallback((organisationId: string) => {
    console.log('🔵 Organisation changed:', { 
      organisationId, 
      isSuperAdmin, 
      isTenant, 
      selectedTenant,
      userRole 
    });
    
    setSelectedOrganisation(organisationId || 'all');
    
    if (organisationId && organisationId !== 'all') {
      // For SuperAdmin: Only call settings API if both tenant and organisation are selected
      if (isSuperAdmin) {
        if (selectedTenant && selectedTenant !== 'all') {
          // Both tenant and organisation all selected, call settings API
          console.log('🟢 SuperAdmin: Setting selectedSettingsId to:', organisationId);
          setSelectedSettingsId(organisationId);
        } else {
          // Tenant not selected yet, don't call settings API
          console.log('🔴 SuperAdmin: Tenant not selected, clearing settings');
          setSelectedSettingsId(null);
          form.resetFields();
        }
      } else {
        // For Tenant users: Call settings API immediately when organisation is selected
        console.log('🟢 Tenant/Other: Setting selectedSettingsId to:', organisationId);
        setSelectedSettingsId(organisationId);
      }
    } else {
      // Clear settings when "all" is selected
      console.log('🔴 Clearing settings (all selected)');
      setSelectedSettingsId(null);
      form.resetFields();
    }
  }, [form, isSuperAdmin, isTenant, selectedTenant, userRole]);



  // Populate form when settings data loads or when organisation changes
  useEffect(() => {
    const settingsResult = (settingsData as any)?.result || settingsData || {};
    
    // Extract first item if it's an array
    const settings = Array.isArray(settingsResult) 
      ? settingsResult[0] 
      : settingsResult;
    
    // Check if we have actual settings data with ID
    const hasSettingsData = settings && 
      typeof settings === 'object' && 
      (settings._id || settings.id);
    
    if (selectedSettingsId) {
      if (hasSettingsData) {
        // Settings exist - use actual values from database
        console.log('📝 Populating form with existing settings:', settings);
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

          // Notification Settings
          email_notifications: settings.email_notifications ?? null,
          sms_notifications: settings.sms_notifications ?? null,
          low_stock_alert: settings.low_stock_alert ?? null,
          low_stock_threshold: settings.low_stock_threshold ?? null,
          payment_reminder: settings.payment_reminder ?? null,
          daily_report_email: settings.daily_report_email ?? null,
        });
      } else {
        // No settings found - initialize all fields as null so user can choose
        console.log('📝 No settings found, initializing form with null values');
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

          // Notification Settings
          email_notifications: null,
          sms_notifications: null,
          low_stock_alert: null,
          low_stock_threshold: null,
          payment_reminder: null,
          daily_report_email: null,
        });
      }
    } else if (selectedOrganisation === 'all' && (isSuperAdmin || isTenant)) {
      // Reset form when no organisation is selected (only for superadmin/tenant users)
      console.log('🔄 Resetting form - no organisation selected');
      form.resetFields();
    }
  }, [settingsData, selectedSettingsId, selectedOrganisation, isSuperAdmin, isTenant, form]);

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

      // Check if settings exist, if not create new settings
      const settingsResult = (settingsData as any)?.result || settingsData || [];
      
      // Extract first item from array if it's an array response
      const existingSettings = Array.isArray(settingsResult) 
        ? settingsResult[0] 
        : settingsResult;
      
      // Check if we have valid existing settings with an ID
      const hasExistingSettings = existingSettings && 
        (existingSettings._id || existingSettings.id);
      
      const targetOrgId = organisationId || userItem?._id;
      
      console.log('💾 Save Settings:', {
        hasExistingSettings,
        existingSettings,
        targetOrgId,
        newSettingsData
      });
      
      if (hasExistingSettings) {
        // Update existing settings
        const settingsId = existingSettings._id || existingSettings.id;
        console.log('🔄 Updating existing settings with ID:', settingsId);
        
        await updateSettings({
          id: settingsId,
          data: {
            ...newSettingsData,
            organisation_id: targetOrgId,
          }
        }).unwrap();
        
        message.success(`Settings updated successfully! 🎉`);
      } else {
        // Create new settings
        console.log('➕ Creating new settings for organisation:', targetOrgId);
        
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

  const handleReset = useCallback(() => {
    form.resetFields();
    message.info('Form reset to last saved values');
  }, [form]);

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
          ]}
        />
      </Card>
    </div>
  );
};

export default Settings;

