import React from 'react';
import { useUser } from '../../../../components/antd/UserContext';
import PaymentQRCode from '../components/PaymentQRCode';

interface ClassicBillTemplateProps {
  billData: any;
  settings?: any; // Settings passed as prop (for consistency, may be used for future enhancements)
}

/**
 * Classic Bill Template - For Quick Retail Sales / POS
 * Compact thermal receipt style design
 * Updated: Safe null/undefined handling
 */
const ClassicBillTemplate: React.FC<ClassicBillTemplateProps> = ({
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
  const cgst = Number(billData?.cgst || (billData?.total_gst || 0) / 2);
  const sgst = Number(billData?.sgst || (billData?.total_gst || 0) / 2);
  const isGstInclusive = billData?.is_gst_included ?? true;
  const grandTotal = isGstInclusive ? subtotal : subtotal + cgst + sgst;

  return (
    <div
      style={{
        fontFamily: 'Courier New, monospace',
        background: '#fff',
        border: '1px solid #ddd',
        maxWidth: '380px', // Thermal receipt width
        margin: '20px auto',
        padding: '16px',
        fontSize: '12px',
        color: '#000',
      }}
    >
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '8px' }}>
        <h3 style={{ margin: '4px 0', fontWeight: 'bold', fontSize: '16px' }}>
          {billData?.organisationItems?.org_name || userItem?.organisationItems?.org_name || ''}
        </h3>
        <div style={{ fontSize: '11px', marginBottom: '4px' }}>
          {billData?.branchItems?.address1 || billData?.organisationItems?.address1 || userItem?.branchItems?.address1 || userItem?.organisationItems?.address1 || ''}
        </div>
        <div style={{ fontSize: '10px', marginBottom: '4px' }}>
          Mobile: {billData?.organisationItems?.phone || userItem?.organisationItems?.phone || ''} | Email: {billData?.organisationItems?.email || userItem?.organisationItems?.email || ''}
        </div>
        <div style={{ fontSize: '11px' }}>
          GSTIN: {billData?.organisationItems?.gst_number || userItem?.organisationItems?.gst_number || ''} | PAN: {billData?.organisationItems?.pan_number || userItem?.organisationItems?.pan_number || ''}
        </div>
      </div>

      {/* Bill Info */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: '8px',
        }}
      >
        <div>
          <div>BILL NO: {billData?.invoice_no || 'INV-XXXX'}</div>
          <div>
            DATE:{' '}
            {billData?.date
              ? new Date(billData.date).toLocaleDateString()
              : '-'}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div>
            NAME:{' '}
            {(billData?.customerName || '').toString().substring(0, 20).toUpperCase()}
          </div>
        </div>
      </div>

      <div style={{ borderTop: '1px dashed #000', margin: '4px 0' }}></div>

      {/* Items Table */}
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          marginBottom: '8px',
        }}
      >
        <thead>
          <tr>
            <th style={tableHeaderStyle}>Item</th>
            <th style={tableHeaderStyle}>Qty</th>
            <th style={tableHeaderStyle}>Rate</th>
            <th style={tableHeaderStyle}>Amt</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(billData?.items) && billData.items.length > 0 ? (
            billData.items.map((item: any, idx: number) => {
              const itemName = String(item?.name || item?.product_name || 'Item');
              const displayName = itemName.length > 15 ? itemName.substring(0, 15) + '...' : itemName;
              
              return (
                <tr key={idx}>
                  <td style={tableCellStyle}>{displayName}</td>
                  <td style={tableCellStyle}>{item?.qty || 0}</td>
                  <td style={tableCellStyle}>₹{item?.price || 0}</td>
                  <td style={tableCellStyle}>₹{item?.amount || 0}</td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan={4} style={{ ...tableCellStyle, textAlign: 'center' }}>
                No items
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div style={{ borderTop: '1px dashed #000', margin: '4px 0' }}></div>

      {/* Total Section */}
      <div style={{ textAlign: 'right', fontWeight: 'bold' }}>
        <div>Subtotal: ₹ {subtotal.toFixed(2)}</div>
        <div>{isGstInclusive ? 'CGST (Incl):' : 'CGST:'} {isGstInclusive ? '' : '₹ '}{cgst.toFixed(2)}</div>
        <div>{isGstInclusive ? 'SGST (Incl):' : 'SGST:'} {isGstInclusive ? '' : '₹ '}{sgst.toFixed(2)}</div>
        <div style={{ fontSize: '14px' }}>
          NET AMOUNT: ₹ {grandTotal.toFixed(2)}
        </div>
      </div>

      <div style={{ borderTop: '1px dashed #000', margin: '8px 0' }}></div>

      {/* Payment QR Code */}
      {settings?.enable_payment_qr && settings?.qr_on_bill && (
        <div style={{ textAlign: 'center', margin: '12px 0' }}>
          {settings?.qrCodeDataUrl ? (
            // Render pre-generated QR code (for print/download)
            <div style={{ padding: 8, border: '1px solid #000', display: 'inline-block' }}>
              <div style={{ fontSize: 10, fontWeight: 'bold', marginBottom: 4, textAlign: 'center' }}>Scan & Pay</div>
              <img 
                src={settings.qrCodeDataUrl} 
                alt="Payment QR Code"
                style={{ display: 'block', width: Math.min(settings?.qr_size || 150, 180), height: Math.min(settings?.qr_size || 150, 180) }}
              />
              {settings?.show_upi_id_text && settings?.upi_id && (
                <div style={{ fontSize: 8, marginTop: 4, textAlign: 'center' }}>UPI: {settings.upi_id}</div>
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
              style={{ position: 'relative', border: '1px solid #000', padding: 8 }}
            />
          )}
        </div>
      )}

      {/* Footer */}
      <div style={{ textAlign: 'center', fontSize: '11px' }}>
        *** THANK YOU ***
        <br />
        Visit Again!
      </div>
    </div>
  );
};

const tableHeaderStyle = {
  borderBottom: '1px solid #000',
  padding: '2px',
  textAlign: 'left' as const,
  fontSize: '11px',
};

const tableCellStyle = {
  padding: '2px',
  fontSize: '11px',
};

export default ClassicBillTemplate;

