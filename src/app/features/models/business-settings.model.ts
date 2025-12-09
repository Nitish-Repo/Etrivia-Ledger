/**
 * Business Settings Model
 */

export interface BusinessSettings {
  businessName: string;
  gstin: string;
  pan: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  email: string;
  invoicePrefix: string;
  financialYearStart: string;  // MM-DD format (e.g., '04-01')
  defaultGstRate: number;
  enableCess: boolean;
}

export type SettingKey = keyof BusinessSettings;

export interface SettingRecord {
  settingKey: SettingKey;
  settingValue: string;
}
