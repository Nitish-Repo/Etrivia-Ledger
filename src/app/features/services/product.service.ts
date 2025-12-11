import { inject, Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { DatabaseService, DatabaseUtilityService, PaginationOptionsModel, DB_TABLES } from '@app/core/database-services';
import { Product } from '../models/product.model';
import { v7 as uuidv7 } from 'uuid';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private db = inject(DatabaseService);
  private dbUtil = inject(DatabaseUtilityService);


  addProduct(product: Product) {
    product.createdAt = new Date().toISOString();
    product.updatedAt = product.createdAt;
    product.productId = uuidv7();

    return this.db.insert$(DB_TABLES.PRODUCTS, product).pipe(
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

    return this.db.insertAndReturn$<Product>(DB_TABLES.PRODUCTS, product);
  }

  updateProduct(product: Product) {
    product.updatedAt = new Date().toISOString();
    return this.db.update$(DB_TABLES.PRODUCTS, product.productId!, product, 'productId');
  }

  updateProductAndReturn(product: Product) {
    product.updatedAt = new Date().toISOString();
    return this.db.updateAndReturn$<Product>(DB_TABLES.PRODUCTS, product.productId!, product, 'productId');
  }

  getAllProducts() {
    return this.db.getAll$<Product>(DB_TABLES.PRODUCTS);
  }

  getProductById(productId: string) {
    return this.db.getById$<Product>(DB_TABLES.PRODUCTS, productId, 'productId');
  }

  deleteProduct(productId: string) {
    return this.db.delete$(DB_TABLES.PRODUCTS, productId, 'productId');
  }

  /**
   * Delete a product and return the deleted product data
   * Uses SQLite RETURNING clause - useful for undo operations or logging
   */
  deleteProductAndReturn(productId: string) {
    return this.db.deleteAndReturn$<Product>(DB_TABLES.PRODUCTS, productId, 'productId');
  }

  getProductsPaginated(page: number, limit: number, search: string) {
    const searchObj = this.dbUtil.buildSearch(['productName'], search);

    const whereParts = [];
    if (searchObj.clause) whereParts.push(searchObj.clause);

    const options: PaginationOptionsModel = {
      table: DB_TABLES.PRODUCTS,
      columns: ['*'],
      join: '',

      where: whereParts.join(' AND '),
      params: [...searchObj.params],

      orderBy: 'productName',
      limit,
      offset: page * limit,
    };

    return this.db.getPaginated$<Product>(options);
  }


}
