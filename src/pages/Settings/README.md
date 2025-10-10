# Settings Page Documentation

## Overview
Comprehensive settings page for configuring all aspects of the billing application.

## Route
- **Path**: `/settings`
- **Access**: Available to all authenticated users via sidebar menu

## Features Implemented

### 1. **Company Settings Tab** 🏢
- Company logo upload
- Company name
- GSTIN / Tax ID
- Complete address (Street, City, State, Pincode)
- Contact information (Phone, Email, Website)
- Data synced with Organization entity

### 2. **Tax & GST Configuration Tab** 💰
- Enable/Disable tax
- Tax type selection (GST, VAT, Sales Tax)
- CGST, SGST, IGST rate configuration
- Tax inclusive/exclusive pricing toggle
- Real-time tax calculation settings

### 3. **Invoice Settings Tab** 📄
- Invoice prefix customization (e.g., INV, BILL)
- Starting invoice number
- Invoice footer text
- Terms & conditions
- Display options:
  - Show/hide company logo on invoice
  - Show/hide terms & conditions on invoice

### 4. **Thermal Printer Configuration Tab** 🖨️
- Enable/disable thermal printer
- Printer port selection (COM1-3, USB, Bluetooth)
- Baud rate configuration
- Paper width selection (58mm, 80mm)
- Auto-print after bill option
- Test printer functionality

### 5. **Default Values Tab** ✅
- Default payment mode (Cash, UPI, Card, Credit)
- Default customer selection
- Default warehouse selection
- Pre-fills these values in new records

### 6. **Notification Preferences Tab** 🔔
- Email notifications toggle
- SMS notifications toggle
- Low stock alerts with configurable threshold
- Payment reminder notifications
- Daily report email
- Individual notification controls

## API Integration

### Endpoints Used
- `GET /settings/:id` - Load settings
- `PATCH /settings/:id` - Update settings
- `GET /organisations/:id` - Load company info
- `PATCH /organisations/:id` - Update company info
- `GET /customer` - Load customer list for defaults
- `GET /warehouse` - Load warehouse list for defaults

### Data Structure
```typescript
interface Settings {
  // Company Settings
  company_name: string;
  company_address: string;
  company_city: string;
  company_state: string;
  company_pincode: string;
  company_gstin: string;
  company_phone: string;
  company_email: string;
  company_website: string;
  company_logo: string;

  // Tax Settings
  tax_enabled: boolean;
  tax_type: 'GST' | 'VAT' | 'Sales Tax';
  cgst_rate: number;
  sgst_rate: number;
  igst_rate: number;
  tax_inclusive: boolean;

  // Invoice Settings
  invoice_prefix: string;
  invoice_starting_number: number;
  invoice_footer: string;
  show_logo_on_invoice: boolean;
  show_terms_on_invoice: boolean;
  invoice_terms: string;

  // Printer Settings
  thermal_printer_enabled: boolean;
  printer_port: string;
  printer_baud_rate: number;
  paper_width: number;
  auto_print: boolean;

  // Default Values
  default_payment_mode: 'cash' | 'upi' | 'card' | 'credit';
  default_customer_id: string;
  default_warehouse_id: string;

  // Notification Settings
  email_notifications: boolean;
  sms_notifications: boolean;
  low_stock_alert: boolean;
  low_stock_threshold: number;
  payment_reminder: boolean;
  daily_report_email: boolean;
}
```

## UI Features

### Design
- Clean, modern card-based layout
- Tab navigation for organized settings
- Color-coded sections with icons
- Responsive design (mobile-friendly)
- Info boxes with helpful tips
- Form validation

### User Experience
- Real-time form validation
- Save/Reset buttons on each tab
- Loading states during save
- Success/error notifications
- Logo preview after upload
- Keyboard-friendly navigation

### Keyboard Shortcuts
- **Tab**: Navigate between fields
- **Enter**: Submit form (when in text input)
- **Esc**: Close modals/dropdowns

## File Structure
```
src/pages/Settings/
├── index.tsx              # Main Settings component
├── Settings.module.css    # Styles
└── README.md             # This file
```

## Integration Points

### 1. Router Integration
- Added to `src/routes/routerData.tsx`
- Lazy-loaded for better performance
- Protected route (requires authentication)

### 2. Sidebar Menu
- Added to `src/components/antd/sidebar/menu.tsx`
- Accessible between "Reports" and "Master Settings"
- Settings icon (⚙️)

### 3. API Routes
- Added to `src/services/api/utils.ts`
- Uses standard CRUD operations

## Usage

### Accessing Settings
1. Log in to the application
2. Click "Settings" in the sidebar menu
3. Select the tab you want to configure
4. Make your changes
5. Click "Save" button

### Best Practices
1. **Initial Setup**: Configure Company and Tax settings first
2. **Invoice Setup**: Set invoice prefix before creating first bill
3. **Printer Setup**: Test printer before enabling auto-print
4. **Defaults**: Set default values to speed up data entry
5. **Notifications**: Enable low stock alerts for inventory management

## Backend Requirements

Your backend should have these endpoints:
- `GET /settings/:id` - Retrieve settings
- `POST /settings` - Create settings (if not exists)
- `PATCH /settings/:id` - Update settings
- `DELETE /settings/:id` - Delete settings (optional)

## Future Enhancements

Potential additions:
- [ ] Multi-language settings
- [ ] Email template customization
- [ ] SMS template customization
- [ ] Backup schedule configuration
- [ ] Currency settings
- [ ] Date format preferences
- [ ] Number format preferences
- [ ] Business hours configuration
- [ ] Holiday calendar
- [ ] Auto-backup settings

## Testing

### Manual Testing Checklist
- [ ] Company logo upload works
- [ ] All form fields save correctly
- [ ] Form validation prevents invalid data
- [ ] Reset button restores last saved values
- [ ] Tax rate changes reflect in calculations
- [ ] Default values appear in new records
- [ ] Notification toggles work
- [ ] Printer test function works
- [ ] Data persists after page refresh
- [ ] Mobile responsive layout works

## Support
For issues or questions, contact the development team.

