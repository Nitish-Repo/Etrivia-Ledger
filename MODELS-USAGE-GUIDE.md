# 🎯 TypeScript Models & Utilities - Complete Guide

## ✅ **What's Been Created**

### **1. Models Created:**
- ✅ `product-enhanced.model.ts` - Enhanced product with GST, pricing tiers
- ✅ `supplier.model.ts` - Supplier with GST support
- ✅ `sale.model.ts` - Sales/Invoices with complete GST breakdown
- ✅ `purchase.model.ts` - Purchase orders with GST
- ✅ `payment.model.ts` - Payment tracking
- ✅ `expense.model.ts` - Expense management
- ✅ `stock-adjustment.model.ts` - Stock movements
- ✅ `business-settings.model.ts` - Business configuration

### **2. Utilities Created:**
- ✅ `gst-calculator.ts` - Complete GST calculation engine

---

## 🔥 **How to Use the Models**

### **Example 1: Create a Product**
```typescript
import { ProductEnhanced, calculateProfitMargin } from '@app/features/models';

const product: ProductEnhanced = {
  productName: 'Laptop',
  hsnCode: '8471',
  unit: 'PCS',
  
  // Purchase (Tax Exclusive)
  purchasePrice: 40000,
  purchaseTaxType: 'EXCLUSIVE',
  purchaseGstRate: 18,
  purchaseCessRate: 0,
  
  // Sale (Tax Inclusive)
  retailPrice: 59000,
  wholesalePrice: 55000,
  saleTaxType: 'INCLUSIVE',
  saleGstRate: 18,
  saleCessRate: 0,
  
  // Inventory
  currentStock: 10,
  minStockLevel: 5,
  
  discountType: 'NONE',
  discountValue: 0,
  isActive: true
};

// Calculate profit margin
const margin = calculateProfitMargin(product);
console.log(`Profit Margin: ${margin}%`);
```

---

### **Example 2: Create a Sale with GST**
```typescript
import { Sale, SaleItem, calculateLineItemTotal } from '@app/features/models';
import { calculateGst } from '@app/features/utils/gst-calculator';

// Calculate line item
const item1Calc = calculateLineItemTotal(
  2,              // quantity
  500,            // price per unit
  18,             // GST 18%
  0,              // No CESS
  'INCLUSIVE',    // Tax included in price
  false,          // Intra-state (CGST+SGST)
  'PERCENTAGE',   // Discount type
  10              // 10% discount
);

const item1: SaleItem = {
  saleId: 'sale-123',
  productId: 'prod-456',
  productName: 'Laptop',
  hsnCode: '8471',
  quantity: item1Calc.quantity,
  unit: 'PCS',
  pricePerUnit: item1Calc.pricePerUnit,
  taxType: 'INCLUSIVE',
  discountType: 'PERCENTAGE',
  discountValue: 10,
  discountAmount: item1Calc.discountAmount,
  taxableAmount: item1Calc.taxableAmount,
  gstRate: item1Calc.gstRate,
  cessRate: item1Calc.cessRate,
  cgst: item1Calc.cgst,
  sgst: item1Calc.sgst,
  igst: item1Calc.igst,
  cess: item1Calc.cess,
  totalAmount: item1Calc.totalAmount
};

const sale: Sale = {
  invoiceNumber: 'INV-001',
  invoiceDate: new Date().toISOString(),
  customerId: 'cust-123',
  customerName: 'John Doe',
  customerGstin: '29ABCDE1234F1Z5',
  
  subtotal: 1000,
  discountType: 'NONE',
  discountValue: 0,
  discountAmount: 0,
  taxableAmount: item1.taxableAmount,
  cgst: item1.cgst,
  sgst: item1.sgst,
  igst: 0,
  cess: 0,
  totalAmount: item1.totalAmount,
  roundOff: 0,
  grandTotal: Math.round(item1.totalAmount),
  
  paidAmount: 500,
  dueAmount: Math.round(item1.totalAmount) - 500,
  paymentStatus: 'PARTIAL',
  saleType: 'CREDIT',
  status: 'COMPLETED',
  
  items: [item1]
};
```

---

### **Example 3: GST Calculator**
```typescript
import { calculateGst, isInterStateTransaction } from '@app/features/utils/gst-calculator';

// Calculate GST for ₹1000 with 18% GST (Tax Inclusive)
const result1 = calculateGst(1000, 18, 0, 'INCLUSIVE', false);
console.log(result1);
/*
{
  baseAmount: 847.46,
  taxableAmount: 847.46,
  gstRate: 18,
  cgst: 76.27,
  sgst: 76.27,
  igst: 0,
  cess: 0,
  totalTax: 152.54,
  totalAmount: 1000
}
*/

// Calculate GST for ₹1000 with 18% GST (Tax Exclusive)
const result2 = calculateGst(1000, 18, 0, 'EXCLUSIVE', false);
console.log(result2);
/*
{
  baseAmount: 1000,
  taxableAmount: 1000,
  gstRate: 18,
  cgst: 90,
  sgst: 90,
  igst: 0,
  cess: 0,
  totalTax: 180,
  totalAmount: 1180
}
*/

// Inter-state detection
const isInterState = isInterStateTransaction(
  '29ABCDE1234F1Z5',  // Karnataka (29)
  '27ABCDE1234F1Z5'   // Maharashtra (27)
);
console.log(isInterState); // true
```

---

### **Example 4: Payment Recording**
```typescript
import { Payment } from '@app/features/models';

const payment: Payment = {
  paymentDate: new Date().toISOString(),
  partyType: 'CUSTOMER',
  partyId: 'cust-123',
  partyName: 'John Doe',
  referenceType: 'SALE',
  referenceId: 'sale-123',
  amount: 500,
  paymentMethod: 'UPI',
  transactionId: 'UPI123456789',
  notes: 'Partial payment received'
};
```

---

## 📊 **Key Formulas**

### **GST Calculation (Tax Inclusive)**
```
Base Amount = Amount / (1 + GST% / 100)
GST Amount = Amount - Base Amount
CGST = GST Amount / 2
SGST = GST Amount / 2
```

### **GST Calculation (Tax Exclusive)**
```
GST Amount = Amount × (GST% / 100)
CGST = GST Amount / 2
SGST = GST Amount / 2
Total = Amount + GST Amount
```

### **Discount Calculation**
```
If Percentage: Discount = Amount × (Discount% / 100)
If Amount: Discount = Fixed Amount
Final = Amount - Discount
```

### **Profit Margin**
```
Margin% = ((Sale Price - Purchase Cost) / Purchase Cost) × 100
```

---

## 🎯 **Database Integration**

To save these models to the database, use the updated `DatabaseService`:

```typescript
import { DatabaseService } from '@app/core/database-services';
import { ProductEnhanced } from '@app/features/models';

constructor(private db: DatabaseService) {}

// Insert product
const product: ProductEnhanced = { ... };
this.db.insert$('products', product).subscribe({
  next: (id) => console.log('Product saved:', id),
  error: (err) => console.error('Error:', err)
});

// Get all products
this.db.getAll$<ProductEnhanced>('products').subscribe({
  next: (products) => console.log('Products:', products)
});
```

---

## 🚀 **Next Steps**

1. ✅ Models created
2. ✅ GST calculator created
3. ⏳ **TODO**: Update existing Product service to use ProductEnhanced
4. ⏳ **TODO**: Create Sale service with GST calculations
5. ⏳ **TODO**: Create Purchase service
6. ⏳ **TODO**: Create Reports service
7. ⏳ **TODO**: Create PDF Invoice generator

Ready to use! 🎉
