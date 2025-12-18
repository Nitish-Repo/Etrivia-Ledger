import { Injectable, inject } from '@angular/core';
import { DatabaseService } from '@app/core/database-services/database.service';
import { from, Observable } from 'rxjs';
import { Preferences } from '@capacitor/preferences';

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
