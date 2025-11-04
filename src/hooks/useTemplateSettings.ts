import { useMemo } from 'react';
import { apiSlice } from '../services/redux/api/apiSlice';
import { getCurrentUser } from '../helpers/auth';
import { getBillTemplate, getInvoiceTemplate, BillTemplateKey, InvoiceTemplateKey } from '../pages/RetaillBill/templates/registry';

/**
 * Hook to get selected templates from settings
 * Returns the template components based on user's settings
 */
export const useTemplateSettings = () => {
  const userItem = useMemo(() => getCurrentUser(), []);
  const organisationId = userItem?.organisation_id || userItem?.organisationItems?._id;

  // Fetch settings for current organisation
  const { data: settingsData, isLoading } = apiSlice.useGetSettingsQuery(
    { organisation_id: organisationId, page: 1, limit: 1 },
    { 
      skip: !organisationId,
      refetchOnMountOrArgChange: false
    }
  );

  const settings = useMemo(() => {
    const settingsResult = (settingsData as any)?.result || settingsData || {};
    return Array.isArray(settingsResult) ? settingsResult[0] : settingsResult;
  }, [settingsData]);

  // Get selected template keys or use defaults
  const billTemplateKey = (settings?.bill_template || 'classic') as BillTemplateKey;
  const invoiceTemplateKey = (settings?.invoice_template || 'classic') as InvoiceTemplateKey;

  // Get template components
  const BillTemplateComponent = getBillTemplate(billTemplateKey);
  const InvoiceTemplateComponent = getInvoiceTemplate(invoiceTemplateKey);

  return {
    // Template components ready to use
    BillTemplateComponent,
    InvoiceTemplateComponent,
    
    // Template keys
    billTemplateKey,
    invoiceTemplateKey,
    
    // Loading state
    isLoading,
    
    // Settings data (if you need other settings)
    settings,
  };
};

