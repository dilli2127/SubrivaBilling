import { FC } from 'react';
import { Provider } from 'react-redux';
import AppRouter from './routes/appRouter';
import './index.css'; 
import { store } from './services/redux';
import ErrorBoundary from './components/common/ErrorBoundary';

const App: FC = () =>
{
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <AppRouter />
      </Provider>
    </ErrorBoundary>
  );
}

export default App;
