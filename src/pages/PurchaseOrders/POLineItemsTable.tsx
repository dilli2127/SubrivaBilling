import React, { useCallback, useMemo } from 'react';
import {
  Table,
  Button,
  InputNumber,
  Select,
  DatePicker,
  Input,
  Popconfirm,
  Space,
  Tag,
  Tooltip,
  message,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  CalculatorOutlined,
} from '@ant-design/icons';
import { POLineItem } from '../../types/purchaseOrder';
import { apiSlice } from '../../services/redux/api/apiSlice';
import dayjs from 'dayjs';

interface POLineItemsTableProps {
  value?: POLineItem[];
  onChange?: (items: POLineItem[]) => void;
  disabled?: boolean;
}

const POLineItemsTable: React.FC<POLineItemsTableProps> = ({
  value = [],
  onChange,
  disabled = false,
}) => {
  // Memoized query params
  const queryParams = useMemo(() => ({ page: 1, limit: 100 }), []);
  const { data: productsData, isLoading: productsLoading } = apiSlice.useGetProductQuery(queryParams);
  
  const products = useMemo(() => (productsData as any)?.result || [], [productsData]);

  // Add new line item
  const handleAddItem = useCallback(() => {
    const newItem: Partial<POLineItem> = {
      product_id: '',
      product_name: '',
      variant_name: '',
      description: '',
      quantity: 1,
      unit_price: 0, // Will be filled at receipt time
      tax_percentage: 0, // Will be filled at receipt time
      discount: 0,
      discount_type: 'percentage',
      line_total: 0,
      received_quantity: 0,
      pending_quantity: 1,
    };
    
    onChange?.([...value, newItem as POLineItem]);
  }, [value, onChange]);

  // Delete line item
  const handleDeleteItem = useCallback((index: number) => {
    const newItems = value.filter((_, i) => i !== index);
    onChange?.(newItems);
  }, [value, onChange]);

  // Calculate line total
  const calculateLineTotal = useCallback((item: Partial<POLineItem>) => {
    const qty = Number(item.quantity) || 0;
    const price = Number(item.unit_price) || 0;
    const taxPct = Number(item.tax_percentage) || 0;
    const discountVal = Number(item.discount) || 0;
    const discountType = item.discount_type || 'percentage';

    let subtotal = qty * price;
    
    // Apply discount
    if (discountType === 'percentage') {
      subtotal = subtotal - (subtotal * discountVal / 100);
    } else {
      subtotal = subtotal - discountVal;
    }
    
    // Add tax
    const taxAmount = subtotal * (taxPct / 100);
    const total = subtotal + taxAmount;
    
    return {
      line_total: Number(total.toFixed(2)),
      pending_quantity: qty - (item.received_quantity || 0),
    };
  }, []);

  // Update line item field
  const handleFieldChange = useCallback((index: number, field: string, fieldValue: any) => {
    const newItems = [...value];
    const item = { ...newItems[index], [field]: fieldValue };
    
    // Recalculate totals if quantity, price, tax, or discount changes
    if (['quantity', 'unit_price', 'tax_percentage', 'discount', 'discount_type'].includes(field)) {
      const calculated = calculateLineTotal(item);
      Object.assign(item, calculated);
    }
    
    newItems[index] = item;
    onChange?.(newItems);
  }, [value, onChange, calculateLineTotal]);

  // Handle product selection
  const handleProductSelect = useCallback((index: number, productId: string) => {
    const product = products.find((p: any) => p._id === productId);
    if (!product) return;

    const newItems = [...value];
    const item = {
      ...newItems[index],
      product_id: productId,
      product_name: product.name,
      variant_name: product.VariantItem?.variant_name || '',
      description: product.description || '',
      // Price and tax will be filled at receipt time by vendor
      tax_percentage: 0,
      unit_price: 0,
    };
    
    const calculated = calculateLineTotal(item);
    newItems[index] = { ...item, ...calculated };
    onChange?.(newItems);
  }, [value, onChange, products, calculateLineTotal]);

  // Calculate totals
  const totals = useMemo(() => {
    const subtotal = value.reduce((sum, item) => {
      const qty = Number(item.quantity) || 0;
      const price = Number(item.unit_price) || 0;
      const discountVal = Number(item.discount) || 0;
      const discountType = item.discount_type || 'percentage';
      
      let itemSubtotal = qty * price;
      if (discountType === 'percentage') {
        itemSubtotal = itemSubtotal - (itemSubtotal * discountVal / 100);
      } else {
        itemSubtotal = itemSubtotal - discountVal;
      }
      
      return sum + itemSubtotal;
    }, 0);

    const taxAmount = value.reduce((sum, item) => {
      const qty = Number(item.quantity) || 0;
      const price = Number(item.unit_price) || 0;
      const taxPct = Number(item.tax_percentage) || 0;
      const discountVal = Number(item.discount) || 0;
      const discountType = item.discount_type || 'percentage';
      
      let itemSubtotal = qty * price;
      if (discountType === 'percentage') {
        itemSubtotal = itemSubtotal - (itemSubtotal * discountVal / 100);
      } else {
        itemSubtotal = itemSubtotal - discountVal;
      }
      
      return sum + (itemSubtotal * taxPct / 100);
    }, 0);

    const total = subtotal + taxAmount;
    
    return {
      subtotal: Number(subtotal.toFixed(2)),
      taxAmount: Number(taxAmount.toFixed(2)),
      total: Number(total.toFixed(2)),
    };
  }, [value]);

  // Table columns
  const columns = [
    {
      title: '#',
      key: 'index',
      width: 40,
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: <span style={{ color: 'red' }}>* Product</span>,
      key: 'product',
      width: 200,
      render: (_: any, record: POLineItem, index: number) => (
        <Select
          showSearch
          allowClear
          placeholder="Select product"
          style={{ width: '100%' }}
          value={record.product_id || undefined}
          onChange={(val) => handleProductSelect(index, val)}
          disabled={disabled}
          loading={productsLoading}
          filterOption={(input, option) => {
            const label = String(option?.children || '');
            return label.toLowerCase().includes(input.toLowerCase());
          }}
          notFoundContent={productsLoading ? 'Loading products...' : 'No products found'}
        >
          {products.map((product: any) => (
            <Select.Option key={product._id} value={product._id}>
              {product.name} {product.VariantItem?.variant_name ? `- ${product.VariantItem.variant_name}` : ''}
            </Select.Option>
          ))}
        </Select>
      ),
    },
    {
      title: 'Description',
      key: 'description',
      width: 150,
      render: (_: any, record: POLineItem, index: number) => (
        <Input
          placeholder="Description"
          value={record.description}
          onChange={(e) => handleFieldChange(index, 'description', e.target.value)}
          disabled={disabled}
        />
      ),
    },
    {
      title: <span style={{ color: 'red' }}>* Quantity</span>,
      key: 'quantity',
      width: 100,
      render: (_: any, record: POLineItem, index: number) => (
        <InputNumber
          min={1}
          precision={0}
          placeholder="Qty"
          style={{ width: '100%' }}
          value={record.quantity}
          onChange={(val) => handleFieldChange(index, 'quantity', val)}
          disabled={disabled}
        />
      ),
    },
    {
      title: 'Unit Price',
      key: 'unit_price',
      width: 110,
      render: (_: any, record: POLineItem, index: number) => (
        <InputNumber
          min={0}
          precision={2}
          placeholder="Enter at receipt"
          prefix="₹"
          style={{ width: '100%' }}
          value={record.unit_price}
          onChange={(val) => handleFieldChange(index, 'unit_price', val)}
          disabled={true}
        />
      ),
    },
    {
      title: 'Tax %',
      key: 'tax_percentage',
      width: 80,
      render: (_: any, record: POLineItem, index: number) => (
        <InputNumber
          min={0}
          max={100}
          precision={2}
          placeholder="Enter at receipt"
          suffix="%"
          style={{ width: '100%' }}
          value={record.tax_percentage}
          onChange={(val) => handleFieldChange(index, 'tax_percentage', val)}
          disabled={true}
        />
      ),
    },
    {
      title: 'Discount',
      key: 'discount',
      width: 130,
      render: (_: any, record: POLineItem, index: number) => (
        <Space.Compact style={{ width: '100%' }}>
          <InputNumber
            min={0}
            precision={2}
            placeholder="Enter at receipt"
            style={{ width: '70%' }}
            value={record.discount}
            onChange={(val) => handleFieldChange(index, 'discount', val)}
            disabled={true}
          />
          <Select
            style={{ width: '30%' }}
            value={record.discount_type}
            onChange={(val) => handleFieldChange(index, 'discount_type', val)}
            disabled={true}
          >
            <Select.Option value="percentage">%</Select.Option>
            <Select.Option value="amount">₹</Select.Option>
          </Select>
        </Space.Compact>
      ),
    },
    {
      title: 'Line Total',
      key: 'line_total',
      width: 110,
      render: (_: any, record: POLineItem) => (
        <Tooltip title={record.unit_price > 0 ? `Qty: ${record.quantity} × ₹${record.unit_price}` : 'Price will be set at receipt'}>
          <strong style={{ color: record.unit_price > 0 ? '#52c41a' : '#999' }}>
            {record.unit_price > 0 
              ? `₹${(record.line_total || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
              : 'TBD'}
          </strong>
        </Tooltip>
      ),
    },
    {
      title: 'Expected Date',
      key: 'expected_delivery_date',
      width: 120,
      render: (_: any, record: POLineItem, index: number) => (
        <DatePicker
          format="YYYY-MM-DD"
          style={{ width: '100%' }}
          value={record.expected_delivery_date ? dayjs(record.expected_delivery_date) : undefined}
          onChange={(date) => handleFieldChange(index, 'expected_delivery_date', date?.format('YYYY-MM-DD'))}
          disabled={disabled}
        />
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 70,
      render: (_: any, record: POLineItem, index: number) => (
        <Popconfirm
          title="Delete this line item?"
          onConfirm={() => handleDeleteItem(index)}
          disabled={disabled || value.length === 1}
        >
          <Button
            type="link"
            danger
            size="small"
            icon={<DeleteOutlined />}
            disabled={disabled || value.length === 1}
          />
        </Popconfirm>
      ),
    },
  ];

  return (
    <div style={{ width: '100%' }}>
      <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <strong style={{ fontSize: '14px' }}>Line Items</strong>
        <Button
          type="dashed"
          icon={<PlusOutlined />}
          onClick={handleAddItem}
          disabled={disabled}
        >
          Add Item
        </Button>
      </div>
      
      <Table
        columns={columns}
        dataSource={value}
        pagination={false}
        size="small"
        scroll={{ x: 'max-content' }}
        rowKey={(record, index) => `item-${index}`}
        bordered
        footer={() => (
          <div style={{ textAlign: 'right' }}>
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '20px' }}>
                <span>Subtotal:</span>
                <strong>₹{totals.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '20px' }}>
                <span>Tax Amount:</span>
                <strong>₹{totals.taxAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '20px', fontSize: '16px', color: '#52c41a' }}>
                <span><CalculatorOutlined /> Total:</span>
                <strong>₹{totals.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
              </div>
            </Space>
          </div>
        )}
      />
      
      {value.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
          No items added. Click "Add Item" to get started.
        </div>
      )}
    </div>
  );
};

export default POLineItemsTable;

