import React from 'react';
import { useUser } from '../../../components/antd/UserContext';

interface ClassicBillingTemplateProps {
  billData: any;
}

const ClassicBillingTemplate: React.FC<ClassicBillingTemplateProps> = ({
  billData,
}) => {
  const userItem = useUser();
  console.log("userItem",userItem)

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
          {userItem?.organisationItems?.org_name || ''}
        </h3>
        <div style={{ fontSize: '11px', marginBottom: '4px' }}>
          {userItem?.branchItems?.address1 ||
            ''}
        </div>
        <div style={{ fontSize: '11px' }}>
          GSTIN: {userItem?.organisationItems?.gst_number || '33XXXXXXXXXXX'}
        </div>
      </div>

      {/* Invoice Info */}
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
            {(billData?.customerName || '').substring(0, 20).toUpperCase()}
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
            <th style={tableHeaderStyle}>S.No</th>
            <th style={tableHeaderStyle}>Item</th>
            <th style={tableHeaderStyle}>Qty</th>
            <th style={tableHeaderStyle}>Rate</th>
            <th style={tableHeaderStyle}>Amt</th>
          </tr>
        </thead>
        <tbody>
          {billData?.items?.map((item: any, idx: number) => (
            <tr key={idx}>
              <td style={tableCellStyle}>{idx + 1}</td>
              <td style={tableCellStyle}>
                {item.name.length > 15
                  ? item.name.substring(0, 15) + '...'
                  : item.name}
              </td>
              <td style={tableCellStyle}>{item.qty}</td>
              <td style={tableCellStyle}>₹{item.price}</td>
              <td style={tableCellStyle}>₹{item.amount}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ borderTop: '1px dashed #000', margin: '4px 0' }}></div>

      {/* Total Section */}
      <div style={{ textAlign: 'right', fontWeight: 'bold' }}>
        <div>Subtotal: ₹ {billData?.total}</div>
        <div>CGST: ₹ {((billData?.total_gst || 0) / 2).toFixed(2)}</div>
        <div>SGST: ₹ {((billData?.total_gst || 0) / 2).toFixed(2)}</div>
        <div style={{ fontSize: '14px' }}>
          NET AMOUNT: ₹ {billData?.total}
        </div>
      </div>

      <div style={{ borderTop: '1px dashed #000', margin: '8px 0' }}></div>

      {/* Footer */}
      <div style={{ textAlign: 'center', fontSize: '11px' }}>
        *** GET WELL SOON. THANK YOU ***
        <br />
        Goods Once Sold Cannot Be Taken Back
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

export default ClassicBillingTemplate;
