import React from 'react';
import {
  Form,
  Button,
  Input,
  Select,
  Space,
  Divider,
  Switch,
  Row,
  Col,
} from 'antd';
import {
  ShopOutlined,
  SaveOutlined,
  FileProtectOutlined,
  EnvironmentOutlined,
  GlobalOutlined,
} from '@ant-design/icons';
import styles from '../Settings.module.css';
import { SettingsTabProps } from './types';

const { Option } = Select;
const { TextArea } = Input;

const businessTypes = [
  { name: "Supermarket / Grocery Store" },
  { name: "Medical / Pharmacy" },
  { name: "Hardware Store" },
  { name: "Hardware and Electronics Store" },
  { name: "Electronics Store" },
  { name: "Stationery / Book Store" },
  { name: "Clothing / Textile Store" },
  { name: "Footwear Store" },
  { name: "Bakery / Sweet Shop" },
  { name: "Fruits & Vegetables Shop" },
  { name: "Furniture Store" },
  { name: "Automobile / Spare Parts" },
  { name: "Mobile Accessories Store" },
  { name: "Cosmetics / Beauty Store" },
  { name: "Jewellery / Fancy Store" },
  { name: "Pet Store" },
  { name: "General Store" },
  { name: "Wholesale Business" },
  { name: "Computer & Laptop Store" },
  { name: "Mobile And Laptop Store" },
  { name: "Electrical Store" },
  { name: "Restaurant / Café" },
];

const BusinessInfoTab: React.FC<SettingsTabProps> = ({
  form,
  loading,
  onSave,
  onReset,
}) => {
  return (
    <Form form={form} layout="vertical" className={styles.settingsForm}>
      <div className={styles.sectionTitle}>
        <ShopOutlined />
        Business Information
      </div>

      <div className={styles.infoBox}>
        Configure your business details, GST information, and address. This information will be displayed on invoices and bills.
      </div>

      <Divider>Basic Information</Divider>

      <Row gutter={16}>
        <Col xs={24} md={12}>
          <Form.Item
            label="Organization Name"
            name="org_name"
            rules={[{ required: true, message: 'Please enter organization name!' }]}
          >
            <Input placeholder="Enter organization name" />
          </Form.Item>
        </Col>

        <Col xs={24} md={12}>
          <Form.Item
            label="Business Type"
            name="business_type"
            rules={[{ required: true, message: 'Please select business type!' }]}
          >
            <Select
              placeholder="Select business type"
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={businessTypes.map(type => ({
                value: type.name,
                label: type.name,
              }))}
            />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} md={12}>
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: 'Please enter email!' },
              { type: 'email', message: 'Please enter a valid email!' },
            ]}
          >
            <Input placeholder="Enter email" />
          </Form.Item>
        </Col>

        <Col xs={24} md={12}>
          <Form.Item
            label="Phone"
            name="phone"
            rules={[{ required: true, message: 'Please enter phone number!' }]}
          >
            <Input placeholder="Enter phone number" />
          </Form.Item>
        </Col>
      </Row>

      <Divider>
        <FileProtectOutlined /> Tax & Legal Information
      </Divider>

      <Row gutter={16}>
        <Col xs={24} md={12}>
          <Form.Item
            label="GST Number"
            name="gst_number"
            extra="15-digit GST identification number"
          >
            <Input placeholder="e.g., 27AAPFU0939F1ZV" maxLength={15} />
          </Form.Item>
        </Col>

        <Col xs={24} md={12}>
          <Form.Item
            label="PAN Number"
            name="pan_number"
            extra="10-character PAN"
          >
            <Input placeholder="e.g., AAPFU0939F" maxLength={10} style={{ textTransform: 'uppercase' }} />
          </Form.Item>
        </Col>
      </Row>

      <Divider>
        <EnvironmentOutlined /> Address Information
      </Divider>

      <Form.Item
        label="Address"
        name="address1"
      >
        <TextArea placeholder="Enter complete address" rows={3} />
      </Form.Item>

      <Row gutter={16}>
        <Col xs={24} md={8}>
          <Form.Item
            label="City"
            name="city"
          >
            <Input placeholder="Enter city" />
          </Form.Item>
        </Col>

        <Col xs={24} md={8}>
          <Form.Item
            label="State"
            name="state"
          >
            <Input placeholder="Enter state" />
          </Form.Item>
        </Col>

        <Col xs={24} md={8}>
          <Form.Item
            label="Pincode"
            name="pincode"
          >
            <Input placeholder="Enter pincode" maxLength={6} />
          </Form.Item>
        </Col>
      </Row>

      <Divider>
        <GlobalOutlined /> Additional Settings
      </Divider>

      <Row gutter={16}>
        <Col xs={24} md={12}>
          <Form.Item
            label="Currency"
            name="currency"
            extra="e.g., INR, USD, EUR"
          >
            <Input placeholder="INR" />
          </Form.Item>
        </Col>

        <Col xs={24} md={12}>
          <Form.Item
            label="Timezone"
            name="timezone"
            extra="e.g., Asia/Kolkata"
          >
            <Input placeholder="Asia/Kolkata" />
          </Form.Item>
        </Col>
      </Row>

      <Form.Item
        label="Organisation Status"
        name="status"
        valuePropName="checked"
        extra="Enable or disable this organisation"
      >
        <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
      </Form.Item>

      <div className={styles.successBox}>
        ✅ <strong>Note:</strong> This information is stored in your organisation profile and will be used across all invoices and reports.
      </div>

      <div className={styles.formActions}>
        <Button onClick={onReset}>Reset</Button>
        <Button
          type="primary"
          icon={<SaveOutlined />}
          onClick={onSave}
          loading={loading}
        >
          Save Business Information
        </Button>
      </div>
    </Form>
  );
};

export default BusinessInfoTab;

