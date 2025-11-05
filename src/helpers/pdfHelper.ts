import { message } from 'antd';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Generate and download actual PDF file from HTML content
 * Uses html2canvas and jsPDF to create a real PDF file in A4 format
 */
export const downloadAsPDF = async (
  htmlContent: string,
  fileName: string,
  documentType: 'bill' | 'invoice' = 'bill'
) => {
  try {
    message.loading(`Generating ${documentType === 'bill' ? 'Bill' : 'Invoice'} PDF...`, 0);

    // Create a temporary container
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '0';
    container.style.width = '190mm'; // Slightly less than A4 to ensure it fits
    container.style.padding = '0';
    container.style.backgroundColor = 'white';
    container.innerHTML = htmlContent;
    
    document.body.appendChild(container);

    // Wait for images and content to load
    await new Promise(resolve => setTimeout(resolve, 500));

    // Generate canvas from HTML
    const canvas = await html2canvas(container, {
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      width: container.scrollWidth,
      height: container.scrollHeight,
    } as any);

    // Remove temporary container
    document.body.removeChild(container);

    // Calculate PDF dimensions
    const imgWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    // Create PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const imgData = canvas.toDataURL('image/png');
    
    // If content is less than 1.5 pages, fit it to a single page
    // Only use multi-page if content is genuinely long (more than 1.5x page height)
    if (imgHeight <= pageHeight * 1.5) {
      // Single page - fit to A4 size
      // If content is taller than one page, scale it down to fit
      if (imgHeight > pageHeight) {
        // Scale down to fit on one page
        const scale = pageHeight / imgHeight;
        const scaledWidth = imgWidth * scale;
        const scaledHeight = pageHeight;
        const xOffset = (imgWidth - scaledWidth) / 2; // Center horizontally
        pdf.addImage(imgData, 'PNG', xOffset, 0, scaledWidth, scaledHeight);
      } else {
        // Fits normally
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      }
    } else {
      // Multi-page - content is genuinely very long (more than 1.5 pages)
      let heightLeft = imgHeight;
      let page = 0;
      
      while (heightLeft > 0) {
        if (page > 0) {
          pdf.addPage();
        }
        
        // Calculate position for this page
        const pagePosition = -(page * pageHeight);
        pdf.addImage(imgData, 'PNG', 0, pagePosition, imgWidth, imgHeight);
        
        heightLeft -= pageHeight;
        page++;
      }
    }

    // Download PDF
    pdf.save(`${fileName}.pdf`);

    message.destroy();
    message.success(`${documentType === 'bill' ? 'Bill' : 'Invoice'} PDF downloaded successfully!`);
  } catch (error) {
    console.error('Error generating PDF:', error);
    message.destroy();
    message.error('Failed to generate PDF. Please try again.');
  }
};
