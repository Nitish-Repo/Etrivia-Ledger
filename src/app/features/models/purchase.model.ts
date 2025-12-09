/**
 * Purchase Models
 */

export type PurchaseStatus = 'DRAFT' | 'COMPLETED' | 'CANCELLED';

export interface Purchase {
  purchaseId?: string;
  billNumber: string;
  billDate: string;
  
  supplierId: string;
  supplierName: string;
  supplierGstin?: string;
  
  subtotal: number;
  
  discountType: 'NONE' | 'PERCENTAGE' | 'AMOUNT';
  discountValue: number;
  discountAmount: number;
  
  taxableAmount: number;
  cgst: number;
  sgst: number;
  igst: number;
  cess: number;
  
  totalAmount: number;
  roundOff: number;
  grandTotal: number;
  
  paidAmount: number;
  dueAmount: number;
  paymentStatus: 'PAID' | 'PARTIAL' | 'UNPAID';
  
  notes?: string;
  status: PurchaseStatus;
  
  createdAt?: string | Date;
  updatedAt?: string | Date;
  
  items?: PurchaseItem[];
}

export interface PurchaseItem {
  purchaseItemId?: string;
  purchaseId: string;
  
  productId: string;
  productName: string;
  hsnCode?: string;
  
  quantity: number;
  unit: string;
  
  pricePerUnit: number;
  taxType: 'INCLUSIVE' | 'EXCLUSIVE';
  
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
