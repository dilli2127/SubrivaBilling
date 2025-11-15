import { useEffect, useMemo, useCallback } from 'react';
import { message } from 'antd';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import dayjs from 'dayjs';
import { useBillData } from './useBillData';
import { useBillForm } from './useBillForm';
import { useBillModals } from './useBillModals';
import { useBillItems } from './useBillItems';
import { useBillCalculations } from './useBillCalculations';
import { useBillKeyboardShortcuts } from './useBillKeyboardShortcuts';
import { useBillActions } from './useBillActions';
import { useTemplateSettings } from '../../../hooks/useTemplateSettings';

interface AdvancedBillingProps {
  billdata?: any;
  onSuccess?: () => void;
}

/**
 * 🔥 MASTER ADVANCED BILLING HOOK
 * 
 * This hook orchestrates all billing functionality:
 * - Data fetching and management
 * - Form state management
 * - Item calculations
 * - Modal management
 * - Keyboard shortcuts
 * - Save/print/clear actions
 * 
 * Reduces main component from 3500+ lines to ~400 lines
 */
export const useAdvancedBilling = ({ billdata, onSuccess }: AdvancedBillingProps) => {
  // 1. Data Management
  const billData = useBillData(billdata);
  const { BillTemplateComponent, InvoiceTemplateComponent, settings } = useTemplateSettings();

  // 2. Form State Management
  const form = useBillForm();

  // 3. Modal Management
  const modals = useBillModals();

  // 4. Item Management & Calculations
  const items = useBillItems({
    productOptions: [], // Not needed - product data stored in bill items
    branchId: billData.branchId,
    branchStockListResult: billData.branchStockListResult,
    stockAuditListResult: billData.stockAuditListResult,
    billSettings: form.billSettings,
  });

  // 5. Bill Calculations
  const billCalculations = useBillCalculations(
    form.billFormData.items,
    form.billSettings
  );

  // 6. Save/Print/Clear Actions
  const actions = useBillActions({
    billFormData: form.billFormData,
    billSettings: form.billSettings,
    billCalculations,
    documentType: form.documentType,
    branchId: billData.branchId,
    createSalesRecord: billData.createSalesRecord,
    updateSalesRecord: billData.updateSalesRecord,
    createInvoiceNumber: billData.createInvoiceNumber,
    billdata,
    onSuccess,
    onSaveSuccess: (savedData) => {
      modals.openSaveConfirmation();
    },
  });

  // Handle items change with calculation
  const handleItemsChange = useCallback(
    (newItems: any[]) => {
      const calculatedItems = items.handleItemsChange(newItems);
      form.updateItems(calculatedItems);
    },
    [items, form]
  );

  // Handle quantity change
  const handleQuantityChange = useCallback(
    (rowIndex: number, field: 'qty' | 'loose_qty', value: number) => {
      const newItems = [...form.billFormData.items];
      const item = newItems[rowIndex];

      // Update the quantity
      newItems[rowIndex] = { ...item, [field]: value };

      // Recalculate through handleItemsChange
      handleItemsChange(newItems);
    },
    [form.billFormData.items, handleItemsChange]
  );

  // Handle product selection
  const handleProductSelect = useCallback(
    (product: any, rowOrIndex: any) => {
      const newItems = [...form.billFormData.items];
      
      // Find row index - AntdEditableTable passes row object, others might pass index number
      let rowIndex: number;
      if (typeof rowOrIndex === 'number') {
        rowIndex = rowOrIndex;
      } else {
        // rowOrIndex is the row object - find its index by key
        rowIndex = newItems.findIndex(item => (item as any).key === rowOrIndex.key);
      }
      
      if (rowIndex === -1) {
        console.error('❌ Could not find row index for product selection!');
        return;
      }
      
      // Store ALL product data (including tax %) for calculations
      newItems[rowIndex].product_id = product.id || product._id || '';
      newItems[rowIndex].product_name = product.name || '';
      newItems[rowIndex].variant_name = product.VariantItem?.variant_name || '';
      newItems[rowIndex].price = product.selling_price || 0;
      newItems[rowIndex].tax_percentage = product.CategoryItem?.tax_percentage || 0;
      newItems[rowIndex].category_name = product.CategoryItem?.category_name || '';
      
      handleItemsChange(newItems);
      modals.openStockModal(rowIndex);
    },
    [form.billFormData.items, handleItemsChange, modals]
  );

  // Handle stock selection
  const handleStockSelect = useCallback(
    (stock: any) => {
      if (modals.stockModalRowIndex === null) return;

      const newItems = [...form.billFormData.items];
      const rowIndex = modals.stockModalRowIndex;
      const currentItem = { ...newItems[rowIndex] };

      currentItem.stock_id = stock.id || stock._id || '';
      currentItem.batch_no = stock.batch_no || '';

      const productFromStock = stock.ProductItem;
      if (productFromStock) {
        currentItem.product_id = currentItem.product_id || productFromStock._id || '';
        currentItem.product_name = productFromStock.name || currentItem.product_name || '';
        currentItem.variant_name =
          currentItem.variant_name || productFromStock.VariantItem?.variant_name || '';
        currentItem.tax_percentage =
          typeof currentItem.tax_percentage === 'number' && currentItem.tax_percentage !== undefined
            ? currentItem.tax_percentage
            : productFromStock.CategoryItem?.tax_percentage || 0;
        currentItem.category_name =
          currentItem.category_name || productFromStock.CategoryItem?.category_name || '';
      }

      // Save stock data for display AND price calculation
      (currentItem as any).stockData = {
        _id: stock.id || stock._id,
        available_quantity: stock.available_quantity || 0,
        available_loose_quantity: stock.available_loose_quantity || 0,
        batch_no: stock.batch_no || '',
        pack_size: stock.ProductItem?.VariantItem?.pack_size || 1,
        sell_price: stock.sell_price || 0, // ✅ ADD THIS!
        mrp: stock.mrp || stock.sell_price || 0,
        ProductItem: stock.ProductItem,
      };

      newItems[rowIndex] = currentItem;

      handleItemsChange(newItems);
      modals.closeStockModal();

      // Focus on qty field
      const qtyColIndex = 2; // Adjust based on your column order
      modals.setExternalEditingCell({ row: modals.stockModalRowIndex, col: qtyColIndex });
    },
    [modals, form.billFormData.items, handleItemsChange]
  );

  // Handle print
  const handlePrint = useCallback(async () => {
    if (!form.billFormData.items || form.billFormData.items.length === 0) {
      message.warning('Please add items before printing');
      return;
    }

    // Always use customerListResult for both bills and invoices
    const partyList = billData.customerListResult;
    const selectedParty = partyList.find((p: any) => p._id === form.billFormData.customer_id);

    const billDataForPDF = {
      invoice_no: form.billFormData.invoice_no,
      date: form.billFormData.date,
      customerName: selectedParty?.full_name || selectedParty?.name || '',
      customerAddress: selectedParty?.address || selectedParty?.address1 || '',
      customerCity: selectedParty?.city || '',
      customerState: selectedParty?.state || '',
      customerPincode: selectedParty?.pincode || '',
      customerPhone: selectedParty?.phone || selectedParty?.mobile || '',
      customerEmail: selectedParty?.email || '',
      customer_gstin: selectedParty?.gst_no || '',
      customer_pan: selectedParty?.pan_no || '',
      items: form.billFormData.items,
      total: billCalculations.total_amount,
      total_amount: billCalculations.total_amount,
      value_of_goods: billCalculations.value_of_goods,
      sub_total: billCalculations.sub_total,
      total_gst: billCalculations.total_gst,
      cgst: billCalculations.cgst,
      sgst: billCalculations.sgst,
      discountValue: billCalculations.discountValue,
      discount: form.billSettings.discount,
      discount_type: form.billSettings.discountType,
      is_gst_included: form.billSettings.isGstIncluded,
      payment_mode: form.billFormData.payment_mode,
      // Payment status fields
      is_paid: form.billSettings.isPaid,
      is_partially_paid: form.billSettings.isPartiallyPaid,
      paid_amount: form.billSettings.isPartiallyPaid
        ? form.billSettings.paidAmount
        : form.billSettings.isPaid
          ? billCalculations.total_amount
          : 0,
      organisationItems: billData.organisationDetails,
      branchItems: billData.branchDetails,
    };

    // Generate QR code if enabled
    let qrCodeDataUrl = '';
    if (settings?.enable_payment_qr && settings?.upi_id) {
      try {
        const { generateUPIQRCode, formatBillToUPIParams } = await import('../../../helpers/upiPayment');
        const upiParams = formatBillToUPIParams(billDataForPDF, settings);
        if (upiParams) {
          qrCodeDataUrl = await generateUPIQRCode(upiParams, { width: settings?.qr_size || 150 });
        }
      } catch (error) {
        console.error('Error generating QR code for print:', error);
      }
    }

    // Add QR code to settings
    const enhancedSettings = {
      ...settings,
      qrCodeDataUrl,
    };

    // Select appropriate template
    const TemplateComponent = form.documentType === 'bill' 
      ? BillTemplateComponent 
      : InvoiceTemplateComponent;

    // Render template to HTML
    const element = React.createElement(TemplateComponent, { 
      billData: billDataForPDF, 
      settings: enhancedSettings 
    });
    const templateHtml = ReactDOMServer.renderToString(element);

    // Import and use PDF helper for printing
    const { printAsPDF } = await import('../../../helpers/pdfHelper');
    const fileName = `${form.documentType}_${billDataForPDF.invoice_no}_${dayjs().format('YYYYMMDD')}`;
    
    await printAsPDF(templateHtml, fileName, form.documentType);
  }, [form, billCalculations, billData, BillTemplateComponent, InvoiceTemplateComponent, settings]);

  // Handle download PDF
  const handleDownload = useCallback(async () => {
    if (!form.billFormData.items || form.billFormData.items.length === 0) {
      message.warning('Please add items before downloading');
      return;
    }

    // Always use customerListResult for both bills and invoices
    const partyList = billData.customerListResult;
    const selectedParty = partyList.find((p: any) => p._id === form.billFormData.customer_id);

    const billDataForPDF = {
      invoice_no: form.billFormData.invoice_no,
      date: form.billFormData.date,
      customerName: selectedParty?.full_name || selectedParty?.name || '',
      customerAddress: selectedParty?.address || selectedParty?.address1 || '',
      customerCity: selectedParty?.city || '',
      customerState: selectedParty?.state || '',
      customerPincode: selectedParty?.pincode || '',
      customerPhone: selectedParty?.phone || selectedParty?.mobile || '',
      customerEmail: selectedParty?.email || '',
      customer_gstin: selectedParty?.gst_no || '',
      customer_pan: selectedParty?.pan_no || '',
      items: form.billFormData.items,
      total: billCalculations.total_amount,
      total_amount: billCalculations.total_amount,
      value_of_goods: billCalculations.value_of_goods,
      sub_total: billCalculations.sub_total,
      total_gst: billCalculations.total_gst,
      cgst: billCalculations.cgst,
      sgst: billCalculations.sgst,
      discountValue: billCalculations.discountValue,
      discount: form.billSettings.discount,
      discount_type: form.billSettings.discountType,
      is_gst_included: form.billSettings.isGstIncluded,
      payment_mode: form.billFormData.payment_mode,
      // Payment status fields
      is_paid: form.billSettings.isPaid,
      is_partially_paid: form.billSettings.isPartiallyPaid,
      paid_amount: form.billSettings.isPartiallyPaid
        ? form.billSettings.paidAmount
        : form.billSettings.isPaid
          ? billCalculations.total_amount
          : 0,
      organisationItems: billData.organisationDetails,
      branchItems: billData.branchDetails,
    };

    // Generate QR code if enabled
    let qrCodeDataUrl = '';
    if (settings?.enable_payment_qr && settings?.upi_id) {
      try {
        const { generateUPIQRCode, formatBillToUPIParams } = await import('../../../helpers/upiPayment');
        const upiParams = formatBillToUPIParams(billDataForPDF, settings);
        if (upiParams) {
          qrCodeDataUrl = await generateUPIQRCode(upiParams, { width: settings?.qr_size || 150 });
        }
      } catch (error) {
        console.error('Error generating QR code for download:', error);
      }
    }

    // Add QR code to settings
    const enhancedSettings = {
      ...settings,
      qrCodeDataUrl,
    };

    // Select appropriate template
    const TemplateComponent = form.documentType === 'bill' 
      ? BillTemplateComponent 
      : InvoiceTemplateComponent;

    // Render template to HTML
    const element = React.createElement(TemplateComponent, { 
      billData: billDataForPDF, 
      settings: enhancedSettings 
    });
    const templateHtml = ReactDOMServer.renderToString(element);

    // Import and use PDF helper
    const { downloadAsPDF } = await import('../../../helpers/pdfHelper');
    const fileName = `${form.documentType}_${billDataForPDF.invoice_no}_${dayjs().format('YYYYMMDD')}`;
    
    await downloadAsPDF(templateHtml, fileName, form.documentType);
  }, [form, billCalculations, billData, BillTemplateComponent, InvoiceTemplateComponent, settings]);

  // 7. Keyboard Shortcuts
  const shortcuts = useBillKeyboardShortcuts({
    onF1AddItem: form.addItem,
    onF2SaveDraft: actions.handleSaveDraft,
    onF3CompleteBill: actions.handleCompleteBill,
    onF4Clear: () => {
      form.resetForm();
      message.success('Bill form cleared successfully!');
    },
    onF5ProductSelection: () => {
      // Logic to open product selection for current row
      modals.openProductSelectionModal(modals.lastInteractedRowIndex);
    },
    onF6BillList: modals.openBillListDrawer,
    onF7StockSelection: () => {
      // Logic to open stock selection for current row
      const rowIndex = form.billFormData.items.findIndex(
        (item: any) => item.product_id && !item.stock_id
      );
      if (rowIndex !== -1) {
        modals.openStockModal(rowIndex);
      } else {
        message.warning('Please select a product first');
      }
    },
    onF8Print: handlePrint,
    onEndCustomer: modals.openCustomerModal,
    onCtrlU: modals.openUserModal,
    onCtrlS: actions.handleSaveDraft,
    onCtrlN: form.addItem,
    onCtrlP: handlePrint,
    onCtrlR: () => {
      form.resetForm();
      message.success('Ready for next bill!', 2);
    },
  });

  // 8. Initialize data on mount
  useEffect(() => {
    // Products, Customers, Vendors, Users: All loaded by modals when opened
    // Selected product data (with tax %) is stored in bill items for calculations
    
    // Get invoice number for new bills
    if (!billdata && !billData.invoice_no_create_loading && !form.billFormData.invoice_no) {
      billData.refetchInvoiceNo();
    }

    // Load bill data if editing
    if (billdata) {
      form.loadBillData(billdata, () => {
        // Recalculate items after loading to populate stock data
        if (form.billFormData.items.length > 0) {
          const calculatedItems = items.calculateItemAmounts(form.billFormData.items);
          form.updateItems(calculatedItems);
        }
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [billdata?._id]);

  // 9. Set invoice number
  useEffect(() => {
    if (billData.invoiceNoData?.result?.invoice_no && !billdata) {
      form.updateHeader({ invoice_no: billData.invoiceNoData.result.invoice_no });
    }
  }, [billData.invoiceNoData, billdata]);

  // 10. Initialize empty items for new bills
  useEffect(() => {
    if (!billdata && form.billFormData.items.length === 0) {
      form.addItem();
    }
  }, [billdata, form.billFormData.items.length]);

  // 11. Auto-set current user as billed_by
  useEffect(() => {
    if (!billdata && billData.userListResult.length && billData.user?._id && !form.billFormData.billed_by) {
      const currentUser = billData.userListResult.find((u: any) => u._id === billData.user?._id);
      if (currentUser && billData.user) {
        form.updateHeader({
          billed_by: billData.user._id,
          billed_by_name: currentUser.name || billData.user.name || '',
        });
      }
    }
  }, [billData.userListResult, billData.user, billdata, form.billFormData.billed_by]);

  // 12. Update document type from settings
  useEffect(() => {
    if (!billdata && billData.settings?.default_document_type) {
      form.setDocumentType(billData.settings.default_document_type as 'bill' | 'invoice');
    }
  }, [billData.settings, billdata]);

  // 13. Recalculate items when editing and stock data is loaded
  useEffect(() => {
    if (billdata && form.billFormData.items.length > 0 && 
        (billData.branchStockListResult.length > 0 || billData.stockAuditListResult.length > 0)) {
      
      // Check if any item needs stock data populated
      const needsStockData = form.billFormData.items.some(
        (item: any) => item.stock_id && !item.stockData
      );
      
      if (needsStockData) {
        // Recalculate items to populate stockData from stock lists
        const calculatedItems = items.calculateItemAmounts(form.billFormData.items);
        form.updateItems(calculatedItems);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    billdata?._id, // Trigger when different bill is loaded
    form.billFormData.items.length, 
    billData.branchStockListResult.length, 
    billData.stockAuditListResult.length
  ]);

  // Return all necessary data and functions
  return {
    // Data
    billData,
    
    // Form
    form,
    billFormData: form.billFormData,
    billSettings: form.billSettings,
    documentType: form.documentType,
    
    // Calculations
    billCalculations,
    
    // Modals
    modals,
    
    // Actions
    actions,
    
    // Handlers
    handleItemsChange,
    handleQuantityChange,
    handleProductSelect,
    handleStockSelect,
    handlePrint,
    handleDownload,
    
    // Keyboard
    shortcuts,

    // Options for dropdowns
    // Product options not needed - products loaded in modal on demand
    productOptions: [],
    
    customerOptions: useMemo(() => {
      const options = billData.customerListResult.map((customer: any) => ({
        label: `${customer.full_name} - ${customer.mobile}`,
        value: customer._id,
      }));

      if (form.billFormData.customer_id && form.billFormData.customer_name) {
        const exists = options.some((opt: { value: string }) => opt.value === form.billFormData.customer_id);
        if (!exists) {
          options.push({
            value: form.billFormData.customer_id,
            label: form.billFormData.customer_name,
          });
        }
      }

      return options;
    }, [
      billData.customerListResult,
      form.billFormData.customer_id,
      form.billFormData.customer_name,
    ]),
    
    userOptions: useMemo(() => {
      const options = billData.userListResult.map((user: any) => ({
        label: `${user.name} (${user.roleItems?.name || 'No Role'})`,
        value: user._id,
      }));

      if (form.billFormData.billed_by && form.billFormData.billed_by_name) {
        const exists = options.some((opt: { value: string }) => opt.value === form.billFormData.billed_by);
        if (!exists) {
          options.push({
            value: form.billFormData.billed_by,
            label: form.billFormData.billed_by_name,
          });
        }
      }

      return options;
    }, [
      billData.userListResult,
      form.billFormData.billed_by,
      form.billFormData.billed_by_name,
    ]),
  };
};

