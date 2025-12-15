import { ModelMeta } from '@app/shared-services';

/**
 * Customer Types
 */
export enum CustomerType {
  RETAIL = 'RETAIL',
  WHOLESALE = 'WHOLESALE',
  B2B = 'B2B'
}

export enum PriceListType {
  RETAIL = 'RETAIL',
  WHOLESALE = 'WHOLESALE'
}

/**
 * Enhanced Customer Model with GST Support
 */
export interface Customer {
  customerId?: string;
  customerName: string;
  phone?: string;
  email?: string;
  gstin?: string;              // GST Number (for B2B)
  pan?: string;
  
  // Address
  billingAddress?: string;
  shippingAddress?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
  
  // Credit Management
  creditLimit?: number;
  openingBalance?: number;      // Starting due amount
  currentBalance?: number;      // Current due (auto-calculated)
  
  // Classification
  customerType?: CustomerType;
  priceList?: PriceListType;    // Which price to use
  
  isActive?: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

/**
 * Legacy Customer Interface (for backward compatibility)
 */
export interface CustomerLegacy {
  customerId?: string | number;
  customerName: string;
  phoneNumber?: string;
  email?: string;
  addressLine1?: string;
  addressLine2?: string;
  pinCode?: string;
  state?: string;
  country?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Helper Functions
 */

/**
 * Check if customer has credit available
 */
export function hasCreditAvailable(customer: Customer): boolean {
  if (!customer.creditLimit || !customer.currentBalance) return true;
  return customer.currentBalance < customer.creditLimit;
}

/**
 * Get available credit
 */
export function getAvailableCredit(customer: Customer): number {
  const limit = customer.creditLimit || 0;
  const balance = customer.currentBalance || 0;
  return Math.max(0, limit - balance);
}

/**
 * Check if customer is over credit limit
 */
export function isOverCreditLimit(customer: Customer): boolean {
  if (!customer.creditLimit) return false;
  return (customer.currentBalance || 0) > customer.creditLimit;
}

/**
 * Form Metadata for Customer
 */
export function getCustomerMeta() {
  return [
    { key: 'customerId', label: 'CustomerId', hide: true },
    { key: 'customerName', label: 'Customer Name', required: true },
    { key: 'phone', label: 'Phone Number', required: false },
    { key: 'email', label: 'Email', required: false },
    { key: 'gstin', label: 'GSTIN', required: false },
    { key: 'pan', label: 'PAN', required: false },
    { key: 'billingAddress', label: 'Billing Address', required: false },
    { key: 'shippingAddress', label: 'Shipping Address', required: false },
    { key: 'city', label: 'City', required: false },
    { key: 'state', label: 'State', required: false },
    { key: 'pincode', label: 'Pincode', required: false },
    { key: 'country', label: 'Country', required: false },
    { key: 'creditLimit', label: 'Credit Limit', required: false, controlType: 'number' },
    { key: 'openingBalance', label: 'Opening Balance', required: false, controlType: 'number' },
    { key: 'currentBalance', label: 'Current Balance', required: false, controlType: 'number' },
    {
      key: 'customerType',
      label: 'label.customer_type',
      controlType: 'select',
      options: [
        { key: CustomerType.RETAIL, value: 'badge.retail' },
        { key: CustomerType.WHOLESALE, value: 'badge.wholesale' },
        { key: CustomerType.B2B, value: 'badge.b2b' },
      ],
    },
    {
      key: 'priceList',
      label: 'label.price_list',
      controlType: 'select',
      options: [
        { key: PriceListType.RETAIL, value: 'label.retail_price' },
        { key: PriceListType.WHOLESALE, value: 'label.wholesale_price' },
      ],
    },
    {
      key: 'isActive',
      label: 'Is Active',
      controlType: 'radio',
      options: [
        { key: true, value: 'common.yes' },
        { key: false, value: 'common.no' },
      ],
    },
    { key: 'createdAt', label: 'Created at', required: false, hide: true },
    { key: 'updatedAt', label: 'Updated at', required: false, hide: true },
  ] as Array<ModelMeta>;
}
