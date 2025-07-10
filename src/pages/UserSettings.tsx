import React, { useState } from 'react';
import { Card, Typography } from 'antd';
import BillTemplateSelector from './RetaillBill/BillTemplateSelector';
import { billingTemplates, BillingTemplateKey } from './RetaillBill/templates/registry';

const { Title } = Typography;

const UserSettings: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<BillingTemplateKey>(() => {
    return (localStorage.getItem('billingTemplate') as BillingTemplateKey) || 'classic';
  });

  const handleTemplateSelect = (key: BillingTemplateKey) => {
    setSelectedTemplate(key);
    localStorage.setItem('billingTemplate', key);
  };

  return (
    <div style={{ maxWidth: 700, margin: '40px auto', padding: 24 }}>
      <Card>
        <Title level={3}>User Settings</Title>
        <div style={{ margin: '32px 0 16px 0' }}>
          <h4>Choose Your Default Invoice Template</h4>
          <BillTemplateSelector selected={selectedTemplate} onSelect={handleTemplateSelect} />
        </div>
        <div style={{ marginTop: 24, color: '#888' }}>
          Your selection will be used for all new invoices/bills.
        </div>
      </Card>
    </div>
  );
};

export default UserSettings; 