import { Pipe, PipeTransform } from '@angular/core';
import { DATE_FORMAT } from '../utils/localFormat';

declare const moment: any;

@Pipe({
  name: 'formatDate'
})
export class FormatDatePipe implements PipeTransform {

  transform(value: any, arg?: string): string {
    if (value === null || value === undefined) {
      return '';
    }
    const formatedData = moment(value).format(DATE_FORMAT.DD_MM_YYYY);
    return formatedData;
  }

}
