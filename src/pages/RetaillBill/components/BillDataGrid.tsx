import React, { useEffect, useState, useMemo } from 'react';
import { Button, Typography, message, Switch, InputNumber, Badge } from 'antd';
import dayjs from 'dayjs';
import AntdEditableTable, {
  AntdEditableColumn,
} from '../../../components/common/AntdEditableTable';
import { useApiActions } from '../../../services/api/useApiActions';
import { useDynamicSelector } from '../../../services/redux';
import { calculateBillTotals } from '../../../helpers/amount_calculations';
import { useHandleApiResponse } from '../../../components/common/useHandleApiResponse';
import { BillItem, BillFormData } from '../../../types/entities';
import {
  SaveOutlined,
  PrinterOutlined,
  FileTextOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;

interface BillDataGridProps {
  billdata?: any;
  onSuccess?: (formattedBill?: any) => void;
}

const BillDataGrid: React.FC<BillDataGridProps> = ({ billdata, onSuccess }) => {
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
      const defaultItems = Array(5)
        .fill(null)
        .map((_, index) => ({
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
        items: defaultItems,
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
  const headerColumns: AntdEditableColumn[] = [
    {
      key: 'invoice_no',
      title: '📄 INVOICE #',
      dataIndex: 'invoice_no',
      type: 'text',
      required: true,
      width: 180,
    },
    {
      key: 'date',
      title: '📅 DATE',
      dataIndex: 'date',
      type: 'date',
      required: true,
      width: 150,
    },
    {
      key: 'customer_id',
      title: '👤 CUSTOMER',
      dataIndex: 'customer_id',
      type: 'select',
      options: customerOptions,
      required: true,
      width: 250,
    },
    {
      key: 'payment_mode',
      title: '💳 PAYMENT',
      dataIndex: 'payment_mode',
      type: 'select',
      options: [
        { label: '💵 Cash', value: 'cash' },
        { label: '📱 UPI', value: 'upi' },
        { label: '💳 Card', value: 'card' },
      ],
      required: true,
      width: 150,
    },
  ];

  const headerData = [
    {
      invoice_no: billFormData.invoice_no,
      date: billFormData.date,
      customer_id: billFormData.customer_id,
      payment_mode: billFormData.payment_mode,
    },
  ];

  // Column definitions for bill items
  const itemColumns: AntdEditableColumn[] = [
    {
      key: 'product_id',
      title: '🛒 PRODUCT',
      dataIndex: 'product_id',
      type: 'select',
      options: productOptions,
      required: true,
      width: 280,
    },
    {
      key: 'stock_id',
      title: '📦 STOCK',
      dataIndex: 'stock_id',
      type: 'select',
      options: [], // Dynamic based on selected product
      required: true,
      width: 200,
      editable: false, // Auto-populated, no manual selection needed
    },
    {
      key: 'qty',
      title: '📊 QTY',
      dataIndex: 'qty',
      type: 'number',
      width: 90,
    },
    {
      key: 'loose_qty',
      title: '📋 LOOSE',
      dataIndex: 'loose_qty',
      type: 'number',
      width: 90,
    },
    {
      key: 'price',
      title: '💰 RATE',
      dataIndex: 'price',
      type: 'number',
      required: true,
      width: 120,
    },
    {
      key: 'amount',
      title: '💵 AMOUNT',
      dataIndex: 'amount',
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
      const customer = customerList?.result?.find(
        (c: any) => c._id === updatedHeader.customer_id
      );
      setBillFormData(prev => ({
        ...prev,
        invoice_no: updatedHeader.invoice_no || '',
        date: updatedHeader.date || dayjs().format('YYYY-MM-DD'),
        customer_id: updatedHeader.customer_id || '',
        customer_name: customer?.full_name || '',
        payment_mode: updatedHeader.payment_mode || 'cash',
      }));
    }
  };

  // Handle item changes
  const handleItemsChange = (items: any[]) => {
    // Convert back to BillItem format and auto-populate stock
    const billItems: BillItem[] = items.map(item => {
      const billItem: BillItem = {
        product_id: item.product_id || '',
        product_name: item.product_name || '',
        variant_name: item.variant_name || '',
        stock_id: item.stock_id || '',
        qty: item.qty || 0,
        loose_qty: item.loose_qty || 0,
        price: item.price || 0,
        mrp: item.mrp || 0,
        amount: item.amount || 0,
        tax_percentage: item.tax_percentage || 0,
        _id: item._id,
      };

      // Auto-populate stock if product is selected but stock is not
      if (item.product_id && !item.stock_id) {
        const availableStocks = getStockOptionsForProduct(item.product_id);
        if (availableStocks.length > 0) {
          const firstStock = availableStocks[0];
          billItem.stock_id = firstStock.value;

          // Auto-focus quantity field after auto-selecting stock
          setTimeout(() => {
            const qtyCell = document.querySelector(
              `td[data-row-key="${item.key}"][data-column-key="qty"]`
            ) as HTMLElement;
            if (qtyCell) {
              qtyCell.focus();
            }
          }, 300);
        }
      }

      return billItem;
    });
    // Update items with calculated amounts
    const updatedItems = billItems.map(item => {
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

  return (
    <div
      style={{
        padding: '8px 0',
        background:
          'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)',
        minHeight: '100vh',
        width: '100%',
        animation: 'gradientShift 8s ease-in-out infinite',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background Half Circles */}
      <div
        style={{
          position: 'absolute',
          top: '10%',
          right: '-15%',
          width: '40%',
          height: '40%',
          background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
          borderRadius: '50%',
          opacity: 0.15,
          animation: 'float 10s ease-in-out infinite',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '60%',
          left: '-10%',
          width: '30%',
          height: '30%',
          background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
          borderRadius: '50%',
          opacity: 0.12,
          animation: 'float 12s ease-in-out infinite reverse',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '20%',
          right: '5%',
          width: '25%',
          height: '25%',
          background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
          borderRadius: '50%',
          opacity: 0.1,
          animation: 'float 8s ease-in-out infinite 2s',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '30%',
          left: '20%',
          width: '20%',
          height: '20%',
          background: 'linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)',
          borderRadius: '50%',
          opacity: 0.08,
          animation: 'float 15s ease-in-out infinite 1s',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '60%',
          right: '30%',
          width: '15%',
          height: '15%',
          background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
          borderRadius: '50%',
          opacity: 0.06,
          animation: 'float 6s ease-in-out infinite 3s',
        }}
      />
      {/* Ultra-Fast Billing Header */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 16,
          marginBottom: 8,
          background:
            'linear-gradient(135deg, #ffffff 0%, #f1f5f9 50%, #e2e8f0 100%)',
          padding: '20px',
          margin: '0 8px',
          borderRadius: '16px',
          boxShadow:
            '0 10px 25px rgba(0, 0, 0, 0.08), 0 4px 10px rgba(0, 0, 0, 0.04)',
          position: 'relative',
          overflow: 'hidden',
          border: '1px solid rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(20px)',
          animation: 'slideInDown 0.6s ease-out',
        }}
      >
        {/* Animated decorative background elements */}
        <div
          style={{
            position: 'absolute',
            top: -30,
            right: -30,
            width: 80,
            height: 80,
            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
            borderRadius: '50%',
            opacity: 0.18,
            animation: 'float 6s ease-in-out infinite',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -20,
            left: -20,
            width: 60,
            height: 60,
            background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
            borderRadius: '50%',
            opacity: 0.15,
            animation: 'float 8s ease-in-out infinite reverse',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: 100,
            height: 100,
            background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
            borderRadius: '50%',
            opacity: 0.12,
            transform: 'translate(-50%, -50%)',
            animation: 'pulse 4s ease-in-out infinite',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: -15,
            left: '20%',
            width: 40,
            height: 40,
            background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
            borderRadius: '50%',
            opacity: 0.1,
            animation: 'float 10s ease-in-out infinite 1s',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -10,
            right: '15%',
            width: 50,
            height: 50,
            background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
            borderRadius: '50%',
            opacity: 0.12,
            animation: 'float 7s ease-in-out infinite 2s',
          }}
        />

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            width: '100%',
          }}
        >
          {/* Title Section */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              animation: 'fadeInLeft 0.8s ease-out',
            }}
          >
            <div
              style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                padding: '12px',
                borderRadius: '50%',
                boxShadow: '0 8px 20px rgba(59, 130, 246, 0.3)',
                animation: 'bounce 2s ease-in-out infinite',
                transition: 'all 0.3s ease',
              }}
            >
              <FileTextOutlined style={{ fontSize: '24px', color: 'white' }} />
            </div>
            <div>
              <Title
                level={4}
                style={{
                  color: '#1e293b',
                  margin: 0,
                  fontSize: '24px',
                  fontWeight: 800,
                  background:
                    'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  animation: 'slideInRight 0.8s ease-out',
                }}
              >
                {billdata ? '⚡ EDIT INVOICE' : '🚀 NEW INVOICE'}
              </Title>
              <Text
                style={{
                  color: '#64748b',
                  fontSize: '14px',
                  fontWeight: 500,
                  display: 'block',
                  marginTop: 4,
                  animation: 'fadeInUp 1s ease-out 0.2s both',
                }}
              >
                ⚡ 100% Keyboard • No Mouse • Lightning Fast •{' '}
                {dayjs().format('DD MMM YYYY, dddd')}
              </Text>
            </div>
          </div>

          {/* Controls Section */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              animation: 'fadeInRight 0.8s ease-out 0.3s both',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                padding: '10px 16px',
                borderRadius: '25px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                transition: 'all 0.3s ease',
                animation: 'slideInUp 0.6s ease-out 0.4s both',
              }}
            >
              <Text
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#475569',
                  marginRight: 4,
                }}
              >
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
                  backgroundColor: billSettings.isRetail
                    ? '#10b981'
                    : '#3b82f6',
                }}
                size="small"
              />
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                padding: '10px 16px',
                borderRadius: '25px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                transition: 'all 0.3s ease',
                animation: 'slideInUp 0.6s ease-out 0.5s both',
              }}
            >
              <Text
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#475569',
                  marginRight: 4,
                }}
              >
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
                  backgroundColor: billSettings.isGstIncluded
                    ? '#10b981'
                    : '#f59e0b',
                }}
                size="small"
              />
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                padding: '10px 16px',
                borderRadius: '25px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                transition: 'all 0.3s ease',
                animation: 'slideInUp 0.6s ease-out 0.6s both',
              }}
            >
              <Text
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#475569',
                  marginRight: 4,
                }}
              >
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
                  backgroundColor: billSettings.isPaid ? '#10b981' : '#ef4444',
                }}
                size="small"
              />
            </div>

            {!billSettings.isPaid && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  background:
                    'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
                  padding: '10px 16px',
                  borderRadius: '25px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                  transition: 'all 0.3s ease',
                  animation: 'slideInUp 0.6s ease-out 0.7s both',
                }}
              >
                <Text
                  style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#475569',
                    marginRight: 4,
                  }}
                >
                  💰 PARTIAL
                </Text>
                <Switch
                  checkedChildren="YES"
                  unCheckedChildren="NO"
                  checked={billSettings.isPartiallyPaid}
                  onChange={checked =>
                    setBillSettings(prev => ({
                      ...prev,
                      isPartiallyPaid: checked,
                    }))
                  }
                  style={{
                    backgroundColor: billSettings.isPartiallyPaid
                      ? '#f59e0b'
                      : '#94a3b8',
                  }}
                  size="small"
                />
              </div>
            )}

            {/* Items and Amount Badges - Moved to the end */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                animation: 'fadeInUp 0.8s ease-out 0.8s both',
              }}
            >
              <div
                style={{
                  background:
                    'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
                  padding: '10px 16px',
                  borderRadius: '25px',
                  border: '1px solid rgba(59, 130, 246, 0.2)',
                  boxShadow: '0 6px 16px rgba(59, 130, 246, 0.2)',
                  transition: 'all 0.3s ease',
                  animation: 'pulse 2s ease-in-out infinite',
                }}
              >
                <Text
                  style={{ color: 'white', fontSize: '13px', fontWeight: 700 }}
                >
                  🎯 ITEMS: {billFormData.items.length}
                </Text>
              </div>
              <div
                style={{
                  background:
                    'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
                  padding: '10px 16px',
                  borderRadius: '25px',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                  boxShadow: '0 6px 16px rgba(16, 185, 129, 0.2)',
                  transition: 'all 0.3s ease',
                  animation: 'pulse 2s ease-in-out infinite 1s',
                }}
              >
                <Text
                  style={{ color: 'white', fontSize: '13px', fontWeight: 700 }}
                >
                  💰 ₹{billCalculations.total_amount.toFixed(2)}
                </Text>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Details Data Grid */}
      <div
        style={{
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          borderRadius: '12px',
          padding: '8px',
          margin: '0 8px 12px 8px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
          animation: 'slideInUp 0.8s ease-out 0.9s both',
        }}
      >
        <AntdEditableTable
          columns={headerColumns}
          dataSource={headerData}
          onSave={handleHeaderChange}
          allowAdd={false}
          allowDelete={false}
          loading={customerLoading}
          className="compact-header-grid"
          size="small"
          rowKey="invoice_no"
        />
      </div>

      {/* Items Section with Summary */}
      <div
        style={{
          display: 'flex',
          gap: 16,
          margin: '0 8px 12px 8px',
          alignItems: 'flex-start',
          animation: 'fadeInUp 1s ease-out 1s both',
          position: 'relative',
        }}
      >
        {/* Decorative half circles for items section */}
        <div
          style={{
            position: 'absolute',
            top: '10%',
            right: '5%',
            width: 60,
            height: 60,
            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
            borderRadius: '50%',
            opacity: 0.08,
            animation: 'rotate 20s linear infinite',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '20%',
            left: '2%',
            width: 40,
            height: 40,
            background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
            borderRadius: '50%',
            opacity: 0.06,
            animation: 'scaleIn 3s ease-out infinite',
          }}
        />
        {/* Bill Items Grid */}
        <div
          style={{
            flex: 1,
            minWidth: 0,
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            borderRadius: '12px',
            padding: '12px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 6px 20px rgba(0, 0, 0, 0.08)',
            transition: 'all 0.3s ease',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 16,
              padding: '12px 16px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
              borderRadius: '8px',
              border: '1px solid rgba(59, 130, 246, 0.2)',
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.15)',
              animation: 'slideInDown 0.6s ease-out 1.1s both',
            }}
          >
            <Text
              style={{
                fontWeight: 800,
                color: 'white',
                fontSize: '16px',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                textShadow: '0 2px 4px rgba(0,0,0,0.2)',
              }}
            >
              🛒 BILL ITEMS
            </Text>
            <Badge
              count={billFormData.items.length}
              showZero
              size="small"
              style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
            >
              <Text
                style={{ fontSize: '12px', color: 'white', fontWeight: 700 }}
              >
                Items
              </Text>
            </Badge>
          </div>

          <AntdEditableTable
            columns={itemColumns}
            dataSource={billFormData.items.map((item, index) => ({
              ...item,
              key: index.toString(),
            }))}
            onSave={handleItemsChange}
            onAdd={handleAddItem}
            onDelete={handleDeleteItems}
            loading={productLoading || stockLoading || branchStockLoading}
            className="modern-bill-grid"
            size="small"
            rowKey="key"
          />
        </div>

        {/* Bill Summary - Right Side */}
        <div
          style={{
            width: '350px',
            maxWidth: '350px',
            flexShrink: 0,
            background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '16px',
            boxShadow: '0 6px 20px rgba(0, 0, 0, 0.08)',
            alignSelf: 'flex-start',
            transition: 'all 0.3s ease',
            animation: 'slideInRight 0.8s ease-out 1.2s both',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Decorative half circles for summary */}
          <div
            style={{
              position: 'absolute',
              top: -10,
              right: -10,
              width: 30,
              height: 30,
              background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
              borderRadius: '50%',
              opacity: 0.1,
              animation: 'float 8s ease-in-out infinite',
            }}
          />
          <div
            style={{
              position: 'absolute',
              bottom: -5,
              left: -5,
              width: 25,
              height: 25,
              background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
              borderRadius: '50%',
              opacity: 0.08,
              animation: 'float 6s ease-in-out infinite reverse',
            }}
          />
          {/* Header */}
          <div
            style={{
              borderBottom: '2px solid #e2e8f0',
              paddingBottom: '8px',
              marginBottom: '12px',
              animation: 'fadeInUp 0.6s ease-out 1.3s both',
            }}
          >
            <Text
              style={{
                fontWeight: 800,
                fontSize: '14px',
                background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                textTransform: 'uppercase',
                letterSpacing: '1px',
              }}
            >
              💰 BILL SUMMARY
            </Text>
          </div>

          {/* Summary Table */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Text
                style={{ fontWeight: 600, color: '#495057', fontSize: '12px' }}
              >
                Net Value:
              </Text>
              <Text
                style={{
                  fontWeight: 700,
                  color: '#2c3e50',
                  fontSize: '12px',
                  fontFamily: 'monospace',
                }}
              >
                ₹{billCalculations.sub_total.toFixed(2)}
              </Text>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Text
                style={{ fontWeight: 600, color: '#495057', fontSize: '12px' }}
              >
                CGST:
              </Text>
              <Text
                style={{
                  fontWeight: 700,
                  color: '#2c3e50',
                  fontSize: '12px',
                  fontFamily: 'monospace',
                }}
              >
                ₹{(billCalculations.total_gst / 2).toFixed(2)}
              </Text>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Text
                style={{ fontWeight: 600, color: '#495057', fontSize: '12px' }}
              >
                SGST:
              </Text>
              <Text
                style={{
                  fontWeight: 700,
                  color: '#2c3e50',
                  fontSize: '12px',
                  fontFamily: 'monospace',
                }}
              >
                ₹{(billCalculations.total_gst / 2).toFixed(2)}
              </Text>
            </div>

            {billSettings.discount > 0 && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{
                    fontWeight: 600,
                    color: '#495057',
                    fontSize: '12px',
                  }}
                >
                  DISCOUNT:
                </Text>
                <Text
                  style={{
                    fontWeight: 700,
                    color: '#dc3545',
                    fontSize: '12px',
                    fontFamily: 'monospace',
                  }}
                >
                  -₹
                  {billSettings.discountType === 'percentage'
                    ? (
                        ((billCalculations.sub_total +
                          billCalculations.total_gst) *
                          billSettings.discount) /
                        100
                      ).toFixed(2)
                    : billSettings.discount.toFixed(2)}
                </Text>
              </div>
            )}

            <div
              style={{
                borderTop: '2px solid #e2e8f0',
                paddingTop: '8px',
                marginTop: '8px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
                padding: '12px 16px',
                borderRadius: '8px',
                color: 'white',
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                transition: 'all 0.3s ease',
                transform: 'scale(1)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'scale(1.02)';
                e.currentTarget.style.boxShadow =
                  '0 6px 16px rgba(16, 185, 129, 0.4)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow =
                  '0 4px 12px rgba(16, 185, 129, 0.3)';
              }}
            >
              <Text
                style={{
                  fontWeight: 800,
                  fontSize: '14px',
                  textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                }}
              >
                NET/EXC/REPL:
              </Text>
              <Text
                style={{
                  fontWeight: 900,
                  fontSize: '18px',
                  fontFamily: 'monospace',
                  textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                }}
              >
                ₹{billCalculations.total_amount.toFixed(2)}
              </Text>
            </div>

            {billSettings.isPartiallyPaid && (
              <div
                style={{
                  background: '#fff3cd',
                  border: '1px solid #ffeaa7',
                  borderRadius: '4px',
                  padding: '6px 8px',
                  marginTop: '6px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '3px',
                  }}
                >
                  <Text
                    style={{
                      fontWeight: 600,
                      color: '#856404',
                      fontSize: '11px',
                    }}
                  >
                    Paid Amount:
                  </Text>
                  <Text
                    style={{
                      fontWeight: 700,
                      color: '#856404',
                      fontSize: '11px',
                      fontFamily: 'monospace',
                    }}
                  >
                    ₹{billSettings.paidAmount.toFixed(2)}
                  </Text>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Text
                    style={{
                      fontWeight: 600,
                      color: '#856404',
                      fontSize: '11px',
                    }}
                  >
                    Balance:
                  </Text>
                  <Text
                    style={{
                      fontWeight: 700,
                      color: '#dc3545',
                      fontSize: '11px',
                      fontFamily: 'monospace',
                    }}
                  >
                    ₹
                    {(
                      billCalculations.total_amount - billSettings.paidAmount
                    ).toFixed(2)}
                  </Text>
                </div>
              </div>
            )}
          </div>

          {/* Discount & Payment Controls */}
          <div
            style={{
              marginTop: '16px',
              paddingTop: '12px',
              borderTop: '2px solid #e2e8f0',
              display: 'flex',
              flexDirection: 'row',
              gap: 12,
              alignItems: 'flex-start',
              justifyContent: 'center',
              animation: 'fadeInUp 0.8s ease-out 1.4s both',
            }}
          >
            {/* Discount Controls */}
            <div
              style={{
                textAlign: 'center',
                background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                padding: '10px 12px',
                borderRadius: '8px',
                border: '1px solid #f59e0b',
                minWidth: 120,
                boxShadow: '0 4px 12px rgba(245, 158, 11, 0.15)',
                transition: 'all 0.3s ease',
              }}
            >
              <Text
                style={{
                  color: '#92400e',
                  fontSize: '10px',
                  display: 'block',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  marginBottom: 4,
                }}
              >
                💸 DISCOUNT
              </Text>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  justifyContent: 'center',
                }}
              >
                <InputNumber
                  min={0}
                  value={billSettings.discount}
                  onChange={value =>
                    setBillSettings(prev => ({ ...prev, discount: value || 0 }))
                  }
                  style={{ width: 70 }}
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
              <div
                style={{
                  textAlign: 'center',
                  background:
                    'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid #3b82f6',
                  minWidth: 130,
                  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.15)',
                  transition: 'all 0.3s ease',
                }}
              >
                <Text
                  style={{
                    color: '#1e40af',
                    fontSize: '10px',
                    display: 'block',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    marginBottom: 4,
                  }}
                >
                  💰 PARTIAL PAY
                </Text>
                <InputNumber
                  min={0}
                  max={billCalculations.total_amount}
                  value={billSettings.paidAmount}
                  onChange={value =>
                    setBillSettings(prev => ({
                      ...prev,
                      paidAmount: value || 0,
                    }))
                  }
                  style={{ width: 90 }}
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
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
          padding: '16px 20px',
          margin: '0 8px 12px 8px',
          borderRadius: '12px',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 8px 25px rgba(0, 0, 0, 0.08)',
          border: '1px solid #e2e8f0',
          animation: 'slideInUp 0.8s ease-out 1.5s both',
        }}
      >
        {/* Background decoration */}
        <div
          style={{
            position: 'absolute',
            top: -30,
            right: -30,
            width: 80,
            height: 80,
            background: 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
            borderRadius: '50%',
            opacity: 0.16,
            animation: 'float 6s ease-in-out infinite',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -20,
            left: -20,
            width: 60,
            height: 60,
            background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
            borderRadius: '50%',
            opacity: 0.14,
            animation: 'float 8s ease-in-out infinite reverse',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: -15,
            width: 45,
            height: 45,
            background: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
            borderRadius: '50%',
            opacity: 0.12,
            animation: 'float 9s ease-in-out infinite 1s',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -15,
            right: '10%',
            width: 35,
            height: 35,
            background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)',
            borderRadius: '50%',
            opacity: 0.1,
            animation: 'float 11s ease-in-out infinite 2s',
          }}
        />

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            position: 'relative',
            zIndex: 1,
          }}
        >
          <Button
            type="primary"
            size="large"
            icon={<SaveOutlined />}
            onClick={handleSaveBill}
            loading={saleCreateLoading}
            style={{
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              border: 'none',
              fontWeight: 800,
              height: '48px',
              padding: '0 28px',
              borderRadius: '25px',
              fontSize: '16px',
              boxShadow: '0 6px 20px rgba(16, 185, 129, 0.3)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              transition: 'all 0.3s ease',
              transform: 'scale(1)',
              cursor: 'pointer',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow =
                '0 8px 25px rgba(16, 185, 129, 0.4)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow =
                '0 6px 20px rgba(16, 185, 129, 0.3)';
            }}
          >
            🚀 {billdata ? 'UPDATE' : 'SAVE BILL'} (F2)
          </Button>

          <Button
            size="large"
            icon={<PrinterOutlined />}
            style={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              color: 'white',
              border: 'none',
              fontWeight: 800,
              height: '48px',
              padding: '0 24px',
              borderRadius: '25px',
              fontSize: '15px',
              boxShadow: '0 6px 20px rgba(59, 130, 246, 0.3)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              transition: 'all 0.3s ease',
              transform: 'scale(1)',
              cursor: 'pointer',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'scale(1.05)';
              e.currentTarget.style.boxShadow =
                '0 8px 25px rgba(59, 130, 246, 0.4)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.boxShadow =
                '0 6px 20px rgba(59, 130, 246, 0.3)';
            }}
          >
            🖨️ PRINT (F3)
          </Button>
        </div>

        <div
          style={{
            background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
            padding: '14px 18px',
            borderRadius: '10px',
            border: '1px solid #cbd5e1',
            position: 'relative',
            zIndex: 1,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
          }}
        >
          <div style={{ textAlign: 'right' }}>
            <Text
              style={{
                color: '#475569',
                fontSize: '12px',
                display: 'block',
                fontWeight: 600,
                lineHeight: '18px',
              }}
            >
              ⚡ <strong>Keyboard Shortcuts:</strong> Ctrl+S (Save) • Ctrl+N
              (Add) • Ctrl+D/Del (Delete) • Tab/Shift+Tab (Navigate) • Enter
              (Edit) • Esc (Cancel)
            </Text>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillDataGrid;
