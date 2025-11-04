/**
 * Main Template Registry
 * Central export for all bill and invoice templates
 */

// Re-export Bill Templates
export { 
  billTemplates, 
  getBillTemplate,
  type BillTemplateKey 
} from './bills/billTemplates';

// Re-export Invoice Templates
export { 
  invoiceTemplates, 
  getInvoiceTemplate,
  type InvoiceTemplateKey 
} from './invoices/invoiceTemplates'; 