import { inject, Injectable } from '@angular/core';
import { map, switchMap } from 'rxjs/operators';
import { DatabaseService, DB_TABLES } from '@app/core/database-services';
import { BusinessSettings, SettingRecord } from '../models/business-settings.model';
import { Observable, from, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class BusinessSettingsService {
  private db = inject(DatabaseService);

  /**
   * Save or update business settings (stored as key-value pairs)
   * Deletes all existing settings and inserts new ones
   */
  saveBusinessSettings(settings: BusinessSettings): Observable<number> {
    const settingRecords: SettingRecord[] = Object.entries(settings).map(([key, value]) => ({
      settingKey: key as keyof BusinessSettings,
      settingValue: String(value)
    }));

    return from(
      (async () => {
        // Delete all existing settings
        await this.db.query(`DELETE FROM ${DB_TABLES.BUSINESS_SETTINGS}`);
        
        // Insert all new settings using bulk insert
        const result = await this.db.insertMany(DB_TABLES.BUSINESS_SETTINGS, settingRecords);
        return result;
      })()
    );
  }

  /**
   * Save business settings and return the saved data
   */
  saveBusinessSettingsAndReturn(settings: BusinessSettings): Observable<BusinessSettings> {
    return this.saveBusinessSettings(settings).pipe(
      map(() => settings)
    );
  }

  /**
   * Update specific business setting
   */
  updateBusinessSettingAndReturn(key: keyof BusinessSettings, value: string | number | boolean): Observable<number> {
    const settingValue = String(value);
    
    return from(
      (async () => {
        // Check if setting exists
        const existing = await this.db.query<any>(
          `SELECT COUNT(*) as count FROM ${DB_TABLES.BUSINESS_SETTINGS} WHERE settingKey = ?`,
          [key]
        );
        
        const exists = existing && existing[0]?.count > 0;
        
        if (exists) {
          // Update existing setting using update method
          await this.db.update(
            DB_TABLES.BUSINESS_SETTINGS,
            key as string,
            { settingKey: key, settingValue: settingValue },
            'settingKey'
          );
          return 1;
        } else {
          // Insert new setting
          return await this.db.insert(DB_TABLES.BUSINESS_SETTINGS, {
            settingKey: key,
            settingValue: settingValue
          });
        }
      })()
    );
  }

  /**
   * Get all business settings
   */
  getBusinessSettings(): Observable<BusinessSettings | null> {
    return this.db.getAll$<SettingRecord>(DB_TABLES.BUSINESS_SETTINGS).pipe(
      map((records) => {
        if (!records || records.length === 0) {
          return null;
        }

        // Convert array of records to BusinessSettings object
        const settings: any = {};
        records.forEach(record => {
          const key = record.settingKey;
          let value: any = record.settingValue;

          // Convert string values back to appropriate types
          if (key === 'defaultGstRate') {
            value = parseFloat(value);
          } else if (key === 'enableCess') {
            value = value === 'true';
          }

          settings[key] = value;
        });

        return settings as BusinessSettings;
      })
    );
  }

  /**
   * Get specific setting by key
   */
  getSetting(key: keyof BusinessSettings): Observable<string | null> {
    return from(
      (async () => {
        const result = await this.db.query<any>(
          `SELECT settingValue FROM ${DB_TABLES.BUSINESS_SETTINGS} WHERE settingKey = ?`,
          [key]
        );
        
        if (result && result.length > 0) {
          return result[0].settingValue;
        }
        return null;
      })()
    );
  }

  /**
   * Delete all business settings
   */
  deleteAllSettings(): Observable<void> {
    return from(
      (async () => {
        await this.db.query(`DELETE FROM ${DB_TABLES.BUSINESS_SETTINGS}`);
      })()
    );
  }

  /**
   * Check if business settings exist
   */
  hasSettings(): Observable<boolean> {
    return from(
      (async () => {
        const result = await this.db.query<any>(
          `SELECT COUNT(*) as count FROM ${DB_TABLES.BUSINESS_SETTINGS}`
        );
        return result && result[0]?.count > 0;
      })()
    );
  }
}
