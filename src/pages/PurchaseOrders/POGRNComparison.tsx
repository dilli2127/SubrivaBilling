import React from 'react';
import { Modal, Table, Tag, Statistic, Row, Col, Alert, Divider } from 'antd';
import { CheckCircleOutlined, WarningOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { useGetPOvsGRNComparisonQuery, useGetReceiptsForPOQuery } from '../../services/redux/api/endpoints';
import dayjs from 'dayjs';

interface POGRNComparisonProps {
  open: boolean;
  onClose: () => void;
  purchaseOrderId: string;
  poNumber?: string;
}

const POGRNComparison: React.FC<POGRNComparisonProps> = ({
  open,
  onClose,
  purchaseOrderId,
  poNumber,
}) => {
  const { data: comparisonData, isLoading } = useGetPOvsGRNComparisonQuery(purchaseOrderId, {
    skip: !open || !purchaseOrderId,
  });
  
  const { data: receiptsData } = useGetReceiptsForPOQuery(purchaseOrderId, {
    skip: !open || !purchaseOrderId,
  });
  
  const comparison = (comparisonData as any)?.result || {};
  const receipts = (receiptsData as any)?.result || [];
  
  // Comparison table columns
  const comparisonColumns = [
    {
      title: 'Product',
      key: 'product',
      render: (record: any) => (
        <div>
          <strong>{record.product_name}</strong>
          {record.variant_name && (
            <div style={{ fontSize: '11px', color: '#888' }}>{record.variant_name}</div>
          )}
        </div>
      ),
    },
    {
      title: 'Ordered Qty',
      dataIndex: 'ordered_quantity',
      key: 'ordered_quantity',
      render: (qty: number) => <Tag color="blue">{qty}</Tag>,
    },
    {
      title: 'Received Qty',
      dataIndex: 'received_quantity',
      key: 'received_quantity',
      render: (qty: number) => <Tag color="green">{qty}</Tag>,
    },
    {
      title: 'Rejected Qty',
      dataIndex: 'rejected_quantity',
      key: 'rejected_quantity',
      render: (qty: number) => (qty > 0 ? <Tag color="red">{qty}</Tag> : <span>-</span>),
    },
    {
      title: 'Pending Qty',
      dataIndex: 'pending_quantity',
      key: 'pending_quantity',
      render: (qty: number) => (qty > 0 ? <Tag color="orange">{qty}</Tag> : <Tag color="green">Complete</Tag>),
    },
    {
      title: 'Fulfillment',
      key: 'fulfillment',
      render: (record: any) => {
        const percentage = record.ordered_quantity > 0
          ? ((record.received_quantity / record.ordered_quantity) * 100).toFixed(0)
          : 0;
        
        let color = 'red';
        let icon = <CloseCircleOutlined />;
        
        if (percentage === '100') {
          color = 'green';
          icon = <CheckCircleOutlined />;
        } else if (Number(percentage) >= 50) {
          color = 'orange';
          icon = <WarningOutlined />;
        }
        
        return (
          <Tag color={color} icon={icon}>
            {percentage}%
          </Tag>
        );
      },
    },
  ];
  
  // Receipts table columns
  const receiptsColumns = [
    {
      title: 'GRN Number',
      dataIndex: 'grn_number',
      key: 'grn_number',
      render: (text: string) => <Tag color="purple">{text}</Tag>,
    },
    {
      title: 'GRN Date',
      dataIndex: 'grn_date',
      key: 'grn_date',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Vendor Invoice',
      key: 'vendor_invoice',
      render: (record: any) => (
        <div>
          {record.vendor_invoice_no || '-'}
          {record.vendor_invoice_date && (
            <div style={{ fontSize: '11px', color: '#888' }}>
              {dayjs(record.vendor_invoice_date).format('DD/MM/YYYY')}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Received By',
      dataIndex: 'received_by_name',
      key: 'received_by_name',
    },
    {
      title: 'Items Received',
      dataIndex: 'items',
      key: 'items_count',
      render: (items: any[]) => <Tag>{items?.length || 0} items</Tag>,
    },
    {
      title: 'Total Amount',
      dataIndex: 'total_amount',
      key: 'total_amount',
      render: (amount: number) => `₹${amount?.toFixed(2)}`,
    },
  ];
  
  return (
    <Modal
      title={`PO vs GRN Comparison - ${poNumber || 'Purchase Order'}`}
      open={open}
      onCancel={onClose}
      width={1200}
      footer={null}
    >
      <Alert
        message="Purchase Order vs Goods Receipt Note Comparison"
        description="Compare what was ordered vs what was actually received. Track pending deliveries and fulfillment rates."
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />
      
      {/* Summary Statistics */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Statistic
            title="Total Items"
            value={comparison.items?.length || 0}
            prefix={<CheckCircleOutlined />}
          />
        </Col>
        <Col span={6}>
          <Statistic
            title="Fully Received"
            value={comparison.items?.filter((item: any) => item.pending_quantity === 0).length || 0}
            valueStyle={{ color: '#52c41a' }}
          />
        </Col>
        <Col span={6}>
          <Statistic
            title="Partially Received"
            value={
              comparison.items?.filter(
                (item: any) => item.received_quantity > 0 && item.pending_quantity > 0
              ).length || 0
            }
            valueStyle={{ color: '#faad14' }}
          />
        </Col>
        <Col span={6}>
          <Statistic
            title="Not Received"
            value={comparison.items?.filter((item: any) => item.received_quantity === 0).length || 0}
            valueStyle={{ color: '#ff4d4f' }}
          />
        </Col>
      </Row>
      
      <Divider>Item-wise Comparison</Divider>
      
      <Table
        columns={comparisonColumns}
        dataSource={comparison.items || []}
        rowKey={(record, index) => `item-${index}`}
        loading={isLoading}
        pagination={false}
        size="small"
        bordered
        scroll={{ x: 800 }}
      />
      
      <Divider>Goods Receipt Notes (GRN)</Divider>
      
      {receipts.length > 0 ? (
        <Table
          columns={receiptsColumns}
          dataSource={receipts}
          rowKey="_id"
          pagination={false}
          size="small"
          bordered
        />
      ) : (
        <Alert
          message="No receipts found"
          description="No goods have been received for this purchase order yet."
          type="warning"
          showIcon
        />
      )}
    </Modal>
  );
};

export default POGRNComparison;

