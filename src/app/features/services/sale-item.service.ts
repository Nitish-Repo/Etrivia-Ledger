import { inject, Injectable } from '@angular/core';
import { DatabaseService, DatabaseUtilityService, DB_TABLES } from '@app/core/database-services';
import { v7 as uuidv7 } from 'uuid';
import { Sale, SaleItem } from '../models';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SaleItemService {
  private db = inject(DatabaseService);
  private dbUtil = inject(DatabaseUtilityService);

  addSaleItemAndReturn(saleItem: SaleItem): Observable<SaleItem | null> {
    saleItem.createdAt = new Date().toISOString();
    saleItem.saleItemId = saleItem.saleItemId || uuidv7();

    return this.db.insertAndReturn$<SaleItem>(DB_TABLES.SALE_ITEMS, saleItem);
  }

  /**
   * Bulk insert multiple sale items (single SQL query)
   * @param saleItems Array of sale items
   * @returns Observable of inserted records
   */
  addSaleItemsAndReturn(saleItems: SaleItem[], sale: Sale): Observable<SaleItem[]> {
    if (!saleItems || !saleItems.length) {
      return new Observable(observer => {
        observer.next([]);
        observer.complete();
      });
    }

    const timestamp = new Date().toISOString();
    const items = saleItems.map(item => ({
      ...item,
      createdAt: timestamp,
      saleItemId: item.saleItemId || uuidv7(),
      saleId: sale.saleId
    }));

    return this.db.insertManyAndReturn$<SaleItem>(DB_TABLES.SALE_ITEMS, items);
  }

  updateSaleItemAndReturn(saleItem: SaleItem) {
    // saleItem.updatedAt = new Date().toISOString();
    return this.db.updateAndReturn$<SaleItem>(DB_TABLES.SALE_ITEMS, saleItem.saleItemId!, saleItem, 'saleItem');
  }

  getSaleItemsBySaleId(saleId: string) {
    return this.db.getByCondition$<SaleItem>(DB_TABLES.SALE_ITEMS, 'saleId = ?', [saleId]);
  }

  getSaleItemById(saleItemId: string) {
    return this.db.getById$<SaleItem>(DB_TABLES.SALE_ITEMS, saleItemId, 'saleItemId');
  }

  deleteSaleItemAndReturn(saleItemId: string) {
    return this.db.deleteAndReturn$<SaleItem>(DB_TABLES.SALE_ITEMS, saleItemId, 'saleItemId');
  }
}
    
