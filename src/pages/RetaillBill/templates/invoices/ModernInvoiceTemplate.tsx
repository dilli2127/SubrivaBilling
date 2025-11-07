import React from 'react';
import { useUser } from '../../../../components/antd/UserContext';
import PaymentQRCode from '../components/PaymentQRCode';

interface ModernInvoiceTemplateProps {
  billData: any;
  settings?: any; // Settings passed as prop to avoid Redux context issues during server-side rendering
}

/**
 * Modern Invoice Template - For Formal Invoices
 * Contemporary professional design with enhanced branding
 */
const ModernInvoiceTemplate: React.FC<ModernInvoiceTemplateProps> = ({
  billData,
  settings,
}) => {
  const userItem = useUser();

  // Ensure billData exists
  if (!billData) {
    return <div>No data to display</div>;
  }

  // Check if GST is inclusive or exclusive
  const isGstInclusive = billData?.is_gst_included ?? true;

  // Use backend calculated values (correct calculations)
  const valueOfGoods = Number(billData?.value_of_goods || 0);
  const cgst = Number(billData?.cgst || (billData?.total_gst || 0) / 2);
  const sgst = Number(billData?.sgst || (billData?.total_gst || 0) / 2);
  const totalGst = cgst + sgst;
  const grandTotal = Number(billData?.total_amount || billData?.total || 0);
  const displaySubtotal = grandTotal;

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
          padding: '20px 16px',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: 28,
                fontWeight: 'bold',
                letterSpacing: 1,
              }}
            >
              {billData?.organisationItems?.org_name ||
                userItem?.organisationItems?.org_name ||
                ''}
            </h1>
            <p style={{ margin: '8px 0 4px 0', fontSize: 14, opacity: 0.9 }}>
              {billData?.branchItems?.branch_name ||
                userItem?.branchItems?.branch_name ||
                ''}
            </p>
            <p style={{ margin: '4px 0', fontSize: 13, opacity: 0.85 }}>
              {billData?.branchItems?.address1 ||
                billData?.organisationItems?.address1 ||
                userItem?.branchItems?.address1 ||
                userItem?.organisationItems?.address1 ||
                ''}
            </p>
            <p style={{ margin: '4px 0', fontSize: 13, opacity: 0.85 }}>
              {(billData?.branchItems?.city || userItem?.branchItems?.city) &&
              (billData?.branchItems?.state || userItem?.branchItems?.state)
                ? `${billData?.branchItems?.city || userItem?.branchItems?.city}, ${billData?.branchItems?.state || userItem?.branchItems?.state}`
                : ''}
            </p>
            <p style={{ margin: '4px 0', fontSize: 13, opacity: 0.85 }}>
              <strong>Mobile:</strong>{' '}
              {billData?.organisationItems?.phone ||
                userItem?.organisationItems?.phone ||
                ''}{' '}
              |<strong> Email:</strong>{' '}
              {billData?.organisationItems?.email ||
                userItem?.organisationItems?.email ||
                ''}
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <h2 style={{ margin: 0, fontSize: 36, fontWeight: 'bold' }}>
              INVOICE
            </h2>
            <p style={{ margin: '8px 0 0 0', fontSize: 13, opacity: 0.9 }}>
              GSTIN:{' '}
              {billData?.organisationItems?.gst_number ||
                userItem?.organisationItems?.gst_number ||
                ''}
            </p>
            <p style={{ margin: '4px 0 0 0', fontSize: 13, opacity: 0.9 }}>
              PAN:{' '}
              {billData?.organisationItems?.pan_number ||
                userItem?.organisationItems?.pan_number ||
                ''}
            </p>
            <p
              style={{
                margin: '12px 0 0 0',
                fontSize: 11,
                padding: '6px 12px',
                background: isGstInclusive ? '#fff3cd' : '#d1ecf1',
                color: isGstInclusive ? '#856404' : '#0c5460',
                border: `1px solid ${isGstInclusive ? '#ffc107' : '#17a2b8'}`,
                borderRadius: 4,
                display: 'inline-block',
                fontWeight: 'bold',
              }}
            >
              {isGstInclusive ? '⚠️ Tax Inclusive' : 'ℹ️ Tax Exclusive'}
            </p>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div style={{ padding: '20px 16px' }}>
        {/* Invoice Info & Customer */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: 32,
          }}
        >
          {/* Bill To */}
          <div style={{ width: '48%' }}>
            <div
              style={{
                background: '#f8f9fa',
                padding: 16,
                borderRadius: 8,
                border: '1px solid #e9ecef',
              }}
            >
              <h3
                style={{
                  margin: '0 0 12px 0',
                  fontSize: 12,
                  fontWeight: 'bold',
                  color: '#667eea',
                  textTransform: 'uppercase',
                  letterSpacing: 1,
                }}
              >
                Bill To
              </h3>
              <p
                style={{
                  margin: '4px 0',
                  fontSize: 16,
                  fontWeight: 'bold',
                  color: '#333',
                }}
              >
                {billData?.customerName || ''}
              </p>
              {billData?.customerAddress && (
                <p
                  style={{ margin: '8px 0 4px 0', fontSize: 14, color: '#666' }}
                >
                  {billData.customerAddress}
                </p>
              )}
              {(billData?.customerCity ||
                billData?.customerState ||
                billData?.customerPincode) && (
                <p style={{ margin: '4px 0', fontSize: 13, color: '#666' }}>
                  {[
                    billData?.customerCity,
                    billData?.customerState,
                    billData?.customerPincode,
                  ]
                    .filter(Boolean)
                    .join(', ')}
                </p>
              )}
              {billData?.customer_gstin && (
                <p style={{ margin: '4px 0', fontSize: 13, color: '#666' }}>
                  GSTIN: {billData.customer_gstin}
                </p>
              )}
              {billData?.customer_pan && (
                <p style={{ margin: '4px 0', fontSize: 13, color: '#666' }}>
                  PAN: {billData.customer_pan}
                </p>
              )}
              {billData?.customerPhone && (
                <p style={{ margin: '4px 0', fontSize: 13, color: '#666' }}>
                  Phone: {billData.customerPhone}
                </p>
              )}
              {billData?.customerEmail && (
                <p style={{ margin: '4px 0', fontSize: 13, color: '#666' }}>
                  Email: {billData.customerEmail}
                </p>
              )}
            </div>
          </div>

          {/* Invoice Details */}
          <div style={{ width: '48%' }}>
            <div
              style={{
                background: '#f8f9fa',
                padding: 16,
                borderRadius: 8,
                border: '1px solid #e9ecef',
              }}
            >
              <table style={{ width: '100%', fontSize: 14 }}>
                <tbody>
                  <tr>
                    <td
                      style={{
                        padding: '8px 0',
                        color: '#666',
                        fontWeight: '500',
                      }}
                    >
                      Invoice Number:
                    </td>
                    <td
                      style={{
                        padding: '8px 0',
                        textAlign: 'right',
                        fontWeight: 'bold',
                        color: '#333',
                      }}
                    >
                      {billData?.invoice_no || '-'}
                    </td>
                  </tr>
                  <tr>
                    <td
                      style={{
                        padding: '8px 0',
                        color: '#666',
                        fontWeight: '500',
                      }}
                    >
                      Invoice Date:
                    </td>
                    <td
                      style={{
                        padding: '8px 0',
                        textAlign: 'right',
                        fontWeight: 'bold',
                        color: '#333',
                      }}
                    >
                      {billData?.date
                        ? new Date(billData.date).toLocaleDateString()
                        : '-'}
                    </td>
                  </tr>
                  <tr>
                    <td
                      style={{
                        padding: '8px 0',
                        color: '#666',
                        fontWeight: '500',
                      }}
                    >
                      Payment Mode:
                    </td>
                    <td
                      style={{
                        padding: '8px 0',
                        textAlign: 'right',
                        fontWeight: 'bold',
                        color: '#333',
                      }}
                    >
                      {billData?.payment_mode || 'Cash'}
                    </td>
                  </tr>
                  <tr>
                    <td
                      style={{
                        padding: '8px 0',
                        color: '#666',
                        fontWeight: '500',
                      }}
                    >
                      Status:
                    </td>
                    <td style={{ padding: '8px 0', textAlign: 'right' }}>
                      <span
                        style={{
                          background: '#d4edda',
                          color: '#155724',
                          padding: '4px 12px',
                          borderRadius: 4,
                          fontSize: 12,
                          fontWeight: 'bold',
                        }}
                      >
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
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            marginBottom: 15,
            tableLayout: 'fixed',
          }}
        >
          <thead>
            <tr
              style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: '#fff',
              }}
            >
              <th
                style={{
                  ...modernThStyle,
                  borderTopLeftRadius: 8,
                  width: '3%',
                }}
              >
                Sr.
              </th>
              <th style={{ ...modernThStyle, textAlign: 'left', width: '24%' }}>
                Item Description
              </th>
              <th style={{ ...modernThStyle, width: '7%' }}>HSN/SAC</th>
              <th style={{ ...modernThStyle, width: '5%' }}>Qty</th>
              <th style={{ ...modernThStyle, width: '8%' }}>Price</th>
              <th style={{ ...modernThStyle, width: '7%' }}>Discount</th>
              <th style={{ ...modernThStyle, width: '7%' }}>CGST %</th>
              <th style={{ ...modernThStyle, width: '9%' }}>CGST Amt</th>
              <th style={{ ...modernThStyle, width: '7%' }}>SGST %</th>
              <th style={{ ...modernThStyle, width: '9%' }}>SGST Amt</th>
              <th
                style={{
                  ...modernThStyle,
                  borderTopRightRadius: 8,
                  width: '11%',
                }}
              >
                Amount
              </th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(billData?.items) && billData.items.length > 0 ? (
              billData.items.map((item: any, idx: number) => {
                const qty = Number(item?.qty || item?.quantity || 0);
                const price = Number(item?.price || 0);
                const discount = Number(item?.discount || 0);
                const taxPercentage = Number(item?.tax_percentage || 0);

                // Calculate CGST and SGST (split tax equally)
                const cgstPercent = taxPercentage / 2;
                const sgstPercent = taxPercentage / 2;

                const itemSubtotal = qty * price;

                // If GST is inclusive, extract GST from the amount
                // If GST is exclusive, calculate GST on top
                let cgstAmount = 0;
                let sgstAmount = 0;

                if (isGstInclusive) {
                  // GST is included in price - extract it
                  const gstFactor = (100 + taxPercentage) / 100;
                  const priceWithoutGst = itemSubtotal / gstFactor;
                  const totalGstAmount = itemSubtotal - priceWithoutGst;
                  cgstAmount = totalGstAmount / 2;
                  sgstAmount = totalGstAmount / 2;
                } else {
                  // GST is excluded - calculate on top
                  cgstAmount = (itemSubtotal * cgstPercent) / 100;
                  sgstAmount = (itemSubtotal * sgstPercent) / 100;
                }

                // Amount includes GST (base + CGST + SGST)
                const finalAmount = itemSubtotal + cgstAmount + sgstAmount;

                return (
                  <tr
                    key={idx}
                    style={{
                      background: idx % 2 === 0 ? '#fff' : '#f8f9fa',
                      transition: 'background 0.2s',
                    }}
                  >
                    <td style={modernTdStyle}>{idx + 1}</td>
                    <td
                      style={{
                        ...modernTdStyle,
                        textAlign: 'left',
                        fontWeight: '500',
                      }}
                    >
                      {String(item?.name || item?.product_name || 'Item')}
                    </td>
                    <td style={modernTdStyle}>
                      {item?.hsn_code || item?.hsn_sac || '-'}
                    </td>
                    <td style={modernTdStyle}>{qty}</td>
                    <td style={modernTdStyle}>₹{price.toFixed(2)}</td>
                    <td style={modernTdStyle}>{discount.toFixed(2)}</td>
                    <td style={modernTdStyle}>{cgstPercent.toFixed(2)}%</td>
                    <td style={modernTdStyle}>₹{cgstAmount.toFixed(2)}</td>
                    <td style={modernTdStyle}>{sgstPercent.toFixed(2)}%</td>
                    <td style={modernTdStyle}>₹{sgstAmount.toFixed(2)}</td>
                    <td style={{ ...modernTdStyle, fontWeight: 'bold' }}>
                      ₹{finalAmount.toFixed(2)}
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={11}
                  style={{ ...modernTdStyle, textAlign: 'center' }}
                >
                  No items
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Totals */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            marginBottom: 15,
          }}
        >
          <div style={{ width: '350px' }}>
            <div
              style={{
                background: '#f8f9fa',
                padding: '10px 10px',
                borderRadius: 8,
                border: '1px solid #e9ecef',
              }}
            >
              <table style={{ width: '100%', fontSize: 11 }}>
                <tbody>
                  <tr>
                    <td style={{ padding: '8px 0', color: '#666' }}>
                      Value of Goods:
                    </td>
                    <td
                      style={{
                        padding: '8px 0',
                        textAlign: 'right',
                        fontWeight: '500',
                      }}
                    >
                      ₹{valueOfGoods.toFixed(2)}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px 0', color: '#666' }}>
                      {isGstInclusive ? 'CGST (Incl):' : 'CGST:'}
                    </td>
                    <td
                      style={{
                        padding: '8px 0',
                        textAlign: 'right',
                        fontWeight: '500',
                      }}
                    >
                      ₹{cgst.toFixed(2)}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px 0', color: '#666' }}>
                      {isGstInclusive ? 'SGST (Incl):' : 'SGST:'}
                    </td>
                    <td
                      style={{
                        padding: '8px 0',
                        textAlign: 'right',
                        fontWeight: '500',
                      }}
                    >
                      ₹{sgst.toFixed(2)}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '8px 0', color: '#666' }}>
                      Subtotal:
                    </td>
                    <td
                      style={{
                        padding: '8px 0',
                        textAlign: 'right',
                        fontWeight: '500',
                      }}
                    >
                      ₹{displaySubtotal.toFixed(2)}
                    </td>
                  </tr>
                  <tr style={{ borderTop: '2px solid #667eea' }}>
                    <td
                      style={{
                        padding: '12px 0 0 0',
                        fontSize: 15,
                        fontWeight: 'bold',
                        color: '#333',
                      }}
                    >
                      Grand Total:
                    </td>
                    <td
                      style={{
                        padding: '12px 0 0 0',
                        textAlign: 'right',
                        fontSize: 15,
                        fontWeight: 'bold',
                        color: '#667eea',
                      }}
                    >
                      ₹{grandTotal.toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Settlement Details */}
        <div
          style={{
            fontSize: 14,
            textAlign: 'right',
            padding: '12px 24px',
            background: '#f8f9fa',
            borderRadius: 8,
          }}
        >
          <strong style={{ color: '#667eea' }}>Settlement Details:</strong>{' '}
          <span style={{ color: '#333' }}>
            {(() => {
              const isPaid = billData?.is_paid || false;
              const isPartiallyPaid = billData?.is_partially_paid || false;
              const paidAmount = Number(billData?.paid_amount || 0);
              const pendingAmount = grandTotal - paidAmount;

              if (!isPaid && !isPartiallyPaid) {
                // Unpaid invoice - show full balance
                return `Invoice Balance: ₹${grandTotal.toFixed(2)}`;
              } else if (isPartiallyPaid && !isPaid) {
                // Partially paid - show paid and pending amounts
                return `Paid: ₹${paidAmount.toFixed(2)} | Pending: ₹${pendingAmount.toFixed(2)}`;
              } else {
                // Fully paid - show settlement details
                return `Settled by ${billData?.payment_mode || 'Cash'}: ₹${paidAmount.toFixed(2)} | Balance: ₹0.00`;
              }
            })()}
          </span>
        </div>

        {/* Terms & Signature */}
        <div style={{ borderTop: '2px solid #e9ecef', paddingTop: 24 }}>
          {/* Terms from Settings */}
          {settings?.show_terms_on_invoice && settings?.invoice_terms && (
            <div style={{ marginBottom: 24 }}>
              <h4
                style={{
                  margin: '0 0 12px 0',
                  fontSize: 14,
                  fontWeight: 'bold',
                  color: '#667eea',
                }}
              >
                Terms & Conditions:
              </h4>
              <div
                style={{
                  fontSize: 13,
                  color: '#666',
                  lineHeight: 1.8,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {settings.invoice_terms}
              </div>
            </div>
          )}

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              marginTop: 32,
            }}
          >
            <div>
              <p style={{ margin: 0, fontSize: 12, color: '#999' }}>
                Generated on {new Date().toLocaleDateString()}
              </p>
              {/* Payment QR Code */}
              {settings?.enable_payment_qr && settings?.qr_on_invoice && (
                <div style={{ marginTop: 16 }}>
                  {settings?.qrCodeDataUrl ? (
                    // Render pre-generated QR code (for print/download)
                    <div
                      style={{
                        padding: 8,
                        border: '2px solid #667eea',
                        display: 'inline-block',
                      }}
                    >
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 'bold',
                          marginBottom: 6,
                          textAlign: 'center',
                        }}
                      >
                        Scan & Pay
                      </div>
                      <img
                        src={settings.qrCodeDataUrl}
                        alt="Payment QR Code"
                        style={{
                          display: 'block',
                          width: settings?.qr_size || 150,
                          height: settings?.qr_size || 150,
                        }}
                      />
                      {settings?.show_upi_id_text && settings?.upi_id && (
                        <div
                          style={{
                            fontSize: 9,
                            marginTop: 6,
                            textAlign: 'center',
                          }}
                        >
                          UPI: {settings.upi_id}
                        </div>
                      )}
                    </div>
                  ) : (
                    // Use dynamic component for live view
                    <PaymentQRCode
                      billData={billData}
                      settings={settings}
                      size={settings?.qr_size || 150}
                      position="footer"
                      showUpiId={settings?.show_upi_id_text}
                      style={{
                        position: 'relative',
                        border: '2px solid #667eea',
                        padding: 8,
                      }}
                    />
                  )}
                </div>
              )}
            </div>
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  borderTop: '2px solid #333',
                  paddingTop: 8,
                  width: 200,
                }}
              >
                <p style={{ margin: 0, fontSize: 13, fontWeight: 'bold' }}>
                  Authorized Signature
                </p>
                <p
                  style={{
                    margin: '4px 0 0 0',
                    fontSize: 11,
                    color: '#666',
                    fontWeight: 'normal',
                  }}
                >
                  For{' '}
                  {billData?.organisationItems?.org_name ||
                    userItem?.organisationItems?.org_name ||
                    'Company Name'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer from Settings */}
      <div
        style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: '#fff',
          padding: 16,
          textAlign: 'center',
          fontSize: 12,
        }}
      >
        {settings?.invoice_footer || 'Thank you for your business!'}
      </div>

      {/* Company Branding Footer */}
      <div
        style={{
          padding: '12px 16px',
          textAlign: 'center',
          background: '#f9f9f9',
        }}
      >
        <p style={{ margin: 0, fontSize: 11, color: '#888' }}>
          Powered by{' '}
          <strong style={{ color: '#667eea' }}>Subriva Billing</strong>
        </p>
      </div>
    </div>
  );
};

const modernThStyle = {
  padding: '6px 4px',
  textAlign: 'center' as const,
  fontSize: 10,
  fontWeight: 'bold' as const,
  whiteSpace: 'nowrap' as const,
};

const modernTdStyle = {
  padding: '6px 4px',
  textAlign: 'center' as const,
  fontSize: 10,
  borderBottom: '1px solid #e9ecef',
  wordWrap: 'break-word' as const,
};

export default ModernInvoiceTemplate;
