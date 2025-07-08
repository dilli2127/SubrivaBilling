import { FC } from 'react';
import { Provider } from 'react-redux';
import AppRouter from './routes/appRouter';
import './index.css';
import { store } from './services/redux';

const App: FC = () => {
  return (
    <Provider store={store}>
      <AppRouter />
    </Provider>
  );
}

export default App;
