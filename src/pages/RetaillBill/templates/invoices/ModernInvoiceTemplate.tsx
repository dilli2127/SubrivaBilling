import React from 'react';
import { useUser } from '../../../../components/antd/UserContext';

interface ModernInvoiceTemplateProps {
  billData: any;
}

/**
 * Modern Invoice Template - For Formal Invoices
 * Contemporary professional design with enhanced branding
 */
const ModernInvoiceTemplate: React.FC<ModernInvoiceTemplateProps> = ({
  billData,
}) => {
  const userItem = useUser();

  return (
    <div
      style={{
        padding: 0,
        background: '#fff',
        maxWidth: 850,
        margin: '20px auto',
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
        boxShadow: '0 0 20px rgba(0,0,0,0.1)',
        overflow: 'hidden',
      }}
    >
      {/* Header with Gradient */}
      <div
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: '#fff',
          padding: 32,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 28, fontWeight: 'bold', letterSpacing: 1 }}>
              {userItem?.organisationItems?.org_name || 'Your Company'}
            </h1>
            <p style={{ margin: '8px 0 4px 0', fontSize: 14, opacity: 0.9 }}>
              {userItem?.branchItems?.branch_name || ''}
            </p>
            <p style={{ margin: '4px 0', fontSize: 13, opacity: 0.85 }}>
              {userItem?.branchItems?.address1 || ''}
            </p>
            <p style={{ margin: '4px 0', fontSize: 13, opacity: 0.85 }}>
              {userItem?.branchItems?.city && userItem?.branchItems?.state 
                ? `${userItem.branchItems.city}, ${userItem.branchItems.state}`
                : ''}
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <h2 style={{ margin: 0, fontSize: 36, fontWeight: 'bold' }}>INVOICE</h2>
            <p style={{ margin: '8px 0 0 0', fontSize: 13, opacity: 0.9 }}>
              GSTIN: {userItem?.organisationItems?.gst_number || '-'}
            </p>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div style={{ padding: 32 }}>
        {/* Invoice Info & Customer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 32 }}>
          {/* Bill To */}
          <div style={{ width: '48%' }}>
            <div style={{ 
              background: '#f8f9fa', 
              padding: 16, 
              borderRadius: 8,
              border: '1px solid #e9ecef'
            }}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: 12, fontWeight: 'bold', color: '#667eea', textTransform: 'uppercase', letterSpacing: 1 }}>
                Bill To
              </h3>
              <p style={{ margin: '4px 0', fontSize: 16, fontWeight: 'bold', color: '#333' }}>
                {billData?.customerName || 'Customer Name'}
              </p>
              <p style={{ margin: '8px 0 4px 0', fontSize: 14, color: '#666' }}>
                {billData?.customerAddress || 'Customer Address'}
              </p>
              {billData?.customerPhone && (
                <p style={{ margin: '4px 0', fontSize: 13, color: '#666' }}>
                  Phone: {billData.customerPhone}
                </p>
              )}
            </div>
          </div>

          {/* Invoice Details */}
          <div style={{ width: '48%' }}>
            <div style={{ 
              background: '#f8f9fa', 
              padding: 16, 
              borderRadius: 8,
              border: '1px solid #e9ecef'
            }}>
              <table style={{ width: '100%', fontSize: 14 }}>
                <tbody>
                  <tr>
                    <td style={{ padding: '8px 0', color: '#666', fontWeight: '500' }}>Invoice Number:</td>
                    <td style={{ padding: '8px 0', textAlign: 'right', fontWeight: 'bold', color: '#333' }}>
                      {billData?.invoice_no || '-'}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px 0', color: '#666', fontWeight: '500' }}>Invoice Date:</td>
                    <td style={{ padding: '8px 0', textAlign: 'right', fontWeight: 'bold', color: '#333' }}>
                      {billData?.date ? new Date(billData.date).toLocaleDateString() : '-'}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px 0', color: '#666', fontWeight: '500' }}>Payment Mode:</td>
                    <td style={{ padding: '8px 0', textAlign: 'right', fontWeight: 'bold', color: '#333' }}>
                      {billData?.payment_mode || 'Cash'}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px 0', color: '#666', fontWeight: '500' }}>Status:</td>
                    <td style={{ padding: '8px 0', textAlign: 'right' }}>
                      <span style={{
                        background: '#d4edda',
                        color: '#155724',
                        padding: '4px 12px',
                        borderRadius: 4,
                        fontSize: 12,
                        fontWeight: 'bold'
                      }}>
                        PAID
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 24 }}>
          <thead>
            <tr style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: '#fff' }}>
              <th style={{ ...modernThStyle, borderTopLeftRadius: 8 }}>S.No</th>
              <th style={{ ...modernThStyle, textAlign: 'left' }}>Item Description</th>
              <th style={modernThStyle}>HSN</th>
              <th style={modernThStyle}>Qty</th>
              <th style={modernThStyle}>Rate</th>
              <th style={modernThStyle}>Tax %</th>
              <th style={{ ...modernThStyle, borderTopRightRadius: 8 }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {billData?.items?.map((item: any, idx: number) => (
              <tr key={idx} style={{ 
                background: idx % 2 === 0 ? '#fff' : '#f8f9fa',
                transition: 'background 0.2s'
              }}>
                <td style={modernTdStyle}>{idx + 1}</td>
                <td style={{ ...modernTdStyle, textAlign: 'left', fontWeight: '500' }}>{item.name}</td>
                <td style={modernTdStyle}>{item.hsn_code || '-'}</td>
                <td style={modernTdStyle}>{item.qty}</td>
                <td style={modernTdStyle}>₹{item.price}</td>
                <td style={modernTdStyle}>{item.tax_percentage || 0}%</td>
                <td style={{ ...modernTdStyle, fontWeight: 'bold' }}>₹{item.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 32 }}>
          <div style={{ width: '350px' }}>
            <div style={{ 
              background: '#f8f9fa', 
              padding: 20, 
              borderRadius: 8,
              border: '1px solid #e9ecef'
            }}>
              <table style={{ width: '100%', fontSize: 14 }}>
                <tbody>
                  <tr>
                    <td style={{ padding: '8px 0', color: '#666' }}>Subtotal:</td>
                    <td style={{ padding: '8px 0', textAlign: 'right', fontWeight: '500' }}>
                      ₹{billData?.total}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px 0', color: '#666' }}>CGST:</td>
                    <td style={{ padding: '8px 0', textAlign: 'right', fontWeight: '500' }}>
                      ₹{(billData?.cgst || (billData?.total_gst || 0) / 2).toFixed(2)}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px 0', color: '#666' }}>SGST:</td>
                    <td style={{ padding: '8px 0', textAlign: 'right', fontWeight: '500' }}>
                      ₹{(billData?.sgst || (billData?.total_gst || 0) / 2).toFixed(2)}
                    </td>
                  </tr>
                  <tr style={{ borderTop: '2px solid #667eea' }}>
                    <td style={{ padding: '12px 0 0 0', fontSize: 18, fontWeight: 'bold', color: '#333' }}>
                      Grand Total:
                    </td>
                    <td style={{ padding: '12px 0 0 0', textAlign: 'right', fontSize: 20, fontWeight: 'bold', color: '#667eea' }}>
                      ₹{billData?.total}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Terms & Signature */}
        <div style={{ borderTop: '2px solid #e9ecef', paddingTop: 24 }}>
          <div style={{ marginBottom: 24 }}>
            <h4 style={{ margin: '0 0 12px 0', fontSize: 14, fontWeight: 'bold', color: '#667eea' }}>
              Terms & Conditions:
            </h4>
            <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13, color: '#666', lineHeight: 1.8 }}>
              <li>Payment is due within 30 days from the invoice date</li>
              <li>Please include invoice number on your check</li>
              <li>Goods once sold will not be taken back or exchanged</li>
            </ul>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 32 }}>
            <div>
              <p style={{ margin: 0, fontSize: 12, color: '#999' }}>
                Generated on {new Date().toLocaleDateString()}
              </p>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ borderTop: '2px solid #333', paddingTop: 8, width: 200 }}>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 'bold' }}>Authorized Signature</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ 
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: '#fff',
        padding: 16,
        textAlign: 'center',
        fontSize: 12
      }}>
        Thank you for your business!
      </div>
    </div>
  );
};

const modernThStyle = {
  padding: 12,
  textAlign: 'center' as const,
  fontSize: 13,
  fontWeight: 'bold' as const,
};

const modernTdStyle = {
  padding: 12,
  textAlign: 'center' as const,
  fontSize: 13,
  borderBottom: '1px solid #e9ecef',
};

export default ModernInvoiceTemplate;

