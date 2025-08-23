import React, { useEffect, useState, useMemo } from 'react';
import { Button, Typography, message, Switch, InputNumber, Badge, Tooltip } from 'antd';
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
  ClearOutlined,
} from '@ant-design/icons';
import StockSelectionModal from './StockSelectionModal';
import CustomerSelectionModal from './CustomerSelectionModal';
import BillSaveConfirmationModal from './BillSaveConfirmationModal';
import BillListDrawer from './BillListDrawer';
import styles from './BillDataGrid.module.css';

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

  const [stockModalRowIndex, setStockModalRowIndex] = useState<number | null>(null);
  const [externalEditingCell, setExternalEditingCell] = useState<{ row: number; col: number } | null>(null);
  const [customerModalVisible, setCustomerModalVisible] = useState(false);
  const [saveConfirmationVisible, setSaveConfirmationVisible] = useState(false);
  const [billListDrawerVisible, setBillListDrawerVisible] = useState(false);
  const [savedBillData, setSavedBillData] = useState<any>(null);

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
      const defaultItems = Array(1)
        .fill(null)
        .map((_, index) => ({
          product_id: '',
          product_name: '',
          variant_name: '',
          stock_id: '',
          batch_no: '',
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

  // Debug: Monitor billFormData changes
  useEffect(() => {
    console.log('billFormData changed:', billFormData);
  }, [billFormData]);

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
    () => {
      const options = customerList?.result?.map((customer: any) => ({
        label: `${customer.full_name} - ${customer.mobile}`,
        value: customer._id,
      })) || [];
      console.log('Customer options:', options); // Debug log
      return options;
    },
    [customerList]
  );



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
      render: (value: any, record: any) => {
        const selectedCustomer = customerOptions.find((opt: any) => opt.value === value);
        return (
          <Tooltip title="Click to open customer selection modal (or press End key)">
            <div 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                cursor: 'pointer',
                padding: '4px 8px',
                borderRadius: '4px',
                border: '1px solid #d9d9d9',
                backgroundColor: '#fafafa',
                transition: 'all 0.2s ease'
              }}
              onClick={() => setCustomerModalVisible(true)}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#f0f0f0';
                e.currentTarget.style.borderColor = '#1890ff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#fafafa';
                e.currentTarget.style.borderColor = '#d9d9d9';
              }}
            >
              <span>{selectedCustomer ? selectedCustomer.label : 'Select customer'}</span>
              <span style={{ 
                fontSize: '10px', 
                color: '#1890ff', 
                backgroundColor: '#f0f8ff', 
                padding: '2px 6px', 
                borderRadius: '4px',
                border: '1px solid #d6e4ff'
              }}>
                End
              </span>
            </div>
          </Tooltip>
        );
      },
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

  const headerData = useMemo(() => [
    {
      invoice_no: billFormData.invoice_no,
      date: billFormData.date,
      customer_id: billFormData.customer_id,
      payment_mode: billFormData.payment_mode,
    },
  ], [billFormData.invoice_no, billFormData.date, billFormData.customer_id, billFormData.payment_mode]);

  // Column definitions for bill items
  const itemColumns: AntdEditableColumn[] = [
    {
      key: 'product_id',
      title: '🛒 PRODUCT',
      dataIndex: 'product_id',
      type: 'product', // triggers modal
      required: true,
      width: 280,
      // render property removed
    },
    {
      key: 'stock_id',
      title: '📦 STOCK',
      dataIndex: 'batch_no',
      type: 'stock',
      required: true,
      width: 200,
      editable: true, // allow editing to open modal
      render: (value, record, index) => (
        <Tooltip
          title={
            record.product_id
              ? value
                ? `Stock: ${value} - Click to change`
                : 'Click to select stock from available inventory'
              : 'Please select a product first to choose stock'
          }
          placement="top"
        >
          <div
            style={{
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: '4px',
              border: value ? '1px solid #52c41a' : '1px solid #d9d9d9',
              backgroundColor: value ? '#f6ffed' : '#fafafa',
              transition: 'all 0.2s ease',
              minHeight: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
            onClick={() => {
              if (record.product_id && typeof index === 'number') {
                setStockModalRowIndex(index);
              } else if (!record.product_id) {
                message.warning('Please select a product first');
              }
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f0f0f0';
              e.currentTarget.style.borderColor = '#1890ff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#fafafa';
              e.currentTarget.style.borderColor = '#d9d9d9';
            }}
          >
            <span style={{ 
              color: value ? '#52c41a' : record.product_id ? '#1890ff' : '#bfbfbf',
              fontWeight: value ? 600 : 400
            }}>
              {value }
            </span>
            {record.product_id && (
              <span style={{ fontSize: '12px', color: '#1890ff' }}>📋</span>
            )}
            {record.product_id && !value && (
              <div style={{ fontSize: '10px', color: '#ff4d4f', marginTop: '2px' }}>
                ⚠️ Stock required
              </div>
            )}
          </div>
        </Tooltip>
      ),
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
      editable: false, // Make rate not editable
      render: (value) => <InputNumber value={value} disabled style={{ width: '100%' }} />,
    },
    {
      key: 'amount',
      title: '💵 AMOUNT',
      dataIndex: 'amount',
      type: 'number',
      editable: false, // Make amount not editable
      width: 130,
      render: (value) => <InputNumber value={value} disabled style={{ width: '100%' }} />,
    },
  ];

  // Find the column index for qty
  const qtyColIndex = itemColumns.findIndex(col => col.key === 'qty' || col.dataIndex === 'qty');

  // Calculate bill totals
  const billCalculations = useMemo(() => {
    if (!billFormData.items.length)
      return {
        sub_total: 0,
        value_of_goods: 0,
        total_gst: 0,
        cgst: 0,
        sgst: 0,
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
        product_name:
          productOptions.find((opt: { label: string; value: string }) => opt.value === item.product_id)?.label || '',
        variant_name: item.variant_name || '',
        stock_id: item.stock_id || '',
        batch_no: item.batch_no || '', // ✅ Preserve batch_no from input
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
        const stockList = branchId ? branchStockList : stockAuditList;
        const availableStocks = stockList?.result?.filter(
          (stock: any) => stock.product === item.product_id || stock.ProductItem?._id === item.product_id
        ) || [];
        
        if (availableStocks.length > 0) {
          const firstStock = availableStocks[0];
          billItem.stock_id = firstStock._id;
          billItem.batch_no = firstStock.batch_no || '';

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
          batch_no: stock.batch_no || '',
        };
      }

      return item;
    });

    setBillFormData(prev => ({ ...prev, items: updatedItems }));
  };

  const handleProductSelect = (product: any, rowIndex: number) => {
    const newItems = [...billFormData.items];
    // Robustly set product_id from product.id or product._id
    newItems[rowIndex].product_id = product.id || product._id || '';
    newItems[rowIndex].product_name = product.name || '';
    newItems[rowIndex].price = product.selling_price || 0;
    handleItemsChange(newItems);
    setStockModalRowIndex(rowIndex); // Open stock modal for this row
  };

  const handleStockSelect = (stock: any) => {
    if (stockModalRowIndex === null) return;
    const newItems = [...billFormData.items];
    newItems[stockModalRowIndex].stock_id = stock.id || stock._id || stock.invoice_id || '';
    newItems[stockModalRowIndex].batch_no = stock.batch_no || '';
    handleItemsChange(newItems);
    setStockModalRowIndex(null); // Close stock modal

    // Set external editing cell to qty cell in the same row
    if (qtyColIndex !== -1) {
      setExternalEditingCell({ row: stockModalRowIndex, col: qtyColIndex });
    }
  };

  // Handle customer selection from modal
  const handleCustomerSelect = (customer: any) => {
    console.log('Customer selected:', customer); // Debug log
    setBillFormData(prev => {
      const updated = {
        ...prev,
        customer_id: customer._id,
        customer_name: customer.full_name,
      };
      console.log('Updated billFormData:', updated); // Debug log
      return updated;
    });
    // Ensure modal closes
    setTimeout(() => {
      setCustomerModalVisible(false);
    }, 50);
    message.success(`Customer "${customer.full_name}" selected successfully!`);
  };

  // Handle new bill creation
  const handleNewBill = () => {
    // Clear all form data for new bill
    setBillFormData({
      invoice_no: '',
      date: dayjs().format('YYYY-MM-DD'),
      customer_id: '',
      customer_name: '',
      payment_mode: 'cash',
      items: [],
    });
    
    // Reset bill settings
    setBillSettings({
      isPaid: true,
      isPartiallyPaid: false,
      isRetail: true,
      isGstIncluded: true,
      discount: 0,
      discountType: 'percentage',
      paidAmount: 0,
    });
    
    setSaveConfirmationVisible(false);
    setSavedBillData(null);
    
    // Generate new invoice number
    InvoiceNumberApi('Create');
    setTimeout(() => InvoiceNumberApi('GetAll'), 500);
    
    message.success('New bill form cleared successfully!');
  };

  // Handle continue with current bill
  const handleContinueBill = () => {
    setSaveConfirmationVisible(false);
    setSavedBillData(null);
  };

  // Handle clear bill form
  const handleClearBill = () => {
    // Reset all form data to initial state
    setBillFormData({
      invoice_no: '',
      date: dayjs().format('YYYY-MM-DD'),
      customer_id: '',
      customer_name: '',
      payment_mode: 'cash',
      items: [
        {
          product_id: '',
          product_name: '',
          variant_name: '',
          stock_id: '',
          batch_no: '',
          qty: 0,
          loose_qty: 0,
          price: 0,
          mrp: 0,
          amount: 0,
          tax_percentage: 0,
        },
      ],
    });

    // Reset bill settings
    setBillSettings({
      isPaid: true,
      isPartiallyPaid: false,
      isRetail: true,
      isGstIncluded: true,
      discount: 0,
      discountType: 'percentage',
      paidAmount: 0,
    });

    // Reset any other states
    setSavedBillData(null);
    
    // Show success message
    message.success('Bill form cleared successfully!');
  };

    // Handle view bill from drawer
  const handleViewBill = (bill: any) => {
    console.log('Loading bill data:', bill); // Debug log
    
    if (!bill) {
      message.error('No bill data received');
      return;
    }
    
    // Ensure we have the latest data loaded
    ProductsApi('GetAll');
    CustomerApi('GetAll');
    if (branchId) {
      BranchStock('GetAll');
    } else {
      StockAuditApi('GetAll');
    }
    
    // Force immediate data loading if not already loaded
    if (!productList?.result) {
      console.log('Product list not loaded, forcing immediate load...');
      ProductsApi('GetAll');
    }
    
    if (!customerList?.result) {
      console.log('Customer list not loaded, forcing immediate load...');
      CustomerApi('GetAll');
    }
    
    const currentStockList = branchId ? branchStockList : stockAuditList;
    if (!currentStockList?.result) {
      console.log('Stock list not loaded, forcing immediate load...');
      if (branchId) {
        BranchStock('GetAll');
      } else {
        StockAuditApi('GetAll');
      }
    }
    
    // Handle different possible data structures for items
    let items = [];
    if (bill.Items && Array.isArray(bill.Items)) {
      items = bill.Items;
      console.log('Found items in bill.Items:', items);
    } else if (bill.items && Array.isArray(bill.items)) {
      items = bill.items;
      console.log('Found items in bill.items:', items);
    } else if (bill.sales_items && Array.isArray(bill.sales_items)) {
      items = bill.sales_items;
      console.log('Found items in bill.sales_items:', items);
    } else if (bill.result && bill.result.Items && Array.isArray(bill.result.Items)) {
      items = bill.result.Items;
      console.log('Found items in bill.result.Items:', items);
    } else if (bill.result && bill.result.items && Array.isArray(bill.result.items)) {
      items = bill.result.items;
      console.log('Found items in bill.result.items:', items);
    } else {
      console.log('No items found in bill. Available keys:', Object.keys(bill));
      console.log('bill.Items:', bill.Items);
      console.log('bill.items:', bill.items);
      console.log('bill.sales_items:', bill.sales_items);
      if (bill.result) {
        console.log('bill.result keys:', Object.keys(bill.result));
        console.log('bill.result.Items:', bill.result.Items);
        console.log('bill.result.items:', bill.result.items);
      }
    }
    
    console.log('Extracted items:', items); // Debug log
    
    // Debug stock information
    items.forEach((item: any, index: number) => {
      console.log(`Item ${index} stock info:`, {
        stock_id: item.stock_id,
        branch_stock_id: item.branch_stock_id,
        stock: item.stock,
        batch_no: item.batch_no
      });
    });
    
    // Map items with proper fallbacks and enhanced product name resolution
    const mappedItems = items.map((item: any, index: number) => {
      console.log(`Processing item ${index}:`, item);
      
      // Try to get the best product name from various sources
      let productName = '';
      let variantName = '';
      
      if (item.productItems?.name) {
        productName = item.productItems.name;
        variantName = item.productItems.VariantItem?.variant_name || '';
        console.log(`Found product name in productItems.name: ${productName}`);
      } else if (item.product_name) {
        productName = item.product_name;
        variantName = item.variant_name || '';
        console.log(`Found product name in product_name: ${productName}`);
      } else if (item.product?.name) {
        productName = item.product.name;
        variantName = item.product.VariantItem?.variant_name || '';
        console.log(`Found product name in product.name: ${productName}`);
      } else if (item.product_id) {
        // Try to find product name from productList if available
        const product = productList?.result?.find((p: any) => p._id === item.product_id);
        if (product) {
          productName = product.name;
          variantName = product.VariantItem?.variant_name || '';
          console.log(`Found product name from productList: ${productName}`);
        } else {
          // If product list is not loaded yet, try to load it and mark for later update
          if (!productList?.result) {
            ProductsApi('GetAll');
          }
          // Use a more descriptive placeholder that will be updated later
          productName = `Loading... (ID: ${item.product_id})`;
          console.log(`Product not found in productList, using placeholder: ${productName}`);
          
          // Try to force load and resolve immediately
          setTimeout(() => {
            if (productList?.result) {
              const foundProduct = productList.result.find((p: any) => p._id === item.product_id);
              if (foundProduct) {
                console.log(`Immediate resolution found product: ${foundProduct.name}`);
                // Update the item directly
                const updatedItems = [...billFormData.items];
                const itemIndex = updatedItems.findIndex(i => i.product_id === item.product_id);
                if (itemIndex !== -1) {
                  updatedItems[itemIndex].product_name = foundProduct.name;
                  updatedItems[itemIndex].variant_name = foundProduct.VariantItem?.variant_name || '';
                  setBillFormData(prev => ({ ...prev, items: updatedItems }));
                }
              }
            }
          }, 100);
        }
      } else {
        console.log(`No product name found for item ${index}`);
      }
      
      // Handle stock information with proper fallbacks
      let stockId = '';
      let batchNo = '';
      
      if (item.stock_id) {
        stockId = item.stock_id;
        batchNo = item.batch_no || '';
      } else if (item.branch_stock_id) {
        stockId = item.branch_stock_id;
        batchNo = item.batch_no || '';
      } else if (item.stock) {
        stockId = item.stock;
        batchNo = item.batch_no || '';
      }
      
      // If we have stock_id but no batch_no, try to find it from stock list
      if (stockId && !batchNo) {
        const stockList = branchId ? branchStockList : stockAuditList;
        const stock = stockList?.result?.find((s: any) => s._id === stockId);
        if (stock) {
          batchNo = stock.batch_no || '';
          console.log(`Found batch_no from stock list: ${batchNo}`);
        } else {
          // If stock list is not loaded yet, mark for later update
          if (!stockList?.result) {
            if (branchId) {
              BranchStock('GetAll');
            } else {
              StockAuditApi('GetAll');
            }
          }
          batchNo = `Loading... (Stock: ${stockId})`;
          console.log(`Stock not found in stock list, using placeholder: ${batchNo}`);
          
          // Try to force load and resolve immediately
          setTimeout(() => {
            const currentStockList = branchId ? branchStockList : stockAuditList;
            if (currentStockList?.result) {
              const foundStock = currentStockList.result.find((s: any) => s._id === stockId);
              if (foundStock) {
                console.log(`Immediate resolution found stock batch: ${foundStock.batch_no}`);
                // Update the item directly
                const updatedItems = [...billFormData.items];
                const itemIndex = updatedItems.findIndex(i => i.stock_id === stockId);
                if (itemIndex !== -1) {
                  updatedItems[itemIndex].batch_no = foundStock.batch_no || '';
                  setBillFormData(prev => ({ ...prev, items: updatedItems }));
                }
              }
            }
          }, 100);
        }
      }
      
      const mappedItem = {
        _id: item._id || '',
        product_id: item.product_id || item.product || '',
        product_name: productName,
        variant_name: variantName,
        stock_id: stockId,
        batch_no: batchNo,
        qty: item.qty || 0,
        loose_qty: item.loose_qty || 0,
        price: item.price || 0,
        mrp: item.mrp || item.price || 0,
        amount: item.amount || 0,
        tax_percentage: item.tax_percentage || 0,
      };
      
      console.log(`Mapped item ${index}:`, mappedItem);
      return mappedItem;
    });
    
    console.log('Final mapped items:', mappedItems); // Debug log
    
    // Handle customer information with fallbacks
    const customerId = bill.customer_id || '';
    let customerName = '';
    
    if (bill.customerDetails?.full_name) {
      customerName = bill.customerDetails.full_name;
    } else if (bill.customer_name) {
      customerName = bill.customer_name;
    } else if (bill.customer?.full_name) {
      customerName = bill.customer.full_name;
    } else if (bill.customer_id) {
      // Try to find customer name from customerList if available
      const customer = customerList?.result?.find((c: any) => c._id === bill.customer_id);
      customerName = customer?.full_name || `Customer ID: ${bill.customer_id}`;
    }
    
    console.log('Customer info - ID:', customerId, 'Name:', customerName);
    
    // Handle date with fallback
    let formattedDate = dayjs().format('YYYY-MM-DD'); // Default to today
    if (bill.date) {
      try {
        formattedDate = dayjs(bill.date).format('YYYY-MM-DD');
      } catch (error) {
        console.log('Error formatting date:', bill.date, error);
        formattedDate = dayjs().format('YYYY-MM-DD');
      }
    }
    
    console.log('Date info - Original:', bill.date, 'Formatted:', formattedDate);
    
    // Immediately resolve any available product names and stock info if data is already loaded
    let finalMappedItems = [...mappedItems];
    
    // If product list is already loaded, resolve product names immediately
    if (productList?.result) {
      finalMappedItems = finalMappedItems.map(item => {
        if (item.product_id && (item.product_name.includes('Loading...') || item.product_name.includes('Product ID:'))) {
          const product = productList.result.find((p: any) => p._id === item.product_id);
          if (product) {
            console.log(`Immediately resolving product name for ${item.product_id}: ${item.product_name} -> ${product.name}`);
            return {
              ...item,
              product_name: product.name,
              variant_name: product.VariantItem?.variant_name || ''
            };
          }
        }
        return item;
      });
    }
    
    // If stock list is already loaded, resolve batch numbers immediately
    const stockList = branchId ? branchStockList : stockAuditList;
    if (stockList?.result) {
      finalMappedItems = finalMappedItems.map(item => {
        if (item.stock_id && (item.batch_no.includes('Loading...') || !item.batch_no)) {
          const stock = stockList.result.find((s: any) => s._id === item.stock_id);
          if (stock) {
            console.log(`Immediately resolving batch_no for stock ${item.stock_id}: ${item.batch_no} -> ${stock.batch_no}`);
            return {
              ...item,
              batch_no: stock.batch_no || ''
            };
          }
        }
        return item;
      });
    }
    
    console.log('Final resolved items:', finalMappedItems);
    
    // Load bill data into form with resolved items
    setBillFormData({
      invoice_no: bill.invoice_no || '',
      date: formattedDate,
      customer_id: customerId,
      customer_name: customerName,
      payment_mode: bill.payment_mode || 'cash',
      items: finalMappedItems,
    });
    
    // Load bill settings with proper fallbacks
    setBillSettings({
      isPaid: bill.is_paid ?? true,
      isPartiallyPaid: bill.is_partially_paid ?? false,
      isRetail: bill.sale_type === 'retail' || bill.sale_type === undefined,
      isGstIncluded: bill.is_gst_included ?? true,
      discount: bill.discount || 0,
      discountType: bill.discount_type || 'percentage',
      paidAmount: bill.paid_amount || 0,
    });
    
    // Show success message
    message.success(`Bill "${bill.invoice_no}" loaded successfully!`);
    
    // Force immediate resolution after a short delay to catch any data that loads asynchronously
    setTimeout(() => {
      forceResolveProductNamesAndStock();
    }, 100);
    
    // Add a more aggressive resolution approach
    setTimeout(() => {
      forceResolveProductNamesAndStock();
    }, 500);
    
    setTimeout(() => {
      forceResolveProductNamesAndStock();
    }, 1000);
  };

  // Force resolve product names and stock information
  const forceResolveProductNamesAndStock = () => {
    if (billFormData.items.length === 0) return;
    
    let hasChanges = false;
    const updatedItems = billFormData.items.map(item => {
      let updated = false;
      
      // Resolve product names
      if (item.product_id && productList?.result) {
        const product = productList.result.find((p: any) => p._id === item.product_id);
        if (product && (item.product_name.includes('Loading...') || item.product_name.includes('Product ID:') || !item.product_name)) {
          item.product_name = product.name;
          item.variant_name = product.VariantItem?.variant_name || '';
          updated = true;
          console.log(`Force resolved product name for ${item.product_id}: ${product.name}`);
        }
      }
      
      // Resolve stock batch numbers
      if (item.stock_id) {
        const stockList = branchId ? branchStockList : stockAuditList;
        if (stockList?.result) {
          const stock = stockList.result.find((s: any) => s._id === item.stock_id);
          if (stock && (item.batch_no?.includes('Loading...') || !item.batch_no)) {
            item.batch_no = stock.batch_no || '';
            updated = true;
            console.log(`Force resolved batch_no for stock ${item.stock_id}: ${stock.batch_no}`);
          }
        }
      }
      
      if (updated) hasChanges = true;
      return item;
    });
    
    if (hasChanges) {
      setBillFormData(prev => ({
        ...prev,
        items: updatedItems
      }));
      console.log('Force resolved items:', updatedItems);
    }
  };

  // Handle item addition
  const handleAddItem = () => {
    const newItem: BillItem = {
      product_id: '',
      product_name: '',
      variant_name: '',
      stock_id: '',
      batch_no: '',
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
    setBillFormData(prev => {
      const newItems = prev.items.filter((_, index:any) => !indices.includes(index?.toString()));
      return {
        ...prev,
        items: newItems,
      };
    });
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
    if(!billFormData.customer_id){
      message.error('Please select a customer');
      return;
    }
    if(!billFormData.payment_mode){
      message.error('Please select a payment mode');
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
      let response: any;
      if (billdata) {
        response = await SalesRecord('Update', payload, billdata._id);
      } else {
        response = await SalesRecord('Create', payload);
      }
      
      // Show confirmation modal after successful save
      if (response?.statusCode === 200) {
        const savedData = {
          ...payload,
          customer_name: billFormData.customer_name,
          total_amount: billCalculations.total_amount,
          invoice_no: payload.invoice_no,
          date: payload.date
        };
        setSavedBillData(savedData);
        setSaveConfirmationVisible(true);
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
      // Note: Form reset is now handled by the confirmation modal
    }
  }, [createItems]);

  // Handle update success
  useEffect(() => {
    if (updateItems?.statusCode === 200) {
      onSuccess?.();
    }
  }, [updateItems]);

  // Update product names when product list is loaded (for bill viewing)
  useEffect(() => {
    if (productList?.result && billFormData.items.length > 0) {
      // Check if any items have product_id but no product_name or have placeholder text
      const needsUpdate = billFormData.items.some(item => 
        item.product_id && (!item.product_name || item.product_name.includes('Loading...') || item.product_name.includes('Product ID:'))
      );
      
      if (needsUpdate) {
        console.log('Product list loaded, updating product names...');
        const updatedItems = billFormData.items.map(item => {
          if (item.product_id && (!item.product_name || item.product_name.includes('Loading...') || item.product_name.includes('Product ID:'))) {
            const product = productList.result.find((p: any) => p._id === item.product_id);
            if (product) {
              console.log(`Updating product name for ${item.product_id}: ${item.product_name} -> ${product.name}`);
              return {
                ...item,
                product_name: product.name,
                variant_name: product.VariantItem?.variant_name || ''
              };
            }
          }
          return item;
        });
        
        // Only update if we actually made changes
        const hasChanges = updatedItems.some((item, index) => 
          item.product_name !== billFormData.items[index].product_name
        );
        
        if (hasChanges) {
          setBillFormData(prev => ({
            ...prev,
            items: updatedItems
          }));
          console.log('Updated bill items with resolved product names:', updatedItems);
        }
      }
    }
  }, [productList, billFormData.items]);

  // Force resolve product names when product list changes
  useEffect(() => {
    if (productList?.result && billFormData.items.length > 0) {
      // Force resolve any remaining unresolved product names
      setTimeout(() => {
        forceResolveProductNamesAndStock();
      }, 200);
    }
  }, [productList]);

  // Update stock information when stock list is loaded (for bill viewing)
  useEffect(() => {
    const stockList = branchId ? branchStockList : stockAuditList;
    if (stockList?.result && billFormData.items.length > 0) {
      // Check if any items have stock_id but no batch_no or have placeholder text
      const needsUpdate = billFormData.items.some(item => 
        item.stock_id && (!item.batch_no || item.batch_no.includes('Loading...'))
      );
      
      if (needsUpdate) {
        console.log('Stock list loaded, updating batch numbers...');
        const updatedItems = billFormData.items.map(item => {
          if (item.stock_id && (!item.batch_no || item.batch_no.includes('Loading...'))) {
            const stock = stockList.result.find((s: any) => s._id === item.stock_id);
            if (stock) {
              console.log(`Updating batch_no for stock ${item.stock_id}: ${item.batch_no} -> ${stock.batch_no}`);
              return {
                ...item,
                batch_no: stock.batch_no || ''
              };
            }
          }
          return item;
        });
        
        // Only update if we actually made changes
        const hasChanges = updatedItems.some((item, index) => 
          item.batch_no !== billFormData.items[index].batch_no
        );
        
        if (hasChanges) {
          setBillFormData(prev => ({
            ...prev,
            items: updatedItems
          }));
          console.log('Updated bill items with resolved stock information:', updatedItems);
        }
      }
    }
  }, [branchStockList, stockAuditList, billFormData.items, branchId]);

  // Force resolve stock information when stock list changes
  useEffect(() => {
    const stockList = branchId ? branchStockList : stockAuditList;
    if (stockList?.result && billFormData.items.length > 0) {
      // Force resolve any remaining unresolved stock information
      setTimeout(() => {
        forceResolveProductNamesAndStock();
      }, 200);
    }
  }, [branchStockList, stockAuditList, branchId]);

  // Periodic check to resolve any remaining unresolved data
  useEffect(() => {
    if (billFormData.items.length > 0) {
      const interval = setInterval(() => {
        const hasUnresolvedItems = billFormData.items.some(item => 
          (item.product_id && (!item.product_name || item.product_name.includes('Loading...') || item.product_name.includes('Product ID:'))) ||
          (item.stock_id && (!item.batch_no || item.batch_no.includes('Loading...')))
        );
        
        if (hasUnresolvedItems && (productList?.result || (branchId ? branchStockList?.result : stockAuditList?.result))) {
          console.log('Periodic check: Resolving unresolved items...');
          forceResolveProductNamesAndStock();
        }
      }, 1000); // Check every second
      
      return () => clearInterval(interval);
    }
  }, [billFormData.items, productList, branchStockList, stockAuditList, branchId]);

  // Ultra-Fast Billing Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // F1: Add item and focus first product field
      if (e.key === 'F1') {
        e.preventDefault();
        handleAddItem();
        setTimeout(() => {
          const productCell = document.querySelector('.ant-table-tbody tr:last-child td[data-column-key="product_id"]') as HTMLElement;
          productCell?.focus();
        }, 200);
      }
      // F2: Save bill
      else if (e.key === 'F2') {
        e.preventDefault();
        handleSaveBill();
      }
      // F3: Print bill
      else if (e.key === 'F3') {
        e.preventDefault();
        // TODO: Implement print functionality
        message.info('Print functionality coming soon!');
      }
      // F4: Clear bill form
      else if (e.key === 'F4') {
        e.preventDefault();
        handleClearBill();
      }
      // End: Open customer selection modal
      else if (e.key === 'End') {
        e.preventDefault();
        setCustomerModalVisible(true);
      }
      // F6: Open bill list drawer
      else if (e.key === 'F6') {
        e.preventDefault();
        setBillListDrawerVisible(true);
      }
      // F5: Add 5 items
      // else if (e.key === 'F5') {
      //   e.preventDefault();
      //   for (let i = 0; i < 5; i++) {
      //     handleAddItem();
      //   }
      //   setTimeout(() => {
      //     const productCell = document.querySelector('.ant-table-tbody tr:last-child td[data-column-key="product_id"]') as HTMLElement;
      //     productCell?.focus();
      //   }, 200);
      // }
      // Ctrl shortcuts
      else if (e.ctrlKey) {
        switch (e.key) {
          case 's':
            e.preventDefault();
            handleSaveBill();
            break;
          case 'n':
            e.preventDefault();
            handleAddItem();
            setTimeout(() => {
              const productCell = document.querySelector('.ant-table-tbody tr:last-child td[data-column-key="product_id"]') as HTMLElement;
              productCell?.focus();
            }, 200);
            break;
          case 'p':
            e.preventDefault();
            // TODO: Implement print functionality
            message.info('Print functionality coming soon!');
            break;
          case 'r':
            e.preventDefault();
            // Reset form
            setBillFormData({
              invoice_no: '',
              date: dayjs().format('YYYY-MM-DD'),
              customer_id: '',
              customer_name: '',
              payment_mode: 'cash',
              items: [],
            });
            break;
        }
      }
      // Quick quantity entry (Ctrl + 0-9)
      else if (e.ctrlKey && /^[0-9]$/.test(e.key)) {
        e.preventDefault();
        const activeElement = document.activeElement as HTMLElement;
        if (activeElement?.closest('td[data-column-key="qty"]')) {
          const input = activeElement.querySelector('input') as HTMLInputElement;
          if (input) {
            input.value = e.key;
            input.dispatchEvent(new Event('change', { bubbles: true }));
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [billFormData, billSettings]);

  return (
    <div className={styles.mainContainer}>
      {/* Background Half Circles */}
      <div className={styles.backgroundCircle1} />
      <div className={styles.backgroundCircle2} />
      <div className={styles.backgroundCircle3} />
      <div className={styles.backgroundCircle4} />
      <div className={styles.backgroundCircle5} />
      {/* Ultra-Fast Billing Header */}
      <div className={styles.headerContainer}>
        {/* Animated decorative background elements */}
        <div className={styles.headerCircle1} />
        <div className={styles.headerCircle2} />
        <div className={styles.headerCircle3} />
        <div className={styles.headerCircle4} />
        <div className={styles.headerCircle5} />

        <div className={styles.headerContent}>
          {/* Title Section */}
          <div className={styles.titleSection}>
            <div className={styles.titleIcon}>
              <FileTextOutlined style={{ fontSize: '24px', color: 'white' }} />
            </div>
            <div>
              <Title level={4} className={styles.titleText}>
                {billdata ? '⚡ EDIT INVOICE' : '🚀 NEW INVOICE'}
              </Title>
              <Text className={styles.subtitleText}>
                ⚡Lightning Fast •{' '}
                {dayjs().format('DD MMM YYYY, dddd')}
              </Text>
            </div>
          </div>

          {/* Controls Section */}
          <div className={styles.controlsSection}>
            <div className={`${styles.controlGroup} ${styles.saleTypeControl}`}>
              <Text className={styles.controlLabel}>
                🏪 SALE TYPE
              </Text>
              <Switch
                checkedChildren="RETAIL"
                unCheckedChildren="WHOLESALE"
                checked={billSettings.isRetail}
                onChange={checked =>
                  setBillSettings(prev => ({ ...prev, isRetail: checked }))
                }
                className={styles.saleTypeSwitch}
                size="small"
              />
            </div>

            <div className={`${styles.controlGroup} ${styles.gstControl}`}>
              <Text className={styles.controlLabel}>
                📊 GST
              </Text>
              <Switch
                checkedChildren="INCL"
                unCheckedChildren="EXCL"
                checked={billSettings.isGstIncluded}
                onChange={checked =>
                  setBillSettings(prev => ({ ...prev, isGstIncluded: checked }))
                }
                className={styles.gstSwitch}
                size="small"
              />
            </div>

            <div className={`${styles.controlGroup} ${styles.paymentControl}`}>
              <Text className={styles.controlLabel}>
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
                className={styles.paymentSwitch}
                size="small"
              />
            </div>

            {!billSettings.isPaid && (
              <div className={`${styles.controlGroup} ${styles.partialPaymentControl}`}>
                <Text className={styles.controlLabel}>
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
                  className={styles.partialPaymentSwitch}
                  size="small"
                />
              </div>
            )}

            {/* Items and Amount Badges - Moved to the end */}
            <div className={styles.badgesContainer}>
              <div className={styles.itemsBadge}>
                <Text className={styles.badgeText}>
                  🎯 ITEMS: {billFormData.items.length}
                </Text>
              </div>
              <div className={styles.amountBadge}>
                <Text className={styles.badgeText}>
                  💰 ₹{billCalculations.total_amount.toFixed(2)}
                </Text>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Invoice Details Data Grid */}
      <div className={styles.invoiceDetailsGrid}>
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
      <div className={styles.itemsSection}>
        {/* Decorative half circles for items section */}
        <div className={styles.itemsCircle1} />
        <div className={styles.itemsCircle2} />
        {/* Bill Items Grid */}
        <div className={styles.billItemsGrid}>
          <div className={styles.billItemsHeader}>
            <Text className={styles.billItemsTitle}>
              🛒 BILL ITEMS
            </Text>
            <Badge
              count={billFormData.items.length}
              showZero
              size="small"
              style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
            >
              <Text className={styles.billItemsBadge}>
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
            onProductSelect={handleProductSelect}
            loading={productLoading || stockLoading || branchStockLoading}
            className="modern-bill-grid"
            size="small"
            rowKey="key"
            externalEditingCell={externalEditingCell}
          />
        </div>

        {/* Bill Summary - Right Side */}
        <div className={styles.billSummary}>
          {/* Decorative half circles for summary */}
          <div className={styles.summaryCircle1} />
          <div className={styles.summaryCircle2} />
          {/* Header */}
          <div className={styles.summaryHeader}>
            <Text className={styles.summaryTitle}>
              💰 BILL SUMMARY
            </Text>
          </div>

          {/* Summary Table */}
          <div className={styles.summaryTable}>
            <div className={styles.summaryRow}>
              <Text className={styles.summaryLabel}>
                Sub Total:
              </Text>
              <Text className={styles.summaryValue}>
                ₹{billCalculations.sub_total.toFixed(2)}
              </Text>
            </div>

            <div className={styles.summaryRow}>
              <Text className={styles.summaryLabel}>
                Value of Goods:
              </Text>
              <Text className={styles.summaryValue}>
                ₹{billCalculations.value_of_goods.toFixed(2)}
              </Text>
            </div>

            <div className={styles.summaryRow}>
              <Text className={styles.summaryLabel}>
                Total GST:
              </Text>
              <Text className={styles.summaryValue}>
                ₹{billCalculations.total_gst.toFixed(2)}
              </Text>
            </div>

            <div className={styles.summaryRow}>
              <Text className={styles.summaryLabel}>
                CGST:
              </Text>
              <Text className={styles.summaryValue}>
                ₹{billCalculations.cgst.toFixed(2)}
              </Text>
            </div>

            <div className={styles.summaryRow}>
              <Text className={styles.summaryLabel}>
                SGST:
              </Text>
              <Text className={styles.summaryValue}>
                ₹{billCalculations.sgst.toFixed(2)}
              </Text>
            </div>

            {billSettings.discount > 0 && (
              <div className={styles.summaryRow}>
                <Text className={styles.summaryLabel}>
                  DISCOUNT:
                </Text>
                <Text className={styles.discountValue}>
                  -₹
                  {billSettings.discountType === 'percentage'
                    ? (
                        ((billCalculations.sub_total +
                          billCalculations.total_gst) *
                          (typeof billSettings.discount === 'number' ? billSettings.discount : 0)) /
                        100
                      ).toFixed(2)
                    : (typeof billSettings.discount === 'number' ? billSettings.discount : 0).toFixed(2)}
                </Text>
              </div>
            )}

            <div className={styles.totalAmountRow}>
              <Text className={styles.totalAmountLabel}>
                NET/EXC/REPL:
              </Text>
              <Text className={styles.totalAmountValue}>
                ₹{billCalculations.total_amount.toFixed(2)}
              </Text>
            </div>

            {billSettings.isPartiallyPaid && (
              <div className={styles.partialPaymentInfo}>
                <div className={styles.partialPaymentRow}>
                  <Text className={styles.partialPaymentLabel}> 
                    Paid Amount:
                  </Text>
                  <Text className={styles.partialPaymentValue}>
                    ₹{(typeof billSettings.paidAmount === 'number' ? billSettings.paidAmount : 0).toFixed(2)}
                  </Text>
                </div>
                <div className={styles.partialPaymentRow}>
                  <Text className={styles.partialPaymentLabel}>
                    Balance:
                  </Text>
                  <Text className={styles.partialPaymentValue}>
                    ₹
                    {(
                      billCalculations.total_amount - (typeof billSettings.paidAmount === 'number' ? billSettings.paidAmount : 0)
                    ).toFixed(2)}
                  </Text>
                </div>
              </div>
            )}
          </div>

          {/* Discount & Payment Controls */}
          <div className={styles.controlsContainer}>
            {/* Discount Controls */}
            <div className={styles.discountControl}>
              <Text className={styles.discountControlLabel}>
                💸 DISCOUNT
              </Text>
              <div className={styles.discountControlInputs}>
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
              <div className={styles.partialPaymentControl}>
                <Text className={styles.partialPaymentControlLabel}>
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
      <div className={styles.actionHub}>
        {/* Background decoration */}
        <div className={styles.actionHubCircle1} />
        <div className={styles.actionHubCircle2} />
        <div className={styles.actionHubCircle3} />
        <div className={styles.actionHubCircle4} />

        <div className={styles.actionButtonsContainer}>
          <Button
            type="primary"
            size="large"
            icon={<SaveOutlined />}
            onClick={handleSaveBill}
            loading={saleCreateLoading}
            className={styles.saveButton}
          >
            🚀 {billdata ? 'UPDATE' : 'SAVE BILL'} (F2)
          </Button>

                     <Button
             size="large"
             icon={<FileTextOutlined />}
             onClick={() => setBillListDrawerVisible(true)}
             className={styles.billListButton}
           >
             📋 BILL LIST (F6)
           </Button>

           <Button
             size="large"
             icon={<ClearOutlined />}
             onClick={handleClearBill}
             className={styles.clearButton}
           >
             🧹 CLEAR (F4)
           </Button>

          <Button
            size="large"
            icon={<PrinterOutlined />}
            className={styles.printButton}
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
              (Edit) • Esc (Cancel) • End (Customer Modal) • F4 (Clear) • F6 (Bill List)
            </Text>
          </div>
        </div>
      </div>
      {stockModalRowIndex !== null && (
        <StockSelectionModal
          visible={true}
          onSelect={handleStockSelect}
          onCancel={() => setStockModalRowIndex(null)}
          productId={billFormData.items[stockModalRowIndex]?.product_id || ''}
        />
      )}
      
      {/* Customer Selection Modal */}
      <CustomerSelectionModal
        visible={customerModalVisible}
        onSelect={handleCustomerSelect}
        onCancel={() => setCustomerModalVisible(false)}
      />

      {/* Bill Save Confirmation Modal */}
      <BillSaveConfirmationModal
        visible={saveConfirmationVisible}
        onNewBill={handleNewBill}
        onContinueBill={handleContinueBill}
        onCancel={() => setSaveConfirmationVisible(false)}
        savedBillData={savedBillData}
      />

      {/* Bill List Drawer */}
      <BillListDrawer
        visible={billListDrawerVisible}
        onClose={() => setBillListDrawerVisible(false)}
        onViewBill={handleViewBill}
        onNewBill={handleNewBill}
      />
    </div>
  );
};

export default BillDataGrid;
