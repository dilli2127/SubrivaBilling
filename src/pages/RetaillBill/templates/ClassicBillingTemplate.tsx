import React from 'react';

interface ClassicBillingTemplateProps {
  billData: any;
}

const ClassicBillingTemplate: React.FC<ClassicBillingTemplateProps> = ({ billData }) => {
  // Render a simple classic invoice layout
  return (
    <div style={{ padding: 32, fontFamily: 'serif', background: '#fff', border: '1px solid #eee', borderRadius: 8, maxWidth: 700, margin: '0 auto' }}>
      <h2 style={{ textAlign: 'center', color: '#4e54c8' }}>INVOICE</h2>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <strong>Bill To:</strong><br />
          {billData?.customerName}<br />
          {billData?.customerAddress}
        </div>
        <div>
          <strong>Date:</strong> {billData?.date}<br />
          <strong>Invoice #:</strong> {billData?.invoice_no}
        </div>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 24 }}>
        <thead>
          <tr style={{ background: '#f4f6f8' }}>
            <th style={{ border: '1px solid #eee', padding: 8 }}>Item</th>
            <th style={{ border: '1px solid #eee', padding: 8 }}>Qty</th>
            <th style={{ border: '1px solid #eee', padding: 8 }}>Price</th>
            <th style={{ border: '1px solid #eee', padding: 8 }}>Amount</th>
          </tr>
        </thead>
        <tbody>
          {billData?.items?.map((item: any, idx: number) => (
            <tr key={idx}>
              <td style={{ border: '1px solid #eee', padding: 8 }}>{item.name}</td>
              <td style={{ border: '1px solid #eee', padding: 8 }}>{item.qty}</td>
              <td style={{ border: '1px solid #eee', padding: 8 }}>{item.price}</td>
              <td style={{ border: '1px solid #eee', padding: 8 }}>{item.amount}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ textAlign: 'right', fontWeight: 'bold', fontSize: 18 }}>
        Total: ₹ {billData?.total}
      </div>
    </div>
  );
};

export default ClassicBillingTemplate; 