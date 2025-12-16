import { inject, Injectable } from '@angular/core';
import { DatabaseService, DatabaseUtilityService, PaginationOptionsModel, DB_TABLES } from '@app/core/database-services';
import { v7 as uuidv7 } from 'uuid';
import { Supplier } from '../models';

@Injectable({
  providedIn: 'root',
})
export class SupplierService {
  private db = inject(DatabaseService);
  private dbUtil = inject(DatabaseUtilityService);

  addSupplierAndReturn(supplier: Supplier) {
    supplier.createdAt = new Date().toISOString();
    supplier.updatedAt = supplier.createdAt;
    supplier.supplierId = uuidv7();

    return this.db.insertAndReturn$<Supplier>(DB_TABLES.SUPPLIERS, supplier);
  }

  updateSupplierAndReturn(supplier: Supplier) {
    supplier.updatedAt = new Date().toISOString();
    return this.db.updateAndReturn$<Supplier>(DB_TABLES.SUPPLIERS, supplier.supplierId!, supplier, 'supplierId');
  }

  getSupplierById(supplierId: string) {
    return this.db.getById$<Supplier>(DB_TABLES.SUPPLIERS, supplierId, 'supplierId');
  }

  deleteSupplierAndReturn(supplierId: string) {
    return this.db.deleteAndReturn$<Supplier>(DB_TABLES.SUPPLIERS, supplierId, 'supplierId');
  }

  getSupplierPaginated(page: number, limit: number, search: string) {
    const searchObj = this.dbUtil.buildSearch(['supplierName'], search);

    const whereParts = [];
    if (searchObj.clause) whereParts.push(searchObj.clause);

    const options: PaginationOptionsModel = {
      table: DB_TABLES.SUPPLIERS,
      columns: ['*'],
      join: '',

      where: whereParts.join(' AND '),
      params: [...searchObj.params],

      orderBy: 'supplierName',
      limit,
      offset: page * limit,
    };

    return this.db.getPaginated$<Supplier>(options);
  }

}
