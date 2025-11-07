import React from 'react';
import {
  Form,
  Input,
  Button,
  Select,
  Row,
  Col,
  Divider,
} from 'antd';
import {
  BankOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import styles from '../Settings.module.css';
import { SettingsTabProps } from './types';

const { Option } = Select;

const BankDetailsTab: React.FC<SettingsTabProps> = ({
  form,
  loading,
  onSave,
  onReset,
}) => {
  return (
    <Form form={form} layout="vertical" className={styles.settingsForm}>
      <div className={styles.sectionTitle}>
        <BankOutlined />
        Bank Account Details
      </div>

      <div className={styles.infoBox}>
        Add your bank account details to display on invoices and bills
      </div>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Bank Name"
            name="bank_name"
            extra="e.g., State Bank of India, HDFC Bank"
          >
            <Input placeholder="Enter bank name" />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            label="Account Holder Name"
            name="account_holder_name"
            extra="Name as per bank records"
          >
            <Input placeholder="Enter account holder name" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="Account Number"
            name="account_number"
          >
            <Input placeholder="Enter account number" />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            label="Account Type"
            name="account_type"
          >
            <Select placeholder="Select account type">
              <Option value="savings">Savings Account</Option>
              <Option value="current">Current Account</Option>
              <Option value="overdraft">Overdraft Account</Option>
            </Select>
          </Form.Item>
        </Col>
      </Row>

      <Divider>Bank Branch Information</Divider>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="IFSC Code"
            name="ifsc_code"
            extra="11-digit code for bank branch"
          >
            <Input 
              placeholder="e.g., SBIN0001234" 
              maxLength={11}
              style={{ textTransform: 'uppercase' }}
            />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            label="Branch Name"
            name="branch_name"
          >
            <Input placeholder="Enter branch name" />
          </Form.Item>
        </Col>
      </Row>

      <Divider>Digital Payment Details</Divider>

      <Row gutter={16}>
        <Col span={12}>
          <Form.Item
            label="UPI ID"
            name="upi_id"
            extra="For digital payments (e.g., yourname@upi)"
          >
            <Input placeholder="Enter UPI ID" />
          </Form.Item>
        </Col>

        <Col span={12}>
          <Form.Item
            label="SWIFT Code"
            name="swift_code"
            extra="For international transactions (optional)"
          >
            <Input 
              placeholder="e.g., SBININBB123"
              maxLength={11}
              style={{ textTransform: 'uppercase' }}
            />
          </Form.Item>
        </Col>
      </Row>

      <div className={styles.warningBox}>
        💡 <strong>Note:</strong> Bank details will be displayed on printed invoices and bills. Ensure all information is accurate.
      </div>

      <div className={styles.formActions}>
        <Button onClick={onReset}>Reset</Button>
        <Button
          type="primary"
          icon={<SaveOutlined />}
          onClick={onSave}
          loading={loading}
        >
          Save Bank Details
        </Button>
      </div>
    </Form>
  );
};

export default BankDetailsTab;

