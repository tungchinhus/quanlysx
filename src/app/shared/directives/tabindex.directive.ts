import { Directive, HostListener } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

@Directive({
  selector: '[tabindex]'
})
export class TabindexDirective {

  constructor(
    private dialog: MatDialog
  ) {}

  @HostListener('keydown.tab', ['$event'])
  onKeydownHandler(event: any) {
    if (this.dialog.openDialogs.length && event.target.classList.value.indexOf('allow-tabindex') === -1) {
      event.preventDefault();
    }
  }

}
