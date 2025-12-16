import { inject, Injectable } from '@angular/core';
import { DatabaseService, DatabaseUtilityService, DB_TABLES } from '@app/core/database-services';
import { v7 as uuidv7 } from 'uuid';
import { SaleItem } from '../models';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SaleItemServiceTs {
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
  addSaleItemsAndReturn(saleItems: SaleItem[]): Observable<SaleItem[]> {
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
      saleItemId: item.saleItemId || uuidv7()
    }));

    return this.db.insertManyAndReturn$<SaleItem>(DB_TABLES.SALE_ITEMS, items);
  }
}
