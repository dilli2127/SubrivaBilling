import React, { useEffect, useRef, useCallback } from 'react';
import { Modal, Button, Typography, Space, Divider, Badge } from 'antd';
import { 
  FileTextOutlined, 
  PlusOutlined, 
  CheckCircleOutlined,
  DollarOutlined,
  UserOutlined,
  CalendarOutlined,
  EnterOutlined,
  CloseOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

interface BillSaveConfirmationModalProps {
  visible: boolean;
  onNewBill: () => void;
  onContinueBill: () => void;
  onCancel: () => void;
  savedBillData?: any;
  onOpenProductModal?: () => void; // Callback to open product selection
}

const BillSaveConfirmationModal: React.FC<BillSaveConfirmationModalProps> = ({
  visible,
  onNewBill,
  onContinueBill,
  onCancel,
  savedBillData,
  onOpenProductModal
}) => {
  const newBillButtonRef = useRef<HTMLButtonElement>(null);

  // Handle new bill with auto-open product modal
  const handleNewBill = useCallback(() => {
    onNewBill();
    // Open product selection modal after a short delay to allow form reset
    if (onOpenProductModal) {
      setTimeout(() => {
        onOpenProductModal();
      }, 100);
    }
  }, [onNewBill, onOpenProductModal]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!visible) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Enter = New Bill (primary action)
      if (e.key === 'Enter' && !e.ctrlKey) {
        e.preventDefault();
        handleNewBill();
      }
      // Ctrl+Enter = Continue Bill
      else if (e.key === 'Enter' && e.ctrlKey) {
        e.preventDefault();
        onContinueBill();
      }
      // Escape = Close
      else if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    
    // Auto-focus on the primary button
    if (newBillButtonRef.current) {
      newBillButtonRef.current.focus();
    }

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [visible, handleNewBill, onContinueBill, onCancel]);

  return (
    <Modal
      title={null}
      open={visible}
      onCancel={onCancel}
      footer={null}
      width={540}
      centered
      maskClosable={false}
      closable={false}
      bodyStyle={{ padding: '24px 20px' }}
    >
      {/* Success Header with Animation */}
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <div 
          style={{ 
            display: 'inline-block',
            animation: 'successPulse 0.6s ease-out',
            marginBottom: '12px'
          }}
        >
          <CheckCircleOutlined 
            style={{ 
              color: '#10b981', 
              fontSize: '48px',
              filter: 'drop-shadow(0 4px 12px rgba(16, 185, 129, 0.3))'
            }} 
          />
        </div>
        <Title level={4} style={{ margin: '6px 0', color: '#10b981', fontWeight: 700 }}>
          Bill Saved Successfully!
        </Title>
        <Text type="secondary" style={{ fontSize: '13px' }}>
          Choose your next action using keyboard shortcuts
        </Text>
      </div>

      {/* Bill Summary Card */}
      {savedBillData && (
        <div
          style={{
            background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
            border: '2px solid #10b981',
            borderRadius: '10px',
            padding: '14px',
            marginBottom: '20px',
            boxShadow: '0 4px 16px rgba(16, 185, 129, 0.1)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
            <FileTextOutlined style={{ fontSize: '16px', color: '#059669', marginRight: '6px' }} />
            <Title level={5} style={{ margin: 0, color: '#059669', fontSize: '14px' }}>
              Bill Summary
            </Title>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              padding: '6px 10px',
              background: 'rgba(255, 255, 255, 0.7)',
              borderRadius: '6px'
            }}>
              <FileTextOutlined style={{ color: '#10b981', fontSize: '14px' }} />
              <div>
                <Text type="secondary" style={{ fontSize: '10px', display: 'block' }}>Invoice</Text>
                <Text strong style={{ fontSize: '12px' }}>{savedBillData.invoice_no}</Text>
              </div>
            </div>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              padding: '6px 10px',
              background: 'rgba(255, 255, 255, 0.7)',
              borderRadius: '6px'
            }}>
              <UserOutlined style={{ color: '#10b981', fontSize: '14px' }} />
              <div>
                <Text type="secondary" style={{ fontSize: '10px', display: 'block' }}>Customer</Text>
                <Text strong style={{ fontSize: '12px' }}>{savedBillData.customer_name || 'N/A'}</Text>
              </div>
            </div>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              padding: '6px 10px',
              background: 'rgba(255, 255, 255, 0.7)',
              borderRadius: '6px'
            }}>
              <CalendarOutlined style={{ color: '#10b981', fontSize: '14px' }} />
              <div>
                <Text type="secondary" style={{ fontSize: '10px', display: 'block' }}>Date</Text>
                <Text strong style={{ fontSize: '12px' }}>{dayjs(savedBillData.date).format('DD/MM/YYYY')}</Text>
              </div>
            </div>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px',
              padding: '6px 10px',
              background: 'rgba(255, 255, 255, 0.7)',
              borderRadius: '6px'
            }}>
              <DollarOutlined style={{ color: '#10b981', fontSize: '14px' }} />
              <div>
                <Text type="secondary" style={{ fontSize: '10px', display: 'block' }}>Amount</Text>
                <Text strong style={{ fontSize: '12px', color: '#059669' }}>
                  ₹{(typeof savedBillData.total_amount === 'number' ? savedBillData.total_amount : parseFloat(savedBillData.total_amount) || 0).toFixed(2)}
                </Text>
              </div>
            </div>
          </div>
        </div>
      )}

      <Divider style={{ margin: '18px 0', borderColor: '#e5e7eb' }} />

      {/* Action Buttons with Keyboard Hints */}
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <Button
          ref={newBillButtonRef}
          type="primary"
          size="large"
          icon={<PlusOutlined />}
          onClick={handleNewBill}
          style={{
            width: '100%',
            height: '48px',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            border: 'none',
            fontWeight: 600,
            fontSize: '15px',
            borderRadius: '8px',
            boxShadow: '0 4px 16px rgba(16, 185, 129, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 16px rgba(16, 185, 129, 0.3)';
          }}
        >
          <span style={{ flex: 1, textAlign: 'left', marginLeft: '8px' }}>
            🆕 Create New Bill
          </span>
          <Badge 
            count={<span style={{ 
              background: 'rgba(255, 255, 255, 0.3)',
              padding: '3px 8px',
              borderRadius: '5px',
              fontSize: '11px',
              fontWeight: 600,
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              gap: '3px'
            }}>
              <EnterOutlined /> Enter
            </span>} 
            style={{ marginRight: '6px' }}
          />
        </Button>
        
        <Button
          size="large"
          icon={<FileTextOutlined />}
          onClick={onContinueBill}
          style={{
            width: '100%',
            height: '48px',
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            color: 'white',
            border: 'none',
            fontWeight: 600,
            fontSize: '15px',
            borderRadius: '8px',
            boxShadow: '0 4px 16px rgba(59, 130, 246, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 16px rgba(59, 130, 246, 0.3)';
          }}
        >
          <span style={{ flex: 1, textAlign: 'left', marginLeft: '8px' }}>
            📝 Continue with Current Bill
          </span>
          <Badge 
            count={<span style={{ 
              background: 'rgba(255, 255, 255, 0.3)',
              padding: '3px 8px',
              borderRadius: '5px',
              fontSize: '11px',
              fontWeight: 600,
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              gap: '3px'
            }}>
              Ctrl+<EnterOutlined />
            </span>} 
            style={{ marginRight: '6px' }}
          />
        </Button>

        {/* Close Button */}
        <Button
          size="middle"
          icon={<CloseOutlined />}
          onClick={onCancel}
          type="text"
          style={{
            width: '100%',
            height: '36px',
            fontWeight: 500,
            fontSize: '13px',
            color: '#6b7280',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = '#374151';
            e.currentTarget.style.background = '#f3f4f6';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = '#6b7280';
            e.currentTarget.style.background = 'transparent';
          }}
        >
          Close (ESC)
        </Button>
      </Space>

      {/* Keyboard Shortcuts Info */}
      <div style={{ 
        marginTop: '16px',
        padding: '10px 12px',
        background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
        borderRadius: '6px',
        border: '1px solid #fbbf24'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '14px' }}>⌨️</span>
          <div style={{ flex: 1 }}>
            <Text style={{ fontSize: '11px', color: '#78350f', lineHeight: '1.5' }}>
              <strong>Enter</strong> = New Bill • <strong>Ctrl+Enter</strong> = Continue • <strong>ESC</strong> = Close
            </Text>
          </div>
        </div>
      </div>

      {/* CSS Animation */}
      <style>{`
        @keyframes successPulse {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </Modal>
  );
};

export default BillSaveConfirmationModal;
