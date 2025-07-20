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

      <div style={{ 
        position: 'fixed',
        bottom: 10,
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'rgba(0,0,0,0.8)',
        color: 'white',
        padding: '8px 16px',
        borderRadius: 20,
        fontSize: 11,
        zIndex: 1000,
        backdropFilter: 'blur(10px)'
      }}>
        <strong>💡 Tips:</strong> Tab(Navigate) • Enter(Edit) • F2(Save) • F1(Add) • Del(Remove)
      </div>
    </div>
  );
};

export default BillingPage; 