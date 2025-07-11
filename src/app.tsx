import { FC } from 'react';
import { Provider } from 'react-redux';
import AppRouter from './routes/appRouter';
import './index.css'; 
import { store } from './services/redux';
import ErrorBoundary from './components/common/ErrorBoundary';
import { AccessibilityProvider } from './components/common/AccessibilityProvider';
import PerformanceMonitor from './components/common/PerformanceMonitor';
import { UserProvider } from './components/antd/UserContext';

const App: FC = () =>
{
  const handlePerformanceMetrics = (metrics: any) => {
    // Log performance metrics
    // if (process.env.NODE_ENV === 'development') {
    //   console.log('Performance Metrics:', metrics);
    // }
    
    // You can send metrics to external service here
    // sendMetricsToService(metrics);
  };

  return (
    <ErrorBoundary>
      <AccessibilityProvider>
        <Provider store={store}>
          <UserProvider>
            <PerformanceMonitor 
              onMetricsUpdate={handlePerformanceMetrics}
              enableErrorTracking={true}
              enablePerformanceTracking={true}
            />
            <AppRouter />
          </UserProvider>
        </Provider>
      </AccessibilityProvider>
    </ErrorBoundary>
  );
}

export default App;
