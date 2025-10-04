import React from 'react';
import { Card, Row, Col, Typography } from 'antd';
import {
  ThunderboltOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  WifiOutlined,
  SafetyOutlined,
  CustomerServiceOutlined,
  SettingOutlined,
  DollarOutlined
} from '@ant-design/icons';
import styles from './FeaturesSection.module.css';

const { Title, Paragraph } = Typography;

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeaturesSection: React.FC = () => {
  const features: Feature[] = [
    {
      icon: <ThunderboltOutlined className={styles.featureIcon} />,
      title: "Easy to Use",
      description: "The software should be user-friendly so that you and your staff can use it without confusion or extra training."
    },
    {
      icon: <FileTextOutlined className={styles.featureIcon} />,
      title: "Fast Billing",
      description: "It should allow quick bill generation, especially during peak business hours."
    },
    {
      icon: <CheckCircleOutlined className={styles.featureIcon} />,
      title: "GST-Ready",
      description: "Look for GST billing software that also handles stock and accounting with accuracy."
    },
    {
      icon: <WifiOutlined className={styles.featureIcon} />,
      title: "Online + Offline Access",
      description: "Choose software that works both online and offline, so your business runs smoothly even without an internet connection."
    },
    {
      icon: <SafetyOutlined className={styles.featureIcon} />,
      title: "Reliable Performance",
      description: "The system should be fast and stable, even during high traffic or rush hours."
    },
    {
      icon: <CustomerServiceOutlined className={styles.featureIcon} />,
      title: "Good Customer Support",
      description: "Check if the company offers timely and helpful customer service when you need assistance."
    },
    {
      icon: <SettingOutlined className={styles.featureIcon} />,
      title: "Compare Features",
      description: "Don't forget to compare tools like sales reports, inventory tracking, and SMS alerts."
    },
    {
      icon: <DollarOutlined className={styles.featureIcon} />,
      title: "Transparent Pricing",
      description: "Look out for hidden costs. The best billing software is one that offers the right features at a reasonable price."
    }
  ];

  return (
    <div className={styles.featuresSection}>
      <div className={styles.featuresHeader}>
        <Title level={2} className={styles.sectionTitle}>
          Selecting the right billing and <span className={styles.highlight}>accounting software</span> is a key decision for any business. Here are some essential tips to help you make the right choice:
        </Title>
      </div>
      
      <div className={styles.featuresGrid}>
        <Row gutter={[32, 32]}>
          {features.map((feature, index) => (
            <Col xs={24} sm={12} lg={6} key={index}>
              <Card className={styles.featureCard} hoverable>
                <div className={styles.featureContent}>
                  <div className={styles.iconWrapper}>
                    {feature.icon}
                  </div>
                  <Title level={4} className={styles.featureTitle}>
                    {feature.title}
                  </Title>
                  <Paragraph className={styles.featureDescription}>
                    {feature.description}
                  </Paragraph>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </div>
  );
};

export default FeaturesSection;
