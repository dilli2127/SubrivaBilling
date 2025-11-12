import React from 'react';
import { Modal, Descriptions, Table, Tag, Divider, Space, Timeline, Badge } from 'antd';
import {
  FileTextOutlined,
  CalendarOutlined,
  DollarOutlined,
  UserOutlined,
  ShopOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';

interface POViewModalProps {
  open: boolean;
  onClose: () => void;
  purchaseOrder: any;
}

const POViewModal: React.FC<POViewModalProps> = ({
  open,
  onClose,
  purchaseOrder,
}) => {
  if (!purchaseOrder) return null;
  
  const statusConfig: Record<string, any> = {
    draft: { color: 'default', label: 'Draft' },
    pending_approval: { color: 'warning', label: 'Pending Approval' },
    approved: { color: 'success', label: 'Approved' },
    rejected: { color: 'error', label: 'Rejected' },
    sent: { color: 'processing', label: 'Sent' },
    confirmed: { color: 'cyan', label: 'Confirmed' },
    partially_received: { color: 'purple', label: 'Partially Received' },
    fully_received: { color: 'green', label: 'Fully Received' },
    cancelled: { color: 'red', label: 'Cancelled' },
    closed: { color: 'default', label: 'Closed' },
  };
  
  const currentStatus = statusConfig[purchaseOrder.status] || statusConfig.draft;
  
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
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (qty: number) => <Tag color="blue">{qty}</Tag>,
    },
    {
      title: 'Unit Price',
      dataIndex: 'unit_price',
      key: 'unit_price',
      render: (price: number) => `₹${price?.toFixed(2)}`,
    },
    {
      title: 'Tax %',
      dataIndex: 'tax_percentage',
      key: 'tax_percentage',
      render: (tax: number) => `${tax}%`,
    },
    {
      title: 'Discount',
      key: 'discount',
      render: (record: any) =>
        record.discount > 0
          ? `${record.discount}${record.discount_type === 'percentage' ? '%' : '₹'}`
          : '-',
    },
    {
      title: 'Line Total',
      dataIndex: 'line_total',
      key: 'line_total',
      render: (total: number) => (
        <strong style={{ color: '#52c41a' }}>
          ₹{total?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </strong>
      ),
    },
    {
      title: 'Received',
      dataIndex: 'received_quantity',
      key: 'received_quantity',
      render: (received: number, record: any) => {
        const pending = record.quantity - (received || 0);
        return (
          <div>
            <Tag color="green">{received || 0}</Tag>
            {pending > 0 && <Tag color="orange">Pending: {pending}</Tag>}
          </div>
        );
      },
    },
  ];
  
  return (
    <Modal
      title={
        <Space>
          <FileTextOutlined style={{ color: '#1890ff' }} />
          <span>Purchase Order Details</span>
        </Space>
      }
      open={open}
      onCancel={onClose}
      width={1200}
      footer={null}
    >
      <Descriptions bordered column={2} size="small">
        <Descriptions.Item label="PO Number" span={1}>
          <Tag color="blue" icon={<FileTextOutlined />}>
            {purchaseOrder.po_number}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Status" span={1}>
          <Badge status={currentStatus.color} text={<Tag color={currentStatus.color}>{currentStatus.label}</Tag>} />
        </Descriptions.Item>
        
        <Descriptions.Item label="Vendor" span={2}>
          <UserOutlined style={{ marginRight: 8 }} />
          <strong>{purchaseOrder.VendorItem?.vendor_name}</strong>
          {purchaseOrder.VendorItem?.company_name && ` - ${purchaseOrder.VendorItem.company_name}`}
        </Descriptions.Item>
        
        <Descriptions.Item label="PO Date">
          <CalendarOutlined style={{ marginRight: 8 }} />
          {dayjs(purchaseOrder.po_date).format('DD/MM/YYYY')}
        </Descriptions.Item>
        <Descriptions.Item label="Expected Delivery">
          <CalendarOutlined style={{ marginRight: 8 }} />
          {purchaseOrder.expected_delivery_date
            ? dayjs(purchaseOrder.expected_delivery_date).format('DD/MM/YYYY')
            : '-'}
        </Descriptions.Item>
        
        <Descriptions.Item label="Warehouse">
          <ShopOutlined style={{ marginRight: 8 }} />
          {purchaseOrder.WarehouseItem?.warehouse_name || '-'}
        </Descriptions.Item>
        <Descriptions.Item label="Payment Terms">
          {purchaseOrder.payment_terms?.replace('_', ' ').toUpperCase()}
        </Descriptions.Item>
        
        <Descriptions.Item label="Created By" span={2}>
          {purchaseOrder.created_by_name}
        </Descriptions.Item>
      </Descriptions>
      
      <Divider orientation="left">Financial Summary</Divider>
      
      <Descriptions bordered column={4} size="small">
        <Descriptions.Item label="Subtotal">
          <DollarOutlined style={{ marginRight: 8 }} />
          ₹{purchaseOrder.subtotal?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </Descriptions.Item>
        <Descriptions.Item label="Tax Amount">
          ₹{purchaseOrder.tax_amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </Descriptions.Item>
        <Descriptions.Item label="Total Amount">
          <strong style={{ color: '#52c41a', fontSize: '16px' }}>
            ₹{purchaseOrder.total_amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </strong>
        </Descriptions.Item>
        <Descriptions.Item label="Outstanding">
          <strong style={{ color: '#ff4d4f' }}>
            ₹{purchaseOrder.outstanding_amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </strong>
        </Descriptions.Item>
      </Descriptions>
      
      <Divider orientation="left">Line Items</Divider>
      
      <Table
        columns={itemColumns}
        dataSource={purchaseOrder.items || []}
        rowKey={(record, index) => `item-${index}`}
        pagination={false}
        size="small"
        bordered
        scroll={{ x: 1000 }}
      />
      
      {purchaseOrder.notes && (
        <>
          <Divider orientation="left">Notes</Divider>
          <div style={{ padding: '12px', background: '#fafafa', borderRadius: '4px' }}>
            {purchaseOrder.notes}
          </div>
        </>
      )}
      
      {purchaseOrder.terms_conditions && (
        <>
          <Divider orientation="left">Terms & Conditions</Divider>
          <div style={{ padding: '12px', background: '#fafafa', borderRadius: '4px' }}>
            {purchaseOrder.terms_conditions}
          </div>
        </>
      )}
    </Modal>
  );
};

export default POViewModal;

