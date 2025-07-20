import React, { useEffect, useState, useMemo } from 'react';
import { Form, Button, Typography, Space, Modal, message, Switch, InputNumber } from 'antd';
import dayjs from 'dayjs';
import EditableDataGrid, { EditableColumn } from '../../../components/common/EditableDataGrid';
import { useApiActions } from '../../../services/api/useApiActions';
import { useDynamicSelector } from '../../../services/redux';
import { calculateBillTotals } from '../../../helpers/amount_calculations';
import { useHandleApiResponse } from '../../../components/common/useHandleApiResponse';
import { SaveOutlined, PrinterOutlined } from '@ant-design/icons';

const { Title } = Typography;

interface BillDataGridProps {
  billdata?: any;
  onSuccess?: (formattedBill?: any) => void;
}

interface BillItem {
  _id?: string;
  product_id: string;
  product_name: string;
  variant_name: string;
  stock_id: string;
  qty: number;
  loose_qty: number;
  price: number;
  mrp: number;
  amount: number;
  tax_percentage: number;
}

interface BillFormData {
  invoice_no: string;
  date: string;
  customer_id: string;
  customer_name: string;
  payment_mode: string;
  items: BillItem[];
}

const BillDataGrid: React.FC<BillDataGridProps> = ({ billdata, onSuccess }) => {
  const [form] = Form.useForm();
  const { getEntityApi } = useApiActions();
  
  // API hooks
  const ProductsApi = getEntityApi('Product');
  const CustomerApi = getEntityApi('Customer');
  const StockAuditApi = getEntityApi('StockAudit');
  const BranchStock = getEntityApi('BranchStock');
  const SalesRecord = getEntityApi('SalesRecord');
  const InvoiceNumberApi = getEntityApi('InvoiceNumber');

  // Redux selectors
  const { items: productList, loading: productLoading } = useDynamicSelector(ProductsApi.getIdentifier('GetAll'));
  const { items: customerList, loading: customerLoading } = useDynamicSelector(CustomerApi.getIdentifier('GetAll'));
  const { items: stockAuditList, loading: stockLoading } = useDynamicSelector(StockAuditApi.getIdentifier('GetAll'));
  const { items: branchStockList, loading: branchStockLoading } = useDynamicSelector(BranchStock.getIdentifier('GetAll'));
  const { items: invoice_no_item } = useDynamicSelector(InvoiceNumberApi.getIdentifier('GetAll'));
  const { loading: saleCreateLoading } = useDynamicSelector(SalesRecord.getIdentifier('Create'));

  // State
  const [billFormData, setBillFormData] = useState<BillFormData>({
    invoice_no: '',
    date: dayjs().format('YYYY-MM-DD'),
    customer_id: '',
    customer_name: '',
    payment_mode: 'cash',
    items: []
  });

  const [billSettings, setBillSettings] = useState({
    isPaid: true,
    isPartiallyPaid: false,
    isRetail: true,
    isGstIncluded: true,
    discount: 0,
    discountType: 'percentage' as 'percentage' | 'amount',
    paidAmount: 0
  });

  // User info
  const user = JSON.parse(sessionStorage.getItem('user') || '{}');
  const branchId = user?.branch_id;

  // Initialize data
  useEffect(() => {
    ProductsApi('GetAll');
    CustomerApi('GetAll');
    InvoiceNumberApi('GetAll');

    if (billdata) {
      setBillFormData({
        invoice_no: billdata.invoice_no,
        date: dayjs(billdata.date).format('YYYY-MM-DD'),
        customer_id: billdata.customer_id,
        customer_name: billdata.customerDetails?.full_name || '',
        payment_mode: billdata.payment_mode,
        items: billdata.Items?.map((item: any) => ({
          _id: item._id,
          product_id: item.product_id,
          product_name: item.productItems?.name || '',
          variant_name: item.productItems?.VariantItem?.variant_name || '',
          stock_id: branchId ? item.branch_stock_id : item.stock_id,
          qty: item.qty || 0,
          loose_qty: item.loose_qty || 0,
          price: item.price,
          mrp: item.mrp || item.price,
          amount: item.amount,
          tax_percentage: item.tax_percentage || 0
        })) || []
      });

      setBillSettings({
        isPaid: billdata.is_paid ?? true,
        isPartiallyPaid: billdata.is_partially_paid ?? false,
        isRetail: billdata.sale_type === 'retail',
        isGstIncluded: billdata.is_gst_included ?? true,
        discount: billdata.discount ?? 0,
        discountType: billdata.discount_type ?? 'percentage',
        paidAmount: billdata.paid_amount ?? 0
      });
    }
  }, [billdata]);

  // Set auto-generated invoice number
  useEffect(() => {
    if (invoice_no_item?.result?.invoice_no && !billdata) {
      setBillFormData(prev => ({ ...prev, invoice_no: invoice_no_item.result.invoice_no }));
    }
  }, [invoice_no_item, billdata]);

  // Product and stock options
  const productOptions = useMemo(() => 
    productList?.result?.map((product: any) => ({
      label: `${product.name} ${product?.VariantItem?.variant_name || ''}`.trim(),
      value: product._id
    })) || [], [productList]);

  const customerOptions = useMemo(() =>
    customerList?.result?.map((customer: any) => ({
      label: `${customer.full_name} - ${customer.mobile}`,
      value: customer._id
    })) || [], [customerList]);

  const getStockOptionsForProduct = (productId: string) => {
    const stockList = branchId ? branchStockList : stockAuditList;
    const stocks = stockList?.result?.filter((stock: any) => 
      stock.product === productId || stock.ProductItem?._id === productId
    ) || [];
    
    return stocks.map((stock: any) => ({
      label: `Stock: ${stock.available_quantity || 0} pcs, ₹${stock.sell_price || 0}`,
      value: stock._id
    }));
  };

  // Column definitions for the bill header
  const headerColumns: EditableColumn[] = [
    {
      key: 'field',
      name: 'Field',
      field: 'field',
      editable: false,
      width: 150
    },
    {
      key: 'value',
      name: 'Value',
      field: 'value',
      type: 'text',
      width: 300,
      editable: true
    }
  ];

  const headerData = [
    { field: 'Invoice Number', value: billFormData.invoice_no },
    { field: 'Date', value: billFormData.date, type: 'date' },
    { field: 'Customer', value: billFormData.customer_id, type: 'select', options: customerOptions },
    { field: 'Payment Mode', value: billFormData.payment_mode, type: 'select', options: [
      { label: 'Cash', value: 'cash' },
      { label: 'UPI', value: 'upi' },
      { label: 'Card', value: 'card' }
    ]}
  ];

  // Column definitions for bill items
  const itemColumns: EditableColumn[] = [
    {
      key: 'product_id',
      name: 'Product',
      field: 'product_id',
      type: 'select',
      options: productOptions,
      required: true,
      width: 250
    },
    {
      key: 'stock_id',
      name: 'Stock',
      field: 'stock_id',
      type: 'select',
      options: [], // Dynamic based on selected product
      required: true,
      width: 200
    },
    {
      key: 'qty',
      name: 'Qty',
      field: 'qty',
      type: 'number',
      width: 80
    },
    {
      key: 'loose_qty',
      name: 'Loose Qty',
      field: 'loose_qty',
      type: 'number',
      width: 100
    },
    {
      key: 'price',
      name: 'Price',
      field: 'price',
      type: 'number',
      required: true,
      width: 120
    },
    {
      key: 'amount',
      name: 'Amount',
      field: 'amount',
      type: 'number',
      editable: false,
      width: 120
    }
  ];

  // Calculate bill totals
  const billCalculations = useMemo(() => {
    if (!billFormData.items.length) return {
      sub_total: 0,
      value_of_goods: 0,
      total_gst: 0,
      total_amount: 0,
      discountValue: 0
    };

    return calculateBillTotals({
      items: billFormData.items,
      productList: productList?.result || [],
      isGstIncluded: billSettings.isGstIncluded,
      discount: billSettings.discount,
      discountType: billSettings.discountType
    });
  }, [billFormData.items, productList, billSettings]);

  // Handle bill header changes
  const handleHeaderSave = (headerRows: any[]) => {
    const headerUpdates: Partial<BillFormData> = {};
    
    headerRows.forEach(row => {
      switch (row.field) {
        case 'Invoice Number':
          headerUpdates.invoice_no = row.value;
          break;
        case 'Date':
          headerUpdates.date = row.value;
          break;
        case 'Customer':
          headerUpdates.customer_id = row.value;
          const customer = customerList?.result?.find((c: any) => c._id === row.value);
          headerUpdates.customer_name = customer?.full_name || '';
          break;
        case 'Payment Mode':
          headerUpdates.payment_mode = row.value;
          break;
      }
    });

    setBillFormData(prev => ({ ...prev, ...headerUpdates }));
  };

  // Handle item changes
  const handleItemsChange = (items: BillItem[]) => {
    // Update items with calculated amounts
    const updatedItems = items.map(item => {
      if (!item.product_id || !item.stock_id) return item;

      // Get stock info
      const stockList = branchId ? branchStockList : stockAuditList;
      const stock = stockList?.result?.find((s: any) => s._id === item.stock_id);
      
      if (stock) {
        const sellPrice = stock.sell_price || 0;
        const packQty = stock.quantity || 1;
        const looseRate = sellPrice / packQty;
        
        const baseAmount = (item.qty || 0) * sellPrice + (item.loose_qty || 0) * looseRate;
        
        // Get product for tax calculation
        const product = productList?.result?.find((p: any) => p._id === item.product_id);
        const taxPercentage = product?.CategoryItem?.tax_percentage || 0;
        
        let amount = baseAmount;
        if (!billSettings.isGstIncluded) {
          amount = baseAmount + (baseAmount * taxPercentage / 100);
        }

        return {
          ...item,
          price: item.price || sellPrice,
          mrp: stock.mrp || sellPrice,
          amount: amount,
          tax_percentage: taxPercentage,
          product_name: product?.name || '',
          variant_name: product?.VariantItem?.variant_name || ''
        };
      }

      return item;
    });

    setBillFormData(prev => ({ ...prev, items: updatedItems }));
  };

  // Handle item addition
  const handleAddItem = () => {
    const newItem: BillItem = {
      product_id: '',
      product_name: '',
      variant_name: '',
      stock_id: '',
      qty: 0,
      loose_qty: 0,
      price: 0,
      mrp: 0,
      amount: 0,
      tax_percentage: 0
    };
    
    setBillFormData(prev => ({ 
      ...prev, 
      items: [...prev.items, newItem]
    }));
  };

  // Handle item deletion
  const handleDeleteItems = (indices: number[]) => {
    setBillFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, index) => !indices.includes(index))
    }));
  };

  // Handle final save
  const handleSaveBill = async () => {
    // Validation
    if (!billFormData.invoice_no || !billFormData.customer_id || !billFormData.items.length) {
      message.error('Please fill all required fields');
      return;
    }

    // Check for incomplete items
    const incompleteItems = billFormData.items.some(item => 
      !item.product_id || !item.stock_id || (!item.qty && !item.loose_qty) || !item.price
    );

    if (incompleteItems) {
      message.error('Please complete all item details');
      return;
    }

    const payload = {
      invoice_no: billFormData.invoice_no,
      date: billFormData.date,
      customer_id: billFormData.customer_id,
      payment_mode: billFormData.payment_mode,
      items: billFormData.items.map(item => ({
        product_id: item.product_id,
        stock_id: item.stock_id,
        ...(branchId && { branch_stock_id: item.stock_id }),
        qty: item.qty,
        loose_qty: item.loose_qty,
        price: item.price,
        mrp: item.mrp,
        amount: item.amount,
        tax_percentage: item.tax_percentage,
        _id: item._id
      })),
      ...billCalculations,
      discount: billSettings.discount,
      discount_type: billSettings.discountType,
      is_paid: billSettings.isPaid,
      is_partially_paid: billSettings.isPartiallyPaid,
      sale_type: billSettings.isRetail ? 'retail' : 'wholesale',
      is_gst_included: billSettings.isGstIncluded,
      paid_amount: billSettings.isPartiallyPaid ? billSettings.paidAmount : 
                  billSettings.isPaid ? billCalculations.total_amount : 0
    };

    try {
      if (billdata) {
        await SalesRecord('Update', payload, billdata._id);
      } else {
        await SalesRecord('Create', payload);
      }
    } catch (error) {
      console.error('Bill save failed:', error);
    }
  };

  // Handle API responses
  const { items: createItems } = useDynamicSelector(SalesRecord.getIdentifier('Create'));
  const { items: updateItems } = useDynamicSelector(SalesRecord.getIdentifier('Update'));

  useHandleApiResponse({
    action: 'create',
    title: 'Bill',
    identifier: SalesRecord.getIdentifier('Create'),
    entityApi: SalesRecord
  });

  useHandleApiResponse({
    action: 'update',
    title: 'Bill',
    identifier: SalesRecord.getIdentifier('Update'),
    entityApi: SalesRecord
  });

  // Handle create success
  useEffect(() => {
    if (createItems?.statusCode === 200) {
      onSuccess?.();
      InvoiceNumberApi('Create');
      setTimeout(() => InvoiceNumberApi('GetAll'), 500);
      
      // Reset form
      setBillFormData({
        invoice_no: '',
        date: dayjs().format('YYYY-MM-DD'),
        customer_id: '',
        customer_name: '',
        payment_mode: 'cash',
        items: []
      });
    }
  }, [createItems]);

  // Handle update success
  useEffect(() => {
    if (updateItems?.statusCode === 200) {
      onSuccess?.();
    }
  }, [updateItems]);

  return (
    <div style={{ padding: 24, background: '#f0f5ff', borderRadius: 10 }}>
      <Title level={3} style={{ color: '#1890ff', textAlign: 'center', marginBottom: 24 }}>
        {billdata ? `Edit ${billSettings.isRetail ? 'Bill' : 'Invoice'}` : `Create ${billSettings.isRetail ? 'Bill' : 'Invoice'}`}
      </Title>

      {/* Settings Row */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24, gap: 16 }}>
        <Switch
          checkedChildren="Retail"
          unCheckedChildren="Wholesale"
          checked={billSettings.isRetail}
          onChange={(checked) => setBillSettings(prev => ({ ...prev, isRetail: checked }))}
        />
        <Switch
          checkedChildren="GST Included"
          unCheckedChildren="GST Excluded"
          checked={billSettings.isGstIncluded}
          onChange={(checked) => setBillSettings(prev => ({ ...prev, isGstIncluded: checked }))}
        />
        <Switch
          checkedChildren="Paid"
          unCheckedChildren="Unpaid"
          checked={billSettings.isPaid}
          onChange={(checked) => setBillSettings(prev => ({ 
            ...prev, 
            isPaid: checked, 
            isPartiallyPaid: checked ? false : prev.isPartiallyPaid 
          }))}
        />
        {!billSettings.isPaid && (
          <Switch
            checkedChildren="Partially Paid"
            unCheckedChildren="Not Paid"
            checked={billSettings.isPartiallyPaid}
            onChange={(checked) => setBillSettings(prev => ({ ...prev, isPartiallyPaid: checked }))}
          />
        )}
      </div>

      {/* Bill Header */}
      <div style={{ marginBottom: 24 }}>
        <Title level={4}>Bill Details</Title>
        <EditableDataGrid
          columns={headerColumns}
          data={headerData}
          onSave={handleHeaderSave}
          allowAdd={false}
          allowDelete={false}
          height={200}
          loading={customerLoading}
        />
      </div>

      {/* Bill Items */}
      <div style={{ marginBottom: 24 }}>
        <Title level={4}>Items</Title>
        <EditableDataGrid
          columns={itemColumns}
          data={billFormData.items}
          onSave={handleItemsChange}
          onAdd={handleAddItem}
          onDelete={handleDeleteItems}
          height={400}
          loading={productLoading || stockLoading || branchStockLoading}
        />
      </div>

      {/* Bill Summary */}
      <div style={{ 
        background: '#fff', 
        padding: 16, 
        borderRadius: 8, 
        border: '1px solid #d9d9d9',
        marginBottom: 24
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <div><strong>Sub Total:</strong> ₹ {billCalculations.sub_total.toFixed(2)}</div>
            <div><strong>Value of Goods:</strong> ₹ {billCalculations.value_of_goods.toFixed(2)}</div>
            {billSettings.discount > 0 && (
              <div>
                <strong>Discount:</strong> 
                {billSettings.discountType === 'percentage' 
                  ? ` ${billSettings.discount}%` 
                  : ` ₹ ${billCalculations.discountValue.toFixed(2)}`}
              </div>
            )}
          </div>
          <div>
            <div><strong>GST:</strong> ₹ {billCalculations.total_gst.toFixed(2)}</div>
            <div style={{ fontSize: 18, color: '#1890ff' }}>
              <strong>Net Payable:</strong> ₹ {billCalculations.total_amount.toFixed(2)}
            </div>
            {billSettings.isPartiallyPaid && (
              <div style={{ color: '#52c41a' }}>
                <strong>Paid:</strong> ₹ {billSettings.paidAmount}
                <br />
                <strong>Remaining:</strong> ₹ {(billCalculations.total_amount - billSettings.paidAmount).toFixed(2)}
              </div>
            )}
          </div>
        </div>

        {/* Discount Controls */}
        <div style={{ marginTop: 16, display: 'flex', gap: 16, alignItems: 'center' }}>
          <span>Discount:</span>
          <InputNumber
            min={0}
            value={billSettings.discount}
            onChange={(value) => setBillSettings(prev => ({ ...prev, discount: value || 0 }))}
            style={{ width: 120 }}
          />
          <Switch
            checkedChildren="%"
            unCheckedChildren="₹"
            checked={billSettings.discountType === 'percentage'}
            onChange={(checked) => setBillSettings(prev => ({ 
              ...prev, 
              discountType: checked ? 'percentage' : 'amount' 
            }))}
          />
          
          {billSettings.isPartiallyPaid && (
            <>
              <span style={{ marginLeft: 16 }}>Paid Amount:</span>
              <InputNumber
                min={0}
                max={billCalculations.total_amount}
                value={billSettings.paidAmount}
                onChange={(value) => setBillSettings(prev => ({ ...prev, paidAmount: value || 0 }))}
                style={{ width: 120 }}
                formatter={(value) => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => Number(value!.replace(/₹\s?|(,*)/g, ''))}
              />
            </>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ textAlign: 'center' }}>
        <Space>
          <Button
            type="primary"
            size="large"
            icon={<SaveOutlined />}
            onClick={handleSaveBill}
            loading={saleCreateLoading}
          >
            {billdata ? 'Update Bill' : 'Save Bill'} (Ctrl+S)
          </Button>
        </Space>
      </div>
    </div>
  );
};

export default BillDataGrid; 