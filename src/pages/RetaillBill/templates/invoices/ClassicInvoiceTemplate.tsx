import React from 'react';
import { useUser } from '../../../../components/antd/UserContext';

interface ClassicInvoiceTemplateProps {
  billData: any;
}

/**
 * Classic Invoice Template - For Formal Invoices
 * Traditional professional invoice format with full details
 */
const ClassicInvoiceTemplate: React.FC<ClassicInvoiceTemplateProps> = ({
  billData,
}) => {
  const userItem = useUser();

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
          {userItem?.organisationItems?.org_name || 'Company Name'}
        </h2>
        <p style={{ margin: '4px 0', fontSize: 14 }}>
          {userItem?.branchItems?.address1 || 'Company Address'}
        </p>
        <p style={{ margin: '4px 0', fontSize: 13 }}>
          {userItem?.branchItems?.city && userItem?.branchItems?.state 
            ? `${userItem.branchItems.city}, ${userItem.branchItems.state} - ${userItem.branchItems.pincode || ''}`
            : ''}
        </p>
        <p style={{ margin: '4px 0', fontSize: 13 }}>
          <strong>GSTIN:</strong> {userItem?.organisationItems?.gst_number || '-'} | 
          <strong> Phone:</strong> {userItem?.organisationItems?.phone || '-'}
        </p>
      </div>

      {/* Invoice Details & Customer Info */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
        <div style={{ width: '48%' }}>
          <h3 style={{ margin: '0 0 8px 0', fontSize: 14, fontWeight: 'bold', textDecoration: 'underline' }}>
            Bill To:
          </h3>
          <p style={{ margin: '4px 0', fontSize: 14 }}>
            <strong>{billData?.customerName || 'Customer Name'}</strong>
          </p>
          <p style={{ margin: '4px 0', fontSize: 13, color: '#555' }}>
            {billData?.customerAddress || 'Customer Address'}
          </p>
          <p style={{ margin: '4px 0', fontSize: 13 }}>
            {billData?.customerPhone && `Phone: ${billData.customerPhone}`}
          </p>
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
          {billData?.items?.map((item: any, idx: number) => (
            <tr key={idx} style={{ borderBottom: '1px solid #ddd' }}>
              <td style={tdStyle}>{idx + 1}</td>
              <td style={{ ...tdStyle, textAlign: 'left' }}>{item.name}</td>
              <td style={tdStyle}>{item.hsn_code || '-'}</td>
              <td style={tdStyle}>{item.qty}</td>
              <td style={tdStyle}>₹{item.price}</td>
              <td style={tdStyle}>₹{item.mrp || item.price}</td>
              <td style={tdStyle}>{item.tax_percentage || 0}%</td>
              <td style={tdStyle}>₹{item.amount}</td>
            </tr>
          ))}
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
                  ₹{billData?.total}
                </td>
              </tr>
              <tr>
                <td style={{ padding: '6px 12px', textAlign: 'right', fontWeight: 'bold', fontSize: 13 }}>
                  CGST:
                </td>
                <td style={{ padding: '6px 12px', textAlign: 'right', border: '1px solid #ddd', fontSize: 13 }}>
                  ₹{(billData?.cgst || (billData?.total_gst || 0) / 2).toFixed(2)}
                </td>
              </tr>
              <tr>
                <td style={{ padding: '6px 12px', textAlign: 'right', fontWeight: 'bold', fontSize: 13 }}>
                  SGST:
                </td>
                <td style={{ padding: '6px 12px', textAlign: 'right', border: '1px solid #ddd', fontSize: 13 }}>
                  ₹{(billData?.sgst || (billData?.total_gst || 0) / 2).toFixed(2)}
                </td>
              </tr>
              <tr style={{ background: '#f5f5f5' }}>
                <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: 'bold', fontSize: 15 }}>
                  Grand Total:
                </td>
                <td style={{ padding: '8px 12px', textAlign: 'right', border: '2px solid #333', fontSize: 15, fontWeight: 'bold' }}>
                  ₹{billData?.total}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Terms & Footer */}
      <div style={{ borderTop: '2px solid #333', paddingTop: 16, marginTop: 32 }}>
        <div style={{ marginBottom: 16 }}>
          <h4 style={{ margin: '0 0 8px 0', fontSize: 13 }}>Terms & Conditions:</h4>
          <ul style={{ margin: 0, paddingLeft: 20, fontSize: 12, color: '#555' }}>
            <li>Payment is due within 30 days of invoice date</li>
            <li>Goods once sold will not be taken back or exchanged</li>
            <li>Subject to jurisdiction</li>
          </ul>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 32 }}>
          <div>
            <p style={{ margin: 0, fontSize: 12, color: '#666' }}>
              This is a computer-generated invoice
            </p>
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

