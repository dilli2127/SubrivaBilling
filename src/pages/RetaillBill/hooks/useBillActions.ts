import { useState, useCallback } from 'react';
import { message } from 'antd';
import dayjs from 'dayjs';
import { useDispatch } from 'react-redux';
import { apiSlice } from '../../../services/redux/api/apiSlice';

interface BillActionsConfig {
  billFormData: any;
  billSettings: any;
  billCalculations: any;
  documentType: 'bill' | 'invoice';
  branchId?: string;
  createSalesRecord: any;
  updateSalesRecord: any;
  createInvoiceNumber: any;
  billdata?: any;
  onSuccess?: () => void;
  onSaveSuccess?: (savedData: any) => void;
}

/**
 * Hook to handle all bill actions: save, print, clear
 * Manages save draft, complete bill, print operations
 */
export const useBillActions = (config: BillActionsConfig) => {
  const dispatch = useDispatch();
  const [savedBillData, setSavedBillData] = useState<any>(null);
  const [createResponse, setCreateResponse] = useState<any>(null);
  const [updateResponse, setUpdateResponse] = useState<any>(null);

  // Validate stock quantities
  const validateStockQuantities = useCallback((items: any[]) => {
    const errors: string[] = [];
    // Add your validation logic here
    return errors;
  }, []);

  // Save draft (minimal validation)
  const handleSaveDraft = useCallback(async () => {
    if (!config.billFormData.invoice_no) {
      message.error('Please enter an invoice number');
      return false;
    }

    if (!config.billFormData.items || config.billFormData.items.length === 0) {
      message.error('Please add at least one product/item to save as draft');
      return false;
    }

    const validItems = config.billFormData.items.filter((item: any) => item.product_id);
    if (validItems.length === 0) {
      message.error('Please add at least one product/item to save as draft');
      return false;
    }

    const payload = {
      invoice_no: config.billFormData.invoice_no,
      date: config.billFormData.date || dayjs().format('YYYY-MM-DD'),
      ...(config.documentType === 'invoice'
        ? { vendor_id: config.billFormData.customer_id || null }
        : { customer_id: config.billFormData.customer_id || null }),
      billed_by_id: config.billFormData.billed_by_id || null,
      payment_mode: config.billFormData.payment_mode || 'cash',
      items: config.billFormData.items.map((item: any) => ({
        product_id: item.product_id || null,
        stock_id: item.stock_id || null,
        ...(config.branchId && item.stock_id && { branch_stock_id: item.stock_id }),
        qty: item.qty || 0,
        loose_qty: item.loose_qty || 0,
        price: item.price || 0,
        mrp: item.mrp || 0,
        amount: item.amount || 0,
        tax_percentage: item.tax_percentage || 0,
        _id: item._id,
      })),
      ...config.billCalculations,
      discount: config.billSettings.discount,
      discount_type: config.billSettings.discountType,
      is_paid: config.billSettings.isPaid,
      is_partially_paid: config.billSettings.isPartiallyPaid,
      sale_type: config.billSettings.isRetail ? 'retail' : 'wholesale',
      is_gst_included: config.billSettings.isGstIncluded,
      paid_amount: config.billSettings.isPartiallyPaid
        ? config.billSettings.paidAmount
        : config.billSettings.isPaid
          ? config.billCalculations.total_amount
          : 0,
      status: 'draft',
      document_type: config.documentType,
    };

    try {
      let response: any;
      if (config.billdata) {
        const result = await config.updateSalesRecord(config.billdata._id, payload);
        if (result.data) {
          response = result.data;
          setUpdateResponse(response);
        } else {
          throw result.error;
        }
      } else {
        const result = await config.createSalesRecord(payload);
        if (result.data) {
          response = result.data;
          setCreateResponse(response);
        } else {
          throw result.error;
        }
      }

      if (response?.statusCode === 200) {
        message.success('Draft saved successfully!');
        const savedData = {
          ...payload,
          customer_name: config.billFormData.customer_name,
          total_amount: config.billCalculations.total_amount,
        };
        setSavedBillData(savedData);
        config.onSaveSuccess?.(savedData);
        return true;
      }
      return false;
    } catch (error) {
      message.error('Failed to save draft. Please try again.');
      return false;
    }
  }, [config, dispatch]);

  // Complete bill (full validation)
  const handleCompleteBill = useCallback(async () => {
    if (
      !config.billFormData.invoice_no ||
      !config.billFormData.customer_id ||
      !config.billFormData.items.length
    ) {
      message.error('Please fill all required fields');
      return false;
    }

    const incompleteItems = config.billFormData.items.some(
      (item: any) =>
        !item.product_id || !item.stock_id || (!item.qty && !item.loose_qty) || !item.price
    );

    if (incompleteItems) {
      message.error('Please complete all item details');
      return false;
    }

    const stockValidationErrors = validateStockQuantities(config.billFormData.items);
    if (stockValidationErrors.length > 0) {
      message.error(`Stock validation errors:\n${stockValidationErrors.join('\n')}`);
      return false;
    }

    const payload = {
      invoice_no: config.billFormData.invoice_no,
      date: config.billFormData.date,
      ...(config.documentType === 'invoice'
        ? { vendor_id: config.billFormData.customer_id }
        : { customer_id: config.billFormData.customer_id }),
      billed_by_id: config.billFormData.billed_by_id,
      payment_mode: config.billFormData.payment_mode,
      items: config.billFormData.items.map((item: any) => ({
        product_id: item.product_id,
        stock_id: item.stock_id,
        ...(config.branchId && { branch_stock_id: item.stock_id }),
        qty: item.qty,
        loose_qty: item.loose_qty,
        price: item.price,
        mrp: item.mrp,
        amount: item.amount,
        tax_percentage: item.tax_percentage,
        hsn_code: item.hsn_code || '',
        hsn_sac: item.hsn_sac || '',
        discount: item.discount || 0,
        description: item.description || '',
        product_name: item.product_name || '',
        variant_name: item.variant_name || '',
        _id: item._id,
      })),
      ...config.billCalculations,
      discount: config.billSettings.discount,
      discount_type: config.billSettings.discountType,
      is_paid: config.billSettings.isPaid,
      is_partially_paid: config.billSettings.isPartiallyPaid,
      sale_type: config.billSettings.isRetail ? 'retail' : 'wholesale',
      is_gst_included: config.billSettings.isGstIncluded,
      paid_amount: config.billSettings.isPartiallyPaid
        ? config.billSettings.paidAmount
        : config.billSettings.isPaid
          ? config.billCalculations.total_amount
          : 0,
      status: 'completed',
      document_type: config.documentType,
    };

    try {
      let response: any;
      if (config.billdata) {
        const result = await config.updateSalesRecord(config.billdata._id, payload);
        if (result.data) {
          response = result.data;
          setUpdateResponse(response);
        } else {
          throw result.error;
        }
      } else {
        const result = await config.createSalesRecord(payload);
        if (result.data) {
          response = result.data;
          setCreateResponse(response);
        } else {
          throw result.error;
        }
      }

      if (response?.statusCode === 200) {
        const savedData = {
          ...payload,
          customer_name: config.billFormData.customer_name,
          total_amount: config.billCalculations.total_amount,
        };
        setSavedBillData(savedData);

        // Invalidate stock caches
        dispatch(apiSlice.util.invalidateTags(['StockAudit', 'BranchStock']));

        config.onSaveSuccess?.(savedData);
        
        // Create new invoice number for next bill
        if (!config.billdata) {
          config.createInvoiceNumber({});
        }
        
        return true;
      }
      return false;
    } catch (error) {
      message.error('Failed to complete bill. Please try again.');
      return false;
    }
  }, [config, validateStockQuantities, dispatch]);

  return {
    savedBillData,
    createResponse,
    updateResponse,
    handleSaveDraft,
    handleCompleteBill,
    setSavedBillData,
    setCreateResponse,
    setUpdateResponse,
  };
};

