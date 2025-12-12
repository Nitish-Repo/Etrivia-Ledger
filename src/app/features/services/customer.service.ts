import { inject, Injectable } from '@angular/core';
import { DatabaseService, DatabaseUtilityService, PaginationOptionsModel, DB_TABLES } from '@app/core/database-services';
import { Customer } from '../models';
import { v7 as uuidv7 } from 'uuid';

@Injectable({
  providedIn: 'root',
})
export class CustomerService {
  private db = inject(DatabaseService);
  private dbUtil = inject(DatabaseUtilityService);

  addCustomerAndReturn(customer: Customer) {
    customer.createdAt = new Date().toISOString();
    customer.updatedAt = customer.createdAt;
    customer.customerId = uuidv7();

    return this.db.insertAndReturn$<Customer>(DB_TABLES.CUSTOMERS, customer);
  }

  updateCustomerAndReturn(customer: Customer) {
    customer.updatedAt = new Date().toISOString();
    return this.db.updateAndReturn$<Customer>(DB_TABLES.CUSTOMERS, customer.customerId!, customer, 'productId');
  }

  getCustomerById(customerId: string) {
    return this.db.getById$<Customer>(DB_TABLES.CUSTOMERS, customerId, 'customerId');
  }

  deleteCustomerAndReturn(customerId: string) {
    return this.db.deleteAndReturn$<Customer>(DB_TABLES.CUSTOMERS, customerId, 'customerId');
  }

  getCustomersPaginated(page: number, limit: number, search: string) {
    const searchObj = this.dbUtil.buildSearch(['customerName'], search);

    const whereParts = [];
    if (searchObj.clause) whereParts.push(searchObj.clause);

    const options: PaginationOptionsModel = {
      table: DB_TABLES.CUSTOMERS,
      columns: ['*'],
      join: '',

      where: whereParts.join(' AND '),
      params: [...searchObj.params],

      orderBy: 'customerName',
      limit,
      offset: page * limit,
    };

    return this.db.getPaginated$<Customer>(options);
  }

}
