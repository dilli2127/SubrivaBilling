import ClassicBillTemplate from './ClassicBillTemplate';
import ModernBillTemplate from './ModernBillTemplate';

/**
 * Bill Templates Registry
 * For Quick Sales / Retail / POS
 */
export const billTemplates = {
  classic: {
    label: 'Classic Bill',
    component: ClassicBillTemplate,
    description: 'Compact thermal receipt style for quick retail sales',
  },
  modern: {
    label: 'Modern Bill',
    component: ModernBillTemplate,
    description: 'Contemporary colorful design with enhanced visuals',
  },
};

export type BillTemplateKey = keyof typeof billTemplates;

// Helper function to get selected bill template component
export const getBillTemplate = (key: BillTemplateKey) => {
  return billTemplates[key]?.component || billTemplates.classic.component;
};

