import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  Button,
  Typography,
  message,
  Switch,
  InputNumber,
  Badge,
  Tooltip,
} from 'antd';
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
import UserSelectionModal from './UserSelectionModal';
import BillSaveConfirmationModal from './BillSaveConfirmationModal';
import BillListDrawer from './BillListDrawer';
import ProductDetailsModal from './ProductDetailsModal';
import ProductSelectionModal from './ProductSelectionModal';
import styles from './BillDataGrid.module.css';

const { Title, Text } = Typography;

interface BillDataGridProps {
  billdata?: any;
  onSuccess?: (formattedBill?: any) => void;
}

const BillDataGrid: React.FC<BillDataGridProps> = ({ billdata, onSuccess }) => {
  const { getEntityApi } = useApiActions();

  // Utility function to validate stock quantities based on pack size
  const validateStockQuantities = useCallback(
    (stock: any, productItem: any) => {
      if (!stock || !productItem?.VariantItem?.pack_size)
        return { isValid: true, expectedLoose: 0, totalAvailable: 0 };

      const packSize = parseInt(productItem.VariantItem.pack_size);
      const availablePackQty = stock.available_quantity || 0;
      const availableLooseQty = stock.available_loose_quantity || 0;

      // Stock quantities are valid as they are - no need to enforce a specific relationship
      // The validation happens during quantity entry, not during stock data validation
      const isValid = true; // Always valid - let the quantity validation handle limits
      const totalAvailable = availablePackQty * packSize + availableLooseQty;

      return { isValid, expectedLoose: availableLooseQty, totalAvailable };
    },
    []
  );

  // API hooks
  const ProductsApi = getEntityApi('Product');
  const CustomerApi = getEntityApi('Customer');
  const BillingUsersApi = getEntityApi('BillingUsers');
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
  const { items: userList, loading: userLoading } = useDynamicSelector(
    BillingUsersApi.getIdentifier('GetAll')
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
    billed_by_id: '',
    billed_by_name: '',
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

  const [stockModalRowIndex, setStockModalRowIndex] = useState<number | null>(
    null
  );
  const [externalEditingCell, setExternalEditingCell] = useState<{
    row: number;
    col: number;
  } | null>(null);
  const [customerModalVisible, setCustomerModalVisible] = useState(false);
  const [userModalVisible, setUserModalVisible] = useState(false);
  const [saveConfirmationVisible, setSaveConfirmationVisible] = useState(false);
  const [billListDrawerVisible, setBillListDrawerVisible] = useState(false);
  const [savedBillData, setSavedBillData] = useState<any>(null);
  const [productDetailsModalVisible, setProductDetailsModalVisible] =
    useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [productSelectionModalVisible, setProductSelectionModalVisible] =
    useState(false);
  const [productSelectionRowIndex, setProductSelectionRowIndex] = useState<
    number | null
  >(null);
  const [lastInteractedRowIndex, setLastInteractedRowIndex] =
    useState<number>(0);

  // User info - memoized to prevent re-parsing on every render
  const user = useMemo(
    () => JSON.parse(sessionStorage.getItem('user') || '{}'),
    []
  );
  const branchId = user?.branch_id;

  // Helper function to validate stock quantities
  const validateStockQuantity = (
    stockId: string,
    qty: number,
    looseQty: number
  ): {
    isValid: boolean;
    availablePackQty: number;
    maxLooseQty: number;
    message: string;
  } => {
    const stockList = branchId ? branchStockList : stockAuditList;
    const stock = stockList?.result?.find((s: any) => s._id === stockId);

    if (!stock) {
      return {
        isValid: false,
        availablePackQty: 0,
        maxLooseQty: 0,
        message: 'Stock not found',
      };
    }

    // Get pack size from stock data
    const packSize = stock?.ProductItem?.VariantItem?.pack_size;
    const packSizeNum = packSize ? parseInt(packSize) : 1;

    // Available pack quantity (number of complete packs/boxes)
    const availablePackQty = stock.available_quantity || 0;

    // Available loose quantity (actual loose items in stock, not calculated)
    const availableLooseQty = stock.available_loose_quantity || 0;

    // Validate pack quantity (QTY field)
    if (qty > availablePackQty) {
      return {
        isValid: false,
        availablePackQty,
        maxLooseQty: 0,
        message: `Pack quantity (${qty}) exceeds available packs (${availablePackQty})`,
      };
    }

    // Calculate max loose quantity based on remaining packs after QTY selection
    // Formula: (available_packs - selected_qty) × pack_size + available_loose_qty
    const remainingPacks = availablePackQty - qty;
    const maxLooseFromRemainingPacks = remainingPacks * packSizeNum;
    const maxLooseQty = maxLooseFromRemainingPacks + availableLooseQty;

    // Validate loose quantity (LOOSE QTY field)
    if (looseQty > maxLooseQty) {
      return {
        isValid: false,
        availablePackQty,
        maxLooseQty,
        message: `Loose quantity (${looseQty}) exceeds available loose items (${maxLooseQty} = ${remainingPacks} remaining packs × ${packSizeNum} + ${availableLooseQty} loose)`,
      };
    }

    return {
      isValid: true,
      availablePackQty,
      maxLooseQty,
      message: '',
    };
  };

  // Handle quantity change with validation - memoized to prevent column recreation
  const handleQuantityChange = useCallback(
    (rowIndex: number, field: 'qty' | 'loose_qty', value: number) => {
      const newItems = [...billFormData.items];
      const item = newItems[rowIndex];

      if (!item.stock_id) {
        // If no stock selected, just update the value
        newItems[rowIndex] = { ...item, [field]: value };
        setBillFormData(prev => ({ ...prev, items: newItems }));
        return;
      }

      // Validate the new quantity
      const newQty = field === 'qty' ? value : item.qty || 0;
      const newLooseQty = field === 'loose_qty' ? value : item.loose_qty || 0;

      const validation = validateStockQuantity(
        item.stock_id,
        newQty,
        newLooseQty
      );

      if (!validation.isValid) {
        message.error(validation.message);

        // Auto-correct the quantity if it exceeds available stock
        if (field === 'qty' && newQty > validation.availablePackQty) {
          newItems[rowIndex] = {
            ...item,
            qty: validation.availablePackQty,
          };
        } else if (
          field === 'loose_qty' &&
          newLooseQty > validation.maxLooseQty
        ) {
          newItems[rowIndex] = { ...item, loose_qty: validation.maxLooseQty };
        }
      } else {
        // Update the quantity
        newItems[rowIndex] = { ...item, [field]: value };
      }

      setBillFormData(prev => ({ ...prev, items: newItems }));
    },
    [billFormData.items, validateStockQuantity]
  );

  // Initialize data
  useEffect(() => {
    ProductsApi('GetAll');
    CustomerApi('GetAll');
    BillingUsersApi('GetAll');
    // Only get invoice number for new bills, not when editing existing bills
    if (!billdata) {
      InvoiceNumberApi('GetAll');
    }

    if (billdata) {
      setBillFormData({
        invoice_no: billdata.invoice_no,
        date: dayjs(billdata.date).format('YYYY-MM-DD'),
        customer_id: billdata.customer_id,
        customer_name: billdata.customerDetails?.full_name || '',
        billed_by_id: billdata.billed_by_id || '',
        billed_by_name: billdata.billedByDetails?.name || '',
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

  // Auto-set current user as billed_by for new bills
  useEffect(() => {
    if (
      !billdata &&
      userList?.result &&
      user?._id &&
      !billFormData.billed_by_id
    ) {
      const currentUserInList = userList.result.find(
        (u: any) => u._id === user._id
      );
      if (currentUserInList) {
        setBillFormData(prev => ({
          ...prev,
          billed_by_id: user._id,
          billed_by_name: currentUserInList.name || user.name || '',
        }));
      }
    }
  }, [userList, user._id, billdata, billFormData.billed_by_id]);

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

  const customerOptions = useMemo(() => {
    const options =
      customerList?.result?.map((customer: any) => ({
        label: `${customer.full_name} - ${customer.mobile}`,
        value: customer._id,
      })) || [];
    return options;
  }, [customerList]);

  const userOptions = useMemo(() => {
    const options =
      userList?.result?.map((user: any) => ({
        label: `${user.name} (${user.roleItems?.name || 'No Role'})`,
        value: user._id,
      })) || [];
    return options;
  }, [userList]);

  // Column definitions for bill header - memoized to prevent recreation
  const headerColumns: AntdEditableColumn[] = useMemo(
    () => [
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
          const selectedCustomer = customerOptions.find(
            (opt: any) => opt.value === value
          );
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
                  transition: 'all 0.2s ease',
                }}
                onClick={() => setCustomerModalVisible(true)}
                onMouseEnter={e => {
                  e.currentTarget.style.backgroundColor = '#f0f0f0';
                  e.currentTarget.style.borderColor = '#1890ff';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.backgroundColor = '#fafafa';
                  e.currentTarget.style.borderColor = '#d9d9d9';
                }}
              >
                <span>
                  {selectedCustomer
                    ? selectedCustomer.label
                    : 'Select customer'}
                </span>
                <span
                  style={{
                    fontSize: '10px',
                    color: '#1890ff',
                    backgroundColor: '#f0f8ff',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    border: '1px solid #d6e4ff',
                  }}
                >
                  End
                </span>
              </div>
            </Tooltip>
          );
        },
      },
      {
        key: 'billed_by_id',
        title: '👨‍💼 BILLED BY',
        dataIndex: 'billed_by_id',
        type: 'select',
        options: userOptions,
        required: false,
        width: 250,
        render: (value: any, record: any) => {
          const selectedUser = userOptions.find(
            (opt: any) => opt.value === value
          );
          return (
            <Tooltip title="Click to open user selection modal (or press Ctrl+U key)">
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  border: '1px solid #d9d9d9',
                  backgroundColor: '#f0f8ff',
                  transition: 'all 0.2s ease',
                }}
                onClick={() => setUserModalVisible(true)}
                onMouseEnter={e => {
                  e.currentTarget.style.backgroundColor = '#e6f7ff';
                  e.currentTarget.style.borderColor = '#1890ff';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.backgroundColor = '#f0f8ff';
                  e.currentTarget.style.borderColor = '#d9d9d9';
                }}
              >
                <span>{selectedUser ? selectedUser.label : 'Select user'}</span>
                <span
                  style={{
                    fontSize: '10px',
                    color: '#1890ff',
                    backgroundColor: '#ffffff',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    border: '1px solid #d6e4ff',
                  }}
                >
                  Ctrl+U
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
    ],
    [customerOptions, userOptions]
  );

  const headerData = useMemo(
    () => [
      {
        invoice_no: billFormData.invoice_no,
        date: billFormData.date,
        customer_id: billFormData.customer_id,
        billed_by_id: billFormData.billed_by_id,
        payment_mode: billFormData.payment_mode,
      },
    ],
    [
      billFormData.invoice_no,
      billFormData.date,
      billFormData.customer_id,
      billFormData.billed_by_id,
      billFormData.payment_mode,
    ]
  );

  // Column definitions for bill items - memoized to prevent recreation
  const itemColumns: AntdEditableColumn[] = useMemo(
    () => [
      {
        key: 'product_id',
        title: '🛒 PRODUCT',
        dataIndex: 'product_id',
        type: 'product', // triggers modal
        required: true,
        width: 280,
        render: (value, record, index) => {
          const selectedProduct = productOptions.find(
            (opt: any) => opt.value === value
          );
          return (
            <Tooltip
              title={
                value
                  ? `Product: ${selectedProduct?.label || 'Unknown'} - Click to change • F5 to reopen`
                  : 'Click to select product from inventory • F5 to open'
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
                  justifyContent: 'space-between',
                }}
                onClick={() => {
                  // Open product selection modal
                  if (typeof index === 'number') {
                    setProductSelectionRowIndex(index);
                    setLastInteractedRowIndex(index); // Track this row for F5
                    setProductSelectionModalVisible(true);
                  }
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.backgroundColor = '#f0f0f0';
                  e.currentTarget.style.borderColor = '#1890ff';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.backgroundColor = value
                    ? '#f6ffed'
                    : '#fafafa';
                  e.currentTarget.style.borderColor = value
                    ? '#52c41a'
                    : '#d9d9d9';
                }}
              >
                <span
                  style={{
                    color: value ? '#52c41a' : '#1890ff',
                    fontWeight: value ? 600 : 400,
                  }}
                >
                  {value
                    ? selectedProduct?.label || 'Unknown Product'
                    : 'Select product'}
                </span>
                {value && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <span style={{ fontSize: '12px', color: '#52c41a' }}>
                      ✅
                    </span>
                    <span
                      style={{
                        fontSize: '10px',
                        color: '#52c41a',
                        backgroundColor: '#f6ffed',
                        padding: '2px 4px',
                        borderRadius: '3px',
                      }}
                    >
                      Selected
                    </span>
                  </div>
                )}
                {!value && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      marginTop: '2px',
                    }}
                  >
                    <span style={{ fontSize: '10px', color: '#ff4d4f' }}>
                      ⚠️ Product required
                    </span>
                    <span
                      style={{
                        fontSize: '10px',
                        color: '#1890ff',
                        backgroundColor: '#f0f8ff',
                        padding: '2px 4px',
                        borderRadius: '3px',
                      }}
                    >
                      Click
                    </span>
                  </div>
                )}
              </div>
            </Tooltip>
          );
        },
      },
      {
        key: 'stock_id',
        title: '📦 STOCK',
        dataIndex: 'batch_no',
        type: 'stock',
        required: true,
        width: 280,
        editable: true, // allow editing to open modal
        render: (value, record, index) => {
          // Get stock info for display
          const stockList = branchId ? branchStockList : stockAuditList;
          const stock = stockList?.result?.find(
            (s: any) => s._id === record.stock_id
          );

          // Get pack size from stock data
          const packSize = stock?.ProductItem?.VariantItem?.pack_size;
          const packSizeNum = packSize ? parseInt(packSize) : 1;

          // Calculate available quantities
          const availablePackQty = stock?.available_quantity || 0;
          const availableLooseQty = stock?.available_loose_quantity || 0;

          const isLowStock = availablePackQty > 0 && availablePackQty <= 10;
          const isOutOfStock = availablePackQty === 0;

          return (
            <Tooltip
              title={
                record.product_id
                  ? value
                    ? `Stock: ${value} - Packs Available: ${availablePackQty} • Loose Available: ${availableLooseQty} • Pack Size: ${packSizeNum} • Click to change • F7 to reopen`
                    : 'Click to select stock from available inventory • F7 to open'
                  : 'Please select a product first to choose stock • F7 to open after product selection'
              }
              placement="top"
            >
              <div
                style={{
                  cursor: 'pointer',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  border: value ? '1px solid #52c41a' : '1px solid #d9d9d9',
                  backgroundColor: value ? '#f6ffed' : '#fafafa',
                  transition: 'all 0.2s ease',
                  minHeight: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  gap: '10px',
                }}
                onClick={() => {
                  if (record.product_id && typeof index === 'number') {
                    setStockModalRowIndex(index);
                  } else if (!record.product_id) {
                    message.warning('Please select a product first');
                  }
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.backgroundColor = '#f0f0f0';
                  e.currentTarget.style.borderColor = '#1890ff';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.backgroundColor = value
                    ? '#f6ffed'
                    : '#fafafa';
                  e.currentTarget.style.borderColor = value
                    ? '#52c41a'
                    : '#d9d9d9';
                }}
              >
                {/* Left Section */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    flex: 1,
                  }}
                >
                  <span
                    style={{
                      color: value
                        ? '#52c41a'
                        : record.product_id
                          ? '#1890ff'
                          : '#bfbfbf',
                      fontWeight: value ? 600 : 400,
                      fontSize: '13px',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {value || 'Select Stock'}
                  </span>

                  {/* Stock Badges (inline) */}
                  {stock && (
                    <>
                      <span
                        style={{
                          color: isOutOfStock
                            ? '#ff4d4f'
                            : isLowStock
                              ? '#faad14'
                              : '#52c41a',
                          fontWeight: 'bold',
                          backgroundColor: isOutOfStock
                            ? '#fff2f0'
                            : isLowStock
                              ? '#fffbe6'
                              : '#f6ffed',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          border: `1px solid ${
                            isOutOfStock
                              ? '#ffccc7'
                              : isLowStock
                                ? '#ffe58f'
                                : '#b7eb8f'
                          }`,
                          fontSize: '12px',
                        }}
                      >
                        📦 {availablePackQty}
                      </span>
                      <span
                        style={{
                          color: '#722ed1',
                          fontWeight: 'bold',
                          backgroundColor: '#f9f0ff',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          border: '1px solid #d3adf7',
                          fontSize: '12px',
                        }}
                      >
                        📋 {availableLooseQty}
                      </span>
                    </>
                  )}

                  {/* Warning (inline, not breaking row) */}
                  {record.product_id && !value && (
                    <span
                      style={{
                        fontSize: '11px',
                        color: '#ff4d4f',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      ⚠️ Stock required
                    </span>
                  )}
                </div>

                {/* Right Side "Click" Indicator */}
                {record.product_id && (
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <span style={{ fontSize: '12px', color: '#1890ff' }}>
                      📋
                    </span>
                    <span
                      style={{
                        fontSize: '10px',
                        color: '#52c41a',
                        backgroundColor: '#f6ffed',
                        padding: '2px 4px',
                        borderRadius: '3px',
                      }}
                    >
                      Click
                    </span>
                  </div>
                )}
              </div>
            </Tooltip>
          );
        },
      },
      {
        key: 'qty',
        title: '📊 QTY',
        dataIndex: 'qty',
        type: 'number',
        width: 90,
        render: (value: number, record: any, index?: number) => {
          // Get stock info for validation
          const stockList = branchId ? branchStockList : stockAuditList;
          const stock = stockList?.result?.find(
            (s: any) => s._id === record.stock_id
          );
          const availablePackQty = stock?.available_quantity || 0;
          const isExceedingStock = value > availablePackQty;

          return (
            <div style={{ position: 'relative' }}>
              <InputNumber
                value={value}
                min={0}
                max={availablePackQty}
                style={{
                  width: '100%',
                  borderColor: isExceedingStock ? '#ff4d4f' : undefined,
                  backgroundColor: isExceedingStock ? '#fff2f0' : undefined,
                }}
                onPressEnter={e => {
                  if (index !== undefined) {
                    const target = e.target as HTMLInputElement;
                    const newValue = parseInt(target.value) || 0;
                    handleQuantityChange(index, 'qty', newValue);
                  }
                }}
                onBlur={e => {
                  if (index !== undefined) {
                    const target = e.target as HTMLInputElement;
                    const newValue = parseInt(target.value) || 0;
                    handleQuantityChange(index, 'qty', newValue);
                  }
                }}
                onChange={newValue => {
                  if (newValue !== null && newValue > availablePackQty) {
                    message.error(
                      `Pack quantity cannot exceed available packs (${availablePackQty})`
                    );
                    return;
                  }
                }}
              />
            </div>
          );
        },
      },
      {
        key: 'loose_qty',
        title: '📋 LOOSE',
        dataIndex: 'loose_qty',
        type: 'number',
        width: 90,
        render: (value: number, record: any, index?: number) => {
          // Get stock info for validation
          const stockList = branchId ? branchStockList : stockAuditList;
          const stock = stockList?.result?.find(
            (s: any) => s._id === record.stock_id
          );

          if (!stock) {
            return (
              <div style={{ position: 'relative' }}>
                <InputNumber
                  value={value}
                  min={0}
                  style={{ width: '100%' }}
                  disabled
                />
              </div>
            );
          }

          // Calculate dynamic max loose quantity based on current QTY selection
          const packSize = stock?.ProductItem?.VariantItem?.pack_size;
          const packSizeNum = packSize ? parseInt(packSize) : 1;
          const availablePackQty = stock?.available_quantity || 0;
          const availableLooseQty = stock?.available_loose_quantity || 0;

          // Current QTY selection affects max loose quantity
          const currentQty = record.qty || 0;
          const remainingPacks = availablePackQty - currentQty;
          const maxLooseFromRemainingPacks = remainingPacks * packSizeNum;
          const maxLooseQty = maxLooseFromRemainingPacks + availableLooseQty;

          const isExceedingStock = value > maxLooseQty;

          return (
            <div style={{ position: 'relative' }}>
              <InputNumber
                value={value}
                min={0}
                max={maxLooseQty}
                style={{
                  width: '100%',
                  borderColor: isExceedingStock ? '#ff4d4f' : undefined,
                  backgroundColor: isExceedingStock ? '#fff2f0' : undefined,
                }}
                onPressEnter={e => {
                  if (index !== undefined) {
                    const target = e.target as HTMLInputElement;
                    const newValue = parseInt(target.value) || 0;
                    handleQuantityChange(index, 'loose_qty', newValue);
                  }
                }}
                onBlur={e => {
                  if (index !== undefined) {
                    const target = e.target as HTMLInputElement;
                    const newValue = parseInt(target.value) || 0;
                    handleQuantityChange(index, 'loose_qty', newValue);
                  }
                }}
                onChange={newValue => {
                  if (newValue !== null && newValue > maxLooseQty) {
                    message.error(
                      `Loose quantity cannot exceed available loose items (${maxLooseQty} = ${remainingPacks} remaining packs × ${packSizeNum} + ${availableLooseQty} loose)`
                    );
                    return;
                  }
                }}
              />
            </div>
          );
        },
      },
      {
        key: 'price',
        title: '💰 RATE',
        dataIndex: 'price',
        type: 'number',
        required: true,
        width: 120,
        editable: false, // Make rate not editable
        render: value => (
          <InputNumber value={value} disabled style={{ width: '100%' }} />
        ),
      },
      {
        key: 'amount',
        title: '💵 AMOUNT',
        dataIndex: 'amount',
        type: 'number',
        editable: false, // Make amount not editable
        width: 130,
        render: value => (
          <InputNumber value={value} disabled style={{ width: '100%' }} />
        ),
      },
    ],
    [
      productOptions,
      branchId,
      branchStockList,
      stockAuditList,
      handleQuantityChange,
    ]
  );

  // Find the column index for qty
  const qtyColIndex = itemColumns.findIndex(
    col => col.key === 'qty' || col.dataIndex === 'qty'
  );

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

  // Handle header changes - memoized to prevent unnecessary re-renders
  const handleHeaderChange = useCallback(
    (headerRows: any[]) => {
      const updatedHeader = headerRows[0];
      if (updatedHeader) {
        // Find customer name for display
        const customer = customerList?.result?.find(
          (c: any) => c._id === updatedHeader.customer_id
        );
        // Find user name for display
        const user = userList?.result?.find(
          (u: any) => u._id === updatedHeader.billed_by_id
        );
        setBillFormData(prev => ({
          ...prev,
          invoice_no: updatedHeader.invoice_no || '',
          date: updatedHeader.date || dayjs().format('YYYY-MM-DD'),
          customer_id: updatedHeader.customer_id || '',
          customer_name: customer?.full_name || '',
          billed_by_id: updatedHeader.billed_by_id || '',
          billed_by_name: user?.name || '',
          payment_mode: updatedHeader.payment_mode || 'cash',
        }));
      }
    },
    [customerList, userList]
  );

  // Handle item changes - memoized to prevent unnecessary re-renders
  const handleItemsChange = useCallback(
    (items: any[]) => {
      // Convert back to BillItem format and auto-populate stock
      const billItems: BillItem[] = items.map(item => {
        const billItem: BillItem = {
          product_id: item.product_id || '',
          product_name:
            productOptions.find(
              (opt: { label: string; value: string }) =>
                opt.value === item.product_id
            )?.label || '',
          variant_name: item.variant_name || '',
          stock_id: item.stock_id || '',
          batch_no: item.batch_no || '', // ✅ Preserve batch_no from input
          qty: item.qty || 0,
          loose_qty: item.loose_qty || 0,
          price: item.price || 0,
          mrp: item.mrp || 0,
          amount: item.amount || 0,
          tax_percentage: item.tax_percentage || 0,
        };

        // Stock validation for pack and loose quantities
        if (item.stock_id && (item.qty || item.loose_qty)) {
          const stockList = branchId ? branchStockList : stockAuditList;
          const stock = stockList?.result?.find(
            (s: any) => s._id === item.stock_id
          );

          if (stock) {
            // Get pack size from stock data
            const packSize = stock?.ProductItem?.VariantItem?.pack_size;
            const packSizeNum = packSize ? parseInt(packSize) : 1;

            // Available pack quantity and actual loose quantity
            const availablePackQty = stock.available_quantity || 0;
            const availableLooseQty = stock.available_loose_quantity || 0;

            // Validate pack quantity (QTY field)
            if (item.qty && item.qty > availablePackQty) {
              message.error(
                `Pack quantity (${item.qty}) exceeds available packs (${availablePackQty})`
              );
              billItem.qty = availablePackQty;
            }

            // Calculate max loose quantity based on remaining packs after QTY selection
            const remainingPacks = availablePackQty - (item.qty || 0);
            const maxLooseFromRemainingPacks = remainingPacks * packSizeNum;
            const maxLooseQty = maxLooseFromRemainingPacks + availableLooseQty;

            // Validate loose quantity (LOOSE QTY field)
            if (item.loose_qty && item.loose_qty > maxLooseQty) {
              message.error(
                `Loose quantity (${item.loose_qty}) exceeds available loose items (${maxLooseQty} = ${remainingPacks} remaining packs × ${packSizeNum} + ${availableLooseQty} loose)`
              );
              billItem.loose_qty = maxLooseQty;
            }
          }
        }

        // Auto-populate stock if product is selected but stock is not
        if (item.product_id && !item.stock_id) {
          const stockList = branchId ? branchStockList : stockAuditList;
          const availableStocks =
            stockList?.result?.filter(
              (stock: any) =>
                stock.product === item.product_id ||
                stock.ProductItem?._id === item.product_id
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
          // Get pack size from stock data
          const packSize = stock?.ProductItem?.VariantItem?.pack_size;
          const packSizeNum = packSize ? parseInt(packSize) : 1;

          // Calculate loose item rate: sell_price / pack_size (since sell_price is per pack)
          const looseRate = sellPrice / packSizeNum;

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
    },
    [
      productOptions,
      branchId,
      branchStockList,
      stockAuditList,
      productList,
      billSettings,
    ]
  );

  const handleProductSelect = useCallback(
    (product: any, rowIndex: number) => {
      const newItems = [...billFormData.items];
      // Robustly set product_id from product.id or product._id
      newItems[rowIndex].product_id = product.id || product._id || '';
      newItems[rowIndex].product_name = product.name || '';
      newItems[rowIndex].price = product.selling_price || 0;
      handleItemsChange(newItems);
      setStockModalRowIndex(rowIndex); // Open stock modal for this row
    },
    [handleItemsChange]
  );

  const handleF5ProductSelection = () => {
    // First, check if stock modal is open and close it
    if (stockModalRowIndex !== null) {
      setStockModalRowIndex(null);
      message.info('Stock modal closed. Opening product selection...');

      // Wait a bit for the stock modal to close before opening product modal
      setTimeout(() => {
        openProductModalForRow();
      }, 100);
      return;
    }

    // If stock modal is not open, proceed with normal F5 behavior
    openProductModalForRow();
  };

  const openProductModalForRow = () => {
    let targetRowIndex = -1;

    // Check what element is currently focused
    const activeElement = document.activeElement as HTMLElement;

    // First, check if there's a currently focused row in the table
    const focusedRow = activeElement?.closest('tr');

    if (focusedRow) {
      const rowIndex = focusedRow.getAttribute('data-row-key');

      if (rowIndex !== null) {
        targetRowIndex = parseInt(rowIndex);
      }
    } else {
      // Try alternative method: look for any focused cell in the table
      const focusedCell = activeElement?.closest('td');
      if (focusedCell) {
        const row = focusedCell.closest('tr');
        if (row) {
          const rowIndex = row.getAttribute('data-row-key');
          if (rowIndex !== null) {
            targetRowIndex = parseInt(rowIndex);
          }
        }
      }
    }

    // If no focused row found, try using the externally editing cell row
    if (targetRowIndex === -1 && externalEditingCell) {
      targetRowIndex = externalEditingCell.row;
    }

    // If still no target, try using the last interacted row
    if (targetRowIndex === -1) {
      if (lastInteractedRowIndex < billFormData.items.length) {
        targetRowIndex = lastInteractedRowIndex;
      }
    }

    // If still no target, find the first row without a product
    if (targetRowIndex === -1) {
      targetRowIndex = billFormData.items.findIndex(item => !item.product_id);
    }

    // If still no target row, add a new item and target that
    if (targetRowIndex === -1) {
      handleAddItem();
      targetRowIndex = billFormData.items.length;
    }

    // Set the target row for product selection
    setProductSelectionRowIndex(targetRowIndex);
    setProductSelectionModalVisible(true);

    message.info(`Opening product selection for row ${targetRowIndex + 1}`);
  };

  // Helper function to auto-open product modal (used after bill creation)
  const autoOpenProductModal = useCallback(() => {
    setProductSelectionRowIndex(0); // Target the first row
    setProductSelectionModalVisible(true);
    message.success(
      '🎉 Bill saved! Ready for next bill - Select product to continue.',
      4
    );
  }, []);

  const handleF7StockSelection = () => {
    // Find the first row that has a product but needs stock or the currently focused row
    let targetRowIndex = -1;

    // First, check if there's a currently focused row in the table
    const activeElement = document.activeElement as HTMLElement;
    const focusedRow = activeElement?.closest('tr');
    if (focusedRow) {
      const rowIndex = focusedRow.getAttribute('data-row-key');
      if (rowIndex !== null) {
        const rowIndexNum = parseInt(rowIndex);
        // Check if the focused row has a product
        if (billFormData.items[rowIndexNum]?.product_id) {
          targetRowIndex = rowIndexNum;
        }
      }
    }

    // If no focused row with product found, find the first row with product but without stock
    if (targetRowIndex === -1) {
      targetRowIndex = billFormData.items.findIndex(
        item => item.product_id && !item.stock_id
      );
    }

    // If still no target row, find the first row with product (even if it has stock)
    if (targetRowIndex === -1) {
      targetRowIndex = billFormData.items.findIndex(item => item.product_id);
    }

    // If no row with product found, show message
    if (targetRowIndex === -1) {
      message.warning('Please select a product first before selecting stock');
      return;
    }

    // Set the target row for stock selection
    setStockModalRowIndex(targetRowIndex);

    message.info(`Opening stock selection for row ${targetRowIndex + 1}`);
  };

  const handleProductSelectionModalSelect = (product: any) => {
    if (productSelectionRowIndex === null) return;

    const newItems = [...billFormData.items];
    newItems[productSelectionRowIndex].product_id = product._id || '';
    newItems[productSelectionRowIndex].product_name = product.name || '';
    newItems[productSelectionRowIndex].variant_name =
      product.VariantItem?.variant_name || '';
    newItems[productSelectionRowIndex].price = product.selling_price || 0;

    handleItemsChange(newItems);

    // Close the product selection modal
    setProductSelectionModalVisible(false);
    setProductSelectionRowIndex(null);

    // Open stock selection modal for this row
    setStockModalRowIndex(productSelectionRowIndex);

    message.success(`Product "${product.name}" selected successfully!`);
  };

  const handleStockSelect = (stock: any) => {
    if (stockModalRowIndex === null) return;
    const newItems = [...billFormData.items];
    newItems[stockModalRowIndex].stock_id =
      stock.id || stock._id || stock.invoice_id || '';
    newItems[stockModalRowIndex].batch_no = stock.batch_no || '';
    handleItemsChange(newItems);
    setStockModalRowIndex(null); // Close stock modal

    // Set external editing cell to qty cell in the same row
    if (qtyColIndex !== -1) {
      setExternalEditingCell({ row: stockModalRowIndex, col: qtyColIndex });
    }
  };

  // Handle customer selection from modal
  const handleCustomerSelect = useCallback(
    (customer: any) => {
      // Prevent duplicate calls
      if (billFormData.customer_id === customer._id) {
        return;
      }

      setBillFormData(prev => ({
        ...prev,
        customer_id: customer._id,
        customer_name: customer.full_name,
      }));

      // Ensure modal closes
      setTimeout(() => {
        setCustomerModalVisible(false);
        // Auto-open user selection modal after customer is selected
        setTimeout(() => {
          setUserModalVisible(true);
        }, 100);
      }, 50);

      message.success(
        `Customer "${customer.full_name}" selected successfully!`
      );
    },
    [billFormData.customer_id]
  );

  // Handle user selection from modal
  const handleUserSelect = useCallback(
    (user: any) => {
      // Prevent duplicate calls
      if (billFormData.billed_by_id === user._id) {
        return;
      }

      setBillFormData(prev => ({
        ...prev,
        billed_by_id: user._id,
        billed_by_name: user.name,
      }));

      // Ensure modal closes
      setTimeout(() => {
        setUserModalVisible(false);
      }, 50);

      message.success(
        `User "${user.name}" selected as billed by successfully!`
      );
    },
    [billFormData.billed_by_id]
  );

  // Handle new bill creation
  const handleNewBill = () => {
    resetBill(false); // Don't show resetBill message
    setSaveConfirmationVisible(false);
    setSavedBillData(null);
    message.success('New bill form cleared successfully!');
  };

  // Reset bill function - comprehensive reset for after successful save
  const resetBill = useCallback((showMessage = true) => {
    // Clear all form data for new bill
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

    // Reset bill settings to defaults
    setBillSettings({
      isPaid: true,
      isPartiallyPaid: false,
      isRetail: true,
      isGstIncluded: true,
      discount: 0,
      discountType: 'percentage',
      paidAmount: 0,
    });

    // Reset all modal states
    setStockModalRowIndex(null);
    setExternalEditingCell(null);
    setCustomerModalVisible(false);
    setSaveConfirmationVisible(false);
    setBillListDrawerVisible(false);
    setSavedBillData(null);
    setProductDetailsModalVisible(false);
    setSelectedProductId('');
    setProductSelectionModalVisible(false);
    setProductSelectionRowIndex(null);
    InvoiceNumberApi('GetAll');
    // Only show message if explicitly requested (not during auto-reset after bill creation)
    if (showMessage) {
      message.success('Ready for next bill!', 2);
    }
  }, []);

  // Handle continue with current bill
  const handleContinueBill = () => {
    setSaveConfirmationVisible(false);
    setSavedBillData(null);
  };

  // Handle clear bill form
  const handleClearBill = () => {
    resetBill(false); // Don't show resetBill message
    message.success('Bill form cleared successfully!');
  };

  // Handle view bill from drawer
  const handleViewBill = (bill: any) => {
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
      ProductsApi('GetAll');
    }

    if (!customerList?.result) {
      CustomerApi('GetAll');
    }

    const currentStockList = branchId ? branchStockList : stockAuditList;
    if (!currentStockList?.result) {
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
    } else if (bill.items && Array.isArray(bill.items)) {
      items = bill.items;
    } else if (bill.sales_items && Array.isArray(bill.sales_items)) {
      items = bill.sales_items;
    } else if (
      bill.result &&
      bill.result.Items &&
      Array.isArray(bill.result.Items)
    ) {
      items = bill.result.Items;
    } else if (
      bill.result &&
      bill.result.items &&
      Array.isArray(bill.result.items)
    ) {
      items = bill.result.items;
    }

    // Map items with proper fallbacks and enhanced product name resolution
    const mappedItems = items.map((item: any, index: number) => {
      // Try to get the best product name from various sources
      let productName = '';
      let variantName = '';

      if (item.productItems?.name) {
        productName = item.productItems.name;
        variantName = item.productItems.VariantItem?.variant_name || '';
      } else if (item.product_name) {
        productName = item.product_name;
        variantName = item.variant_name || '';
      } else if (item.product?.name) {
        productName = item.product.name;
        variantName = item.product.VariantItem?.variant_name || '';
      } else if (item.product_id) {
        // Try to find product name from productList if available
        const product = productList?.result?.find(
          (p: any) => p._id === item.product_id
        );
        if (product) {
          productName = product.name;
          variantName = product.VariantItem?.variant_name || '';
        } else {
          // If product list is not loaded yet, try to load it and mark for later update
          if (!productList?.result) {
            ProductsApi('GetAll');
          }
          // Use a more descriptive placeholder that will be updated later
          productName = `Loading... (ID: ${item.product_id})`;

          // Try to force load and resolve immediately
          setTimeout(() => {
            if (productList?.result) {
              const foundProduct = productList.result.find(
                (p: any) => p._id === item.product_id
              );
              if (foundProduct) {
                // Update the item directly
                const updatedItems = [...billFormData.items];
                const itemIndex = updatedItems.findIndex(
                  i => i.product_id === item.product_id
                );
                if (itemIndex !== -1) {
                  updatedItems[itemIndex].product_name = foundProduct.name;
                  updatedItems[itemIndex].variant_name =
                    foundProduct.VariantItem?.variant_name || '';
                  setBillFormData(prev => ({ ...prev, items: updatedItems }));
                }
              }
            }
          }, 100);
        }
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

          // Try to force load and resolve immediately
          setTimeout(() => {
            const currentStockList = branchId
              ? branchStockList
              : stockAuditList;
            if (currentStockList?.result) {
              const foundStock = currentStockList.result.find(
                (s: any) => s._id === stockId
              );
              if (foundStock) {
                // Update the item directly
                const updatedItems = [...billFormData.items];
                const itemIndex = updatedItems.findIndex(
                  i => i.stock_id === stockId
                );
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

      return mappedItem;
    });

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
      const customer = customerList?.result?.find(
        (c: any) => c._id === bill.customer_id
      );
      customerName = customer?.full_name || `Customer ID: ${bill.customer_id}`;
    }

    // Handle date with fallback
    let formattedDate = dayjs().format('YYYY-MM-DD'); // Default to today
    if (bill.date) {
      try {
        formattedDate = dayjs(bill.date).format('YYYY-MM-DD');
      } catch (error) {
        formattedDate = dayjs().format('YYYY-MM-DD');
      }
    }

    // Immediately resolve any available product names and stock info if data is already loaded
    let finalMappedItems = [...mappedItems];

    // If product list is already loaded, resolve product names immediately
    if (productList?.result) {
      finalMappedItems = finalMappedItems.map(item => {
        if (
          item.product_id &&
          (item.product_name.includes('Loading...') ||
            item.product_name.includes('Product ID:'))
        ) {
          const product = productList.result.find(
            (p: any) => p._id === item.product_id
          );
          if (product) {
            return {
              ...item,
              product_name: product.name,
              variant_name: product.VariantItem?.variant_name || '',
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
        if (
          item.stock_id &&
          (item.batch_no.includes('Loading...') || !item.batch_no)
        ) {
          const stock = stockList.result.find(
            (s: any) => s._id === item.stock_id
          );
          if (stock) {
            return {
              ...item,
              batch_no: stock.batch_no || '',
            };
          }
        }
        return item;
      });
    }

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
        const product = productList.result.find(
          (p: any) => p._id === item.product_id
        );
        if (
          product &&
          (item.product_name.includes('Loading...') ||
            item.product_name.includes('Product ID:') ||
            !item.product_name)
        ) {
          item.product_name = product.name;
          item.variant_name = product.VariantItem?.variant_name || '';
          updated = true;
        }
      }

      // Resolve stock batch numbers
      if (item.stock_id) {
        const stockList = branchId ? branchStockList : stockAuditList;
        if (stockList?.result) {
          const stock = stockList.result.find(
            (s: any) => s._id === item.stock_id
          );
          if (
            stock &&
            (item.batch_no?.includes('Loading...') || !item.batch_no)
          ) {
            item.batch_no = stock.batch_no || '';
            updated = true;
          }
        }
      }

      if (updated) hasChanges = true;
      return item;
    });

    if (hasChanges) {
      setBillFormData(prev => ({
        ...prev,
        items: updatedItems,
      }));
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
      const newItems = prev.items.filter(
        (_, index: any) => !indices.includes(index?.toString())
      );
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

    // Validate that entered quantities don't exceed available stock
    const stockValidationErrors: string[] = [];
    billFormData.items.forEach((item, index) => {
      if (item.stock_id && (item.qty || item.loose_qty)) {
        const validation = validateStockQuantity(
          item.stock_id,
          item.qty || 0,
          item.loose_qty || 0
        );

        if (!validation.isValid) {
          stockValidationErrors.push(`Row ${index + 1}: ${validation.message}`);
        }
      }
    });

    if (stockValidationErrors.length > 0) {
      message.error(
        `Stock validation errors:\n${stockValidationErrors.join('\n')}`
      );
      return;
    }
    if (!billFormData.customer_id) {
      message.error('Please select a customer');
      return;
    }
    if (!billFormData.payment_mode) {
      message.error('Please select a payment mode');
      return;
    }

    const payload = {
      invoice_no: billFormData.invoice_no,
      date: billFormData.date,
      customer_id: billFormData.customer_id,
      billed_by_id: billFormData.billed_by_id,
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

      // Show confirmation modal after successful save (only for updates, not new bills)
      if (response?.statusCode === 200) {
        const savedData = {
          ...payload,
          customer_name: billFormData.customer_name,
          total_amount: billCalculations.total_amount,
          invoice_no: payload.invoice_no,
          date: payload.date,
        };
        setSavedBillData(savedData);

        // Only show confirmation modal for bill updates, not new bills (they auto-reset)
        if (billdata) {
          setSaveConfirmationVisible(true);
        }
      }
    } catch (error) {
      // Handle error silently or show user-friendly message
      message.error('Failed to save bill. Please try again.');
    }
  };

  // Handle API responses
  const { items: createItems } = useDynamicSelector(
    SalesRecord.getIdentifier('Create')
  );
  const { items: updateItems } = useDynamicSelector(
    SalesRecord.getIdentifier('Update')
  );

  // Note: Removed useHandleApiResponse for 'create' to avoid duplicate success messages
  // Bill creation success is handled manually in useEffect below

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

      // Auto-reset the bill after successful creation (only for new bills, not updates)
      if (!billdata) {
        // Close confirmation modal first, then reset immediately
        setSaveConfirmationVisible(false);
        setTimeout(() => {
          resetBill(false); // Don't show "Ready for next bill!" message

          // Auto-open product selection modal for the first row after reset
          setTimeout(() => {
            autoOpenProductModal();
          }, 200); // Wait for reset to complete
        }, 100); // Minimal delay just to close modal smoothly
      }
    }
  }, [createItems, billdata, resetBill, onSuccess, autoOpenProductModal]);

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
      const needsUpdate = billFormData.items.some(
        item =>
          item.product_id &&
          (!item.product_name ||
            item.product_name.includes('Loading...') ||
            item.product_name.includes('Product ID:'))
      );

      if (needsUpdate) {
        const updatedItems = billFormData.items.map(item => {
          if (
            item.product_id &&
            (!item.product_name ||
              item.product_name.includes('Loading...') ||
              item.product_name.includes('Product ID:'))
          ) {
            const product = productList.result.find(
              (p: any) => p._id === item.product_id
            );
            if (product) {
              return {
                ...item,
                product_name: product.name,
                variant_name: product.VariantItem?.variant_name || '',
              };
            }
          }
          return item;
        });

        // Only update if we actually made changes
        const hasChanges = updatedItems.some(
          (item, index) =>
            item.product_name !== billFormData.items[index].product_name
        );

        if (hasChanges) {
          setBillFormData(prev => ({
            ...prev,
            items: updatedItems,
          }));
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
      const needsUpdate = billFormData.items.some(
        item =>
          item.stock_id &&
          (!item.batch_no || item.batch_no.includes('Loading...'))
      );

      if (needsUpdate) {
        const updatedItems = billFormData.items.map(item => {
          if (
            item.stock_id &&
            (!item.batch_no || item.batch_no.includes('Loading...'))
          ) {
            const stock = stockList.result.find(
              (s: any) => s._id === item.stock_id
            );
            if (stock) {
              return {
                ...item,
                batch_no: stock.batch_no || '',
              };
            }
          }
          return item;
        });

        // Only update if we actually made changes
        const hasChanges = updatedItems.some(
          (item, index) => item.batch_no !== billFormData.items[index].batch_no
        );

        if (hasChanges) {
          setBillFormData(prev => ({
            ...prev,
            items: updatedItems,
          }));
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
        const hasUnresolvedItems = billFormData.items.some(
          item =>
            (item.product_id &&
              (!item.product_name ||
                item.product_name.includes('Loading...') ||
                item.product_name.includes('Product ID:'))) ||
            (item.stock_id &&
              (!item.batch_no || item.batch_no.includes('Loading...')))
        );

        if (
          hasUnresolvedItems &&
          (productList?.result ||
            (branchId ? branchStockList?.result : stockAuditList?.result))
        ) {
          forceResolveProductNamesAndStock();
        }
      }, 1000); // Check every second

      return () => clearInterval(interval);
    }
  }, [
    billFormData.items,
    productList,
    branchStockList,
    stockAuditList,
    branchId,
  ]);

  // Ultra-Fast Billing Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // F1: Add item and focus first product field
      if (e.key === 'F1') {
        e.preventDefault();
        handleAddItem();
        setTimeout(() => {
          const productCell = document.querySelector(
            '.ant-table-tbody tr:last-child td[data-column-key="product_id"]'
          ) as HTMLElement;
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
      // F5: Open product selection modal for current row or first empty row
      else if (e.key === 'F5') {
        e.preventDefault();
        handleF5ProductSelection();
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
      // F7: Open stock selection modal for current row or first row with product
      else if (e.key === 'F7') {
        e.preventDefault();
        handleF7StockSelection();
      }

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
              const productCell = document.querySelector(
                '.ant-table-tbody tr:last-child td[data-column-key="product_id"]'
              ) as HTMLElement;
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
            // Reset form completely
            resetBill(); // Show message for manual reset via keyboard
            break;
          case 'u':
            e.preventDefault();
            setUserModalVisible(true);
            break;
        }
      }
      // Quick quantity entry (Ctrl + 0-9)
      else if (e.ctrlKey && /^[0-9]$/.test(e.key)) {
        e.preventDefault();
        const activeElement = document.activeElement as HTMLElement;
        if (activeElement?.closest('td[data-column-key="qty"]')) {
          const input = activeElement.querySelector(
            'input'
          ) as HTMLInputElement;
          if (input) {
            input.value = e.key;
            input.dispatchEvent(new Event('change', { bubbles: true }));
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [
    billFormData,
    billSettings,
    handleF5ProductSelection,
    handleF7StockSelection,
    stockModalRowIndex,
  ]);

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
                ⚡Lightning Fast • {dayjs().format('DD MMM YYYY, dddd')}
              </Text>
            </div>
          </div>

          {/* Controls Section */}
          <div className={styles.controlsSection}>
            <div className={`${styles.controlGroup} ${styles.saleTypeControl}`}>
              <Text className={styles.controlLabel}>🏪 SALE TYPE</Text>
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
              <Text className={styles.controlLabel}>📊 GST</Text>
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
              <Text className={styles.controlLabel}>💳 PAYMENT</Text>
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
              <div
                className={`${styles.controlGroup} ${styles.partialPaymentControl}`}
              >
                <Text className={styles.controlLabel}>💰 PARTIAL</Text>
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
            <Text className={styles.billItemsTitle}>🛒 BILL ITEMS</Text>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Badge
                count={billFormData.items.length}
                showZero
                size="small"
                style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
              >
                <Text className={styles.billItemsBadge}>Items</Text>
              </Badge>
              <Text
                style={{
                  fontSize: '10px',
                  color: '#666',
                  backgroundColor: '#f0f0f0',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  border: '1px solid #d9d9d9',
                }}
              ></Text>
            </div>
          </div>

          {/* Stock Validation Summary */}
          {/* {(() => {
            const stockValidationSummary = billFormData.items
              .filter(item => item.stock_id && (item.qty || item.loose_qty))
              .map(item => {
                const stockList = branchId ? branchStockList : stockAuditList;
                const stock = stockList?.result?.find((s: any) => s._id === item.stock_id);
                const availableQty = stock?.available_quantity || 0;
                const totalEnteredQty = (item.qty || 0) + (item.loose_qty || 0);
                const isValid = totalEnteredQty <= availableQty;
                const remainingQty = Math.max(0, availableQty - totalEnteredQty);
                
                return {
                  productName: item.product_name || 'Unknown Product',
                  batchNo: item.batch_no || 'No Batch',
                  availableQty,
                  enteredQty: totalEnteredQty,
                  remainingQty,
                  isValid,
                  isLowStock: remainingQty > 0 && remainingQty <= 5
                };
              });

            const hasValidationIssues = stockValidationSummary.some(item => !item.isValid);
            const hasLowStock = stockValidationSummary.some(item => item.isLowStock);

            if (stockValidationSummary.length === 0) return null;

            return (
              <div style={{
                marginBottom: '16px',
                padding: '12px',
                borderRadius: '8px',
                backgroundColor: hasValidationIssues ? '#fff2f0' : hasLowStock ? '#fffbe6' : '#f6ffed',
                border: `1px solid ${hasValidationIssues ? '#ffccc7' : hasLowStock ? '#ffe58f' : '#b7eb8f'}`,
                fontSize: '12px'
              }}>
                <div style={{ 
                  fontWeight: 'bold', 
                  marginBottom: '8px',
                  color: hasValidationIssues ? '#cf1322' : hasLowStock ? '#d48806' : '#389e0d'
                }}>
                  📊 Stock Validation Summary
                </div>
                {stockValidationSummary.map((item, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '4px 0',
                    borderBottom: index < stockValidationSummary.length - 1 ? '1px solid #f0f0f0' : 'none'
                  }}>
                    <span style={{ fontWeight: '500' }}>
                      {item.productName} ({item.batchNo})
                    </span>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                      <span>Available: {item.availableQty}</span>
                      <span>Entered: {item.enteredQty}</span>
                      <span>Remaining: {item.remainingQty}</span>
                      <span style={{
                        color: item.isValid ? '#52c41a' : '#ff4d4f',
                        fontWeight: 'bold'
                      }}>
                        {item.isValid ? '✅ Valid' : '❌ Exceeds Stock'}
                      </span>
                      {item.isLowStock && (
                        <span style={{ color: '#faad14', fontWeight: 'bold' }}>
                          ⚠️ Low Stock
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            );
          })()} */}

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
            <Text className={styles.summaryTitle}>💰 BILL SUMMARY</Text>
          </div>

          {/* Summary Table */}
          <div className={styles.summaryTable}>
            <div className={styles.summaryRow}>
              <Text className={styles.summaryLabel}>Sub Total:</Text>
              <Text className={styles.summaryValue}>
                ₹{billCalculations.sub_total.toFixed(2)}
              </Text>
            </div>

            <div className={styles.summaryRow}>
              <Text className={styles.summaryLabel}>Value of Goods:</Text>
              <Text className={styles.summaryValue}>
                ₹{billCalculations.value_of_goods.toFixed(2)}
              </Text>
            </div>

            <div className={styles.summaryRow}>
              <Text className={styles.summaryLabel}>Total GST:</Text>
              <Text className={styles.summaryValue}>
                ₹{billCalculations.total_gst.toFixed(2)}
              </Text>
            </div>

            <div className={styles.summaryRow}>
              <Text className={styles.summaryLabel}>CGST:</Text>
              <Text className={styles.summaryValue}>
                ₹{billCalculations.cgst.toFixed(2)}
              </Text>
            </div>

            <div className={styles.summaryRow}>
              <Text className={styles.summaryLabel}>SGST:</Text>
              <Text className={styles.summaryValue}>
                ₹{billCalculations.sgst.toFixed(2)}
              </Text>
            </div>

            {billSettings.discount > 0 && (
              <div className={styles.summaryRow}>
                <Text className={styles.summaryLabel}>DISCOUNT:</Text>
                <Text className={styles.discountValue}>
                  -₹
                  {billSettings.discountType === 'percentage'
                    ? (
                        ((billCalculations.sub_total +
                          billCalculations.total_gst) *
                          (typeof billSettings.discount === 'number'
                            ? billSettings.discount
                            : 0)) /
                        100
                      ).toFixed(2)
                    : (typeof billSettings.discount === 'number'
                        ? billSettings.discount
                        : 0
                      ).toFixed(2)}
                </Text>
              </div>
            )}

            <div className={styles.totalAmountRow}>
              <Text className={styles.totalAmountLabel}>NET/EXC/REPL:</Text>
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
                    ₹
                    {(typeof billSettings.paidAmount === 'number'
                      ? billSettings.paidAmount
                      : 0
                    ).toFixed(2)}
                  </Text>
                </div>
                <div className={styles.partialPaymentRow}>
                  <Text className={styles.partialPaymentLabel}>Balance:</Text>
                  <Text className={styles.partialPaymentValue}>
                    ₹
                    {(
                      billCalculations.total_amount -
                      (typeof billSettings.paidAmount === 'number'
                        ? billSettings.paidAmount
                        : 0)
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
              <Text className={styles.discountControlLabel}>💸 DISCOUNT</Text>
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
            🧹 CLEAR (F4 / Ctrl+R)
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
              (Add) • F4/Ctrl+R (Clear) • Tab/Shift+Tab (Navigate) • Enter
              (Edit) • Esc (Cancel) • End (Customer) • Ctrl+U (User) • F5
              (Product) • F6 (Bill List) • F7 (Stock)
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

      {/* User Selection Modal */}
      <UserSelectionModal
        visible={userModalVisible}
        onSelect={handleUserSelect}
        onCancel={() => setUserModalVisible(false)}
      />

      {/* Bill Save Confirmation Modal */}
      <BillSaveConfirmationModal
        visible={saveConfirmationVisible}
        onNewBill={handleNewBill}
        onContinueBill={handleContinueBill}
        onCancel={() => setSaveConfirmationVisible(false)}
        savedBillData={savedBillData}
      />

      {/* Product Details Modal */}
      <ProductDetailsModal
        visible={productDetailsModalVisible}
        onCancel={() => setProductDetailsModalVisible(false)}
        productId={selectedProductId}
      />

      {/* Product Selection Modal */}
      <ProductSelectionModal
        visible={productSelectionModalVisible}
        onSelect={handleProductSelectionModalSelect}
        onCancel={() => {
          setProductSelectionModalVisible(false);
          setProductSelectionRowIndex(null);
        }}
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
