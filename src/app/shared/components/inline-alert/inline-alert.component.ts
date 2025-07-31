import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-inline-alert',
  templateUrl: './inline-alert.component.html',
  styleUrls: ['./inline-alert.component.scss']
})
export class InlineAlertComponent {
  @Input() closeButton!: boolean;
  @Input() type: string = 'warning';
  isShow: boolean = true;

  onClose() {
    this.isShow = !this.isShow;
  }

}
