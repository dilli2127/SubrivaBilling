import React, { useEffect } from 'react';
import { Button, Typography, Card, Row, Col, Space } from 'antd';
import { 
  ShoppingCartOutlined,
  BarChartOutlined,
  TeamOutlined,
  SecurityScanOutlined,
  MobileOutlined,
  CloudOutlined,
  ArrowLeftOutlined,
  CheckCircleOutlined,
  ThunderboltOutlined,
  DatabaseOutlined,
  SettingOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import styles from './featuresPage.module.css';

const { Title, Paragraph, Text } = Typography;

const FeaturesPage: React.FC = () => {
  const navigate = useNavigate();

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        const navItems = ['back', 'features', 'pricing', 'customers', 'login'];
        const currentFocus = document.activeElement?.getAttribute('data-nav');
        const currentIndex = navItems.indexOf(currentFocus || 'back');
        const nextIndex = (currentIndex + 1) % navItems.length;
        const nextElement = document.querySelector(`[data-nav="${navItems[nextIndex]}"]`);
        if (nextElement) {
          (nextElement as HTMLElement).focus();
        }
      }
      if (e.key === 'Enter') {
        const activeElement = document.activeElement as HTMLElement;
        if (activeElement) {
          activeElement.click();
        }
      }
      if (e.key === 'Escape') {
        navigate('/');
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [navigate]);

  const features = [
    {
      icon: <ShoppingCartOutlined className={styles.featureIcon} />,
      title: "Smart Billing",
      description: "Automated invoice generation with customizable templates and real-time calculations.",
      benefits: ["Auto-calculations", "Custom templates", "Bulk invoicing", "Tax handling"]
    },
    {
      icon: <BarChartOutlined className={styles.featureIcon} />,
      title: "Analytics Dashboard",
      description: "Comprehensive reports and insights to track your business performance.",
      benefits: ["Revenue tracking", "Sales reports", "Customer analytics", "Profit margins"]
    },
    {
      icon: <TeamOutlined className={styles.featureIcon} />,
      title: "Multi-User Support",
      description: "Role-based access control for teams with different permission levels.",
      benefits: ["User roles", "Permission control", "Team collaboration", "Activity logs"]
    },
    {
      icon: <SecurityScanOutlined className={styles.featureIcon} />,
      title: "Secure & Reliable",
      description: "Bank-grade security with data encryption and regular backups.",
      benefits: ["Data encryption", "Regular backups", "SSL security", "GDPR compliant"]
    },
    {
      icon: <MobileOutlined className={styles.featureIcon} />,
      title: "Mobile Responsive",
      description: "Access your billing system from any device, anywhere, anytime.",
      benefits: ["Mobile app", "Tablet support", "Offline mode", "Sync across devices"]
    },
    {
      icon: <CloudOutlined className={styles.featureIcon} />,
      title: "Cloud Storage",
      description: "Automatic cloud backup and sync across all your devices.",
      benefits: ["Auto backup", "Cloud sync", "Version history", "Data recovery"]
    },
    {
      icon: <ThunderboltOutlined className={styles.featureIcon} />,
      title: "Fast Performance",
      description: "Lightning-fast processing and real-time updates for better productivity.",
      benefits: ["Real-time updates", "Fast processing", "Quick search", "Instant sync"]
    },
    {
      icon: <DatabaseOutlined className={styles.featureIcon} />,
      title: "Data Management",
      description: "Advanced data management with import/export capabilities and integrations.",
      benefits: ["Data import/export", "API integrations", "Data migration", "Backup restore"]
    }
  ];

  const categories = [
    {
      title: "Billing & Invoicing",
      icon: <FileTextOutlined />,
      features: ["Smart Billing", "Analytics Dashboard", "Fast Performance"]
    },
    {
      title: "Team & Security",
      icon: <TeamOutlined />,
      features: ["Multi-User Support", "Secure & Reliable", "Data Management"]
    },
    {
      title: "Access & Storage",
      icon: <CloudOutlined />,
      features: ["Mobile Responsive", "Cloud Storage", "Fast Performance"]
    }
  ];

  return (
    <div className={styles.featuresPage}>
      {/* Navigation */}
      <nav className={styles.featuresNav}>
        <div className={styles.navContainer}>
          <div className={styles.navBrand}>
            <Title level={3} style={{ color: '#1890ff', margin: 0 }}>
              Subriva Billing
            </Title>
          </div>
          <div className={styles.navMenu}>
            <Button 
              type="text" 
              className={styles.navItem}
              onClick={() => navigate('/')}
              data-nav="back"
              tabIndex={0}
            >
              <ArrowLeftOutlined /> Back to Home
            </Button>
            <Button 
              type="text" 
              className={`${styles.navItem} ${styles.active}`}
              data-nav="features"
              tabIndex={0}
            >
              Features
            </Button>
            <Button 
              type="text" 
              className={styles.navItem}
              onClick={() => navigate('/pricing')}
              data-nav="pricing"
              tabIndex={0}
            >
              Pricing
            </Button>
            <Button 
              type="text" 
              className={styles.navItem}
              onClick={() => navigate('/customers')}
              data-nav="customers"
              tabIndex={0}
            >
              Customers
            </Button>
            <Button 
              type="primary" 
              size="large"
              onClick={() => navigate('/login')}
              className={styles.loginBtn}
              data-nav="login"
              tabIndex={0}
            >
              Login
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className={styles.featuresContent}>
        {/* Header */}
        <div className={styles.featuresHeader}>
          <Title level={1} className={styles.pageTitle}>Powerful Features</Title>
          <Paragraph className={styles.pageSubtitle}>
            Everything you need to manage your billing and grow your business efficiently
          </Paragraph>
        </div>

        {/* Feature Categories */}
        <div className={styles.categoriesSection}>
          <Row gutter={[24, 24]} className={styles.categoriesGrid}>
            {categories.map((category, index) => (
              <Col xs={24} sm={8} key={index}>
                <Card className={styles.categoryCard} hoverable>
                  <div className={styles.categoryContent}>
                    <div className={styles.categoryIcon}>
                      {category.icon}
                    </div>
                    <Title level={4} className={styles.categoryTitle}>{category.title}</Title>
                    <ul className={styles.categoryFeatures}>
                      {category.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className={styles.categoryFeature}>
                          <CheckCircleOutlined className={styles.checkIcon} />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </div>

        {/* Detailed Features */}
        <div className={styles.detailedFeatures}>
          <Title level={2} className={styles.sectionTitle}>Detailed Features</Title>
          <Row gutter={[24, 24]} className={styles.featuresGrid}>
            {features.map((feature, index) => (
              <Col xs={24} sm={12} lg={8} key={index}>
                <Card className={styles.featureCard} hoverable>
                  <div className={styles.featureContent}>
                    <div className={styles.featureIconWrapper}>
                      {feature.icon}
                    </div>
                    <Title level={4} className={styles.featureTitle}>{feature.title}</Title>
                    <Paragraph className={styles.featureDescription}>{feature.description}</Paragraph>
                    <div className={styles.featureBenefits}>
                      {feature.benefits.map((benefit, benefitIndex) => (
                        <div key={benefitIndex} className={styles.benefitItem}>
                          <CheckCircleOutlined className={styles.benefitIcon} />
                          <Text className={styles.benefitText}>{benefit}</Text>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </div>

        {/* CTA Section */}
        <div className={styles.featuresCta}>
          <Title level={2} className={styles.ctaTitle}>Ready to Experience These Features?</Title>
          <Paragraph className={styles.ctaSubtitle}>
            Start your free trial today and see how Subriva Billing can transform your business
          </Paragraph>
          <Space size="large" className={styles.ctaActions}>
            <Button 
              type="primary" 
              size="large" 
              onClick={() => navigate('/login')}
              className={styles.ctaButton}
              tabIndex={0}
            >
              Start Free Trial
            </Button>
            <Button 
              size="large" 
              className={styles.demoButton}
              onClick={() => navigate('/pricing')}
              tabIndex={0}
            >
              View Pricing
            </Button>
          </Space>
        </div>
      </div>
    </div>
  );
};

export default FeaturesPage;
