import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[appTrim]',
})
export class TrimDirective {
  constructor(
    private el: ElementRef
  ) { }

  @HostListener('blur') onBlur() {
    const value = this.el.nativeElement.value;
    if (value) {
      this.el.nativeElement.value = value.trim();
    }
  }
}