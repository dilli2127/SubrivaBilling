import React, { Suspense, lazy } from 'react';
import { Typography, Spin } from 'antd';
import { useNavigate } from 'react-router-dom';
import './BillingPage.css';

// Lazy load the RTK Query BillDataGrid component
const BillDataGrid = lazy(() => import('./components/BillDataGridRTK'));

const { Title } = Typography;

const BillingPage: React.FC = () => {
  const navigate = useNavigate();

  const handleSuccess = (formattedBill?: any) => {
    if (formattedBill) {
      // Bill created successfully, could redirect to bill list or show success
      navigate('/retaill_bill_list');
    }
  };

  return (
    <div className="billing-page">
      <div className="billing-page-content">
        <Suspense fallback={
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
            <Spin size="large" tip="Loading billing interface..." />
          </div>
        }>
          <BillDataGrid onSuccess={handleSuccess} />
        </Suspense>
      </div>
    </div>
  );
};

export default BillingPage; 