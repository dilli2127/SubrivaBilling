import React from 'react';
import { useUser } from '../../../../components/antd/UserContext';
import PaymentQRCode from '../components/PaymentQRCode';

interface ClassicInvoiceTemplateProps {
  billData: any;
  settings?: any; // Settings passed as prop to avoid Redux context issues during server-side rendering
}

/**
 * Classic Invoice Template - For Formal Invoices
 * Traditional professional invoice format with full details
 */
const ClassicInvoiceTemplate: React.FC<ClassicInvoiceTemplateProps> = ({
  billData,
  settings,
}) => {
  const userItem = useUser();

  // Ensure billData exists
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
        padding: 40,
        background: '#fff',
        border: '2px solid #333',
        maxWidth: 850,
        margin: '20px auto',
        color: '#000',
        fontFamily: 'Times New Roman, serif',
      }}
    >
      {/* Header */}
      <div style={{ textAlign: 'center', borderBottom: '3px double #333', paddingBottom: 16, marginBottom: 20 }}>
        <h1 style={{ margin: 0, fontSize: 32, fontWeight: 'bold', letterSpacing: 2 }}>
          INVOICE
        </h1>
        <h2 style={{ margin: '8px 0', fontSize: 24 }}>
          {billData?.organisationItems?.org_name || userItem?.organisationItems?.org_name || ''}
        </h2>
        <p style={{ margin: '4px 0', fontSize: 14 }}>
          {billData?.branchItems?.address1 || billData?.organisationItems?.address1 || userItem?.branchItems?.address1 || userItem?.organisationItems?.address1 || ''}
        </p>
        <p style={{ margin: '4px 0', fontSize: 13 }}>
          {(billData?.branchItems?.city || userItem?.branchItems?.city) && (billData?.branchItems?.state || userItem?.branchItems?.state)
            ? `${billData?.branchItems?.city || userItem?.branchItems?.city}, ${billData?.branchItems?.state || userItem?.branchItems?.state}${(billData?.branchItems?.pincode || userItem?.branchItems?.pincode) ? ' - ' + (billData?.branchItems?.pincode || userItem?.branchItems?.pincode) : ''}`
            : ''}
        </p>
        <p style={{ margin: '4px 0', fontSize: 13 }}>
          <strong>Mobile:</strong> {billData?.organisationItems?.phone || userItem?.organisationItems?.phone || ''} | 
          <strong> Email:</strong> {billData?.organisationItems?.email || userItem?.organisationItems?.email || ''}
        </p>
        <p style={{ margin: '4px 0', fontSize: 13 }}>
          <strong>GSTIN:</strong> {billData?.organisationItems?.gst_number || userItem?.organisationItems?.gst_number || ''} | 
          <strong> PAN:</strong> {billData?.organisationItems?.pan_number || userItem?.organisationItems?.pan_number || ''}
        </p>
      </div>

      {/* Invoice Details & Customer Info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{ width: '48%' }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: 14, fontWeight: 'bold', textDecoration: 'underline' }}>
            Bill To:
          </h3>
          <p style={{ margin: '4px 0', fontSize: 14 }}>
            <strong>{billData?.customerName || ''}</strong>
          </p>
          {billData?.customerAddress && (
            <p style={{ margin: '4px 0', fontSize: 13, color: '#555' }}>
              {billData.customerAddress}
            </p>
          )}
          {(billData?.customerCity || billData?.customerState || billData?.customerPincode) && (
            <p style={{ margin: '4px 0', fontSize: 13, color: '#555' }}>
              {[billData?.customerCity, billData?.customerState, billData?.customerPincode].filter(Boolean).join(', ')}
            </p>
          )}
          {billData?.customer_gstin && (
            <p style={{ margin: '4px 0', fontSize: 13 }}>
              GSTIN: {billData.customer_gstin}
            </p>
          )}
          {billData?.customer_pan && (
            <p style={{ margin: '4px 0', fontSize: 13 }}>
              PAN: {billData.customer_pan}
            </p>
          )}
          {billData?.customerPhone && (
            <p style={{ margin: '4px 0', fontSize: 13 }}>
              Phone: {billData.customerPhone}
            </p>
          )}
          {billData?.customerEmail && (
            <p style={{ margin: '4px 0', fontSize: 13 }}>
              Email: {billData.customerEmail}
            </p>
          )}
        </div>
        <div style={{ width: '48%', textAlign: 'right' }}>
          <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
            <tbody>
              <tr>
                <td style={{ padding: '4px 8px', textAlign: 'right', fontWeight: 'bold' }}>Invoice No:</td>
                <td style={{ padding: '4px 8px', border: '1px solid #ddd', textAlign: 'left' }}>
                  {billData?.invoice_no || '-'}
                </td>
              </tr>
              <tr>
                <td style={{ padding: '4px 8px', textAlign: 'right', fontWeight: 'bold' }}>Invoice Date:</td>
                <td style={{ padding: '4px 8px', border: '1px solid #ddd', textAlign: 'left' }}>
                  {billData?.date ? new Date(billData.date).toLocaleDateString() : '-'}
                </td>
              </tr>
              <tr>
                <td style={{ padding: '4px 8px', textAlign: 'right', fontWeight: 'bold' }}>Payment Mode:</td>
                <td style={{ padding: '4px 8px', border: '1px solid #ddd', textAlign: 'left' }}>
                  {billData?.payment_mode || 'Cash'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Items Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 24 }}>
        <thead>
          <tr style={{ background: '#f5f5f5', borderTop: '2px solid #333', borderBottom: '2px solid #333' }}>
            <th style={thStyle}>S.No</th>
            <th style={{ ...thStyle, textAlign: 'left' }}>Description of Goods</th>
            <th style={thStyle}>HSN/SAC</th>
            <th style={thStyle}>Qty</th>
            <th style={thStyle}>Rate</th>
            <th style={thStyle}>MRP</th>
            <th style={thStyle}>Tax %</th>
            <th style={thStyle}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(billData?.items) && billData.items.length > 0 ? (
            billData.items.map((item: any, idx: number) => (
              <tr key={idx} style={{ borderBottom: '1px solid #ddd' }}>
                <td style={tdStyle}>{idx + 1}</td>
                <td style={{ ...tdStyle, textAlign: 'left' }}>{String(item?.name || item?.product_name || 'Item')}</td>
                <td style={tdStyle}>{item?.hsn_code || '-'}</td>
                <td style={tdStyle}>{item?.qty || 0}</td>
                <td style={tdStyle}>₹{item?.price || 0}</td>
                <td style={tdStyle}>₹{item?.mrp || item?.price || 0}</td>
                <td style={tdStyle}>{item?.tax_percentage || 0}%</td>
                <td style={tdStyle}>₹{item?.amount || 0}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={8} style={{ ...tdStyle, textAlign: 'center' }}>No items</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Totals */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 24 }}>
        <div style={{ width: '300px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              <tr>
                <td style={{ padding: '6px 12px', textAlign: 'right', fontWeight: 'bold', fontSize: 13 }}>
                  Subtotal:
                </td>
                <td style={{ padding: '6px 12px', textAlign: 'right', border: '1px solid #ddd', fontSize: 13 }}>
                  ₹{subtotal.toFixed(2)}
                </td>
              </tr>
              <tr>
                <td style={{ padding: '6px 12px', textAlign: 'right', fontWeight: 'bold', fontSize: 13 }}>
                  {isGstInclusive ? 'CGST (Incl):' : 'CGST:'}
                </td>
                <td style={{ padding: '6px 12px', textAlign: 'right', border: '1px solid #ddd', fontSize: 13 }}>
                  {isGstInclusive ? '' : '₹'}{cgst.toFixed(2)}
                </td>
              </tr>
              <tr>
                <td style={{ padding: '6px 12px', textAlign: 'right', fontWeight: 'bold', fontSize: 13 }}>
                  {isGstInclusive ? 'SGST (Incl):' : 'SGST:'}
                </td>
                <td style={{ padding: '6px 12px', textAlign: 'right', border: '1px solid #ddd', fontSize: 13 }}>
                  {isGstInclusive ? '' : '₹'}{sgst.toFixed(2)}
                </td>
              </tr>
              <tr style={{ background: '#f5f5f5' }}>
                <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 'bold', fontSize: 15 }}>
                  Grand Total:
                </td>
                <td style={{ padding: '8px 12px', textAlign: 'right', border: '2px solid #333', fontSize: 15, fontWeight: 'bold' }}>
                  ₹{grandTotal.toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Terms & Footer */}
      <div style={{ borderTop: '2px solid #333', paddingTop: 16, marginTop: 32 }}>
        {/* Terms from Settings */}
        {settings?.show_terms_on_invoice && settings?.invoice_terms && (
          <div style={{ marginBottom: 16 }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: 13 }}>Terms & Conditions:</h4>
            <div style={{ fontSize: 12, color: '#555', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
              {settings.invoice_terms}
            </div>
          </div>
        )}

        {/* Footer from Settings */}
        {settings?.invoice_footer && (
          <div style={{ marginBottom: 16, padding: 12, background: '#f9f9f9', border: '1px solid #ddd', fontSize: 12, textAlign: 'center' }}>
            {settings.invoice_footer}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 32, alignItems: 'flex-end' }}>
          <div>
            <p style={{ margin: 0, fontSize: 12, color: '#666' }}>
              This is a computer-generated invoice
            </p>
            {/* Payment QR Code */}
            {settings?.enable_payment_qr && settings?.qr_on_invoice && (
              <div style={{ marginTop: 16 }}>
                <PaymentQRCode
                  billData={billData}
                  settings={settings}
                  size={settings?.qr_size || 150}
                  position="footer"
                  showUpiId={settings?.show_upi_id_text}
                  style={{ position: 'relative', border: '2px solid #333', padding: 8 }}
                />
              </div>
            )}
          </div>
          <div style={{ textAlign: 'right' }}>
            <p style={{ margin: '32px 0 0 0', borderTop: '1px solid #333', paddingTop: 8, fontSize: 13 }}>
              Authorized Signatory
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const thStyle = {
  padding: 8,
  textAlign: 'center' as const,
  fontSize: 12,
  fontWeight: 'bold' as const,
};

const tdStyle = {
  padding: 8,
  textAlign: 'center' as const,
  fontSize: 12,
  border: '1px solid #eee',
};

export default ClassicInvoiceTemplate;

