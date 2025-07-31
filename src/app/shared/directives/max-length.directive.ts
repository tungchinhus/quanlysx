import { Directive, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { Platform } from '@ionic/angular';

@Directive({
    selector: '[appMaxLength]'
})
export class MaxLengthDirective {

  @Input('cMaxLength') cMaxLength:any;
  @Output() ngModelChange:EventEmitter<any> = new EventEmitter();

  constructor(public platform: Platform) {
  }

  @HostListener('keyup',['$event']) onKeyup(event: any) {
    const element = event.target as HTMLInputElement;
    const limit = this.cMaxLength;
    if (this.platform.is('android')) {
      const value = element.value.substring(0, limit);
      if (value.length <= limit) {
        element.value = value;
      } else {
        element.value = value.substring(0, limit-1);
      }
      this.ngModelChange.emit(element.value);
    }
  }

  @HostListener('focus',['$event']) onFocus(event: any) {
    const element = event.target as HTMLInputElement;
    if (!this.platform.is('android')) {
      element.setAttribute('maxlength', this.cMaxLength)
    }
  }
}