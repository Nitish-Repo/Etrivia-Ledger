/**
 * Expense Model
 */

export type ExpenseCategory = 
  | 'RENT' 
  | 'SALARY' 
  | 'ELECTRICITY' 
  | 'WATER' 
  | 'INTERNET' 
  | 'PHONE' 
  | 'TRANSPORT' 
  | 'MAINTENANCE' 
  | 'MARKETING' 
  | 'OFFICE_SUPPLIES' 
  | 'OTHER';

export interface Expense {
  expenseId?: string;
  expenseDate: string;
  
  category: ExpenseCategory | string;
  description?: string;
  amount: number;
  
  paymentMethod: 'CASH' | 'UPI' | 'CARD' | 'BANK_TRANSFER' | 'CHEQUE';
  
  gstApplicable: boolean;
  gstAmount: number;
  
  notes?: string;
  createdAt?: string | Date;
}
