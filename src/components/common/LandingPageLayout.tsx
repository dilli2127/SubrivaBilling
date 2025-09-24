import React from 'react';
import { useLocation } from 'react-router-dom';
import LandingPageHeader from './LandingPageHeader';
import styles from './LandingPageLayout.module.css';

interface LandingPageLayoutProps {
  children: React.ReactNode;
}

const LandingPageLayout: React.FC<LandingPageLayoutProps> = ({ children }) => {
  const location = useLocation();

  // Determine current page and show back button
  const getPageInfo = () => {
    const path = location.pathname;
    
    if (path === '/') {
      return { currentPage: 'home' as const, showBackButton: false };
    } else if (path === '/features') {
      return { currentPage: 'features' as const, showBackButton: true };
    } else if (path === '/pricing') {
      return { currentPage: 'pricing' as const, showBackButton: true };
    } else if (path === '/customers') {
      return { currentPage: 'customers' as const, showBackButton: true };
    }
    
    return { currentPage: 'home' as const, showBackButton: false };
  };

  const { currentPage, showBackButton } = getPageInfo();

  return (
    <div className={styles.landingLayout}>
      <LandingPageHeader 
        currentPage={currentPage} 
        showBackButton={showBackButton} 
      />
      <main className={styles.landingContent}>
        {children}
      </main>
    </div>
  );
};

export default LandingPageLayout;
