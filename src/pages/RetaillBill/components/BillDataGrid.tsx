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

  // Initialize with 5 default empty items if no existing data
  useEffect(() => {
    if (!billdata && billFormData.items.length === 0) {
      const defaultItems = Array(5).fill(null).map((_, index) => ({
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
      }));
      setBillFormData(prev => ({
        ...prev,
        items: defaultItems
      }));
    }
  }, [billdata, billFormData.items.length]);

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
      padding: '8px 0', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh',
      width: '100%'
    }}>
      {/* Ultra-Fast Billing Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '12px 16px',
        margin: '0 8px',
        borderRadius: '8px',
        boxShadow: '0 6px 18px rgba(102, 126, 234, 0.25)',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Decorative background elements */}
        <div style={{
          position: 'absolute',
          top: -20,
          right: -20,
          width: 60,
          height: 60,
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '50%',
          opacity: 0.6
        }} />
        <div style={{
          position: 'absolute',
          bottom: -10,
          left: -10,
          width: 40,
          height: 40,
          background: 'rgba(255,255,255,0.08)',
          borderRadius: '50%',
          opacity: 0.5
        }} />
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            background: 'rgba(255,255,255,0.2)',
            padding: '8px',
            borderRadius: '50%',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}>
            <FileTextOutlined style={{ fontSize: '20px', color: 'white' }} />
          </div>
          <div>
            <Title
              level={4}
              style={{ 
                color: 'white', 
                margin: 0,
                fontSize: '20px',
                fontWeight: 700,
                textShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }}
            >
              {billdata ? '⚡ EDIT INVOICE' : '🚀 NEW INVOICE'}
            </Title>
            <Text style={{ 
              color: 'rgba(255,255,255,0.9)', 
              fontSize: '13px',
              fontWeight: 500,
              display: 'block',
              marginTop: 2
            }}>
              Ultra-Fast Billing • {dayjs().format('DD MMM YYYY, dddd')}
            </Text>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{
            background: 'rgba(255,255,255,0.15)',
            padding: '8px 16px',
            borderRadius: '20px',
            border: '1px solid rgba(255,255,255,0.2)',
            backdropFilter: 'blur(10px)'
          }}>
            <Text style={{ color: 'white', fontSize: '12px', fontWeight: 600 }}>
              🎯 ITEMS: {billFormData.items.length}
            </Text>
          </div>
          <div style={{
            background: 'rgba(255,255,255,0.15)',
            padding: '8px 16px',
            borderRadius: '20px',
            border: '1px solid rgba(255,255,255,0.2)',
            backdropFilter: 'blur(10px)'
          }}>
            <Text style={{ color: 'white', fontSize: '12px', fontWeight: 600 }}>
              💰 ₹{billCalculations.total_amount.toFixed(2)}
            </Text>
          </div>
        </div>
      </div>

      {/* Ultra-Modern Quick Settings */}
      <div style={{
        background: 'linear-gradient(135deg, #667eea 10%, #764ba2 90%)',
        padding: '8px 16px',
        borderRadius: '8px',
        margin: '0 8px 8px 8px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 20,
        flexWrap: 'wrap',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 4px 16px rgba(102, 126, 234, 0.15)'
      }}>
        {/* Background decoration */}
        <div style={{
          position: 'absolute',
          top: -15,
          left: -15,
          width: 50,
          height: 50,
          background: 'rgba(255,255,255,0.06)',
          borderRadius: '50%',
          opacity: 0.8
        }} />
        
        <Space size="large" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 10,
            background: 'rgba(255,255,255,0.1)',
            padding: '6px 12px',
            borderRadius: '20px',
            border: '1px solid rgba(255,255,255,0.15)',
            backdropFilter: 'blur(10px)'
          }}>
            <Text style={{ 
              fontSize: '14px', 
              fontWeight: 700, 
              color: 'white',
              textShadow: '0 1px 2px rgba(0,0,0,0.2)'
            }}>
              🏪 SALE TYPE
            </Text>
            <Switch
              checkedChildren="RETAIL"
              unCheckedChildren="WHOLESALE"
              checked={billSettings.isRetail}
              onChange={checked =>
                setBillSettings(prev => ({ ...prev, isRetail: checked }))
              }
              style={{
                backgroundColor: billSettings.isRetail ? '#52c41a' : '#1890ff',
              }}
            />
          </div>
          
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 10,
            background: 'rgba(255,255,255,0.1)',
            padding: '6px 12px',
            borderRadius: '20px',
            border: '1px solid rgba(255,255,255,0.15)',
            backdropFilter: 'blur(10px)'
          }}>
            <Text style={{ 
              fontSize: '14px', 
              fontWeight: 700, 
              color: 'white',
              textShadow: '0 1px 2px rgba(0,0,0,0.2)'
            }}>
              📊 GST
            </Text>
            <Switch
              checkedChildren="INCL"
              unCheckedChildren="EXCL"
              checked={billSettings.isGstIncluded}
              onChange={checked =>
                setBillSettings(prev => ({ ...prev, isGstIncluded: checked }))
              }
              style={{
                backgroundColor: billSettings.isGstIncluded ? '#52c41a' : '#faad14',
              }}
            />
          </div>
          
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 10,
            background: 'rgba(255,255,255,0.1)',
            padding: '6px 12px',
            borderRadius: '20px',
            border: '1px solid rgba(255,255,255,0.15)',
            backdropFilter: 'blur(10px)'
          }}>
            <Text style={{ 
              fontSize: '14px', 
              fontWeight: 700, 
              color: 'white',
              textShadow: '0 1px 2px rgba(0,0,0,0.2)'
            }}>
              💳 PAYMENT
            </Text>
            <Switch
              checkedChildren="PAID"
              unCheckedChildren="UNPAID"
              checked={billSettings.isPaid}
              onChange={checked =>
                setBillSettings(prev => ({
                  ...prev,
                  isPaid: checked,
                  isPartiallyPaid: checked ? false : prev.isPartiallyPaid,
                }))
              }
              style={{
                backgroundColor: billSettings.isPaid ? '#52c41a' : '#ff4d4f',
              }}
            />
          </div>

          {!billSettings.isPaid && (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 10,
              background: 'rgba(255,255,255,0.1)',
              padding: '6px 12px',
              borderRadius: '20px',
              border: '1px solid rgba(255,255,255,0.15)',
              backdropFilter: 'blur(10px)'
            }}>
              <Text style={{ 
                fontSize: '14px', 
                fontWeight: 700, 
                color: 'white',
                textShadow: '0 1px 2px rgba(0,0,0,0.2)'
              }}>
                💰 PARTIAL
              </Text>
              <Switch
                checkedChildren="YES"
                unCheckedChildren="NO"
                checked={billSettings.isPartiallyPaid}
                onChange={checked =>
                  setBillSettings(prev => ({ ...prev, isPartiallyPaid: checked }))
                }
                style={{
                  backgroundColor: billSettings.isPartiallyPaid ? '#faad14' : '#d9d9d9',
                }}
              />
            </div>
          )}
        </Space>
      </div>

      {/* Invoice Details Data Grid */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        borderRadius: '6px',
        padding: '4px',
        margin: '0 8px 8px 8px',
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

      {/* Items Section with Summary */}
      <div style={{
        display: 'flex',
        gap: 12,
        margin: '0 8px 8px 8px',
        alignItems: 'flex-start'
      }}>
        {/* Bill Items Grid */}
        <div style={{
          flex: 1,
          minWidth: 0,
          background: 'rgba(255, 255, 255, 0.95)',
          borderRadius: '6px',
          padding: '8px',
          border: '2px solid #e9ecef',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            marginBottom: 12,
            padding: '8px 8px',
            background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
            borderRadius: '4px',
            border: '1px solid #dee2e6'
          }}>
            <Text style={{ 
              fontWeight: 700, 
              color: '#2c3e50', 
              fontSize: '15px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              🛒 BILL ITEMS
            </Text>
            <Badge count={billFormData.items.length} showZero size="small">
              <Text style={{ fontSize: '12px', color: '#666', fontWeight: 600 }}>Items</Text>
            </Badge>
          </div>
          
          <EditableDataGrid
            columns={itemColumns}
            data={billFormData.items}
            onSave={handleItemsChange}
            onAdd={handleAddItem}
            onDelete={handleDeleteItems}
            height={320}
            loading={productLoading || stockLoading || branchStockLoading}
            className="modern-bill-grid"
          />
        </div>

        {/* Bill Summary - Right Side */}
        <div style={{
          width: '350px',
          maxWidth: '350px',
          flexShrink: 0,
          background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)',
          border: '2px solid #dee2e6',
          borderRadius: '6px',
          padding: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          alignSelf: 'flex-start'
        }}>
          {/* Header */}
          <div style={{
            borderBottom: '1px solid #dee2e6',
            paddingBottom: '6px',
            marginBottom: '8px'
          }}>
            <Text style={{ 
              fontWeight: 700, 
              fontSize: '13px',
              color: '#2c3e50',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              💰 BILL SUMMARY
            </Text>
          </div>

          {/* Summary Table */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontWeight: 600, color: '#495057', fontSize: '12px' }}>Net Value:</Text>
              <Text style={{ fontWeight: 700, color: '#2c3e50', fontSize: '12px', fontFamily: 'monospace' }}>
                ₹{billCalculations.sub_total.toFixed(2)}
              </Text>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontWeight: 600, color: '#495057', fontSize: '12px' }}>CGST:</Text>
              <Text style={{ fontWeight: 700, color: '#2c3e50', fontSize: '12px', fontFamily: 'monospace' }}>
                ₹{(billCalculations.total_gst / 2).toFixed(2)}
              </Text>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontWeight: 600, color: '#495057', fontSize: '12px' }}>SGST:</Text>
              <Text style={{ fontWeight: 700, color: '#2c3e50', fontSize: '12px', fontFamily: 'monospace' }}>
                ₹{(billCalculations.total_gst / 2).toFixed(2)}
              </Text>
            </div>

            {billSettings.discount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontWeight: 600, color: '#495057', fontSize: '12px' }}>DISCOUNT:</Text>
                <Text style={{ fontWeight: 700, color: '#dc3545', fontSize: '12px', fontFamily: 'monospace' }}>
                  -₹{billSettings.discountType === 'percentage' 
                    ? ((billCalculations.sub_total + billCalculations.total_gst) * billSettings.discount / 100).toFixed(2)
                    : billSettings.discount.toFixed(2)}
                </Text>
              </div>
            )}

            <div style={{ 
              borderTop: '1px solid #dee2e6',
              paddingTop: '6px',
              marginTop: '6px',
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
              padding: '8px 10px',
              borderRadius: '4px',
              color: 'white'
            }}>
              <Text style={{ fontWeight: 700, fontSize: '13px', textShadow: '0 1px 2px rgba(0,0,0,0.2)' }}>
                NET/EXC/REPL:
              </Text>
              <Text style={{ 
                fontWeight: 900, 
                fontSize: '15px', 
                fontFamily: 'monospace',
                textShadow: '0 1px 2px rgba(0,0,0,0.2)'
              }}>
                ₹{billCalculations.total_amount.toFixed(2)}
              </Text>
            </div>

            {billSettings.isPartiallyPaid && (
              <div style={{
                background: '#fff3cd',
                border: '1px solid #ffeaa7',
                borderRadius: '4px',
                padding: '6px 8px',
                marginTop: '6px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                  <Text style={{ fontWeight: 600, color: '#856404', fontSize: '11px' }}>Paid Amount:</Text>
                  <Text style={{ fontWeight: 700, color: '#856404', fontSize: '11px', fontFamily: 'monospace' }}>
                    ₹{billSettings.paidAmount.toFixed(2)}
                  </Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontWeight: 600, color: '#856404', fontSize: '11px' }}>Balance:</Text>
                  <Text style={{ fontWeight: 700, color: '#dc3545', fontSize: '11px', fontFamily: 'monospace' }}>
                    ₹{(billCalculations.total_amount - billSettings.paidAmount).toFixed(2)}
                  </Text>
                </div>
              </div>
            )}
          </div>

          {/* Discount & Payment Controls */}
          <div style={{ 
            marginTop: '12px',
            paddingTop: '8px',
            borderTop: '1px solid #dee2e6',
            display: 'flex',
            flexDirection: 'row',
            gap: 8,
            alignItems: 'flex-start',
            justifyContent: 'center'
          }}>
            {/* Discount Controls */}
            <div style={{ 
              textAlign: 'center',
              background: '#e9ecef',
              padding: '6px 8px',
              borderRadius: '4px',
              border: '1px solid #ced4da',
              minWidth: 100
            }}>
              <Text style={{ 
                color: '#495057', 
                fontSize: '9px', 
                display: 'block',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.3px',
                marginBottom: 3
              }}>
                💸 DISCOUNT
              </Text>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4, justifyContent: 'center' }}>
                <InputNumber
                  min={0}
                  value={billSettings.discount}
                  onChange={value =>
                    setBillSettings(prev => ({ ...prev, discount: value || 0 }))
                  }
                  style={{ width: 60 }}
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
            </div>

            {/* Partial Payment Controls */}
            {billSettings.isPartiallyPaid && (
              <div style={{ 
                textAlign: 'center',
                background: '#fff3cd',
                padding: '6px 8px',
                borderRadius: '4px',
                border: '1px solid #ffeaa7',
                minWidth: 110
              }}>
                <Text style={{ 
                  color: '#856404', 
                  fontSize: '9px', 
                  display: 'block',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.3px',
                  marginBottom: 3
                }}>
                  💰 PARTIAL PAY
                </Text>
                <InputNumber
                  min={0}
                  max={billCalculations.total_amount}
                  value={billSettings.paidAmount}
                  onChange={value =>
                    setBillSettings(prev => ({ ...prev, paidAmount: value || 0 }))
                  }
                  style={{ width: 80 }}
                  size="small"
                  formatter={value =>
                    `₹${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                  }
                  parser={value => Number(value!.replace(/₹\s?|(,*)/g, ''))}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Ultra-Fast Action Hub */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #2c3e50 0%, #34495e 100%)',
        padding: '12px 16px',
        margin: '0 8px',
        borderRadius: '8px',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 6px 18px rgba(44, 62, 80, 0.2)'
      }}>
        {/* Background decoration */}
        <div style={{
          position: 'absolute',
          top: -20,
          right: -20,
          width: 70,
          height: 70,
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '50%',
          opacity: 0.8
        }} />
        
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, position: 'relative', zIndex: 1 }}>
          <Button
            type="primary"
            size="large"
            icon={<SaveOutlined />}
            onClick={handleSaveBill}
            loading={saleCreateLoading}
            style={{
              background: 'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
              border: 'none',
              fontWeight: 700,
              height: '45px',
              padding: '0 24px',
              borderRadius: '25px',
              fontSize: '15px',
              boxShadow: '0 4px 16px rgba(82, 196, 26, 0.3)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}
          >
            🚀 {billdata ? 'UPDATE' : 'SAVE BILL'} (F2)
          </Button>
          
          <Button
            size="large"
            icon={<PrinterOutlined />}
            style={{ 
              background: 'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
              color: 'white',
              border: 'none',
              fontWeight: 700,
              height: '45px',
              padding: '0 20px',
              borderRadius: '25px',
              fontSize: '14px',
              boxShadow: '0 4px 16px rgba(24, 144, 255, 0.3)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}
          >
            🖨️ PRINT (F3)
          </Button>
        </div>
        
        <div style={{ 
          background: 'rgba(255,255,255,0.08)',
          padding: '12px 16px',
          borderRadius: '8px',
          border: '1px solid rgba(255,255,255,0.1)',
          backdropFilter: 'blur(10px)',
          position: 'relative',
          zIndex: 1
        }}>
          <div style={{ textAlign: 'right' }}>
            <Text style={{ 
              color: 'rgba(255,255,255,0.9)', 
              fontSize: '11px', 
              display: 'block',
              fontWeight: 600,
              lineHeight: '16px',
              textShadow: '0 1px 2px rgba(0,0,0,0.2)'
            }}>
              ⚡ <strong>Keyboard Shortcuts:</strong> Ctrl+S (Save) • Ctrl+N (Add) • Ctrl+D/Del (Delete) • Tab/Shift+Tab (Navigate) • Enter (Edit) • Esc (Cancel)
            </Text>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillDataGrid;
