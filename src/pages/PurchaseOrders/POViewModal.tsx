import React, { useMemo } from 'react';
import {
  Modal,
  Descriptions,
  Table,
  Tag,
  Divider,
  Space,
  Timeline,
  Badge,
  Typography,
  Button,
} from 'antd';
import {
  FileTextOutlined,
  CalendarOutlined,
  DollarOutlined,
  UserOutlined,
  ShopOutlined,
  CreditCardOutlined,
  CheckCircleOutlined,
  InboxOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { apiSlice } from '../../services/redux/api/apiSlice';
import {
  useGetPOPaymentsQuery,
  useGetReceiptsForPOQuery,
  useGetPOvsGRNComparisonQuery,
} from '../../services/redux/api/endpoints/purchaseOrder.endpoints';

const { Text } = Typography;

interface POViewModalProps {
  open: boolean;
  onClose: () => void;
  purchaseOrder: any;
  onPaymentSuccess?: () => void;
}

const POViewModal: React.FC<POViewModalProps> = ({
  open,
  onClose,
  purchaseOrder,
  onPaymentSuccess,
}) => {
  // Fetch vendor by ID if VendorItem is not populated
  // Must call hooks before any conditional returns
  const shouldFetchVendor =
    purchaseOrder &&
    !purchaseOrder.VendorItem &&
    purchaseOrder.vendor_id &&
    open;
  const { data: vendorData } = apiSlice.useGetVendorByIdQuery(
    purchaseOrder?.vendor_id || '',
    { skip: !shouldFetchVendor }
  );

  // Fetch warehouse by ID if WarehouseItem is not populated
  const shouldFetchWarehouse =
    purchaseOrder &&
    !purchaseOrder.WarehouseItem &&
    purchaseOrder.warehouse_id &&
    open;
  const { data: warehouseData } = apiSlice.useGetWarehouseByIdQuery(
    purchaseOrder?.warehouse_id || '',
    { skip: !shouldFetchWarehouse }
  );

  // Fetch payment history for this purchase order
  const { data: paymentsData, refetch: refetchPayments } =
    useGetPOPaymentsQuery(purchaseOrder?._id || '', {
      skip: !purchaseOrder?._id || !open,
    });

  // Fetch GRN receipts for this purchase order
  const { data: receiptsData } = useGetReceiptsForPOQuery(
    purchaseOrder?._id || '',
    { skip: !purchaseOrder?._id || !open }
  );

  // Fetch PO vs GRN comparison
  const { data: comparisonData } = useGetPOvsGRNComparisonQuery(
    purchaseOrder?._id || '',
    { skip: !purchaseOrder?._id || !open }
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
  }, [
    purchaseOrder,
    purchaseOrder?.VendorItem,
    purchaseOrder?.vendor_name,
    purchaseOrder?.vendor_id,
    vendorData,
    shouldFetchVendor,
  ]);

  // Get warehouse information from multiple possible sources
  const warehouseInfo = useMemo(() => {
    if (!purchaseOrder) return null;

    // Priority 1: WarehouseItem (populated relation) - most reliable
    if (
      purchaseOrder.WarehouseItem &&
      purchaseOrder.WarehouseItem.warehouse_name
    ) {
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
  }, [
    purchaseOrder,
    purchaseOrder?.WarehouseItem,
    purchaseOrder?.warehouse_name,
    purchaseOrder?.warehouse_id,
    warehouseData,
    shouldFetchWarehouse,
  ]);

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

  const currentStatus =
    statusConfig[purchaseOrder.status] || statusConfig.draft;

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
      footer={[
        <Button key="close" type="primary" onClick={onClose}>
          Close
        </Button>
      ]}
    >
      <Descriptions bordered column={2} size="small">
        <Descriptions.Item label="PO Number" span={1}>
          <Tag color="blue" icon={<FileTextOutlined />}>
            {purchaseOrder.po_number}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Status" span={1}>
          <Badge
            status={currentStatus.color}
            text={<Tag color={currentStatus.color}>{currentStatus.label}</Tag>}
          />
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
          <DollarOutlined style={{ marginRight: 8 }} />₹
          {(Number(purchaseOrder.subtotal) || 0).toLocaleString('en-IN', {
            minimumFractionDigits: 2,
          })}
        </Descriptions.Item>
        <Descriptions.Item label="Tax Amount">
          ₹
          {(Number(purchaseOrder.tax_amount) || 0).toLocaleString('en-IN', {
            minimumFractionDigits: 2,
          })}
        </Descriptions.Item>
        <Descriptions.Item label="Total Amount">
          <strong style={{ color: '#52c41a', fontSize: '16px' }}>
            ₹
            {(Number(purchaseOrder.total_amount) || 0).toLocaleString('en-IN', {
              minimumFractionDigits: 2,
            })}
          </strong>
        </Descriptions.Item>
        <Descriptions.Item label="Paid Amount">
          <Text strong style={{ color: '#1890ff' }}>
            ₹
            {(Number(purchaseOrder.paid_amount) || 0).toLocaleString('en-IN', {
              minimumFractionDigits: 2,
            })}
          </Text>
        </Descriptions.Item>
        <Descriptions.Item label="Outstanding" span={4}>
          <strong style={{ color: '#ff4d4f', fontSize: '18px' }}>
            ₹
            {(Number(purchaseOrder.outstanding_amount) || 0).toLocaleString(
              'en-IN',
              { minimumFractionDigits: 2 }
            )}
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

      {/* GRN Receipts Section */}
      {(() => {
        const receipts = (receiptsData as any)?.result || receiptsData || [];
        const receiptList = Array.isArray(receipts) ? receipts : [];

        if (receiptList.length > 0) {
          return (
            <>
              <Divider orientation="left">
                <Space>
                  <InboxOutlined />
                  <span>GRN Receipts ({receiptList.length})</span>
                </Space>
              </Divider>

              <Table
                columns={[
                  {
                    title: 'GRN Number',
                    dataIndex: 'grn_number',
                    key: 'grn_number',
                    render: (text: string) => (
                      <Tag color="blue" icon={<FileTextOutlined />}>
                        {text}
                      </Tag>
                    ),
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
                        {record.vendor_invoice_no ? (
                          <>
                            <div>{record.vendor_invoice_no}</div>
                            {record.vendor_invoice_date && (
                              <div style={{ fontSize: '12px', color: '#888' }}>
                                {dayjs(record.vendor_invoice_date).format(
                                  'DD/MM/YYYY'
                                )}
                              </div>
                            )}
                          </>
                        ) : (
                          <Text type="secondary">-</Text>
                        )}
                      </div>
                    ),
                  },
                  {
                    title: 'Total Amount',
                    dataIndex: 'total_amount',
                    key: 'total_amount',
                    render: (amount: number) => (
                      <Text strong>
                        ₹
                        {(Number(amount) || 0).toLocaleString('en-IN', {
                          minimumFractionDigits: 2,
                        })}
                      </Text>
                    ),
                  },
                  {
                    title: 'Received By',
                    dataIndex: 'received_by_name',
                    key: 'received_by_name',
                    render: (name: string) => name || '-',
                  },
                ]}
                dataSource={receiptList}
                rowKey={record => record._id || record.id}
                pagination={false}
                size="small"
                bordered
              />
            </>
          );
        }
        return null;
      })()}

      {/* PO vs GRN Comparison */}
      {comparisonData && (
        <>
          <Divider orientation="left">
            <Space>
              <CheckCircleOutlined />
              <span>Ordered vs Received Comparison</span>
            </Space>
          </Divider>

          <Table
            columns={[
              {
                title: 'Product',
                key: 'product',
                render: (record: any) => (
                  <div>
                    <Text strong>{record.product_name || 'N/A'}</Text>
                    {record.variant_name && (
                      <div style={{ fontSize: '12px', color: '#888' }}>
                        {record.variant_name}
                      </div>
                    )}
                  </div>
                ),
              },
              {
                title: 'Ordered',
                dataIndex: 'ordered_quantity',
                key: 'ordered_quantity',
                render: (qty: number) => <Tag color="blue">{qty || 0}</Tag>,
              },
              {
                title: 'Received',
                dataIndex: 'received_quantity',
                key: 'received_quantity',
                render: (qty: number, record: any) => {
                  const ordered = Number(record.ordered_quantity) || 0;
                  const received = Number(qty) || 0;
                  const pending = ordered - received;
                  const percentage =
                    ordered > 0 ? ((received / ordered) * 100).toFixed(1) : '0';

                  return (
                    <div>
                      <Tag
                        color={
                          received === ordered
                            ? 'green'
                            : received > 0
                              ? 'orange'
                              : 'default'
                        }
                      >
                        {received}
                      </Tag>
                      {pending > 0 && (
                        <div
                          style={{
                            fontSize: '12px',
                            color: '#888',
                            marginTop: 4,
                          }}
                        >
                          Pending: {pending} ({percentage}% fulfilled)
                        </div>
                      )}
                    </div>
                  );
                },
              },
              {
                title: 'Status',
                key: 'fulfillment_status',
                render: (record: any) => {
                  const ordered = Number(record.ordered_quantity) || 0;
                  const received = Number(record.received_quantity) || 0;

                  if (received === 0) {
                    return <Tag color="default">Not Received</Tag>;
                  } else if (received === ordered) {
                    return (
                      <Tag color="green" icon={<CheckCircleOutlined />}>
                        Fully Received
                      </Tag>
                    );
                  } else if (received < ordered) {
                    return <Tag color="orange">Partially Received</Tag>;
                  } else {
                    return <Tag color="red">Over Received</Tag>;
                  }
                },
              },
            ]}
            dataSource={
              (comparisonData as any)?.result?.items ||
              (comparisonData as any)?.items ||
              []
            }
            rowKey={(record, index) => `comparison-${index}`}
            pagination={false}
            size="small"
            bordered
          />
        </>
      )}

      {purchaseOrder.notes && (
        <>
          <Divider orientation="left">Notes</Divider>
          <div
            style={{
              padding: '12px',
              background: '#fafafa',
              borderRadius: '4px',
            }}
          >
            {purchaseOrder.notes}
          </div>
        </>
      )}

      {/* Payment History */}
      <Divider orientation="left">
        <Space>
          <CreditCardOutlined />
          <span>Payment History</span>
        </Space>
      </Divider>

      {(() => {
        // Handle different response structures from backend
        // Backend might return: { result: { payments: [...], summary: {...} } } or { result: [...] } or just [...]
        let payments: any[] = [];
        if (paymentsData) {
          const data = paymentsData as any;
          if (Array.isArray(data)) {
            payments = data;
          } else if (data.result) {
            if (Array.isArray(data.result)) {
              payments = data.result;
            } else if (
              data.result.payments &&
              Array.isArray(data.result.payments)
            ) {
              payments = data.result.payments;
            }
          }
        }
        const paymentList = payments;

        if (paymentList.length === 0) {
          return (
            <div
              style={{ padding: '24px', textAlign: 'center', color: '#999' }}
            >
              <CreditCardOutlined
                style={{ fontSize: '32px', marginBottom: '8px' }}
              />
              <div>No payments recorded yet</div>
            </div>
          );
        }

        const paymentColumns = [
          {
            title: 'Payment Date',
            dataIndex: 'payment_date',
            key: 'payment_date',
            sorter: (a: any, b: any) =>
              dayjs(a.payment_date).unix() - dayjs(b.payment_date).unix(),
            render: (date: string, record: any) => (
              <Space>
                <CalendarOutlined />
                {dayjs(date).format('DD/MM/YYYY')}
                {record.payment_type === 'advance' && (
                  <Tag color="orange">Advance</Tag>
                )}
              </Space>
            ),
          },
          {
            title: 'Payment Amount',
            dataIndex: 'payment_amount',
            key: 'payment_amount',
            render: (amount: number) => (
              <Text strong style={{ color: '#52c41a', fontSize: '15px' }}>
                ₹
                {(Number(amount) || 0).toLocaleString('en-IN', {
                  minimumFractionDigits: 2,
                })}
              </Text>
            ),
          },
          {
            title: 'Payment Mode',
            dataIndex: 'payment_mode',
            key: 'payment_mode',
            render: (mode: string) => {
              const modeColors: Record<string, string> = {
                cash: 'green',
                upi: 'blue',
                card: 'purple',
                bank_transfer: 'cyan',
                cheque: 'orange',
                other: 'default',
              };
              return (
                <Tag color={modeColors[mode] || 'default'}>
                  {mode?.replace('_', ' ').toUpperCase() || 'N/A'}
                </Tag>
              );
            },
          },
          {
            title: 'Transaction Details',
            key: 'transaction_details',
            render: (record: any) => {
              if (record.cheque_number) {
                return (
                  <div>
                    <div>Cheque: {record.cheque_number}</div>
                    {record.bank_name && (
                      <div style={{ fontSize: '12px', color: '#888' }}>
                        Bank: {record.bank_name}
                      </div>
                    )}
                  </div>
                );
              }
              if (record.transaction_id) {
                return (
                  <div>
                    <div>Txn ID: {record.transaction_id}</div>
                    {record.bank_name && (
                      <div style={{ fontSize: '12px', color: '#888' }}>
                        Bank: {record.bank_name}
                      </div>
                    )}
                  </div>
                );
              }
              if (record.reference_number) {
                return <div>Ref: {record.reference_number}</div>;
              }
              return '-';
            },
          },
          {
            title: 'Notes',
            dataIndex: 'notes',
            key: 'notes',
            render: (notes: string) => notes || '-',
          },
          {
            title: 'Paid By',
            dataIndex: 'paid_by_name',
            key: 'paid_by_name',
            render: (name: string) => name || '-',
          },
        ];

        // Calculate payment summary
        const totalPaid = paymentList.reduce(
          (sum: number, payment: any) =>
            sum + (Number(payment.payment_amount) || 0),
          0
        );

        // Determine advance payments (payments made before goods received)
        const advancePayments = paymentList.filter((payment: any) => {
          // If payment date is before any GRN date, or if PO was sent/confirmed when payment was made
          // For simplicity, we'll check if payment was made when PO status was sent/confirmed
          // This is a heuristic - in production, you'd track this in the payment record
          return (
            payment.payment_type === 'advance' ||
            (payment.payment_date &&
              purchaseOrder?.actual_delivery_date &&
              new Date(payment.payment_date) <
                new Date(purchaseOrder.actual_delivery_date))
          );
        });

        const advanceTotal = advancePayments.reduce(
          (sum: number, payment: any) =>
            sum + (Number(payment.payment_amount) || 0),
          0
        );

        const normalTotal = totalPaid - advanceTotal;
        const totalAmount = Number(purchaseOrder?.total_amount) || 0;
        const outstandingAmount =
          Number(purchaseOrder?.outstanding_amount) || 0;
        const isFullyPaid = outstandingAmount <= 0;

        return (
          <>
            {/* Payment Summary Card */}
            <div
              style={{
                background: '#f6f8fa',
                padding: 16,
                borderRadius: 8,
                marginBottom: 16,
                border: '1px solid #e8e8e8',
              }}
            >
              <Space
                direction="vertical"
                style={{ width: '100%' }}
                size="small"
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Text strong style={{ fontSize: '14px' }}>
                    Payment Summary
                  </Text>
                  {isFullyPaid && (
                    <Tag color="green" icon={<CheckCircleOutlined />}>
                      Fully Paid
                    </Tag>
                  )}
                </div>
                <Divider style={{ margin: '8px 0' }} />
                <div
                  style={{ display: 'flex', justifyContent: 'space-between' }}
                >
                  <Text>Total Amount:</Text>
                  <Text strong>
                    ₹
                    {totalAmount.toLocaleString('en-IN', {
                      minimumFractionDigits: 2,
                    })}
                  </Text>
                </div>
                <div
                  style={{ display: 'flex', justifyContent: 'space-between' }}
                >
                  <Text>Total Paid:</Text>
                  <Text strong style={{ color: '#52c41a' }}>
                    ₹
                    {totalPaid.toLocaleString('en-IN', {
                      minimumFractionDigits: 2,
                    })}
                  </Text>
                </div>
                {advanceTotal > 0 && (
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '12px',
                      color: '#666',
                    }}
                  >
                    <Text> Advance Payments:</Text>
                    <Text>
                      ₹
                      {advanceTotal.toLocaleString('en-IN', {
                        minimumFractionDigits: 2,
                      })}
                    </Text>
                  </div>
                )}
                {normalTotal > 0 && (
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '12px',
                      color: '#666',
                    }}
                  >
                    <Text> └ Normal Payments:</Text>
                    <Text>
                      ₹
                      {normalTotal.toLocaleString('en-IN', {
                        minimumFractionDigits: 2,
                      })}
                    </Text>
                  </div>
                )}
                <div
                  style={{ display: 'flex', justifyContent: 'space-between' }}
                >
                  <Text strong>Outstanding:</Text>
                  <Text
                    strong
                    style={{
                      color: outstandingAmount > 0 ? '#ff4d4f' : '#52c41a',
                    }}
                  >
                    ₹
                    {outstandingAmount.toLocaleString('en-IN', {
                      minimumFractionDigits: 2,
                    })}
                  </Text>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '12px',
                    color: '#666',
                  }}
                >
                  <Text>Total Payments:</Text>
                  <Text>
                    {paymentList.length} transaction
                    {paymentList.length !== 1 ? 's' : ''}
                  </Text>
                </div>
              </Space>
            </div>

            <Table
              columns={paymentColumns}
              dataSource={paymentList}
              rowKey={record => record._id || record.id}
              pagination={false}
              size="small"
              bordered
            />
          </>
        );
      })()}

      {purchaseOrder.notes && (
        <>
          <Divider orientation="left">Notes</Divider>
          <div
            style={{
              padding: '12px',
              background: '#fafafa',
              borderRadius: '4px',
            }}
          >
            {purchaseOrder.notes}
          </div>
        </>
      )}

      {purchaseOrder.terms_conditions && (
        <>
          <Divider orientation="left">Terms & Conditions</Divider>
          <div
            style={{
              padding: '12px',
              background: '#fafafa',
              borderRadius: '4px',
            }}
          >
            {purchaseOrder.terms_conditions}
          </div>
        </>
      )}
    </Modal>
  );
};

export default POViewModal;
