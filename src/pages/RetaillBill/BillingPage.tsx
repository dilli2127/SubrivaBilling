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
      padding: 24, 
      minHeight: '100vh',
      background: '#f5f5f5' 
    }}>
      <div style={{ 
        maxWidth: 1400, 
        margin: '0 auto',
        background: '#fff',
        borderRadius: 8,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <BillDataGrid onSuccess={handleSuccess} />
      </div>

      <div style={{ 
        textAlign: 'center', 
        marginTop: 16, 
        fontSize: 12, 
        color: '#666' 
      }}>
        <strong>💡 Tips:</strong> Use Tab to navigate, Enter to edit, Ctrl+S to save, Ctrl+N to add items
      </div>
    </div>
  );
};

export default BillingPage; 