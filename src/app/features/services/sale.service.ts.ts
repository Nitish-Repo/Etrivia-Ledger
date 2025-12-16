import { inject, Injectable } from '@angular/core';
import { DatabaseService, DatabaseUtilityService, DB_TABLES, PaginationOptionsModel } from '@app/core/database-services';
import { AdditionalCharge, Sale, SaleItem } from '../models';
import { v7 as uuidv7 } from 'uuid';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SaleServiceTs {
  private db = inject(DatabaseService);
  private dbUtil = inject(DatabaseUtilityService);

  addSaleAndReturn(sale: Sale): Observable<Sale | null> {
    sale.createdAt = new Date().toISOString();
    sale.updatedAt = sale.createdAt;
    sale.saleId = sale.saleId || uuidv7();

    return this.db.insertAndReturn$<Sale>(DB_TABLES.SALES, sale);
  }

  updateSaleAndReturn(sale: Sale) {
    sale.updatedAt = new Date().toISOString();
    return this.db.updateAndReturn$<Sale>(DB_TABLES.SALES, sale.saleId!, sale, 'saleId');
  }

  getSaleById(saleId: string) {
    return this.db.getById$<Sale>(DB_TABLES.SALES, saleId, 'saleId');
  }

  deleteSaleAndReturn(saleId: string) {
    return this.db.deleteAndReturn$<Sale>(DB_TABLES.SALES, saleId, 'saleId');
  }

  getSalePaginated(page: number, limit: number, search: string) {
    const searchObj = this.dbUtil.buildSearch(['SaleName'], search);

    const whereParts = [];
    if (searchObj.clause) whereParts.push(searchObj.clause);

    const options: PaginationOptionsModel = {
      table: DB_TABLES.SALES,
      columns: ['*'],
      join: '',

      where: whereParts.join(' AND '),
      params: [...searchObj.params],

      orderBy: 'SaleName',
      limit,
      offset: page * limit,
    };

    return this.db.getPaginated$<Sale>(options);
  }



}
