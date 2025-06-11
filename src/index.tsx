import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './app';
import '@ant-design/v5-patch-for-react-19';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  // <React.StrictMode>
    <App />
  // </React.StrictMode>
);

reportWebVitals();
