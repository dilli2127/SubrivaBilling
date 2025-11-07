import React, { useEffect, useState } from 'react';
import { formatBillToUPIParams, generateUPIQRCode } from '../../../../helpers/upiPayment';

interface PaymentQRCodeProps {
  billData: any;
  settings: any;
  size?: number;
  position?: 'bottom-left' | 'bottom-right' | 'top-right' | 'footer';
  showUpiId?: boolean;
  style?: React.CSSProperties;
}

/**
 * PaymentQRCode Component
 * Displays UPI payment QR code on bills and invoices
 */
const PaymentQRCode: React.FC<PaymentQRCodeProps> = ({
  billData,
  settings,
  size = 150,
  position = 'bottom-right',
  showUpiId = true,
  style,
}) => {
  const [qrCode, setQrCode] = useState<string>('');

  useEffect(() => {
    const generateQR = async () => {
      try {
        // Check if payment QR is enabled
        if (!settings?.enable_payment_qr) {
          return;
        }

        // Get UPI parameters from bill data and settings
        const upiParams = formatBillToUPIParams(billData, settings);
        
        if (!upiParams) {
          console.warn('Invalid UPI configuration');
          return;
        }

        // Generate QR code
        const qrCodeDataUrl = await generateUPIQRCode(upiParams, {
          width: size,
          margin: 1,
          errorCorrectionLevel: 'M',
        });

        setQrCode(qrCodeDataUrl);
      } catch (error) {
        console.error('Error generating payment QR code:', error);
      }
    };

    generateQR();
  }, [billData, settings, size]);

  // Don't render if QR code generation failed or payment QR is disabled
  if (!qrCode || !settings?.enable_payment_qr) {
    return null;
  }

  // Position-based styling
  const getPositionStyle = (): React.CSSProperties => {
    const baseStyle: React.CSSProperties = {
      position: 'absolute' as const,
    };

    switch (position) {
      case 'bottom-right':
        return { ...baseStyle, bottom: 20, right: 20 };
      case 'bottom-left':
        return { ...baseStyle, bottom: 20, left: 20 };
      case 'top-right':
        return { ...baseStyle, top: 20, right: 20 };
      case 'footer':
        return { position: 'relative' as const, margin: '20px auto', textAlign: 'center' as const };
      default:
        return baseStyle;
    }
  };

  return (
    <div
      style={{
        ...getPositionStyle(),
        padding: 12,
        background: '#fff',
        border: '2px solid #000',
        borderRadius: 8,
        textAlign: 'center',
        ...style,
      }}
    >
      <div style={{ fontSize: 11, fontWeight: 'bold', marginBottom: 6 }}>
        Scan & Pay
      </div>
      <img
        src={qrCode}
        alt="Payment QR Code"
        style={{
          display: 'block',
          width: size,
          height: size,
          margin: '0 auto',
        }}
      />
      {showUpiId && settings?.upi_id && (
        <div style={{ fontSize: 9, marginTop: 6, color: '#333' }}>
          UPI: {settings.upi_id}
        </div>
      )}
      <div style={{ fontSize: 8, marginTop: 4, color: '#666' }}>
        Google Pay • PhonePe • Paytm
      </div>
    </div>
  );
};

export default PaymentQRCode;

