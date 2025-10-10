import React, { useState, useEffect } from 'react';
import { Button, Drawer, Menu } from 'antd';
import { MenuOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import styles from './LandingPageHeader.module.css';

interface LandingPageHeaderProps {
  title?: string;
  logoUrl?: string;
  logoAlt?: string;
  currentPage?: 'home' | 'features' | 'pricing' | 'customers' | 'contact';
  showBackButton?: boolean;
}

const LandingPageHeader: React.FC<LandingPageHeaderProps> = ({
  title = "Subriva Billing",
  logoUrl = "https://freshfocuzstudio.s3.ap-south-1.amazonaws.com/ffs+logo.png",
  logoAlt = "Subriva Billing",
  currentPage = 'home',
  showBackButton = false
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();

  // Check if mobile screen
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const menuItems = [
    { key: 'features', label: 'Features', path: '/features' },
    { key: 'pricing', label: 'Pricing', path: '/pricing' },
    { key: 'customers', label: 'Customers', path: '/customers' },
    { key: 'contact', label: 'Contact', path: '/contact' },
    { key: 'login', label: 'Login', path: '/billing_login' }
  ];

  return (
    <>
      {/* Universal Navigation Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.leftSection}>
            {showBackButton && (
              <Button
                type="text"
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate(-1)}
                className={styles.backButton}
                style={{
                  color: 'grey',
                  border: 'none',
                  background: 'transparent',
                  padding: '8px',
                  marginRight: '12px'
                }}
              />
            )}
            <Link to="/" className={styles.logo}>
              <img 
                src={logoUrl}
                alt={logoAlt}
                className={styles.logoImage}
              />
              <div className={styles.brandText}>
                <span className={styles.brandName}>Subriva</span>
                <span className={styles.brandSuffix}> Billing</span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Menu */}
          {!isMobile && (
            <nav className={styles.desktopNav}>
              <div className={styles.navLinks}>
                <Link 
                  to="/features" 
                  className={`${styles.navLink} ${currentPage === 'features' ? styles.active : ''}`}
                >
                  Features
                </Link>
                <Link 
                  to="/pricing" 
                  className={`${styles.navLink} ${currentPage === 'pricing' ? styles.active : ''}`}
                >
                  Pricing
                </Link>
                <Link 
                  to="/customers" 
                  className={`${styles.navLink} ${currentPage === 'customers' ? styles.active : ''}`}
                >
                  Customers
                </Link>
                <Link 
                  to="/contact" 
                  className={`${styles.navLink} ${currentPage === 'contact' ? styles.active : ''}`}
                >
                  Contact
                </Link>
              </div>
              <Link to="/billing_login" className={styles.loginButton}>
                Login
              </Link>
            </nav>
          )}

          {/* Mobile Menu Button */}
          {isMobile && (
            <Button
              type="text"
              icon={<MenuOutlined />}
              onClick={() => setMobileMenuOpen(true)}
              className={styles.mobileMenuButton}
            />
          )}
        </div>
        
        {/* Mobile Navigation Drawer */}
        {isMobile && (
          <Drawer
            title={
              <span style={{ fontSize: '16px', fontWeight: '600', color: '#2d3748' }}>
                Navigation
              </span>
            }
            placement="right"
            onClose={() => setMobileMenuOpen(false)}
            open={mobileMenuOpen}
            width={280}
            headerStyle={{
              background: 'white',
              borderBottom: '1px solid #e2e8f0',
            }}
            bodyStyle={{
              background: 'white',
              padding: '20px 0',
            }}
          >
            <div className={styles.mobileMenuItems}>
              {menuItems.map((item) => (
                <Link 
                  key={item.key}
                  to={item.path} 
                  className={`${styles.mobileMenuItem} ${currentPage === item.key ? styles.active : ''}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </Drawer>
        )}
      </div>
    </>
  );
};

export default LandingPageHeader;