import React from 'react';
import { Typography } from 'antd';
import BillDataGrid from './components/BillDataGrid';
import { useNavigate } from 'react-router-dom';

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
    <div style={{ 
      padding: 0, 
      minHeight: '100vh',
      background: '#f5f5f5',
      width: '100%'
    }}>
      <div style={{ 
        width: '100%',
        background: '#fff',
        minHeight: '100vh'
      }}>
        <BillDataGrid onSuccess={handleSuccess} />
      </div>


    </div>
  );
};

export default BillingPage; 