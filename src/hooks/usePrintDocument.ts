import React, { useCallback } from 'react';
import ReactDOMServer from 'react-dom/server';
import { useTemplateSettings } from './useTemplateSettings';

/**
 * Hook to handle document printing
 * Supports both Bill and Invoice types
 */
export const usePrintDocument = () => {
  const { BillTemplateComponent, InvoiceTemplateComponent, settings } = useTemplateSettings();

  const printDocument = useCallback(async (
    billData: any,
    documentType: 'bill' | 'invoice',
    enhancedSettings?: any  // Accept pre-enhanced settings with QR code
  ) => {
    // Generate QR code BEFORE rendering if enabled and not already provided
    let finalSettings = enhancedSettings || settings;
    
    if (!enhancedSettings?.qrCodeDataUrl && settings?.enable_payment_qr && settings?.upi_id) {
      try {
        const { generateUPIQRCode, formatBillToUPIParams } = await import('../helpers/upiPayment');
        const upiParams = formatBillToUPIParams(billData, settings);
        if (upiParams) {
          const qrCodeDataUrl = await generateUPIQRCode(upiParams, { width: settings?.qr_size || 150 });
          finalSettings = {
            ...settings,
            qrCodeDataUrl, // Pass pre-generated QR code
          };
        }
      } catch (error) {
        console.error('Error pre-generating QR code for print:', error);
      }
    }
    
    // Select appropriate template based on document type
    const TemplateComponent = documentType === 'bill' 
      ? BillTemplateComponent 
      : InvoiceTemplateComponent;

    // Create print window
    const printWindow = window.open('', '', 'width=900,height=700');
    
    if (!printWindow) {
      console.error('Failed to open print window');
      return;
    }

    // Render template to HTML - Pass settings as props to avoid Redux context issues
    const element = React.createElement(TemplateComponent, { billData, settings: finalSettings });
    const templateHtml = ReactDOMServer.renderToString(element);

    // Write HTML to print window
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${documentType === 'bill' ? 'Bill' : 'Invoice'} - ${billData?.invoice_no || ''}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              margin: 0;
              padding: 0;
            }
            @media print {
              @page {
                margin: 0;
                size: auto;
              }
              body {
                margin: 0;
                padding: 0;
              }
            }
          </style>
        </head>
        <body>
          ${templateHtml}
          <script>
            // Auto-print after load
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 250);
            };
          </script>
        </body>
      </html>
    `);

    printWindow.document.close();
  }, [BillTemplateComponent, InvoiceTemplateComponent, settings]);

  const previewDocument = useCallback(async (
    billData: any,
    documentType: 'bill' | 'invoice',
    enhancedSettings?: any  // Accept pre-enhanced settings with QR code
  ) => {
    // Generate QR code BEFORE rendering if enabled and not already provided
    let finalSettings = enhancedSettings || settings;
    
    if (!enhancedSettings?.qrCodeDataUrl && settings?.enable_payment_qr && settings?.upi_id) {
      try {
        const { generateUPIQRCode, formatBillToUPIParams } = await import('../helpers/upiPayment');
        const upiParams = formatBillToUPIParams(billData, settings);
        if (upiParams) {
          const qrCodeDataUrl = await generateUPIQRCode(upiParams, { width: settings?.qr_size || 150 });
          finalSettings = {
            ...settings,
            qrCodeDataUrl, // Pass pre-generated QR code
          };
        }
      } catch (error) {
        console.error('Error pre-generating QR code for preview:', error);
      }
    }
    
    // Same as print but without auto-print
    const TemplateComponent = documentType === 'bill' 
      ? BillTemplateComponent 
      : InvoiceTemplateComponent;

    const printWindow = window.open('', '', 'width=900,height=700');
    
    if (!printWindow) {
      console.error('Failed to open preview window');
      return;
    }

    // Pass settings as props to avoid Redux context issues
    const element = React.createElement(TemplateComponent, { billData, settings: finalSettings });
    const templateHtml = ReactDOMServer.renderToString(element);

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Preview - ${documentType === 'bill' ? 'Bill' : 'Invoice'}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              margin: 0;
              padding: 20px;
              background: #f5f5f5;
            }
            @media print {
              @page { margin: 0; }
              body { margin: 0; padding: 0; background: white; }
            }
          </style>
        </head>
        <body>
          ${templateHtml}
        </body>
      </html>
    `);

    printWindow.document.close();
  }, [BillTemplateComponent, InvoiceTemplateComponent, settings]);

  return {
    printDocument,
    previewDocument,
  };
};

