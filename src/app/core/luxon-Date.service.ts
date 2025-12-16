import { Injectable } from '@angular/core';
import { DateTime } from 'luxon';

@Injectable({
    providedIn: 'root',
})
export class LuxonDateService {
    // Convert JavaScript Date or date string to Luxon DateTime
    toDateTime(input: Date | string): DateTime {
        if (input instanceof Date) {
            return DateTime.fromJSDate(input);
        }
        if (typeof input === 'string') {
            const dateTime = DateTime.fromISO(input, { zone: 'UTC' });
            if (dateTime.isValid) return dateTime;
        }
        throw new Error('Invalid input: must be a valid Date or ISO string');
    }

    // Convert Luxon DateTime to JavaScript Date
    toJSDate(dateTime: DateTime): Date {
        if (dateTime instanceof DateTime && dateTime.isValid) {
            return dateTime.toJSDate();
        }
        throw new Error('Invalid input: must be a valid Luxon DateTime');
    }

    // Convert Luxon DateTime to ISO string
    toISOString(dateTime: DateTime): string {
        if (dateTime instanceof DateTime && dateTime.isValid) {
            return dateTime.toISO() || '';
        }
        throw new Error('Invalid input: must be a valid Luxon DateTime');
    }

    // Parse and format dates
    formatDate(dateTime: DateTime, format: string = 'yyyy-MM-dd'): string {
        if (dateTime instanceof DateTime && dateTime.isValid) {
            return dateTime.toFormat(format);
        }
        throw new Error('Invalid input: must be a valid Luxon DateTime');
    }

    // Get current DateTime
    now(): DateTime {
        return DateTime.now();
    }

    // Check if input is a valid Luxon DateTime
    isValidDateTime(dateTime: any): boolean {
        return dateTime instanceof DateTime && dateTime.isValid;
    }

    isTodayUTC(input: Date | string): boolean {
        try {
            const dateToCheck = this.toDateTime(input).toUTC().startOf('day');
            const todayUTC = this.now().toUTC().startOf('day');
            return dateToCheck.hasSame(todayUTC, 'day');
        } catch (error) {
            return false; // Invalid input
        }
    }
}
