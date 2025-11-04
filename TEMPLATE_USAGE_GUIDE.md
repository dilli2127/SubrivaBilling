# Template Settings Usage Guide

## Overview
Your billing system now has separate **Bill Templates** and **Invoice Templates** that can be configured in Settings.

## Architecture

### 1. Template Registry (`src/pages/RetaillBill/templates/registry.ts`)
```typescript
// Bill Templates - For Quick Sales / Retail / POS
billTemplates = {
  classic: { label: 'Classic Bill', component: ClassicBillingTemplate },
  modern: { label: 'Modern Bill', component: ModernBillingTemplate }
}

// Invoice Templates - For Formal Invoices
invoiceTemplates = {
  classic: { label: 'Classic Invoice', component: ClassicBillingTemplate },
  modern: { label: 'Modern Invoice', component: ModernBillingTemplate }
}
```

### 2. Settings Page
Users can select templates in: **Settings → Templates Tab**
- **Bill Template**: Used for quick retail sales/POS
- **Invoice Template**: Used for formal invoices

Templates are saved to the **Settings table** with fields:
- `bill_template` (default: 'classic')
- `invoice_template` (default: 'classic')

### 3. Using Templates in Your Billing Page

#### Method 1: Using the Hook (Recommended)

```typescript
import { useTemplateSettings } from '../hooks/useTemplateSettings';

const BillingPage = () => {
  const { 
    BillTemplateComponent,      // Component for bills
    InvoiceTemplateComponent,   // Component for invoices
    billTemplateKey,            // Selected key: 'classic' | 'modern'
    invoiceTemplateKey,         // Selected key: 'classic' | 'modern'
    isLoading                   // Loading state
  } = useTemplateSettings();

  const billData = {
    customerName: 'John Doe',
    invoice_no: 'INV-001',
    items: [...],
    total: 350
  };

  // For printing bills (retail/POS)
  const printBill = () => {
    return <BillTemplateComponent billData={billData} />;
  };

  // For printing invoices (formal)
  const printInvoice = () => {
    return <InvoiceTemplateComponent billData={billData} />;
  };
};
```

#### Method 2: Direct Import (If you need more control)

```typescript
import { getBillTemplate, getInvoiceTemplate } from '../pages/RetaillBill/templates/registry';

// Get template from settings
const billTemplate = settings.bill_template || 'classic';
const BillComponent = getBillTemplate(billTemplate);

// Render
<BillComponent billData={billData} />
```

## Example: Complete Billing Page Integration

```typescript
import React from 'react';
import { useTemplateSettings } from '../hooks/useTemplateSettings';
import { Button } from 'antd';

const BillingPage = () => {
  const { 
    BillTemplateComponent,
    InvoiceTemplateComponent,
    isLoading
  } = useTemplateSettings();

  const [billData, setBillData] = useState({
    customerName: 'John Doe',
    invoice_no: 'INV-001',
    date: new Date().toISOString(),
    items: [],
    total: 0
  });

  const handlePrintBill = () => {
    // Open print dialog with bill template
    const printContent = <BillTemplateComponent billData={billData} />;
    // ... your print logic
  };

  const handlePrintInvoice = () => {
    // Open print dialog with invoice template
    const printContent = <InvoiceTemplateComponent billData={billData} />;
    // ... your print logic
  };

  return (
    <div>
      {/* Your billing form */}
      
      <Button onClick={handlePrintBill}>
        Print Bill (Retail)
      </Button>
      
      <Button onClick={handlePrintInvoice}>
        Print Invoice (Formal)
      </Button>

      {/* Preview */}
      <div style={{ marginTop: 20 }}>
        <h3>Bill Preview</h3>
        <BillTemplateComponent billData={billData} />
      </div>
    </div>
  );
};
```

## Data Flow

```
1. User goes to Settings → Templates
2. Selects "Classic Bill" and "Modern Invoice"
3. Saves to Settings table

4. In Billing Page:
   - useTemplateSettings() loads settings
   - Gets selected templates (Classic for bills, Modern for invoices)
   - Returns template components ready to use

5. When printing:
   - For quick retail sale → Use BillTemplateComponent
   - For formal invoice → Use InvoiceTemplateComponent
```

## Adding New Templates

1. Create template component in `src/pages/RetaillBill/templates/`
```typescript
// NewTemplate.tsx
export const NewTemplate = ({ billData }) => {
  return <div>Your template design</div>;
};
```

2. Register in `registry.ts`
```typescript
import NewTemplate from './NewTemplate';

export const billTemplates = {
  classic: { ... },
  modern: { ... },
  new: {
    label: 'New Template',
    component: NewTemplate,
    description: 'Description here'
  }
};
```

3. It will automatically appear in Settings page!

## Benefits

✅ **Centralized Management** - All template selection in one place
✅ **User Preference** - Each organisation can choose their templates
✅ **Easy to Use** - Just call `useTemplateSettings()` hook
✅ **Extensible** - Add new templates easily
✅ **Type Safe** - Full TypeScript support

