import React from 'react';
import { Card, Button, Typography, Row, Col } from 'antd';
import {
  SettingOutlined,
  ShopOutlined,
  PercentageOutlined,
  FileTextOutlined,
  PrinterOutlined,
  CheckCircleOutlined,
  BankOutlined,
  QrcodeOutlined,
  BellOutlined,
  ApiOutlined,
  CrownOutlined,
} from '@ant-design/icons';
import styles from '../UserProfile.module.css';

const { Title, Text, Paragraph } = Typography;

export const SettingsTab: React.FC = () => {
  const handleNavigateToSettings = (tabKey?: string) => {
    if (tabKey) {
      window.location.href = `#/settings?tab=${tabKey}`;
    } else {
      window.location.href = '#/settings';
    }
  };

  return (
    <Card bordered={false}>
      <div className={styles.settingsOverview}>
        {/* Main Settings Icon */}
        <div className={styles.settingsIconWrapper}>
          <SettingOutlined className={styles.settingsIcon} />
        </div>
        
        {/* Title and Description */}
        <Title level={2} className={styles.settingsTitle}>
          Application Settings
        </Title>
        <Paragraph className={styles.settingsDescription}>
          Configure your business information, tax settings, invoice templates, printer settings, and more.
        </Paragraph>
        
        {/* Settings Cards Grid */}
        <div className={styles.settingsGrid}>
          <Row gutter={[24, 24]}>
            {/* Row 1 */}
            <Col xs={24} sm={12} md={6}>
              <div className={styles.settingCard} onClick={() => handleNavigateToSettings('business')}>
                <ShopOutlined className={styles.settingCardIcon} style={{ color: '#52c41a' }} />
                <Title level={5} className={styles.settingCardTitle}>
                  Business Info
                </Title>
                <Text className={styles.settingCardSubtitle}>Company details & address</Text>
              </div>
            </Col>
            
            <Col xs={24} sm={12} md={6}>
              <div className={styles.settingCard} onClick={() => handleNavigateToSettings('tax')}>
                <PercentageOutlined className={styles.settingCardIcon} style={{ color: '#faad14' }} />
                <Title level={5} className={styles.settingCardTitle}>
                  Tax & GST
                </Title>
                <Text className={styles.settingCardSubtitle}>Tax configuration</Text>
              </div>
            </Col>
            
            <Col xs={24} sm={12} md={6}>
              <div className={styles.settingCard} onClick={() => handleNavigateToSettings('invoice')}>
                <FileTextOutlined className={styles.settingCardIcon} style={{ color: '#1890ff' }} />
                <Title level={5} className={styles.settingCardTitle}>
                  Invoice
                </Title>
                <Text className={styles.settingCardSubtitle}>Invoice settings & templates</Text>
              </div>
            </Col>
            
            <Col xs={24} sm={12} md={6}>
              <div className={styles.settingCard} onClick={() => handleNavigateToSettings('printer')}>
                <PrinterOutlined className={styles.settingCardIcon} style={{ color: '#722ed1' }} />
                <Title level={5} className={styles.settingCardTitle}>
                  Printer
                </Title>
                <Text className={styles.settingCardSubtitle}>Print configuration</Text>
              </div>
            </Col>
            
            {/* Row 2 */}
            <Col xs={24} sm={12} md={6}>
              <div className={styles.settingCard} onClick={() => handleNavigateToSettings('templates')}>
                <FileTextOutlined className={styles.settingCardIcon} style={{ color: '#096dd9' }} />
                <Title level={5} className={styles.settingCardTitle}>
                  Templates
                </Title>
                <Text className={styles.settingCardSubtitle}>Bill & invoice templates</Text>
              </div>
            </Col>
            
            <Col xs={24} sm={12} md={6}>
              <div className={styles.settingCard} onClick={() => handleNavigateToSettings('defaults')}>
                <CheckCircleOutlined className={styles.settingCardIcon} style={{ color: '#389e0d' }} />
                <Title level={5} className={styles.settingCardTitle}>
                  Defaults
                </Title>
                <Text className={styles.settingCardSubtitle}>Default values & options</Text>
              </div>
            </Col>
            
            <Col xs={24} sm={12} md={6}>
              <div className={styles.settingCard} onClick={() => handleNavigateToSettings('bank')}>
                <BankOutlined className={styles.settingCardIcon} style={{ color: '#eb2f96' }} />
                <Title level={5} className={styles.settingCardTitle}>
                  Bank Details
                </Title>
                <Text className={styles.settingCardSubtitle}>Account & payment info</Text>
              </div>
            </Col>
            
            <Col xs={24} sm={12} md={6}>
              <div className={styles.settingCard} onClick={() => handleNavigateToSettings('payment-qr')}>
                <QrcodeOutlined className={styles.settingCardIcon} style={{ color: '#d46b08' }} />
                <Title level={5} className={styles.settingCardTitle}>
                  Payment QR
                </Title>
                <Text className={styles.settingCardSubtitle}>UPI & QR code settings</Text>
              </div>
            </Col>
            
            {/* Row 3 */}
            <Col xs={24} sm={12} md={6}>
              <div className={styles.settingCard} onClick={() => handleNavigateToSettings('notifications')}>
                <BellOutlined className={styles.settingCardIcon} style={{ color: '#13c2c2' }} />
                <Title level={5} className={styles.settingCardTitle}>
                  Notifications
                </Title>
                <Text className={styles.settingCardSubtitle}>Email & SMS alerts</Text>
              </div>
            </Col>
            
            <Col xs={24} sm={12} md={6}>
              <div className={styles.settingCard} onClick={() => handleNavigateToSettings('system')}>
                <ApiOutlined className={styles.settingCardIcon} style={{ color: '#531dab' }} />
                <Title level={5} className={styles.settingCardTitle}>
                  System
                </Title>
                <Text className={styles.settingCardSubtitle}>System configuration</Text>
              </div>
            </Col>
            
            <Col xs={24} sm={12} md={6}>
              <div className={styles.settingCard} onClick={() => handleNavigateToSettings('subscription')}>
                <CrownOutlined className={styles.settingCardIcon} style={{ color: '#c41d7f' }} />
                <Title level={5} className={styles.settingCardTitle}>
                  Subscription
                </Title>
                <Text className={styles.settingCardSubtitle}>Plan & billing details</Text>
              </div>
            </Col>
          </Row>
        </div>

        {/* Open Full Settings Button */}
        <Button 
          type="primary" 
          size="large" 
          icon={<SettingOutlined />}
          onClick={() => handleNavigateToSettings()}
          className={styles.openSettingsButton}
        >
          Open Full Settings
        </Button>
      </div>
    </Card>
  );
};

