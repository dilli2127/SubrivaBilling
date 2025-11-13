import React, { useState, useCallback, useMemo } from 'react';
import { message, Modal, Form, Input, Select, DatePicker, Button, Alert, Space, Tag, Switch } from 'antd';
import { GenericCrudPage } from '../../components/common/GenericCrudPage';
import { salesReturnColumns } from './columns';
import {
  useSubmitSalesReturnMutation,
  useApproveSalesReturnMutation,
  useRejectSalesReturnMutation,
  useCompleteSalesReturnMutation,
  useCancelSalesReturnMutation,
} from '../../services/redux/api/endpoints';
import ReturnItemsTable from './ReturnItemsTable';
import SelectInvoiceModal from './SelectInvoiceModal';
import ReturnApprovalModal from './ReturnApprovalModal';
import ReturnViewModal from './ReturnViewModal';
import dayjs from 'dayjs';
import { getCurrentUser } from '../../helpers/auth';
import { canCreate, canUpdate, canDelete, RESOURCES } from '../../helpers/permissionHelper';
import { FileTextOutlined, SearchOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const { Option } = Select;

const SalesReturnsCrud: React.FC = () => {
  const currentUser = getCurrentUser();
  const [form] = Form.useForm();
  
  // Modals state
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [approvalModalOpen, setApprovalModalOpen] = useState(false);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState<any>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  
  // Mutations
  const [submitReturn] = useSubmitSalesReturnMutation();
  const [approveReturn] = useApproveSalesReturnMutation();
  const [rejectReturn] = useRejectSalesReturnMutation();
  const [completeReturn] = useCompleteSalesReturnMutation();
  const [cancelReturn] = useCancelSalesReturnMutation();
  
  // Handle invoice selection
  const handleInvoiceSelect = useCallback((invoice: any) => {
    setSelectedInvoice(invoice);
    setInvoiceModalOpen(false);
    
    // Check if GST is included in price
    const isGstIncluded = invoice.is_gst_included || false;
    
    // Check multiple possible field names for items (Items with capital I!)
    const invoiceItems = invoice.Items || invoice.sales_record_items || invoice.items || invoice.SalesRecordItems || [];
    
    // Convert invoice items to return items
    if (invoiceItems && invoiceItems.length > 0) {
      const items = invoiceItems.map((item: any) => {
        // Get product name from nested object or direct field
        const productName = item.productItems?.name || item.product_name || item.name || 'Unknown Product';
        const variantName = item.productItems?.VariantItem?.variant_name || item.variant_name || '';
        const taxPercentage = item.productItems?.CategoryItem?.tax_percentage || item.tax_percentage || 0;
        
        // Get price - handle GST included/excluded
        let unitPrice = Number(item.price || item.unit_price) || 0;
        let lineTotal = Number(item.amount || item.line_total) || 0;
        
        // If GST is included, extract base price from total
        if (isGstIncluded && taxPercentage > 0) {
          // Reverse calculate: base_price = total_price / (1 + tax_rate)
          unitPrice = unitPrice / (1 + (taxPercentage / 100));
          lineTotal = lineTotal / (1 + (taxPercentage / 100));
        }
        
        return {
          sales_record_item_id: item._id,
          product_id: item.product_id,
          product_name: productName,
          variant_id: item.variant_id || item.productItems?.variant,
          variant_name: variantName,
          stock_id: item.stock_id,
          batch_no: item.batch_no,
          expiry_date: item.expiry_date,
          quantity: Number(item.qty || item.quantity) || 1,
          max_quantity: Number(item.qty || item.quantity) || 1,
          loose_qty: Number(item.loose_qty) || 0,
          unit_price: Number(unitPrice.toFixed(2)),
          tax_percentage: Number(taxPercentage),
          discount: Number(item.discount) || 0,
          discount_type: item.discount_type || 'percentage',
          line_total: Number(lineTotal.toFixed(2)),
          item_condition: 'good',
          condition_notes: '',
          is_gst_included: isGstIncluded, // Store for reference
        };
      });
      
      // Update form fields - both items AND invoice_selector to pass validation
      form.setFieldsValue({ 
        items,
        invoice_selector: invoice._id, // Set this to pass required validation
      });
      
      const gstNote = isGstIncluded ? ' (GST Included - base price extracted)' : ' (GST Excluded)';
      message.success(`Invoice loaded! ${items.length} item(s) ready to return.${gstNote}`);
    } else {
      message.error('This invoice has no items. Please select a different invoice.');
    }
  }, [form]);
  
  // Calculate totals from return items
  const calculateTotals = useCallback((items: any[] = []) => {
    let subtotal = 0;
    let tax_amount = 0;

    items.forEach(item => {
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
      
      subtotal += itemSubtotal;
      tax_amount += itemSubtotal * (taxPct / 100);
    });

    const total_amount = subtotal + tax_amount;
    
    return {
      subtotal: Number(subtotal.toFixed(2)),
      tax_amount: Number(tax_amount.toFixed(2)),
      total_amount: Number(total_amount.toFixed(2)),
    };
  }, []);
  
  // Form items
  const formItems = useMemo(() => [
    {
      name: 'invoice_selector',
      label: 'Original Invoice',
      rules: [{ required: true, message: 'Please select an invoice' }],
      component: (
        <div>
          {selectedInvoice ? (
            <Alert
              message={
                <Space>
                  <FileTextOutlined />
                  <span>Invoice: <strong>{selectedInvoice.invoice_no || selectedInvoice.invoice_number}</strong></span>
                  <span>Customer: <strong>{selectedInvoice.customerDetails?.full_name || selectedInvoice.customer_name || 'N/A'}</strong></span>
                  <span>Amount: <strong>₹{Number(selectedInvoice.total_amount || 0).toFixed(2)}</strong></span>
                  {selectedInvoice.is_gst_included && (
                    <Tag color="blue">GST Included</Tag>
                  )}
                </Space>
              }
              type="success"
              action={
                <Button size="small" onClick={() => setInvoiceModalOpen(true)}>
                  Change
                </Button>
              }
            />
          ) : (
            <Button
              type="dashed"
              block
              icon={<SearchOutlined />}
              onClick={() => setInvoiceModalOpen(true)}
            >
              Search & Select Invoice
            </Button>
          )}
        </div>
      ),
      colSpan: 3,
    },
    {
      name: 'return_number',
      label: 'Return Number',
      rules: [{ required: true, message: 'Return number is required' }],
      component: <Input placeholder="Auto-generated or enter manually" />,
    },
    {
      name: 'return_date',
      label: 'Return Date',
      initialValue: dayjs(),
      rules: [{ required: true, message: 'Return date is required' }],
      component: <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />,
    },
    {
      name: 'return_reason',
      label: 'Return Reason',
      rules: [{ required: true, message: 'Return reason is required' }],
      component: (
        <Select placeholder="Select reason">
          <Option value="damaged">Damaged / Broken</Option>
          <Option value="wrong_item">Wrong Item Delivered</Option>
          <Option value="expired">Expired Product</Option>
          <Option value="defective">Defective / Not Working</Option>
          <Option value="customer_request">Customer Request</Option>
          <Option value="other">Other</Option>
        </Select>
      ),
    },
    {
      name: 'return_reason_notes',
      label: 'Reason Details',
      component: <TextArea rows={2} placeholder="Additional details about the return..." />,
      colSpan: 3,
    },
    {
      name: 'refund_type',
      label: 'Refund Type',
      initialValue: 'cash',
      rules: [{ required: true, message: 'Refund type is required' }],
      component: (
        <Select placeholder="Select refund method">
          <Option value="cash">💵 Cash</Option>
          <Option value="card">💳 Card</Option>
          <Option value="upi">📱 UPI</Option>
          <Option value="points">🎯 Customer Points (Recommended)</Option>
          <Option value="bank_transfer">🏦 Bank Transfer</Option>
        </Select>
      ),
    },
    {
      name: 'refund_reference',
      label: 'Refund Reference',
      component: <Input placeholder="Transaction ID, Receipt No, etc." />,
    },
    {
      name: 'refund_date',
      label: 'Refund Date',
      component: <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />,
    },
    {
      name: 'notes',
      label: 'Notes',
      component: <TextArea rows={3} placeholder="Additional notes about the return..." />,
      colSpan: 3,
    },
    {
      name: 'items',
      label: 'Return Items',
      rules: [
        { required: true, message: 'At least one item is required' },
        {
          validator: async (_: any, items: any[]) => {
            if (!items || items.length === 0) {
              throw new Error('Please select an invoice with items to return');
            }
          },
        },
      ],
      component: <ReturnItemsTable showCondition={true} />,
      colSpan: 3,
    },
  ], [selectedInvoice]);
  
  // Column actions
  const columnActions = useMemo(() => ({
    onView: (record: any) => {
      setSelectedReturn(record);
      setViewModalOpen(true);
    },
    onEdit: () => {}, // Handled by GenericCrudPage
    onDelete: async (record: any) => message.info('Delete handled by GenericCrudPage'),
    onSubmit: async (record: any) => {
      Modal.confirm({
        title: 'Submit Sales Return for Approval?',
        content: (
          <div>
            <p>Once submitted, the return will be sent for approval.</p>
            <Input.TextArea
              rows={2}
              id="submit-comments"
              placeholder="Optional comments..."
            />
          </div>
        ),
        onOk: async () => {
          try {
            const comments = (document.getElementById('submit-comments') as HTMLTextAreaElement)?.value || undefined;
            await submitReturn({ id: record._id, comments }).unwrap();
            message.success('Sales return submitted for approval');
          } catch (error: any) {
            message.error(error?.data?.message || 'Failed to submit return');
          }
        },
      });
    },
    onApprove: (record: any) => {
      setSelectedReturn(record);
      setApprovalModalOpen(true);
    },
    onReject: async (record: any) => {
      Modal.confirm({
        title: 'Reject Sales Return?',
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
            await rejectReturn({ id: record._id, reason }).unwrap();
            message.success('Sales return rejected');
          } catch (error: any) {
            message.error(error?.data?.message || 'Failed to reject return');
          }
        },
      });
    },
    onComplete: async (record: any) => {
      Modal.confirm({
        title: 'Mark Return as Completed?',
        content: 'This will finalize the return process.',
        onOk: async () => {
          try {
            await completeReturn({ id: record._id }).unwrap();
            message.success('Sales return marked as completed');
          } catch (error: any) {
            message.error(error?.data?.message || 'Failed to complete return');
          }
        },
      });
    },
    onCancel: async (record: any) => {
      Modal.confirm({
        title: 'Cancel Sales Return?',
        content: 'Are you sure you want to cancel this return?',
        onOk: async () => {
          try {
            await cancelReturn({ id: record._id }).unwrap();
            message.success('Sales return cancelled');
          } catch (error: any) {
            message.error(error?.data?.message || 'Failed to cancel return');
          }
        },
      });
    },
    onPrint: () => message.info('Print functionality coming soon'),
  }), [submitReturn, rejectReturn, completeReturn, cancelReturn]);
  
  // Handle before save
  const handleBeforeSave = useCallback((values: any) => {
    if (!selectedInvoice) {
      message.error('Please select an invoice first');
      throw new Error('No invoice selected');
    }
    
    const totals = calculateTotals(values.items || []);
    
    return {
      ...values,
      sales_record_id: selectedInvoice._id,
      invoice_number: selectedInvoice.invoice_no || selectedInvoice.invoice_number,
      invoice_date: selectedInvoice.date || selectedInvoice.invoice_date,
      customer_id: selectedInvoice.customer_id,
      customer_name: selectedInvoice.customerDetails?.full_name || selectedInvoice.customer_name,
      customer_email: selectedInvoice.customerDetails?.email || selectedInvoice.customer_email,
      customer_phone: selectedInvoice.customerDetails?.mobile || selectedInvoice.customer_phone,
      ...totals,
      refund_amount: totals.total_amount,
      return_date: values.return_date ? dayjs(values.return_date).format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'),
      refund_date: values.refund_date ? dayjs(values.refund_date).format('YYYY-MM-DD') : undefined,
      status: values._id ? values.status : 'draft',
      created_by_id: currentUser?._id,
      created_by_name: currentUser?.username,
    };
  }, [selectedInvoice, calculateTotals, currentUser]);
  
  // Config for GenericCrudPage
  const config = useMemo(() => ({
    title: 'Sales Returns',
    entityName: 'SalesReturn',
    columns: salesReturnColumns(columnActions),
    formItems,
    formColumns: 3,
    drawerWidth: 1400,
    form, // Pass form instance
    beforeSave: handleBeforeSave,
    canCreate: () => canCreate(RESOURCES.SALES_RETURN),
    canEdit: (record: any) => {
      const hasPermission = canUpdate(RESOURCES.SALES_RETURN);
      const canEditByStatus = record?.status === 'draft';
      return hasPermission && canEditByStatus;
    },
    canDelete: (record: any) => {
      const hasPermission = canDelete(RESOURCES.SALES_RETURN);
      const isDraft = record?.status === 'draft';
      return hasPermission && isDraft;
    },
  }), [columnActions, formItems, handleBeforeSave, form]);
  
  return (
    <>
      <GenericCrudPage config={config} />
      
      {/* Select Invoice Modal */}
      <SelectInvoiceModal
        open={invoiceModalOpen}
        onClose={() => setInvoiceModalOpen(false)}
        onSelect={handleInvoiceSelect}
      />
      
      {/* Approval Modal */}
      <ReturnApprovalModal
        open={approvalModalOpen}
        onClose={() => {
          setApprovalModalOpen(false);
          setSelectedReturn(null);
        }}
        salesReturn={selectedReturn}
      />
      
      {/* View Details Modal */}
      <ReturnViewModal
        open={viewModalOpen}
        onClose={() => {
          setViewModalOpen(false);
          setSelectedReturn(null);
        }}
        salesReturn={selectedReturn}
      />
    </>
  );
};

export default SalesReturnsCrud;

