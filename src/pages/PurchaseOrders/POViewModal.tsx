import React, { useMemo } from 'react';
import { Modal, Descriptions, Table, Tag, Divider, Space, Timeline, Badge } from 'antd';
import {
  FileTextOutlined,
  CalendarOutlined,
  DollarOutlined,
  UserOutlined,
  ShopOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { apiSlice } from '../../services/redux/api/apiSlice';

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
  // Fetch vendor by ID if VendorItem is not populated
  // Must call hooks before any conditional returns
  const shouldFetchVendor = purchaseOrder && !purchaseOrder.VendorItem && purchaseOrder.vendor_id && open;
  const { data: vendorData } = apiSlice.useGetVendorByIdQuery(
    purchaseOrder?.vendor_id || '',
    { skip: !shouldFetchVendor }
  );
  
  // Fetch warehouse by ID if WarehouseItem is not populated
  const shouldFetchWarehouse = purchaseOrder && !purchaseOrder.WarehouseItem && purchaseOrder.warehouse_id && open;
  const { data: warehouseData } = apiSlice.useGetWarehouseByIdQuery(
    purchaseOrder?.warehouse_id || '',
    { skip: !shouldFetchWarehouse }
  );
  
  // Get vendor information from multiple possible sources
  const vendorInfo = useMemo(() => {
    if (!purchaseOrder) return null;
    
    // Priority 1: VendorItem (populated relation) - most reliable
    if (purchaseOrder.VendorItem && purchaseOrder.VendorItem.vendor_name) {
      return purchaseOrder.VendorItem;
    }
    
    // Priority 2: Fetch vendor by ID if VendorItem is missing
    if (shouldFetchVendor && vendorData) {
      const vendor = (vendorData as any)?.result || vendorData;
      if (vendor && (vendor.vendor_name || vendor.name)) {
        return {
          vendor_name: vendor.vendor_name || vendor.name,
          company_name: vendor.company_name,
          email: vendor.email,
          phone: vendor.phone || vendor.contact_number,
          address: vendor.address,
        };
      }
    }
    
    // Priority 3: Direct fields on purchase order (if saved directly)
    if (purchaseOrder.vendor_name) {
      return {
        vendor_name: purchaseOrder.vendor_name,
        company_name: purchaseOrder.vendor_company_name,
        email: purchaseOrder.vendor_email,
        phone: purchaseOrder.vendor_phone,
        address: purchaseOrder.vendor_address,
      };
    }
    
    // If vendor_id exists but no data available, return null (will show fallback message)
    return null;
  }, [purchaseOrder, purchaseOrder?.VendorItem, purchaseOrder?.vendor_name, purchaseOrder?.vendor_id, vendorData, shouldFetchVendor]);
  
  // Get warehouse information from multiple possible sources
  const warehouseInfo = useMemo(() => {
    if (!purchaseOrder) return null;
    
    // Priority 1: WarehouseItem (populated relation) - most reliable
    if (purchaseOrder.WarehouseItem && purchaseOrder.WarehouseItem.warehouse_name) {
      return purchaseOrder.WarehouseItem;
    }
    
    // Priority 2: Fetch warehouse by ID if WarehouseItem is missing
    if (shouldFetchWarehouse && warehouseData) {
      const warehouse = (warehouseData as any)?.result || warehouseData;
      if (warehouse && (warehouse.warehouse_name || warehouse.name)) {
        return {
          warehouse_name: warehouse.warehouse_name || warehouse.name,
          warehouse_code: warehouse.warehouse_code || warehouse.code,
          address: warehouse.address,
          manager: warehouse.manager,
        };
      }
    }
    
    // Priority 3: Direct fields on purchase order (if saved directly)
    if (purchaseOrder.warehouse_name) {
      return {
        warehouse_name: purchaseOrder.warehouse_name,
        warehouse_code: purchaseOrder.warehouse_code,
        address: purchaseOrder.warehouse_address,
        manager: purchaseOrder.warehouse_manager,
      };
    }
    
    // If warehouse_id exists but no data available, return null (will show fallback message)
    return null;
  }, [purchaseOrder, purchaseOrder?.WarehouseItem, purchaseOrder?.warehouse_name, purchaseOrder?.warehouse_id, warehouseData, shouldFetchWarehouse]);
  
  // Early return after hooks
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
  
  // Helper function to format amounts safely
  const formatAmount = (amount: any) => {
    const numAmount = Number(amount) || 0;
    return numAmount.toFixed(2);
  };
  
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
      render: (qty: any) => <Tag color="blue">{Number(qty) || 0}</Tag>,
    },
    {
      title: 'Unit Price',
      dataIndex: 'unit_price',
      key: 'unit_price',
      render: (price: any) => `₹${formatAmount(price)}`,
    },
    {
      title: 'Tax %',
      dataIndex: 'tax_percentage',
      key: 'tax_percentage',
      render: (tax: any) => {
        const numTax = Number(tax);
        return numTax ? `${numTax}%` : '-';
      },
    },
    {
      title: 'Discount',
      key: 'discount',
      render: (record: any) => {
        const discount = Number(record.discount) || 0;
        if (discount > 0) {
          return `${discount}${record.discount_type === 'percentage' ? '%' : '₹'}`;
        }
        return '-';
      },
    },
    {
      title: 'Line Total',
      dataIndex: 'line_total',
      key: 'line_total',
      render: (total: any) => {
        const numTotal = Number(total) || 0;
        return (
          <strong style={{ color: '#52c41a' }}>
            ₹{numTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </strong>
        );
      },
    },
    {
      title: 'Received',
      dataIndex: 'received_quantity',
      key: 'received_quantity',
      render: (received: any, record: any) => {
        const numReceived = Number(received) || 0;
        const numQuantity = Number(record.quantity) || 0;
        const pending = numQuantity - numReceived;
        return (
          <div>
            <Tag color="green">{numReceived}</Tag>
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
          {vendorInfo ? (
            <>
              <UserOutlined style={{ marginRight: 8 }} />
              <strong>{vendorInfo.vendor_name || 'N/A'}</strong>
              {vendorInfo.company_name && (
                <div style={{ fontSize: '12px', color: '#888', marginTop: 4 }}>
                  {vendorInfo.company_name}
                </div>
              )}
              {vendorInfo.email && (
                <div style={{ fontSize: '12px', color: '#888', marginTop: 4 }}>
                  📧 {vendorInfo.email}
                </div>
              )}
              {vendorInfo.phone && (
                <div style={{ fontSize: '12px', color: '#888' }}>
                  📞 {vendorInfo.phone}
                </div>
              )}
              {vendorInfo.address && (
                <div style={{ fontSize: '12px', color: '#888', marginTop: 4 }}>
                  📍 {vendorInfo.address}
                </div>
              )}
            </>
          ) : (
            <span style={{ color: '#999' }}>
              <UserOutlined style={{ marginRight: 8 }} />
              Vendor information not available
            </span>
          )}
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
          {warehouseInfo ? (
            <>
              <ShopOutlined style={{ marginRight: 8 }} />
              <strong>{warehouseInfo.warehouse_name || 'N/A'}</strong>
              {warehouseInfo.warehouse_code && (
                <div style={{ fontSize: '12px', color: '#888', marginTop: 4 }}>
                  Code: {warehouseInfo.warehouse_code}
                </div>
              )}
              {warehouseInfo.address && (
                <div style={{ fontSize: '12px', color: '#888', marginTop: 4 }}>
                  📍 {warehouseInfo.address}
                </div>
              )}
              {warehouseInfo.manager && (
                <div style={{ fontSize: '12px', color: '#888', marginTop: 4 }}>
                  👤 Manager: {warehouseInfo.manager}
                </div>
              )}
            </>
          ) : (
            <span style={{ color: '#999' }}>
              <ShopOutlined style={{ marginRight: 8 }} />
              Warehouse information not available
            </span>
          )}
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
          ₹{(Number(purchaseOrder.subtotal) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </Descriptions.Item>
        <Descriptions.Item label="Tax Amount">
          ₹{(Number(purchaseOrder.tax_amount) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </Descriptions.Item>
        <Descriptions.Item label="Total Amount">
          <strong style={{ color: '#52c41a', fontSize: '16px' }}>
            ₹{(Number(purchaseOrder.total_amount) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </strong>
        </Descriptions.Item>
        <Descriptions.Item label="Outstanding">
          <strong style={{ color: '#ff4d4f' }}>
            ₹{(Number(purchaseOrder.outstanding_amount) || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
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

