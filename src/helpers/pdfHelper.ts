import { message } from 'antd';

/**
 * Generate PDF from HTML content
 * Opens print dialog where user can save as PDF
 */
export const downloadAsPDF = async (
  htmlContent: string,
  fileName: string,
  documentType: 'bill' | 'invoice' = 'bill'
) => {
  try {
    // Create a hidden iframe
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    iframe.style.visibility = 'hidden';
    
    document.body.appendChild(iframe);
    
    // Wait for iframe to be ready
    await new Promise((resolve) => {
      iframe.onload = resolve;
      
      // Write HTML content to iframe
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      if (iframeDoc) {
        iframeDoc.open();
        iframeDoc.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <meta charset="UTF-8">
              <title>${fileName}</title>
              <style>
                * {
                  margin: 0;
                  padding: 0;
                  box-sizing: border-box;
                }
                body {
                  margin: 0;
                  padding: 0;
                  font-family: Arial, sans-serif;
                }
                @media print {
                  @page {
                    margin: 10mm;
                    size: A4;
                  }
                  body {
                    margin: 0;
                    padding: 0;
                  }
                  /* Hide print button if exists */
                  .no-print {
                    display: none !important;
                  }
                }
                @media screen {
                  body {
                    padding: 20px;
                  }
                }
              </style>
            </head>
            <body>
              ${htmlContent}
            </body>
          </html>
        `);
        iframeDoc.close();
      }
    });
    
    // Small delay to ensure content is rendered
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Trigger print dialog
    const iframeWindow = iframe.contentWindow;
    if (iframeWindow) {
      iframeWindow.focus();
      iframeWindow.print();
      
      message.success(`${documentType === 'bill' ? 'Bill' : 'Invoice'} ready to save as PDF`);
      
      // Clean up after a delay (give time for print dialog)
      setTimeout(() => {
        document.body.removeChild(iframe);
      }, 1000);
    } else {
      throw new Error('Failed to access iframe window');
    }
  } catch (error) {
    console.error('Error generating PDF:', error);
    message.error('Failed to generate PDF. Please try again.');
  }
};

/**
 * Alternative: Direct download as HTML that can be opened and printed
 */
export const downloadAsHTML = (
  htmlContent: string,
  fileName: string
) => {
  try {
    const fullHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>${fileName}</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              margin: 0;
              padding: 20px;
              font-family: Arial, sans-serif;
            }
            @media print {
              @page {
                margin: 10mm;
                size: A4;
              }
              body {
                margin: 0;
                padding: 0;
              }
            }
            .print-button {
              position: fixed;
              top: 20px;
              right: 20px;
              padding: 10px 20px;
              background: #1890ff;
              color: white;
              border: none;
              border-radius: 4px;
              cursor: pointer;
              z-index: 9999;
            }
            .print-button:hover {
              background: #40a9ff;
            }
            @media print {
              .print-button {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <button class="print-button" onclick="window.print()">🖨️ Print / Save as PDF</button>
          ${htmlContent}
        </body>
      </html>
    `;

    const blob = new Blob([fullHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    message.success('HTML file downloaded! Open it and use Ctrl+P to save as PDF.');
  } catch (error) {
    console.error('Error downloading HTML:', error);
    message.error('Failed to download file. Please try again.');
  }
};

