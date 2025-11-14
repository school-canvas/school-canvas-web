import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';

@Pipe({
  name: 'dateFormat',
  standalone: true
})
export class DateFormatPipe implements PipeTransform {
  private datePipe = new DatePipe('en-US');

  transform(value: string | Date | null | undefined, format: string = 'mediumDate'): string {
    if (!value) {
      return '';
    }

    // Common format shortcuts
    const formatMap: { [key: string]: string } = {
      'short': 'M/d/yy, h:mm a',
      'medium': 'MMM d, y, h:mm:ss a',
      'long': 'MMMM d, y, h:mm:ss a z',
      'full': 'EEEE, MMMM d, y, h:mm:ss a zzzz',
      'shortDate': 'M/d/yy',
      'mediumDate': 'MMM d, y',
      'longDate': 'MMMM d, y',
      'fullDate': 'EEEE, MMMM d, y',
      'shortTime': 'h:mm a',
      'mediumTime': 'h:mm:ss a',
      'longTime': 'h:mm:ss a z',
      'fullTime': 'h:mm:ss a zzzz'
    };

    const dateFormat = formatMap[format] || format;
    return this.datePipe.transform(value, dateFormat) || '';
  }

}
