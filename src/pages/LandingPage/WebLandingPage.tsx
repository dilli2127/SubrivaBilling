import React, { useEffect } from 'react';
import { Button, Typography, Space, Badge, Card, Row, Col, Statistic, Progress, Avatar, Tag, Divider, notification } from 'antd';
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
  DownloadOutlined,
  EyeOutlined,
  WifiOutlined,
  SyncOutlined,
  ShareAltOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import FeaturesSection from '../../components/common/FeaturesSection';
import styles from './LandingPage.module.css';

const { Title, Paragraph, Text } = Typography;

const WebLandingPage: React.FC = () => {
  const navigate = useNavigate();

  // Handle Windows download
  const handleDownloadWindows = async () => {
    // Show loading notification
    notification.info({
      message: 'Download Starting',
      description: 'Preparing to download SubrivaBilling for Windows...',
      duration: 2,
      placement: 'topRight',
    });

    // Web browser download
    const downloadUrl = 'https://freshfocuzstudio.s3.ap-south-1.amazonaws.com/SubrivaBilling/SubrivaBilling-V.1.0.1.exe';
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = 'SubrivaBilling Setup 1.0.1.exe';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    notification.success({
      message: 'Download Started',
      description: 'The installer download has started in your browser.',
      duration: 4,
      placement: 'topRight',
    });
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        // Cycle through navigation items
        const navItems = ['features', 'pricing', 'customers', 'login', 'download', 'download-main'];
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

  const stats = [
    { number: "10,000+", label: "Happy Customers", icon: <UserOutlined />, color: "#1890ff" },
    { number: "1M+", label: "Invoices Generated", icon: <FileTextOutlined />, color: "#52c41a" },
    { number: "99.9%", label: "Uptime", icon: <ThunderboltOutlined />, color: "#722ed1" },
    { number: "24/7", label: "Support", icon: <SafetyOutlined />, color: "#fa541c" }
  ];

  const features = [
    { icon: <WifiOutlined />, title: "Cloud Sync", description: "Access from anywhere, anytime" },
    { icon: <TeamOutlined />, title: "Multi-User", description: "Collaborate with your team" },
    { icon: <MobileOutlined />, title: "Mobile Ready", description: "Works on all devices" },
    { icon: <SyncOutlined />, title: "Real-time", description: "Live updates and collaboration" }
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
            <Badge.Ribbon text="Web App" color="green">
              <Title level={1} className={styles.heroTitle}>
                Billing made easy, scalable, and compliant
              </Title>
            </Badge.Ribbon>
            <Paragraph className={styles.heroSubtitle}>
              Transform outdated billing practices and build a better workplace for your business with Subriva Billing.
              Access from anywhere with our cloud-based solution.
            </Paragraph>
            <Space size="large" className={styles.heroActions}>
              <Button 
                type="primary" 
                size="large" 
                onClick={() => navigate('/billing_login')}
                className={styles.ctaButton}
                tabIndex={0}
              >
                Access Subriva Billing
                <ArrowRightOutlined />
              </Button>
              <Button 
                size="large" 
                className={styles.downloadButton}
                onClick={() => handleDownloadWindows()}
                tabIndex={0}
                icon={<DownloadOutlined />}
                data-nav="download"
              >
                Download for Windows
              </Button>
              <Button 
                size="large" 
                className={styles.demoButton}
                onClick={() => navigate('/features')}
                tabIndex={0}
              >
                Request a demo
              </Button>
            </Space>
          </div>
        </div>
      </section>

      {/* Download Section */}
      <section className={styles.downloadSection}>
        <div className={styles.downloadContainer}>
          <div className={styles.downloadContent}>
            <Title level={2} className={styles.downloadTitle}>
              Get Started with Subriva Billing
            </Title>
            <Paragraph className={styles.downloadSubtitle}>
              Download our Windows application and start managing your billing efficiently. 
              No installation hassles, just download and run.
            </Paragraph>
            <div className={styles.downloadActions}>
              <Button 
                type="primary" 
                size="large" 
                className={styles.downloadMainButton}
                onClick={() => handleDownloadWindows()}
                tabIndex={0}
                icon={<DownloadOutlined />}
                data-nav="download-main"
              >
                Download for Windows
              </Button>
              <div className={styles.downloadInfo}>
                <Text type="secondary">
                  Version 2.0.2 • 125 MB • Windows 10/11
                </Text>
              </div>
            </div>
            <div className={styles.downloadFeatures}>
              <div className={styles.downloadFeature}>
                <CheckCircleOutlined className={styles.featureIcon} />
                <Text>Offline functionality</Text>
              </div>
              <div className={styles.downloadFeature}>
                <CheckCircleOutlined className={styles.featureIcon} />
                <Text>Auto-updates included</Text>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Essential Features Section */}
      <FeaturesSection />

      {/* Additional Features Section */}
      <section className={styles.additionalContent}>
        <div className={styles.contentContainer}>
          <Row gutter={[32, 32]}>
            <Col xs={24} md={12}>
              <Card className={styles.contentCard}>
                <div className={styles.cardIcon}>
                  <CloudOutlined />
                </div>
                <Title level={3}>Cloud-Based Solution</Title>
                <Paragraph>
                  Access your billing system from anywhere with our cloud-based platform. 
                  Automatic backups, real-time sync, and enterprise-grade security.
                </Paragraph>
                <Button type="primary" icon={<ArrowRightOutlined />}>
                  Learn More
                </Button>
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card className={styles.contentCard}>
                <div className={styles.cardIcon}>
                  <ShareAltOutlined />
                </div>
                <Title level={3}>Team Collaboration</Title>
                <Paragraph>
                  Work seamlessly with your team using our multi-user features. 
                  Assign roles, share access, and collaborate on invoices and reports in real-time.
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

export default WebLandingPage;
