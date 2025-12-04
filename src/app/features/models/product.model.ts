import { ModelMeta } from '@app/shared-services';

export interface Product {
  productId?: string | number;
  productName: string;
  description?: string;
  price?: number;
  purchaseCost?: number;
  imageUrl?: string;
  category?: string;
  isActive: boolean;
  isThreshold: boolean;
  warnThresholdNumber: number;
  infoThresholdNumber: number;
  isInventory: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductWithInventory extends Product {
  count: number;
}

export function getProductMeta() {
  return [
    { key: 'productId', label: 'ProductId', hide: true },
    { key: 'productName', label: 'Product Name', required: true },
    { key: 'description', label: 'Description', required: false },
    { key: 'price', label: 'Sale Amount', required: true },
    { key: 'purchaseCost', label: 'Purchase Amount', required: false },
    {
      key: 'warnThresholdNumber',
      label: 'Warn Threshold Number',
      required: false,
    },
    {
      key: 'infoThresholdNumber',
      label: 'Info Threshold Number',
      required: false,
    },
    { key: 'imageUrl', label: 'Image Url', required: false },
    { key: 'category', label: 'Category', required: false },
    {
      key: 'isActive',
      label: 'Is Active',
      controlType: 'radio',
      options: [
        { key: true, value: 'Yes' },
        { key: false, value: 'No' },
      ],
    },
    {
      key: 'isThreshold',
      label: 'Is Active',
      controlType: 'radio',
      options: [
        { key: true, value: 'Yes' },
        { key: false, value: 'No' },
      ],
    },
    {
      key: 'isInventory',
      label: 'Is Inventory',
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
