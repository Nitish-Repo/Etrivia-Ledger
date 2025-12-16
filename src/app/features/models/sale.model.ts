/**
 * Sale/Invoice Models
 */

import { ModelMeta } from '@app/shared-services';
import { TaxType, DiscountType } from './product.model';

/**
 * Payment Status Enum
 */
export enum PaymentStatus {
  PAID = 'PAID',
  PARTIAL = 'PARTIAL',
  UNPAID = 'UNPAID'
}

/**
 * Sale Type Enum
 */
export enum SaleType {
  CASH = 'CASH',
  CREDIT = 'CREDIT',
  ONLINE = 'ONLINE'
}

/**
 * Sale Status Enum
 */
export enum SaleStatus {
  DRAFT = 'DRAFT',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

/**
 * Additional Charge Model
 * For extra charges like shipping, packaging, handling, insurance, etc.
 */
export interface AdditionalCharge {
  chargeId?: string;
  saleId: string;
  chargeName: string;          // e.g., "Shipping", "Packaging", "Handling"
  amount: number;              // Base amount
  hsnCode?: string;            // HSN/SAC code for the service
  taxType: TaxType;            // Inclusive or Exclusive
  gstRate: number;             // GST percentage (0, 5, 12, 18, 28)
  cessRate: number;            // CESS percentage
  
  // Calculated values
  taxableAmount: number;       // Amount after tax adjustment
  cgst: number;
  sgst: number;
  igst: number;
  cess: number;
  totalAmount: number;         // Final amount including tax

  createdAt?: string | Date;
}

export interface Sale {
  saleId?: string;
  invoiceNumber: string;
  invoiceDate: string;
  
  // Customer Info (denormalized for historical snapshot - GST compliance requirement)
  customerId: string;
  customerName: string;        // Snapshot: name at time of sale
  customerGstin?: string;      // Snapshot: GSTIN at time of sale
  
  // Amounts
  subtotal: number;
  
  // Invoice-Level Discount (additional discount applied on entire invoice after item discounts)
  invoiceDiscountType: DiscountType;
  invoiceDiscountValue: number;    // Input value: % or ₹ amount
  TotalDiscountAmount: number;   // Calculated discount in ₹
  
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
  taxType: TaxType;
  
  // Discount at item level
  discountType: DiscountType;
  discountValue: number;
  discountAmount: number;
  
  // Tax (Rates are percentages, amounts are in ₹)
  taxableAmount: number;
  gstRate: number;           // GST percentage (e.g., 18%)
  cessRate: number;          // CESS percentage (e.g., 0.5%)
  cgst: number;              // Calculated CGST amount in ₹ (for intra-state)
  sgst: number;              // Calculated SGST amount in ₹ (for intra-state)
  igst: number;              // Calculated IGST amount in ₹ (for inter-state)
  cess: number;              // Calculated CESS amount in ₹
  
  totalAmount: number;
  
  createdAt?: string | Date;
}

/**
 * Form Metadata for Sale
 */
export function getSaleMeta() {
  return [
    { key: 'saleId', label: 'Sale ID', hide: true },
    { key: 'invoiceNumber', label: 'Invoice Number', required: true },
    { key: 'invoiceDate', label: 'Invoice Date', required: true, controlType: 'date' },
    
    // Customer Details
    { key: 'customerId', label: 'Customer ID', required: true },
    { key: 'customerName', label: 'Customer Name', required: true },
    { key: 'customerGstin', label: 'Customer GSTIN', required: false },
    
    // Amounts
    { key: 'subtotal', label: 'Subtotal', required: true, controlType: 'number' },
    
    // Invoice-Level Discount
    {
      key: 'invoiceDiscountType',
      label: 'Invoice Discount Type',
      controlType: 'dropdown',
      options: [
        { key: DiscountType.NONE, value: 'No Discount' },
        { key: DiscountType.PERCENTAGE, value: 'Percentage (%)' },
        { key: DiscountType.AMOUNT, value: 'Amount (₹)' },
      ],
    },
    { key: 'invoiceDiscountValue', label: 'Discount Value', required: false, controlType: 'number' },
    { key: 'TotalDiscountAmount', label: 'Total Discount Amount (₹)', required: false, controlType: 'number' },
    
    // Tax Breakdown
    { key: 'taxableAmount', label: 'Taxable Amount', required: true, controlType: 'number' },
    { key: 'cgst', label: 'CGST', required: false, controlType: 'number' },
    { key: 'sgst', label: 'SGST', required: false, controlType: 'number' },
    { key: 'igst', label: 'IGST', required: false, controlType: 'number' },
    { key: 'cess', label: 'CESS', required: false, controlType: 'number' },
    
    // Final
    { key: 'totalAmount', label: 'Total Amount', required: true, controlType: 'number' },
    { key: 'roundOff', label: 'Round Off', required: false, controlType: 'number' },
    { key: 'grandTotal', label: 'Grand Total', required: true, controlType: 'number' },
    
    // Payment
    { key: 'paidAmount', label: 'Paid Amount', required: true, controlType: 'number' },
    { key: 'dueAmount', label: 'Due Amount', required: false, controlType: 'number' },
    {
      key: 'paymentStatus',
      label: 'Payment Status',
      controlType: 'dropdown',
      options: [
        { key: PaymentStatus.PAID, value: 'Paid' },
        { key: PaymentStatus.PARTIAL, value: 'Partial' },
        { key: PaymentStatus.UNPAID, value: 'Unpaid' },
      ],
    },
    
    // Meta
    { key: 'notes', label: 'Notes', required: false },
    {
      key: 'saleType',
      label: 'Sale Type',
      controlType: 'dropdown',
      options: [
        { key: SaleType.CASH, value: 'Cash' },
        { key: SaleType.CREDIT, value: 'Credit' },
        { key: SaleType.ONLINE, value: 'Online' },
      ],
    },
    {
      key: 'status',
      label: 'Status',
      controlType: 'dropdown',
      options: [
        { key: SaleStatus.DRAFT, value: 'Draft' },
        { key: SaleStatus.COMPLETED, value: 'Completed' },
        { key: SaleStatus.CANCELLED, value: 'Cancelled' },
      ],
    },
  ] as Array<ModelMeta>;
}

/**
 * Form Metadata for Additional Charge
 */
export function getAdditionalChargeMeta() {
  return [
    { key: 'chargeId', label: 'Charge ID', hide: true },
    { key: 'saleId', label: 'Sale ID', hide: true },
    { key: 'chargeName', label: 'Charge Name', required: true },
    { key: 'amount', label: 'Amount', required: true, controlType: 'number' },
    { key: 'hsnCode', label: 'HSN/SAC Code', required: false },
    {
      key: 'taxType',
      label: 'Tax Type',
      controlType: 'dropdown',
      options: [
        { key: TaxType.INCLUSIVE, value: 'Tax Inclusive' },
        { key: TaxType.EXCLUSIVE, value: 'Tax Exclusive' },
      ],
    },
    { key: 'gstRate', label: 'GST Rate %', required: true, controlType: 'number' },
    { key: 'cessRate', label: 'CESS Rate %', required: false, controlType: 'number' },
    { key: 'taxableAmount', label: 'Taxable Amount (Auto)', required: false, controlType: 'number' },
    { key: 'cgst', label: 'CGST (Auto)', required: false, controlType: 'number' },
    { key: 'sgst', label: 'SGST (Auto)', required: false, controlType: 'number' },
    { key: 'igst', label: 'IGST (Auto)', required: false, controlType: 'number' },
    { key: 'cess', label: 'CESS (Auto)', required: false, controlType: 'number' },
    { key: 'totalAmount', label: 'Total Amount (Auto)', required: false, controlType: 'number' },
    { key: 'createdAt', label: 'Created At', required: false, hide: true },
  ] as Array<ModelMeta>;
}

/**
 * Form Metadata for Sale Item
 */
export function getSaleItemMeta() {
  return [
    { key: 'saleItemId', label: 'Sale Item ID', hide: true },
    { key: 'saleId', label: 'Sale ID', hide: true },
    
    // Product Details
    { key: 'productId', label: 'Product ID', required: true },
    { key: 'productName', label: 'Product Name', required: true },
    { key: 'hsnCode', label: 'HSN Code', required: false },
    
    // Quantity
    { key: 'quantity', label: 'Quantity', required: true, controlType: 'number' },
    { key: 'unit', label: 'Unit', required: true },
    
    // Pricing
    { key: 'pricePerUnit', label: 'Price Per Unit', required: true, controlType: 'number' },
    {
      key: 'taxType',
      label: 'Tax Type',
      controlType: 'dropdown',
      options: [
        { key: TaxType.INCLUSIVE, value: 'Tax Inclusive' },
        { key: TaxType.EXCLUSIVE, value: 'Tax Exclusive' },
      ],
    },
    
    // Discount
    {
      key: 'discountType',
      label: 'Discount Type',
      controlType: 'dropdown',
      options: [
        { key: DiscountType.NONE, value: 'No Discount' },
        { key: DiscountType.PERCENTAGE, value: 'Percentage' },
        { key: DiscountType.AMOUNT, value: 'Amount' },
      ],
    },
    { key: 'discountValue', label: 'Discount Value', required: false, controlType: 'number' },
    { key: 'discountAmount', label: 'Discount Amount', required: false, controlType: 'number' },
    
    // Tax
    { key: 'taxableAmount', label: 'Taxable Amount', required: true, controlType: 'number' },
    { key: 'gstRate', label: 'GST Rate %', required: true, controlType: 'number' },
    { key: 'cessRate', label: 'CESS Rate %', required: false, controlType: 'number' },
    { key: 'cgst', label: 'CGST Amount', required: false, controlType: 'number' },
    { key: 'sgst', label: 'SGST Amount', required: false, controlType: 'number' },
    { key: 'igst', label: 'IGST Amount', required: false, controlType: 'number' },
    { key: 'cess', label: 'CESS Amount', required: false, controlType: 'number' },
    
    // Total
    { key: 'totalAmount', label: 'Total Amount', required: true, controlType: 'number' },
  ] as Array<ModelMeta>;
}

/**
 * Calculate sale totals from items
 */
export function calculateSaleTotals(items: SaleItem[], invoiceDiscountType: DiscountType = DiscountType.NONE, invoiceDiscountValue: number = 0): Partial<Sale> {
  const subtotal = items.reduce((sum, item) => sum + (item.pricePerUnit * item.quantity), 0);
  
  // Calculate invoice-level discount
  let invoiceDiscountAmount = 0;
  if (invoiceDiscountType === DiscountType.PERCENTAGE) {
    invoiceDiscountAmount = (subtotal * invoiceDiscountValue) / 100;
  } else if (invoiceDiscountType === DiscountType.AMOUNT) {
    invoiceDiscountAmount = invoiceDiscountValue;
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
    invoiceDiscountType,
    invoiceDiscountValue,
    TotalDiscountAmount: invoiceDiscountAmount,
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
