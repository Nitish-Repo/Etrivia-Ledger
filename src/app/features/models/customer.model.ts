import { ModelMeta } from '@app/shared-services';

export interface Customer {
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

export function getCustomerMeta() {
  return [
    { key: 'customerId', label: 'CustomerId', hide: true },
    { key: 'customerName', label: 'Customer Name', required: true },
    { key: 'phoneNumber', label: 'Phone Number', required: false },
    { key: 'email', label: 'Email', required: false },
    { key: 'addressLine1', label: 'Address Line1', required: false },
    { key: 'addressLine2', label: 'Address Line2', required: false },
    { key: 'pinCode', label: 'Pincode ', required: false },
    { key: 'state', label: 'State', required: false },
    { key: 'country', label: 'Country', required: false },
    {
      key: 'isActive',
      label: 'Is Active',
      controlType: 'radio',
      options: [
        { key: true, value: 'Yes' },
        { key: false, value: 'No' },
      ],
    },
    { key: 'createdAt', label: 'Created at', required: false },
    { key: 'updatedAt', label: 'Updated at', required: false },
  ] as Array<ModelMeta>;
}
