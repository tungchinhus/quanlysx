import { Pipe, PipeTransform } from '@angular/core';
import { Constant } from 'src/app/constant/constant';

@Pipe({
  name: 'formatCurrency'
})
export class FormatCurrencyPipe implements PipeTransform {

  transform(value: any, arg?: string): string {
    const numparse= parseInt(value.toString().replace(/\./g,''), 10) || 0;

    const formatedData = numparse.toString().replace(Constant.currencyRegex, "$1.");
    return `${formatedData}${arg?.length ? ' ' + arg : ''}`;
  }
}
