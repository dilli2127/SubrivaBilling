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
  ShopOutlined,
  PercentageOutlined,
  FileTextOutlined,
  PrinterOutlined,
  CheckCircleOutlined,
  BellOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import styles from './Settings.module.css';
import { useApiActions } from '../../services/api/useApiActions';
import { useDynamicSelector } from '../../services/redux';
import { getCurrentUser } from '../../helpers/auth';
import { useFileUpload } from '../../helpers/useFileUpload';
import SessionStorageEncryption from '../../helpers/encryption';
import {
  CompanyTab,
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
  const [activeTab, setActiveTab] = useState('company');
  const { handleFileUpload, url: uploadedLogoUrl } = useFileUpload();
  const navigate = useNavigate();
  const [selectedTenant, setSelectedTenant] = useState<string>('all');
  const [selectedOrganisation, setSelectedOrganisation] = useState<string>('all');

  // Get user info with memoization
  const userItem = useMemo(() => getCurrentUser(), []);
  
  // Get user role with memoization to prevent unnecessary recalculations
  const { userRole, isSuperAdmin, isTenant } = useMemo(() => {
    const scopeData = SessionStorageEncryption.getItem('scope');
    const role = scopeData?.userType || userItem?.user_type || userItem?.usertype || userItem?.user_role || '';
    return {
      userRole: role,
      isSuperAdmin: role.toLowerCase() === 'superadmin',
      isTenant: role.toLowerCase() === 'tenant'
    };
  }, [userItem]);

  // API hooks
  const { getEntityApi } = useApiActions();
  const SettingsApi = getEntityApi('Settings');
  const OrganisationsApi = getEntityApi('Organisations');
  const TenantsApi = getEntityApi('Tenant');

  // Selectors
  const { items: settingsData } = useDynamicSelector(
    SettingsApi.getIdentifier('Get')
  );
  const { items: organisationData } = useDynamicSelector(
    OrganisationsApi.getIdentifier('Get')
  );
  const { items: tenantsItems } = useDynamicSelector(
    TenantsApi.getIdentifier('GetAll')
  );
  const { items: organisationsItems } = useDynamicSelector(
    OrganisationsApi.getIdentifier('GetAll')
  );

  // Load settings on mount
  useEffect(() => {
    loadSettings();
    
    // Fetch data based on user role
    if (isSuperAdmin) {
      TenantsApi('GetAll');
      // Don't fetch all organisations initially for superadmin
    } else if (isTenant) {
      // Fetch organisations for logged-in tenant
      // Backend will automatically filter based on tenant authentication
      OrganisationsApi('GetAll');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle tenant selection change - fetch organisations for selected tenant
  const handleTenantChange = useCallback((tenantId: string) => {
    setSelectedTenant(tenantId || 'all');
    setSelectedOrganisation('all'); // Clear organisation selection
    
    if (tenantId && tenantId !== 'all') {
      // Fetch organisations for the selected tenant
      OrganisationsApi('GetAll', { tenant_id: tenantId });
    }
    // If "all" or cleared, don't fetch organisations (keep dropdown disabled)
  }, [OrganisationsApi]);

  const loadSettings = useCallback(async () => {
    try {
      // Determine which organisation to load
      let organisationId = selectedOrganisation !== 'all' ? selectedOrganisation : null;
      if (!organisationId) {
        organisationId = userItem?.organisation_id || userItem?.organisationItems?._id;
      }
      
      // Load organization data
      if (organisationId) {
        await OrganisationsApi('Get', {}, organisationId);
      }
      
      // Load settings (assuming your backend has a settings endpoint)
      await SettingsApi('Get', {}, organisationId || userItem?._id);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  }, [selectedOrganisation, userItem, OrganisationsApi, SettingsApi]);

  // Reload settings when selected organisation changes
  useEffect(() => {
    if (selectedOrganisation && selectedOrganisation !== 'all') {
      loadSettings();
    }
  }, [selectedOrganisation, loadSettings]);

  // Populate form when data loads
  useEffect(() => {
    if (settingsData?.result || organisationData?.result) {
      const settings = settingsData?.result || {};
      const org = organisationData?.result || {};
      
      form.setFieldsValue({
        // Company Settings - Map API fields to form fields
        company_name: org.org_name || '',
        company_address: org.address || '',
        company_city: org.city || '',
        company_state: org.state || '',
        company_pincode: org.pincode || '',
        company_gstin: org.gst_number || '',
        company_phone: org.phone || '',
        company_email: org.email || '',
        company_website: org.website || '',
        company_logo: org.logo_url || '',
        business_type: org.business_type || '',
        
        // Tax Settings
        tax_enabled: settings.tax_enabled !== false,
        tax_type: settings.tax_type || 'GST',

        // Invoice Settings
        invoice_prefix: settings.invoice_prefix || 'INV',
        invoice_starting_number: settings.invoice_starting_number || 1,
        invoice_footer: settings.invoice_footer || '',
        show_logo_on_invoice: settings.show_logo_on_invoice !== false,
        show_terms_on_invoice: settings.show_terms_on_invoice !== false,
        invoice_terms: settings.invoice_terms || '',

        // Printer Settings
        thermal_printer_enabled: settings.thermal_printer_enabled || false,
        printer_port: settings.printer_port || 'COM1',
        printer_baud_rate: settings.printer_baud_rate || 9600,
        paper_width: settings.paper_width || 80,
        auto_print: settings.auto_print || false,

        // Default Values
        default_payment_mode: settings.default_payment_mode || 'cash',

        // Notification Settings
        email_notifications: settings.email_notifications !== false,
        sms_notifications: settings.sms_notifications || false,
        low_stock_alert: settings.low_stock_alert !== false,
        low_stock_threshold: settings.low_stock_threshold || 10,
        payment_reminder: settings.payment_reminder || false,
        daily_report_email: settings.daily_report_email || false,
      });
    }
  }, [settingsData, organisationData, form]);

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

      // Only update organization data if we're on the company tab
      if (activeTab === 'company' && organisationId) {
        await OrganisationsApi('Update', {
          org_name: values.company_name,
          address: values.company_address,
          city: values.company_city,
          state: values.company_state,
          pincode: values.company_pincode,
          gst_number: values.company_gstin,
          phone: values.company_phone,
          email: values.company_email,
          website: values.company_website,
          logo_url: uploadedLogoUrl || values.company_logo,
          business_type: values.business_type,
        }, organisationId);
      }

      // Save settings - Send only relevant data based on active tab
      if (activeTab !== 'company') {
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
        const existingSettings = settingsData?.result;
        const hasExistingSettings = existingSettings && (
          existingSettings._id || 
          existingSettings.id || 
          (typeof existingSettings === 'object' && Object.keys(existingSettings).some(key => 
            key !== '_id' && key !== 'id' && existingSettings[key] !== null && existingSettings[key] !== undefined
          ))
        );
        const targetId = organisationId || userItem?._id;
        
        if (hasExistingSettings) {
          // Update existing settings - use the settings ID or target ID
          const settingsId = existingSettings._id || existingSettings.id || targetId;
          await SettingsApi('Update', {
            ...newSettingsData,
            organisation_id: targetId, // Include organisation_id for updates too
          }, settingsId);
        } else {
          // Create new settings for the first time
          await SettingsApi('Create', {
            ...newSettingsData,
            organisation_id: targetId, // Include organisation_id for new settings
          }, targetId);
        }

        // Reload settings after save to get updated data
        await SettingsApi('Get', {}, targetId);
      }

      const tabLabels = {
        company: 'Company Settings',
        tax: 'Tax & GST Settings',
        invoice: 'Invoice Settings',
        printer: 'Printer Settings',
        defaults: 'Default Values',
        notifications: 'Notification Settings'
      };

      message.success(`${tabLabels[activeTab as keyof typeof tabLabels] || 'Settings'} saved successfully! 🎉`);
    } catch (error: any) {
      message.error(error.message || 'Failed to save settings');
    } finally {
      setLoading(false);
    }
  }, [
    isSuperAdmin, 
    isTenant, 
    selectedOrganisation, 
    userItem, 
    activeTab, 
    OrganisationsApi, 
    SettingsApi,
    uploadedLogoUrl,
    settingsData
  ]);

  const handleReset = useCallback(() => {
    form.resetFields();
    message.info('Form reset to last saved values');
  }, [form]);

  const handleLogoUpload = useCallback(async (file: any) => {
    try {
      const url = await handleFileUpload(file);
      form.setFieldValue('company_logo', url);
      message.success('Logo uploaded successfully!');
    } catch (error) {
      message.error('Failed to upload logo');
    }
    return false; // Prevent default upload
  }, [handleFileUpload, form]);

  const testPrinter = useCallback(() => {
    message.info('Printing test page... Check your thermal printer');
    // Add actual printer test logic here
  }, []);

  // Prepare options for dropdowns
  const tenantOptions = useMemo(() => {
    return tenantsItems?.result?.map((tenant: any) => ({
      label: tenant.organization_name || tenant.tenant_name,
      value: tenant._id,
    })) || [];
  }, [tenantsItems]);

  const organisationOptions = useMemo(() => {
    return organisationsItems?.result?.map((org: any) => ({
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
                  onChange={setSelectedOrganisation}
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
              key: 'company',
              label: (
                <span>
                  <ShopOutlined /> Company
                </span>
              ),
              children: (
                <CompanyTab
                  form={form}
                  loading={loading}
                  onSave={handleSave}
                  onReset={handleReset}
                  uploadedLogoUrl={uploadedLogoUrl}
                  onLogoUpload={handleLogoUpload}
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
          ]}
        />
      </Card>
    </div>
  );
};

export default Settings;

