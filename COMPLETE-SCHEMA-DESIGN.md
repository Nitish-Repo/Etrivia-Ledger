# 🏢 Complete Ledger & GST Billing System - Database Design

## 📋 **Complete Feature Set**

### ✅ **Core Features**
- Product Management (with variants, barcodes)
- Customer & Supplier Management
- Purchase & Sales with GST
- Inventory Tracking
- Payment Tracking (Due Amount Management)
- Profit/Loss Reports
- GST Returns (GSTR-1, GSTR-3B ready)
- Expense Tracking
- Multi-payment methods
- Discount Management
- Tax Calculations (GST, CESS)

---

## 🗄️ **Database Schema**

### **1. Products Table** (Enhanced)
```sql
CREATE TABLE products (
  productId TEXT PRIMARY KEY,
  productName TEXT NOT NULL,
  hsn_code TEXT,                    -- HSN/SAC code for GST
  barcode TEXT UNIQUE,
  sku TEXT UNIQUE,
  description TEXT,
  category TEXT,
  unit TEXT DEFAULT 'PCS',          -- PCS, KG, LITER, etc.
  
  -- Purchase Pricing
  purchasePrice REAL NOT NULL,
  purchaseTaxType TEXT DEFAULT 'INCLUSIVE',  -- INCLUSIVE or EXCLUSIVE
  purchaseGstRate REAL DEFAULT 0,    -- 0, 5, 12, 18, 28
  purchaseCessRate REAL DEFAULT 0,
  
  -- Sale Pricing (Multiple price tiers)
  wholesalePrice REAL,
  retailPrice REAL NOT NULL,
  mrp REAL,
  saleTaxType TEXT DEFAULT 'INCLUSIVE',      -- INCLUSIVE or EXCLUSIVE
  saleGstRate REAL DEFAULT 0,
  saleCessRate REAL DEFAULT 0,
  
  -- Discount
  discountType TEXT DEFAULT 'NONE',  -- NONE, PERCENTAGE, AMOUNT
  discountValue REAL DEFAULT 0,
  
  -- Inventory
  currentStock REAL DEFAULT 0,
  minStockLevel REAL DEFAULT 0,
  maxStockLevel REAL,
  
  -- Meta
  imageUrl TEXT,
  isActive INTEGER DEFAULT 1,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
  updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_products_name ON products(productName);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_hsn ON products(hsn_code);
CREATE INDEX idx_products_barcode ON products(barcode);
```

---

### **2. Customers Table** (Enhanced)
```sql
CREATE TABLE customers (
  customerId TEXT PRIMARY KEY,
  customerName TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  gstin TEXT,                       -- GST Number (for B2B)
  pan TEXT,
  
  -- Address
  billingAddress TEXT,
  shippingAddress TEXT,
  city TEXT,
  state TEXT,
  pincode TEXT,
  country TEXT DEFAULT 'India',
  
  -- Credit Management
  creditLimit REAL DEFAULT 0,
  openingBalance REAL DEFAULT 0,     -- Starting due amount
  currentBalance REAL DEFAULT 0,     -- Current due (auto-calculated)
  
  -- Classification
  customerType TEXT DEFAULT 'RETAIL', -- RETAIL, WHOLESALE, B2B
  priceList TEXT DEFAULT 'RETAIL',    -- Which price to use
  
  isActive INTEGER DEFAULT 1,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
  updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_customers_name ON customers(customerName);
CREATE INDEX idx_customers_phone ON customers(phone);
CREATE INDEX idx_customers_gstin ON customers(gstin);
```

---

### **3. Suppliers Table**
```sql
CREATE TABLE suppliers (
  supplierId TEXT PRIMARY KEY,
  supplierName TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  gstin TEXT,
  pan TEXT,
  
  address TEXT,
  city TEXT,
  state TEXT,
  pincode TEXT,
  
  openingBalance REAL DEFAULT 0,
  currentBalance REAL DEFAULT 0,
  
  isActive INTEGER DEFAULT 1,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
  updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_suppliers_name ON suppliers(supplierName);
```

---

### **4. Sales/Invoices Table**
```sql
CREATE TABLE sales (
  saleId TEXT PRIMARY KEY,
  invoiceNumber TEXT UNIQUE NOT NULL,
  invoiceDate TEXT NOT NULL,
  
  customerId TEXT NOT NULL,
  customerName TEXT NOT NULL,         -- Denormalized for reports
  customerGstin TEXT,
  
  -- Amounts (Before Tax)
  subtotal REAL NOT NULL,
  
  -- Discounts
  discountType TEXT DEFAULT 'NONE',   -- NONE, PERCENTAGE, AMOUNT
  discountValue REAL DEFAULT 0,
  discountAmount REAL DEFAULT 0,
  
  -- Tax Breakdown
  taxableAmount REAL NOT NULL,
  cgst REAL DEFAULT 0,
  sgst REAL DEFAULT 0,
  igst REAL DEFAULT 0,
  cess REAL DEFAULT 0,
  
  -- Final
  totalAmount REAL NOT NULL,
  roundOff REAL DEFAULT 0,
  grandTotal REAL NOT NULL,
  
  -- Payment
  paidAmount REAL DEFAULT 0,
  dueAmount REAL DEFAULT 0,
  paymentStatus TEXT DEFAULT 'UNPAID', -- PAID, PARTIAL, UNPAID
  
  -- Meta
  notes TEXT,
  saleType TEXT DEFAULT 'CASH',       -- CASH, CREDIT, ONLINE
  status TEXT DEFAULT 'COMPLETED',    -- DRAFT, COMPLETED, CANCELLED
  
  createdBy TEXT,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
  updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (customerId) REFERENCES customers(customerId)
);

CREATE INDEX idx_sales_customer ON sales(customerId);
CREATE INDEX idx_sales_date ON sales(invoiceDate);
CREATE INDEX idx_sales_invoice ON sales(invoiceNumber);
CREATE INDEX idx_sales_status ON sales(paymentStatus);
```

---

### **5. Sale Items Table**
```sql
CREATE TABLE sale_items (
  saleItemId TEXT PRIMARY KEY,
  saleId TEXT NOT NULL,
  
  productId TEXT NOT NULL,
  productName TEXT NOT NULL,
  hsn_code TEXT,
  
  quantity REAL NOT NULL,
  unit TEXT DEFAULT 'PCS',
  
  -- Pricing
  pricePerUnit REAL NOT NULL,
  taxType TEXT DEFAULT 'INCLUSIVE',
  
  -- Discount at item level
  discountType TEXT DEFAULT 'NONE',
  discountValue REAL DEFAULT 0,
  discountAmount REAL DEFAULT 0,
  
  -- Tax
  taxableAmount REAL NOT NULL,
  gstRate REAL DEFAULT 0,
  cessRate REAL DEFAULT 0,
  cgst REAL DEFAULT 0,
  sgst REAL DEFAULT 0,
  igst REAL DEFAULT 0,
  cess REAL DEFAULT 0,
  
  totalAmount REAL NOT NULL,
  
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (saleId) REFERENCES sales(saleId) ON DELETE CASCADE,
  FOREIGN KEY (productId) REFERENCES products(productId)
);

CREATE INDEX idx_sale_items_sale ON sale_items(saleId);
CREATE INDEX idx_sale_items_product ON sale_items(productId);
```

---

### **6. Purchases Table**
```sql
CREATE TABLE purchases (
  purchaseId TEXT PRIMARY KEY,
  billNumber TEXT NOT NULL,
  billDate TEXT NOT NULL,
  
  supplierId TEXT NOT NULL,
  supplierName TEXT NOT NULL,
  supplierGstin TEXT,
  
  subtotal REAL NOT NULL,
  
  discountType TEXT DEFAULT 'NONE',
  discountValue REAL DEFAULT 0,
  discountAmount REAL DEFAULT 0,
  
  taxableAmount REAL NOT NULL,
  cgst REAL DEFAULT 0,
  sgst REAL DEFAULT 0,
  igst REAL DEFAULT 0,
  cess REAL DEFAULT 0,
  
  totalAmount REAL NOT NULL,
  roundOff REAL DEFAULT 0,
  grandTotal REAL NOT NULL,
  
  paidAmount REAL DEFAULT 0,
  dueAmount REAL DEFAULT 0,
  paymentStatus TEXT DEFAULT 'UNPAID',
  
  notes TEXT,
  status TEXT DEFAULT 'COMPLETED',
  
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
  updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (supplierId) REFERENCES suppliers(supplierId)
);

CREATE INDEX idx_purchases_supplier ON purchases(supplierId);
CREATE INDEX idx_purchases_date ON purchases(billDate);
```

---

### **7. Purchase Items Table**
```sql
CREATE TABLE purchase_items (
  purchaseItemId TEXT PRIMARY KEY,
  purchaseId TEXT NOT NULL,
  
  productId TEXT NOT NULL,
  productName TEXT NOT NULL,
  hsn_code TEXT,
  
  quantity REAL NOT NULL,
  unit TEXT DEFAULT 'PCS',
  
  pricePerUnit REAL NOT NULL,
  taxType TEXT DEFAULT 'INCLUSIVE',
  
  taxableAmount REAL NOT NULL,
  gstRate REAL DEFAULT 0,
  cessRate REAL DEFAULT 0,
  cgst REAL DEFAULT 0,
  sgst REAL DEFAULT 0,
  igst REAL DEFAULT 0,
  cess REAL DEFAULT 0,
  
  totalAmount REAL NOT NULL,
  
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (purchaseId) REFERENCES purchases(purchaseId) ON DELETE CASCADE,
  FOREIGN KEY (productId) REFERENCES products(productId)
);

CREATE INDEX idx_purchase_items_purchase ON purchase_items(purchaseId);
```

---

### **8. Payments Table** (Customer & Supplier)
```sql
CREATE TABLE payments (
  paymentId TEXT PRIMARY KEY,
  paymentDate TEXT NOT NULL,
  
  partyType TEXT NOT NULL,           -- CUSTOMER or SUPPLIER
  partyId TEXT NOT NULL,
  partyName TEXT NOT NULL,
  
  referenceType TEXT,                -- SALE, PURCHASE, OPENING_BALANCE
  referenceId TEXT,                  -- saleId or purchaseId
  
  amount REAL NOT NULL,
  paymentMethod TEXT DEFAULT 'CASH', -- CASH, UPI, CARD, BANK_TRANSFER, CHEQUE
  
  transactionId TEXT,                -- UPI/Bank ref number
  notes TEXT,
  
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_payments_party ON payments(partyId);
CREATE INDEX idx_payments_date ON payments(paymentDate);
CREATE INDEX idx_payments_reference ON payments(referenceId);
```

---

### **9. Expenses Table**
```sql
CREATE TABLE expenses (
  expenseId TEXT PRIMARY KEY,
  expenseDate TEXT NOT NULL,
  
  category TEXT NOT NULL,            -- RENT, SALARY, ELECTRICITY, etc.
  description TEXT,
  amount REAL NOT NULL,
  
  paymentMethod TEXT DEFAULT 'CASH',
  
  gstApplicable INTEGER DEFAULT 0,
  gstAmount REAL DEFAULT 0,
  
  notes TEXT,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_expenses_date ON expenses(expenseDate);
CREATE INDEX idx_expenses_category ON expenses(category);
```

---

### **10. Stock Adjustments Table**
```sql
CREATE TABLE stock_adjustments (
  adjustmentId TEXT PRIMARY KEY,
  adjustmentDate TEXT NOT NULL,
  
  productId TEXT NOT NULL,
  productName TEXT NOT NULL,
  
  adjustmentType TEXT NOT NULL,      -- ADD, REMOVE, DAMAGE, RETURN
  quantity REAL NOT NULL,
  
  reason TEXT,
  notes TEXT,
  
  createdBy TEXT,
  createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (productId) REFERENCES products(productId)
);

CREATE INDEX idx_stock_adj_product ON stock_adjustments(productId);
CREATE INDEX idx_stock_adj_date ON stock_adjustments(adjustmentDate);
```

---

### **11. Business Settings Table**
```sql
CREATE TABLE business_settings (
  settingKey TEXT PRIMARY KEY,
  settingValue TEXT
);

-- Pre-populated with business info
INSERT INTO business_settings VALUES
  ('businessName', 'Your Business Name'),
  ('gstin', ''),
  ('pan', ''),
  ('address', ''),
  ('city', ''),
  ('state', ''),
  ('pincode', ''),
  ('phone', ''),
  ('email', ''),
  ('invoicePrefix', 'INV'),
  ('financialYearStart', '04-01'),
  ('defaultGstRate', '18'),
  ('enableCess', '0');
```

---

## 📊 **Key Reports You Can Generate**

### 1. **Profit/Loss Report**
```sql
SELECT 
  (SELECT SUM(grandTotal - paidAmount) FROM sales WHERE invoiceDate BETWEEN ? AND ?) AS totalSales,
  (SELECT SUM(grandTotal) FROM purchases WHERE billDate BETWEEN ? AND ?) AS totalPurchases,
  (SELECT SUM(amount) FROM expenses WHERE expenseDate BETWEEN ? AND ?) AS totalExpenses
```

### 2. **Due Amount Report (Customer-wise)**
```sql
SELECT 
  c.customerName,
  c.phone,
  SUM(s.dueAmount) as totalDue
FROM customers c
LEFT JOIN sales s ON c.customerId = s.customerId
WHERE s.paymentStatus IN ('UNPAID', 'PARTIAL')
GROUP BY c.customerId
HAVING totalDue > 0
ORDER BY totalDue DESC
```

### 3. **GST Summary (for GSTR-1)**
```sql
SELECT 
  gstRate,
  SUM(taxableAmount) as taxableValue,
  SUM(cgst) as totalCGST,
  SUM(sgst) as totalSGST,
  SUM(igst) as totalIGST
FROM sale_items
WHERE saleId IN (SELECT saleId FROM sales WHERE invoiceDate BETWEEN ? AND ?)
GROUP BY gstRate
```

### 4. **Stock Report**
```sql
SELECT 
  productName,
  currentStock,
  minStockLevel,
  (purchasePrice * currentStock) as stockValue
FROM products
WHERE isActive = 1
ORDER BY currentStock ASC
```

---

## 🎯 **Next Steps to Implement**

1. **Run migration** - Add new schema version
2. **Create TypeScript models** for each table
3. **Build services** for CRUD operations
4. **Create calculation utilities** for GST, discounts
5. **Build report components**
6. **Add PDF generation** for invoices

Would you like me to create the complete schema migration and TypeScript models now?
