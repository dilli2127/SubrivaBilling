import React from 'react';
import { Button, Typography, Row, Col, Divider, Space, Input, Badge, Tooltip } from 'antd';
import { 
  FileTextOutlined,
  PhoneOutlined,
  MailOutlined,
  GlobalOutlined,
  UserOutlined,
  ArrowRightOutlined,
  CheckCircleOutlined,
  StarOutlined,
  ThunderboltOutlined,
  SafetyOutlined,
  HeartOutlined,
  MessageOutlined,
  SendOutlined,
  DownloadOutlined,
  PlayCircleOutlined,
  GithubOutlined,
  LinkedinOutlined,
  TwitterOutlined,
  FacebookOutlined,
  InstagramOutlined,
  YoutubeOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import styles from './LandingPageFooter.module.css';

const { Title, Paragraph, Text } = Typography;

const LandingPageFooter: React.FC = () => {
  const navigate = useNavigate();

  const footerLinks = {
    product: [
      { label: 'Features', href: '/features' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'Integrations', href: '#' },
      { label: 'API Documentation', href: '#' },
      { label: 'Changelog', href: '#' },
      { label: 'Roadmap', href: '#' }
    ],
    company: [
      { label: 'About Us', href: '#' },
      { label: 'Careers', href: '#' },
      { label: 'Press Kit', href: '#' },
      { label: 'Partners', href: '#' },
      { label: 'Blog', href: '#' },
      { label: 'News', href: '#' }
    ],
    support: [
      { label: 'Help Center', href: '#' },
      { label: 'Contact Us', href: '#' },
      { label: 'Documentation', href: '#' },
      { label: 'Status Page', href: '#' },
      { label: 'Community', href: '#' },
      { label: 'Tutorials', href: '#' }
    ],
    legal: [
      { label: 'Privacy Policy', href: '#' },
      { label: 'Terms of Service', href: '#' },
      { label: 'Cookie Policy', href: '#' },
      { label: 'GDPR', href: '#' },
      { label: 'Security', href: '#' },
      { label: 'Compliance', href: '#' }
    ]
  };

  const socialLinks = [
    { icon: <GithubOutlined />, href: '#', label: 'GitHub' },
    { icon: <LinkedinOutlined />, href: '#', label: 'LinkedIn' },
    { icon: <TwitterOutlined />, href: '#', label: 'Twitter' },
    { icon: <FacebookOutlined />, href: '#', label: 'Facebook' },
    { icon: <InstagramOutlined />, href: '#', label: 'Instagram' },
    { icon: <YoutubeOutlined />, href: '#', label: 'YouTube' }
  ];

  const features = [
    { icon: <CheckCircleOutlined />, text: '99.9% Uptime SLA' },
    { icon: <SafetyOutlined />, text: 'Bank-grade Security' },
    { icon: <ThunderboltOutlined />, text: 'Lightning Fast' },
    { icon: <HeartOutlined />, text: '24/7 Support' }
  ];

  return (
    <footer className={styles.landingFooter}>
      {/* Newsletter Section */}
      <div className={styles.newsletterSection}>
        <div className={styles.newsletterContainer}>
          <div className={styles.newsletterContent}>
            <div className={styles.newsletterText}>
              <Title level={2} className={styles.newsletterTitle}>
                Stay Updated with Subriva Billing
              </Title>
              <Paragraph className={styles.newsletterSubtitle}>
                Get the latest updates, tips, and exclusive offers delivered to your inbox.
              </Paragraph>
            </div>
            <div className={styles.newsletterForm}>
              <div className={styles.newsletterInputGroup}>
                <Input 
                  placeholder="Enter your email address" 
                  size="large"
                  className={styles.newsletterInput}
                />
                <Button 
                  type="primary" 
                  size="large"
                  icon={<SendOutlined />}
                  className={styles.newsletterButton}
                >
                  Subscribe
                </Button>
              </div>
              <Text className={styles.newsletterNote}>
                Join 10,000+ subscribers. Unsubscribe anytime.
              </Text>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className={styles.footerMain}>
        <div className={styles.footerContainer}>
          <Row gutter={[48, 48]}>
            {/* Brand Section */}
            <Col xs={24} lg={6}>
              <div className={styles.footerBrand}>
                <div className={styles.brandSection}>
                  <div className={styles.brandIcon}>
                    <FileTextOutlined />
                  </div>
                  <Title level={3} className={styles.brandTitle}>
                    Subriva Billing
                  </Title>
                </div>
                <Paragraph className={styles.brandDescription}>
                  The most powerful and intuitive billing platform for modern businesses. 
                  Streamline your invoicing process and accelerate your growth.
                </Paragraph>
                
                {/* Trust Indicators */}
                <div className={styles.trustIndicators}>
                  {features.map((feature, index) => (
                    <div key={index} className={styles.trustItem}>
                      <div className={styles.trustIcon}>
                        {feature.icon}
                      </div>
                      <Text className={styles.trustText}>{feature.text}</Text>
                    </div>
                  ))}
                </div>

                {/* Social Links */}
                <div className={styles.socialSection}>
                  <Text className={styles.socialTitle}>Follow Us</Text>
                  <div className={styles.socialLinks}>
                    {socialLinks.map((social, index) => (
                      <Tooltip key={index} title={social.label}>
                        <Button 
                          type="text" 
                          icon={social.icon}
                          className={styles.socialButton}
                          href={social.href}
                        />
                      </Tooltip>
                    ))}
                  </div>
                </div>
              </div>
            </Col>

            {/* Product Links */}
            <Col xs={12} sm={6} lg={4}>
              <div className={styles.footerColumn}>
                <Title level={5} className={styles.columnTitle}>Product</Title>
                <ul className={styles.footerLinks}>
                  {footerLinks.product.map((link, index) => (
                    <li key={index}>
                      <a href={link.href} className={styles.footerLink}>
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </Col>

            {/* Company Links */}
            <Col xs={12} sm={6} lg={4}>
              <div className={styles.footerColumn}>
                <Title level={5} className={styles.columnTitle}>Company</Title>
                <ul className={styles.footerLinks}>
                  {footerLinks.company.map((link, index) => (
                    <li key={index}>
                      <a href={link.href} className={styles.footerLink}>
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </Col>

            {/* Support Links */}
            <Col xs={12} sm={6} lg={4}>
              <div className={styles.footerColumn}>
                <Title level={5} className={styles.columnTitle}>Support</Title>
                <ul className={styles.footerLinks}>
                  {footerLinks.support.map((link, index) => (
                    <li key={index}>
                      <a href={link.href} className={styles.footerLink}>
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </Col>

            {/* Legal Links */}
            <Col xs={12} sm={6} lg={4}>
              <div className={styles.footerColumn}>
                <Title level={5} className={styles.columnTitle}>Legal</Title>
                <ul className={styles.footerLinks}>
                  {footerLinks.legal.map((link, index) => (
                    <li key={index}>
                      <a href={link.href} className={styles.footerLink}>
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </Col>
          </Row>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className={styles.footerBottom}>
        <div className={styles.footerContainer}>
          <div className={styles.bottomContent}>
            <div className={styles.copyright}>
              <Text className={styles.copyrightText}>
                © 2024 Subriva Billing. All rights reserved.
              </Text>
              <div className={styles.copyrightBadges}>
                <Badge 
                  count="SOC 2" 
                  style={{ backgroundColor: '#52c41a' }}
                  className={styles.complianceBadge}
                />
                <Badge 
                  count="GDPR" 
                  style={{ backgroundColor: '#1890ff' }}
                  className={styles.complianceBadge}
                />
                <Badge 
                  count="ISO 27001" 
                  style={{ backgroundColor: '#722ed1' }}
                  className={styles.complianceBadge}
                />
              </div>
            </div>
            
            <div className={styles.bottomActions}>
              <Button 
                type="text" 
                icon={<DownloadOutlined />}
                className={styles.actionButton}
              >
                Download App
              </Button>
              <Button 
                type="text" 
                icon={<PlayCircleOutlined />}
                className={styles.actionButton}
              >
                Watch Demo
              </Button>
              <Button 
                type="primary" 
                size="small"
                onClick={() => navigate('/billing_login')}
                className={styles.loginButton}
              >
                Get Started
                <ArrowRightOutlined />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Help Button */}
      <div className={styles.floatingHelp}>
        <Tooltip title="Need Help? Contact Support">
          <Button 
            type="primary" 
            shape="circle" 
            icon={<MessageOutlined />} 
            size="large"
            className={styles.helpButton}
          />
        </Tooltip>
      </div>
    </footer>
  );
};

export default LandingPageFooter;
