import { FormInstance } from 'antd';

export interface SettingsTabProps {
  form: FormInstance;
  loading: boolean;
  onSave: () => void;
  onReset: () => void;
}

export interface PrinterTabProps extends SettingsTabProps {
  onTestPrinter: () => void;
}

export interface DefaultsTabProps extends SettingsTabProps {
  // No additional props needed after removing customer and warehouse fields
}

export interface SettingsFormData {
  // Tax Settings
  tax_enabled: boolean;
  tax_type: string;
  
  // Invoice Settings
  invoice_prefix: string;
  invoice_starting_number: number;
  invoice_footer: string;
  invoice_terms: string;
  show_logo_on_invoice: boolean;
  show_terms_on_invoice: boolean;
  
  // Printer Settings
  thermal_printer_enabled: boolean;
  printer_port: string;
  printer_baud_rate: number;
  paper_width: number;
  auto_print: boolean;
  
  // Default Values
  default_payment_mode: string;
  
  // Notification Settings
  email_notifications: boolean;
  sms_notifications: boolean;
  low_stock_alert: boolean;
  low_stock_threshold: number;
  payment_reminder: boolean;
  daily_report_email: boolean;
}
