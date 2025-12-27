import { ModelMeta } from '@app/shared-services';

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
  templateId: string;
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

export function getBusinessSettingsMeta() {
  return [
    { key: 'businessName', label: 'Business Name', required: true },
    { key: 'gstin', label: 'GSTIN', required: true },
    { key: 'pan', label: 'PAN', required: false },
    { key: 'address', label: 'Address', required: false },
    { key: 'city', label: 'City', required: false },
    { key: 'state', label: 'State', required: false },
    { key: 'pincode', label: 'Pincode', required: false },
    { key: 'phone', label: 'Phone', required: true },
    { key: 'email', label: 'Email', required: false, email: true },
    { key: 'templateId', label: 'Template Id', required: false },
    { key: 'invoicePrefix', label: 'Invoice Prefix', required: true },
    { key: 'financialYearStart', label: 'Financial Year Start', required: true },
    { key: 'defaultGstRate', label: 'Default GST Rate', required: false, controlType: 'number' },
    {
      key: 'enableCess',
      label: 'Enable CESS',
      controlType: 'radio',
      options: [
        { key: true, value: 'Yes' },
        { key: false, value: 'No' },
      ],
    },
  ] as Array<ModelMeta>;
}
