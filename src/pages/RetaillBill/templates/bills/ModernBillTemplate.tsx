import React from 'react';
import { useUser } from '../../../../components/antd/UserContext';
import PaymentQRCode from '../components/PaymentQRCode';

interface ModernBillTemplateProps {
  billData: any;
  settings?: any; // Settings passed as prop (for consistency, may be used for future enhancements)
}

/**
 * Modern Bill Template - For Quick Retail Sales / POS
 * Contemporary design with enhanced visuals
 * Updated: Safe null/undefined handling
 */
const ModernBillTemplate: React.FC<ModernBillTemplateProps> = ({
  billData,
  settings,
}) => {
  const userItem = useUser();

  // Ensure billData has valid items array
  if (!billData) {
    return <div>No data to display</div>;
  }

  // Calculate totals based on GST mode
  const subtotal = Number(billData?.total || 0);
  const totalGst = Number(billData?.total_gst || 0);
  const isGstInclusive = billData?.is_gst_included ?? true;
  const grandTotal = isGstInclusive ? subtotal : subtotal + totalGst;

  return (
    <div
      style={{
        padding: 24,
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        border: '1px solid #ccc',
        borderRadius: 12,
        maxWidth: 400,
        margin: '20px auto',
        color: '#fff',
        fontFamily: 'Arial, sans-serif',
        boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
      }}
    >
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: 16 }}>
        <h2 style={{ margin: 0, fontSize: 20, fontWeight: 'bold' }}>
          {billData?.organisationItems?.org_name || userItem?.organisationItems?.org_name || ''}
        </h2>
        <p style={{ margin: '4px 0', fontSize: 12, opacity: 0.9 }}>
          {billData?.branchItems?.address1 || billData?.organisationItems?.address1 || userItem?.branchItems?.address1 || userItem?.organisationItems?.address1 || ''}
        </p>
        <p style={{ margin: '4px 0', fontSize: 11, opacity: 0.9 }}>
          Mobile: {billData?.organisationItems?.phone || userItem?.organisationItems?.phone || ''} | Email: {billData?.organisationItems?.email || userItem?.organisationItems?.email || ''}
        </p>
        <p style={{ margin: '4px 0', fontSize: 11, opacity: 0.8 }}>
          GSTIN: {billData?.organisationItems?.gst_number || userItem?.organisationItems?.gst_number || ''} | PAN: {billData?.organisationItems?.pan_number || userItem?.organisationItems?.pan_number || ''}
        </p>
      </div>

      <div style={{ borderTop: '1px solid rgba(255,255,255,0.3)', margin: '12px 0' }}></div>

      {/* Bill Info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontSize: 12 }}>
        <div>
          <div><strong>Bill #:</strong> {billData?.invoice_no || '-'}</div>
          <div><strong>Date:</strong> {billData?.date ? new Date(billData.date).toLocaleDateString() : '-'}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div><strong>Customer:</strong></div>
          <div>{(billData?.customerName || 'Walk-in Customer').toString().substring(0, 20)}</div>
        </div>
      </div>

      <div style={{ borderTop: '1px solid rgba(255,255,255,0.3)', margin: '12px 0' }}></div>

      {/* Items */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 12 }}>
        <thead>
          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.3)' }}>
            <th style={{ padding: '6px 0', textAlign: 'left', fontSize: 11 }}>Item</th>
            <th style={{ padding: '6px 0', textAlign: 'center', fontSize: 11 }}>Qty</th>
            <th style={{ padding: '6px 0', textAlign: 'right', fontSize: 11 }}>Price</th>
            <th style={{ padding: '6px 0', textAlign: 'right', fontSize: 11 }}>Total</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(billData?.items) && billData.items.length > 0 ? (
            billData.items.map((item: any, idx: number) => {
              const itemName = String(item?.name || item?.product_name || 'Item');
              const displayName = itemName.length > 12 ? itemName.substring(0, 12) + '...' : itemName;
              
              return (
                <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <td style={{ padding: '6px 0', fontSize: 11 }}>
                    {displayName}
                  </td>
                  <td style={{ padding: '6px 0', textAlign: 'center', fontSize: 11 }}>{item?.qty || 0}</td>
                  <td style={{ padding: '6px 0', textAlign: 'right', fontSize: 11 }}>₹{item?.price || 0}</td>
                  <td style={{ padding: '6px 0', textAlign: 'right', fontSize: 11 }}>₹{item?.amount || 0}</td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={4} style={{ padding: '12px 0', textAlign: 'center', fontSize: 11 }}>
                No items
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div style={{ borderTop: '1px solid rgba(255,255,255,0.3)', margin: '12px 0' }}></div>

      {/* Totals */}
      <div style={{ textAlign: 'right', fontSize: 12, marginBottom: 8 }}>
        <div>Subtotal: ₹{subtotal.toFixed(2)}</div>
        <div>{isGstInclusive ? 'GST (Incl):' : 'GST:'} {isGstInclusive ? '' : '₹'}{totalGst.toFixed(2)}</div>
        <div style={{ fontSize: 16, fontWeight: 'bold', marginTop: 4 }}>
          Total: ₹{grandTotal.toFixed(2)}
        </div>
      </div>

      <div style={{ borderTop: '1px solid rgba(255,255,255,0.3)', margin: '12px 0' }}></div>

      {/* Settlement Details */}
      <div style={{ fontSize: 11, textAlign: 'center', marginBottom: 8 }}>
        {(() => {
          const isPaid = billData?.is_paid || false;
          const isPartiallyPaid = billData?.is_partially_paid || false;
          const paidAmount = Number(billData?.paid_amount || 0);
          const pendingAmount = grandTotal - paidAmount;
          
          if (!isPaid && !isPartiallyPaid) {
            // Unpaid bill - show full balance
            return <div><strong>Balance:</strong> ₹{grandTotal.toFixed(2)}</div>;
          } else if (isPartiallyPaid && !isPaid) {
            // Partially paid - show paid and pending amounts
            return (
              <div>
                <div><strong>Paid:</strong> ₹{paidAmount.toFixed(2)}</div>
                <div><strong>Pending:</strong> ₹{pendingAmount.toFixed(2)}</div>
              </div>
            );
          } else {
            // Fully paid - show settlement details
            return (
              <div>
                <div><strong>Paid by {billData?.payment_mode || 'Cash'}:</strong> ₹{paidAmount.toFixed(2)}</div>
                <div><strong>Balance:</strong> ₹0.00</div>
              </div>
            );
          }
        })()}
      </div>

      <div style={{ borderTop: '1px solid rgba(255,255,255,0.3)', margin: '12px 0' }}></div>

      {/* Payment QR Code */}
      {settings?.enable_payment_qr && settings?.qr_on_bill && (
        <div style={{ textAlign: 'center', margin: '12px 0' }}>
          {settings?.qrCodeDataUrl ? (
            // Render pre-generated QR code (for print/download)
            <div style={{ padding: 8, border: '2px solid rgba(255,255,255,0.6)', background: 'rgba(0,0,0,0.3)', display: 'inline-block' }}>
              <div style={{ fontSize: 10, fontWeight: 'bold', marginBottom: 4, textAlign: 'center', color: '#fff' }}>Scan & Pay</div>
              <img 
                src={settings.qrCodeDataUrl} 
                alt="Payment QR Code"
                style={{ display: 'block', width: Math.min(settings?.qr_size || 150, 180), height: Math.min(settings?.qr_size || 150, 180) }}
              />
              {settings?.show_upi_id_text && settings?.upi_id && (
                <div style={{ fontSize: 8, marginTop: 4, textAlign: 'center', color: '#fff' }}>UPI: {settings.upi_id}</div>
              )}
            </div>
          ) : (
            // Use dynamic component for live view
            <PaymentQRCode
              billData={billData}
              settings={settings}
              size={Math.min(settings?.qr_size || 150, 180)} // Limit size for thermal bills
              position="footer"
              showUpiId={settings?.show_upi_id_text}
              style={{ position: 'relative', border: '2px solid rgba(255,255,255,0.6)', padding: 8, background: 'rgba(0,0,0,0.3)', color: '#fff' }}
            />
          )}
        </div>
      )}

      {/* Footer */}
      <div style={{ textAlign: 'center', fontSize: 11, opacity: 0.9 }}>
        ★ Thank You! Visit Again ★
      </div>
    </div>
  );
};

export default ModernBillTemplate;

