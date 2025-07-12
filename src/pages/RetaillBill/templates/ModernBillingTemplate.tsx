import React from 'react';
import { useUser } from '../../../components/antd/UserContext';

interface ModernBillingTemplateProps {
  billData: any;
}

const ModernBillingTemplate: React.FC<ModernBillingTemplateProps> = ({
  billData,
}) => {
  const userItem = useUser();

  return (
    <div
      style={{
        padding: 30,
        background: '#fff',
        border: '1px solid #ccc',
        borderRadius: 12,
        maxWidth: 850,
        margin: '20px auto',
        color: '#333',
        fontFamily: 'Georgia, serif',
        boxShadow: '0 0 10px rgba(0,0,0,0.08)',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          borderBottom: '2px solid #333',
          paddingBottom: 10,
          marginBottom: 20,
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: 24 }}>
            {userItem?.organisationItems?.org_name || 'Your Company Name'}
          </h1>
          <p style={{ margin: '5px 0', fontSize: 14 }}>
            {userItem?.branchItems?.branch_name || 'Branch Name'}
          </p>
          <p style={{ margin: 0, fontSize: 12 }}>
            {userItem?.branchItems?.address1 || 'Branch Address'}
          </p>
        </div>
        <div style={{ textAlign: 'right', fontSize: 12 }}>
          <p style={{ margin: 0 }}>
            <strong>GSTIN:</strong>{' '}
            {userItem?.organisationItems?.gst_number || '-'}
          </p>
          <p style={{ margin: '5px 0', fontWeight: 600 }}>
            {billData?.sale_type === 'wholesale' ? 'INVOICE' : 'CASH BILL'}
          </p>
          <p style={{ margin: 0 }}>
            <strong>Invoice #:</strong> {billData?.invoice_no || '-'}
          </p>
        </div>
      </div>

      {/* Customer Info */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginBottom: 20,
        }}
      >
        <div style={{ fontSize: 13 }}>
          <p style={{ margin: '2px 0' }}>
            <strong>Bill To:</strong> {billData?.customerName || 'Customer Name'}
          </p>
          <p style={{ margin: '2px 0', color: '#555' }}>
            {billData?.customerAddress || 'Customer Address'}
          </p>
        </div>
        <div style={{ textAlign: 'right', fontSize: 13 }}>
          <p style={{ margin: '2px 0' }}>
            <strong>Date:</strong>{' '}
            {billData?.date
              ? new Date(billData.date).toLocaleDateString()
              : '-'}
          </p>
        </div>
      </div>

      {/* Table */}
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          marginBottom: 20,
        }}
      >
        <thead>
          <tr style={{ background: 'rgba(255,255,255,0.08)' }}>
            <th style={{ padding: 10, textAlign: 'left' }}>Item</th>
            <th style={{ padding: 10, textAlign: 'right' }}>Qty</th>
            <th style={{ padding: 10, textAlign: 'right' }}>Price</th>
            <th style={{ padding: 10, textAlign: 'right' }}>MRP</th>
            <th style={{ padding: 10, textAlign: 'right' }}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {billData?.items?.map((item: any, idx: number) => (
            <tr
              key={idx}
              style={{ borderBottom: '1px solid rgba(255,255,255,0.10)' }}
            >
              <td style={{ padding: 10 }}>{item.name}</td>
              <td style={{ padding: 10, textAlign: 'right' }}>{item.qty}</td>
              <td style={{ padding: 10, textAlign: 'right' }}>
                {item.price}
              </td>
              <td style={{ padding: 10, textAlign: 'right' }}>
                {item.mrp || item.price}
              </td>
              <td style={{ padding: 10, textAlign: 'right' }}>
                {item.amount}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div style={{ textAlign: 'right', fontSize: 14 }}>
        {billData?.discount > 0 && (
          <p>
            Discount:{' '}
            {billData.discount_type === 'percentage'
              ? `${billData.discount}%`
              : `₹ ${billData.discount}`}
          </p>
        )}
        <p>CGST: ₹ {((billData?.total_gst || 0) / 2).toFixed(2)}</p>
        <p>SGST: ₹ {((billData?.total_gst || 0) / 2).toFixed(2)}</p>
        <h2 style={{ margin: 0 }}>Grand Total: ₹ {billData?.total}</h2>
      </div>

      {/* Footer */}
      <div
        style={{
          textAlign: 'center',
          marginTop: 30,
          fontSize: 12,
          color: '#999',
        }}
      >
        *** Thank you for shopping with us! ***
      </div>
    </div>
  );
};

const thStyle = {
  border: '1px solid #ccc',
  padding: 8,
  fontSize: 13,
};

const tdStyle = {
  border: '1px solid #eee',
  padding: 8,
  fontSize: 12,
};

export default ModernBillingTemplate;
