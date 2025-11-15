import React, { useEffect } from 'react';
import {
  Modal,
  Descriptions,
  Table,
  Tag,
  Space,
  Divider,
  Statistic,
  Row,
  Col,
  Alert,
} from 'antd';
import {
  FileTextOutlined,
  InboxOutlined,
  CalendarOutlined,
  DollarOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { useGetPurchaseOrderReceiptByIdQuery } from '../../services/redux/api/endpoints';
import dayjs from 'dayjs';

interface GRNViewModalProps {
  open: boolean;
  onClose: () => void;
  grnId?: string;
  grnData?: any;
}

const GRNViewModal: React.FC<GRNViewModalProps> = ({
  open,
  onClose,
  grnId,
  grnData,
}) => {
  const { data: grnDetailData, isLoading } = useGetPurchaseOrderReceiptByIdQuery(grnId || '', {
    skip: !open || !grnId || !!grnData,
  });

  const grn = grnData || (grnDetailData as any)?.result || {};

  // Item columns
  const itemColumns = [
    {
      title: 'Product',
      key: 'product',
      width: 200,
      render: (record: any) => (
        <div>
          <strong>{record.product_name || record.ProductItem?.name || '-'}</strong>
          {record.variant_name && (
            <div style={{ fontSize: '11px', color: '#888' }}>
              {record.variant_name}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Ordered Qty',
      key: 'ordered_quantity',
      width: 100,
      render: (record: any) => (
        <Tag color="blue">{record.ordered_quantity || 0}</Tag>
      ),
    },
    {
      title: 'Received Qty',
      key: 'received_quantity',
      width: 100,
      render: (record: any) => (
        <Tag color="green">{record.received_quantity || 0}</Tag>
      ),
    },
    {
      title: 'Rejected Qty',
      key: 'rejected_quantity',
      width: 100,
      render: (record: any) => (
        record.rejected_quantity > 0 ? (
          <Tag color="red">{record.rejected_quantity}</Tag>
        ) : (
          <span style={{ color: '#999' }}>-</span>
        )
      ),
    },
    {
      title: 'Accepted Qty',
      key: 'accepted_quantity',
      width: 100,
      render: (record: any) => (
        <strong style={{ color: '#52c41a' }}>
          {record.accepted_quantity || 0}
        </strong>
      ),
    },
    {
      title: 'Unit Price',
      key: 'unit_price',
      width: 120,
      render: (record: any) => (
        <span>₹{(Number(record.unit_price) || 0).toFixed(2)}</span>
      ),
    },
    {
      title: 'GST %',
      key: 'tax_percentage',
      width: 80,
      render: (record: any) => (
        <span>{record.tax_percentage || 0}%</span>
      ),
    },
    {
      title: 'Batch No',
      key: 'batch_no',
      width: 120,
      render: (record: any) => record.batch_no || '-',
    },
    {
      title: 'Expiry Date',
      key: 'expiry_date',
      width: 120,
      render: (record: any) => (
        record.expiry_date ? dayjs(record.expiry_date).format('DD/MM/YYYY') : '-'
      ),
    },
  ];

  return (
    <Modal
      title={
        <Space>
          <FileTextOutlined style={{ color: '#1890ff' }} />
          <span>GRN Details - {grn.grn_number}</span>
        </Space>
      }
      open={open}
      onCancel={onClose}
      width={1400}
      footer={null}
    >
      <Alert
        message="Goods Receipt Note (GRN)"
        description="Complete details of the goods receipt note including all received items and financial information."
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />

      <Descriptions bordered column={2} size="small" style={{ marginBottom: 24 }}>
        <Descriptions.Item label="GRN Number">
          <Tag color="purple" style={{ fontSize: '13px' }}>
            {grn.grn_number}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="GRN Date">
          <Space>
            <CalendarOutlined />
            {grn.grn_date ? dayjs(grn.grn_date).format('DD/MM/YYYY') : '-'}
          </Space>
        </Descriptions.Item>
        <Descriptions.Item label="PO Number">
          <Tag color="blue">
            {grn.po_number || grn.PurchaseOrderItem?.po_number || '-'}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Vendor">
          {grn.vendor?.vendor_name || grn.vendor_name || '-'}
        </Descriptions.Item>
        <Descriptions.Item label="Vendor Invoice Number">
          {grn.vendor_invoice_no ? (
            <Tag color="green">{grn.vendor_invoice_no}</Tag>
          ) : (
            '-'
          )}
        </Descriptions.Item>
        <Descriptions.Item label="Vendor Invoice Date">
          {grn.vendor_invoice_date ? dayjs(grn.vendor_invoice_date).format('DD/MM/YYYY') : '-'}
        </Descriptions.Item>
        <Descriptions.Item label="Received By">
          {grn.received_by_name || '-'}
        </Descriptions.Item>
        <Descriptions.Item label="Warehouse">
          {grn.warehouse?.warehouse_name || grn.warehouse_name || '-'}
        </Descriptions.Item>
      </Descriptions>

      <Divider>Received Items</Divider>

      <Table
        columns={itemColumns}
        dataSource={grn.items || []}
        rowKey={(record, index) => `item-${index}`}
        loading={isLoading}
        pagination={false}
        size="small"
        bordered
        scroll={{ x: 1200 }}
      />

      <Divider>Financial Summary</Divider>

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={6}>
          <Statistic
            title="Subtotal"
            value={Number(grn.subtotal) || 0}
            prefix="₹"
            precision={2}
          />
        </Col>
        <Col span={6}>
          <Statistic
            title="Tax Amount"
            value={Number(grn.tax_amount) || 0}
            prefix="₹"
            precision={2}
            valueStyle={{ color: '#1890ff' }}
          />
        </Col>
        <Col span={6}>
          <Statistic
            title="Shipping Cost"
            value={Number(grn.shipping_cost) || 0}
            prefix="₹"
            precision={2}
          />
        </Col>
        <Col span={6}>
          <Statistic
            title="Total Amount"
            value={Number(grn.total_amount) || 0}
            prefix="₹"
            precision={2}
            valueStyle={{ color: '#52c41a', fontSize: '20px', fontWeight: 'bold' }}
          />
        </Col>
      </Row>

      {grn.notes && (
        <>
          <Divider>Notes</Divider>
          <Alert
            message={grn.notes}
            type="info"
            showIcon={false}
            style={{ marginBottom: 16 }}
          />
        </>
      )}
    </Modal>
  );
};

export default GRNViewModal;

