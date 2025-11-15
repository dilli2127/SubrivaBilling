import React, { useMemo } from 'react';
import {
  Modal,
  Descriptions,
  Table,
  Tag,
  Divider,
  Space,
  Typography,
} from 'antd';
import {
  FileTextOutlined,
  CalendarOutlined,
  DollarOutlined,
  UserOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SendOutlined,
  WarningOutlined,
  FileSyncOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { apiSlice } from '../../services/redux/api/apiSlice';
import { QuotationStatus, Quotation, QuotationLineItem } from '../../types/quotation';

const { Text } = Typography;

interface QuotationViewModalProps {
  open: boolean;
  onClose: () => void;
  quotation: Quotation | null;
}

const QuotationViewModal: React.FC<QuotationViewModalProps> = ({
  open,
  onClose,
  quotation,
}) => {
  // Fetch customer by ID if customer is not populated
  const quotationAny = quotation as any; // API may return additional fields
  const shouldFetchCustomer =
    quotation &&
    !quotationAny.customer &&
    !quotation.CustomerItem &&
    quotation.customer_id &&
    open;
  const { data: customerData } = apiSlice.useGetCustomerByIdQuery(
    quotation?.customer_id || '',
    { skip: !shouldFetchCustomer }
  );

  // Get customer information
  const customerInfo = useMemo(() => {
    if (!quotation) return null;

    // Priority 1: Check for populated customer object (lowercase 'customer')
    if (quotationAny.customer && (quotationAny.customer.customer_name || quotationAny.customer.full_name || quotationAny.customer.name)) {
      return {
        customer_name: quotationAny.customer.customer_name || quotationAny.customer.full_name || quotationAny.customer.name,
        company_name: quotationAny.customer.company_name,
        email: quotationAny.customer.email,
        phone: quotationAny.customer.phone || quotationAny.customer.mobile,
        address: quotationAny.customer.address,
        gst_number: quotationAny.customer.gst_number,
      };
    }

    // Priority 2: Check for CustomerItem (capital C, with 'Item' suffix)
    if (quotation.CustomerItem) {
      const customerItem = quotation.CustomerItem as any;
      if (customerItem.customer_name || customerItem.full_name || customerItem.name) {
        return {
          customer_name: customerItem.customer_name || customerItem.full_name || customerItem.name,
          company_name: customerItem.company_name,
          email: customerItem.email,
          phone: customerItem.phone || customerItem.mobile,
          address: customerItem.address,
          gst_number: customerItem.gst_number,
        };
      }
    }

    // Priority 3: Fetch customer by ID if not populated
    if (shouldFetchCustomer && customerData) {
      const customer = (customerData as any)?.result || customerData;
      if (customer && (customer.customer_name || customer.full_name || customer.name)) {
        return {
          customer_name: customer.customer_name || customer.full_name || customer.name,
          company_name: customer.company_name,
          email: customer.email,
          phone: customer.phone || customer.mobile || customer.contact_number,
          address: customer.address,
          gst_number: customer.gst_number,
        };
      }
    }

    // Priority 4: Check for direct fields on quotation
    if (quotation.customer_name || quotationAny.full_name || quotationAny.name) {
      return {
        customer_name: quotation.customer_name || quotationAny.full_name || quotationAny.name,
        company_name: quotationAny.customer_company_name || quotationAny.company_name,
        email: quotation.customer_email || quotationAny.email,
        phone: quotation.customer_phone || quotationAny.mobile || quotationAny.phone,
        address: quotationAny.customer_address || quotationAny.address,
      };
    }

    return null;
  }, [quotation, customerData, shouldFetchCustomer]);

  // Status configuration
  const statusConfig: Record<QuotationStatus, { color: string; icon: React.ReactNode; label: string }> = {
    draft: { color: 'default', icon: <FileTextOutlined />, label: 'Draft' },
    sent: { color: 'processing', icon: <SendOutlined />, label: 'Sent' },
    accepted: { color: 'success', icon: <CheckCircleOutlined />, label: 'Accepted' },
    rejected: { color: 'error', icon: <CloseCircleOutlined />, label: 'Rejected' },
    expired: { color: 'warning', icon: <WarningOutlined />, label: 'Expired' },
    converted: { color: 'green', icon: <FileSyncOutlined />, label: 'Converted' },
  };

  const status = (quotation?.status || 'draft') as QuotationStatus;
  const statusInfo = statusConfig[status] || statusConfig.draft;

  // Line items columns
  const lineItemsColumns = [
    {
      title: '#',
      key: 'index',
      width: 50,
      render: (_: unknown, __: unknown, index: number) => index + 1,
    },
    {
      title: 'Product',
      dataIndex: 'product_name',
      key: 'product_name',
      render: (text: string, record: QuotationLineItem) => (
        <div>
          <strong>{text || '-'}</strong>
          {record.variant_name && (
            <div style={{ fontSize: '12px', color: '#888' }}>
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
      render: (text: string) => text || '-',
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      align: 'right' as const,
      render: (qty: number) => qty || 0,
    },
    {
      title: 'Unit Price',
      dataIndex: 'unit_price',
      key: 'unit_price',
      align: 'right' as const,
      render: (price: number) => `₹${(price || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
    },
    {
      title: 'Tax %',
      dataIndex: 'tax_percentage',
      key: 'tax_percentage',
      align: 'right' as const,
      render: (tax: number) => `${tax || 0}%`,
    },
    {
      title: 'Discount',
      dataIndex: 'discount',
      key: 'discount',
      align: 'right' as const,
      render: (discount: number, record: any) => {
        if (!discount) return '-';
        const type = record.discount_type === 'amount' ? '₹' : '%';
        return `${type}${discount}`;
      },
    },
    {
      title: 'Line Total',
      dataIndex: 'line_total',
      key: 'line_total',
      align: 'right' as const,
      render: (total: number) => (
        <strong style={{ color: '#52c41a' }}>
          ₹{(total || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </strong>
      ),
    },
  ];

  if (!quotation) {
    return null;
  }

  const isExpired = quotation.valid_until && 
    dayjs(quotation.valid_until).isBefore(dayjs()) &&
    !['converted', 'rejected'].includes(status);

  return (
    <Modal
      title={
        <Space>
          <FileTextOutlined />
          <span>Quotation Details</span>
          <Tag color={statusInfo.color} icon={statusInfo.icon}>
            {statusInfo.label}
          </Tag>
        </Space>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width={1000}
      style={{ top: 20 }}
    >
      <div style={{ maxHeight: '80vh', overflowY: 'auto' }}>
        {/* Quotation Header */}
        <Descriptions bordered column={2} size="small">
          <Descriptions.Item label="Quotation Number" span={1}>
            <Tag color="blue" icon={<FileTextOutlined />}>
              {quotation.quotation_number}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Quotation Date" span={1}>
            <Space>
              <CalendarOutlined />
              {quotation.quotation_date 
                ? dayjs(quotation.quotation_date).format('DD/MM/YYYY')
                : '-'}
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="Valid Until" span={1}>
            <Space>
              <CalendarOutlined />
              {quotation.valid_until ? (
                <span style={{ color: isExpired ? '#ff4d4f' : 'inherit' }}>
                  {dayjs(quotation.valid_until).format('DD/MM/YYYY')}
                  {isExpired && (
                    <Tag color="red" style={{ marginLeft: 8 }}>
                      EXPIRED
                    </Tag>
                  )}
                </span>
              ) : (
                '-'
              )}
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="Status" span={1}>
            <Tag color={statusInfo.color} icon={statusInfo.icon}>
              {statusInfo.label}
            </Tag>
          </Descriptions.Item>
        </Descriptions>

        <Divider />

        {/* Customer Information */}
        <Descriptions title="Customer Information" bordered column={2} size="small">
          <Descriptions.Item label="Customer Name" span={1}>
            <Space>
              <UserOutlined />
              <strong>{customerInfo?.customer_name || quotation.customer_name || '-'}</strong>
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="Email" span={1}>
            {customerInfo?.email || quotation.customer_email || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Phone" span={1}>
            {customerInfo?.phone || quotation.customer_phone || '-'}
          </Descriptions.Item>
          {customerInfo?.gst_number && (
            <Descriptions.Item label="GST Number" span={1}>
              {customerInfo.gst_number}
            </Descriptions.Item>
          )}
          {customerInfo?.address && (
            <Descriptions.Item label="Address" span={2}>
              {customerInfo.address}
            </Descriptions.Item>
          )}
        </Descriptions>
        
        {/* GST Information */}
        <Divider />
        <Descriptions bordered column={1} size="small">
          <Descriptions.Item label="GST Status">
            <Tag color={quotation.is_gst_included ? 'green' : 'orange'}>
              {quotation.is_gst_included ? 'GST INCLUDED' : 'GST EXCLUDED'}
            </Tag>
            <span style={{ marginLeft: 8, fontSize: '12px', color: '#888' }}>
              {quotation.is_gst_included 
                ? 'Tax is included in the prices shown' 
                : 'Tax will be added on top of the prices shown'}
            </span>
          </Descriptions.Item>
        </Descriptions>

        <Divider />

        {/* Line Items */}
        <div>
          <Text strong style={{ fontSize: '16px' }}>
            Line Items ({quotation.items?.length || 0})
          </Text>
          <Table
            columns={lineItemsColumns}
            dataSource={quotation.items || []}
            pagination={false}
            size="small"
            bordered
            style={{ marginTop: 12 }}
            rowKey={(record, index) => `item-${index}`}
            summary={() => {
              const subtotal = quotation.subtotal || 0;
              const taxAmount = quotation.tax_amount || 0;
              const discountAmount = quotation.discount_amount || 0;
              const total = quotation.total_amount || 0;

              return (
                <Table.Summary fixed>
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} colSpan={6} align="right">
                      <strong>Subtotal:</strong>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1} align="right">
                      <strong>₹{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                  {discountAmount > 0 && (
                    <Table.Summary.Row>
                      <Table.Summary.Cell index={0} colSpan={6} align="right">
                        <strong>Discount:</strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={1} align="right">
                        <strong style={{ color: '#ff4d4f' }}>
                          -₹{discountAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </strong>
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                  )}
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} colSpan={6} align="right">
                      <strong>Tax Amount:</strong>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1} align="right">
                      <strong>₹{taxAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} colSpan={6} align="right">
                      <strong style={{ fontSize: '16px', color: '#52c41a' }}>
                        <DollarOutlined /> Total Amount:
                      </strong>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1} align="right">
                      <strong style={{ fontSize: '16px', color: '#52c41a' }}>
                        ₹{total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </strong>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                </Table.Summary>
              );
            }}
          />
        </div>

        {/* Conversion Info */}
        {(quotation.converted_to_invoice_no || quotation.converted_to_sales_record_id) && (
          <>
            <Divider />
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="Converted To Invoice">
                <Tag color="green" icon={<FileSyncOutlined />}>
                  {quotation.converted_to_invoice_no || quotation.converted_to_sales_record_id}
                </Tag>
                {quotation.converted_date && (
                  <span style={{ marginLeft: 8, color: '#888' }}>
                    on {dayjs(quotation.converted_date).format('DD/MM/YYYY')}
                  </span>
                )}
              </Descriptions.Item>
            </Descriptions>
          </>
        )}

        {/* Notes & Terms */}
        {(quotation.notes || quotation.terms_conditions) && (
          <>
            <Divider />
            {quotation.notes && (
              <div style={{ marginBottom: 16 }}>
                <Text strong>Notes:</Text>
                <div style={{ marginTop: 8, padding: 12, background: '#f5f5f5', borderRadius: 4 }}>
                  {quotation.notes}
                </div>
              </div>
            )}
            {quotation.terms_conditions && (
              <div>
                <Text strong>Terms & Conditions:</Text>
                <div style={{ marginTop: 8, padding: 12, background: '#f5f5f5', borderRadius: 4 }}>
                  {quotation.terms_conditions}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Modal>
  );
};

export default QuotationViewModal;

