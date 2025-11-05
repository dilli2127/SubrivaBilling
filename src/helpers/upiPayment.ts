/**
 * UPI Payment Utility
 * Generates UPI payment URLs and QR codes for Indian payment apps
 * Supports Google Pay, PhonePe, Paytm, and all UPI-enabled apps
 */

import QRCode from 'qrcode';

/**
 * UPI Payment Parameters
 */
export interface UPIPaymentParams {
  /** UPI ID of the payee (e.g., 1234567890@ybl) */
  upiId: string;
  /** Payee name */
  payeeName: string;
  /** Transaction amount in INR */
  amount?: number;
  /** Transaction note/description */
  transactionNote?: string;
  /** Transaction reference ID */
  transactionRef?: string;
  /** Merchant code (optional) */
  merchantCode?: string;
}

/**
 * Generates a UPI payment URL following the UPI deep linking specification
 * Format: upi://pay?pa=<UPI_ID>&pn=<NAME>&am=<AMOUNT>&tn=<NOTE>&tr=<REF>
 * 
 * @param params - UPI payment parameters
 * @returns UPI payment URL string
 */
export const generateUPIUrl = (params: UPIPaymentParams): string => {
  const {
    upiId,
    payeeName,
    amount,
    transactionNote,
    transactionRef,
    merchantCode
  } = params;

  // Validate UPI ID format
  if (!upiId || !upiId.includes('@')) {
    throw new Error('Invalid UPI ID format. Must contain @ symbol');
  }

  // Build UPI URL with required and optional parameters
  const urlParams = new URLSearchParams();
  
  // Required parameters
  urlParams.append('pa', upiId); // Payee Address (UPI ID)
  urlParams.append('pn', payeeName); // Payee Name
  
  // Amount - ALWAYS include if provided
  if (amount !== undefined && amount !== null) {
    const amountStr = Number(amount).toFixed(2);
    urlParams.append('am', amountStr); // Amount
  }
  
  if (transactionNote) {
    urlParams.append('tn', transactionNote); // Transaction Note
  }
  
  if (transactionRef) {
    urlParams.append('tr', transactionRef); // Transaction Reference
  }
  
  if (merchantCode) {
    urlParams.append('mc', merchantCode); // Merchant Code
  }
  
  // Currency (INR for Indian Rupees)
  urlParams.append('cu', 'INR');

  return `upi://pay?${urlParams.toString()}`;
};

/**
 * Generates a QR code as a Base64 data URL for UPI payment
 * 
 * @param params - UPI payment parameters
 * @param options - QR code generation options
 * @returns Promise resolving to Base64 data URL of QR code image
 */
export const generateUPIQRCode = async (
  params: UPIPaymentParams,
  options?: {
    width?: number;
    margin?: number;
    errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
    color?: {
      dark?: string;
      light?: string;
    };
  }
): Promise<string> => {
  const upiUrl = generateUPIUrl(params);
  
  try {
    const qrCodeDataUrl = await QRCode.toDataURL(upiUrl, {
      width: options?.width || 300,
      margin: options?.margin || 2,
      errorCorrectionLevel: options?.errorCorrectionLevel || 'M',
      color: {
        dark: options?.color?.dark || '#000000',
        light: options?.color?.light || '#FFFFFF',
      },
    });
    
    return qrCodeDataUrl;
  } catch (error) {
    console.error('Error generating UPI QR code:', error);
    throw new Error('Failed to generate QR code');
  }
};

/**
 * Generates a QR code as an SVG string for UPI payment
 * SVG is better for printing as it's vector-based
 * 
 * @param params - UPI payment parameters
 * @param options - QR code generation options
 * @returns Promise resolving to SVG string
 */
export const generateUPIQRCodeSVG = async (
  params: UPIPaymentParams,
  options?: {
    width?: number;
    margin?: number;
    errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
    color?: {
      dark?: string;
      light?: string;
    };
  }
): Promise<string> => {
  const upiUrl = generateUPIUrl(params);
  
  try {
    const qrCodeSVG = await QRCode.toString(upiUrl, {
      type: 'svg',
      width: options?.width || 300,
      margin: options?.margin || 2,
      errorCorrectionLevel: options?.errorCorrectionLevel || 'M',
      color: {
        dark: options?.color?.dark || '#000000',
        light: options?.color?.light || '#FFFFFF',
      },
    });
    
    return qrCodeSVG;
  } catch (error) {
    console.error('Error generating UPI QR code SVG:', error);
    throw new Error('Failed to generate QR code SVG');
  }
};

/**
 * Validates if a string is a valid UPI ID
 * UPI ID format: username@bankcode (e.g., 1234567890@ybl)
 * 
 * @param upiId - UPI ID to validate
 * @returns true if valid, false otherwise
 */
export const isValidUPIId = (upiId: string): boolean => {
  if (!upiId || typeof upiId !== 'string') {
    return false;
  }
  
  // UPI ID regex: alphanumeric/dots/hyphens/underscores @ alphanumeric
  const upiRegex = /^[\w.-]+@[a-zA-Z0-9]+$/;
  return upiRegex.test(upiId);
};

/**
 * Gets UPI app information based on UPI handle
 * 
 * @param upiId - UPI ID
 * @returns App information object
 */
export const getUPIAppInfo = (upiId: string): {
  provider: string;
  appName: string;
} => {
  const handle = upiId.split('@')[1];
  
  const providers: { [key: string]: { provider: string; appName: string } } = {
    'ybl': { provider: 'Yes Bank', appName: 'Google Pay / PhonePe / Various' },
    'paytm': { provider: 'Paytm', appName: 'Paytm' },
    'oksbi': { provider: 'SBI', appName: 'BHIM SBI Pay' },
    'okaxis': { provider: 'Axis Bank', appName: 'Axis Pay' },
    'okicici': { provider: 'ICICI Bank', appName: 'iMobile Pay' },
    'okhdfcbank': { provider: 'HDFC Bank', appName: 'HDFC Bank MobileBanking' },
    'axisbank': { provider: 'Axis Bank', appName: 'Axis Mobile' },
    'icici': { provider: 'ICICI Bank', appName: 'Pockets / iMobile' },
  };
  
  return providers[handle] || { provider: 'Unknown', appName: 'UPI App' };
};

/**
 * Formats bill data into UPI payment parameters
 * 
 * @param billData - Bill/Invoice data
 * @param settings - Organization settings with UPI details
 * @returns UPI payment parameters
 */
export const formatBillToUPIParams = (
  billData: any,
  settings: any
): UPIPaymentParams | null => {
  // Check if UPI ID is configured
  const upiId = settings?.upi_id;
  if (!upiId || !isValidUPIId(upiId)) {
    return null;
  }

  // Get organization/business name
  const payeeName = billData?.organisationItems?.org_name || 
                    settings?.organisation_name || 
                    'Business';

  // Get bill amount - check multiple possible field names
  const amount = Number(
    billData?.net_amount || 
    billData?.grand_total || 
    billData?.total || 
    billData?.total_amount ||
    billData?.net_total ||
    billData?.final_amount ||
    billData?.amount ||
    0
  );

  // Generate transaction note
  const billNumber = billData?.bill_number || billData?.invoice_number || '';
  const transactionNote = `Payment for ${billNumber}`;

  // Use bill number as transaction reference
  const transactionRef = billNumber;

  return {
    upiId,
    payeeName,
    amount,
    transactionNote,
    transactionRef,
  };
};

export default {
  generateUPIUrl,
  generateUPIQRCode,
  generateUPIQRCodeSVG,
  isValidUPIId,
  getUPIAppInfo,
  formatBillToUPIParams,
};

