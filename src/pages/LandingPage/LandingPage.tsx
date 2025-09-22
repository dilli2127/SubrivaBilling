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
  DownloadOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import styles from './LandingPage.module.css';

const { Title, Paragraph, Text } = Typography;

const LandingPage: React.FC = () => {
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

  const stats = [
    { number: "10,000+", label: "Happy Customers", icon: <UserOutlined />, color: "#1890ff" },
    { number: "1M+", label: "Invoices Generated", icon: <FileTextOutlined />, color: "#52c41a" },
    { number: "99.9%", label: "Uptime", icon: <ThunderboltOutlined />, color: "#722ed1" },
    { number: "24/7", label: "Support", icon: <SafetyOutlined />, color: "#fa541c" }
  ];

  const features = [
    { icon: <BarChartOutlined />, title: "Smart Analytics", description: "Real-time insights and reports" },
    { icon: <TeamOutlined />, title: "Multi-User", description: "Collaborate with your team" },
    { icon: <MobileOutlined />, title: "Mobile App", description: "Access anywhere, anytime" },
    { icon: <CloudOutlined />, title: "Cloud Sync", description: "Automatic backup & sync" }
  ];

  const dashboardStats = [
    { label: "Total Revenue", value: "₹2,45,67,890", change: "+12.5%", color: "#52c41a" },
    { label: "Active Invoices", value: "1,234", change: "+8.2%", color: "#1890ff" },
    { label: "Pending Payments", value: "₹45,670", change: "-3.1%", color: "#fa541c" },
    { label: "This Month", value: "₹1,23,456", change: "+15.3%", color: "#722ed1" }
  ];

  return (
    <div className={styles.landingPage}>
      {/* Navigation */}
      <nav className={styles.landingNav}>
        <div className={styles.navContainer}>
          <div className={styles.navBrand}>
            <div className={styles.brandIcon}>
              <FileTextOutlined />
            </div>
            <Title level={3} style={{ color: '#1890ff', margin: 0 }}>
              Subriva Billing
            </Title>
          </div>
          <div className={styles.navMenu}>
            <Button 
              type="text" 
              className={styles.navItem}
              onClick={() => navigate('/features')}
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

      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.heroContainer}>
          <div className="hero-content">
            <Badge.Ribbon text="New" color="green">
              <Title level={1} className={styles.heroTitle}>
                Billing made easy, scalable, and compliant
              </Title>
            </Badge.Ribbon>
            <Paragraph className={styles.heroSubtitle}>
              Transform outdated billing practices and build a better workplace for your business with Subriva Billing.
            </Paragraph>
            <Space size="large" className={styles.heroActions}>
              <Button 
                type="primary" 
                size="large" 
                onClick={() => navigate('/login')}
                className={styles.ctaButton}
                tabIndex={0}
              >
                Access Subriva Billing
                <ArrowRightOutlined />
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

      {/* Dashboard Preview Section */}
      <section className={styles.dashboardPreview}>
        <div className={styles.dashboardContainer}>
          {/* Dashboard Header */}
          <div className={styles.dashboardHeader}>
            <div className={styles.dashboardNav}>
              <div className={styles.dashboardBrand}>
                <div className={styles.dashboardIcon}>
                  <FileTextOutlined />
                </div>
                <span>Billing</span>
              </div>
              <div className={styles.dashboardSearch}>
                <SearchOutlined />
                <input placeholder="Q Search Invoice" />
              </div>
              <div className={styles.dashboardActions}>
                <span>Subriva Corp</span>
                <BellOutlined />
                <SettingOutlined />
                <Avatar size="small" icon={<UserOutlined />} />
              </div>
            </div>
          </div>

          <div className={styles.dashboardContent}>
            {/* Sidebar */}
            <div className={styles.dashboardSidebar}>
              <div className={styles.sidebarMenu}>
                <div className={`${styles.menuItem} ${styles.active}`}>
                  <BarChartOutlined />
                  <span>Dashboard</span>
                </div>
                <div className={styles.menuItem}>
                  <UserOutlined />
                  <span>Customers</span>
                </div>
                <div className={styles.menuItem}>
                  <FileTextOutlined />
                  <span>Invoices</span>
                </div>
                <div className={styles.menuItem}>
                  <DollarOutlined />
                  <span>Payments</span>
                </div>
                <div className={styles.menuItem}>
                  <CalendarOutlined />
                  <span>Reports</span>
                </div>
                <div className={styles.menuItem}>
                  <SettingOutlined />
                  <span>Settings</span>
                </div>
              </div>
              
              <Card className={styles.userCard}>
                <div className={styles.userInfo}>
                  <Avatar size={60} icon={<UserOutlined />} />
                  <div className={styles.userDetails}>
                    <Text strong>Welcome Meera!</Text>
                    <Text type="secondary">Billing Manager</Text>
                  </div>
                </div>
              </Card>
            </div>

            {/* Main Content */}
            <div className={styles.dashboardMain}>
              <div className={styles.welcomeSection}>
                <Title level={3}>Welcome Meera Krishnan!</Title>
              </div>

              {/* Process Invoice Card */}
              <Card className={styles.processCard}>
                <div className={styles.processHeader}>
                  <Title level={4}>Process Invoice for May 2024</Title>
                  <Tag color="green">APPROVED</Tag>
                </div>
                <Row gutter={[24, 24]}>
                  <Col span={8}>
                    <Statistic
                      title="TOTAL REVENUE"
                      value="₹17,25,23,654.00"
                      valueStyle={{ color: '#52c41a', fontSize: '24px' }}
                    />
                  </Col>
                  <Col span={8}>
                    <Statistic
                      title="PAYMENT DATE"
                      value="31 May 2024"
                      valueStyle={{ color: '#1890ff', fontSize: '18px' }}
                    />
                  </Col>
                  <Col span={8}>
                    <div className={styles.employeeCount}>
                      <Statistic
                        title="NO. OF INVOICES"
                        value="1308"
                        valueStyle={{ color: '#722ed1', fontSize: '18px' }}
                      />
                      <Button type="primary" size="small">View Details</Button>
                    </div>
                  </Col>
                </Row>
                <div className={styles.processNote}>
                  <Text type="secondary">
                    Process your invoices on 31/05/2024. Record it here once you made the payment.
                  </Text>
                </div>
              </Card>

              {/* Stats Grid */}
              <Row gutter={[16, 16]} className={styles.statsGrid}>
                {dashboardStats.map((stat, index) => (
                  <Col span={6} key={index}>
                    <Card className={styles.statCard}>
                      <Statistic
                        title={stat.label}
                        value={stat.value}
                        valueStyle={{ color: stat.color, fontSize: '20px' }}
                      />
                      <Text type="secondary" style={{ color: stat.color }}>
                        {stat.change}
                      </Text>
                    </Card>
                  </Col>
                ))}
              </Row>

              {/* Features Grid */}
              <Row gutter={[16, 16]} className={styles.featuresGrid}>
                {features.map((feature, index) => (
                  <Col span={6} key={index}>
                    <Card className={styles.featureCard} hoverable>
                      <div className={styles.featureIcon}>
                        {feature.icon}
                      </div>
                      <Title level={5}>{feature.title}</Title>
                      <Text type="secondary">{feature.description}</Text>
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>

            {/* Right Sidebar */}
            <div className={styles.dashboardRight}>
              <Card className={styles.employeePortal}>
                <div className={styles.portalHeader}>
                  <Avatar size={40} icon={<UserOutlined />} />
                  <div>
                    <Text strong>Hello! Kartik Kumar</Text>
                    <br />
                    <Text type="secondary">Welcome to Subriva Billing</Text>
                  </div>
                </div>
                <div className={styles.portalStats}>
                  <div className={styles.statItem}>
                    <Text strong>03</Text>
                    <Text type="secondary">Pending</Text>
                  </div>
                  <div className={styles.statItem}>
                    <Text strong>43</Text>
                    <Text type="secondary">Approved</Text>
                  </div>
                  <div className={styles.statItem}>
                    <Text strong>44</Text>
                    <Text type="secondary">Completed</Text>
                  </div>
                </div>
                <Button type="primary" block>Check Out</Button>
                <div className={styles.portalMenu}>
                  <Title level={5}>Invoice Details</Title>
                  <div className={styles.menuOptions}>
                    <Button type="text" icon={<DollarOutlined />}>Revenue</Button>
                    <Button type="text" icon={<FileTextOutlined />}>Invoices</Button>
                  </div>
                </div>
              </Card>

              <Button className={styles.demoRequest} icon={<PlayCircleOutlined />}>
                Request Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Additional Content Section */}
      <section className={styles.additionalContent}>
        <div className={styles.contentContainer}>
          <Row gutter={[32, 32]}>
            <Col xs={24} md={12}>
              <Card className={styles.contentCard}>
                <div className={styles.cardIcon}>
                  <BarChartOutlined />
                </div>
                <Title level={3}>Advanced Analytics</Title>
                <Paragraph>
                  Get detailed insights into your business performance with our comprehensive analytics dashboard. 
                  Track revenue, monitor customer behavior, and make data-driven decisions.
                </Paragraph>
                <Button type="primary" icon={<ArrowRightOutlined />}>
                  Learn More
                </Button>
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card className={styles.contentCard}>
                <div className={styles.cardIcon}>
                  <TeamOutlined />
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

      {/* Footer Section */}
      <footer className={styles.landingFooter}>
        <div className={styles.footerContainer}>
          <Row gutter={[32, 32]}>
            <Col xs={24} md={8}>
              <div className={styles.footerBrand}>
                <div className={styles.brandIcon}>
                  <FileTextOutlined />
                </div>
                <Title level={4} style={{ color: '#1890ff', margin: 0 }}>
                  Subriva Billing
                </Title>
                <Paragraph style={{ color: 'white' }}>
                  Smart billing solutions for modern businesses. 
                  Streamline your invoicing process and grow your business.
                </Paragraph>
              </div>
            </Col>
            <Col xs={24} md={8}>
              <div className={styles.footerLinks}>
                <Title level={5}>Product</Title>
                <ul>
                  <li><a href="/features">Features</a></li>
                  <li><a href="/pricing">Pricing</a></li>
                  <li><a href="#">Integrations</a></li>
                  <li><a href="#">API</a></li>
                </ul>
              </div>
            </Col>
            <Col xs={24} md={8}>
              <div className={styles.footerLinks}>
                <Title level={5}>Support</Title>
                <ul>
                  <li><a href="#">Help Center</a></li>
                  <li><a href="#">Contact Us</a></li>
                  <li><a href="#">Documentation</a></li>
                  <li><a href="#">Status</a></li>
                </ul>
              </div>
            </Col>
          </Row>
          <Divider />
          <div className={styles.footerBottom}>
            <Text>© 2024 Subriva Billing. All rights reserved.</Text>
            <div className={styles.footerSocial}>
              <Button type="text" icon={<GlobalOutlined />} />
              <Button type="text" icon={<MailOutlined />} />
              <Button type="text" icon={<PhoneOutlined />} />
              <Button type="text" icon={<UserOutlined />} />
            </div>
          </div>
        </div>
      </footer>

      {/* Floating Help Button */}
      <div className={styles.floatingHelp}>
        <Button type="primary" shape="circle" icon={<PhoneOutlined />} size="large" />
      </div>
    </div>
  );
};

export default LandingPage;
