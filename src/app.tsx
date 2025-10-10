import { FC } from 'react';
import { Provider } from 'react-redux';
import AppRouter from './routes/appRouter';
import './index.css'; 
import { store } from './services/redux';
import ErrorBoundary from './components/common/ErrorBoundary';
import { AccessibilityProvider } from './components/common/AccessibilityProvider';
import PerformanceMonitor from './components/common/PerformanceMonitor';
import { UserProvider } from './components/antd/UserContext';
import { BarcodeShortcutProvider } from './components/common/BarcodeShortcutProvider';

const App: FC = () =>
{
  const handlePerformanceMetrics = (metrics: any) => {
    // Log performance metrics
    // if (process.env.NODE_ENV === 'development') {

    // }
    
    // You can send metrics to external service here
    // sendMetricsToService(metrics);
  };

  return (
    <ErrorBoundary>
      <AccessibilityProvider>
        <Provider store={store}>
          <BarcodeShortcutProvider>
            <UserProvider>
              <PerformanceMonitor 
                onMetricsUpdate={handlePerformanceMetrics}
                enableErrorTracking={true}
                enablePerformanceTracking={true}
              />
              <AppRouter />
            </UserProvider>
          </BarcodeShortcutProvider>
        </Provider>
      </AccessibilityProvider>
    </ErrorBoundary>
  );
}

export default App;
