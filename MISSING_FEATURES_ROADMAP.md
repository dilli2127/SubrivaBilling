# 🚀 SubrivaBilling - Missing Features Roadmap

## 📋 Complete List of Potentially Missing Features

This document lists all important features your billing system might be missing, organized by priority and complexity.

---

## ✅ **Already Implemented:**
- ✅ Purchase Orders (PO) System - **COMPLETE!**
- ✅ Stock In/Goods Receipt (Stock Audit)
- ✅ Sales & Invoicing
- ✅ Customer Management
- ✅ Vendor Management
- ✅ Multi-branch Support
- ✅ Reports & Analytics
- ✅ User Roles & Permissions

---

## 🔴 **HIGH PRIORITY - Critical Business Features**

### **1. Sales Returns / Credit Notes** 
**Status:** ❌ Not Implemented  
**Priority:** 🔴 CRITICAL  
**Complexity:** ⭐⭐⭐ (Medium)  
**Timeline:** 2-3 weeks

**What it does:**
- Process customer returns
- Generate credit notes
- Adjust inventory automatically
- Link to original invoice
- Track return reasons
- Partial returns support

**Use Case:**
```
Customer returns damaged product
→ Create sales return
→ Credit note generated
→ Stock quantity increases
→ Customer gets refund/credit
```

**Tables Needed:**
- `sales_returns`
- `sales_return_items`
- `credit_notes`

**Key Features:**
- Return within X days policy
- Refund or store credit options
- Return reasons (damaged, wrong item, etc.)
- Quality inspection
- Link to original sale

---

### **2. Customer Ledger / Account Statement** 
**Status:** ❌ Not Implemented  
**Priority:** 🔴 CRITICAL  
**Complexity:** ⭐⭐⭐⭐ (High)  
**Timeline:** 3-4 weeks

**What it does:**
- Track customer credit/debit balance
- Outstanding balance tracking
- Account statement generation
- Payment history
- Aging analysis (30/60/90 days)
- Credit limit management

**Use Case:**
```
Regular customer buys on credit
→ Invoice: ₹10,000 (Debit)
→ Payment: ₹5,000 (Credit)
→ Outstanding: ₹5,000
→ Generate monthly statement
```

**Tables Needed:**
- `customer_ledger`
- `customer_transactions`
- `credit_limits`

**Key Features:**
- Running balance calculation
- Credit period tracking
- Overdue alerts
- Statement PDF generation
- Payment reminders
- Credit limit warnings

---

### **3. E-way Bill Generation** 
**Status:** ❌ Not Implemented  
**Priority:** 🔴 HIGH (For GST Compliance)  
**Complexity:** ⭐⭐⭐⭐⭐ (Very High)  
**Timeline:** 4-6 weeks

**What it does:**
- Generate e-way bills for goods transportation
- GST portal integration
- E-way bill tracking
- Auto-generation for invoices > ₹50,000

**Use Case:**
```
Invoice > ₹50,000 + Interstate delivery
→ Auto-generate e-way bill
→ Submit to GST portal
→ Get e-way bill number
→ Print on invoice
```

**API Integration:**
- GST e-way bill API
- Authentication with GST portal
- Real-time validation

**Tables Needed:**
- `eway_bills`
- `eway_bill_items`

---

### **4. GST Filing Reports (GSTR-1, GSTR-3B)** 
**Status:** ❌ Not Implemented  
**Priority:** 🔴 HIGH (For Tax Compliance)  
**Complexity:** ⭐⭐⭐⭐⭐ (Very High)  
**Timeline:** 4-6 weeks

**What it does:**
- Generate GSTR-1 report (outward supplies)
- Generate GSTR-3B summary report
- B2B, B2C summary reports
- HSN-wise summary
- Tax liability calculation
- Export to JSON/Excel for GST portal

**Reports Needed:**
- GSTR-1 (Sales details)
- GSTR-3B (Summary return)
- B2B supplies (Business to Business)
- B2C supplies (Business to Consumer)
- HSN summary
- Tax collected vs paid

**Tables Needed:**
- `gst_filings`
- `gst_returns`

---

## 🟡 **MEDIUM PRIORITY - Enhance Workflow**

### **5. Quotations / Estimates / Proforma** 
**Status:** ❌ Not Implemented  
**Priority:** 🟡 MEDIUM  
**Complexity:** ⭐⭐⭐ (Medium)  
**Timeline:** 2-3 weeks

**What it does:**
- Create quotations before billing
- Convert quotes to invoices
- Quote validity tracking
- Quote approval workflow
- Multiple quote versions

**Use Case:**
```
Customer asks for quote
→ Create quotation with items & prices
→ Send to customer
→ Customer approves
→ Convert to invoice (one click!)
→ Bill generated
```

**Tables Needed:**
- `quotations`
- `quotation_items`

**Key Features:**
- Quote validity period
- Convert to invoice
- Revision tracking
- Acceptance status
- PDF generation

---

### **6. Delivery Challan** 
**Status:** ❌ Not Implemented  
**Priority:** 🟡 MEDIUM  
**Complexity:** ⭐⭐ (Low-Medium)  
**Timeline:** 1-2 weeks

**What it does:**
- Goods dispatch without billing
- Convert challan to invoice later
- Track pending invoicing
- Stock movement without sale

**Use Case:**
```
Send goods for demo/approval
→ Create delivery challan
→ Goods dispatched (no invoice yet)
→ Customer approves
→ Convert to invoice
→ Bill created
```

**Tables Needed:**
- `delivery_challans`
- `delivery_challan_items`

---

### **7. Email/SMS Notifications** 
**Status:** ❌ Not Implemented  
**Priority:** 🟡 MEDIUM  
**Complexity:** ⭐⭐⭐ (Medium)  
**Timeline:** 2-3 weeks

**What it does:**
- Send invoices to customers via email
- SMS notifications for payments
- Payment reminders
- Low stock alerts to admins
- Purchase order alerts

**Features Needed:**
- Email templates
- SMS gateway integration
- Automated triggers
- Notification preferences
- Bulk notifications

**Services to Integrate:**
- Email: SendGrid, AWS SES, or SMTP
- SMS: Twilio, MSG91, or similar

**Tables Needed:**
- `notifications`
- `notification_templates`
- `notification_logs`

---

### **8. Low Stock Alerts & Reorder Points** 
**Status:** ❌ Not Implemented  
**Priority:** 🟡 MEDIUM  
**Complexity:** ⭐⭐ (Low-Medium)  
**Timeline:** 1-2 weeks

**What it does:**
- Automatic low stock notifications
- Reorder level management
- Stock forecasting
- Auto-generate PO suggestions

**Use Case:**
```
Stock falls below reorder point
→ Alert notification
→ Suggest reorder quantity
→ One-click create PO
```

**Tables Needed:**
- `reorder_points`
- `stock_alerts`

**Key Features:**
- Set min/max levels per product
- Email/SMS alerts
- Dashboard warnings
- Auto-suggest PO

---

### **9. Barcode Scanning** 
**Status:** ❌ Not Implemented  
**Priority:** 🟡 MEDIUM  
**Complexity:** ⭐⭐⭐ (Medium)  
**Timeline:** 2-3 weeks

**What it does:**
- Quick product selection via barcode
- Mobile scanner integration
- Print product barcode labels
- Faster billing process

**Features:**
- USB barcode scanner support
- Mobile camera scanning
- Generate barcodes for products
- Print labels
- Scan during billing
- Scan during stock receiving

**Libraries:**
- `html5-qrcode` (already installed!)
- Barcode generation libraries
- Label printing

---

### **10. Purchase Returns / Debit Notes** 
**Status:** ❌ Not Implemented  
**Priority:** 🟡 MEDIUM  
**Complexity:** ⭐⭐⭐ (Medium)  
**Timeline:** 2-3 weeks

**What it does:**
- Return items to vendors
- Generate debit notes
- Track vendor credits
- Adjust stock quantities

**Use Case:**
```
Received damaged goods
→ Create purchase return
→ Debit note generated
→ Stock reduced
→ Get credit from vendor
```

**Tables Needed:**
- `purchase_returns`
- `purchase_return_items`
- `debit_notes`

---

## 🟢 **LOW PRIORITY - Nice to Have**

### **11. Recurring Invoices / Subscriptions** 
**Status:** ❌ Not Implemented  
**Priority:** 🟢 LOW  
**Complexity:** ⭐⭐⭐⭐ (High)  
**Timeline:** 3-4 weeks

**What it does:**
- Auto-generate periodic invoices
- Subscription management
- Automatic payment collection
- Renewal reminders

**Use Case:**
```
Monthly subscription customer
→ Auto-create invoice every month
→ Send email notification
→ Auto-charge payment (if integrated)
→ Track subscription status
```

**Tables Needed:**
- `subscriptions`
- `subscription_invoices`
- `recurring_schedules`

---

### **12. Multiple Payment Methods per Bill** 
**Status:** ❌ Not Implemented  
**Priority:** 🟢 LOW  
**Complexity:** ⭐⭐ (Low-Medium)  
**Timeline:** 1 week

**What it does:**
- Split payment across multiple methods
- Track partial payments from different sources

**Use Case:**
```
Total: ₹10,000
→ Cash: ₹5,000
→ Card: ₹3,000
→ UPI: ₹2,000
→ All tracked separately
```

**Tables Needed:**
- `bill_payments` (one-to-many)

---

### **13. Product Bundles / Kits** 
**Status:** ❌ Not Implemented  
**Priority:** 🟢 LOW  
**Complexity:** ⭐⭐⭐ (Medium)  
**Timeline:** 2-3 weeks

**What it does:**
- Create product bundles
- Bundle pricing
- Auto-deduct component stock

**Use Case:**
```
"Diabetes Care Kit" Bundle:
  - Glucometer (1 unit)
  - Test Strips (50 strips)
  - Lancets (50 units)
Sell bundle at ₹2,000 (discounted)
All 3 items deducted from stock
```

**Tables Needed:**
- `product_bundles`
- `bundle_items`

---

### **14. Loyalty / Rewards Program** 
**Status:** ❌ Not Implemented  
**Priority:** 🟢 LOW  
**Complexity:** ⭐⭐⭐⭐ (High)  
**Timeline:** 3-4 weeks

**What it does:**
- Customer loyalty points
- Reward redemption
- Discount coupons
- Tier-based benefits

**Use Case:**
```
Purchase ₹1,000 → Earn 10 points
100 points = ₹100 discount
Redeem during next purchase
```

**Tables Needed:**
- `loyalty_points`
- `reward_transactions`
- `discount_coupons`

---

### **15. Inventory Valuation Methods** 
**Status:** ❌ Not Implemented  
**Priority:** 🟢 LOW  
**Complexity:** ⭐⭐⭐⭐ (High)  
**Timeline:** 3-4 weeks

**What it does:**
- FIFO (First In First Out)
- LIFO (Last In First Out)
- Weighted Average Cost
- Inventory valuation reports

**Use Case:**
```
Batch 1: 100 units @ ₹50 = ₹5,000
Batch 2: 100 units @ ₹60 = ₹6,000

Sell 50 units:
FIFO: Cost = 50 × ₹50 = ₹2,500
LIFO: Cost = 50 × ₹60 = ₹3,000
Avg: Cost = 50 × ₹55 = ₹2,750
```

---

### **16. Multi-Currency Support** 
**Status:** ❌ Not Implemented  
**Priority:** 🟢 LOW  
**Complexity:** ⭐⭐⭐⭐⭐ (Very High)  
**Timeline:** 4-6 weeks

**What it does:**
- Handle foreign currency transactions
- Currency conversion
- Multi-currency reports
- Exchange rate tracking

---

### **17. Backup & Restore** 
**Status:** ❌ Not Implemented  
**Priority:** 🟢 LOW  
**Complexity:** ⭐⭐⭐ (Medium)  
**Timeline:** 2-3 weeks

**What it does:**
- Automated database backups
- Manual backup/restore options
- Cloud backup integration
- Scheduled backups

---

### **18. Audit Trail / Activity Logs** 
**Status:** ❌ Not Implemented  
**Priority:** 🟢 LOW  
**Complexity:** ⭐⭐⭐ (Medium)  
**Timeline:** 2-3 weeks

**What it does:**
- Track all user actions
- Bill modifications history
- Stock movement logs
- Login/logout tracking
- Data change history

---

### **19. Vendor Payment Tracking** 
**Status:** ⚠️ Partially (in PO system)  
**Priority:** 🟢 LOW  
**Complexity:** ⭐⭐ (Low-Medium)  
**Timeline:** 1-2 weeks

**What it does:**
- Track vendor outstanding payments
- Vendor ledger
- Purchase payment history
- Aging analysis

---

### **20. Customer Credit/Debit Management** 
**Status:** ❌ Not Implemented  
**Priority:** 🟢 LOW  
**Complexity:** ⭐⭐⭐ (Medium)  
**Timeline:** 2-3 weeks

**What it does:**
- Credit sales tracking
- Payment due dates
- Credit limit enforcement
- Overdue tracking

---

## 📊 **PRIORITY MATRIX**

### **🔴 Phase 1: Must Have (Next 2-3 months)**

| # | Feature | Priority | Complexity | Timeline |
|---|---------|----------|------------|----------|
| 1 | Sales Returns / Credit Notes | 🔴 CRITICAL | ⭐⭐⭐ | 2-3 weeks |
| 2 | Customer Ledger | 🔴 CRITICAL | ⭐⭐⭐⭐ | 3-4 weeks |
| 3 | E-way Bill | 🔴 HIGH | ⭐⭐⭐⭐⭐ | 4-6 weeks |
| 4 | GST Filing Reports | 🔴 HIGH | ⭐⭐⭐⭐⭐ | 4-6 weeks |

**Total Timeline:** 13-19 weeks (~3-5 months)

---

### **🟡 Phase 2: Should Have (Next 6 months)**

| # | Feature | Priority | Complexity | Timeline |
|---|---------|----------|------------|----------|
| 5 | Quotations/Estimates | 🟡 MEDIUM | ⭐⭐⭐ | 2-3 weeks |
| 6 | Delivery Challan | 🟡 MEDIUM | ⭐⭐ | 1-2 weeks |
| 7 | Email/SMS Notifications | 🟡 MEDIUM | ⭐⭐⭐ | 2-3 weeks |
| 8 | Low Stock Alerts | 🟡 MEDIUM | ⭐⭐ | 1-2 weeks |
| 9 | Barcode Scanning | 🟡 MEDIUM | ⭐⭐⭐ | 2-3 weeks |
| 10 | Purchase Returns | 🟡 MEDIUM | ⭐⭐⭐ | 2-3 weeks |

**Total Timeline:** 11-18 weeks (~3-4 months)

---

### **🟢 Phase 3: Nice to Have (Future)**

| # | Feature | Priority | Complexity | Timeline |
|---|---------|----------|------------|----------|
| 11 | Recurring Invoices | 🟢 LOW | ⭐⭐⭐⭐ | 3-4 weeks |
| 12 | Multiple Payments/Bill | 🟢 LOW | ⭐⭐ | 1 week |
| 13 | Product Bundles | 🟢 LOW | ⭐⭐⭐ | 2-3 weeks |
| 14 | Loyalty Program | 🟢 LOW | ⭐⭐⭐⭐ | 3-4 weeks |
| 15 | Inventory Valuation | 🟢 LOW | ⭐⭐⭐⭐ | 3-4 weeks |
| 16 | Multi-Currency | 🟢 LOW | ⭐⭐⭐⭐⭐ | 4-6 weeks |
| 17 | Backup & Restore | 🟢 LOW | ⭐⭐⭐ | 2-3 weeks |
| 18 | Audit Trail | 🟢 LOW | ⭐⭐⭐ | 2-3 weeks |
| 19 | Vendor Payments | 🟢 LOW | ⭐⭐ | 1-2 weeks |
| 20 | Customer Credit Mgmt | 🟢 LOW | ⭐⭐⭐ | 2-3 weeks |

**Total Timeline:** 24-38 weeks (~6-9 months)

---

## 🎯 **Recommended Development Order**

### **Start with these (High ROI, Low Complexity):**

1. **Sales Returns / Credit Notes** (Week 1-3)
   - High business value
   - Moderate complexity
   - Customers need this frequently

2. **Delivery Challan** (Week 4-5)
   - Quick to implement
   - Useful for trials/demos
   - Easy wins

3. **Low Stock Alerts** (Week 6-7)
   - Prevents stock-outs
   - Simple implementation
   - High value

4. **Quotations** (Week 8-10)
   - Sales team needs this
   - Moderate complexity
   - Good ROI

5. **Customer Ledger** (Week 11-14)
   - Critical for credit sales
   - Complex but essential
   - High business value

---

## 📦 **Detailed Feature Specifications**

Below are detailed specs for each feature. Pick one and start developing!

---

## 1️⃣ **SALES RETURNS / CREDIT NOTES**

### **Overview:**
Allow customers to return sold items and get refunds or credit.

### **Workflow:**
```
1. Customer returns item
2. Staff creates Sales Return
3. Select original invoice
4. Choose items to return
5. Specify return reason
6. Generate Credit Note
7. Refund customer OR add store credit
8. Stock quantity increased
```

### **Database Tables:**

#### **Table: sales_returns**
```sql
CREATE TABLE sales_returns (
  _id UUID PRIMARY KEY,
  return_number VARCHAR(50) UNIQUE,
  return_date DATE,
  sales_record_id UUID,  -- Original invoice
  customer_id UUID,
  return_reason VARCHAR(255),  -- damaged, wrong_item, expired, etc.
  refund_type VARCHAR(20),  -- cash, card, store_credit
  refund_amount NUMERIC(15,2),
  status VARCHAR(20),  -- pending, approved, completed
  approved_by UUID,
  notes TEXT,
  created_by_id UUID,
  organisation_id UUID,
  branch_id UUID,
  tenant_id UUID,
  "createdAt" TIMESTAMP,
  "updatedAt" TIMESTAMP
);
```

#### **Table: sales_return_items**
```sql
CREATE TABLE sales_return_items (
  _id UUID PRIMARY KEY,
  sales_return_id UUID,
  product_id UUID,
  stock_id UUID,
  quantity INT,
  loose_qty INT,
  price NUMERIC(10,2),
  amount NUMERIC(15,2),
  condition VARCHAR(50),  -- good, damaged, expired
  notes TEXT,
  "createdAt" TIMESTAMP
);
```

#### **Table: credit_notes**
```sql
CREATE TABLE credit_notes (
  _id UUID PRIMARY KEY,
  credit_note_number VARCHAR(50) UNIQUE,
  credit_note_date DATE,
  sales_return_id UUID,
  customer_id UUID,
  amount NUMERIC(15,2),
  used_amount NUMERIC(15,2),
  remaining_amount NUMERIC(15,2),
  validity_date DATE,
  status VARCHAR(20),
  notes TEXT,
  "createdAt" TIMESTAMP
);
```

### **UI Pages Needed:**
- Sales Returns List
- Create Sales Return (select from invoice)
- Credit Notes List
- Apply Credit Note to new invoice

### **API Endpoints:**
```
POST   /sales_returns
GET    /sales_returns
GET    /sales_returns/:id
PUT    /sales_returns/:id
POST   /sales_returns/:id/approve
POST   /credit_notes
GET    /credit_notes
GET    /credit_notes/:id
POST   /credit_notes/:id/apply
```

---

## 2️⃣ **CUSTOMER LEDGER / ACCOUNT STATEMENT**

### **Overview:**
Track all customer transactions (sales, payments, returns) in one place.

### **Workflow:**
```
Customer Account:
├─ Invoice #1: +₹10,000 (Debit)
├─ Payment #1: -₹5,000 (Credit)
├─ Invoice #2: +₹3,000 (Debit)
├─ Return #1: -₹1,000 (Credit)
└─ Balance: ₹7,000 Outstanding
```

### **Database Tables:**

#### **Table: customer_ledger**
```sql
CREATE TABLE customer_ledger (
  _id UUID PRIMARY KEY,
  customer_id UUID,
  transaction_date DATE,
  transaction_type VARCHAR(20),  -- invoice, payment, return, credit_note
  reference_id UUID,  -- ID of invoice/payment/return
  reference_number VARCHAR(50),
  debit_amount NUMERIC(15,2),
  credit_amount NUMERIC(15,2),
  balance NUMERIC(15,2),
  notes TEXT,
  organisation_id UUID,
  branch_id UUID,
  tenant_id UUID,
  "createdAt" TIMESTAMP
);
```

#### **Table: customer_credit_limits**
```sql
CREATE TABLE customer_credit_limits (
  _id UUID PRIMARY KEY,
  customer_id UUID UNIQUE,
  credit_limit NUMERIC(15,2),
  credit_period_days INT,  -- Payment due in X days
  current_outstanding NUMERIC(15,2),
  available_credit NUMERIC(15,2),
  is_active BOOLEAN,
  "updatedAt" TIMESTAMP
);
```

### **Features:**
- Running balance calculation
- Aging analysis (0-30, 31-60, 61-90, 90+ days)
- Payment reminders
- Credit limit warnings
- Account statement PDF
- Payment history

### **UI Pages Needed:**
- Customer Ledger View
- Account Statement Generator
- Outstanding Report
- Aging Analysis Report

### **API Endpoints:**
```
GET    /customers/:id/ledger
GET    /customers/:id/statement
GET    /customers/:id/outstanding
GET    /customers/:id/aging-analysis
POST   /customers/:id/credit-limit
GET    /customers/overdue
```

---

## 3️⃣ **E-WAY BILL GENERATION**

### **Overview:**
Generate e-way bills for interstate goods transportation (GST requirement).

### **Workflow:**
```
Invoice > ₹50,000 + Interstate delivery
→ Generate e-way bill
→ Submit to GST portal API
→ Get e-way bill number
→ Print on invoice
→ Track validity
```

### **Database Tables:**

#### **Table: eway_bills**
```sql
CREATE TABLE eway_bills (
  _id UUID PRIMARY KEY,
  eway_bill_number VARCHAR(20) UNIQUE,
  sales_record_id UUID,
  invoice_number VARCHAR(50),
  bill_date DATE,
  
  -- Consignor (Seller)
  consignor_gstin VARCHAR(15),
  consignor_name VARCHAR(255),
  consignor_address TEXT,
  
  -- Consignee (Buyer)
  consignee_gstin VARCHAR(15),
  consignee_name VARCHAR(255),
  consignee_address TEXT,
  
  -- Transport Details
  transport_mode VARCHAR(20),  -- road, rail, air, ship
  vehicle_number VARCHAR(20),
  transporter_id VARCHAR(15),
  distance_km INT,
  
  -- Document Details
  document_number VARCHAR(50),
  document_date DATE,
  total_value NUMERIC(15,2),
  
  -- Validity
  valid_from TIMESTAMP,
  valid_until TIMESTAMP,
  
  -- Status
  status VARCHAR(20),  -- generated, active, expired, cancelled
  
  -- GST Portal Response
  gst_portal_response JSONB,
  
  "createdAt" TIMESTAMP,
  "updatedAt" TIMESTAMP
);
```

### **GST API Integration:**
- e-Way Bill Portal API
- Authentication required
- Real-time generation
- Error handling

### **Complexity Reasons:**
- GST portal API integration
- Authentication complexity
- Real-time validation
- Legal compliance requirements

---

## 4️⃣ **GST FILING REPORTS**

### **Overview:**
Generate reports for GST return filing (GSTR-1, GSTR-3B).

### **Reports Needed:**

#### **GSTR-1 (Outward Supplies):**
- B2B supplies (Business customers with GSTIN)
- B2C Large (Invoices > ₹2.5 lakh)
- B2C Small (Invoices < ₹2.5 lakh)
- Credit/Debit notes
- Exports
- HSN summary

#### **GSTR-3B (Summary Return):**
- Outward supplies summary
- Input tax credit
- Tax liability
- Tax paid

### **Database Views:**

```sql
-- B2B Sales View
CREATE VIEW v_gstr1_b2b AS
SELECT 
  c.gst_number as customer_gstin,
  c.customer_name,
  s.invoice_no,
  s.date as invoice_date,
  s.total_amount as invoice_value,
  s.cgst,
  s.sgst,
  s.total_gst as total_tax
FROM sales_records s
JOIN customers c ON s.customer_id = c._id
WHERE c.gst_number IS NOT NULL
  AND s.status = 'completed';

-- HSN Summary View
CREATE VIEW v_gstr1_hsn_summary AS
SELECT 
  p.hsn_code,
  p.CategoryItem->>'category_name' as description,
  SUM(si.qty) as total_quantity,
  SUM(si.amount) as total_value,
  AVG(si.tax_percentage) as tax_rate,
  SUM(si.amount * si.tax_percentage / 100) as total_tax
FROM sales_record_items si
JOIN products p ON si.product_id = p._id
GROUP BY p.hsn_code, p.CategoryItem->>'category_name';
```

### **Export Formats:**
- JSON (for GST portal upload)
- Excel (for review)
- PDF (for records)

---

## 5️⃣ **QUOTATIONS / ESTIMATES**

### **Overview:**
Create quotations for customers before converting to invoices.

### **Workflow:**
```
1. Customer inquires
2. Create quotation with items & prices
3. Send to customer (email/print)
4. Customer approves
5. Convert to invoice (one click)
6. Stock gets deducted
```

### **Database Tables:**

#### **Table: quotations**
```sql
CREATE TABLE quotations (
  _id UUID PRIMARY KEY,
  quotation_number VARCHAR(50) UNIQUE,
  quotation_date DATE,
  customer_id UUID,
  valid_until DATE,  -- Quote expires after this
  
  -- Status
  status VARCHAR(20),  -- draft, sent, accepted, rejected, expired, converted
  
  -- Financial
  subtotal NUMERIC(15,2),
  tax_amount NUMERIC(15,2),
  discount_amount NUMERIC(15,2),
  total_amount NUMERIC(15,2),
  
  -- Conversion
  converted_to_invoice_id UUID,
  converted_date DATE,
  
  -- Notes
  notes TEXT,
  terms_conditions TEXT,
  
  created_by_id UUID,
  organisation_id UUID,
  branch_id UUID,
  tenant_id UUID,
  "createdAt" TIMESTAMP,
  "updatedAt" TIMESTAMP
);
```

#### **Table: quotation_items**
```sql
CREATE TABLE quotation_items (
  _id UUID PRIMARY KEY,
  quotation_id UUID,
  product_id UUID,
  product_name VARCHAR(255),
  quantity INT,
  unit_price NUMERIC(10,2),
  tax_percentage NUMERIC(5,2),
  discount NUMERIC(10,2),
  line_total NUMERIC(15,2),
  notes TEXT,
  "createdAt" TIMESTAMP
);
```

### **Key Features:**
- Quote validity period
- Multiple versions/revisions
- Convert to invoice
- Quote comparison
- Acceptance tracking
- Email integration

---

## 6️⃣ **DELIVERY CHALLAN**

### **Overview:**
Dispatch goods without immediate billing (for approvals, demos, etc.).

### **Workflow:**
```
1. Create delivery challan
2. Dispatch goods (no invoice yet)
3. Stock temporarily out
4. Customer approves
5. Convert to invoice
6. Payment collected
```

### **Database Tables:**

#### **Table: delivery_challans**
```sql
CREATE TABLE delivery_challans (
  _id UUID PRIMARY KEY,
  challan_number VARCHAR(50) UNIQUE,
  challan_date DATE,
  customer_id UUID,
  
  -- Purpose
  purpose VARCHAR(50),  -- demo, approval, job_work, etc.
  
  -- Return Details
  expected_return_date DATE,
  actual_return_date DATE,
  
  -- Status
  status VARCHAR(20),  -- pending, returned, converted_to_invoice
  
  -- Conversion
  converted_to_invoice_id UUID,
  
  notes TEXT,
  created_by_id UUID,
  organisation_id UUID,
  branch_id UUID,
  tenant_id UUID,
  "createdAt" TIMESTAMP,
  "updatedAt" TIMESTAMP
);
```

#### **Table: delivery_challan_items**
```sql
CREATE TABLE delivery_challan_items (
  _id UUID PRIMARY KEY,
  challan_id UUID,
  product_id UUID,
  stock_id UUID,
  quantity INT,
  returned_quantity INT,
  notes TEXT,
  "createdAt" TIMESTAMP
);
```

---

## 7️⃣ **EMAIL/SMS NOTIFICATIONS**

### **Overview:**
Automated notifications for various events.

### **Notification Types:**

| Event | Email | SMS | Push |
|-------|-------|-----|------|
| Invoice created | ✅ | ✅ | ❌ |
| Payment received | ✅ | ✅ | ❌ |
| Payment overdue | ✅ | ✅ | ❌ |
| Low stock alert | ✅ | ❌ | ✅ |
| PO approved | ✅ | ❌ | ✅ |
| Goods received | ✅ | ❌ | ✅ |

### **Database Tables:**

```sql
CREATE TABLE notification_templates (
  _id UUID PRIMARY KEY,
  template_name VARCHAR(100),
  template_type VARCHAR(20),  -- email, sms, push
  subject VARCHAR(255),
  body TEXT,
  variables JSONB,  -- Placeholders like {customer_name}
  is_active BOOLEAN
);

CREATE TABLE notification_logs (
  _id UUID PRIMARY KEY,
  notification_type VARCHAR(50),
  recipient VARCHAR(255),
  subject VARCHAR(255),
  message TEXT,
  status VARCHAR(20),  -- sent, failed, pending
  sent_at TIMESTAMP,
  error_message TEXT
);
```

### **Integration:**
- **Email:** SendGrid, AWS SES, or Nodemailer
- **SMS:** Twilio, MSG91, or similar
- **Templates:** Dynamic with variables

---

## 8️⃣ **LOW STOCK ALERTS & REORDER POINTS**

### **Overview:**
Automatically alert when stock falls below threshold.

### **Workflow:**
```
Set reorder point = 50 units
Stock = 100 units → OK
Stock = 45 units → ALERT!
→ Email to admin
→ Dashboard notification
→ Suggest PO creation
```

### **Database Tables:**

```sql
CREATE TABLE reorder_points (
  _id UUID PRIMARY KEY,
  product_id UUID UNIQUE,
  min_stock_level INT,  -- Reorder point
  max_stock_level INT,  -- Maximum to keep
  reorder_quantity INT,  -- How much to order
  preferred_vendor_id UUID,
  is_active BOOLEAN,
  "updatedAt" TIMESTAMP
);

CREATE TABLE stock_alerts (
  _id UUID PRIMARY KEY,
  product_id UUID,
  alert_type VARCHAR(20),  -- low_stock, out_of_stock, expiry_soon
  current_quantity INT,
  reorder_point INT,
  alert_date TIMESTAMP,
  is_resolved BOOLEAN,
  resolved_date TIMESTAMP
);
```

### **Features:**
- Auto-generate alerts
- Email notifications
- Dashboard widget
- One-click create PO
- Alert history

---

## 9️⃣ **BARCODE SCANNING**

### **Overview:**
Speed up billing and stock management with barcode scanning.

### **Features:**
1. **Generate Barcodes:**
   - Barcode for each product/variant
   - Print labels
   - QR codes with product info

2. **Scan During Billing:**
   - Scan product barcode
   - Auto-add to bill
   - Quantity selection
   - Faster checkout

3. **Scan During Stock In:**
   - Scan received products
   - Verify against PO
   - Quick receipt process

### **Database Changes:**

```sql
-- Add to products table
ALTER TABLE products ADD COLUMN barcode VARCHAR(50) UNIQUE;
ALTER TABLE products ADD COLUMN qr_code TEXT;
```

### **Libraries:**
- `html5-qrcode` (already in package.json!)
- `react-barcode` for generation
- USB scanner support

### **UI Components:**
- Barcode scanner component
- Label printing page
- Scan interface in billing

---

## 🔟 **PURCHASE RETURNS / DEBIT NOTES**

### **Overview:**
Return defective items to vendors.

### **Workflow:**
```
1. Find defective items
2. Create purchase return
3. Link to original PO/GRN
4. Generate debit note
5. Return to vendor
6. Get credit/refund
7. Stock quantity reduced
```

### **Database Tables:**

```sql
CREATE TABLE purchase_returns (
  _id UUID PRIMARY KEY,
  return_number VARCHAR(50) UNIQUE,
  return_date DATE,
  purchase_order_id UUID,
  grn_id UUID,
  vendor_id UUID,
  return_reason VARCHAR(255),
  refund_type VARCHAR(20),
  refund_amount NUMERIC(15,2),
  status VARCHAR(20),
  notes TEXT,
  created_by_id UUID,
  organisation_id UUID,
  branch_id UUID,
  tenant_id UUID,
  "createdAt" TIMESTAMP
);

CREATE TABLE purchase_return_items (
  _id UUID PRIMARY KEY,
  purchase_return_id UUID,
  product_id UUID,
  stock_audit_id UUID,
  quantity INT,
  unit_price NUMERIC(10,2),
  amount NUMERIC(15,2),
  condition VARCHAR(50),
  notes TEXT,
  "createdAt" TIMESTAMP
);

CREATE TABLE debit_notes (
  _id UUID PRIMARY KEY,
  debit_note_number VARCHAR(50) UNIQUE,
  debit_note_date DATE,
  purchase_return_id UUID,
  vendor_id UUID,
  amount NUMERIC(15,2),
  adjusted_amount NUMERIC(15,2),
  remaining_amount NUMERIC(15,2),
  status VARCHAR(20),
  notes TEXT,
  "createdAt" TIMESTAMP
);
```

---

## 📈 **Development Roadmap Summary**

### **Year 1 - Essential Features:**
```
Q1 (Jan-Mar): 
✅ Purchase Orders (DONE!)
→ Sales Returns
→ Customer Ledger

Q2 (Apr-Jun):
→ E-way Bills
→ GST Reports
→ Quotations

Q3 (Jul-Sep):
→ Delivery Challan
→ Email/SMS
→ Low Stock Alerts

Q4 (Oct-Dec):
→ Barcode Scanning
→ Purchase Returns
→ Performance optimization
```

### **Year 2 - Enhancements:**
```
→ Recurring Invoices
→ Loyalty Program
→ Product Bundles
→ Multi-Currency
→ Advanced Analytics
```

---

## 🎯 **Quick Pick - Start Here:**

### **If you want QUICK WINS (1-2 weeks each):**
1. Delivery Challan ⭐ (Simple, useful)
2. Low Stock Alerts ⭐ (High value, low complexity)
3. Multiple Payments per Bill ⭐ (Quick enhancement)

### **If you want HIGH BUSINESS VALUE:**
1. Sales Returns ⭐⭐⭐ (Customers need this)
2. Customer Ledger ⭐⭐⭐ (Credit sales essential)
3. Quotations ⭐⭐ (Sales team needs)

### **If you need COMPLIANCE:**
1. E-way Bills ⭐⭐⭐ (Legal requirement)
2. GST Reports ⭐⭐⭐ (Tax filing)
3. Audit Trail ⭐⭐ (Compliance)

---

## 📞 **Need Help?**

For any feature:
1. Read the detailed spec above
2. Check if database schema is complex
3. Estimate frontend vs backend effort
4. Plan timeline
5. Start development!

I can help you implement any of these features. Just let me know which one you want to start with! 🚀

---

## 📊 **Effort Estimation:**

| Feature | Frontend | Backend | Database | Total Days |
|---------|----------|---------|----------|------------|
| Sales Returns | 5 days | 5 days | 1 day | 11 days |
| Customer Ledger | 7 days | 8 days | 2 days | 17 days |
| Quotations | 5 days | 4 days | 1 day | 10 days |
| Delivery Challan | 3 days | 3 days | 1 day | 7 days |
| Low Stock Alerts | 2 days | 3 days | 1 day | 6 days |
| Barcode Scanning | 5 days | 2 days | 0 days | 7 days |
| Email/SMS | 3 days | 7 days | 1 day | 11 days |
| E-way Bills | 5 days | 15 days | 1 day | 21 days |
| GST Reports | 7 days | 15 days | 2 days | 24 days |

---

**Pick any feature and let's build it together!** 🎯

