import React, { useEffect } from 'react';
import { Button, Typography, Space, Badge, Card, Row, Col, Statistic, Progress, Avatar, Tag, Divider } from 'antd';
import { 
  ArrowRightOutlined,
  FileTextOutlined,
  PhoneOutlined,
  MailOutlined,
  GlobalOutlined,
  BarChartOutlined,
  UserOutlined,
  CheckCircleOutlined,
  StarOutlined,
  ThunderboltOutlined,
  SafetyOutlined,
  MobileOutlined,
  CloudOutlined,
  TeamOutlined,
  DollarOutlined,
  CalendarOutlined,
  SettingOutlined,
  BellOutlined,
  SearchOutlined,
  MenuOutlined,
  PlayCircleOutlined,
  EyeOutlined,
  DesktopOutlined,
  DatabaseOutlined,
  LockOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import FeaturesSection from '../../components/common/FeaturesSection';
import styles from './LandingPage.module.css';

const { Title, Paragraph, Text } = Typography;

const ElectronLandingPage: React.FC = () => {
  const navigate = useNavigate();


  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        // Cycle through navigation items
        const navItems = ['features', 'pricing', 'customers', 'login'];
        const currentFocus = document.activeElement?.getAttribute('data-nav');
        const currentIndex = navItems.indexOf(currentFocus || 'features');
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
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [navigate]);

  // Electron-specific scrolling fixes
  useEffect(() => {
    // Ensure body and html have proper height for Electron
    document.documentElement.style.height = '100%';
    document.body.style.height = '100%';
    document.body.style.overflow = 'hidden';
    
    // Set the root element to handle scrolling
    const rootElement = document.getElementById('root');
    if (rootElement) {
      rootElement.style.height = '100%';
      rootElement.style.overflow = 'hidden';
    }
    
    // Ensure the landing page container handles scrolling
    const landingPageElement = document.querySelector('.landingPage');
    if (landingPageElement) {
      (landingPageElement as HTMLElement).style.height = '100vh';
      (landingPageElement as HTMLElement).style.overflowY = 'auto';
    }
  }, []);

  const stats = [
    { number: "10,000+", label: "Happy Customers", icon: <UserOutlined />, color: "#1890ff" },
    { number: "1M+", label: "Invoices Generated", icon: <FileTextOutlined />, color: "#52c41a" },
    { number: "99.9%", label: "Uptime", icon: <ThunderboltOutlined />, color: "#722ed1" },
    { number: "24/7", label: "Support", icon: <SafetyOutlined />, color: "#fa541c" }
  ];

  const features = [
    { icon: <DesktopOutlined />, title: "Desktop Native", description: "Full desktop application experience" },
    { icon: <DatabaseOutlined />, title: "Local Data", description: "Your data stays on your computer" },
    { icon: <LockOutlined />, title: "Offline Ready", description: "Works without internet connection" },
    { icon: <CloudOutlined />, title: "Auto Updates", description: "Automatic security and feature updates" }
  ];

  const dashboardStats = [
    { label: "Total Revenue", value: "₹2,45,67,890", change: "+12.5%", color: "#52c41a" },
    { label: "Active Invoices", value: "1,234", change: "+8.2%", color: "#1890ff" },
    { label: "Pending Payments", value: "₹45,670", change: "-3.1%", color: "#fa541c" },
    { label: "This Month", value: "₹1,23,456", change: "+15.3%", color: "#722ed1" }
  ];

  return (
    <div className={styles.landingPage}>

      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroContainer}>
          <div className="hero-content">
            <Badge.Ribbon text="Desktop App" color="blue">
              <Title level={1} className={styles.heroTitle}>
                Professional Desktop Billing Solution
              </Title>
            </Badge.Ribbon>
            <Paragraph className={styles.heroSubtitle}>
              Experience the full power of Subriva Billing with our native desktop application. 
              Fast, secure, and designed for professional use.
            </Paragraph>
            <Space size="large" className={styles.heroActions}>
              <Button 
                type="primary" 
                size="large" 
                onClick={() => navigate('/billing_login')}
                className={styles.ctaButton}
                tabIndex={0}
              >
                Launch Application
                <ArrowRightOutlined />
              </Button>
              <Button 
                size="large" 
                className={styles.demoButton}
                onClick={() => navigate('/features')}
                tabIndex={0}
              >
                View Features
              </Button>
            </Space>
          </div>
        </div>
      </section>

      {/* Desktop App Benefits Section */}
      <section className={styles.downloadSection}>
        <div className={styles.downloadContainer}>
          <div className={styles.downloadContent}>
            <Title level={2} className={styles.downloadTitle}>
              Desktop Application Benefits
            </Title>
            <Paragraph className={styles.downloadSubtitle}>
              You're running the complete Subriva Billing desktop application. 
              Enjoy native performance, local data control, and offline functionality.
            </Paragraph>
            <div className={styles.downloadFeatures}>
              <div className={styles.downloadFeature}>
                <CheckCircleOutlined className={styles.featureIcon} />
                <Text>Native desktop performance</Text>
              </div>
              <div className={styles.downloadFeature}>
                <CheckCircleOutlined className={styles.featureIcon} />
                <Text>Complete offline functionality</Text>
              </div>
              <div className={styles.downloadFeature}>
                <CheckCircleOutlined className={styles.featureIcon} />
                <Text>Local data storage</Text>
              </div>
              <div className={styles.downloadFeature}>
                <CheckCircleOutlined className={styles.featureIcon} />
                <Text>Automatic updates</Text>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Essential Features Section */}
      <FeaturesSection />

      {/* Desktop-Specific Features Section */}
      <section className={styles.additionalContent}>
        <div className={styles.contentContainer}>
          <Row gutter={[32, 32]}>
            <Col xs={24} md={12}>
              <Card className={styles.contentCard}>
                <div className={styles.cardIcon}>
                  <DesktopOutlined />
                </div>
                <Title level={3}>Desktop Performance</Title>
                <Paragraph>
                  Experience lightning-fast performance with our native desktop application. 
                  No browser limitations, full system integration, and optimized for your workflow.
                </Paragraph>
                <Button type="primary" icon={<ArrowRightOutlined />}>
                  Learn More
                </Button>
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card className={styles.contentCard}>
                <div className={styles.cardIcon}>
                  <DatabaseOutlined />
                </div>
                <Title level={3}>Local Data Control</Title>
                <Paragraph>
                  Your data stays on your computer. No cloud dependencies, complete privacy, 
                  and full control over your business information.
                </Paragraph>
                <Button type="primary" icon={<ArrowRightOutlined />}>
                  Learn More
                </Button>
              </Card>
            </Col>
          </Row>
        </div>
      </section>

    </div>
  );
};

export default ElectronLandingPage;
