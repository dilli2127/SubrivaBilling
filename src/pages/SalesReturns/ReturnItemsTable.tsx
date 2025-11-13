import React, { useCallback, useMemo } from 'react';
import {
  Table,
  InputNumber,
  Select,
  Input,
  Tag,
  Tooltip,
  Space,
} from 'antd';
import {
  CheckCircleOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { SalesReturnItem } from '../../types/salesReturn';

const { TextArea } = Input;
const { Option } = Select;

interface ReturnItemsTableProps {
  value?: SalesReturnItem[];
  onChange?: (items: SalesReturnItem[]) => void;
  disabled?: boolean;
  showCondition?: boolean; // Show item condition column
}

const ReturnItemsTable: React.FC<ReturnItemsTableProps> = ({
  value = [],
  onChange,
  disabled = false,
  showCondition = true,
}) => {
  
  // Update item field
  const handleFieldChange = useCallback((index: number, field: string, fieldValue: any) => {
    const newItems = [...value];
    const item = { ...newItems[index], [field]: fieldValue };
    
    // Recalculate line total if quantity or price changes
    if (['quantity', 'unit_price', 'tax_percentage', 'discount'].includes(field)) {
      const qty = Number(item.quantity) || 0;
      const price = Number(item.unit_price) || 0;
      const taxPct = Number(item.tax_percentage) || 0;
      const discountVal = Number(item.discount) || 0;
      const discountType = item.discount_type || 'percentage';
      
      let subtotal = qty * price;
      
      // Apply discount
      if (discountType === 'percentage') {
        subtotal -= subtotal * (discountVal / 100);
      } else {
        subtotal -= discountVal;
      }
      
      // Add tax
      const taxAmount = subtotal * (taxPct / 100);
      item.line_total = Number((subtotal + taxAmount).toFixed(2));
    }
    
    newItems[index] = item;
    onChange?.(newItems);
  }, [value, onChange]);

  // Calculate totals
  const totals = useMemo(() => {
    const subtotal = value.reduce((sum, item) => {
      const qty = Number(item.quantity) || 0;
      const price = Number(item.unit_price) || 0;
      const discountVal = Number(item.discount) || 0;
      const discountType = item.discount_type || 'percentage';
      
      let itemSubtotal = qty * price;
      if (discountType === 'percentage') {
        itemSubtotal -= itemSubtotal * (discountVal / 100);
      } else {
        itemSubtotal -= discountVal;
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
        itemSubtotal -= itemSubtotal * (discountVal / 100);
      } else {
        itemSubtotal -= discountVal;
      }
      
      return sum + (itemSubtotal * (taxPct / 100));
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
      fixed: 'left' as const,
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: 'Product',
      key: 'product',
      width: 200,
      fixed: 'left' as const,
      render: (_: any, record: SalesReturnItem) => (
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
      title: 'Original Qty',
      key: 'max_quantity',
      width: 100,
      render: (_: any, record: SalesReturnItem) => (
        <Tag color="blue">{record.max_quantity || record.quantity}</Tag>
      ),
    },
    {
      title: <span style={{ color: 'red' }}>* Return Qty</span>,
      key: 'quantity',
      width: 120,
      render: (_: any, record: SalesReturnItem, index: number) => (
        <InputNumber
          min={1}
          max={record.max_quantity || 999}
          precision={0}
          style={{ width: '100%' }}
          value={record.quantity}
          onChange={(val) => handleFieldChange(index, 'quantity', val || 1)}
          disabled={disabled}
        />
      ),
    },
    {
      title: 'Unit Price',
      key: 'unit_price',
      width: 110,
      render: (_: any, record: SalesReturnItem) => (
        <span>₹{Number(record.unit_price || 0).toFixed(2)}</span>
      ),
    },
    {
      title: 'Tax %',
      key: 'tax_percentage',
      width: 80,
      render: (_: any, record: SalesReturnItem) => (
        <span>{record.tax_percentage}%</span>
      ),
    },
    {
      title: 'Line Total',
      key: 'line_total',
      width: 120,
      render: (_: any, record: SalesReturnItem) => (
        <strong style={{ color: '#ff4d4f' }}>
          ₹{(record.line_total || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </strong>
      ),
    },
    ...(showCondition ? [{
      title: 'Condition',
      key: 'item_condition',
      width: 130,
      render: (_: any, record: SalesReturnItem, index: number) => (
        <Select
          style={{ width: '100%' }}
          value={record.item_condition || 'good'}
          onChange={(val) => handleFieldChange(index, 'item_condition', val)}
          disabled={disabled}
        >
          <Option value="good">
            <Space>
              <CheckCircleOutlined style={{ color: '#52c41a' }} />
              Good
            </Space>
          </Option>
          <Option value="damaged">
            <Space>
              <WarningOutlined style={{ color: '#faad14' }} />
              Damaged
            </Space>
          </Option>
          <Option value="expired">
            <Space>
              <WarningOutlined style={{ color: '#ff4d4f' }} />
              Expired
            </Space>
          </Option>
          <Option value="defective">
            <Space>
              <WarningOutlined style={{ color: '#ff4d4f' }} />
              Defective
            </Space>
          </Option>
        </Select>
      ),
    }] : []),
    {
      title: 'Notes',
      key: 'condition_notes',
      width: 200,
      render: (_: any, record: SalesReturnItem, index: number) => (
        <TextArea
          rows={1}
          placeholder="Condition notes..."
          value={record.condition_notes}
          onChange={(e) => handleFieldChange(index, 'condition_notes', e.target.value)}
          disabled={disabled}
        />
      ),
    },
  ];

  return (
    <div style={{ width: '100%' }}>
      <div style={{ marginBottom: 12 }}>
        <strong style={{ fontSize: '14px' }}>Return Items</strong>
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
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '20px', fontSize: '16px', color: '#ff4d4f' }}>
                <span>Refund Total:</span>
                <strong>₹{totals.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong>
              </div>
            </Space>
          </div>
        )}
      />
      
      {value.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
          No items to return. Please select an invoice first.
        </div>
      )}
    </div>
  );
};

export default ReturnItemsTable;

