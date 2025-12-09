/**
 * Stock Adjustment Model
 */

export type AdjustmentType = 'ADD' | 'REMOVE' | 'DAMAGE' | 'RETURN';

export interface StockAdjustment {
  adjustmentId?: string;
  adjustmentDate: string;
  
  productId: string;
  productName: string;
  
  adjustmentType: AdjustmentType;
  quantity: number;
  
  reason?: string;
  notes?: string;
  
  createdBy?: string;
  createdAt?: string | Date;
}
