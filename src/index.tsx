import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './app';

// ✅ Required to support Ant Design v5 with React 19
import '@ant-design/v5-patch-for-react-19';

import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root')!);

root.render(
  // <React.StrictMode>
    <App />
  // </React.StrictMode>
);

// ✅ Logs performance (optional)
reportWebVitals();
