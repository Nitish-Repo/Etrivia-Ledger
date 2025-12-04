import { ModelMeta } from '@app/shared-services';

export interface ProductInventory {
  productId: string;
  count: number;
  updatedAt?: Date;
}

export function getProductInventoryMeta() {
  return [
    { key: 'productId', label: 'ProductId', hide: true },
    // { key: 'productName', label: 'Product Name', required: true },
    { key: 'count', label: 'Count', required: false },
    { key: 'updatedAt', label: 'Updated at', required: false },
  ] as Array<ModelMeta>;
}
