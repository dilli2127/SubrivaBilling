import React, { useState, useCallback, useMemo } from 'react';
import { message, Modal, Form, Input, Select, DatePicker, InputNumber } from 'antd';
import { GenericCrudPage } from '../../components/common/GenericCrudPage';
import { purchaseOrderColumns } from './columns';
import { apiSlice } from '../../services/redux/api/apiSlice';
import {
  useSubmitPurchaseOrderMutation,
  useRejectPurchaseOrderMutation,
  useCancelPurchaseOrderMutation,
} from '../../services/redux/api/endpoints';
import POLineItemsTable from './POLineItemsTable';
import POReceiveModal from './POReceiveModal';
import POApprovalModal from './POApprovalModal';
import POSendModal from './POSendModal';
import POViewModal from './POViewModal';
import POPaymentModal from './POPaymentModal';
import dayjs from 'dayjs';
import { getCurrentUser } from '../../helpers/auth';
import { canCreate, canUpdate, canDelete, RESOURCES } from '../../helpers/permissionHelper';

const { TextArea } = Input;
const { Option } = Select;

const PurchaseOrderCrud: React.FC = () => {
  const currentUser = getCurrentUser();
  
  // Modals state
  const [receiveModalOpen, setReceiveModalOpen] = useState(false);
  const [approvalModalOpen, setApprovalModalOpen] = useState(false);
  const [sendModalOpen, setSendModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedPO, setSelectedPO] = useState<any>(null);
  
  // API queries - memoized params
  const queryParams = useMemo(() => ({ page: 1, limit: 100 }), []);
  const { data: vendorsData, isLoading: vendorsLoading } = apiSlice.useGetVendorQuery(queryParams);
  const { data: warehousesData, isLoading: warehousesLoading } = apiSlice.useGetWarehouseQuery(queryParams);
  
  const vendors = useMemo(() => (vendorsData as any)?.result || [], [vendorsData]);
  const warehouses = useMemo(() => (warehousesData as any)?.result || [], [warehousesData]);
  
  // Mutations
  const [submitPO] = useSubmitPurchaseOrderMutation();
  const [rejectPO] = useRejectPurchaseOrderMutation();
  const [cancelPO] = useCancelPurchaseOrderMutation();
  
  // Optimized: Calculate item subtotal once (DRY principle)
  const getItemSubtotal = useCallback((item: any) => {
    const qty = Number(item.quantity) || 0;
    const price = Number(item.unit_price) || 0;
    const discountVal = Number(item.discount) || 0;
    const discountType = item.discount_type || 'percentage';
    
    let itemSubtotal = qty * price;
    if (discountType === 'percentage') {
      itemSubtotal -= itemSubtotal * discountVal / 100;
    } else {
      itemSubtotal -= discountVal;
    }
    
    return itemSubtotal;
  }, []);
  
  // Optimized: Single loop calculation
  const calculateTotals = useCallback((items: any[] = []) => {
    let subtotal = 0;
    let tax_amount = 0;
    let discount_amount = 0;

    items.forEach(item => {
      const qty = Number(item.quantity) || 0;
      const price = Number(item.unit_price) || 0;
      const itemTotal = qty * price;
      const itemSubtotal = getItemSubtotal(item);
      const taxPct = Number(item.tax_percentage) || 0;
      
      subtotal += itemSubtotal;
      tax_amount += itemSubtotal * (taxPct / 100);
      discount_amount += itemTotal - itemSubtotal;
    });

    const total_amount = subtotal + tax_amount;
    
    return {
      subtotal: Number(subtotal.toFixed(2)),
      tax_amount: Number(tax_amount.toFixed(2)),
      discount_amount: Number(discount_amount.toFixed(2)),
      total_amount: Number(total_amount.toFixed(2)),
      outstanding_amount: Number(total_amount.toFixed(2)),
    };
  }, [getItemSubtotal]);
  
  // Form items - memoized
  const formItems = useMemo(() => [
    {
      name: 'po_number',
      label: 'PO Number',
      rules: [{ required: true, message: 'PO number is required' }],
      component: <Input placeholder="Auto-generated or enter manually" />,
    },
    {
      name: 'po_date',
      label: 'PO Date',
      initialValue: dayjs(),
      rules: [{ required: true, message: 'PO date is required' }],
      component: <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />,
    },
    {
      name: 'vendor_id',
      label: 'Vendor',
      rules: [{ required: true, message: 'Vendor is required' }],
      component: (
        <Select
          showSearch
          placeholder="Select vendor"
          loading={vendorsLoading}
          filterOption={(input, option) => 
            String(option?.children || '').toLowerCase().includes(input.toLowerCase())
          }
        >
          {vendors.map((vendor: any) => (
            <Option key={vendor._id} value={vendor._id}>
              {vendor.vendor_name}
            </Option>
          ))}
        </Select>
      ),
    },
    {
      name: 'expected_delivery_date',
      label: 'Expected Delivery Date',
      component: <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />,
    },
    {
      name: 'warehouse_id',
      label: 'Delivery Warehouse',
      rules: [{ required: true, message: 'Warehouse is required' }],
      component: (
        <Select
          showSearch
          placeholder="Select warehouse"
          loading={warehousesLoading}
          filterOption={(input, option) =>
            String(option?.children || '').toLowerCase().includes(input.toLowerCase())
          }
        >
          {warehouses.map((warehouse: any) => (
            <Option key={warehouse._id} value={warehouse._id}>
              {warehouse.warehouse_name}
            </Option>
          ))}
        </Select>
      ),
    },
    {
      name: 'payment_terms',
      label: 'Payment Terms',
      initialValue: 'net_30',
      component: (
        <Select>
          <Option value="immediate">Immediate</Option>
          <Option value="net_7">Net 7 Days</Option>
          <Option value="net_15">Net 15 Days</Option>
          <Option value="net_30">Net 30 Days</Option>
          <Option value="net_60">Net 60 Days</Option>
          <Option value="net_90">Net 90 Days</Option>
        </Select>
      ),
    },
    {
      name: 'shipping_address',
      label: 'Shipping Address',
      component: <TextArea rows={2} placeholder="Delivery address" />,
    },
    {
      name: 'shipping_method',
      label: 'Shipping Method',
      component: <Input placeholder="e.g., Road Transport, Air Cargo" />,
    },
    {
      name: 'shipping_cost',
      label: 'Shipping Cost',
      component: <InputNumber min={0} precision={2} style={{ width: '100%' }} prefix="₹" />,
    },
    {
      name: 'notes',
      label: 'Notes',
      component: <TextArea rows={3} placeholder="Additional notes or instructions" />,
    },
    {
      name: 'terms_conditions',
      label: 'Terms & Conditions',
      component: <TextArea rows={3} placeholder="Terms and conditions for this PO" />,
    },
    {
      name: 'items',
      label: 'Line Items',
      rules: [
        { required: true, message: 'At least one item is required' },
        {
          validator: async (_: any, items: any[]) => {
            if (!items || items.length === 0) {
              throw new Error('At least one item is required');
            }
            const hasInvalidItems = items.some(
              item => !item.product_id || !item.quantity || !item.unit_price
            );
            if (hasInvalidItems) {
              throw new Error('All items must have product, quantity, and price');
            }
          },
        },
      ],
      component: <POLineItemsTable />,
      colSpan: 3,
    },
  ], [vendors, warehouses, vendorsLoading, warehousesLoading]);
  
  // Column actions - memoized
  const columnActions = useMemo(() => ({
    onView: (record: any) => {
      setSelectedPO(record);
      setViewModalOpen(true);
    },
    onEdit: () => {}, // Handled by GenericCrudPage
    onDelete: async (record: any) => message.info('Delete handled by GenericCrudPage'),
    onSubmit: async (record: any) => {
      Modal.confirm({
        title: 'Submit Purchase Order for Approval?',
        content: 'Once submitted, the PO will be sent for approval and cannot be edited.',
        onOk: async () => {
          try {
            await submitPO({ id: record._id }).unwrap();
            message.success('Purchase order submitted for approval');
          } catch (error: any) {
            message.error(error?.data?.message || 'Failed to submit PO');
          }
        },
      });
    },
    onApprove: (record: any) => {
      setSelectedPO(record);
      setApprovalModalOpen(true);
    },
    onReject: async (record: any) => {
      Modal.confirm({
        title: 'Reject Purchase Order?',
        content: (
          <div>
            <p>Please provide a reason for rejection:</p>
            <Input.TextArea
              rows={3}
              id="rejection-reason"
              placeholder="Enter reason..."
            />
          </div>
        ),
        onOk: async () => {
          const reason = (document.getElementById('rejection-reason') as HTMLTextAreaElement)?.value;
          if (!reason) {
            message.error('Rejection reason is required');
            return Promise.reject();
          }
          try {
            await rejectPO({ id: record._id, reason }).unwrap();
            message.success('Purchase order rejected');
          } catch (error: any) {
            message.error(error?.data?.message || 'Failed to reject PO');
          }
        },
      });
    },
    onSend: (record: any) => {
      setSelectedPO(record);
      setSendModalOpen(true);
    },
    onReceive: (record: any) => {
      setSelectedPO(record);
      setReceiveModalOpen(true);
    },
    onPay: (record: any) => {
      setSelectedPO(record);
      setPaymentModalOpen(true);
    },
    onCancel: async (record: any) => {
      Modal.confirm({
        title: 'Cancel Purchase Order?',
        content: 'Are you sure you want to cancel this PO?',
        onOk: async () => {
          try {
            await cancelPO({ id: record._id }).unwrap();
            message.success('Purchase order cancelled');
          } catch (error: any) {
            message.error(error?.data?.message || 'Failed to cancel PO');
          }
        },
      });
    },
    onPrint: () => message.info('Print functionality coming soon'),
  }), [submitPO, rejectPO, cancelPO]);
  
  // Handle before save - calculate totals
  const handleBeforeSave = useCallback((values: any) => {
    const totals = calculateTotals(values.items || []);
    
    return {
      ...values,
      ...totals,
      po_date: values.po_date ? dayjs(values.po_date).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'),
      expected_delivery_date: values.expected_delivery_date ? 
        dayjs(values.expected_delivery_date).format('YYYY-MM-DD') : undefined,
      status: values._id ? values.status : 'draft',
      created_by_id: currentUser?._id,
      created_by_name: currentUser?.username,
      paid_amount: values.paid_amount || 0,
    };
  }, [calculateTotals, currentUser]);
  
  // Config for GenericCrudPage with permissions
  const config = useMemo(() => ({
    title: 'Purchase Orders',
    entityName: 'PurchaseOrder',
    columns: purchaseOrderColumns(columnActions),
    formItems,
    formColumns: 3,
    drawerWidth: 1400,
    beforeSave: handleBeforeSave,
    canCreate: () => canCreate(RESOURCES.PURCHASE_ORDER),
    canEdit: (record: any) => {
      const hasPermission = canUpdate(RESOURCES.PURCHASE_ORDER);
      const canEditByStatus = ['draft', 'rejected'].includes(record?.status);
      return hasPermission && canEditByStatus;
    },
    canDelete: (record: any) => {
      const hasPermission = canDelete(RESOURCES.PURCHASE_ORDER);
      const isDraft = record?.status === 'draft';
      return hasPermission && isDraft;
    },
  }), [columnActions, formItems, handleBeforeSave]);
  
  return (
    <>
      <GenericCrudPage config={config} />
      
      <POReceiveModal
        open={receiveModalOpen}
        onClose={() => {
          setReceiveModalOpen(false);
          setSelectedPO(null);
        }}
        purchaseOrder={selectedPO}
      />
      
      <POApprovalModal
        open={approvalModalOpen}
        onClose={() => {
          setApprovalModalOpen(false);
          setSelectedPO(null);
        }}
        purchaseOrder={selectedPO}
      />
      
      <POSendModal
        open={sendModalOpen}
        onClose={() => {
          setSendModalOpen(false);
          setSelectedPO(null);
        }}
        purchaseOrder={selectedPO}
      />
      
      <POViewModal
        open={viewModalOpen}
        onClose={() => {
          setViewModalOpen(false);
          setSelectedPO(null);
        }}
        purchaseOrder={selectedPO}
      />
      
      <POPaymentModal
        open={paymentModalOpen}
        onClose={() => {
          setPaymentModalOpen(false);
          setSelectedPO(null);
        }}
        purchaseOrder={selectedPO}
        onSuccess={() => {
          // Refetch purchase orders to update payment amounts
          // GenericCrudPage will automatically refetch due to cache invalidation
          setPaymentModalOpen(false);
        }}
      />
    </>
  );
};

export default PurchaseOrderCrud;

