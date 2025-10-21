import React from 'react';
import {
  Form,
  Button,
  Switch,
  Select,
  Space,
  Divider,
} from 'antd';
import {
  PercentageOutlined,
  SaveOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import styles from '../Settings.module.css';
import { SettingsTabProps } from './types';

const { Option } = Select;

const TaxTab: React.FC<SettingsTabProps> = ({
  form,
  loading,
  onSave,
  onReset,
}) => {
  const navigate = useNavigate();

  return (
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
        <Button onClick={onReset}>Reset</Button>
        <Button
          type="primary"
          icon={<SaveOutlined />}
          onClick={onSave}
          loading={loading}
        >
          Save Tax Settings
        </Button>
      </div>
    </Form>
  );
};

export default TaxTab;
