import { useState, useCallback } from 'react';
import dayjs from 'dayjs';
import { BillFormData, BillItem } from '../../../types/entities';

interface BillSettings {
  isPaid: boolean;
  isPartiallyPaid: boolean;
  isRetail: boolean;
  isGstIncluded: boolean;
  discount: number;
  discountType: 'percentage' | 'amount';
  paidAmount: number;
}

/**
 * Hook to manage bill form state and settings
 */
export const useBillForm = () => {
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

  const [billSettings, setBillSettings] = useState<BillSettings>({
    isPaid: true,
    isPartiallyPaid: false,
    isRetail: true,
    isGstIncluded: true,
    discount: 0,
    discountType: 'percentage',
    paidAmount: 0,
  });

  const [documentType, setDocumentType] = useState<'bill' | 'invoice'>('bill');

  // Update header fields
  const updateHeader = useCallback((updates: Partial<BillFormData>) => {
    setBillFormData(prev => ({ ...prev, ...updates }));
  }, []);

  // Update items
  const updateItems = useCallback((items: BillItem[]) => {
    setBillFormData(prev => ({ ...prev, items }));
  }, []);

  // Add item
  const addItem = useCallback(() => {
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
    setBillFormData(prev => ({ ...prev, items: [...prev.items, newItem] }));
  }, []);

  // Delete items
  const deleteItems = useCallback((indices: number[]) => {
    setBillFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, index) => !indices.includes(index)),
    }));
  }, []);

  // Update settings
  const updateSettings = useCallback((updates: Partial<BillSettings>) => {
    setBillSettings(prev => ({ ...prev, ...updates }));
  }, []);

  // Reset form
  const resetForm = useCallback(() => {
    setBillFormData({
      invoice_no: '',
      date: dayjs().format('YYYY-MM-DD'),
      customer_id: '',
      customer_name: '',
      billed_by_id: '',
      billed_by_name: '',
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

    setBillSettings({
      isPaid: true,
      isPartiallyPaid: false,
      isRetail: true,
      isGstIncluded: true,
      discount: 0,
      discountType: 'percentage',
      paidAmount: 0,
    });

    setDocumentType('bill');
  }, []);

  // Load bill data (for editing)
  const loadBillData = useCallback((billdata: any, onLoadComplete?: () => void) => {
    const isInvoice = billdata.document_type === 'invoice';
    const partyDetails = isInvoice ? billdata.vendorDetails : billdata.customerDetails;
    const partyId = isInvoice ? billdata.vendor_id : billdata.customer_id;
    const partyName =
      partyDetails?.vendor_name || partyDetails?.full_name || partyDetails?.name || '';

    setBillFormData({
      invoice_no: billdata.invoice_no,
      date: dayjs(billdata.date).format('YYYY-MM-DD'),
      customer_id: partyId,
      customer_name: partyName,
      billed_by_id: billdata.billed_by_id || '',
      billed_by_name: billdata.billedByDetails?.name || '',
      payment_mode: billdata.payment_mode,
      items:
        billdata.Items?.map((item: any) => ({
          _id: item._id,
          product_id: item.product_id,
          product_name: item.productItems?.name || item.product_name || '',
          variant_name: item.productItems?.VariantItem?.variant_name || '',
          stock_id: item.stock_id || item.branch_stock_id,
          batch_no: item.batch_no || '',
          qty: item.qty || 0,
          loose_qty: item.loose_qty || 0,
          price: item.price,
          mrp: item.mrp || item.price,
          amount: item.amount,
          tax_percentage: item.tax_percentage || item.productItems?.CategoryItem?.tax_percentage || item.productItems?.tax_percentage || 0,
          hsn_code: item.hsn_code || item.productItems?.hsn_code || item.productItems?.VariantItem?.hsn_code || '',
          hsn_sac: item.hsn_sac || item.productItems?.hsn_sac || '',
          discount: item.discount || 0,
          description: item.description || '',
          category_name: item.productItems?.CategoryItem?.category_name || '',
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

    setDocumentType(billdata.document_type || 'bill');
    
    // Trigger callback after data is loaded
    if (onLoadComplete) {
      setTimeout(() => onLoadComplete(), 0);
    }
  }, []);

  return {
    billFormData,
    billSettings,
    documentType,
    setBillFormData,
    setBillSettings,
    setDocumentType,
    updateHeader,
    updateItems,
    addItem,
    deleteItems,
    updateSettings,
    resetForm,
    loadBillData,
  };
};

