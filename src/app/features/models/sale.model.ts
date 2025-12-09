/**
 * Sale/Invoice Models
 */

export type PaymentStatus = 'PAID' | 'PARTIAL' | 'UNPAID';
export type SaleType = 'CASH' | 'CREDIT' | 'ONLINE';
export type SaleStatus = 'DRAFT' | 'COMPLETED' | 'CANCELLED';

export interface Sale {
  saleId?: string;
  invoiceNumber: string;
  invoiceDate: string;
  
  customerId: string;
  customerName: string;
  customerGstin?: string;
  
  // Amounts
  subtotal: number;
  
  // Discounts
  discountType: 'NONE' | 'PERCENTAGE' | 'AMOUNT';
  discountValue: number;
  discountAmount: number;
  
  // Tax Breakdown
  taxableAmount: number;
  cgst: number;
  sgst: number;
  igst: number;
  cess: number;
  
  // Final
  totalAmount: number;
  roundOff: number;
  grandTotal: number;
  
  // Payment
  paidAmount: number;
  dueAmount: number;
  paymentStatus: PaymentStatus;
  
  // Meta
  notes?: string;
  saleType: SaleType;
  status: SaleStatus;
  
  createdBy?: string;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  
  // Items (not stored in sale table, separate table)
  items?: SaleItem[];
}

export interface SaleItem {
  saleItemId?: string;
  saleId: string;
  
  productId: string;
  productName: string;
  hsnCode?: string;
  
  quantity: number;
  unit: string;
  
  // Pricing
  pricePerUnit: number;
  taxType: 'INCLUSIVE' | 'EXCLUSIVE';
  
  // Discount at item level
  discountType: 'NONE' | 'PERCENTAGE' | 'AMOUNT';
  discountValue: number;
  discountAmount: number;
  
  // Tax
  taxableAmount: number;
  gstRate: number;
  cessRate: number;
  cgst: number;
  sgst: number;
  igst: number;
  cess: number;
  
  totalAmount: number;
  
  createdAt?: string | Date;
}

/**
 * Calculate sale totals from items
 */
export function calculateSaleTotals(items: SaleItem[], discountType: 'NONE' | 'PERCENTAGE' | 'AMOUNT' = 'NONE', discountValue: number = 0): Partial<Sale> {
  const subtotal = items.reduce((sum, item) => sum + (item.pricePerUnit * item.quantity), 0);
  
  // Calculate discount
  let discountAmount = 0;
  if (discountType === 'PERCENTAGE') {
    discountAmount = (subtotal * discountValue) / 100;
  } else if (discountType === 'AMOUNT') {
    discountAmount = discountValue;
  }
  
  const taxableAmount = items.reduce((sum, item) => sum + item.taxableAmount, 0);
  const cgst = items.reduce((sum, item) => sum + item.cgst, 0);
  const sgst = items.reduce((sum, item) => sum + item.sgst, 0);
  const igst = items.reduce((sum, item) => sum + item.igst, 0);
  const cess = items.reduce((sum, item) => sum + item.cess, 0);
  
  const totalAmount = taxableAmount + cgst + sgst + igst + cess;
  const roundOff = Math.round(totalAmount) - totalAmount;
  const grandTotal = Math.round(totalAmount);
  
  return {
    subtotal,
    discountType,
    discountValue,
    discountAmount,
    taxableAmount,
    cgst,
    sgst,
    igst,
    cess,
    totalAmount,
    roundOff,
    grandTotal
  };
}
