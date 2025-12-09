/**
 * Payment Model
 */

export type PartyType = 'CUSTOMER' | 'SUPPLIER';
export type PaymentMethod = 'CASH' | 'UPI' | 'CARD' | 'BANK_TRANSFER' | 'CHEQUE';
export type ReferenceType = 'SALE' | 'PURCHASE' | 'OPENING_BALANCE';

export interface Payment {
  paymentId?: string;
  paymentDate: string;
  
  partyType: PartyType;
  partyId: string;
  partyName: string;
  
  referenceType?: ReferenceType;
  referenceId?: string;        // saleId or purchaseId
  
  amount: number;
  paymentMethod: PaymentMethod;
  
  transactionId?: string;      // UPI/Bank reference
  notes?: string;
  
  createdAt?: string | Date;
}
