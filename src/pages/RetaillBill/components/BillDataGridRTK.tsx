import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { getCurrentUser } from '../../../helpers/auth';
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
import { calculateBillTotals } from '../../../helpers/amount_calculations';
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
import {
  useGetProductsQuery,
  useGetCustomersQuery,
  useGetBillingUsersQuery,
  useGetBranchStockQuery,
  useCreateSaleMutation,
} from '../../../services/redux/api/apiSlice';

const { Title, Text } = Typography;

interface BillDataGridProps {
  billdata?: any;
  onSuccess?: (formattedBill?: any) => void;
}

const BillDataGridRTK: React.FC<BillDataGridProps> = ({ billdata, onSuccess }) => {
  const currentUser = useMemo(() => getCurrentUser(), []);

  // RTK Query hooks
  const { data: productsData, isLoading: productsLoading } = useGetProductsQuery({ pageLimit: 1000 });
  const { data: customersData, isLoading: customersLoading } = useGetCustomersQuery({ pageLimit: 1000 });
  const { data: usersData, isLoading: usersLoading } = useGetBillingUsersQuery({ pageLimit: 1000 });
  const { data: branchStockData, isLoading: branchStockLoading } = useGetBranchStockQuery({ pageLimit: 1000 });
  const [createSale, { isLoading: saleCreateLoading }] = useCreateSaleMutation();

  const productList = (productsData as any)?.result || [];
  const customerList = (customersData as any)?.result || [];
  const userList = (usersData as any)?.result || [];
  const branchStockList = (branchStockData as any)?.result || [];

  // State
  const [billFormData, setBillFormData] = useState<BillFormData>({
    invoice_no: 'AUTO-GENERATED',
    date: dayjs().format('YYYY-MM-DD'),
    customer_id: '',
    customer_name: '',
    billed_by_id: currentUser?._id || '',
    billed_by_name: currentUser?.name || currentUser?.username || '',
    payment_mode: 'Cash',
    items: [],
  });

  const [saveConfirmationVisible, setSaveConfirmationVisible] = useState(false);
  const [billListDrawerVisible, setBillListDrawerVisible] = useState(false);
  const [productDetailsModalVisible, setProductDetailsModalVisible] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [customerModalVisible, setCustomerModalVisible] = useState(false);
  const [userModalVisible, setUserModalVisible] = useState(false);
  const [externalEditingCell, setExternalEditingCell] = useState<{ row: number; col: number } | null>(null);

  useEffect(() => {
    if (billdata) {
      setBillFormData(billdata);
    }
  }, [billdata]);

  const handleBillDataChange = useCallback((data: Partial<BillFormData>) => {
    setBillFormData(prev => ({ ...prev, ...data }));
  }, []);

  const handleAddItem = useCallback(() => {
    const newItem: BillItem = {
      key: Date.now().toString(),
      product_id: '',
      product_name: '',
      variant_name: '',
      stock_id: '',
      qty: 1,
      loose_qty: 0,
      price: 0,
      mrp: 0,
      amount: 0,
      tax_percentage: 0,
      quantity: 1,
      rate: 0,
    };
    
    setBillFormData(prev => ({
      ...prev,
      items: [...prev.items, newItem],
    }));
    
    setExternalEditingCell({ row: billFormData.items.length, col: 0 });
  }, [billFormData.items.length]);

  const handleEditItem = useCallback((index: number) => {
    setExternalEditingCell({ row: index, col: 0 });
  }, []);

  const handleItemChange = useCallback((index: number, field: keyof BillItem, value: any) => {
    setBillFormData(prev => {
      const newItems = [...prev.items];
      newItems[index] = { ...newItems[index], [field]: value };
      return { ...prev, items: newItems };
    });
  }, []);

  const handleDeleteItem = useCallback((index: number) => {
    setBillFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  }, []);

  const handleClearBill = useCallback(() => {
    setBillFormData({
      invoice_no: 'AUTO-GENERATED',
      date: dayjs().format('YYYY-MM-DD'),
      customer_id: '',
      customer_name: '',
      billed_by_id: currentUser?._id || '',
      billed_by_name: currentUser?.name || currentUser?.username || '',
      payment_mode: 'Cash',
      items: [],
    });
    message.info('Bill cleared!');
  }, [currentUser]);

  const handleSaveBill = useCallback(async () => {
    if (billFormData.items.length === 0) {
      message.error('Please add at least one item to the bill');
      return;
    }

    try {
      const saleData = {
        ...billFormData,
        items: billFormData.items.map(item => ({
          ...item,
          amount: (item.qty || 0) * (item.price || 0),
        })),
        created_at: new Date().toISOString(),
      };

      const result = await createSale(saleData).unwrap();

      if ((result as any).statusCode === 200) {
        message.success('Bill saved successfully!');
        onSuccess?.((result as any).data || (result as any).result);
        handleClearBill();
      } else {
        message.error((result as any).message || 'Failed to save bill');
      }
    } catch (err: any) {
      message.error(err.data?.message || err.message || 'Network error');
    }
  }, [billFormData, createSale, onSuccess, handleClearBill]);

  const handlePrintBill = useCallback(() => {
    message.info('Print functionality coming soon!');
  }, []);

  const handleViewBills = useCallback(() => {
    setBillListDrawerVisible(true);
  }, []);

  const handleSelectCustomer = useCallback((customer: any) => {
    handleBillDataChange({
      customer_id: customer._id,
      customer_name: customer.full_name,
    });
    setCustomerModalVisible(false);
  }, [handleBillDataChange]);

  const handleSelectUser = useCallback((user: any) => {
    handleBillDataChange({
      billed_by_id: user._id,
      billed_by_name: user.name,
    });
    setUserModalVisible(false);
  }, [handleBillDataChange]);

  const isLoading = productsLoading || customersLoading || usersLoading || branchStockLoading;

  // Calculate bill totals
  const billTotals = useMemo(() => {
    return calculateBillTotals({
      items: billFormData.items,
      productList: [],
      isGstIncluded: true,
      discount: 0,
      discountType: 'percentage',
    });
  }, [billFormData.items]);

  // Table columns
  const columns: AntdEditableColumn[] = useMemo(() => [
    {
      title: 'Product',
      dataIndex: 'product_id',
      key: 'product_id',
      width: 250,
      editable: true,
      inputType: 'select',
      options: productList.map((p: any) => ({ value: p._id, label: p.name })),
      onCellChange: (value: any, record: any, index: any) => {
        const selectedProduct = productList.find((p: any) => p._id === value);
        if (selectedProduct) {
          handleItemChange(index, 'product_id', selectedProduct._id);
          handleItemChange(index, 'product_name', selectedProduct.name);
          handleItemChange(index, 'price', selectedProduct.price);
          handleItemChange(index, 'mrp', selectedProduct.mrp);
          handleItemChange(index, 'tax_percentage', selectedProduct.CategoryItem?.tax_percentage || 0);
          handleItemChange(index, 'stock_id', '');
          handleItemChange(index, 'batch_no', '');
        }
      },
      render: (value, record) => record.product_name || 'Select Product',
    },
    {
      title: 'Batch No / Stock',
      dataIndex: 'stock_id',
      key: 'stock_id',
      width: 200,
      editable: true,
      inputType: 'select',
      options: (record: BillItem) => {
        const productStocks = branchStockList.filter((bs: any) => bs.product_id === record.product_id);
        return productStocks.map((bs: any) => ({
          value: bs._id,
          label: `${bs.batch_no || 'N/A'} (Qty: ${bs.available_quantity}, Loose: ${bs.available_loose_quantity})`
        }));
      },
      onCellChange: (value: any, record: any, index: any) => {
        const selectedStock = branchStockList.find((bs: any) => bs._id === value);
        if (selectedStock) {
          handleItemChange(index, 'stock_id', selectedStock._id);
          handleItemChange(index, 'batch_no', selectedStock.batch_no);
        }
      },
      render: (value, record) => {
        const selectedStock = branchStockList.find((bs: any) => bs._id === value);
        return selectedStock ? `${selectedStock.batch_no || 'N/A'} (Qty: ${selectedStock.available_quantity})` : 'Select Stock';
      },
    },
    {
      title: 'Qty',
      dataIndex: 'qty',
      key: 'qty',
      width: 100,
      editable: true,
      inputType: 'number',
      onCellChange: (value: any, record: any, index: any) => handleItemChange(index, 'qty', value),
      render: (value) => value,
    },
    {
      title: 'Loose Qty',
      dataIndex: 'loose_qty',
      key: 'loose_qty',
      width: 120,
      editable: true,
      inputType: 'number',
      onCellChange: (value: any, record: any, index: any) => handleItemChange(index, 'loose_qty', value),
      render: (value) => value,
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      width: 120,
      editable: true,
      inputType: 'number',
      onCellChange: (value: any, record: any, index: any) => handleItemChange(index, 'price', value),
      render: (value) => `₹${value.toFixed(2)}`,
    },
    {
      title: 'MRP',
      dataIndex: 'mrp',
      key: 'mrp',
      width: 120,
      editable: true,
      inputType: 'number',
      onCellChange: (value: any, record: any, index: any) => handleItemChange(index, 'mrp', value),
      render: (value) => `₹${value.toFixed(2)}`,
    },
    {
      title: 'Tax %',
      dataIndex: 'tax_percentage',
      key: 'tax_percentage',
      width: 100,
      editable: true,
      inputType: 'number',
      onCellChange: (value: any, record: any, index: any) => handleItemChange(index, 'tax_percentage', value),
      render: (value) => `${value}%`,
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      width: 150,
      render: (value, record) => {
        const amount = (record.qty || 0) * (record.price || 0);
        return `₹${amount.toFixed(2)}`;
      },
    },
    {
      title: 'Actions',
      dataIndex: 'actions',
      key: 'actions',
      width: 100,
      render: (_, record, index) => (
        <div>
          <Button
            type="text"
            onClick={() => handleEditItem(index || 0)}
            size="small"
          >
            Edit
          </Button>
          <Button
            type="text"
            danger
            onClick={() => handleDeleteItem(index || 0)}
            size="small"
          >
            Delete
          </Button>
        </div>
      ),
    },
  ], [productList, branchStockList, handleItemChange, handleEditItem, handleDeleteItem]);

  return (
    <div className={styles.billDataGrid}>
      <div className={styles.billHeader}>
        <Title level={3}>New Retail Bill</Title>
        
        {/* Bill Details */}
        <div className={styles.billDetails}>
          <div>
            <Text strong>Invoice No:</Text>
            <InputNumber
              value={billFormData.invoice_no}
              readOnly
              style={{ marginTop: 4, width: '100%' }}
            />
          </div>
          <div>
            <Text strong>Date:</Text>
            <InputNumber
              value={billFormData.date}
              readOnly
              style={{ marginTop: 4, width: '100%' }}
            />
          </div>
          <div>
            <Text strong>Customer:</Text>
            <Button
              onClick={() => setCustomerModalVisible(true)}
              style={{ marginTop: 4, width: '100%' }}
            >
              {billFormData.customer_name || 'Select Customer'}
            </Button>
          </div>
          <div>
            <Text strong>Billed By:</Text>
            <Button
              onClick={() => setUserModalVisible(true)}
              style={{ marginTop: 4, width: '100%' }}
            >
              {billFormData.billed_by_name || 'Select User'}
            </Button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className={styles.actionButtons}>
          <Button icon={<ClearOutlined />} onClick={handleClearBill}>
            Clear Bill
          </Button>
          <Button icon={<FileTextOutlined />} onClick={handleViewBills}>
            View Bills
          </Button>
          <Button icon={<PrinterOutlined />} onClick={handlePrintBill}>
            Print Bill
          </Button>
          <Button 
            type="primary" 
            icon={<SaveOutlined />} 
            onClick={handleSaveBill} 
            loading={saleCreateLoading}
          >
            Save Bill
          </Button>
        </div>
      </div>

      {/* Items Table */}
      <div className={styles.itemsTable}>
        <AntdEditableTable
          dataSource={billFormData.items}
          columns={columns}
          loading={isLoading}
          rowKey="key"
          externalEditingCell={externalEditingCell}
          onSave={() => {}}
        />
        <Button
          onClick={handleAddItem}
          type="dashed"
          style={{ width: '100%', marginTop: 16 }}
        >
          Add Item
        </Button>
      </div>

      {/* Bill Totals */}
      <div className={styles.billTotals}>
        <Title level={4}>Bill Totals</Title>
        <div className={styles.totalsGrid}>
          <div>
            <Text strong>Subtotal:</Text>
            <div><Text strong>₹{billTotals.sub_total.toFixed(2)}</Text></div>
          </div>
          <div>
            <Text strong>GST:</Text>
            <div><Text strong>₹{billTotals.total_gst.toFixed(2)}</Text></div>
          </div>
          <div>
            <Text strong>Total:</Text>
            <div><Text strong style={{ fontSize: 18, color: '#1890ff' }}>₹{billTotals.total_amount.toFixed(2)}</Text></div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <CustomerSelectionModal
        visible={customerModalVisible}
        onSelect={handleSelectCustomer}
        onCancel={() => setCustomerModalVisible(false)}
      />

      <UserSelectionModal
        visible={userModalVisible}
        onSelect={handleSelectUser}
        onCancel={() => setUserModalVisible(false)}
      />

      <BillSaveConfirmationModal
        visible={saveConfirmationVisible}
        onCancel={() => setSaveConfirmationVisible(false)}
        onNewBill={() => setSaveConfirmationVisible(false)}
        onContinueBill={() => setSaveConfirmationVisible(false)}
      />

      <BillListDrawer
        visible={billListDrawerVisible}
        onClose={() => setBillListDrawerVisible(false)}
        onViewBill={() => {}}
        onNewBill={() => {}}
      />

      <ProductDetailsModal
        visible={productDetailsModalVisible}
        productId={selectedProductId}
        onCancel={() => {
          setProductDetailsModalVisible(false);
          setSelectedProductId('');
        }}
      />
    </div>
  );
};

export default BillDataGridRTK;
