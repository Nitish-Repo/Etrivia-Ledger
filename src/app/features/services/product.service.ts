import { inject, Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
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
    product.createdAt = new Date().toISOString();
    product.updatedAt = product.createdAt;
    product.productId = uuidv7();
    
    return this.db.insert$('products', product).pipe(
      map(() => product)  // Return the product object with productId
    );
  }

  updateProduct(product: Product) {
    product.updatedAt = new Date().toISOString();
    return this.db.update$('products', product.productId!, product, 'productId');
  }

  getAllProducts() {
    return this.db.getAll$<Product>('products');
  }

  getProductById(productId: string) {
    return this.db.getById$<Product>('products', productId, 'productId');
  }

  addProductInventory(productInventory: ProductInventory) {
    productInventory.updatedAt = new Date().toISOString();
    return this.db.insert$('inventory', productInventory);
  }

  updateProductInventory(productInventory: ProductInventory) {
    productInventory.updatedAt = new Date().toISOString();
    return this.db.update$('inventory', productInventory.productId, productInventory, 'productId');
  }

  getProductInventoryByProductId(productId: string) {
    return this.db.getById$<ProductInventory>('inventory', productId, 'productId');
  }



}
