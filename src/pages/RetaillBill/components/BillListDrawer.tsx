import React, { useState, useEffect, useMemo } from 'react';
import { 
  Drawer, 
  List, 
  Typography, 
  Button, 
  Input, 
  Space, 
  Tag, 
  Avatar, 
  Badge,
  Tooltip,
  Divider,
  Empty,
  Spin,
  Tabs
} from 'antd';
import { 
  SearchOutlined, 
  FileTextOutlined, 
  UserOutlined, 
  CalendarOutlined,
  DollarOutlined,
  EyeOutlined,
  PrinterOutlined,
  PlusOutlined,
  CloseOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { apiSlice } from '../../../services/redux/api/apiSlice';

const { Title, Text } = Typography;
const { Search } = Input;

interface BillListDrawerProps {
  visible: boolean;
  onClose: () => void;
  onViewBill: (bill: any) => void;
  onNewBill: () => void;
}

const BillListDrawer: React.FC<BillListDrawerProps> = ({
  visible,
  onClose,
  onViewBill,
  onNewBill
}) => {
  // Use RTK Query for sales records
  const { data: billListData, isLoading: loading } = apiSlice.useGetSalesRecordQuery({});
  
  // Memoize billList to prevent infinite re-renders
  const billList = useMemo(() => {
    return (billListData as any)?.result || [];
  }, [billListData]);

  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<string>('drafts');

  // Filter bills based on status and search term
  const filteredBills = useMemo(() => {
    if (!billList || !Array.isArray(billList)) return [];
    
    // First filter by status
    let statusFiltered = billList;
    if (activeTab === 'drafts') {
      statusFiltered = billList.filter((bill: any) => bill.status === 'draft');
    } else {
      statusFiltered = billList.filter((bill: any) => 
        !bill.status || bill.status === 'completed'
      );
    }
    
    // Then filter by search term
    if (!searchTerm) return statusFiltered;
    
    const searchLower = searchTerm.toLowerCase();
    return statusFiltered.filter((bill: any) => {
      const invoiceNo = bill.invoice_no || '';
      const customerName = bill.customerDetails?.full_name || '';
      const date = bill.date || '';
      const totalAmount = typeof bill.total_amount === 'number' ? bill.total_amount.toString() : String(bill.total_amount || '');
      
      return (
        invoiceNo.toLowerCase().includes(searchLower) ||
        customerName.toLowerCase().includes(searchLower) ||
        date.includes(searchTerm) ||
        totalAmount.includes(searchTerm)
      );
    });
  }, [billList, searchTerm, activeTab]);

  const getPaymentStatusColor = (isPaid: boolean, isPartiallyPaid: boolean) => {
    if (isPaid && !isPartiallyPaid) return 'success';
    if (isPartiallyPaid) return 'warning';
    return 'error';
  };

  const getPaymentStatusText = (isPaid: boolean, isPartiallyPaid: boolean) => {
    if (isPaid && !isPartiallyPaid) return 'Paid';
    if (isPartiallyPaid) return 'Partial';
    return 'Unpaid';
  };

  const handleViewBill = (bill: any) => {

    onViewBill(bill);
    onClose();
  };

  const handleNewBill = () => {
    onNewBill();
    onClose();
  };

  return (
    <Drawer
      title={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Title level={4} style={{ margin: 0, color: '#1f2937' }}>
            📋 Bill List
          </Title>
          <Button
            type="text"
            icon={<CloseOutlined />}
            onClick={onClose}
            size="small"
          />
        </div>
      }
      placement="left"
      open={visible}
      onClose={onClose}
      width={400}
      bodyStyle={{ padding: '16px' }}
      headerStyle={{ 
        borderBottom: '1px solid #e5e7eb',
        padding: '16px 16px 12px 16px'
      }}
    >
      {/* Search and New Bill Section */}
      <div style={{ marginBottom: '16px' }}>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Search
            placeholder="Search bills by invoice, customer, date..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            prefix={<SearchOutlined />}
            allowClear
            size="large"
          />
          
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleNewBill}
            style={{
              width: '100%',
              height: '40px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              border: 'none',
              fontWeight: 600,
              borderRadius: '8px',
            }}
          >
            🆕 Create New Bill
          </Button>
        </Space>
      </div>

      <Divider style={{ margin: '16px 0' }} />

      {/* Tabs for Drafts and Completed */}
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: 'drafts',
            label: (
              <span>
                📝 Drafts ({billList?.filter((b: any) => b.status === 'draft').length || 0})
              </span>
            ),
          },
          {
            key: 'completed',
            label: (
              <span>
                ✅ Completed ({billList?.filter((b: any) => !b.status || b.status === 'completed').length || 0})
              </span>
            ),
          },
        ]}
        style={{ marginBottom: 16 }}
      />

      {/* Bill List */}
      <div style={{ height: 'calc(100vh - 250px)', overflow: 'auto' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Spin size="large" />
            <div style={{ marginTop: '16px' }}>
              <Text type="secondary">Loading bills...</Text>
            </div>
          </div>
        ) : filteredBills.length === 0 ? (
          <Empty
            description={
              <div>
                <Text type="secondary">
                  {searchTerm ? 'No bills found matching your search.' : 'No bills available.'}
                </Text>
                {!searchTerm && (
                  <div style={{ marginTop: '8px' }}>
                    <Button type="link" onClick={handleNewBill}>
                      Create your first bill
                    </Button>
                  </div>
                )}
              </div>
            }
            style={{ marginTop: '40px' }}
          />
        ) : (
          <List
            dataSource={filteredBills}
            renderItem={(bill) => (
              <List.Item
                style={{
                  padding: '16px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  marginBottom: '12px',
                  background: 'white',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
                onClick={() => handleViewBill(bill)}
              >
                <div style={{ width: '100%' }}>
                  {/* Header with Invoice and Status */}
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    marginBottom: '8px'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Avatar 
                        icon={<FileTextOutlined />} 
                        style={{ 
                          background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                          color: 'white'
                        }} 
                      />
                      <Text strong style={{ fontSize: '14px' }}>
                        {bill.invoice_no}
                      </Text>
                    </div>
                    <Space>
                      {bill.status === 'draft' ? (
                        <Tag color="orange">DRAFT</Tag>
                      ) : (
                        <Tag color="green">COMPLETED</Tag>
                      )}
                      <Tag color={getPaymentStatusColor(bill.is_paid, bill.is_partially_paid)}>
                        {getPaymentStatusText(bill.is_paid, bill.is_partially_paid)}
                      </Tag>
                    </Space>
                  </div>

                  {/* Customer Info */}
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    marginBottom: '6px'
                  }}>
                    <UserOutlined style={{ color: '#6b7280', fontSize: '12px' }} />
                    <Text style={{ fontSize: '12px', color: '#374151' }}>
                      {bill.customerDetails?.full_name || bill.customer_name || 'N/A'}
                    </Text>
                  </div>

                  {/* Date and Amount */}
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CalendarOutlined style={{ color: '#6b7280', fontSize: '12px' }} />
                      <Text style={{ fontSize: '12px', color: '#6b7280' }}>
                        {bill.date ? dayjs(bill.date).format('DD/MM/YYYY') : 'N/A'}
                      </Text>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <DollarOutlined style={{ color: '#10b981', fontSize: '12px' }} />
                      <Text strong style={{ fontSize: '14px', color: '#10b981' }}>
                        ₹{(typeof bill.total_amount === 'number' ? bill.total_amount : parseFloat(bill.total_amount) || 0).toFixed(2)}
                      </Text>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div style={{ 
                    display: 'flex', 
                    gap: '8px', 
                    marginTop: '12px',
                    justifyContent: 'flex-end'
                  }}>
                    <Tooltip title="View Bill">
                      <Button
                        type="text"
                        icon={<EyeOutlined />}
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewBill(bill);
                        }}
                        style={{ color: '#3b82f6' }}
                      />
                    </Tooltip>
                    {bill.status !== 'draft' && (
                      <Tooltip title="Print Bill">
                        <Button
                          type="text"
                          icon={<PrinterOutlined />}
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            // Handle print functionality
                          }}
                          style={{ color: '#10b981' }}
                        />
                      </Tooltip>
                    )}
                  </div>
                </div>
              </List.Item>
            )}
            pagination={false}
          />
        )}
      </div>

      {/* Footer Stats */}
      <div style={{ 
        position: 'absolute', 
        bottom: 0, 
        left: 0, 
        right: 0, 
        padding: '16px',
        background: 'white',
        borderTop: '1px solid #e5e7eb'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center'
        }}>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            Total Bills: {filteredBills.length}
          </Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>
            💡 Click on any bill to view details
          </Text>
        </div>
      </div>
    </Drawer>
  );
};

export default BillListDrawer;
