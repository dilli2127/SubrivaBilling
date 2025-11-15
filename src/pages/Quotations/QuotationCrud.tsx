import React, { useState, useCallback, useMemo } from 'react';
import { message, Modal, Form, Input, Select, DatePicker, Switch } from 'antd';
import { GenericCrudPage } from '../../components/common/GenericCrudPage';
import { quotationColumns } from './columns';
import { apiSlice } from '../../services/redux/api/apiSlice';
import {
  useSendQuotationMutation,
  useAcceptQuotationMutation,
  useRejectQuotationMutation,
  useConvertQuotationToInvoiceMutation,
} from '../../services/redux/api/endpoints';
import QuotationLineItemsTable from './QuotationLineItemsTable';
import QuotationViewModal from './QuotationViewModal';
import QuotationConvertModal from './QuotationConvertModal';
import QuotationSendModal from './QuotationSendModal';
import dayjs from 'dayjs';
import { getCurrentUser } from '../../helpers/auth';
import { canCreate, canUpdate, canDelete, RESOURCES } from '../../helpers/permissionHelper';
import { calculateAggregateTotals, normalizeLineItems } from '../../helpers/quotationCalculations';

const { TextArea } = Input;
const { Option } = Select;

const QuotationCrud: React.FC = () => {
  const currentUser = getCurrentUser();
  
  // Modals state
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [convertModalOpen, setConvertModalOpen] = useState(false);
  const [sendModalOpen, setSendModalOpen] = useState(false);
  const [selectedQuotation, setSelectedQuotation] = useState<any>(null);
  
  // GST setting state
  const [isGstIncluded, setIsGstIncluded] = useState<boolean>(true);
  
  // API queries - memoized params
  const queryParams = useMemo(() => ({ pageNumber: 1, pageLimit: 100 }), []);
  const { data: customersData, isLoading: customersLoading } = apiSlice.useGetCustomerQuery(queryParams);
  
  const customers = useMemo(() => (customersData as any)?.result || [], [customersData]);
  
  // Mutations
  const [sendQuotation] = useSendQuotationMutation();
  const [acceptQuotation] = useAcceptQuotationMutation();
  const [rejectQuotation] = useRejectQuotationMutation();
  const [convertQuotation] = useConvertQuotationToInvoiceMutation();
  
  // Optimized: Single source of truth for totals
  const calculateTotals = useCallback(
    (items: any[] = [], gstIncluded: boolean = isGstIncluded) =>
      calculateAggregateTotals(items, gstIncluded),
    [isGstIncluded]
  );
  
  // Form items - memoized
  const formItems = useMemo(() => [
    {
      name: 'quotation_number',
      label: 'Quotation Number',
      rules: [{ required: false, message: 'Quotation number is required' }],
      component: <Input placeholder="Auto-generated or enter manually" />,
    },
    {
      name: 'quotation_date',
      label: 'Quotation Date',
      initialValue: dayjs(),
      rules: [{ required: true, message: 'Quotation date is required' }],
      component: <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />,
    },
    {
      name: 'customer_id',
      label: 'Customer',
      rules: [{ required: true, message: 'Customer is required' }],
      component: (
        <Select
          showSearch
          placeholder="Select customer"
          loading={customersLoading}
          filterOption={(input, option) => 
            String(option?.children || '').toLowerCase().includes(input.toLowerCase())
          }
        >
          {customers.map((customer: any) => (
            <Option key={customer._id} value={customer._id}>
              {customer.full_name || customer.name || customer.customer_name || 'Unknown Customer'}
              {customer.mobile || customer.phone ? ` - ${customer.mobile || customer.phone}` : ''}
            </Option>
          ))}
        </Select>
      ),
    },
    {
      name: 'valid_until',
      label: 'Valid Until',
      initialValue: dayjs().add(30, 'days'),
      rules: [{ required: true, message: 'Valid until date is required' }],
      component: <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />,
    },
   
    {
      name: 'notes',
      label: 'Notes',
      component: <TextArea rows={3} placeholder="Additional notes or instructions" />,
    },
    {
      name: 'terms_conditions',
      label: 'Terms & Conditions',
      component: <TextArea rows={3} placeholder="Terms and conditions for this quotation" />,
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
      component: <QuotationLineItemsTable isGstIncluded={isGstIncluded} />,
      colSpan: 3,
    },
    {
      name: 'is_gst_included',
      label: 'GST',
      initialValue: true, // Default to GST INCLUDED
      valuePropName: 'checked',
      component: (
        <Switch
          checkedChildren="INCLUDED"
          unCheckedChildren="EXCLUDED"
          defaultChecked={true} // Ensure default is INCLUDED
        />
      ),
    },
  ], [customers, customersLoading, isGstIncluded]);
  
  // Column actions - memoized
  const columnActions = useMemo(() => ({
    onView: (record: any) => {
      setSelectedQuotation(record);
      setViewModalOpen(true);
    },
    onEdit: () => {}, // Handled by GenericCrudPage
    onDelete: async (record: any) => message.info('Delete handled by GenericCrudPage'),
    onSend: (record: any) => {
      setSelectedQuotation(record);
      setSendModalOpen(true);
    },
    onConvert: (record: any) => {
      setSelectedQuotation(record);
      setConvertModalOpen(true);
    },
    onAccept: async (record: any) => {
      Modal.confirm({
        title: 'Mark Quotation as Accepted?',
        content: 'This will mark the quotation as accepted by the customer.',
        onOk: async () => {
          try {
            await acceptQuotation({ id: record._id }).unwrap();
            message.success('Quotation marked as accepted');
          } catch (error: any) {
            message.error(error?.data?.message || 'Failed to accept quotation');
          }
        },
      });
    },
    onReject: async (record: any) => {
      Modal.confirm({
        title: 'Mark Quotation as Rejected?',
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
            await rejectQuotation({ id: record._id, reason }).unwrap();
            message.success('Quotation marked as rejected');
          } catch (error: any) {
            message.error(error?.data?.message || 'Failed to reject quotation');
          }
        },
      });
    },
    onPrint: () => message.info('Print functionality coming soon'),
  }), [acceptQuotation, rejectQuotation]);
  
  // Handle before save - calculate totals
  const handleBeforeSave = useCallback((values: any) => {
    // Ensure is_gst_included is always set (default to true if not provided)
    // Use form value first, then state, then default to true
    const gstIncluded = values.is_gst_included ?? isGstIncluded ?? true;
    
    // Normalize line items so payload always contains accurate derived values
    // normalizeLineItems now explicitly preserves stock_audit_id
    const normalizedItems = normalizeLineItems(values.items || [], gstIncluded);
    
    // Recalculate totals with the correct GST setting from form values
    const totals = calculateTotals(normalizedItems, gstIncluded);

    return {
      ...values,
      items: normalizedItems,
      // Explicitly include all calculated totals to ensure they're in the payload
      subtotal: totals.subtotal,
      tax_amount: totals.tax_amount,
      discount_amount: totals.discount_amount,
      value_of_goods: totals.value_of_goods,
      total_amount: totals.total_amount,
      quotation_date: values.quotation_date ? dayjs(values.quotation_date).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'),
      valid_until: values.valid_until ? 
        dayjs(values.valid_until).format('YYYY-MM-DD') : dayjs().add(30, 'days').format('YYYY-MM-DD'),
      status: values._id ? values.status : 'draft',
      is_gst_included: gstIncluded, // Always include is_gst_included in payload
      created_by_id: currentUser?._id,
      created_by_name: currentUser?.username,
      branch_id: currentUser?.branch_id || (currentUser as any)?.branchItems?._id,
      // Removed organisation_id and tenant_id as requested
    };
  }, [calculateTotals, currentUser, isGstIncluded]);
  
  // Handle form values change to sync GST state
  const handleFormValuesChange = useCallback((changed: any, all: any, form?: any) => {
    // Sync GST state from form value
    const gstValue = changed.is_gst_included !== undefined 
      ? changed.is_gst_included 
      : all.is_gst_included !== undefined 
        ? all.is_gst_included 
        : isGstIncluded;
    
    if (gstValue !== isGstIncluded) {
      setIsGstIncluded(gstValue);
    }
  }, [isGstIncluded]);
  
  // Config for GenericCrudPage with permissions
  const config = useMemo(() => ({
    title: 'Quotations',
    entityName: 'Quotation',
    columns: quotationColumns(columnActions),
    formItems,
    formColumns: 3,
    drawerWidth: 1400,
    beforeSave: handleBeforeSave,
    canCreate: () => canCreate(RESOURCES.QUOTATION),
    canEdit: (record: any) => {
      const hasPermission = canUpdate(RESOURCES.QUOTATION);
      const canEditByStatus = ['draft', 'rejected'].includes(record?.status);
      return hasPermission && canEditByStatus;
    },
    canDelete: (record: any) => {
      const hasPermission = canDelete(RESOURCES.QUOTATION);
      const isDraft = record?.status === 'draft';
      return hasPermission && isDraft;
    },
  }), [columnActions, formItems, handleBeforeSave]);
  
  return (
    <>
      <GenericCrudPage config={config} onValuesChange={handleFormValuesChange} />
      
      <QuotationViewModal
        open={viewModalOpen}
        onClose={() => {
          setViewModalOpen(false);
          setSelectedQuotation(null);
        }}
        quotation={selectedQuotation}
      />
      
      <QuotationConvertModal
        open={convertModalOpen}
        onClose={() => {
          setConvertModalOpen(false);
          setSelectedQuotation(null);
        }}
        quotation={selectedQuotation}
        onSuccess={() => {
          setConvertModalOpen(false);
          setSelectedQuotation(null);
        }}
      />
      
      <QuotationSendModal
        open={sendModalOpen}
        onClose={() => {
          setSendModalOpen(false);
          setSelectedQuotation(null);
        }}
        quotation={selectedQuotation}
      />
    </>
  );
};

export default QuotationCrud;

