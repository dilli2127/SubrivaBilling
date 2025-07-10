import React from 'react';

interface ModernBillingTemplateProps {
  billData: any;
}

const ModernBillingTemplate: React.FC<ModernBillingTemplateProps> = ({ billData }) => {
  return (
    <div style={{ padding: 40, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: 16, maxWidth: 800, margin: '0 auto', color: '#fff', boxShadow: '0 4px 24px rgba(0,0,0,0.08)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h2 style={{ margin: 0, fontWeight: 700, letterSpacing: 2 }}>INVOICE</h2>
          <div style={{ fontSize: 16, opacity: 0.85 }}>#{billData?.invoice_no}</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontWeight: 600 }}>{billData?.customerName}</div>
          <div style={{ fontSize: 14, opacity: 0.85 }}>{billData?.customerAddress}</div>
        </div>
      </div>
      <div style={{ background: 'rgba(255,255,255,0.10)', borderRadius: 12, padding: 24, marginBottom: 32 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', color: '#fff' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.08)' }}>
              <th style={{ padding: 10, textAlign: 'left' }}>Item</th>
              <th style={{ padding: 10, textAlign: 'right' }}>Qty</th>
              <th style={{ padding: 10, textAlign: 'right' }}>Price</th>
              <th style={{ padding: 10, textAlign: 'right' }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {billData?.items?.map((item: any, idx: number) => (
              <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.10)' }}>
                <td style={{ padding: 10 }}>{item.name}</td>
                <td style={{ padding: 10, textAlign: 'right' }}>{item.qty}</td>
                <td style={{ padding: 10, textAlign: 'right' }}>{item.price}</td>
                <td style={{ padding: 10, textAlign: 'right' }}>{item.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
        <div style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 8, padding: '16px 32px', fontWeight: 700, fontSize: 22, color: '#fff' }}>
          Total: ₹ {billData?.total}
        </div>
      </div>
      <div style={{ marginTop: 32, textAlign: 'right', fontSize: 14, opacity: 0.7 }}>
        <span>Date: {billData?.date}</span>
      </div>
    </div>
  );
};

export default ModernBillingTemplate; 