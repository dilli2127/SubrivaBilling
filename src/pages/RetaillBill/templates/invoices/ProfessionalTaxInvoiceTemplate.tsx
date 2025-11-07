import React from 'react';
import { useUser } from '../../../../components/antd/UserContext';
import PaymentQRCode from '../components/PaymentQRCode';
import styles from './ProfessionalTaxInvoiceTemplate.module.css';

interface ProfessionalTaxInvoiceTemplateProps {
  billData: any;
  settings?: any;
}

/**
 * Professional Tax Invoice Template
 * GST-compliant invoice with detailed breakdowns, modern layout, and comprehensive business details
 */
const ProfessionalTaxInvoiceTemplate: React.FC<ProfessionalTaxInvoiceTemplateProps> = ({
  billData,
  settings,
}) => {
  const userItem = useUser();

  // Ensure billData exists
  if (!billData) {
    return <div>No data to display</div>;
  }

  // Calculate totals with detailed breakdown
  const itemsSubtotal = billData?.items?.reduce((sum: number, item: any) => {
    const itemPrice = Number(item.price || 0);
    const itemQty = Number(item.qty || item.quantity || 0);
    return sum + (itemPrice * itemQty);
  }, 0) || 0;

  const discount = Number(billData?.discount || 0);
  const discountAmount = billData?.discount_type === 'percentage' 
    ? (itemsSubtotal * discount / 100) 
    : discount;
  
  const subtotalAfterDiscount = itemsSubtotal - discountAmount;
  
  // Calculate tax
  const cgst = Number(billData?.cgst || (billData?.total_gst || 0) / 2);
  const sgst = Number(billData?.sgst || (billData?.total_gst || 0) / 2);
  const igst = Number(billData?.igst || 0);
  const totalTax = cgst + sgst + igst;
  
  // Check if GST is inclusive or exclusive
  const isGstInclusive = billData?.is_gst_included ?? true;
  
  // Calculate grand total
  const grandTotal = isGstInclusive 
    ? subtotalAfterDiscount 
    : subtotalAfterDiscount + totalTax;

  // Additional charges
  const shippingCharges = Number(billData?.shipping_charges || 0);
  const otherCharges = Number(billData?.other_charges || 0);
  const finalTotal = grandTotal + shippingCharges + otherCharges;

  // Payment status
  const isPaid = billData?.is_paid || false;
  const isPartiallyPaid = billData?.is_partially_paid || false;
  const paidAmount = Number(billData?.paid_amount || 0);
  const balanceDue = finalTotal - paidAmount;

  // Convert amount to words
  const numberToWords = (num: number): string => {
    const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
    const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
    const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    
    if (num === 0) return 'Zero';
    if (num < 10) return ones[num];
    if (num < 20) return teens[num - 10];
    if (num < 100) return tens[Math.floor(num / 10)] + (num % 10 ? ' ' + ones[num % 10] : '');
    if (num < 1000) return ones[Math.floor(num / 100)] + ' Hundred' + (num % 100 ? ' and ' + numberToWords(num % 100) : '');
    if (num < 100000) return numberToWords(Math.floor(num / 1000)) + ' Thousand' + (num % 1000 ? ' ' + numberToWords(num % 1000) : '');
    if (num < 10000000) return numberToWords(Math.floor(num / 100000)) + ' Lakh' + (num % 100000 ? ' ' + numberToWords(num % 100000) : '');
    return numberToWords(Math.floor(num / 10000000)) + ' Crore' + (num % 10000000 ? ' ' + numberToWords(num % 10000000) : '');
  };

  const amountInWords = `${numberToWords(Math.floor(finalTotal))} Rupees Only`;

  // Get status badge
  const getStatusBadge = () => {
    if (isPaid) {
      return { text: 'PAID', color: '#10b981', bg: '#d1fae5' };
    } else if (isPartiallyPaid) {
      return { text: 'PARTIALLY PAID', color: '#f59e0b', bg: '#fef3c7' };
    } else if (billData?.is_overdue) {
      return { text: 'OVERDUE', color: '#ef4444', bg: '#fee2e2' };
    } else {
      return { text: 'UNPAID', color: '#6b7280', bg: '#f3f4f6' };
    }
  };

  const statusBadge = getStatusBadge();

  // Format date
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className={styles.advancedCommercialInvoice}>
      <div className={styles.invoiceContainer}>
        {/* Header Section - Zoho Style */}
        <div className={styles.invoiceHeader}>
          <div className={styles.headerLeft}>
            {(billData?.organisationItems?.logo_url || userItem?.organisationItems?.logo_url) && (
              <div className={styles.companyLogo}>
                <img 
                  src={billData?.organisationItems?.logo_url || userItem?.organisationItems?.logo_url} 
                  alt="Logo" 
                />
              </div>
            )}
            <div className={styles.companyInfo}>
              <h1 className={styles.companyName}>
                {billData?.organisationItems?.org_name || userItem?.organisationItems?.org_name || 'Company Name'}
              </h1>
              <p className={styles.companyDetails}>
                {billData?.branchItems?.address1 || billData?.organisationItems?.address1 || userItem?.branchItems?.address1 || userItem?.organisationItems?.address1 || ''}
                {(billData?.branchItems?.city || userItem?.branchItems?.city) && `, ${billData?.branchItems?.city || userItem?.branchItems?.city}`}
                {(billData?.branchItems?.state || userItem?.branchItems?.state) && `, ${billData?.branchItems?.state || userItem?.branchItems?.state}`}
                {(billData?.branchItems?.pincode || userItem?.branchItems?.pincode) && ` ${billData?.branchItems?.pincode || userItem?.branchItems?.pincode}`}
              </p>
              <p className={styles.companyDetails}>
                <strong>GSTIN:</strong> {billData?.organisationItems?.gst_number || userItem?.organisationItems?.gst_number || 'N/A'}
              </p>
            </div>
          </div>
          <div className={styles.headerRight}>
            <h2 className={styles.invoiceTitle}>TAX INVOICE</h2>
          </div>
        </div>

        <div className={styles.dividerLine}></div>

        {/* Invoice Details Section */}
        <div className={styles.invoiceDetailsSection}>
          <div className={styles.detailsGrid}>
            <div className={styles.detailRow}>
              <span className={styles.label}>Invoice #</span>
              <span className={styles.value}>{billData?.invoice_no || '0001'}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.label}>Invoice Date</span>
              <span className={styles.value}>{formatDate(billData?.date)}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.label}>Terms</span>
              <span className={styles.value}>{billData?.payment_terms || 'Due on Receipt'}</span>
            </div>
            <div className={styles.detailRow}>
              <span className={styles.label}>Due Date</span>
              <span className={styles.value}>{formatDate(billData?.due_date)}</span>
            </div>
          </div>
          <div className={styles.placeOfSupply}>
            <span className={styles.label}>Place Of Supply</span>
            <span className={styles.value}>{billData?.place_of_supply || billData?.branchItems?.state || 'N/A'}</span>
          </div>
        </div>

        {/* Bill To Section - Zoho Style */}
        <div className={styles.billToSection}>
          <h3 className={styles.sectionHeading}>Bill To</h3>
          <p className={styles.customerName}>{billData?.customerName || 'Customer Name'}</p>
          {billData?.customerAddress && (
            <p className={styles.customerInfo}>{billData.customerAddress}</p>
          )}
          {(billData?.customerCity || billData?.customerState || billData?.customerPincode) && (
            <p className={styles.customerInfo}>
              {[billData?.customerCity, billData?.customerState, billData?.customerPincode].filter(Boolean).join(', ')}
            </p>
          )}
          {billData?.customer_gstin && (
            <p className={styles.customerInfo}><strong>GSTIN:</strong> {billData.customer_gstin}</p>
          )}
        </div>

        {/* Items Table - Zoho Style */}
        <div className={styles.itemsSection}>
          <table className={styles.itemsTable}>
            <thead>
              <tr>
                <th className={styles.colSr}>Sr.</th>
                <th className={styles.colItem}>Item Description</th>
                <th className={styles.colHsn}>HSN/SAC</th>
                <th className={styles.colQty}>Qty</th>
                <th className={styles.colPrice}>Price</th>
                <th className={styles.colDiscount}>Discount</th>
                <th className={styles.colTax}>Tax %</th>
                <th className={styles.colAmount}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(billData?.items) && billData.items.length > 0 ? (
                billData.items.map((item: any, idx: number) => {
                  const itemQty = Number(item?.qty || item?.quantity || 0);
                  const itemPrice = Number(item?.price || 0);
                  const itemDiscount = Number(item?.discount || 0);
                  const itemTax = Number(item?.tax_percentage || 0);
                  const valueOfGoods = itemQty * itemPrice;

                  return (
                    <tr key={idx}>
                      <td className={styles.colSr}>{idx + 1}</td>
                      <td className={styles.colItem}>
                        <div className={styles.itemName}>{String(item?.name || item?.product_name || 'Item')}</div>
                        {item?.description && (
                          <div className={styles.itemDescription}>{item.description}</div>
                        )}
                      </td>
                      <td className={styles.colHsn}>{item?.hsn_code || item?.hsn_sac || '-'}</td>
                      <td className={styles.colQty}>{itemQty}</td>
                      <td className={styles.colPrice}>{itemPrice.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                      <td className={styles.colDiscount}>{itemDiscount.toFixed(2)}</td>
                      <td className={styles.colTax}>{itemTax.toFixed(2)}%</td>
                      <td className={styles.colAmount}>{valueOfGoods.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className={styles.noItems}>No items added</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Summary Section - Zoho Style */}
        <div className={styles.summarySection}>
          <div className={styles.summaryLeft}>
            {/* Total in Words */}
            <div className={styles.totalInWords}>
              <h4 className={styles.sectionHeading}>Total In Words</h4>
              <p className={styles.amountWords}>Indian Rupee {amountInWords}</p>
            </div>

            {/* Notes */}
            {(settings?.invoice_footer || billData?.notes) && (
              <div className={styles.notesSection}>
                <h4 className={styles.sectionHeading}>Notes</h4>
                <p className={styles.notesText}>{billData?.notes || settings?.invoice_footer || 'Thank you for your business.'}</p>
              </div>
            )}

            {/* Bank Details */}
            {(settings?.bank_name || settings?.account_number) && (
              <div className={styles.bankDetailsSection}>
                <h4 className={styles.sectionHeading}>Our Bank Account Details</h4>
                <div className={styles.bankDetails}>
                  {settings?.account_holder_name && (
                    <p><strong>Current Account Name:</strong> {settings.account_holder_name}</p>
                  )}
                  {settings?.bank_name && (
                    <p><strong>Bank:</strong> {settings.bank_name}</p>
                  )}
                  {settings?.branch_name && (
                    <p><strong>Branch:</strong> {settings.branch_name}</p>
                  )}
                  {settings?.account_number && (
                    <p><strong>A/c Number:</strong> {settings.account_number}</p>
                  )}
                  {settings?.ifsc_code && (
                    <p><strong>IFSC:</strong> {settings.ifsc_code}</p>
                  )}
                  {settings?.upi_id && (
                    <p><strong>UPI ID:</strong> {settings.upi_id}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className={styles.summaryRight}>
            <div className={styles.totalsSummary}>
              <div className={styles.totalRow}>
                <span className={styles.label}>Value of Goods</span>
                <span className={styles.value}>{itemsSubtotal.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
              </div>
              
              {cgst > 0 && (
                <div className={styles.totalRow}>
                  <span className={styles.label}>CGST{!isGstInclusive ? '' : ' (Incl)'}</span>
                  <span className={styles.value}>{cgst.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                </div>
              )}
              
              {sgst > 0 && (
                <div className={styles.totalRow}>
                  <span className={styles.label}>SGST{!isGstInclusive ? '' : ' (Incl)'}</span>
                  <span className={styles.value}>{sgst.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                </div>
              )}

              {igst > 0 && (
                <div className={styles.totalRow}>
                  <span className={styles.label}>IGST{!isGstInclusive ? '' : ' (Incl)'}</span>
                  <span className={styles.value}>{igst.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                </div>
              )}

              <div className={styles.totalRow}>
                <span className={styles.label}>Subtotal</span>
                <span className={styles.value}>₹{subtotalAfterDiscount.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
              </div>

              <div className={styles.totalRow}>
                <span className={styles.label}>Rounding</span>
                <span className={styles.value}>0.00</span>
              </div>

              <div className={`${styles.totalRow} ${styles.grandTotal}`}>
                <span className={styles.label}>Total</span>
                <span className={styles.value}>₹{finalTotal.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
              </div>

              <div className={`${styles.totalRow} ${styles.balanceDue}`}>
                <span className={styles.label}>Balance Due</span>
                <span className={styles.value}>₹{balanceDue.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Authorized Signature - Zoho Style */}
        <div className={styles.signatureSection}>
          <div className={styles.signatureLine}></div>
          <p className={styles.signatureLabel}>Authorized Signature</p>
          <p className={styles.signatureLabel} style={{ fontSize: '11px', marginTop: '4px', color: '#666' }}>
            For {billData?.organisationItems?.org_name || userItem?.organisationItems?.org_name || 'Company Name'}
          </p>
        </div>

        {/* Footer Branding */}
        <div className={styles.invoiceFooter}>
          <p className={styles.footerBranding}>Powered by <strong>Subriva Billing</strong></p>
          <p className={styles.footerLink}>Professional invoicing made easy</p>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalTaxInvoiceTemplate;

