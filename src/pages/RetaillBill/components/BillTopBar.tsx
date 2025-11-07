import React from 'react';
import { Typography, Switch, Badge } from 'antd';
import { FileTextOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import DocumentTypeToggle from './DocumentTypeToggle';
import styles from './BillDataGrid.module.css';

const { Title, Text } = Typography;

interface BillTopBarProps {
  billdata?: any;
  documentType: 'bill' | 'invoice';
  billSettings: {
    isRetail: boolean;
    isGstIncluded: boolean;
    isPaid: boolean;
    isPartiallyPaid: boolean;
  };
  itemCount: number;
  totalAmount: number;
  onDocumentTypeChange: (type: 'bill' | 'invoice') => void;
  onSettingsChange: (settings: Partial<any>) => void;
}

const BillTopBar: React.FC<BillTopBarProps> = ({
  billdata,
  documentType,
  billSettings,
  itemCount,
  totalAmount,
  onDocumentTypeChange,
  onSettingsChange,
}) => {
  return (
    <div className={styles.headerContainer}>
      {/* Animated decorative background elements */}
      <div className={styles.headerCircle1} />
      <div className={styles.headerCircle2} />
      <div className={styles.headerCircle3} />
      <div className={styles.headerCircle4} />
      <div className={styles.headerCircle5} />

      <div className={styles.headerContent}>
        {/* Title Section */}
        <div className={styles.titleSection}>
          <div className={styles.titleIcon}>
            <FileTextOutlined style={{ fontSize: '24px', color: 'white' }} />
          </div>
          <div>
            <Title level={4} className={styles.titleText}>
              {billdata ? '⚡ EDIT INVOICE' : '🚀 NEW INVOICE'}
            </Title>
            <Text className={styles.subtitleText}>
              ⚡Lightning Fast • {dayjs().format('DD MMM YYYY, dddd')}
            </Text>
          </div>
        </div>

        {/* Controls Section */}
        <div className={styles.controlsSection}>
          {/* Document Type Toggle */}
          <div style={{ marginRight: '12px' }}>
            <DocumentTypeToggle value={documentType} onChange={onDocumentTypeChange} />
          </div>

          {/* Sale Type */}
          <div className={`${styles.controlGroup} ${styles.saleTypeControl}`}>
            <Text className={styles.controlLabel}>🏪 SALE TYPE</Text>
            <Switch
              checkedChildren="RETAIL"
              unCheckedChildren="WHOLESALE"
              checked={billSettings.isRetail}
              onChange={checked => onSettingsChange({ isRetail: checked })}
              className={styles.saleTypeSwitch}
              size="small"
            />
          </div>

          {/* GST Toggle */}
          <div className={`${styles.controlGroup} ${styles.gstControl}`}>
            <Text className={styles.controlLabel}>📊 GST</Text>
            <Switch
              checkedChildren="INCL"
              unCheckedChildren="EXCL"
              checked={billSettings.isGstIncluded}
              onChange={checked => onSettingsChange({ isGstIncluded: checked })}
              className={styles.gstSwitch}
              size="small"
            />
          </div>

          {/* Payment Status */}
          <div className={`${styles.controlGroup} ${styles.paymentControl}`}>
            <Text className={styles.controlLabel}>💳 PAYMENT</Text>
            <Switch
              checkedChildren="PAID"
              unCheckedChildren="UNPAID"
              checked={billSettings.isPaid}
              onChange={checked =>
                onSettingsChange({
                  isPaid: checked,
                  isPartiallyPaid: checked ? false : billSettings.isPartiallyPaid,
                })
              }
              className={styles.paymentSwitch}
              size="small"
            />
          </div>

          {/* Partial Payment */}
          {!billSettings.isPaid && (
            <div className={`${styles.controlGroup} ${styles.partialPaymentControl}`}>
              <Text className={styles.controlLabel}>💰 PARTIAL</Text>
              <Switch
                checkedChildren="YES"
                unCheckedChildren="NO"
                checked={billSettings.isPartiallyPaid}
                onChange={checked => onSettingsChange({ isPartiallyPaid: checked })}
                className={styles.partialPaymentSwitch}
                size="small"
              />
            </div>
          )}

          {/* Items and Amount Badges */}
          <div className={styles.badgesContainer}>
            <div className={styles.itemsBadge}>
              <Text className={styles.badgeText}>🎯 ITEMS: {itemCount}</Text>
            </div>
            <div className={styles.amountBadge}>
              <Text className={styles.badgeText}>💰 ₹{totalAmount.toFixed(2)}</Text>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillTopBar;

