import ClassicBillingTemplate from './ClassicBillingTemplate';
import ModernBillingTemplate from './ModernBillingTemplate';

export const billingTemplates = {
  classic: {
    label: 'Classic',
    component: ClassicBillingTemplate,
    previewImg: 'https://via.placeholder.com/220x120?text=Classic',
  },
  modern: {
    label: 'Modern',
    component: ModernBillingTemplate,
    previewImg: 'https://via.placeholder.com/220x120?text=Modern',
  },
};

export type BillingTemplateKey = keyof typeof billingTemplates; 