import React from 'react';
import { PurchaseOrder } from '../../types/purchaseOrder';
import dayjs from 'dayjs';

interface POPDFTemplateProps {
  purchaseOrder: PurchaseOrder;
  organizationInfo?: any;
}

const POPDFTemplate: React.FC<POPDFTemplateProps> = ({
  purchaseOrder,
  organizationInfo,
}) => {
  const styles = {
    container: {
      fontFamily: 'Arial, sans-serif',
      maxWidth: '210mm',
      margin: '0 auto',
      padding: '20px',
      backgroundColor: '#fff',
    },
    header: {
      borderBottom: '3px solid #1890ff',
      paddingBottom: '20px',
      marginBottom: '20px',
    },
    title: {
      fontSize: '28px',
      fontWeight: 'bold',
      color: '#1890ff',
      margin: '0 0 10px 0',
    },
    poNumber: {
      fontSize: '18px',
      color: '#666',
    },
    section: {
      marginBottom: '20px',
    },
    sectionTitle: {
      fontSize: '14px',
      fontWeight: 'bold',
      color: '#333',
      marginBottom: '10px',
      borderBottom: '2px solid #f0f0f0',
      paddingBottom: '5px',
    },
    row: {
      display: 'flex',
      justifyContent: 'space-between',
      marginBottom: '30px',
    },
    column: {
      flex: 1,
      padding: '0 10px',
    },
    label: {
      fontSize: '11px',
      color: '#888',
      marginBottom: '3px',
    },
    value: {
      fontSize: '13px',
      color: '#333',
      marginBottom: '10px',
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse' as const,
      marginTop: '10px',
    },
    th: {
      backgroundColor: '#f5f5f5',
      padding: '10px',
      textAlign: 'left' as const,
      fontSize: '12px',
      fontWeight: 'bold',
      borderBottom: '2px solid #ddd',
    },
    td: {
      padding: '10px',
      fontSize: '12px',
      borderBottom: '1px solid #f0f0f0',
    },
    totalSection: {
      marginTop: '20px',
      borderTop: '2px solid #ddd',
      paddingTop: '15px',
    },
    totalRow: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '5px 0',
      fontSize: '13px',
    },
    grandTotal: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '10px 0',
      fontSize: '18px',
      fontWeight: 'bold',
      borderTop: '2px solid #333',
      marginTop: '10px',
    },
    footer: {
      marginTop: '40px',
      paddingTop: '20px',
      borderTop: '1px solid #ddd',
      fontSize: '11px',
      color: '#666',
    },
    notes: {
      backgroundColor: '#f9f9f9',
      padding: '15px',
      borderRadius: '5px',
      marginTop: '20px',
    },
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={styles.title}>PURCHASE ORDER</h1>
            <div style={styles.poNumber}>PO # {purchaseOrder.po_number}</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            {organizationInfo?.logo && (
              <img src={organizationInfo.logo} alt="Logo" style={{ maxHeight: '60px', marginBottom: '10px' }} />
            )}
            <div style={{ fontSize: '16px', fontWeight: 'bold' }}>
              {organizationInfo?.org_name || 'Your Company Name'}
            </div>
            <div style={{ fontSize: '11px', color: '#666', marginTop: '5px' }}>
              {organizationInfo?.address1}<br />
              {organizationInfo?.city}, {organizationInfo?.state} {organizationInfo?.pincode}<br />
              {organizationInfo?.phone} | {organizationInfo?.email}
            </div>
          </div>
        </div>
      </div>

      {/* PO Details and Vendor Info */}
      <div style={styles.row}>
        <div style={styles.column}>
          <div style={styles.sectionTitle}>Vendor Information</div>
          <div style={styles.label}>Vendor Name</div>
          <div style={styles.value}>
            <strong>{purchaseOrder.VendorItem?.vendor_name}</strong>
          </div>
          <div style={styles.label}>Company</div>
          <div style={styles.value}>{purchaseOrder.VendorItem?.company_name || '-'}</div>
          <div style={styles.label}>Contact</div>
          <div style={styles.value}>
            {purchaseOrder.VendorItem?.email}<br />
            {purchaseOrder.VendorItem?.phone}
          </div>
          <div style={styles.label}>Address</div>
          <div style={styles.value}>{purchaseOrder.VendorItem?.address || '-'}</div>
        </div>

        <div style={styles.column}>
          <div style={styles.sectionTitle}>Purchase Order Details</div>
          <div style={styles.label}>PO Date</div>
          <div style={styles.value}>{dayjs(purchaseOrder.po_date).format('DD MMM YYYY')}</div>
          
          <div style={styles.label}>Expected Delivery</div>
          <div style={styles.value}>
            {purchaseOrder.expected_delivery_date
              ? dayjs(purchaseOrder.expected_delivery_date).format('DD MMM YYYY')
              : 'Not specified'}
          </div>
          
          <div style={styles.label}>Payment Terms</div>
          <div style={styles.value}>
            {purchaseOrder.payment_terms?.replace('_', ' ').toUpperCase()}
          </div>
          
          <div style={styles.label}>Delivery Location</div>
          <div style={styles.value}>
            {purchaseOrder.shipping_address || purchaseOrder.WarehouseItem?.warehouse_name || '-'}
          </div>
        </div>
      </div>

      {/* Line Items Table */}
      <div style={styles.section}>
        <div style={styles.sectionTitle}>Order Items</div>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={{ ...styles.th, width: '5%' }}>#</th>
              <th style={{ ...styles.th, width: '30%' }}>Product Description</th>
              <th style={{ ...styles.th, width: '10%', textAlign: 'center' }}>Quantity</th>
              <th style={{ ...styles.th, width: '12%', textAlign: 'right' }}>Unit Price</th>
              <th style={{ ...styles.th, width: '8%', textAlign: 'center' }}>Tax %</th>
              <th style={{ ...styles.th, width: '10%', textAlign: 'right' }}>Discount</th>
              <th style={{ ...styles.th, width: '15%', textAlign: 'right' }}>Line Total</th>
            </tr>
          </thead>
          <tbody>
            {purchaseOrder.items?.map((item, index) => (
              <tr key={index}>
                <td style={styles.td}>{index + 1}</td>
                <td style={styles.td}>
                  <strong>{item.product_name}</strong>
                  {item.variant_name && (
                    <div style={{ fontSize: '10px', color: '#888' }}>{item.variant_name}</div>
                  )}
                  {item.description && (
                    <div style={{ fontSize: '10px', color: '#666', marginTop: '3px' }}>
                      {item.description}
                    </div>
                  )}
                </td>
                <td style={{ ...styles.td, textAlign: 'center' }}>{item.quantity}</td>
                <td style={{ ...styles.td, textAlign: 'right' }}>
                  ₹{item.unit_price?.toFixed(2)}
                </td>
                <td style={{ ...styles.td, textAlign: 'center' }}>{item.tax_percentage}%</td>
                <td style={{ ...styles.td, textAlign: 'right' }}>
                  {item.discount > 0
                    ? `${item.discount}${item.discount_type === 'percentage' ? '%' : '₹'}`
                    : '-'}
                </td>
                <td style={{ ...styles.td, textAlign: 'right' }}>
                  <strong>₹{item.line_total?.toFixed(2)}</strong>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div style={styles.totalSection}>
        <div style={{ maxWidth: '300px', marginLeft: 'auto' }}>
          <div style={styles.totalRow}>
            <span>Subtotal:</span>
            <span>₹{purchaseOrder.subtotal?.toFixed(2)}</span>
          </div>
          <div style={styles.totalRow}>
            <span>Tax Amount:</span>
            <span>₹{purchaseOrder.tax_amount?.toFixed(2)}</span>
          </div>
          {purchaseOrder.discount_amount > 0 && (
            <div style={styles.totalRow}>
              <span>Discount:</span>
              <span>-₹{purchaseOrder.discount_amount?.toFixed(2)}</span>
            </div>
          )}
          {purchaseOrder.shipping_cost && purchaseOrder.shipping_cost > 0 && (
            <div style={styles.totalRow}>
              <span>Shipping Cost:</span>
              <span>₹{purchaseOrder.shipping_cost.toFixed(2)}</span>
            </div>
          )}
          <div style={styles.grandTotal}>
            <span>GRAND TOTAL:</span>
            <span>₹{purchaseOrder.total_amount?.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Notes and Terms */}
      {(purchaseOrder.notes || purchaseOrder.terms_conditions) && (
        <div style={styles.notes}>
          {purchaseOrder.notes && (
            <div style={{ marginBottom: '15px' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Notes:</div>
              <div>{purchaseOrder.notes}</div>
            </div>
          )}
          {purchaseOrder.terms_conditions && (
            <div>
              <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Terms & Conditions:</div>
              <div style={{ whiteSpace: 'pre-wrap' }}>{purchaseOrder.terms_conditions}</div>
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      <div style={styles.footer}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '50px' }}>
          <div>
            <div style={{ borderTop: '1px solid #333', paddingTop: '5px', width: '200px' }}>
              Authorized Signature
            </div>
            <div style={{ marginTop: '5px', fontSize: '10px' }}>
              {purchaseOrder.created_by_name}
            </div>
          </div>
          <div>
            <div style={{ borderTop: '1px solid #333', paddingTop: '5px', width: '200px' }}>
              Vendor Signature & Stamp
            </div>
          </div>
        </div>
        
        <div style={{ textAlign: 'center', marginTop: '30px', fontSize: '10px', color: '#999' }}>
          This is a computer-generated purchase order. No signature required.
        </div>
      </div>
    </div>
  );
};

export default POPDFTemplate;

// Helper function to print PO
export const printPurchaseOrder = (purchaseOrder: PurchaseOrder, organizationInfo?: any) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow popups to print the purchase order');
    return;
  }
  
  const content = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Purchase Order ${purchaseOrder.po_number}</title>
      <style>
        @media print {
          body { margin: 0; }
          @page { margin: 20mm; }
        }
        body { font-family: Arial, sans-serif; }
      </style>
    </head>
    <body>
      <div id="root"></div>
      <script>
        window.onload = () => {
          window.print();
          setTimeout(() => window.close(), 500);
        };
      </script>
    </body>
    </html>
  `;
  
  printWindow.document.write(content);
  printWindow.document.close();
  
  // Render the component into the print window
  // In a real implementation, you'd use ReactDOM.render or similar
  // For now, this is a placeholder structure
};

