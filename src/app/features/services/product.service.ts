import { inject, Injectable } from '@angular/core';
import { DatabaseService } from '@app/core/database-services';
import { Product } from '../models/product.model';
import { ProductInventory } from '../models/product-inventory.model';
import { v7 as uuidv7 } from 'uuid';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private db = inject(DatabaseService);


  addProduct(product: Product) {
    product.createdAt = new Date();
    product.updatedAt = product.createdAt;
    product.productId = uuidv7();
    return this.db.insert$('products', product);
  }

  updateProduct(product: Product) {
    product.updatedAt = new Date();
    return this.db.update$('products', product.productId!, product);
  }

  getAllProducts() {
    return this.db.getAll$<Product>('products');
  }

  getProductById(productId: string) {
    return this.db.getById$<Product>('products', productId);
  }

  addProductInventory(productInventory: ProductInventory) {
    productInventory.updatedAt = new Date();
    return this.db.insert$('products', productInventory);
  }

  updateProductInventory(productInventory: ProductInventory) {
    productInventory.updatedAt = new Date();
    return this.db.update$('inventory', productInventory.productId, productInventory);
  }

  getProductInventoryByProductId(productId: string) {
    return this.db.getById$<ProductInventory>('inventory', productId);
  }



}
