
import { Directive, HostListener, ElementRef, Input } from '@angular/core';
import { Constant } from 'src/app/constant/constant';
import { formatRoundCurrency } from '../utils/currencyUtils';

@Directive({ selector: '[currencyInput]' })
export class CurrencyInputDirective {

  private regexString(max?: string) {
    const maxStr = max ? `{0,${max}}` : `+`;
    return `^(\\d${maxStr}(\\.\\d{0,2})?|\\.\\d{0,2})$`
  }

  private digitRegex: RegExp = new RegExp(this.regexString('15'), 'g');

  private setRegex(maxDigits?: string) {
    this.digitRegex = new RegExp(this.regexString(maxDigits), 'g');
  }

  @Input()
  set maxDigits(maxDigits: string) {
    this.setRegex(maxDigits);
  } 

  private el: HTMLInputElement;

  constructor( private elementRef: ElementRef ) {
    this.el = this.elementRef.nativeElement;
    this.setRegex();
  }

  @HostListener('focus', ['$event.target.value'])
  onFocus(value: any) {
    // on focus remove currency formatting
    this.el.value = value.replace(Constant.numberOnlyRegex, '');
  }

  @HostListener('blur', ['$event.target.value'])
  onBlur(value: any) {
    // on blur, add currency formatting
    this.el.value = formatRoundCurrency(value);
  }

  private lastValid = '';
  @HostListener('input', ['$event'])
  onInput(event: any) {
    // on input, run regex to only allow certain characters and format
    const cleanValue = (event.target.value.match(this.digitRegex) || []).join('');
    if (cleanValue || !event.target.value) {
      this.lastValid = cleanValue;
    }

    this.el.value = cleanValue || this.lastValid
  }
}