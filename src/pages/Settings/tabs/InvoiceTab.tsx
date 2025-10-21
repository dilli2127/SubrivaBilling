import React from 'react';
import {
  Form,
  Input,
  Button,
  Switch,
  InputNumber,
  Row,
  Col,
  Space,
  Divider,
} from 'antd';
import {
  FileTextOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import styles from '../Settings.module.css';
import { SettingsTabProps } from './types';

const { TextArea } = Input;

const InvoiceTab: React.FC<SettingsTabProps> = ({
  form,
  loading,
  onSave,
  onReset,
}) => {
  return (
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
        <Button onClick={onReset}>Reset</Button>
        <Button
          type="primary"
          icon={<SaveOutlined />}
          onClick={onSave}
          loading={loading}
        >
          Save Invoice Settings
        </Button>
      </div>
    </Form>
  );
};

export default InvoiceTab;
