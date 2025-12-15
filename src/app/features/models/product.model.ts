import { ModelMeta } from '@app/shared-services';
import { UnitOfMeasure, UOM_LABELS } from './unit-of-measure.model';

/**
 * Tax Types Enum
 */
export enum TaxType {
  INCLUSIVE = 'INCLUSIVE',
  EXCLUSIVE = 'EXCLUSIVE'
}

/**
 * Discount Types Enum
 */
export enum DiscountType {
  PERCENTAGE = 'PERCENTAGE',
  AMOUNT = 'AMOUNT'
}

/**
 * Enhanced Product Model with GST Support
 */
export interface Product {
  productId?: string;
  productName: string;
  description?: string;
  isfavourite?:boolean;
  
  // Tax Classification
  hsnCode?: string;
  barcode?: string;
  sku?: string;
  
  // Purchase Pricing
  purchaseCost?: number;
  purchaseTaxType?: TaxType;           // Tax inclusive or exclusive for purchase
  purchaseGstRate?: number;            // GST % on purchase (0, 5, 12, 18, 28)
  purchaseCessRate?: number;           // CESS % on purchase
  
  // Sale Pricing
  retailPrice?: number;                // Retail selling price
  wholesalePrice?: number;             // Wholesale selling price
  mrp?: number;                        // Maximum Retail Price
  saleTaxType?: TaxType;               // Tax inclusive or exclusive for sale
  saleGstRate?: number;                // GST % on sale
  saleCessRate?: number;               // CESS % on sale
  
  // Discount
  discountType?: DiscountType;
  discountValue?: number;
  
  // Inventory
  unitMeasure?: string;                       // Unit of measure (PCS, KG, etc.)
  isInventory?: boolean;               // Enable inventory management
  currentStock?: number;  
  minStockLevel?: number;              // Minimum stock alert level
  maxStockLevel?: number;              // Maximum stock level
  
  // General
  imageUrl?: string;
  category?: string;
  isActive?: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

/**
 * Form Metadata for Product
 */
export function getProductMeta() {
  return [
    { key: 'productId', label: 'ProductId', hide: true },
    { key: 'productName', label: 'Product Name', required: true },
    { key: 'description', label: 'Description', required: false },
    
    // Tax Classification
    { key: 'hsnCode', label: 'HSN Code', required: false },
    { key: 'barcode', label: 'Barcode', required: false },
    { key: 'sku', label: 'SKU', required: false },
    
    // Purchase Details
    { key: 'purchaseCost', label: 'Purchase Cost', required: false, controlType: 'number' },
    {
      key: 'purchaseTaxType',
      label: 'label.purchase_tax_type',
      controlType: 'select',
      options: [
        { key: TaxType.INCLUSIVE, value: 'label.tax_inclusive' },
        { key: TaxType.EXCLUSIVE, value: 'label.tax_exclusive' },
      ],
    },
    { key: 'purchaseGstRate', label: 'Purchase GST %', required: false, controlType: 'number' },
    { key: 'purchaseCessRate', label: 'Purchase CESS %', required: false, controlType: 'number' },
    
    // Sale Details
    { key: 'retailPrice', label: 'Retail Price', required: false, controlType: 'number' },
    { key: 'wholesalePrice', label: 'Wholesale Price', required: false, controlType: 'number' },
    { key: 'mrp', label: 'MRP', required: false, controlType: 'number' },
    {
      key: 'saleTaxType',
      label: 'label.sale_tax_type',
      controlType: 'select',
      options: [
        { key: TaxType.INCLUSIVE, value: 'label.tax_inclusive' },
        { key: TaxType.EXCLUSIVE, value: 'label.tax_exclusive' },
      ],
    },
    { key: 'saleGstRate', label: 'Sale GST %', required: false, controlType: 'number' },
    { key: 'saleCessRate', label: 'Sale CESS %', required: false, controlType: 'number' },
    
    // Discount
    {
      key: 'discountType',
      label: 'label.discount_type',
      controlType: 'select',
      options: [
        { key: DiscountType.PERCENTAGE, value: 'label.percentage' },
        { key: DiscountType.AMOUNT, value: 'label.amount' },
      ],
    },
    { key: 'discountValue', label: 'Discount Value', required: false, controlType: 'number' },
    
    // Inventory
    {
      key: 'unitMeasure',
      label: 'label.unit_measurement',
      controlType: 'select',
      options: Object.entries(UOM_LABELS).map(([key, value]) => ({
        key: key as UnitOfMeasure,
        value
      })),
    },
    { key: 'currentStock', label: 'Current Stock', required: false, controlType: 'number' },
    { key: 'minStockLevel', label: 'Min Stock Level', required: false, controlType: 'number' },
    { key: 'maxStockLevel', label: 'Max Stock Level', required: false, controlType: 'number' },
    
    // General
    { key: 'imageUrl', label: 'Image URL', required: false },
    { key: 'category', label: 'Category', required: false },
    
    {
      key: 'isActive',
      label: 'Is Active',
      controlType: 'radio',
      options: [
        { key: true, value: 'Yes' },
        { key: false, value: 'No' },
      ],
    },
    {
      key: 'isInventory',
      label: 'Manage Inventory',
      controlType: 'radio',
      options: [
        { key: true, value: 'Yes' },
        { key: false, value: 'No' },
      ],
    },
    {
      key: 'isInventory',
      label: 'Track Inventory',
      controlType: 'radio',
      options: [
        { key: true, value: 'Yes' },
        { key: false, value: 'No' },
      ],
    },
    { key: 'createdAt', label: 'Created at', required: false, hide: true },
    { key: 'updatedAt', label: 'Updated at', required: false, hide: true },
  ] as Array<ModelMeta>;
}


/**
 * Legacy Product Interface (for backward compatibility)
 */
export interface ProductLegacy {
  productId?: string;
  productName: string;
  description?: string;
  hsnCode?: string;
  sacCode?: string;
  unitMeasure?: string;
  price?: number;
  purchaseCost?: number;
  imageUrl?: string;
  category?: string;
  isActive: boolean;
  isThreshold: boolean;
  warnThresholdNumber: number;
  infoThresholdNumber: number;
  isInventory: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
}

/**
 * Product with Inventory Count
 */
export interface ProductWithInventory extends Product {
  count: number;
}

/**
 * Helper Functions
 */

/**
 * Calculate total purchase cost including tax
 */
export function calculatePurchaseCost(product: Product, quantity: number = 1): number {
  const baseCost = product.purchaseCost || 0;
  const gstRate = product.purchaseGstRate || 0;
  const cessRate = product.purchaseCessRate || 0;
  
  if (product.purchaseTaxType === TaxType.INCLUSIVE) {
    return baseCost * quantity;
  } else {
    const taxAmount = baseCost * (gstRate + cessRate) / 100;
    return (baseCost + taxAmount) * quantity;
  }
}

/**
 * Calculate sale price after discount and tax
 */
export function calculateSalePrice(product: Product, quantity: number = 1, useWholesale: boolean = false): number {
  const basePrice = useWholesale ? (product.wholesalePrice || 0) : (product.retailPrice || 0);
  let finalPrice = basePrice;
  
  // Apply discount
  if (product.discountValue) {
    if (product.discountType === DiscountType.PERCENTAGE) {
      finalPrice = basePrice * (1 - product.discountValue / 100);
    } else {
      finalPrice = basePrice - product.discountValue;
    }
  }
  
  // Apply tax if exclusive
  if (product.saleTaxType === TaxType.EXCLUSIVE) {
    const gstRate = product.saleGstRate || 0;
    const cessRate = product.saleCessRate || 0;
    const taxAmount = finalPrice * (gstRate + cessRate) / 100;
    finalPrice = finalPrice + taxAmount;
  }
  
  return finalPrice * quantity;
}

/**
 * Calculate profit margin percentage
 */
export function calculateProfitMargin(product: Product, useWholesale: boolean = false): number {
  const purchaseCost = product.purchaseCost || 0;
  const salePrice = useWholesale ? (product.wholesalePrice || 0) : (product.retailPrice || 0);
  
  if (purchaseCost === 0) return 0;
  
  return ((salePrice - purchaseCost) / purchaseCost) * 100;
}

/**
 * Check if product is low stock
 */
export function isLowStock(product: Product): boolean {
  if (!product.isInventory) return false;
  const currentStock = product.currentStock || 0;
  const minStock = product.minStockLevel || 0;
  return currentStock <= minStock;
}

