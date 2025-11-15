import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Modal,
  Form,
  Input,
  DatePicker,
  Table,
  InputNumber,
  message,
  Space,
  Tag,
  Button,
  Alert,
  Checkbox,
  Divider,
  Statistic,
  Row,
  Col,
  Select,
} from 'antd';
import {
  InboxOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  CalendarOutlined,
} from '@ant-design/icons';
import { useConvertPOToGRNMutation } from '../../services/redux/api/endpoints';
import dayjs from 'dayjs';

interface POReceiveModalProps {
  open: boolean;
  onClose: () => void;
  purchaseOrder: any;
}

const POReceiveModal: React.FC<POReceiveModalProps> = ({
  open,
  onClose,
  purchaseOrder,
}) => {
  const [form] = Form.useForm();
  const [lineItems, setLineItems] = useState<any[]>([]);
  const [createStockEntries, setCreateStockEntries] = useState(true);
  const [shippingCost, setShippingCost] = useState<number>(0);
  
  const [convertToGRN, { isLoading }] = useConvertPOToGRNMutation();
  
  // Initialize line items when PO changes
  useEffect(() => {
    if (purchaseOrder?.items) {
      const items = purchaseOrder.items.map((item: any) => ({
        ...item,
        po_line_item_id: item._id,
        ordered_quantity: item.quantity,
        received_quantity: item.pending_quantity || (item.quantity - (item.received_quantity || 0)),
        rejected_quantity: 0,
        accepted_quantity: item.pending_quantity || (item.quantity - (item.received_quantity || 0)),
        batch_no: '',
        mfg_date: undefined,
        expiry_date: undefined,
        notes: '',
        // Price, tax, and discount - use existing if available, otherwise 0 (to be filled)
        unit_price: item.unit_price || 0,
        tax_percentage: item.tax_percentage || 0,
        discount: item.discount || 0,
        discount_type: item.discount_type || 'percentage',
      }));
      setLineItems(items);
    }
    // Initialize shipping cost from PO if available, otherwise reset to 0
    if (purchaseOrder?.shipping_cost) {
      setShippingCost(purchaseOrder.shipping_cost);
    } else {
      setShippingCost(0);
    }
  }, [purchaseOrder]);
  
  // Calculate accepted quantity when received/rejected changes
  const handleQuantityChange = useCallback((index: number, field: string, value: number) => {
    const newItems = [...lineItems];
    newItems[index][field] = value;
    
    if (field === 'received_quantity' || field === 'rejected_quantity') {
      newItems[index].accepted_quantity = 
        (newItems[index].received_quantity || 0) - (newItems[index].rejected_quantity || 0);
    }
    
    setLineItems(newItems);
  }, [lineItems]);
  
  // Handle field change
  const handleFieldChange = useCallback((index: number, field: string, value: any) => {
    const newItems = [...lineItems];
    newItems[index][field] = value;
    setLineItems(newItems);
  }, [lineItems]);
  
  // Handle submit
  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      // Validate at least one item received
      const hasReceivedItems = lineItems.some(item => item.accepted_quantity > 0);
      if (!hasReceivedItems) {
        message.error('Please receive at least one item');
        return;
      }
      
      // Validate expiry date is required for all received items
      const itemsWithReceivedQuantity = lineItems.filter(item => item.received_quantity > 0);
      const missingExpiryDates = itemsWithReceivedQuantity.filter(item => !item.expiry_date);
      if (missingExpiryDates.length > 0) {
        message.error('Expiry date is required for all received items');
        return;
      }
      
      // Validate price and tax are required for all received items
      const missingPrice = itemsWithReceivedQuantity.filter(item => !item.unit_price || item.unit_price <= 0);
      if (missingPrice.length > 0) {
        message.error('Unit price is required for all received items');
        return;
      }
      const missingTax = itemsWithReceivedQuantity.filter(item => item.tax_percentage === undefined || item.tax_percentage === null);
      if (missingTax.length > 0) {
        message.error('Tax percentage is required for all received items');
        return;
      }
      
      // Prepare items data
      const items = lineItems
        .filter(item => item.received_quantity > 0)
        .map(item => ({
          po_line_item_id: item.po_line_item_id,
          received_quantity: item.received_quantity,
          rejected_quantity: item.rejected_quantity || 0,
          batch_no: item.batch_no,
          mfg_date: item.mfg_date ? dayjs(item.mfg_date).format('YYYY-MM-DD') : undefined,
          expiry_date: item.expiry_date ? dayjs(item.expiry_date).format('YYYY-MM-DD') : undefined,
          notes: item.notes,
          // Include price, tax, and discount from receipt
          unit_price: item.unit_price,
          tax_percentage: item.tax_percentage,
          discount: item.discount || 0,
          discount_type: item.discount_type || 'percentage',
        }));
      
      const payload = {
        id: purchaseOrder._id,
        items,
        vendor_invoice_no: values.vendor_invoice_no,
        vendor_invoice_date: values.vendor_invoice_date ? 
          dayjs(values.vendor_invoice_date).format('YYYY-MM-DD') : undefined,
        notes: values.notes,
        shipping_cost: shippingCost || 0,
        create_stock_entries: createStockEntries,
      };
      
      await convertToGRN(payload).unwrap();
      
      message.success('Goods received successfully!');
      form.resetFields();
      onClose();
    } catch (error: any) {
      message.error(error?.data?.message || 'Failed to receive goods');
    }
  };
  
  // Calculate totals
  const totals = {
    ordered: lineItems.reduce((sum, item) => sum + (item.ordered_quantity || 0), 0),
    received: lineItems.reduce((sum, item) => sum + (item.received_quantity || 0), 0),
    rejected: lineItems.reduce((sum, item) => sum + (item.rejected_quantity || 0), 0),
    accepted: lineItems.reduce((sum, item) => sum + (item.accepted_quantity || 0), 0),
  };
  
  // Calculate financial totals for received items
  const financialTotals = useMemo(() => {
    const receivedItems = lineItems.filter(item => item.received_quantity > 0);
    let subtotal = 0;
    let discountAmount = 0;
    let taxAmount = 0;
    
    receivedItems.forEach(item => {
      const qty = item.accepted_quantity || 0;
      const price = Number(item.unit_price) || 0;
      const taxPct = Number(item.tax_percentage) || 0;
      const discountVal = Number(item.discount) || 0;
      const discountType = item.discount_type || 'percentage';
      
      if (price > 0) {
        let itemSubtotal = qty * price;
        
        // Apply discount
        let itemDiscount = 0;
        if (discountType === 'percentage') {
          itemDiscount = itemSubtotal * (discountVal / 100);
        } else {
          itemDiscount = discountVal;
        }
        itemSubtotal = itemSubtotal - itemDiscount;
        
        subtotal += itemSubtotal;
        discountAmount += itemDiscount;
        taxAmount += itemSubtotal * (taxPct / 100);
      }
    });
    
    const shipping = Number(shippingCost) || 0;
    const total = subtotal + taxAmount + shipping;
    
    return {
      subtotal: Number(subtotal.toFixed(2)),
      discountAmount: Number(discountAmount.toFixed(2)),
      taxAmount: Number(taxAmount.toFixed(2)),
      shippingCost: Number(shipping.toFixed(2)),
      total: Number(total.toFixed(2)),
    };
  }, [lineItems, shippingCost]);
  
  // Table columns
  const columns = [
    {
      title: 'Product',
      key: 'product',
      width: 200,
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
      title: 'Ordered Qty',
      dataIndex: 'ordered_quantity',
      key: 'ordered_quantity',
      width: 100,
      render: (qty: number) => <Tag color="blue">{qty}</Tag>,
    },
    {
      title: 'Already Received',
      dataIndex: 'received_quantity',
      key: 'already_received',
      width: 120,
      render: (qty: number, record: any) => {
        const alreadyReceived = record.ordered_quantity - record.pending_quantity;
        return alreadyReceived > 0 ? (
          <Tag color="green">{alreadyReceived}</Tag>
        ) : (
          <span style={{ color: '#999' }}>-</span>
        );
      },
    },
    {
      title: 'Pending',
      key: 'pending',
      width: 100,
      render: (record: any) => (
        <Tag color="orange">{record.pending_quantity || 0}</Tag>
      ),
    },
    {
      title: <span style={{ color: 'red' }}>* Receive Now</span>,
      key: 'receive_now',
      width: 120,
      render: (record: any, _: any, index: number) => (
        <InputNumber
          min={0}
          max={record.pending_quantity || record.ordered_quantity}
          value={record.received_quantity}
          onChange={(val) => handleQuantityChange(index, 'received_quantity', val || 0)}
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: 'Rejected',
      key: 'rejected',
      width: 100,
      render: (record: any, _: any, index: number) => (
        <InputNumber
          min={0}
          max={record.received_quantity}
          value={record.rejected_quantity}
          onChange={(val) => handleQuantityChange(index, 'rejected_quantity', val || 0)}
          style={{ width: '100%' }}
        />
      ),
    },
    {
      title: 'Accepted',
      dataIndex: 'accepted_quantity',
      key: 'accepted_quantity',
      width: 100,
      render: (qty: number) => (
        <strong style={{ color: '#52c41a' }}>{qty}</strong>
      ),
    },
    {
      title: (
        <span>
          Unit Price <span style={{ color: 'red' }}>*</span>
        </span>
      ),
      key: 'unit_price',
      width: 120,
      render: (record: any, _: any, index: number) => {
        const isRequired = record.received_quantity > 0;
        const hasError = isRequired && (!record.unit_price || record.unit_price <= 0);
        return (
          <InputNumber
            min={0}
            precision={2}
            placeholder="₹0.00"
            prefix="₹"
            style={{ 
              width: '100%',
              borderColor: hasError ? '#ff4d4f' : undefined
            }}
            value={record.unit_price}
            onChange={(val) => handleFieldChange(index, 'unit_price', val || 0)}
            disabled={record.received_quantity === 0}
            className={hasError ? 'ant-input-number-error' : ''}
          />
        );
      },
    },
    {
      title: (
        <span>
          GST % <span style={{ color: 'red' }}>*</span>
        </span>
      ),
      key: 'tax_percentage',
      width: 100,
      render: (record: any, _: any, index: number) => {
        const isRequired = record.received_quantity > 0;
        const hasError = isRequired && (record.tax_percentage === undefined || record.tax_percentage === null);
        return (
          <InputNumber
            min={0}
            max={100}
            precision={2}
            placeholder="18%"
            suffix="%"
            style={{ 
              width: '100%',
              borderColor: hasError ? '#ff4d4f' : undefined
            }}
            value={record.tax_percentage}
            onChange={(val) => handleFieldChange(index, 'tax_percentage', val || 0)}
            disabled={record.received_quantity === 0}
            className={hasError ? 'ant-input-number-error' : ''}
          />
        );
      },
    },
    {
      title: 'Discount',
      key: 'discount',
      width: 150,
      render: (record: any, _: any, index: number) => (
        <Space.Compact style={{ width: '100%' }}>
          <InputNumber
            min={0}
            precision={2}
            placeholder="0"
            style={{ width: '70%' }}
            value={record.discount}
            onChange={(val) => handleFieldChange(index, 'discount', val || 0)}
            disabled={record.received_quantity === 0}
          />
          <Select
            style={{ width: '30%' }}
            value={record.discount_type}
            onChange={(val) => handleFieldChange(index, 'discount_type', val)}
            disabled={record.received_quantity === 0}
          >
            <Select.Option value="percentage">%</Select.Option>
            <Select.Option value="amount">₹</Select.Option>
          </Select>
        </Space.Compact>
      ),
    },
    {
      title: 'Batch No',
      key: 'batch_no',
      width: 130,
      render: (record: any, _: any, index: number) => (
        <Input
          placeholder="Batch"
          value={record.batch_no}
          onChange={(e) => handleFieldChange(index, 'batch_no', e.target.value)}
        />
      ),
    },
    {
      title: 'MFG Date',
      key: 'mfg_date',
      width: 140,
      render: (record: any, _: any, index: number) => (
        <DatePicker
          format="YYYY-MM-DD"
          value={record.mfg_date ? dayjs(record.mfg_date) : undefined}
          onChange={(date) => handleFieldChange(index, 'mfg_date', date)}
          style={{ width: '100%' }}
          disabledDate={(current) => current && current > dayjs().endOf('day')}
        />
      ),
    },
    {
      title: (
        <span>
          Expiry Date <span style={{ color: 'red' }}>*</span>
        </span>
      ),
      key: 'expiry_date',
      width: 140,
      render: (record: any, _: any, index: number) => {
        const isRequired = record.received_quantity > 0;
        const hasError = isRequired && !record.expiry_date;
        return (
          <DatePicker
            format="YYYY-MM-DD"
            value={record.expiry_date ? dayjs(record.expiry_date) : undefined}
            onChange={(date) => handleFieldChange(index, 'expiry_date', date)}
            style={{ 
              width: '100%',
              borderColor: hasError ? '#ff4d4f' : undefined
            }}
            disabledDate={(current) => current && current < dayjs().endOf('day')}
            placeholder={isRequired ? "Required *" : "Select date"}
            className={hasError ? 'ant-picker-error' : ''}
          />
        );
      },
    },
  ];
  
  return (
    <Modal
      title={
        <Space>
          <InboxOutlined style={{ color: '#1890ff' }} />
          <span>Receive Goods - PO #{purchaseOrder?.po_number}</span>
        </Space>
      }
      open={open}
      onCancel={onClose}
      width={1400}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Button
          key="submit"
          type="primary"
          icon={<CheckCircleOutlined />}
          loading={isLoading}
          onClick={handleSubmit}
        >
          Receive Goods & Create GRN
        </Button>,
      ]}
    >
      <Alert
        message="Goods Receipt Note (GRN)"
        description="Record the actual quantities received from the vendor. Enter the unit price, GST percentage, and discount (if any) for each item, plus the total shipping cost as provided by the vendor. This will update inventory and PO status."
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />
      
      <Form form={form} layout="vertical">
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item
              name="vendor_invoice_no"
              label={
                <span>
                  Vendor Invoice Number <span style={{ color: 'red' }}>*</span>
                </span>
              }
              rules={[
                { required: true, message: 'Please enter vendor invoice number' },
                { whitespace: true, message: 'Vendor invoice number cannot be empty' },
              ]}
            >
              <Input placeholder="Enter vendor's invoice number" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="vendor_invoice_date"
              label="Vendor Invoice Date"
            >
              <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item label="GRN Date">
              <DatePicker
                value={dayjs()}
                disabled
                style={{ width: '100%' }}
                format="YYYY-MM-DD"
              />
            </Form.Item>
          </Col>
        </Row>
        
        <Divider>Receive Items</Divider>
        
        <Row gutter={16} style={{ marginBottom: 16 }}>
          <Col span={6}>
            <Statistic title="Total Ordered" value={totals.ordered} />
          </Col>
          <Col span={6}>
            <Statistic title="Receiving Now" value={totals.received} valueStyle={{ color: '#1890ff' }} />
          </Col>
          <Col span={6}>
            <Statistic title="Rejected" value={totals.rejected} valueStyle={{ color: '#ff4d4f' }} />
          </Col>
          <Col span={6}>
            <Statistic title="Accepted" value={totals.accepted} valueStyle={{ color: '#52c41a' }} />
          </Col>
        </Row>
        
        <Table
          columns={columns}
          dataSource={lineItems}
          rowKey="po_line_item_id"
          pagination={false}
          scroll={{ x: 1650 }}
          size="small"
          bordered
        />
        
        <Divider />
        
        {/* Financial Totals */}
        {financialTotals.total > 0 && (
          <Row gutter={16} style={{ marginBottom: 16, padding: '16px', background: '#f5f5f5', borderRadius: '4px' }}>
            <Col span={5}>
              <Statistic 
                title="Subtotal (After Discount)" 
                value={financialTotals.subtotal} 
                prefix="₹"
                valueStyle={{ fontSize: '16px' }}
              />
            </Col>
            {financialTotals.discountAmount > 0 && (
              <Col span={5}>
                <Statistic 
                  title="Discount" 
                  value={financialTotals.discountAmount} 
                  prefix="₹"
                  valueStyle={{ fontSize: '16px', color: '#ff4d4f' }}
                />
              </Col>
            )}
            <Col span={5}>
              <Statistic 
                title="Tax Amount" 
                value={financialTotals.taxAmount} 
                prefix="₹"
                valueStyle={{ fontSize: '16px' }}
              />
            </Col>
            {financialTotals.shippingCost > 0 && (
              <Col span={5}>
                <Statistic 
                  title="Shipping Cost" 
                  value={financialTotals.shippingCost} 
                  prefix="₹"
                  valueStyle={{ fontSize: '16px' }}
                />
              </Col>
            )}
            <Col span={financialTotals.shippingCost > 0 ? 4 : financialTotals.discountAmount > 0 ? 9 : 14}>
              <Statistic 
                title="Total Amount" 
                value={financialTotals.total} 
                prefix="₹"
                valueStyle={{ fontSize: '18px', color: '#52c41a', fontWeight: 'bold' }}
              />
            </Col>
          </Row>
        )}
        
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item name="notes" label="Notes">
              <Input.TextArea
                rows={3}
                placeholder="Any notes about the receipt..."
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Shipping Cost">
              <InputNumber
                min={0}
                precision={2}
                placeholder="₹0.00"
                prefix="₹"
                style={{ width: '100%' }}
                value={shippingCost}
                onChange={(val) => setShippingCost(val || 0)}
              />
            </Form.Item>
            <Checkbox
              checked={createStockEntries}
              onChange={(e) => setCreateStockEntries(e.target.checked)}
              style={{ marginTop: 16 }}
            >
              <strong>Auto-create Stock Entries</strong>
              <div style={{ fontSize: '11px', color: '#888' }}>
                Automatically add received items to Stock Audit
              </div>
            </Checkbox>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

export default POReceiveModal;

