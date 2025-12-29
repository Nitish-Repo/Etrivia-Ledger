import { Injectable, inject } from '@angular/core';
import { DatabaseService } from '@app/core/database-services/database.service';
import { from, map, Observable, switchMap } from 'rxjs';
import { Preferences } from '@capacitor/preferences';
import { Device } from '@capacitor/device';
import { DB_TABLES } from '@app/core/database-services';
import { v7 as uuidv7 } from 'uuid';

export interface InvoiceCounter {
  id: number;
  device_id: string;
  sequence: number;
  updated_at?: string;
}
export interface Invoice {
  invoiceId: string;
  invoiceNumber: string;
  updated_at?: string;
}

@Injectable({
  providedIn: 'root'
})

export class InvoiceNumberService {
  private db = inject(DatabaseService);
  private deviceId: string | null = null;

  // Generate next invoice number: DMJ-2025-0001
  generateNextInvoiceNumber(): Observable<string> {
    return from(this._generate());

  }

  getNextInvoiceNumberPreview$(): Observable<string> {
    return from(Device.getId()).pipe(
      switchMap(info =>
        from(this.db.getAll<InvoiceCounter>(DB_TABLES.INVOICE_COUNTER)).pipe(
          map(rows => {
            const deviceId = info.identifier
              .replace(/-/g, '')
              .slice(-3)
              .toUpperCase();

            const counter = rows[0];
            const year = new Date().getFullYear();
            const newNumber = counter.sequence + 1;

            return `${deviceId}-${year}-${newNumber
              .toString()
              .padStart(4, '0')}`;
          })
        )
      )
    );
  }

  // Generate next invoice number: DMJ-2025-0001
  saveInvoiceNumber(invoiceNumber: string) {
    let invoice: Invoice = {
      invoiceId: uuidv7(),
      invoiceNumber: invoiceNumber,
      updated_at: new Date().toISOString()
    }
    return this.db.insertAndReturn$<Invoice>(DB_TABLES.INVOICE, invoice);
  }






  async generateNewInvoiceNumber() {
    const info = await Device.getId();
    const deviceId = info.identifier.replace(/-/g, '').slice(-3).toUpperCase();;

    const x = await this.db.getAll<InvoiceCounter>(DB_TABLES.INVOICE_COUNTER);

    const year = new Date().getFullYear();
    const counter = x[0];
    const newNumber = counter.sequence + 1;

    const invoiceNumber =
      `${deviceId}-${year}-${newNumber.toString().padStart(4, '0')}`;

    return invoiceNumber;
  }













  // Preview next invoice number without saving
  getNextInvoiceNumberPreview(): Observable<string> {
    return from(this._preview());
  }

  private async _generate(): Promise<string> {
    const prefix = await this.getDevicePrefix();
    const year = new Date().getFullYear();

    // Get counter
    const counter = await this.db.query<any>(
      'SELECT lastNumber, financialYear FROM invoice_counter WHERE id = 1'
    );

    let lastNumber = counter[0]?.lastNumber || 0;
    const storedYear = counter[0]?.financialYear || `${year}`;

    // Reset if new year
    if (storedYear !== `${year}`) {
      lastNumber = 0;
    }

    const newNumber = lastNumber + 1;

    // Save counter
    await this.db.query(
      'UPDATE invoice_counter SET lastNumber = ?, financialYear = ?, updatedAt = datetime("now") WHERE id = 1',
      [newNumber, `${year}`]
    );

    const invoiceNumber = `${prefix}-${year}-${newNumber.toString().padStart(4, '0')}`;

    // Validate max 16 characters
    if (invoiceNumber.length > 16) {
      throw new Error(`Invoice number exceeds 16 characters: ${invoiceNumber}`);
    }

    return invoiceNumber;
  }

  private async _preview(): Promise<string> {
    const prefix = await this.getDevicePrefix();
    const year = new Date().getFullYear();

    const counter = await this.db.query<any>(
      'SELECT lastNumber, financialYear FROM invoice_counter WHERE id = 1'
    );

    let lastNumber = counter[0]?.lastNumber || 0;
    const storedYear = counter[0]?.financialYear || `${year}`;

    if (storedYear !== `${year}`) {
      lastNumber = 0;
    }

    const nextNumber = lastNumber + 1;
    const invoiceNumber = `${prefix}-${year}-${nextNumber.toString().padStart(4, '0')}`;

    // Log warning if exceeds 16 characters
    if (invoiceNumber.length > 16) {
      console.warn(`Invoice number exceeds 16 characters: ${invoiceNumber}`);
    }

    return invoiceNumber;
  }

  // Get 3-character device prefix from device ID
  private async getDevicePrefix(): Promise<string> {
    if (!this.deviceId) {
      const stored = await Preferences.get({ key: 'deviceId' });

      if (stored.value) {
        this.deviceId = stored.value;
      } else {
        // Generate: dev_mjbhq0kv123
        this.deviceId = 'dev_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
        await Preferences.set({ key: 'deviceId', value: this.deviceId });
      }
    }

    // Take first 3 characters after "dev_": dev_mjb... → MJB
    return this.deviceId.substring(4, 7).toUpperCase();
  }
}
