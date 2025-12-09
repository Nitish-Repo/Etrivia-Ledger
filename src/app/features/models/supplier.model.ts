/**
 * Supplier Model
 */

export interface Supplier {
  supplierId?: string;
  supplierName: string;
  phone?: string;
  email?: string;
  gstin?: string;
  pan?: string;
  
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  
  openingBalance: number;
  currentBalance: number;       // Current payable
  
  isActive: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}
