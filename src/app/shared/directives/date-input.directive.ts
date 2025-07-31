import { Directive, ElementRef, HostListener } from '@angular/core';
import { Regexs } from 'src/app/shared/utils/regexs';
@Directive({ selector: '[dateInput]' })
export class DateInputDirective {

  numpadKeyCodes = [
    48, 49, 50, 51, 52, 53, 54, 55, 56, 57,
    96, // 0
    97, // 1
    98, // 2
    99, // 3
    100, // 4
    101, // 5
    102, // 6
    103, // 7
    104, // 8
    105, // 9
  ];

  navigationKeyCodes = [
    8, // Backspace
    9, // Tab
    46, // Delete
    37, // Left arrow
    39, // Right arrow
    36, // Home button
    35, // End button
    65, // Select All
    67, // Copy
    86, // Paste
    89, // Redo
    90  // Undo
  ];

  private el: HTMLInputElement;

  constructor( private elementRef: ElementRef ) {
    this.el = this.elementRef.nativeElement;
  }

  @HostListener('keydown', ["$event"]) onKeyDown(event: { target: HTMLInputElement; key: any; keyCode: number; preventDefault: () => void; }) {
    const inputValue = (event.target as HTMLInputElement).value;
    const inputKey = event.key;

    if (!this.numpadKeyCodes.includes(event.keyCode) && !this.navigationKeyCodes.includes(event.keyCode)) {
      event.preventDefault();
      return;
    }

    if (inputKey !== 'Backspace' && inputKey !== 'Delete') {
      let numberChars = inputValue.length;

      if (numberChars === 2 || numberChars === 5) {
        (event.target as HTMLInputElement).value = inputValue + '/';
      }
    }
  }

  @HostListener('keyup', ["$event"]) onKeyUp(event: { target: HTMLInputElement; key: any; keyCode: number; preventDefault: () => void; }) {
    const inputValue = (event.target as HTMLInputElement).value;

    (event.target as HTMLInputElement).value = inputValue.replace(/[acyz]/g, '');

    if (event.keyCode === 86 && !inputValue.match(Regexs.DATE_FORMAT_DD_MM_YYYY)) {
      (event.target as HTMLInputElement).value = '';
    }
  }
}