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

  /**
   * Add a product and return the inserted product data from database
   * Uses SQLite RETURNING clause - gets exact database state including any defaults
   */
  addProductAndReturn(product: Product) {
    product.createdAt = new Date().toISOString();
    product.updatedAt = product.createdAt;
    product.productId = uuidv7();
    
    return this.db.insertAndReturn$<Product>('products', product);
  }

  updateProduct(product: Product) {
    product.updatedAt = new Date().toISOString();
    return this.db.update$('products', product.productId!, product, 'productId');
  }

  updateProductAndReturn(product: Product) {
    product.updatedAt = new Date().toISOString();
    return this.db.updateAndReturn$<Product>('products', product.productId!, product, 'productId');
  }

  getAllProducts() {
    return this.db.getAll$<Product>('products');
  }

  /**
   * Get paginated products from database
   * @param limit Number of products per page
   * @param offset Starting position
   * @returns Observable of paginated products
   */
  getProductsPaginated(limit: number, offset: number) {
    return this.db.getPaginated$<Product>('products', limit, offset, 'updatedAt DESC');
  }

  getProductById(productId: string) {
    return this.db.getById$<Product>('products', productId, 'productId');
  }

  deleteProduct(productId: string) {
    return this.db.delete$('products', productId, 'productId');
  }

  /**
   * Delete a product and return the deleted product data
   * Uses SQLite RETURNING clause - useful for undo operations or logging
   */
  deleteProductAndReturn(productId: string) {
    return this.db.deleteAndReturn$<Product>('products', productId, 'productId');
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
