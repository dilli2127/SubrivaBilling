import React from 'react';
import { Modal, Button, Typography, Space, Divider } from 'antd';
import { 
  FileTextOutlined, 
  PlusOutlined, 
  CheckCircleOutlined,
  DollarOutlined,
  UserOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

interface BillSaveConfirmationModalProps {
  visible: boolean;
  onNewBill: () => void;
  onContinueBill: () => void;
  onCancel: () => void;
  savedBillData?: any;
}

const BillSaveConfirmationModal: React.FC<BillSaveConfirmationModalProps> = ({
  visible,
  onNewBill,
  onContinueBill,
  onCancel,
  savedBillData
}) => {
  return (
    <Modal
      title={
        <div style={{ textAlign: 'center' }}>
          <CheckCircleOutlined 
            style={{ 
              color: '#52c41a', 
              fontSize: '24px', 
              marginRight: '8px' 
            }} 
          />
          <span style={{ color: '#52c41a', fontWeight: 600 }}>
            Bill Saved Successfully!
          </span>
        </div>
      }
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={500}
      centered
      maskClosable={false}
      closable={false}
    >
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <Text type="secondary">
          Your bill has been saved successfully. What would you like to do next?
        </Text>
      </div>

      {savedBillData && (
        <div
          style={{
            background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
            border: '1px solid #0ea5e9',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '24px',
          }}
        >
          <Title level={5} style={{ marginBottom: '12px', color: '#0369a1' }}>
            📋 Bill Summary
          </Title>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileTextOutlined style={{ color: '#0ea5e9' }} />
              <Text strong>Invoice: {savedBillData.invoice_no}</Text>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <UserOutlined style={{ color: '#0ea5e9' }} />
              <Text strong>{savedBillData.customer_name || 'N/A'}</Text>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CalendarOutlined style={{ color: '#0ea5e9' }} />
              <Text strong>{dayjs(savedBillData.date).format('DD/MM/YYYY')}</Text>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <DollarOutlined style={{ color: '#0ea5e9' }} />
              <Text strong>₹{(typeof savedBillData.total_amount === 'number' ? savedBillData.total_amount : parseFloat(savedBillData.total_amount) || 0).toFixed(2)}</Text>
            </div>
          </div>
        </div>
      )}

      <Divider style={{ margin: '20px 0' }} />

      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <Button
          type="primary"
          size="large"
          icon={<PlusOutlined />}
          onClick={onNewBill}
          style={{
            width: '100%',
            height: '48px',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            border: 'none',
            fontWeight: 600,
            fontSize: '16px',
            borderRadius: '8px',
          }}
        >
          🆕 Create New Bill
        </Button>
        
        <Button
          size="large"
          icon={<FileTextOutlined />}
          onClick={onContinueBill}
          style={{
            width: '100%',
            height: '48px',
            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            color: 'white',
            border: 'none',
            fontWeight: 600,
            fontSize: '16px',
            borderRadius: '8px',
          }}
        >
          📝 Continue with Current Bill
        </Button>
      </Space>

      <div style={{ textAlign: 'center', marginTop: '16px' }}>
        <Text type="secondary" style={{ fontSize: '12px' }}>
          💡 Tip: Use "New Bill" to start fresh or "Continue Bill" to add more items
        </Text>
      </div>
    </Modal>
  );
};

export default BillSaveConfirmationModal;
