import React from 'react';
import {
  Form,
  Button,
  Select,
} from 'antd';
import {
  CheckCircleOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import styles from '../Settings.module.css';
import { DefaultsTabProps } from './types';

const { Option } = Select;

const DefaultsTab: React.FC<DefaultsTabProps> = ({
  form,
  loading,
  onSave,
  onReset,
}) => {
  return (
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
      </div>

      <div className={styles.formActions}>
        <Button onClick={onReset}>Reset</Button>
        <Button
          type="primary"
          icon={<SaveOutlined />}
          onClick={onSave}
          loading={loading}
        >
          Save Default Values
        </Button>
      </div>
    </Form>
  );
};

export default DefaultsTab;
