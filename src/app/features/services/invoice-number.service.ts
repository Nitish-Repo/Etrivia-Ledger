import { Injectable, inject } from '@angular/core';
import { DatabaseService } from '@app/core/database-services/database.service';
import { map, Observable, switchMap } from 'rxjs';
import { DB_TABLES } from '@app/core/database-services';
import { v7 as uuidv7 } from 'uuid';

export interface InvoiceCounter {
  id: number;
  device_id: string;
  sequence: number;
  updatedAt?: string;
}
export interface Invoice {
  invoiceId: string;
  invoiceNumber: string;
  updatedAt?: string;
}

@Injectable({
  providedIn: 'root'
})

export class InvoiceNumberService {
  private db = inject(DatabaseService);

  getNextInvoiceNumberPreview$(): Observable<string> {
    return this.db
      .getById$<InvoiceCounter>(DB_TABLES.INVOICE_COUNTER, 1, 'id').pipe(map(counter => {
        const deviceId = counter!.device_id.replace(/-/g, '').slice(-3).toUpperCase();
        const year = new Date().getFullYear();
        const newNumber = counter!.sequence + 1;
        return `${deviceId}-${year}-${newNumber.toString().padStart(4, '0')}`;
      })
      );
  }

  saveInvoiceAndUpdateCounter$(invoiceNumber: string) {
    const invoice: Invoice = {
      invoiceId: uuidv7(),
      invoiceNumber,
      updatedAt: new Date().toISOString()
    };

    return this.db.insertAndReturn$<Invoice>(DB_TABLES.INVOICE, invoice).pipe(
      switchMap(savedInvoice =>
        this.updateInvoiceCounterAndReturn$().pipe(
          map(() => savedInvoice)
        )
      )
    );
  }

  updateInvoiceCounterAndReturn$() {
    return this.db
      .getById$<InvoiceCounter>(DB_TABLES.INVOICE_COUNTER, 1, 'id').pipe(switchMap(counter =>
        this.db.updateAndReturn$<InvoiceCounter>(DB_TABLES.INVOICE_COUNTER, 1, { sequence: counter!.sequence + 1 }, 'id')
      )
      );
  }

}