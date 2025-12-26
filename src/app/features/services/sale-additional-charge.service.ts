import { inject, Injectable } from '@angular/core';
import { DatabaseService, DatabaseUtilityService, DB_TABLES } from '@app/core/database-services';
import { AdditionalCharge, Sale } from '../models';
import { Observable } from 'rxjs';
import { v7 as uuidv7 } from 'uuid';

@Injectable({
  providedIn: 'root',
})
export class SaleAdditionalChargeService {
  private db = inject(DatabaseService);
  private dbUtil = inject(DatabaseUtilityService);

  addAdditionalChargeAndReturn(additionalCharge: AdditionalCharge): Observable<AdditionalCharge | null> {
    additionalCharge.createdAt = new Date().toISOString();
    additionalCharge.chargeId = additionalCharge.chargeId || uuidv7();

    return this.db.insertAndReturn$<AdditionalCharge>(DB_TABLES.ADDITIONAL_CHARGES, additionalCharge);
  }

  /**
   * Bulk insert multiple additional charges (single SQL query)
   * @param additionalCharges Array of additional charges
   * @returns Observable of inserted records
   */
  addAdditionalChargesAndReturn(additionalCharges: AdditionalCharge[], sale: Sale): Observable<AdditionalCharge[]> {
    if (!additionalCharges || !additionalCharges.length) {
      return new Observable(observer => {
        observer.next([]);
        observer.complete();
      });
    }

    const timestamp = new Date().toISOString();
    const charges = additionalCharges.map(charge => ({
      ...charge,
      createdAt: timestamp,
      chargeId: charge.chargeId || uuidv7(),
      saleId: sale.saleId
    }));

    return this.db.insertManyAndReturn$<AdditionalCharge>(DB_TABLES.ADDITIONAL_CHARGES, charges);
  }

  updateAdditionalChargeAndReturn(additionalCharge: AdditionalCharge) {
    // additionalCharge.updatedAt = new Date().toISOString();
    return this.db.updateAndReturn$<AdditionalCharge>(DB_TABLES.ADDITIONAL_CHARGES, additionalCharge.chargeId!, additionalCharge, 'additionalCharge');
  }

  getAdditionalChargeBySaleId(saleId: string) {
    return this.db.getById$<AdditionalCharge>(DB_TABLES.ADDITIONAL_CHARGES, saleId, 'saleId');
  }

  getAdditionalChargesById(chargeId: string) {
    return this.db.getById$<AdditionalCharge>(DB_TABLES.ADDITIONAL_CHARGES, chargeId, 'chargeId');
  }

  deleteAdditionalChargeAndReturn(chargeId: string) {
    return this.db.deleteAndReturn$<AdditionalCharge>(DB_TABLES.ADDITIONAL_CHARGES, chargeId, 'chargeId');
  }

}
