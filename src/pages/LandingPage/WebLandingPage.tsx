import React, { useEffect } from 'react';
import {
  Button,
  Typography,
  Space,
  Badge,
  Card,
  Row,
  Col,
  Statistic,
  Progress,
  Avatar,
  Tag,
  Divider,
  notification,
} from 'antd';
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
  PlayCircleOutlined,
  DownloadOutlined,
  EyeOutlined,
  WifiOutlined,
  SyncOutlined,
  ShareAltOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import FeaturesSection from '../../components/common/FeaturesSection';
import LandingPageHeader from '../../components/common/LandingPageHeader';
import styles from './LandingPage.module.css';
import packageJson from '../../../package.json';

const { Title, Paragraph, Text } = Typography;

const WebLandingPage: React.FC = () => {
  const navigate = useNavigate();

  // Detect user's platform
  const detectPlatform = (): 'windows' | 'mac' | 'linux' | 'unknown' => {
    const userAgent = window.navigator.userAgent.toLowerCase();
    if (userAgent.indexOf('win') > -1) return 'windows';
    if (userAgent.indexOf('mac') > -1) return 'mac';
    if (userAgent.indexOf('linux') > -1) return 'linux';
    return 'unknown';
  };

  const platform = detectPlatform();

  // Generic download handler for all platforms
  const handleDownload = (platformType: 'windows' | 'mac' | 'linux') => {
    const version = packageJson.version;
    
    // Platform-specific file names and URLs
    const platformConfig = {
      windows: {
        fileName: `SubrivaBilling-Setup-${version}.exe`,
        downloadName: `SubrivaBilling Setup ${version}.exe`,
        description: 'Windows installer',
      },
      mac: {
        fileName: `SubrivaBilling-${version}.dmg`,
        downloadName: `SubrivaBilling ${version}.dmg`,
        description: 'macOS disk image',
      },
      linux: {
        fileName: `SubrivaBilling-${version}.AppImage`,
        downloadName: `SubrivaBilling ${version}.AppImage`,
        description: 'Linux AppImage',
      },
    };

    const config = platformConfig[platformType];
    const downloadUrl = `https://github.com/dilli2127/SubrivaBilling/releases/download/v${version}/${config.fileName}`;

    // Show loading notification
    notification.info({
      message: 'Download Starting',
      description: `Preparing to download SubrivaBilling for ${platformType === 'windows' ? 'Windows' : platformType === 'mac' ? 'macOS' : 'Linux'}...`,
      duration: 2,
      placement: 'topRight',
    });

    // Trigger download
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = config.downloadName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    notification.success({
      message: 'Download Started',
      description: `${config.description} download has started in your browser.`,
      duration: 4,
      placement: 'topRight',
    });
  };

  // Platform-specific download handlers
  const handleDownloadWindows = () => handleDownload('windows');
  
  const handleDownloadMac = () => {
    notification.info({
      message: 'Release Too Soon! 🍎',
      description: 'macOS version release is coming soon. Currently, only Windows version is available. Stay tuned for updates!',
      duration: 5,
      placement: 'topRight',
    });
  };
  
  const handleDownloadLinux = () => {
    notification.info({
      message: 'Release Too Soon! 🐧',
      description: 'Linux version release is coming soon. Currently, only Windows version is available. Stay tuned for updates!',
      duration: 5,
      placement: 'topRight',
    });
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        e.preventDefault();
        // Cycle through navigation items
        const navItems = [
          'features',
          'pricing',
          'customers',
          'login',
          'download',
          'download-main',
        ];
        const currentFocus = document.activeElement?.getAttribute('data-nav');
        const currentIndex = navItems.indexOf(currentFocus || 'features');
        const nextIndex = (currentIndex + 1) % navItems.length;
        const nextElement = document.querySelector(
          `[data-nav="${navItems[nextIndex]}"]`
        );
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
    {
      number: '10,000+',
      label: 'Happy Customers',
      icon: <UserOutlined />,
      color: '#1890ff',
    },
    {
      number: '1M+',
      label: 'Invoices Generated',
      icon: <FileTextOutlined />,
      color: '#52c41a',
    },
    {
      number: '99.9%',
      label: 'Uptime',
      icon: <ThunderboltOutlined />,
      color: '#722ed1',
    },
    {
      number: '24/7',
      label: 'Support',
      icon: <SafetyOutlined />,
      color: '#fa541c',
    },
  ];

  const features = [
    {
      icon: <WifiOutlined />,
      title: 'Cloud Sync',
      description: 'Access from anywhere, anytime',
    },
    {
      icon: <TeamOutlined />,
      title: 'Multi-User',
      description: 'Collaborate with your team',
    },
    {
      icon: <MobileOutlined />,
      title: 'Mobile Ready',
      description: 'Works on all devices',
    },
    {
      icon: <SyncOutlined />,
      title: 'Real-time',
      description: 'Live updates and collaboration',
    },
  ];

  const dashboardStats = [
    {
      label: 'Total Revenue',
      value: '₹2,45,67,890',
      change: '+12.5%',
      color: '#52c41a',
    },
    {
      label: 'Active Invoices',
      value: '1,234',
      change: '+8.2%',
      color: '#1890ff',
    },
    {
      label: 'Pending Payments',
      value: '₹45,670',
      change: '-3.1%',
      color: '#fa541c',
    },
    {
      label: 'This Month',
      value: '₹1,23,456',
      change: '+15.3%',
      color: '#722ed1',
    },
  ];

  return (
    <div className={styles.landingPage}>
      {/* Landing Page Header */}
      <LandingPageHeader
        title="Subriva Billing"
        logoUrl="https://freshfocuzstudio.s3.ap-south-1.amazonaws.com/ffs+logo.png"
        logoAlt="Subriva Billing"
      />

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
              Transform outdated billing practices and build a better workplace
              for your business with Subriva Billing. Access from anywhere with
              our cloud-based solution.
            </Paragraph>
            
            {/* Platform Availability Info */}
            <div style={{ 
              marginTop: 20, 
              marginBottom: 28,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
              flexWrap: 'wrap'
            }}>
              <Text type="secondary" style={{ fontSize: 14, fontWeight: 500 }}>
                Available for:
              </Text>
              <Space size={8}>
                <Tag 
                  color={platform === 'windows' ? 'blue' : 'default'}
                  onClick={handleDownloadWindows}
                  style={{ 
                    margin: 0, 
                    padding: '6px 14px', 
                    borderRadius: 8,
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: platform === 'windows' ? 600 : 400,
                    transition: 'all 0.2s ease',
                    border: platform === 'windows' ? '1px solid #1890ff' : '1px solid #d9d9d9'
                  }}
                >
                  🪟 Windows
                </Tag>
                <Tag 
                  color={platform === 'mac' ? 'blue' : 'default'}
                  onClick={handleDownloadMac}
                  style={{ 
                    margin: 0, 
                    padding: '6px 14px', 
                    borderRadius: 8,
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: platform === 'mac' ? 600 : 400,
                    transition: 'all 0.2s ease',
                    border: platform === 'mac' ? '1px solid #1890ff' : '1px solid #d9d9d9'
                  }}
                >
                  🍎 macOS
                </Tag>
                <Tag 
                  color={platform === 'linux' ? 'blue' : 'default'}
                  onClick={handleDownloadLinux}
                  style={{ 
                    margin: 0, 
                    padding: '6px 14px', 
                    borderRadius: 8,
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: platform === 'linux' ? 600 : 400,
                    transition: 'all 0.2s ease',
                    border: platform === 'linux' ? '1px solid #1890ff' : '1px solid #d9d9d9'
                  }}
                >
                  🐧 Linux
                </Tag>
              </Space>
            </div>
            
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
                onClick={() => {
                  if (platform === 'mac') handleDownloadMac();
                  else if (platform === 'linux') handleDownloadLinux();
                  else handleDownloadWindows();
                }}
                tabIndex={0}
                icon={<DownloadOutlined />}
                data-nav="download"
              >
                Download for {platform === 'mac' ? 'macOS' : platform === 'linux' ? 'Linux' : 'Windows'}
                {(platform === 'mac' || platform === 'linux') && <Tag color="orange" style={{ marginLeft: 8, fontSize: 11 }}>Soon</Tag>}
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
              Download our desktop application and start managing your billing
              efficiently. Currently available for Windows. macOS and Linux coming soon!
            </Paragraph>
            <div className={styles.downloadActions}>
              <Button
                type="primary"
                size="large"
                className={styles.downloadMainButton}
                onClick={() => {
                  if (platform === 'mac') handleDownloadMac();
                  else if (platform === 'linux') handleDownloadLinux();
                  else handleDownloadWindows();
                }}
                tabIndex={0}
                icon={<DownloadOutlined />}
                data-nav="download-main"
              >
                Download for {platform === 'mac' ? 'macOS' : platform === 'linux' ? 'Linux' : 'Windows'}
              </Button>
              <div className={styles.downloadInfo}>
                <Text type="secondary">
                  Version {packageJson.version} • Windows, macOS & Linux
                </Text>
              </div>
            </div>
            
            {/* All Platform Download Options */}
            <div style={{ marginTop: 56 }}>
              <Divider style={{ margin: '40px 0 48px 0', borderColor: '#e8e8e8' }}>
                <Text type="secondary" style={{ fontSize: 15, fontWeight: 500, letterSpacing: '0.5px' }}>
                  Available Platforms
                </Text>
              </Divider>
              
              <Row gutter={[24, 24]} justify="center" style={{ maxWidth: 900, margin: '0 auto', padding: '0 20px' }}>
                <Col xs={24} sm={8}>
                  <Card
                    hoverable
                    onClick={handleDownloadWindows}
                    style={{
                      borderColor: platform === 'windows' ? '#1890ff' : '#e8e8e8',
                      borderWidth: platform === 'windows' ? 2 : 1,
                      textAlign: 'center',
                      cursor: 'pointer',
                      height: '100%',
                      borderRadius: 12,
                      boxShadow: platform === 'windows' ? '0 4px 12px rgba(24, 144, 255, 0.15)' : '0 2px 8px rgba(0,0,0,0.06)',
                      transition: 'all 0.3s ease',
                      padding: '24px 16px',
                    }}
                  >
                    <div style={{ fontSize: 56, marginBottom: 16, lineHeight: 1 }}>🪟</div>
                    <Title level={4} style={{ margin: '12px 0 8px 0', fontSize: 18, fontWeight: 600 }}>Windows</Title>
                    <Text type="secondary" style={{ fontSize: 13, display: 'block', marginBottom: 20 }}>
                      Windows 10/11
                    </Text>
                    <Button
                      type={platform === 'windows' ? 'primary' : 'default'}
                      icon={<DownloadOutlined />}
                      size="large"
                      block
                      style={{ 
                        height: 44,
                        fontWeight: 500,
                        borderRadius: 8,
                      }}
                    >
                      Download
                    </Button>
                  </Card>
                </Col>
                
                <Col xs={24} sm={8}>
                  <Card
                    hoverable
                    onClick={handleDownloadMac}
                    style={{
                      borderColor: platform === 'mac' ? '#1890ff' : '#e8e8e8',
                      borderWidth: platform === 'mac' ? 2 : 1,
                      textAlign: 'center',
                      cursor: 'pointer',
                      height: '100%',
                      borderRadius: 12,
                      boxShadow: platform === 'mac' ? '0 4px 12px rgba(24, 144, 255, 0.15)' : '0 2px 8px rgba(0,0,0,0.06)',
                      transition: 'all 0.3s ease',
                      padding: '24px 16px',
                    }}
                  >
                    <div style={{ fontSize: 56, marginBottom: 16, lineHeight: 1 }}>🍎</div>
                    <Title level={4} style={{ margin: '12px 0 8px 0', fontSize: 18, fontWeight: 600 }}>macOS</Title>
                    <Text type="secondary" style={{ fontSize: 13, display: 'block', marginBottom: 20 }}>
                      macOS 10.15+
                    </Text>
                    <Button
                      type={platform === 'mac' ? 'primary' : 'default'}
                      icon={<DownloadOutlined />}
                      size="large"
                      block
                      style={{ 
                        height: 44,
                        fontWeight: 500,
                        borderRadius: 8,
                      }}
                    >
                      Download
                    </Button>
                  </Card>
                </Col>
                
                <Col xs={24} sm={8}>
                  <Card
                    hoverable
                    onClick={handleDownloadLinux}
                    style={{
                      borderColor: platform === 'linux' ? '#1890ff' : '#e8e8e8',
                      borderWidth: platform === 'linux' ? 2 : 1,
                      textAlign: 'center',
                      cursor: 'pointer',
                      height: '100%',
                      borderRadius: 12,
                      boxShadow: platform === 'linux' ? '0 4px 12px rgba(24, 144, 255, 0.15)' : '0 2px 8px rgba(0,0,0,0.06)',
                      transition: 'all 0.3s ease',
                      padding: '24px 16px',
                    }}
                  >
                    <div style={{ fontSize: 56, marginBottom: 16, lineHeight: 1 }}>🐧</div>
                    <Title level={4} style={{ margin: '12px 0 8px 0', fontSize: 18, fontWeight: 600 }}>Linux</Title>
                    <Text type="secondary" style={{ fontSize: 13, display: 'block', marginBottom: 20 }}>
                      Ubuntu, Debian, etc.
                    </Text>
                    <Button
                      type={platform === 'linux' ? 'primary' : 'default'}
                      icon={<DownloadOutlined />}
                      size="large"
                      block
                      style={{ 
                        height: 44,
                        fontWeight: 500,
                        borderRadius: 8,
                      }}
                    >
                      Download
                    </Button>
                  </Card>
                </Col>
              </Row>
            </div>
            
            {/* Feature Highlights */}
            <div style={{ marginTop: 56, textAlign: 'center' }}>
              <Row gutter={[32, 16]} justify="center" style={{ maxWidth: 600, margin: '0 auto' }}>
                <Col xs={12} sm={12}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                    <CheckCircleOutlined style={{ fontSize: 24, color: '#52c41a' }} />
                    <Text style={{ fontSize: 15, fontWeight: 500 }}>Offline functionality</Text>
                  </div>
                </Col>
                <Col xs={12} sm={12}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
                    <CheckCircleOutlined style={{ fontSize: 24, color: '#52c41a' }} />
                    <Text style={{ fontSize: 15, fontWeight: 500 }}>Auto-updates included</Text>
                  </div>
                </Col>
              </Row>
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
                  Access your billing system from anywhere with our cloud-based
                  platform. Automatic backups, real-time sync, and
                  enterprise-grade security.
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
                  Assign roles, share access, and collaborate on invoices and
                  reports in real-time.
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
