import { Pipe, PipeTransform } from '@angular/core';
import { DateTime } from 'luxon';

@Pipe({
    name: 'dateFormat',
    pure: true
})

export class DateFormatPipe implements PipeTransform {
    transform(value: any, format: string = 'yyyy-MM-dd', timeZone: string = 'local'): string {
        if (value) {
            const dateTime = timeZone?.toLowerCase() === 'utc' ? DateTime.fromISO(value).toUTC() : DateTime.fromISO(value).setZone(timeZone);
            return dateTime.toFormat(format);
        }
        return '';
    }
}