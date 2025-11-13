import React from 'react';
import { Modal, Descriptions, Table, Tag, Divider, Space, Badge } from 'antd';
import {
  FileTextOutlined,
  CalendarOutlined,
  DollarOutlined,
  UserOutlined,
  UndoOutlined,
  CreditCardOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';

interface ReturnViewModalProps {
  open: boolean;
  onClose: () => void;
  salesReturn: any;
}

const ReturnViewModal: React.FC<ReturnViewModalProps> = ({
  open,
  onClose,
  salesReturn,
}) => {
  if (!salesReturn) return null;
  
  const statusConfig: Record<string, any> = {
    draft: { color: 'default', label: 'Draft' },
    pending_approval: { color: 'warning', label: 'Pending Approval' },
    approved: { color: 'success', label: 'Approved' },
    rejected: { color: 'error', label: 'Rejected' },
    completed: { color: 'green', label: 'Completed' },
    cancelled: { color: 'red', label: 'Cancelled' },
  };
  
  const currentStatus = statusConfig[salesReturn.status] || statusConfig.draft;
  
  const itemColumns = [
    {
      title: 'Product',
      key: 'product',
      render: (record: any) => (
        <div>
          <strong>{record.product_name}</strong>
          {record.variant_name && (
            <div style={{ fontSize: '11px', color: '#888' }}>
              {record.variant_name}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (qty: number) => <Tag color="orange">{qty}</Tag>,
    },
    {
      title: 'Unit Price',
      dataIndex: 'unit_price',
      key: 'unit_price',
      render: (price: any) => `₹${Number(price || 0).toFixed(2)}`,
    },
    {
      title: 'Tax %',
      dataIndex: 'tax_percentage',
      key: 'tax_percentage',
      render: (tax: any) => `${Number(tax || 0)}%`,
    },
    {
      title: 'Line Total',
      dataIndex: 'line_total',
      key: 'line_total',
      render: (total: any) => (
        <strong style={{ color: '#ff4d4f' }}>
          ₹{Number(total || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </strong>
      ),
    },
    {
      title: 'Condition',
      dataIndex: 'item_condition',
      key: 'item_condition',
      render: (condition: string) => {
        const conditionConfig: Record<string, { color: string; label: string }> = {
          good: { color: 'green', label: 'Good' },
          damaged: { color: 'orange', label: 'Damaged' },
          expired: { color: 'red', label: 'Expired' },
          defective: { color: 'red', label: 'Defective' },
        };
        const config = conditionConfig[condition] || conditionConfig.good;
        return <Tag color={config.color}>{config.label}</Tag>;
      },
    },
  ];
  
  return (
    <Modal
      title={
        <Space>
          <UndoOutlined style={{ color: '#ff4d4f' }} />
          <span>Sales Return Details</span>
        </Space>
      }
      open={open}
      onCancel={onClose}
      width={1200}
      footer={null}
    >
      <Descriptions bordered column={2} size="small">
        <Descriptions.Item label="Return Number" span={1}>
          <Tag color="orange" icon={<UndoOutlined />}>
            {salesReturn.return_number}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Status" span={1}>
          <Badge status={currentStatus.color} text={<Tag color={currentStatus.color}>{currentStatus.label}</Tag>} />
        </Descriptions.Item>
        
        <Descriptions.Item label="Original Invoice" span={1}>
          <Tag color="blue" icon={<FileTextOutlined />}>
            {salesReturn.invoice_number}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Invoice Date" span={1}>
          <CalendarOutlined style={{ marginRight: 8 }} />
          {salesReturn.invoice_date ? dayjs(salesReturn.invoice_date).format('DD/MM/YYYY') : '-'}
        </Descriptions.Item>
        
        <Descriptions.Item label="Customer" span={2}>
          <UserOutlined style={{ marginRight: 8 }} />
          <strong>{salesReturn.customer_name}</strong>
          {salesReturn.customer_phone && ` - ${salesReturn.customer_phone}`}
        </Descriptions.Item>
        
        <Descriptions.Item label="Return Date">
          <CalendarOutlined style={{ marginRight: 8 }} />
          {dayjs(salesReturn.return_date).format('DD/MM/YYYY')}
        </Descriptions.Item>
        <Descriptions.Item label="Return Reason">
          <Tag>{salesReturn.return_reason?.replace('_', ' ').toUpperCase()}</Tag>
        </Descriptions.Item>
        
        {salesReturn.return_reason_notes && (
          <Descriptions.Item label="Reason Details" span={2}>
            {salesReturn.return_reason_notes}
          </Descriptions.Item>
        )}
      </Descriptions>
      
      <Divider orientation="left">Refund Information</Divider>
      
      <Descriptions bordered column={4} size="small">
        <Descriptions.Item label="Refund Type">
          <Tag color="green" icon={<CreditCardOutlined />}>
            {salesReturn.refund_type?.toUpperCase()}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Refund Status">
          <Tag color={salesReturn.refund_status === 'completed' ? 'green' : 'orange'}>
            {salesReturn.refund_status?.toUpperCase()}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Refund Amount" span={2}>
          <strong style={{ color: '#ff4d4f', fontSize: '16px' }}>
            <DollarOutlined style={{ marginRight: 8 }} />
            ₹{Number(salesReturn.refund_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </strong>
        </Descriptions.Item>
        
        {salesReturn.refund_date && (
          <Descriptions.Item label="Refund Date" span={2}>
            {dayjs(salesReturn.refund_date).format('DD/MM/YYYY')}
          </Descriptions.Item>
        )}
        
        {salesReturn.refund_reference && (
          <Descriptions.Item label="Refund Reference" span={2}>
            {salesReturn.refund_reference}
          </Descriptions.Item>
        )}
        
        {salesReturn.refund_type === 'points' && (
          <Descriptions.Item label="Points Issued" span={4}>
            <Tag color="orange" icon={<CreditCardOutlined />}>
              {Math.floor(Number(salesReturn.refund_amount || 0))} points
            </Tag>
            <span style={{ marginLeft: 8, color: '#888' }}>
              Points added to customer balance (₹{Number(salesReturn.refund_amount || 0).toFixed(2)} value)
            </span>
          </Descriptions.Item>
        )}
      </Descriptions>
      
      <Divider orientation="left">Returned Items</Divider>
      
      <Table
        columns={itemColumns}
        dataSource={salesReturn.items || []}
        rowKey={(record, index) => `item-${index}`}
        pagination={false}
        size="small"
        bordered
        scroll={{ x: 1000 }}
      />
      
      {salesReturn.stock_returned && (
        <div style={{ marginTop: 16, padding: '12px', background: '#f6ffed', border: '1px solid #b7eb8f', borderRadius: '4px' }}>
          <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
          <strong>Stock Returned:</strong> Items have been restocked on {' '}
          {dayjs(salesReturn.stock_returned_date).format('DD/MM/YYYY')}
        </div>
      )}
      
      {salesReturn.notes && (
        <>
          <Divider orientation="left">Notes</Divider>
          <div style={{ padding: '12px', background: '#fafafa', borderRadius: '4px' }}>
            {salesReturn.notes}
          </div>
        </>
      )}
      
      {salesReturn.approved_by_name && (
        <>
          <Divider orientation="left">Approval Information</Divider>
          <Descriptions bordered size="small">
            <Descriptions.Item label="Approved By">
              {salesReturn.approved_by_name}
            </Descriptions.Item>
            <Descriptions.Item label="Approved Date">
              {dayjs(salesReturn.approved_date).format('DD/MM/YYYY HH:mm')}
            </Descriptions.Item>
          </Descriptions>
        </>
      )}
    </Modal>
  );
};

export default ReturnViewModal;

