import React, { useMemo } from 'react';
import {
  Form,
  Input,
  Button,
  Upload,
  Select,
  Row,
  Col,
} from 'antd';
import {
  ShopOutlined,
  SaveOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import styles from '../Settings.module.css';
import { CompanyTabProps } from './types';

const { TextArea } = Input;
const { Option } = Select;

const CompanyTab: React.FC<CompanyTabProps> = ({
  form,
  loading,
  onSave,
  onReset,
  uploadedLogoUrl,
  onLogoUpload,
}) => {
  // Memoize business type options to prevent unnecessary re-renders
  const businessTypeOptions = useMemo(() => [
    'Retail Store',
    'Mobile And Laptop Store',
    'Medical / Pharmacy',
    'Grocery Store',
    'Restaurant / Cafe',
    'Electronics',
    'Clothing / Fashion',
    'Hardware Store',
    'Wholesale',
    'Other'
  ], []);

  // Memoize current logo value to prevent unnecessary form field calls
  const currentLogoValue = useMemo(() => {
    return uploadedLogoUrl || form.getFieldValue('company_logo') || '';
  }, [uploadedLogoUrl, form]);

  return (
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
              beforeUpload={onLogoUpload}
              showUploadList={false}
              accept="image/*"
            >
              <Button icon={<UploadOutlined />}>Upload Logo</Button>
            </Upload>
          </Form.Item>
          {currentLogoValue && (
            <img
              src={currentLogoValue}
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
            label="Business Type"
            name="business_type"
          >
            <Select placeholder="Select business type" showSearch>
              {businessTypeOptions.map(option => (
                <Option key={option} value={option}>{option}</Option>
              ))}
            </Select>
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
        <Button onClick={onReset}>Reset</Button>
        <Button
          type="primary"
          icon={<SaveOutlined />}
          onClick={onSave}
          loading={loading}
        >
          Save Company Settings
        </Button>
      </div>
    </Form>
  );
};

export default CompanyTab;
