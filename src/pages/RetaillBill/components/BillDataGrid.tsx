import React, { useEffect, useState, useMemo } from 'react';
import {
  Form,
  Button,
  Typography,
  Space,
  Modal,
  message,
  Switch,
  InputNumber,
  Row,
  Col,
  Input,
  Select,
  DatePicker,
  Card,
  Divider,
  Badge,
  Tag,
  Tooltip,
} from 'antd';
import dayjs from 'dayjs';
import EditableDataGrid, {
  EditableColumn,
} from '../../../components/common/EditableDataGrid';
import { useApiActions } from '../../../services/api/useApiActions';
import { useDynamicSelector } from '../../../services/redux';
import { calculateBillTotals } from '../../../helpers/amount_calculations';
import { useHandleApiResponse } from '../../../components/common/useHandleApiResponse';
import { 
  SaveOutlined, 
  PrinterOutlined, 
  FileTextOutlined,
  CalendarOutlined,
  UserOutlined,
  CreditCardOutlined,
  DollarOutlined,
  ShoppingCartOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';

const { Option } = Select;
const { Title, Text } = Typography;

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
  const { items: productList, loading: productLoading } = useDynamicSelector(
    ProductsApi.getIdentifier('GetAll')
  );
  const { items: customerList, loading: customerLoading } = useDynamicSelector(
    CustomerApi.getIdentifier('GetAll')
  );
  const { items: stockAuditList, loading: stockLoading } = useDynamicSelector(
    StockAuditApi.getIdentifier('GetAll')
  );
  const { items: branchStockList, loading: branchStockLoading } =
    useDynamicSelector(BranchStock.getIdentifier('GetAll'));
  const { items: invoice_no_item } = useDynamicSelector(
    InvoiceNumberApi.getIdentifier('GetAll')
  );
  const { loading: saleCreateLoading } = useDynamicSelector(
    SalesRecord.getIdentifier('Create')
  );

  // State
  const [billFormData, setBillFormData] = useState<BillFormData>({
    invoice_no: '',
    date: dayjs().format('YYYY-MM-DD'),
    customer_id: '',
    customer_name: '',
    payment_mode: 'cash',
    items: [],
  });

  const [billSettings, setBillSettings] = useState({
    isPaid: true,
    isPartiallyPaid: false,
    isRetail: true,
    isGstIncluded: true,
    discount: 0,
    discountType: 'percentage' as 'percentage' | 'amount',
    paidAmount: 0,
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
        items:
          billdata.Items?.map((item: any) => ({
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
            tax_percentage: item.tax_percentage || 0,
          })) || [],
      });

      setBillSettings({
        isPaid: billdata.is_paid ?? true,
        isPartiallyPaid: billdata.is_partially_paid ?? false,
        isRetail: billdata.sale_type === 'retail',
        isGstIncluded: billdata.is_gst_included ?? true,
        discount: billdata.discount ?? 0,
        discountType: billdata.discount_type ?? 'percentage',
        paidAmount: billdata.paid_amount ?? 0,
      });
    }
  }, [billdata]);

  // Set auto-generated invoice number
  useEffect(() => {
    if (invoice_no_item?.result?.invoice_no && !billdata) {
      setBillFormData(prev => ({
        ...prev,
        invoice_no: invoice_no_item.result.invoice_no,
      }));
    }
  }, [invoice_no_item, billdata]);

  // Product and stock options
  const productOptions = useMemo(
    () =>
      productList?.result?.map((product: any) => ({
        label:
          `${product.name} ${product?.VariantItem?.variant_name || ''}`.trim(),
        value: product._id,
      })) || [],
    [productList]
  );

  const customerOptions = useMemo(
    () =>
      customerList?.result?.map((customer: any) => ({
        label: `${customer.full_name} - ${customer.mobile}`,
        value: customer._id,
      })) || [],
    [customerList]
  );

  const getStockOptionsForProduct = (productId: string) => {
    const stockList = branchId ? branchStockList : stockAuditList;
    const stocks =
      stockList?.result?.filter(
        (stock: any) =>
          stock.product === productId || stock.ProductItem?._id === productId
      ) || [];

    return stocks.map((stock: any) => ({
      label: `Stock: ${stock.available_quantity || 0} pcs, ₹${stock.sell_price || 0}`,
      value: stock._id,
    }));
  };

  // Column definitions for bill header
  const headerColumns: EditableColumn[] = [
    {
      key: 'invoice_no',
      name: '📄 INVOICE #',
      field: 'invoice_no',
      type: 'text',
      required: true,
      width: 180,
    },
    {
      key: 'date',
      name: '📅 DATE',
      field: 'date',
      type: 'date',
      required: true,
      width: 150,
    },
    {
      key: 'customer_id',
      name: '👤 CUSTOMER',
      field: 'customer_id',
      type: 'select',
      options: customerOptions,
      required: true,
      width: 250,
    },
    {
      key: 'payment_mode',
      name: '💳 PAYMENT',
      field: 'payment_mode',
      type: 'select',
      options: [
        { label: '💵 Cash', value: 'cash' },
        { label: '📱 UPI', value: 'upi' },
        { label: '💳 Card', value: 'card' }
      ],
      required: true,
      width: 150,
    }
  ];

  const headerData = [{
    invoice_no: billFormData.invoice_no,
    date: billFormData.date,
    customer_id: billFormData.customer_id,
    payment_mode: billFormData.payment_mode
  }];

  // Column definitions for bill items
  const itemColumns: EditableColumn[] = [
    {
      key: 'product_id',
      name: '🛒 PRODUCT',
      field: 'product_id',
      type: 'select',
      options: productOptions,
      required: true,
      width: 280,
    },
    {
      key: 'stock_id',
      name: '📦 STOCK',
      field: 'stock_id',
      type: 'select',
      options: [], // Dynamic based on selected product
      required: true,
      width: 200,
    },
    {
      key: 'qty',
      name: '📊 QTY',
      field: 'qty',
      type: 'number',
      width: 90,
    },
    {
      key: 'loose_qty',
      name: '📋 LOOSE',
      field: 'loose_qty',
      type: 'number',
      width: 90,
    },
    {
      key: 'price',
      name: '💰 RATE',
      field: 'price',
      type: 'number',
      required: true,
      width: 120,
    },
    {
      key: 'amount',
      name: '💵 AMOUNT',
      field: 'amount',
      type: 'number',
      editable: false,
      width: 130,
    },
  ];

  // Calculate bill totals
  const billCalculations = useMemo(() => {
    if (!billFormData.items.length)
      return {
        sub_total: 0,
        value_of_goods: 0,
        total_gst: 0,
        total_amount: 0,
        discountValue: 0,
      };

    return calculateBillTotals({
      items: billFormData.items,
      productList: productList?.result || [],
      isGstIncluded: billSettings.isGstIncluded,
      discount: billSettings.discount,
      discountType: billSettings.discountType,
    });
  }, [billFormData.items, productList, billSettings]);

  // Handle header changes
  const handleHeaderChange = (headerRows: any[]) => {
    const updatedHeader = headerRows[0];
    if (updatedHeader) {
      // Find customer name for display
      const customer = customerList?.result?.find((c: any) => c._id === updatedHeader.customer_id);
      setBillFormData(prev => ({
        ...prev,
        invoice_no: updatedHeader.invoice_no || '',
        date: updatedHeader.date || dayjs().format('YYYY-MM-DD'),
        customer_id: updatedHeader.customer_id || '',
        customer_name: customer?.full_name || '',
        payment_mode: updatedHeader.payment_mode || 'cash'
      }));
    }
  };

  // Handle item changes
  const handleItemsChange = (items: BillItem[]) => {
    // Update items with calculated amounts
    const updatedItems = items.map(item => {
      if (!item.product_id || !item.stock_id) return item;

      // Get stock info
      const stockList = branchId ? branchStockList : stockAuditList;
      const stock = stockList?.result?.find(
        (s: any) => s._id === item.stock_id
      );

      if (stock) {
        const sellPrice = stock.sell_price || 0;
        const packQty = stock.quantity || 1;
        const looseRate = sellPrice / packQty;

        const baseAmount =
          (item.qty || 0) * sellPrice + (item.loose_qty || 0) * looseRate;

        // Get product for tax calculation
        const product = productList?.result?.find(
          (p: any) => p._id === item.product_id
        );
        const taxPercentage = product?.CategoryItem?.tax_percentage || 0;

        let amount = baseAmount;
        if (!billSettings.isGstIncluded) {
          amount = baseAmount + (baseAmount * taxPercentage) / 100;
        }

        return {
          ...item,
          price: item.price || sellPrice,
          mrp: stock.mrp || sellPrice,
          amount: amount,
          tax_percentage: taxPercentage,
          product_name: product?.name || '',
          variant_name: product?.VariantItem?.variant_name || '',
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
      tax_percentage: 0,
    };

    setBillFormData(prev => ({
      ...prev,
      items: [...prev.items, newItem],
    }));
  };

  // Handle item deletion
  const handleDeleteItems = (indices: number[]) => {
    setBillFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, index) => !indices.includes(index)),
    }));
  };

  // Handle final save
  const handleSaveBill = async () => {
    // Validation
    if (
      !billFormData.invoice_no ||
      !billFormData.customer_id ||
      !billFormData.items.length
    ) {
      message.error('Please fill all required fields');
      return;
    }

    // Check for incomplete items
    const incompleteItems = billFormData.items.some(
      item =>
        !item.product_id ||
        !item.stock_id ||
        (!item.qty && !item.loose_qty) ||
        !item.price
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
        _id: item._id,
      })),
      ...billCalculations,
      discount: billSettings.discount,
      discount_type: billSettings.discountType,
      is_paid: billSettings.isPaid,
      is_partially_paid: billSettings.isPartiallyPaid,
      sale_type: billSettings.isRetail ? 'retail' : 'wholesale',
      is_gst_included: billSettings.isGstIncluded,
      paid_amount: billSettings.isPartiallyPaid
        ? billSettings.paidAmount
        : billSettings.isPaid
          ? billCalculations.total_amount
          : 0,
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
  const { items: createItems } = useDynamicSelector(
    SalesRecord.getIdentifier('Create')
  );
  const { items: updateItems } = useDynamicSelector(
    SalesRecord.getIdentifier('Update')
  );

  useHandleApiResponse({
    action: 'create',
    title: 'Bill',
    identifier: SalesRecord.getIdentifier('Create'),
    entityApi: SalesRecord,
  });

  useHandleApiResponse({
    action: 'update',
    title: 'Bill',
    identifier: SalesRecord.getIdentifier('Update'),
    entityApi: SalesRecord,
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
        items: [],
      });
    }
  }, [createItems]);

  // Handle update success
  useEffect(() => {
    if (updateItems?.statusCode === 200) {
      onSuccess?.();
    }
  }, [updateItems]);

  // Enhanced keyboard shortcuts for fast billing
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // F-key shortcuts
      if (e.key === 'F1') {
        e.preventDefault();
        handleAddItem();
      } else if (e.key === 'F2') {
        e.preventDefault();
        handleSaveBill();
      } else if (e.key === 'F3') {
        e.preventDefault();
        // Print functionality can be added here
        message.info('Print feature - F3 pressed');
      } else if (e.key === 'F4') {
        e.preventDefault();
        // Focus customer field
        const customerField = document.querySelector('.rdg-cell[data-column-key="customer_id"]') as HTMLElement;
        customerField?.focus();
      } 
      
      // Ctrl shortcuts
      else if (e.ctrlKey) {
        if (e.key === 's') {
          e.preventDefault();
          handleSaveBill();
        } else if (e.key === 'n') {
          e.preventDefault();
          handleAddItem();
        } else if (e.key === 'p') {
          e.preventDefault();
          message.info('Print functionality - Ctrl+P pressed');
        }
      }
      
      // ESC to clear current editing
      else if (e.key === 'Escape') {
        const activeElement = document.activeElement as HTMLElement;
        activeElement?.blur();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [billFormData.items.length]);

  return (
    <div style={{ 
      padding: 12, 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh' 
    }}>
      {/* Compact Header */}
      <div style={{
        textAlign: 'center',
        marginBottom: 16,
        background: 'rgba(255, 255, 255, 0.95)',
        padding: '12px',
        borderRadius: '8px',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
      }}>
        <Title
          level={4}
          style={{ 
            color: '#2c3e50', 
            margin: 0,
            fontSize: '18px',
            fontWeight: 600
          }}
        >
          <FileTextOutlined style={{ marginRight: 8, color: '#667eea' }} />
          {billdata ? 'EDIT BILL' : 'CREATE BILL'} • {dayjs().format('DD MMM YYYY')}
        </Title>
      </div>

      {/* Compact Settings Row */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        padding: '8px 16px',
        borderRadius: '6px',
        marginBottom: 12,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 16,
        flexWrap: 'wrap'
      }}>
        <Space size="large">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Text style={{ fontSize: '12px', fontWeight: 600, color: '#2c3e50' }}>🏪</Text>
            <Switch
              checkedChildren="Retail"
              unCheckedChildren="Wholesale"
              checked={billSettings.isRetail}
              onChange={checked =>
                setBillSettings(prev => ({ ...prev, isRetail: checked }))
              }
            />
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Text style={{ fontSize: '12px', fontWeight: 600, color: '#2c3e50' }}>📊</Text>
            <Switch
              checkedChildren="GST ✓"
              unCheckedChildren="GST ✗"
              checked={billSettings.isGstIncluded}
              onChange={checked =>
                setBillSettings(prev => ({ ...prev, isGstIncluded: checked }))
              }
            />
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Text style={{ fontSize: '12px', fontWeight: 600, color: '#2c3e50' }}>💳</Text>
            <Switch
              checkedChildren="Paid"
              unCheckedChildren="Unpaid"
              checked={billSettings.isPaid}
              onChange={checked =>
                setBillSettings(prev => ({
                  ...prev,
                  isPaid: checked,
                  isPartiallyPaid: checked ? false : prev.isPartiallyPaid,
                }))
              }
            />
          </div>

          {!billSettings.isPaid && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Text style={{ fontSize: '12px', fontWeight: 600, color: '#2c3e50' }}>💰</Text>
              <Switch
                checkedChildren="Partial"
                unCheckedChildren="None"
                checked={billSettings.isPartiallyPaid}
                onChange={checked =>
                  setBillSettings(prev => ({ ...prev, isPartiallyPaid: checked }))
                }
              />
            </div>
          )}
        </Space>
      </div>

      {/* Invoice Details Data Grid */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '8px',
        padding: '4px',
        marginBottom: 12,
        border: '2px solid #e9ecef'
      }}>
        <EditableDataGrid
          columns={headerColumns}
          data={headerData}
          onSave={handleHeaderChange}
          allowAdd={false}
          allowDelete={false}
          height={100}
          loading={customerLoading}
          className="compact-header-grid"
        />
      </div>

      {/* Items Section */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '8px',
        padding: '8px',
        marginBottom: 12,
        border: '2px solid #e9ecef'
      }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: 8,
          padding: '0 8px'
        }}>
          <Text style={{ fontWeight: 600, color: '#2c3e50', fontSize: '14px' }}>
            🛒 BILL ITEMS
          </Text>
          <Badge count={billFormData.items.length} showZero size="small">
            <Text style={{ fontSize: '12px', color: '#666' }}>Items</Text>
          </Badge>
        </div>
        
        <EditableDataGrid
          columns={itemColumns}
          data={billFormData.items}
          onSave={handleItemsChange}
          onAdd={handleAddItem}
          onDelete={handleDeleteItems}
          height={280}
          loading={productLoading || stockLoading || branchStockLoading}
          className="modern-bill-grid"
        />
      </div>

      {/* Compact Bill Summary */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        borderRadius: '8px',
        padding: '12px',
        marginBottom: 12
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <Text style={{ color: 'white', fontWeight: 600, fontSize: '14px' }}>
            💰 BILL TOTALS
          </Text>
          <Space size="large">
            <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: '12px' }}>
              Sub: ₹{billCalculations.sub_total.toFixed(2)}
            </Text>
            <Text style={{ color: 'rgba(255,255,255,0.9)', fontSize: '12px' }}>
              GST: ₹{billCalculations.total_gst.toFixed(2)}
            </Text>
            <Text style={{ color: 'white', fontWeight: 700, fontSize: '16px' }}>
              NET: ₹{billCalculations.total_amount.toFixed(2)}
            </Text>
          </Space>
        </div>

        {/* Compact Controls */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          gap: 16,
          flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Text style={{ color: 'white', fontSize: '12px' }}>Disc:</Text>
            <InputNumber
              min={0}
              value={billSettings.discount}
              onChange={value =>
                setBillSettings(prev => ({ ...prev, discount: value || 0 }))
              }
              style={{ width: 80 }}
              size="small"
            />
            <Switch
              checkedChildren="%"
              unCheckedChildren="₹"
              checked={billSettings.discountType === 'percentage'}
              onChange={checked =>
                setBillSettings(prev => ({
                  ...prev,
                  discountType: checked ? 'percentage' : 'amount',
                }))
              }
              size="small"
            />
          </div>
          
          {billSettings.isPartiallyPaid && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Text style={{ color: 'white', fontSize: '12px' }}>Paid:</Text>
              <InputNumber
                min={0}
                max={billCalculations.total_amount}
                value={billSettings.paidAmount}
                onChange={value =>
                  setBillSettings(prev => ({ ...prev, paidAmount: value || 0 }))
                }
                style={{ width: 100 }}
                size="small"
                formatter={value =>
                  `₹${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                }
                parser={value => Number(value!.replace(/₹\s?|(,*)/g, ''))}
              />
              <Text style={{ color: '#2ecc71', fontSize: '12px', fontWeight: 600 }}>
                Rem: ₹{(billCalculations.total_amount - billSettings.paidAmount).toFixed(2)}
              </Text>
            </div>
          )}
        </div>
      </div>

      {/* Compact Action Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'rgba(255,255,255,0.95)',
        padding: '8px 16px',
        borderRadius: '6px'
      }}>
        <div>
          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={handleSaveBill}
            loading={saleCreateLoading}
            style={{
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              fontWeight: 600
            }}
          >
            {billdata ? 'Update' : 'Save'} (Ctrl+S)
          </Button>
          <Button
            icon={<PrinterOutlined />}
            style={{ marginLeft: 8, color: '#667eea', borderColor: '#667eea' }}
          >
            Print (Ctrl+P)
          </Button>
        </div>
        
        <div style={{ textAlign: 'right' }}>
          <Text style={{ color: '#666', fontSize: '11px', display: 'block' }}>
            <strong>⚡ Fast Keys:</strong> F1(New) • F2(Save) • F3(Print) • F4(Customer) • Tab(Navigate)
          </Text>
          <Text style={{ color: '#666', fontSize: '11px' }}>
            <strong>Items:</strong> Ctrl+N(Add) • Del(Remove) • Enter(Edit) • Esc(Cancel)
          </Text>
        </div>
      </div>
    </div>
  );
};

export default BillDataGrid;
