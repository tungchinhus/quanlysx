import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-ep-boi-day',
  templateUrl: './ep-boi-day.component.html',
  styleUrls: ['./ep-boi-day.component.scss']
})
export class EpBoiDayComponent implements OnInit {
  @Input() isActive: boolean = false; // <-- PHẢI CÓ @Input() này
  @Output() isValid = new EventEmitter<boolean>();

  epBoiDayControl = new FormControl('', [Validators.required]); // <-- PHẢI CÓ FormControl này

  ngOnInit() {
    this.epBoiDayControl.statusChanges.subscribe(status => {
      this.isValid.emit(status === 'VALID');
    });
    // Phát sự kiện isValid ban đầu
    this.isValid.emit(this.epBoiDayControl.valid);
  }
}
