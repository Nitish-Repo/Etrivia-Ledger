import { ModelMeta } from "@app/shared-services";

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
  country?: string;
  
  openingBalance: number;
  currentBalance: number;       // Current payable
  
  isActive: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export function getSupplierMeta() {
  return [
    { key: 'supplierId', label: 'Supplier ID', hide: true },
    { key: 'supplierName', label: 'Supplier Name', required: true },
    { key: 'phone', label: 'Phone Number', required: false },
    { key: 'email', label: 'Email', required: false },
    { key: 'gstin', label: 'GSTIN', required: false },
    { key: 'pan', label: 'PAN', required: false },
    { key: 'address', label: 'Address', required: false },
    { key: 'city', label: 'City', required: false },
    { key: 'state', label: 'State', required: false },
    { key: 'pincode', label: 'Pincode', required: false },
    { key: 'country', label: 'Country', required: false },
    { key: 'openingBalance', label: 'Opening Balance', required: false, controlType: 'number' },
    { key: 'currentBalance', label: 'Current Balance', required: false, controlType: 'number' },
    {
      key: 'isActive',
      label: 'Is Active',
      controlType: 'radio',
      options: [
        { key: true, value: 'common.yes' },
        { key: false, value: 'common.no' },
      ],
    },
    { key: 'createdAt', label: 'Created At', required: false, hide: true },
    { key: 'updatedAt', label: 'Updated At', required: false, hide: true },
  ] as Array<ModelMeta>;
}

