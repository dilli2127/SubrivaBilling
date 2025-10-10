import React, { useState, useEffect, useMemo } from 'react';
import {
  Card,
  Tabs,
  Form,
  Input,
  Button,
  Upload,
  Switch,
  Select,
  InputNumber,
  message,
  Space,
  Divider,
  Row,
  Col,
  Typography,
} from 'antd';
import {
  SettingOutlined,
  SaveOutlined,
  ShopOutlined,
  PercentageOutlined,
  FileTextOutlined,
  PrinterOutlined,
  CheckCircleOutlined,
  BellOutlined,
  UploadOutlined,
  CameraOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import styles from './Settings.module.css';
import { useApiActions } from '../../services/api/useApiActions';
import { useDynamicSelector } from '../../services/redux';
import { useFileUpload } from '../../helpers/useFileUpload';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const Settings: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('company');
  const { handleFileUpload, url: uploadedLogoUrl } = useFileUpload();
  const navigate = useNavigate();

  // Get user info
  const userItem = useMemo(() => {
    const data = sessionStorage.getItem('user');
    return data ? JSON.parse(data) : null;
  }, []);

  // API hooks
  const { getEntityApi } = useApiActions();
  const SettingsApi = getEntityApi('Settings');
  const OrganisationsApi = getEntityApi('Organisations');
  const CustomersApi = getEntityApi('Customer');
  const WarehouseApi = getEntityApi('Warehouse');

  // Selectors
  const { items: settingsData } = useDynamicSelector(
    SettingsApi.getIdentifier('Get')
  );
  const { items: organisationData } = useDynamicSelector(
    OrganisationsApi.getIdentifier('Get')
  );
  const { items: customersList } = useDynamicSelector(
    CustomersApi.getIdentifier('GetAll')
  );
  const { items: warehousesList } = useDynamicSelector(
    WarehouseApi.getIdentifier('GetAll')
  );

  // Load settings on mount
  useEffect(() => {
    loadSettings();
    CustomersApi('GetAll');
    WarehouseApi('GetAll');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadSettings = async () => {
    try {
      // Load organization data
      if (userItem?.organisation_id) {
        await OrganisationsApi('Get', {}, userItem.organisation_id);
      }
      
      // Load settings (assuming your backend has a settings endpoint)
      await SettingsApi('Get', {}, userItem?.organisation_id || userItem?._id);
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  // Populate form when data loads
  useEffect(() => {
    if (settingsData?.result || organisationData?.result) {
      const settings = settingsData?.result || {};
      const org = organisationData?.result || {};
      
      form.setFieldsValue({
        // Company Settings
        company_name: org.org_name || org.organization_name || '',
        company_address: org.address || '',
        company_city: org.city || '',
        company_state: org.state || '',
        company_pincode: org.pincode || '',
        company_gstin: org.gstin || org.gst_number || '',
        company_phone: org.phone || org.contact_phone || '',
        company_email: org.email || org.contact_email || '',
        company_website: org.website || '',
        company_logo: org.logo || '',

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
        default_customer_id: settings.default_customer_id || '',
        default_warehouse_id: settings.default_warehouse_id || '',

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

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      // Save organization data
      if (userItem?.organisation_id) {
        await OrganisationsApi('Update', {
          org_name: values.company_name,
          address: values.company_address,
          city: values.company_city,
          state: values.company_state,
          pincode: values.company_pincode,
          gstin: values.company_gstin,
          phone: values.company_phone,
          email: values.company_email,
          website: values.company_website,
          logo: uploadedLogoUrl || values.company_logo,
        }, userItem.organisation_id);
      }

      // Save settings
      await SettingsApi('Update', {
        ...values,
        company_logo: uploadedLogoUrl || values.company_logo,
      }, userItem?.organisation_id || userItem?._id);

      message.success('Settings saved successfully! 🎉');
    } catch (error: any) {
      message.error(error.message || 'Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    form.resetFields();
    message.info('Form reset to last saved values');
  };

  const handleLogoUpload = async (file: any) => {
    try {
      const url = await handleFileUpload(file);
      form.setFieldValue('company_logo', url);
      message.success('Logo uploaded successfully!');
    } catch (error) {
      message.error('Failed to upload logo');
    }
    return false; // Prevent default upload
  };

  const testPrinter = () => {
    message.info('Printing test page... Check your thermal printer');
    // Add actual printer test logic here
  };

  // Prepare options
  const customerOptions = useMemo(() => {
    return customersList?.result?.map((customer: any) => ({
      label: customer.customer_name || customer.name,
      value: customer._id,
    })) || [];
  }, [customersList]);

  const warehouseOptions = useMemo(() => {
    return warehousesList?.result?.map((warehouse: any) => ({
      label: warehouse.warehouse_name || warehouse.name,
      value: warehouse._id,
    })) || [];
  }, [warehousesList]);

  return (
    <div className={styles.settingsContainer}>
      {/* Page Header */}
      <div className={styles.pageHeader}>
        <Title level={2} className={styles.pageTitle}>
          <SettingOutlined />
          Settings
        </Title>
      </div>

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
                <Form form={form} layout="vertical" className={styles.settingsForm}>
                  <div className={styles.sectionTitle}>
                    <ShopOutlined />
                    Company Information
                  </div>

                  <div className={styles.infoBox}>
                    This information will appear on your invoices and reports
                  </div>

                  <Row gutter={16}>
                    <Col span={24}>
                      <Form.Item
                        label="Company Logo"
                        name="company_logo"
                        extra="Upload your company logo (PNG, JPG - Max 2MB)"
                      >
                        <Upload
                          beforeUpload={handleLogoUpload}
                          showUploadList={false}
                          accept="image/*"
                        >
                          <Button icon={<UploadOutlined />}>Upload Logo</Button>
                        </Upload>
                      </Form.Item>
                      {(uploadedLogoUrl || form.getFieldValue('company_logo')) && (
                        <img
                          src={uploadedLogoUrl || form.getFieldValue('company_logo')}
                          alt="Company Logo"
                          className={styles.logoPreview}
                        />
                      )}
                    </Col>

                    <Col span={12}>
                      <Form.Item
                        label="Company Name"
                        name="company_name"
                        rules={[{ required: true, message: 'Please enter company name' }]}
                      >
                        <Input placeholder="Enter company name" />
                      </Form.Item>
                    </Col>

                    <Col span={12}>
                      <Form.Item
                        label="GSTIN / Tax ID"
                        name="company_gstin"
                      >
                        <Input placeholder="e.g., 29AABCU9603R1ZX" />
                      </Form.Item>
                    </Col>

                    <Col span={24}>
                      <Form.Item
                        label="Address"
                        name="company_address"
                        rules={[{ required: true, message: 'Please enter address' }]}
                      >
                        <TextArea rows={2} placeholder="Enter complete address" />
                      </Form.Item>
                    </Col>

                    <Col span={8}>
                      <Form.Item
                        label="City"
                        name="company_city"
                        rules={[{ required: true }]}
                      >
                        <Input placeholder="City" />
                      </Form.Item>
                    </Col>

                    <Col span={8}>
                      <Form.Item
                        label="State"
                        name="company_state"
                        rules={[{ required: true }]}
                      >
                        <Input placeholder="State" />
                      </Form.Item>
                    </Col>

                    <Col span={8}>
                      <Form.Item
                        label="Pincode"
                        name="company_pincode"
                        rules={[{ required: true }]}
                      >
                        <Input placeholder="Pincode" />
                      </Form.Item>
                    </Col>

                    <Col span={12}>
                      <Form.Item
                        label="Phone Number"
                        name="company_phone"
                        rules={[{ required: true }]}
                      >
                        <Input placeholder="+91 XXXXX XXXXX" />
                      </Form.Item>
                    </Col>

                    <Col span={12}>
                      <Form.Item
                        label="Email Address"
                        name="company_email"
                        rules={[{ type: 'email' }]}
                      >
                        <Input placeholder="company@example.com" />
                      </Form.Item>
                    </Col>

                    <Col span={12}>
                      <Form.Item
                        label="Website"
                        name="company_website"
                      >
                        <Input placeholder="https://www.example.com" />
                      </Form.Item>
                    </Col>
                  </Row>

                  <div className={styles.formActions}>
                    <Button onClick={handleReset}>Reset</Button>
                    <Button
                      type="primary"
                      icon={<SaveOutlined />}
                      onClick={handleSave}
                      loading={loading}
                    >
                      Save Company Settings
                    </Button>
                  </div>
                </Form>
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
                <Form form={form} layout="vertical" className={styles.settingsForm}>
                  <div className={styles.sectionTitle}>
                    <PercentageOutlined />
                    Tax Configuration
                  </div>

                  <div className={styles.infoBox}>
                    Global tax settings. Tax rates are configured per category, and tax inclusion is handled at billing level.
                  </div>

                  <Form.Item
                    label="Enable Tax/GST"
                    name="tax_enabled"
                    valuePropName="checked"
                    extra="Enable or disable tax calculation across the entire application"
                  >
                    <Switch checkedChildren="Enabled" unCheckedChildren="Disabled" />
                  </Form.Item>

                  <Form.Item
                    label="Tax Type"
                    name="tax_type"
                    extra="Select the type of tax applicable to your business"
                  >
                    <Select>
                      <Option value="GST">GST (India)</Option>
                      <Option value="VAT">VAT</Option>
                      <Option value="Sales Tax">Sales Tax</Option>
                    </Select>
                  </Form.Item>

                  <Divider>Tax Rate Configuration</Divider>

                  <div className={styles.warningBox}>
                    ⚠️ <strong>Tax Rates:</strong> Configured individually for each product category.<br />
                    Go to <strong>Products → Category</strong> to set specific tax rates (e.g., Food: 5%, Electronics: 18%).
                  </div>

                  <Space direction="vertical" size="middle" style={{ width: '100%', marginTop: 16 }}>
                    <Button
                      type="dashed"
                      icon={<PercentageOutlined />}
                      onClick={() => navigate('/category_crud')}
                      block
                    >
                      Go to Category Management
                    </Button>
                  </Space>

                  <Divider>Tax Inclusion</Divider>

                  <div className={styles.warningBox}>
                    ⚠️ <strong>Tax Inclusive/Exclusive:</strong> Handled at the billing level.<br />
                    You can choose tax inclusion per bill in the <strong>Billing Page</strong>.
                  </div>

                  <Space direction="vertical" size="middle" style={{ width: '100%', marginTop: 16 }}>
                    <Button
                      type="dashed"
                      icon={<FileTextOutlined />}
                      onClick={() => navigate('/retaill_billing')}
                      block
                    >
                      Go to Billing Page
                    </Button>
                  </Space>

                  <Divider />

                  <div className={styles.successBox}>
                    ✅ <strong>Your Tax System Architecture:</strong><br />
                    • <strong>Global (Here):</strong> Enable/Disable tax & Tax type (GST/VAT)<br />
                    • <strong>Category Level:</strong> Tax rates per product category<br />
                    • <strong>Billing Level:</strong> Tax inclusive/exclusive per bill
                  </div>

                  <div className={styles.formActions}>
                    <Button onClick={handleReset}>Reset</Button>
                    <Button
                      type="primary"
                      icon={<SaveOutlined />}
                      onClick={handleSave}
                      loading={loading}
                    >
                      Save Tax Settings
                    </Button>
                  </div>
                </Form>
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
                <Form form={form} layout="vertical" className={styles.settingsForm}>
                  <div className={styles.sectionTitle}>
                    <FileTextOutlined />
                    Invoice Settings
                  </div>

                  <div className={styles.infoBox}>
                    Customize how your invoices are generated and displayed
                  </div>

                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        label="Invoice Prefix"
                        name="invoice_prefix"
                        rules={[{ required: true }]}
                        extra="e.g., INV, BILL, REC"
                      >
                        <Input placeholder="INV" />
                      </Form.Item>
                    </Col>

                    <Col span={12}>
                      <Form.Item
                        label="Starting Invoice Number"
                        name="invoice_starting_number"
                        rules={[{ required: true }]}
                      >
                        <InputNumber min={1} style={{ width: '100%' }} />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item
                    label="Invoice Footer Text"
                    name="invoice_footer"
                    extra="This text will appear at the bottom of invoices"
                  >
                    <TextArea
                      rows={3}
                      placeholder="Thank you for your business!"
                    />
                  </Form.Item>

                  <Form.Item
                    label="Terms & Conditions"
                    name="invoice_terms"
                  >
                    <TextArea
                      rows={4}
                      placeholder="Enter terms and conditions..."
                    />
                  </Form.Item>

                  <Divider>Display Options</Divider>

                  <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    <Form.Item
                      label="Show Logo on Invoice"
                      name="show_logo_on_invoice"
                      valuePropName="checked"
                    >
                      <Switch />
                    </Form.Item>

                    <Form.Item
                      label="Show Terms & Conditions on Invoice"
                      name="show_terms_on_invoice"
                      valuePropName="checked"
                    >
                      <Switch />
                    </Form.Item>
                  </Space>

                  <div className={styles.formActions}>
                    <Button onClick={handleReset}>Reset</Button>
                    <Button
                      type="primary"
                      icon={<SaveOutlined />}
                      onClick={handleSave}
                      loading={loading}
                    >
                      Save Invoice Settings
                    </Button>
                  </div>
                </Form>
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
                <Form form={form} layout="vertical" className={styles.settingsForm}>
                  <div className={styles.sectionTitle}>
                    <PrinterOutlined />
                    Thermal Printer Configuration
                  </div>

                  <div className={styles.warningBox}>
                    ⚠️ Make sure your thermal printer is connected before testing
                  </div>

                  <Form.Item
                    label="Enable Thermal Printer"
                    name="thermal_printer_enabled"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>

                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        label="Printer Port"
                        name="printer_port"
                      >
                        <Select>
                          <Option value="COM1">COM1</Option>
                          <Option value="COM2">COM2</Option>
                          <Option value="COM3">COM3</Option>
                          <Option value="USB">USB</Option>
                          <Option value="Bluetooth">Bluetooth</Option>
                        </Select>
                      </Form.Item>
                    </Col>

                    <Col span={12}>
                      <Form.Item
                        label="Baud Rate"
                        name="printer_baud_rate"
                      >
                        <Select>
                          <Option value={9600}>9600</Option>
                          <Option value={19200}>19200</Option>
                          <Option value={38400}>38400</Option>
                          <Option value={115200}>115200</Option>
                        </Select>
                      </Form.Item>
                    </Col>

                    <Col span={12}>
                      <Form.Item
                        label="Paper Width (mm)"
                        name="paper_width"
                      >
                        <Select>
                          <Option value={58}>58mm (2 inch)</Option>
                          <Option value={80}>80mm (3 inch)</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item
                    label="Auto Print After Bill"
                    name="auto_print"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>

                  <Button
                    type="dashed"
                    icon={<PrinterOutlined />}
                    onClick={testPrinter}
                    className={styles.printerTestButton}
                  >
                    Test Printer
                  </Button>

                  <div className={styles.formActions}>
                    <Button onClick={handleReset}>Reset</Button>
                    <Button
                      type="primary"
                      icon={<SaveOutlined />}
                      onClick={handleSave}
                      loading={loading}
                    >
                      Save Printer Settings
                    </Button>
                  </div>
                </Form>
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
                <Form form={form} layout="vertical" className={styles.settingsForm}>
                  <div className={styles.sectionTitle}>
                    <CheckCircleOutlined />
                    Default Values
                  </div>

                  <div className={styles.infoBox}>
                    These values will be pre-selected when creating new records
                  </div>

                  <div className={styles.defaultsGrid}>
                    <Form.Item
                      label="Default Payment Mode"
                      name="default_payment_mode"
                    >
                      <Select>
                        <Option value="cash">💵 Cash</Option>
                        <Option value="upi">📱 UPI</Option>
                        <Option value="card">💳 Card</Option>
                        <Option value="credit">📝 Credit</Option>
                      </Select>
                    </Form.Item>

                    <Form.Item
                      label="Default Customer"
                      name="default_customer_id"
                    >
                      <Select
                        showSearch
                        placeholder="Select default customer"
                        optionFilterProp="children"
                        allowClear
                      >
                        {customerOptions.map((option: any) => (
                          <Option key={option.value} value={option.value}>
                            {option.label}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>

                    <Form.Item
                      label="Default Warehouse"
                      name="default_warehouse_id"
                    >
                      <Select
                        showSearch
                        placeholder="Select default warehouse"
                        optionFilterProp="children"
                        allowClear
                      >
                        {warehouseOptions.map((option: any) => (
                          <Option key={option.value} value={option.value}>
                            {option.label}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </div>

                  <div className={styles.formActions}>
                    <Button onClick={handleReset}>Reset</Button>
                    <Button
                      type="primary"
                      icon={<SaveOutlined />}
                      onClick={handleSave}
                      loading={loading}
                    >
                      Save Default Values
                    </Button>
                  </div>
                </Form>
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
                <Form form={form} layout="vertical" className={styles.settingsForm}>
                  <div className={styles.sectionTitle}>
                    <BellOutlined />
                    Notification Preferences
                  </div>

                  <div className={styles.infoBox}>
                    Control how and when you receive notifications
                  </div>

                  <div className={styles.notificationItem}>
                    <div className={styles.notificationLabel}>
                      <div className={styles.notificationTitle}>Email Notifications</div>
                      <div className={styles.notificationDesc}>
                        Receive notifications via email
                      </div>
                    </div>
                    <Form.Item name="email_notifications" valuePropName="checked" noStyle>
                      <Switch />
                    </Form.Item>
                  </div>

                  <div className={styles.notificationItem}>
                    <div className={styles.notificationLabel}>
                      <div className={styles.notificationTitle}>SMS Notifications</div>
                      <div className={styles.notificationDesc}>
                        Receive notifications via SMS
                      </div>
                    </div>
                    <Form.Item name="sms_notifications" valuePropName="checked" noStyle>
                      <Switch />
                    </Form.Item>
                  </div>

                  <Divider />

                  <div className={styles.notificationItem}>
                    <div className={styles.notificationLabel}>
                      <div className={styles.notificationTitle}>Low Stock Alerts</div>
                      <div className={styles.notificationDesc}>
                        Get notified when product stock is low
                      </div>
                    </div>
                    <Form.Item name="low_stock_alert" valuePropName="checked" noStyle>
                      <Switch />
                    </Form.Item>
                  </div>

                  <Form.Item
                    label="Low Stock Threshold"
                    name="low_stock_threshold"
                    extra="Notify when stock goes below this quantity"
                  >
                    <InputNumber min={0} style={{ width: 200 }} />
                  </Form.Item>

                  <Divider />

                  <div className={styles.notificationItem}>
                    <div className={styles.notificationLabel}>
                      <div className={styles.notificationTitle}>Payment Reminders</div>
                      <div className={styles.notificationDesc}>
                        Send reminders for pending payments
                      </div>
                    </div>
                    <Form.Item name="payment_reminder" valuePropName="checked" noStyle>
                      <Switch />
                    </Form.Item>
                  </div>

                  <div className={styles.notificationItem}>
                    <div className={styles.notificationLabel}>
                      <div className={styles.notificationTitle}>Daily Report Email</div>
                      <div className={styles.notificationDesc}>
                        Receive daily sales report via email
                      </div>
                    </div>
                    <Form.Item name="daily_report_email" valuePropName="checked" noStyle>
                      <Switch />
                    </Form.Item>
                  </div>

                  <div className={styles.formActions}>
                    <Button onClick={handleReset}>Reset</Button>
                    <Button
                      type="primary"
                      icon={<SaveOutlined />}
                      onClick={handleSave}
                      loading={loading}
                    >
                      Save Notification Settings
                    </Button>
                  </div>
                </Form>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
};

export default Settings;

