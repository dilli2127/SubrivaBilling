import React from 'react';
import { useUser } from '../../../../components/antd/UserContext';

interface ProfessionalInvoiceTemplateProps {
  billData: any;
}

/**
 * Professional Invoice Template - Bill of Supply Style
 * Comprehensive invoice with all details, terms, and bank information
 */
const ProfessionalInvoiceTemplate: React.FC<ProfessionalInvoiceTemplateProps> = ({
  billData,
}) => {
  const userItem = useUser();

  // Calculate totals
  const subtotal = billData?.items?.reduce((sum: number, item: any) => sum + (item.amount || 0), 0) || 0;
  const discount = billData?.discount || 0;
  const discountAmount = billData?.discount_type === 'percentage' 
    ? (subtotal * discount / 100) 
    : discount;
  const taxableAmount = subtotal - discountAmount;
  const cgst = billData?.cgst || (billData?.total_gst || 0) / 2;
  const sgst = billData?.sgst || (billData?.total_gst || 0) / 2;
  const totalGst = cgst + sgst;
  const grandTotal = taxableAmount + totalGst;

  // Convert amount to words
  const numberToWords = (num: number): string => {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    
    if (num === 0) return 'Zero';
    if (num < 10) return ones[num];
    if (num < 20) return teens[num - 10];
    if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 ? ' ' + ones[num % 10] : '');
    if (num < 1000) return ones[Math.floor(num / 100)] + ' Hundred' + (num % 100 ? ' ' + numberToWords(num % 100) : '');
    if (num < 100000) return numberToWords(Math.floor(num / 1000)) + ' Thousand' + (num % 1000 ? ' ' + numberToWords(num % 1000) : '');
    if (num < 10000000) return numberToWords(Math.floor(num / 100000)) + ' Lakh' + (num % 100000 ? ' ' + numberToWords(num % 100000) : '');
    return numberToWords(Math.floor(num / 10000000)) + ' Crore' + (num % 10000000 ? ' ' + numberToWords(num % 10000000) : '');
  };

  const amountInWords = `Rs. ${numberToWords(Math.floor(grandTotal))} Only`;

  return (
    <div style={{ 
      fontFamily: 'Arial, sans-serif', 
      padding: 20, 
      maxWidth: 900, 
      margin: '0 auto', 
      background: '#fff',
      fontSize: 11,
      color: '#000'
    }}>
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <div style={{ fontSize: 10 }}>Page No. 1 of 1</div>
        <div style={{ fontSize: 10 }}>Original Copy</div>
      </div>

      {/* Title */}
      <div style={{ textAlign: 'center', fontSize: 18, fontWeight: 'bold', marginBottom: 12, borderBottom: '2px solid #000', paddingBottom: 8 }}>
        BILL OF SUPPLY
      </div>

      {/* Company Details */}
      <div style={{ textAlign: 'center', marginBottom: 16, borderBottom: '1px solid #000', paddingBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
          <div style={{ width: 60, height: 60, border: '1px solid #ccc', marginRight: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9 }}>
            {userItem?.organisationItems?.logo_url ? (
              <img src={userItem.organisationItems.logo_url} alt="Logo" style={{ maxWidth: '100%', maxHeight: '100%' }} />
            ) : (
              'Add Logo'
            )}
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: 16, fontWeight: 'bold' }}>
              {userItem?.organisationItems?.org_name || 'Add Company Name'}
            </h2>
            <p style={{ margin: '4px 0', fontSize: 10 }}>
              {userItem?.branchItems?.address1 || 'Add Address'}
            </p>
          </div>
        </div>
        <div style={{ fontSize: 10 }}>
          <strong>Mobile:</strong> {userItem?.organisationItems?.phone || '+91 9999999999'} | 
          <strong> Email:</strong> {userItem?.organisationItems?.email || 'company@gmail.com'}
        </div>
        <div style={{ fontSize: 10, marginTop: 4 }}>
          <strong>GSTIN -</strong> {userItem?.organisationItems?.gst_number || '29AAAAA1234F000'} | 
          <strong> PAN -</strong> {userItem?.organisationItems?.pan_number || '29AAAAA1234F'}
        </div>
      </div>

      {/* Billing and Invoice Details */}
      <div style={{ display: 'flex', marginBottom: 16, gap: 16 }}>
        {/* Billing Details */}
        <div style={{ flex: 1, border: '1px solid #000', padding: 10 }}>
          <div style={{ fontWeight: 'bold', marginBottom: 8, fontSize: 12 }}>Billing Details</div>
          <div style={{ fontSize: 10, lineHeight: 1.6 }}>
            <div><strong>Name:</strong> {billData?.customerName || 'Customer Name'}</div>
            <div><strong>GSTIN:</strong> {billData?.customer_gstin || 'N/A'}</div>
            <div><strong>Mobile:</strong> {billData?.customerPhone || '+91'}</div>
            <div><strong>Email:</strong> {billData?.customerEmail || ''}</div>
            <div><strong>Address:</strong> {billData?.customerAddress || 'Add Address'}</div>
          </div>
        </div>

        {/* Invoice Details */}
        <div style={{ flex: 1, border: '1px solid #000', padding: 10 }}>
          <div style={{ fontWeight: 'bold', marginBottom: 8, fontSize: 12 }}>Invoice</div>
          <div style={{ fontSize: 10, lineHeight: 1.6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span><strong>Number:</strong></span>
              <span>{billData?.invoice_no || '0001/25-26'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span><strong>Invoice Date:</strong></span>
              <span>{billData?.date ? new Date(billData.date).toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span><strong>Due date:</strong></span>
              <span>{billData?.due_date ? new Date(billData.due_date).toLocaleDateString('en-GB') : ''}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span><strong>Payment Mode:</strong></span>
              <span>{billData?.payment_mode || 'Cash'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: 12, border: '1px solid #000' }}>
        <thead>
          <tr style={{ background: '#f0f0f0' }}>
            <th style={thStyle}>Sr.</th>
            <th style={{ ...thStyle, textAlign: 'left' }}>Item Description</th>
            <th style={thStyle}>HSN/SAC</th>
            <th style={thStyle}>Qty</th>
            <th style={thStyle}>Unit</th>
            <th style={thStyle}>List Price</th>
            <th style={thStyle}>Disc.</th>
            <th style={thStyle}>Tax %</th>
            <th style={thStyle}>Amount (₹)</th>
          </tr>
        </thead>
        <tbody>
          {billData?.items?.map((item: any, idx: number) => (
            <tr key={idx}>
              <td style={tdStyle}>{idx + 1}</td>
              <td style={{ ...tdStyle, textAlign: 'left' }}>{item.name || item.product_name}</td>
              <td style={tdStyle}>{item.hsn_code || item.hsn_sac || '-'}</td>
              <td style={tdStyle}>{item.qty || item.quantity}</td>
              <td style={tdStyle}>{item.unit || 'N.A.'}</td>
              <td style={tdStyle}>{(item.price || 0).toFixed(2)}</td>
              <td style={tdStyle}>{item.discount ? `${item.discount} (%)` : '0.00'}</td>
              <td style={tdStyle}>{(item.tax_percentage || 0).toFixed(2)}</td>
              <td style={tdStyle}>{(item.amount || 0).toFixed(2)}</td>
            </tr>
          ))}
          {/* Empty rows for spacing */}
          {[...Array(Math.max(0, 3 - (billData?.items?.length || 0)))].map((_, idx) => (
            <tr key={`empty-${idx}`}>
              <td style={tdStyle}>&nbsp;</td>
              <td style={tdStyle}>&nbsp;</td>
              <td style={tdStyle}>&nbsp;</td>
              <td style={tdStyle}>&nbsp;</td>
              <td style={tdStyle}>&nbsp;</td>
              <td style={tdStyle}>&nbsp;</td>
              <td style={tdStyle}>&nbsp;</td>
              <td style={tdStyle}>&nbsp;</td>
              <td style={tdStyle}>&nbsp;</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Summary Section */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 4 }}>
          <div style={{ width: 200, display: 'flex', justifyContent: 'space-between', padding: '4px 8px', borderBottom: '1px solid #ccc' }}>
            <span><strong>Subtotal:</strong></span>
            <span>₹ {subtotal.toFixed(2)}</span>
          </div>
        </div>
        {discountAmount > 0 && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 4 }}>
            <div style={{ width: 200, display: 'flex', justifyContent: 'space-between', padding: '4px 8px', borderBottom: '1px solid #ccc' }}>
              <span><strong>Discount:</strong></span>
              <span>- ₹ {discountAmount.toFixed(2)}</span>
            </div>
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 4 }}>
          <div style={{ width: 200, display: 'flex', justifyContent: 'space-between', padding: '4px 8px', borderBottom: '1px solid #ccc' }}>
            <span><strong>CGST:</strong></span>
            <span>₹ {cgst.toFixed(2)}</span>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 4 }}>
          <div style={{ width: 200, display: 'flex', justifyContent: 'space-between', padding: '4px 8px', borderBottom: '1px solid #ccc' }}>
            <span><strong>SGST:</strong></span>
            <span>₹ {sgst.toFixed(2)}</span>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
          <div style={{ width: 200, display: 'flex', justifyContent: 'space-between', padding: '6px 8px', background: '#f0f0f0', fontWeight: 'bold', fontSize: 12, border: '1px solid #000' }}>
            <span>Total:</span>
            <span>₹ {grandTotal.toFixed(2)}</span>
          </div>
        </div>
        <div style={{ fontSize: 10, marginBottom: 4 }}>
          <strong>Amount in Words:</strong> {amountInWords}
        </div>
        <div style={{ fontSize: 10 }}>
          <strong>Settlement Details:</strong> Settled by - {billData?.payment_mode || 'Cash'}: {grandTotal.toFixed(2)} | Invoice Balance: 0.00
        </div>
      </div>

      {/* Footer Section */}
      <div style={{ display: 'flex', gap: 16, marginTop: 20 }}>
        {/* Terms and Conditions */}
        <div style={{ flex: 1, border: '1px solid #000', padding: 10 }}>
          <div style={{ fontWeight: 'bold', marginBottom: 8, fontSize: 11 }}>Terms and Conditions</div>
          <div style={{ fontSize: 9, marginBottom: 6 }}>E & O.E</div>
          <ol style={{ margin: 0, paddingLeft: 16, fontSize: 9, lineHeight: 1.6 }}>
            <li>Goods once sold will not be taken back.</li>
            <li>Interest @ 18% p.a. will be charged if the payment for {userItem?.organisationItems?.org_name || 'Company Name'} is not made within the stipulated time.</li>
            <li>Subject to '{userItem?.branchItems?.city || 'Delhi'}' Jurisdiction only.</li>
          </ol>
        </div>

        {/* Payment Details and Signature */}
        <div style={{ width: 250, border: '1px solid #000', padding: 10 }}>
          <div style={{ textAlign: 'center', marginBottom: 8 }}>
            <div style={{ width: 80, height: 80, border: '1px solid #ccc', margin: '0 auto 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 8 }}>
              QR Code
            </div>
          </div>
          <div style={{ fontSize: 9, marginBottom: 12, lineHeight: 1.6 }}>
            <div style={{ fontWeight: 'bold', marginBottom: 4 }}>Bank Details:</div>
            <div><strong>A/c No:</strong> {userItem?.organisationItems?.bank_account || '123456789'}</div>
            <div><strong>Bank:</strong> {userItem?.organisationItems?.bank_name || 'ICICI Bank'}</div>
            <div><strong>IFSC:</strong> {userItem?.organisationItems?.ifsc_code || 'ICICI1234'}</div>
            <div><strong>Branch:</strong> {userItem?.organisationItems?.branch || userItem?.branchItems?.city || 'Noida'}</div>
            <div><strong>Name:</strong> {userItem?.organisationItems?.org_name || 'Add Name'}</div>
          </div>
          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <div style={{ fontSize: 10 }}>For {userItem?.organisationItems?.org_name || 'Company Name'}</div>
            <div style={{ borderTop: '1px solid #000', marginTop: 24, paddingTop: 4, fontSize: 9 }}>
              Signature
            </div>
          </div>
        </div>
      </div>

      {/* Footer Branding */}
      <div style={{ textAlign: 'center', marginTop: 16, fontSize: 9, color: '#666' }}>
        Invoice Created by {userItem?.organisationItems?.org_name || 'ProBillDesk'}
      </div>
    </div>
  );
};

const thStyle = {
  border: '1px solid #000',
  padding: '6px 4px',
  fontSize: 10,
  fontWeight: 'bold' as const,
  textAlign: 'center' as const,
  background: '#f0f0f0',
};

const tdStyle = {
  border: '1px solid #000',
  padding: '6px 4px',
  fontSize: 10,
  textAlign: 'center' as const,
};

export default ProfessionalInvoiceTemplate;

