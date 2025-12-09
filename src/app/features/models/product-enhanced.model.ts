/**
 * Enhanced Product Model with GST Support
 */

export type TaxType = 'INCLUSIVE' | 'EXCLUSIVE';
export type DiscountType = 'NONE' | 'PERCENTAGE' | 'AMOUNT';
export type UnitType = 'PCS' | 'KG' | 'LITER' | 'METER' | 'BOX' | 'DOZEN';

export interface ProductEnhanced {
  productId?: string;
  productName: string;
  hsnCode?: string;              // HSN/SAC code for GST
  barcode?: string;
  sku?: string;
  description?: string;
  category?: string;
  unit: UnitType;
  
  // Purchase Pricing
  purchasePrice: number;
  purchaseTaxType: TaxType;
  purchaseGstRate: number;       // 0, 5, 12, 18, 28
  purchaseCessRate: number;
  
  // Sale Pricing (Multiple tiers)
  wholesalePrice?: number;
  retailPrice: number;
  mrp?: number;
  saleTaxType: TaxType;
  saleGstRate: number;
  saleCessRate: number;
  
  // Discount
  discountType: DiscountType;
  discountValue: number;
  
  // Inventory
  currentStock: number;
  minStockLevel: number;
  maxStockLevel?: number;
  
  // Meta
  imageUrl?: string;
  isActive: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

/**
 * Calculate actual purchase cost including GST
 */
export function calculatePurchaseCost(product: ProductEnhanced): number {
  const { purchasePrice, purchaseTaxType, purchaseGstRate, purchaseCessRate } = product;
  
  if (purchaseTaxType === 'EXCLUSIVE') {
    // Tax is on top of price
    const gstAmount = (purchasePrice * purchaseGstRate) / 100;
    const cessAmount = (purchasePrice * purchaseCessRate) / 100;
    return purchasePrice + gstAmount + cessAmount;
  }
  
  // INCLUSIVE - price already contains tax
  return purchasePrice;
}

/**
 * Calculate actual sale price including GST
 */
export function calculateSalePrice(product: ProductEnhanced, priceType: 'RETAIL' | 'WHOLESALE' = 'RETAIL'): number {
  const basePrice = priceType === 'WHOLESALE' ? (product.wholesalePrice || product.retailPrice) : product.retailPrice;
  const { saleTaxType, saleGstRate, saleCessRate } = product;
  
  if (saleTaxType === 'EXCLUSIVE') {
    const gstAmount = (basePrice * saleGstRate) / 100;
    const cessAmount = (basePrice * saleCessRate) / 100;
    return basePrice + gstAmount + cessAmount;
  }
  
  return basePrice;
}

/**
 * Calculate profit margin
 */
export function calculateProfitMargin(product: ProductEnhanced): number {
  const cost = calculatePurchaseCost(product);
  const price = calculateSalePrice(product);
  
  if (cost === 0) return 0;
  
  return ((price - cost) / cost) * 100;
}

/**
 * Check if stock is low
 */
export function isLowStock(product: ProductEnhanced): boolean {
  return product.currentStock <= product.minStockLevel;
}
