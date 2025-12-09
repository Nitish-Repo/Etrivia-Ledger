/**
 * Unit of Measure (UOM) Types and Utilities
 * Standard GST UOM codes for inventory and billing
 */

/**
 * Unit of Measure Type
 */
export type UnitOfMeasure = 
  'BAG' | 'BAL' | 'BDL' | 'BKL' | 'BOU' | 'BOX' | 'BTL' | 'BUN' | 'CAN' | 'CBM' | 
  'CCM' | 'CMS' | 'CTN' | 'DOZ' | 'DRM' | 'GGR' | 'GMS' | 'GRS' | 'GYD' | 'KGS' | 
  'KLR' | 'KME' | 'LTR' | 'MLT' | 'MTR' | 'MTS' | 'NOS' | 'PAC' | 'PCS' | 'PRS' | 
  'QTL' | 'ROL' | 'SET' | 'SQF' | 'SQM' | 'SQY' | 'TBS' | 'TGM' | 'THD' | 'TON' | 
  'TUB' | 'UGS' | 'UNT' | 'YGS' | 'OTH';

/**
 * UOM Display Names
 */
export const UOM_LABELS: Record<UnitOfMeasure, string> = {
  'BAG': 'Bags',
  'BAL': 'Bale',
  'BDL': 'Bundles',
  'BKL': 'Buckles',
  'BOU': 'Billion of Units',
  'BOX': 'Box',
  'BTL': 'Bottles',
  'BUN': 'Bunches',
  'CAN': 'Cans',
  'CBM': 'Cubic Meters',
  'CCM': 'Cubic Centimeters',
  'CMS': 'Centimeters',
  'CTN': 'Cartons',
  'DOZ': 'Dozens',
  'DRM': 'Drums',
  'GGR': 'Great Gross',
  'GMS': 'Grams',
  'GRS': 'Gross',
  'GYD': 'Gross Yards',
  'KGS': 'Kilograms',
  'KLR': 'Kilolitre',
  'KME': 'Kilometre',
  'LTR': 'Litres',
  'MLT': 'Millilitre',
  'MTR': 'Meters',
  'MTS': 'Metric Ton',
  'NOS': 'Numbers',
  'PAC': 'Packs',
  'PCS': 'Pieces',
  'PRS': 'Pairs',
  'QTL': 'Quintal',
  'ROL': 'Rolls',
  'SET': 'Sets',
  'SQF': 'Square Feet',
  'SQM': 'Square Meters',
  'SQY': 'Square Yards',
  'TBS': 'Tablets',
  'TGM': 'Ten Gross',
  'THD': 'Thousands',
  'TON': 'Tonnes',
  'TUB': 'Tubes',
  'UGS': 'US Gallons',
  'UNT': 'Units',
  'YGS': 'Yards',
  'OTH': 'Others'
};

/**
 * UOM Conversion Factors (to base unit - PCS/NOS)
 * For quantity calculations and inventory management
 */
export const UOM_CONVERSION: Record<UnitOfMeasure, number> = {
  'BAG': 1,
  'BAL': 1,
  'BDL': 1,
  'BKL': 1,
  'BOU': 1000000000,
  'BOX': 1,
  'BTL': 1,
  'BUN': 1,
  'CAN': 1,
  'CBM': 1,
  'CCM': 1,
  'CMS': 1,
  'CTN': 1,
  'DOZ': 12,        // 1 Dozen = 12 pieces
  'DRM': 1,
  'GGR': 144,       // 1 Great Gross = 144 pieces
  'GMS': 1,
  'GRS': 144,       // 1 Gross = 144 pieces
  'GYD': 1,
  'KGS': 1,
  'KLR': 1000,      // 1 Kilolitre = 1000 litres
  'KME': 1000,      // 1 Kilometre = 1000 meters
  'LTR': 1,
  'MLT': 0.001,     // 1 Millilitre = 0.001 litres
  'MTR': 1,
  'MTS': 1000,      // 1 Metric Ton = 1000 kg
  'NOS': 1,
  'PAC': 1,
  'PCS': 1,
  'PRS': 2,         // 1 Pair = 2 pieces
  'QTL': 100,       // 1 Quintal = 100 kg
  'ROL': 1,
  'SET': 1,
  'SQF': 1,
  'SQM': 1,
  'SQY': 1,
  'TBS': 1,
  'TGM': 1440,      // 1 Ten Gross = 1440 pieces
  'THD': 1000,      // 1 Thousand = 1000 pieces
  'TON': 1000,      // 1 Tonne = 1000 kg
  'TUB': 1,
  'UGS': 1,
  'UNT': 1,
  'YGS': 1,
  'OTH': 1
};

/**
 * Helper Functions
 */

/**
 * Convert quantity from one UOM to another
 * Example: convertQuantity(10, 'DOZ', 'PCS') = 120
 */
export function convertQuantity(quantity: number, fromUOM: UnitOfMeasure, toUOM: UnitOfMeasure = 'PCS'): number {
  const fromFactor = UOM_CONVERSION[fromUOM] || 1;
  const toFactor = UOM_CONVERSION[toUOM] || 1;
  return (quantity * fromFactor) / toFactor;
}

/**
 * Get display label for UOM
 */
export function getUOMLabel(uom: UnitOfMeasure): string {
  return UOM_LABELS[uom] || uom;
}

/**
 * Calculate total quantity in base units (PCS)
 * Useful for inventory calculations
 */
export function getBaseQuantity(quantity: number, uom: UnitOfMeasure): number {
  return quantity * (UOM_CONVERSION[uom] || 1);
}

/**
 * Get all UOM options for select dropdown
 */
export function getUOMOptions() {
  return Object.entries(UOM_LABELS).map(([key, value]) => ({ 
    key: key as UnitOfMeasure, 
    value 
  }));
}

/**
 * Validate if a string is a valid UOM
 */
export function isValidUOM(uom: string): uom is UnitOfMeasure {
  return uom in UOM_LABELS;
}
