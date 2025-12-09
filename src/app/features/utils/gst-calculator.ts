/**
 * GST Calculation Utilities
 */

export type TaxType = 'INCLUSIVE' | 'EXCLUSIVE';

export interface GstCalculationResult {
  baseAmount: number;
  taxableAmount: number;
  gstRate: number;
  cessRate: number;
  cgst: number;
  sgst: number;
  igst: number;
  cess: number;
  totalTax: number;
  totalAmount: number;
}

/**
 * Calculate GST breakdown for a given amount
 * @param amount - The price amount
 * @param gstRate - GST rate (0, 5, 12, 18, 28)
 * @param cessRate - CESS rate (default 0)
 * @param taxType - INCLUSIVE or EXCLUSIVE
 * @param isInterState - true for IGST, false for CGST+SGST
 */
export function calculateGst(
  amount: number,
  gstRate: number,
  cessRate: number = 0,
  taxType: TaxType = 'INCLUSIVE',
  isInterState: boolean = false
): GstCalculationResult {
  
  let baseAmount: number;
  let taxableAmount: number;
  
  if (taxType === 'INCLUSIVE') {
    // Price includes tax, extract base amount
    const totalRate = gstRate + cessRate;
    baseAmount = amount / (1 + totalRate / 100);
    taxableAmount = baseAmount;
  } else {
    // Tax is on top
    baseAmount = amount;
    taxableAmount = amount;
  }
  
  // Calculate GST
  const gstAmount = (taxableAmount * gstRate) / 100;
  const cessAmount = (taxableAmount * cessRate) / 100;
  
  let cgst = 0;
  let sgst = 0;
  let igst = 0;
  
  if (isInterState) {
    // Inter-state transaction: IGST
    igst = gstAmount;
  } else {
    // Intra-state transaction: CGST + SGST
    cgst = gstAmount / 2;
    sgst = gstAmount / 2;
  }
  
  const totalTax = gstAmount + cessAmount;
  const totalAmount = taxableAmount + totalTax;
  
  return {
    baseAmount: roundToTwo(baseAmount),
    taxableAmount: roundToTwo(taxableAmount),
    gstRate,
    cessRate,
    cgst: roundToTwo(cgst),
    sgst: roundToTwo(sgst),
    igst: roundToTwo(igst),
    cess: roundToTwo(cessAmount),
    totalTax: roundToTwo(totalTax),
    totalAmount: roundToTwo(totalAmount)
  };
}

/**
 * Calculate discount amount
 */
export function calculateDiscount(
  amount: number,
  discountType: 'NONE' | 'PERCENTAGE' | 'AMOUNT',
  discountValue: number
): number {
  if (discountType === 'NONE' || discountValue === 0) {
    return 0;
  }
  
  if (discountType === 'PERCENTAGE') {
    return roundToTwo((amount * discountValue) / 100);
  }
  
  // AMOUNT
  return roundToTwo(discountValue);
}

/**
 * Calculate line item total with discount and GST
 */
export function calculateLineItemTotal(
  quantity: number,
  pricePerUnit: number,
  gstRate: number,
  cessRate: number = 0,
  taxType: TaxType = 'INCLUSIVE',
  isInterState: boolean = false,
  discountType: 'NONE' | 'PERCENTAGE' | 'AMOUNT' = 'NONE',
  discountValue: number = 0
): GstCalculationResult & { quantity: number; pricePerUnit: number; discountAmount: number } {
  
  const subtotal = quantity * pricePerUnit;
  const discountAmount = calculateDiscount(subtotal, discountType, discountValue);
  const amountAfterDiscount = subtotal - discountAmount;
  
  const gstCalc = calculateGst(amountAfterDiscount, gstRate, cessRate, taxType, isInterState);
  
  return {
    ...gstCalc,
    quantity,
    pricePerUnit,
    discountAmount: roundToTwo(discountAmount)
  };
}

/**
 * Detect if transaction is inter-state based on GST numbers
 */
export function isInterStateTransaction(sellerGstin?: string, buyerGstin?: string): boolean {
  if (!sellerGstin || !buyerGstin) {
    return false; // Default to intra-state if GSTIN not available
  }
  
  // First 2 digits of GSTIN represent state code
  const sellerState = sellerGstin.substring(0, 2);
  const buyerState = buyerGstin.substring(0, 2);
  
  return sellerState !== buyerState;
}

/**
 * Round to 2 decimal places
 */
function roundToTwo(num: number): number {
  return Math.round((num + Number.EPSILON) * 100) / 100;
}

/**
 * Calculate reverse GST (extract base from tax-inclusive amount)
 */
export function reverseGst(inclusiveAmount: number, gstRate: number): {
  baseAmount: number;
  gstAmount: number;
} {
  const baseAmount = inclusiveAmount / (1 + gstRate / 100);
  const gstAmount = inclusiveAmount - baseAmount;
  
  return {
    baseAmount: roundToTwo(baseAmount),
    gstAmount: roundToTwo(gstAmount)
  };
}
