import ClassicInvoiceTemplate from './ClassicInvoiceTemplate';
import ModernInvoiceTemplate from './ModernInvoiceTemplate';
import ProfessionalInvoiceTemplate from './ProfessionalInvoiceTemplate';

/**
 * Invoice Templates Registry
 * For Formal Invoices
 */
export const invoiceTemplates = {
  classic: {
    label: 'Classic Invoice',
    component: ClassicInvoiceTemplate,
    description: 'Traditional professional invoice with full details',
  },
  modern: {
    label: 'Modern Invoice',
    component: ModernInvoiceTemplate,
    description: 'Modern branded invoice with gradient design',
  },
  professional: {
    label: 'Professional Bill of Supply',
    component: ProfessionalInvoiceTemplate,
    description: 'Comprehensive invoice with terms, bank details, and QR code',
  },
};

export type InvoiceTemplateKey = keyof typeof invoiceTemplates;

// Helper function to get selected invoice template component
export const getInvoiceTemplate = (key: InvoiceTemplateKey) => {
  return invoiceTemplates[key]?.component || invoiceTemplates.classic.component;
};

