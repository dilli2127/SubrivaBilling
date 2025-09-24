import React from 'react';
import { getEnvironment } from '../../helpers/environment';
import ElectronLandingPage from './ElectronLandingPage';
import WebLandingPage from './WebLandingPage';

const LandingPage: React.FC = () => {
  const environment = getEnvironment();

  // Render the appropriate landing page based on environment
  if (environment === 'electron') {
    return <ElectronLandingPage />;
  }

  return <WebLandingPage />;
};

export default LandingPage;
