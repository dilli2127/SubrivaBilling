import React from 'react';
import { Typography } from 'antd';
import BillDataGrid from './components/BillDataGrid';
import { useNavigate } from 'react-router-dom';
import './BillingPage.css';

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
        <BillDataGrid onSuccess={handleSuccess} />
      </div>
    </div>
  );
};

export default BillingPage; 