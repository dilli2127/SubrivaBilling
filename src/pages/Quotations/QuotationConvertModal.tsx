import React, { useState, useEffect, useMemo } from 'react';
import {
  Modal,
  Form,
  Input,
  DatePicker,
  Select,
  InputNumber,
  message,
  Space,
  Tag,
  Alert,
  Divider,
  Descriptions,
  Table,
  Row,
  Col,
  Checkbox,
} from 'antd';
import {
  FileSyncOutlined,
  WarningOutlined,
  DollarOutlined,
  DatabaseOutlined,
} from '@ant-design/icons';
import { useConvertQuotationToInvoiceMutation } from '../../services/redux/api/endpoints';
import dayjs from 'dayjs';
import { getCurrentUser } from '../../helpers/auth';

const { TextArea } = Input;
const { Option } = Select;

interface QuotationConvertModalProps {
  open: boolean;
  onClose: () => void;
  quotation: any;
  onSuccess?: () => void;
}

const QuotationConvertModal: React.FC<QuotationConvertModalProps> = ({
  open,
  onClose,
  quotation,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [convertQuotation, { isLoading }] = useConvertQuotationToInvoiceMutation();
  const currentUser = getCurrentUser();
  const lineItems = quotation?.items || [];
  const hasLineItems = lineItems.length > 0;
  
  // Watch payment status for conditional rendering
  const isPaid = Form.useWatch('is_paid', form);
  const isPartiallyPaid = Form.useWatch('is_partially_paid', form);
  
  // Extract stock audit data from quotation items (already populated by API)
  // No need for separate API call - quotation API already includes stock_audit data
  const relevantStockAudit = useMemo(() => {
    if (!lineItems || lineItems.length === 0) return [];
    return lineItems
      .filter((item: any) => item.stock_audit && item.stock_audit._id) // Only items with stock audit
      .map((item: any) => ({
        ...item.stock_audit,
        // Add product info from item for display
        product_name: item.product_name,
        variant_name: item.variant_name,
        product_id: item.product_id,
        required_quantity: Number(item.quantity) || 0, // Required quantity from quotation
      }));
  }, [lineItems]);
  
  // Check if there's any insufficient stock
  const hasInsufficientStock = useMemo(() => {
    return relevantStockAudit.some((stock: any) => {
      const availableQty = Number(stock.available_quantity) || 0;
      const requiredQty = Number(stock.required_quantity) || 0;
      return availableQty < requiredQty;
    });
  }, [relevantStockAudit]);
  const lineItemColumns = useMemo(
    () => [
      {
        title: '#',
        key: 'index',
        width: 50,
        render: (_: any, __: any, index: number) => index + 1,
      },
      {
        title: 'Product',
        dataIndex: 'product_name',
        key: 'product_name',
        render: (text: string, record: any) => (
          <div>
            <strong>{text || '-'}</strong>
            {record.variant_name && (
              <div style={{ fontSize: 12, color: '#888' }}>{record.variant_name}</div>
            )}
          </div>
        ),
      },
      {
        title: 'Qty',
        dataIndex: 'quantity',
        key: 'quantity',
        align: 'right' as const,
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
    ],
    []
  );
  
  // Initialize form when quotation changes
  useEffect(() => {
    if (quotation && open) {
      form.setFieldsValue({
        invoice_date: dayjs(),
        payment_mode: 'cash',
        is_paid: false,
        is_partially_paid: false,
        paid_amount: 0,
        notes: `Converted from Quotation ${quotation.quotation_number}`,
      });
    }
  }, [quotation, open, form]);
  
  // Validate stock availability before conversion
  const validateStockAvailability = () => {
    const insufficientStockItems: string[] = [];
    
    lineItems.forEach((item: any) => {
      if (item.stock_audit && item.stock_audit._id) {
        const availableQty = Number(item.stock_audit.available_quantity) || 0;
        const requiredQty = Number(item.quantity) || 0;
        
        if (availableQty < requiredQty) {
          insufficientStockItems.push(
            `${item.product_name}${item.variant_name ? ` (${item.variant_name})` : ''} - Available: ${availableQty}, Required: ${requiredQty}`
          );
        }
      }
    });
    
    return insufficientStockItems;
  };
  
  // Handle submit
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      if (!quotation?._id) {
        message.error('Quotation not found');
        return;
      }
      
      // Validate stock availability
      const insufficientStock = validateStockAvailability();
      if (insufficientStock.length > 0) {
        message.error({
          content: (
            <div>
              <div style={{ marginBottom: 8, fontWeight: 'bold' }}>Insufficient stock available:</div>
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                {insufficientStock.map((item, index) => (
                  <li key={index} style={{ marginBottom: 4 }}>{item}</li>
                ))}
              </ul>
            </div>
          ),
          duration: 8,
        });
        return;
      }
      
      // Validate payment amount
      if (values.is_partially_paid && (!values.paid_amount || values.paid_amount <= 0)) {
        message.error('Please enter paid amount for partial payment');
        return;
      }
      
      if (values.is_paid && values.paid_amount !== quotation.total_amount) {
        form.setFieldsValue({ paid_amount: quotation.total_amount });
        values.paid_amount = quotation.total_amount;
      }
      
      const payload = {
        id: quotation._id,
        invoice_date: values.invoice_date ? dayjs(values.invoice_date).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'),
        payment_mode: values.payment_mode || 'cash',
        is_paid: values.is_paid || false,
        is_partially_paid: values.is_partially_paid || false,
        paid_amount: values.is_paid ? quotation.total_amount : (values.paid_amount || 0),
        notes: values.notes || '',
      };
      
      const result: any = await convertQuotation(payload).unwrap();
      
      if (result?.statusCode === 200 || result?.data) {
        message.success('Quotation converted to invoice successfully!');
        form.resetFields();
        onSuccess?.();
        onClose();
      } else {
        throw new Error(result?.message || 'Failed to convert quotation');
      }
    } catch (error: any) {
      console.error('Convert quotation error:', error);
      message.error(error?.data?.message || error?.message || 'Failed to convert quotation');
    }
  };
  
  // Handle payment mode change
  const handlePaymentModeChange = (value: string) => {
    form.setFieldsValue({ payment_mode: value });
  };
  
  // Handle payment status change
  const handlePaymentStatusChange = (isPaid: boolean, isPartiallyPaid: boolean) => {
    if (isPaid) {
      form.setFieldsValue({ 
        is_partially_paid: false,
        paid_amount: quotation?.total_amount || 0,
      });
    } else if (isPartiallyPaid) {
      form.setFieldsValue({ is_paid: false });
    } else {
      form.setFieldsValue({ paid_amount: 0 });
    }
  };
  
  if (!quotation) {
    return null;
  }
  
  return (
    <Modal
      title={
        <Space>
          <FileSyncOutlined />
          <span>Convert Quotation to Invoice</span>
        </Space>
      }
      open={open}
      onCancel={onClose}
      onOk={handleSubmit}
      confirmLoading={isLoading}
      width={1000}
      okText="Convert to Invoice"
      cancelText="Cancel"
    >
      <Alert
        message="Converting Quotation to Invoice"
        description={`This will create a new sales record/invoice from quotation ${quotation.quotation_number}. Stock will be deducted automatically.`}
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />
      
      {/* Quotation Summary */}
      <Descriptions bordered column={2} size="small" style={{ marginBottom: 16 }}>
        <Descriptions.Item label="Quotation Number">
          <Tag color="blue">{quotation.quotation_number}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Customer">
          {quotation.customer?.full_name || quotation.customer?.name || quotation.customer?.customer_name || quotation.CustomerItem?.customer_name || quotation.CustomerItem?.full_name || quotation.CustomerItem?.name || quotation.customer_name || quotation.full_name || quotation.name || '-'}
        </Descriptions.Item>
        <Descriptions.Item label="Total Items">
          {quotation.items?.length || 0} items
        </Descriptions.Item>
        <Descriptions.Item label="Total Amount">
          <strong style={{ color: '#52c41a', fontSize: '16px' }}>
            <DollarOutlined /> ₹{(quotation.total_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </strong>
        </Descriptions.Item>
      </Descriptions>
      
      {hasLineItems && (
        <>
          <Divider />
          <Table
            columns={lineItemColumns}
            dataSource={lineItems}
            size="small"
            pagination={false}
            bordered
            rowKey={(record, index) => record?._id || `convert-item-${index}`}
            scroll={{ y: 260 }}
            title={() => (
              <Space>
                <FileSyncOutlined />
                <span>Items / Stock List</span>
              </Space>
            )}
            summary={() => (
              <Table.Summary fixed>
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={4} align="right">
                    Subtotal
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1} colSpan={2} align="right">
                    <strong>
                      ₹{(quotation.subtotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </strong>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
                {quotation.discount_amount > 0 && (
                  <Table.Summary.Row>
                    <Table.Summary.Cell index={0} colSpan={4} align="right">
                      Discount
                    </Table.Summary.Cell>
                    <Table.Summary.Cell index={1} colSpan={2} align="right">
                      <strong style={{ color: '#ff4d4f' }}>
                        -₹{(quotation.discount_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </strong>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                )}
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={4} align="right">
                    Tax Amount
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1} colSpan={2} align="right">
                    <strong>
                      ₹{(quotation.tax_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </strong>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
                <Table.Summary.Row>
                  <Table.Summary.Cell index={0} colSpan={4} align="right">
                    <strong style={{ fontSize: 16, color: '#52c41a' }}>Grand Total</strong>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={1} colSpan={2} align="right">
                    <strong style={{ fontSize: 16, color: '#52c41a' }}>
                      ₹{(quotation.total_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </strong>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              </Table.Summary>
            )}
          />
        </>
      )}
      
      <Divider />
      
      {/* Stock Audit Details */}
      {hasLineItems && relevantStockAudit.length > 0 && (
        <>
          {hasInsufficientStock && (
            <Alert
              message="Insufficient Stock Warning"
              description="Some products have insufficient available stock. Please check the stock audit details below. Invoice conversion will be blocked if stock is insufficient."
              type="warning"
              showIcon
              style={{ marginBottom: 16 }}
            />
          )}
          <div style={{ marginBottom: 16 }}>
            <Space style={{ marginBottom: 8 }}>
              <DatabaseOutlined />
              <strong>Stock Audit Details</strong>
            </Space>
            <Table
              columns={[
                {
                  title: 'Product',
                  key: 'product',
                  render: (_: any, record: any) => (
                    <div>
                      <strong>{record.product_name || '-'}</strong>
                      {record.variant_name && (
                        <div style={{ fontSize: 12, color: '#888' }}>
                          {record.variant_name}
                        </div>
                      )}
                    </div>
                  ),
                },
                {
                  title: 'Batch No',
                  dataIndex: 'batch_no',
                  key: 'batch_no',
                  render: (text: string) => (
                    <Tag color="purple">{text || '-'}</Tag>
                  ),
                },
                {
                  title: 'Required Qty',
                  dataIndex: 'required_quantity',
                  key: 'required_quantity',
                  align: 'right' as const,
                  render: (qty: number) => (
                    <strong>{qty || 0}</strong>
                  ),
                },
                {
                  title: 'Available Qty',
                  dataIndex: 'available_quantity',
                  key: 'available_quantity',
                  align: 'right' as const,
                  render: (qty: number, record: any) => {
                    const availableQty = Number(qty) || 0;
                    const requiredQty = Number(record.required_quantity) || 0;
                    const isInsufficient = availableQty < requiredQty;
                    return (
                      <Tag color={isInsufficient ? 'red' : availableQty > 0 ? 'green' : 'red'}>
                        {availableQty}
                        {isInsufficient && (
                          <span style={{ marginLeft: 4, fontSize: 11 }}>
                            ⚠️ Insufficient
                          </span>
                        )}
                      </Tag>
                    );
                  },
                },
                {
                  title: 'Buy Price',
                  dataIndex: 'buy_price',
                  key: 'buy_price',
                  align: 'right' as const,
                  render: (price: any) => {
                    const numPrice = Number(price) || 0;
                    return `₹${numPrice.toFixed(2)}`;
                  },
                },
                {
                  title: 'Expiry Date',
                  dataIndex: 'expiry_date',
                  key: 'expiry_date',
                  render: (date: string) => {
                    if (!date) return '-';
                    const expiryDate = dayjs(date);
                    const today = dayjs();
                    const isExpired = expiryDate.isBefore(today);
                    const isNearExpiry = expiryDate.diff(today, 'days') <= 30 && expiryDate.diff(today, 'days') > 0;
                    let color = 'green';
                    if (isExpired) color = 'red';
                    else if (isNearExpiry) color = 'orange';
                    return (
                      <Tag color={color}>
                        {expiryDate.format('DD/MM/YYYY')}
                      </Tag>
                    );
                  },
                },
              ]}
              dataSource={relevantStockAudit}
              size="small"
              pagination={false}
              bordered
              rowKey={(record: any) => record._id || `stock-${Math.random()}`}
              scroll={{ y: 200 }}
            />
          </div>
          <Divider />
        </>
      )}
      
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          invoice_date: dayjs(),
          payment_mode: 'cash',
          is_paid: false,
          is_partially_paid: false,
          paid_amount: 0,
        }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="invoice_date"
              label="Invoice Date"
              rules={[{ required: true, message: 'Invoice date is required' }]}
            >
              <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="payment_mode"
              label="Payment Mode"
              rules={[{ required: true, message: 'Payment mode is required' }]}
            >
              <Select onChange={handlePaymentModeChange}>
                <Option value="cash">Cash</Option>
                <Option value="card">Card</Option>
                <Option value="upi">UPI</Option>
                <Option value="bank_transfer">Bank Transfer</Option>
                <Option value="cheque">Cheque</Option>
                <Option value="credit">Credit</Option>
                <Option value="other">Other</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
        
        <Form.Item label="Payment Status">
          <Space size="large">
            <Form.Item
              name="is_paid"
              valuePropName="checked"
              noStyle
            >
              <Checkbox
                onChange={(e) => {
                  handlePaymentStatusChange(e.target.checked, false);
                }}
              >
                Fully Paid
              </Checkbox>
            </Form.Item>
            <Form.Item
              name="is_partially_paid"
              valuePropName="checked"
              noStyle
            >
              <Checkbox
                onChange={(e) => {
                  handlePaymentStatusChange(false, e.target.checked);
                }}
              >
                Partially Paid
              </Checkbox>
            </Form.Item>
          </Space>
        </Form.Item>
        
        {(isPartiallyPaid || isPaid) && (
          <Form.Item
            name="paid_amount"
            label="Paid Amount"
            rules={[
              { required: true, message: 'Paid amount is required' },
              {
                validator: (_: any, value: number) => {
                  if (value > (quotation?.total_amount || 0)) {
                    return Promise.reject('Paid amount cannot exceed total amount');
                  }
                  return Promise.resolve();
                },
              },
            ]}
          >
            <InputNumber
              min={0}
              max={quotation?.total_amount || 0}
              precision={2}
              style={{ width: '100%' }}
              prefix="₹"
              placeholder="Enter paid amount"
            />
          </Form.Item>
        )}
        
        <Form.Item
          name="notes"
          label="Notes"
        >
          <TextArea rows={3} placeholder="Additional notes for the invoice" />
        </Form.Item>
      </Form>
      
      <Alert
        message={<><WarningOutlined /> Important</>}
        description="Once converted, the quotation status will be updated to 'converted' and cannot be edited. Stock will be deducted automatically."
        type="warning"
        showIcon
        style={{ marginTop: 16 }}
      />
    </Modal>
  );
};

export default QuotationConvertModal;

