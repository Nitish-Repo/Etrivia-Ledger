/**
 * Database Schema and Migrations
 * All database versions and changes in one place
 */

export interface SchemaVersion {
  version: number;
  name: string;
  up: string;
}

/**
 * Database schema versions
 * Each version runs in order for new installations
 * Existing databases only run versions higher than their current version
 */
export const SCHEMA_VERSIONS: SchemaVersion[] = [
  {
    version: 1,
    name: 'Complete GST Billing System Schema',
    up: `
      -- ============================================
      -- PRODUCTS TABLE (Enhanced with GST support)
      -- ============================================
      CREATE TABLE IF NOT EXISTS products (
        productId TEXT PRIMARY KEY,
        productName TEXT NOT NULL,
        hsnCode TEXT,
        barcode TEXT UNIQUE,
        sku TEXT UNIQUE,
        description TEXT,
        category TEXT,
        unitMeasure TEXT,
        isfavourite INTEGER,
        
        -- Purchase Pricing
        purchaseCost REAL,
        purchaseTaxType TEXT,
        purchaseGstRate REAL,
        purchaseCessRate REAL,
        
        -- Sale Pricing
        wholesalePrice REAL,
        retailPrice REAL,
        mrp REAL,
        saleTaxType TEXT,
        saleGstRate REAL,
        saleCessRate REAL,
        
        -- Discount
        discountType TEXT,
        discountValue REAL,
        
        -- Inventory
        isInventory INTEGER,
        currentStock REAL,
        minStockLevel REAL,
        maxStockLevel REAL,
        
        imageUrl TEXT,
        isActive INTEGER NOT NULL,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_products_name ON products(productName);
      CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
      CREATE INDEX IF NOT EXISTS idx_products_hsn ON products(hsnCode);
      CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);
      CREATE INDEX IF NOT EXISTS idx_products_active ON products(isActive);
      CREATE INDEX IF NOT EXISTS idx_products_updated ON products(updatedAt DESC);
      CREATE INDEX IF NOT EXISTS idx_products_favourite ON products(isfavourite);

      -- ============================================
      -- CUSTOMERS TABLE (Enhanced)
      -- ============================================
      CREATE TABLE IF NOT EXISTS customers (
        customerId TEXT PRIMARY KEY,
        customerName TEXT NOT NULL,
        phone TEXT,
        email TEXT,
        gstin TEXT,
        pan TEXT,
        
        billingAddress TEXT,
        shippingAddress TEXT,
        city TEXT,
        state TEXT,
        pincode TEXT,
        country TEXT DEFAULT 'India',
        
        creditLimit REAL DEFAULT 0,
        openingBalance REAL DEFAULT 0,
        currentBalance REAL DEFAULT 0,
        
        customerType TEXT DEFAULT 'RETAIL',
        priceList TEXT DEFAULT 'RETAIL',
        
        isActive INTEGER DEFAULT 1,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_customers_name ON customers(customerName);
      CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);
      CREATE INDEX IF NOT EXISTS idx_customers_gstin ON customers(gstin);
      CREATE INDEX IF NOT EXISTS idx_customers_active ON customers(isActive);

      -- ============================================
      -- SUPPLIERS TABLE
      -- ============================================
      CREATE TABLE IF NOT EXISTS suppliers (
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
        country TEXT DEFAULT 'India',
        
        openingBalance REAL DEFAULT 0,
        currentBalance REAL DEFAULT 0,
        
        isActive INTEGER DEFAULT 1,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_suppliers_name ON suppliers(supplierName);
      CREATE INDEX IF NOT EXISTS idx_suppliers_active ON suppliers(isActive);

      -- ============================================
      -- SALES TABLE
      -- ============================================
      CREATE TABLE IF NOT EXISTS sales (
        saleId TEXT PRIMARY KEY,
        invoiceNumber TEXT UNIQUE NOT NULL,
        invoiceDate TEXT NOT NULL,
        
        customerId TEXT NOT NULL,
        customerName TEXT NOT NULL,
        customerGstin TEXT,
        
        subtotal REAL NOT NULL DEFAULT 0,
        
        invoiceDiscountType TEXT DEFAULT 'NONE',
        invoiceDiscountValue REAL DEFAULT 0,
        TotalDiscountAmount REAL DEFAULT 0,
        
        taxableAmount REAL NOT NULL DEFAULT 0,
        cgst REAL DEFAULT 0,
        sgst REAL DEFAULT 0,
        igst REAL DEFAULT 0,
        cess REAL DEFAULT 0,
        
        totalAmount REAL NOT NULL DEFAULT 0,
        roundOff REAL DEFAULT 0,
        grandTotal REAL NOT NULL DEFAULT 0,
        
        paidAmount REAL DEFAULT 0,
        dueAmount REAL DEFAULT 0,
        paymentStatus TEXT DEFAULT 'UNPAID',
        
        notes TEXT,
        saleType TEXT DEFAULT 'CASH',
        status TEXT DEFAULT 'COMPLETED',
        
        createdBy TEXT,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
        
        FOREIGN KEY (customerId) REFERENCES customers(customerId)
      );

      CREATE INDEX IF NOT EXISTS idx_sales_customer ON sales(customerId);
      CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(invoiceDate);
      CREATE INDEX IF NOT EXISTS idx_sales_invoice ON sales(invoiceNumber);
      CREATE INDEX IF NOT EXISTS idx_sales_status ON sales(paymentStatus);

      -- ============================================
      -- SALE ITEMS TABLE
      -- ============================================
      CREATE TABLE IF NOT EXISTS sale_items (
        saleItemId TEXT PRIMARY KEY,
        saleId TEXT NOT NULL,
        
        productId TEXT NOT NULL,
        productName TEXT NOT NULL,
        hsnCode TEXT,
        
        quantity REAL NOT NULL,
        unit TEXT DEFAULT 'PCS',
        
        pricePerUnit REAL NOT NULL,
        taxType TEXT DEFAULT 'INCLUSIVE',
        
        discountType TEXT DEFAULT 'NONE',
        discountValue REAL DEFAULT 0,
        discountAmount REAL DEFAULT 0,
        
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

      CREATE INDEX IF NOT EXISTS idx_sale_items_sale ON sale_items(saleId);
      CREATE INDEX IF NOT EXISTS idx_sale_items_product ON sale_items(productId);

      -- ============================================
      -- ADDITIONAL CHARGES TABLE
      -- ============================================
      CREATE TABLE IF NOT EXISTS additional_charges (
        chargeId TEXT PRIMARY KEY,
        saleId TEXT NOT NULL,
        
        chargeName TEXT NOT NULL,
        amount REAL NOT NULL,
        hsnCode TEXT,
        
        taxType TEXT DEFAULT 'EXCLUSIVE',
        gstRate REAL DEFAULT 0,
        cessRate REAL DEFAULT 0,
        
        taxableAmount REAL NOT NULL,
        cgst REAL DEFAULT 0,
        sgst REAL DEFAULT 0,
        igst REAL DEFAULT 0,
        cess REAL DEFAULT 0,
        
        totalAmount REAL NOT NULL,
        
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        
        FOREIGN KEY (saleId) REFERENCES sales(saleId) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_additional_charges_sale ON additional_charges(saleId);

      -- ============================================
      -- PURCHASES TABLE
      -- ============================================
      CREATE TABLE IF NOT EXISTS purchases (
        purchaseId TEXT PRIMARY KEY,
        billNumber TEXT NOT NULL,
        billDate TEXT NOT NULL,
        
        supplierId TEXT NOT NULL,
        supplierName TEXT NOT NULL,
        supplierGstin TEXT,
        
        subtotal REAL NOT NULL DEFAULT 0,
        
        discountType TEXT DEFAULT 'NONE',
        discountValue REAL DEFAULT 0,
        discountAmount REAL DEFAULT 0,
        
        taxableAmount REAL NOT NULL DEFAULT 0,
        cgst REAL DEFAULT 0,
        sgst REAL DEFAULT 0,
        igst REAL DEFAULT 0,
        cess REAL DEFAULT 0,
        
        totalAmount REAL NOT NULL DEFAULT 0,
        roundOff REAL DEFAULT 0,
        grandTotal REAL NOT NULL DEFAULT 0,
        
        paidAmount REAL DEFAULT 0,
        dueAmount REAL DEFAULT 0,
        paymentStatus TEXT DEFAULT 'UNPAID',
        
        notes TEXT,
        status TEXT DEFAULT 'COMPLETED',
        
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP,
        
        FOREIGN KEY (supplierId) REFERENCES suppliers(supplierId)
      );

      CREATE INDEX IF NOT EXISTS idx_purchases_supplier ON purchases(supplierId);
      CREATE INDEX IF NOT EXISTS idx_purchases_date ON purchases(billDate);
      CREATE INDEX IF NOT EXISTS idx_purchases_status ON purchases(paymentStatus);

      -- ============================================
      -- PURCHASE ITEMS TABLE
      -- ============================================
      CREATE TABLE IF NOT EXISTS purchase_items (
        purchaseItemId TEXT PRIMARY KEY,
        purchaseId TEXT NOT NULL,
        
        productId TEXT NOT NULL,
        productName TEXT NOT NULL,
        hsnCode TEXT,
        
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

      CREATE INDEX IF NOT EXISTS idx_purchase_items_purchase ON purchase_items(purchaseId);
      CREATE INDEX IF NOT EXISTS idx_purchase_items_product ON purchase_items(productId);

      -- ============================================
      -- PAYMENTS TABLE
      -- ============================================
      CREATE TABLE IF NOT EXISTS payments (
        paymentId TEXT PRIMARY KEY,
        paymentDate TEXT NOT NULL,
        
        partyType TEXT NOT NULL,
        partyId TEXT NOT NULL,
        partyName TEXT NOT NULL,
        
        referenceType TEXT,
        referenceId TEXT,
        
        amount REAL NOT NULL,
        paymentMethod TEXT DEFAULT 'CASH',
        
        transactionId TEXT,
        notes TEXT,
        
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_payments_party ON payments(partyId);
      CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(paymentDate);
      CREATE INDEX IF NOT EXISTS idx_payments_reference ON payments(referenceId);

      -- ============================================
      -- EXPENSES TABLE
      -- ============================================
      CREATE TABLE IF NOT EXISTS expenses (
        expenseId TEXT PRIMARY KEY,
        expenseDate TEXT NOT NULL,
        
        category TEXT NOT NULL,
        description TEXT,
        amount REAL NOT NULL,
        
        paymentMethod TEXT DEFAULT 'CASH',
        
        gstApplicable INTEGER DEFAULT 0,
        gstAmount REAL DEFAULT 0,
        
        notes TEXT,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(expenseDate);
      CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);

      -- ============================================
      -- STOCK ADJUSTMENTS TABLE
      -- ============================================
      CREATE TABLE IF NOT EXISTS stock_adjustments (
        adjustmentId TEXT PRIMARY KEY,
        adjustmentDate TEXT NOT NULL,
        
        productId TEXT NOT NULL,
        productName TEXT NOT NULL,
        
        adjustmentType TEXT NOT NULL,
        quantity REAL NOT NULL,
        
        reason TEXT,
        notes TEXT,
        
        createdBy TEXT,
        createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
        
        FOREIGN KEY (productId) REFERENCES products(productId)
      );

      CREATE INDEX IF NOT EXISTS idx_stock_adj_product ON stock_adjustments(productId);
      CREATE INDEX IF NOT EXISTS idx_stock_adj_date ON stock_adjustments(adjustmentDate);

      -- ============================================
      -- INVOICE COUNTER TABLE
      -- ============================================
      CREATE TABLE IF NOT EXISTS invoice (
        invoiceId TEXT PRIMARY KEY,
        invoiceNumber TEXT UNIQUE NOT NULL,
        updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
      );

      -- ============================================
      -- INVOICE COUNTER TABLE
      -- ============================================
      CREATE TABLE IF NOT EXISTS invoice_counter (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        device_id TEXT NOT NULL,
        sequence INTEGER NOT NULL DEFAULT 0,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      INSERT OR IGNORE INTO invoice_counter (id, device_id, sequence) 
      VALUES (1, '', 0);

      -- ============================================
      -- BUSINESS SETTINGS TABLE
      -- ============================================
      CREATE TABLE IF NOT EXISTS business_settings (
        settingKey TEXT PRIMARY KEY,
        settingValue TEXT
      );

      INSERT OR IGNORE INTO business_settings (settingKey, settingValue) VALUES
        ('businessName', ''),
        ('gstin', ''),
        ('pan', ''),
        ('address', ''),
        ('city', ''),
        ('state', ''),
        ('pincode', ''),
        ('phone', ''),
        ('email', ''),
        ('imageUrl', ''),
        ('templateId', ''),
        ('invoicePrefix', 'INV'),
        ('financialYearStart', '04-01'),
        ('defaultGstRate', '18'),
        ('enableCess', '0'),
        ('devicePrefix', 'D1');

    
    `
  }
];

/**
 * Get the latest schema version
 */
export function getLatestVersion(): number {
  return SCHEMA_VERSIONS[SCHEMA_VERSIONS.length - 1]?.version || 1;
}

/**
 * Get all versions from a specific version onwards
 */
export function getVersionsFrom(fromVersion: number): SchemaVersion[] {
  return SCHEMA_VERSIONS.filter(v => v.version > fromVersion);
}
