import React from 'react';
import { Button, Typography } from 'antd';
import { 
  ArrowLeftOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './LandingPageHeader.module.css';

const { Title } = Typography;

interface LandingPageHeaderProps {
  currentPage?: 'home' | 'features' | 'pricing' | 'customers' | 'contact';
  showBackButton?: boolean;
}

const LandingPageHeader: React.FC<LandingPageHeaderProps> = ({ 
  currentPage = 'home',
  showBackButton = false 
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Determine current page from location if not provided
  const getCurrentPage = () => {
    if (currentPage !== 'home') return currentPage;
    
    const path = location.pathname;
    if (path === '/features') return 'features';
    if (path === '/pricing') return 'pricing';
    if (path === '/customers') return 'customers';
    if (path === '/contact') return 'contact';
    return 'home';
  };

  const activePage = getCurrentPage();

  const navItems = [
    { key: 'features', label: 'Features', path: '/features' },
    { key: 'pricing', label: 'Pricing', path: '/pricing' },
    { key: 'customers', label: 'Customers', path: '/customers' },
    { key: 'contact', label: 'Contact', path: '/contact' }
  ];

  return (
    <nav className={styles.landingHeader}>
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
          {showBackButton && (
            <Button 
              type="text" 
              className={styles.navItem}
              onClick={() => navigate('/')}
              data-nav="back"
              tabIndex={0}
            >
              <ArrowLeftOutlined /> Back to Home
            </Button>
          )}
          
          {navItems.map((item) => (
            <Button 
              key={item.key}
              type="text" 
              className={`${styles.navItem} ${activePage === item.key ? styles.active : ''}`}
              onClick={() => navigate(item.path)}
              data-nav={item.key}
              tabIndex={0}
            >
              {item.label}
            </Button>
          ))}
          
          <Button 
            type="primary" 
            size="large"
            onClick={() => navigate('/billing_login')}
            className={styles.loginBtn}
            data-nav="login"
            tabIndex={0}
          >
            Login
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default LandingPageHeader;
