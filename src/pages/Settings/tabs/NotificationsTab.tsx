import React from 'react';
import {
  Form,
  Button,
  Switch,
  InputNumber,
  Divider,
} from 'antd';
import {
  BellOutlined,
  SaveOutlined,
} from '@ant-design/icons';
import styles from '../Settings.module.css';
import { SettingsTabProps } from './types';

const NotificationsTab: React.FC<SettingsTabProps> = ({
  form,
  loading,
  onSave,
  onReset,
}) => {
  return (
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
        <Button onClick={onReset}>Reset</Button>
        <Button
          type="primary"
          icon={<SaveOutlined />}
          onClick={onSave}
          loading={loading}
        >
          Save Notification Settings
        </Button>
      </div>
    </Form>
  );
};

export default NotificationsTab;
