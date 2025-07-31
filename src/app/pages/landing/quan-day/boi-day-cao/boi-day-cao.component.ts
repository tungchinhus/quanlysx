import { Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatTabGroup } from '@angular/material/tabs';

@Component({
  selector: 'app-boi-day-cao',
  templateUrl: './boi-day-cao.component.html',
  styleUrls: ['./boi-day-cao.component.scss']
})
export class BoiDayCaoComponent implements OnInit {
  @Input() isActive: boolean = false; // <-- PHẢI CÓ @Input() này
  @Output() isValid = new EventEmitter<boolean>();

  boiDayCaoControl = new FormControl('', [Validators.required]); // <-- PHẢI CÓ FormControl này

  ngOnInit() {
    this.boiDayCaoControl.statusChanges.subscribe(status => {
      this.isValid.emit(status === 'VALID');
    });
    // Phát sự kiện isValid ban đầu
    this.isValid.emit(this.boiDayCaoControl.valid);
  }

  @ViewChild('tabGroup') tabGroup!: MatTabGroup;

  selectedIndex: number = 0;
  tabValidity: boolean[] = [false, false, false];

  onTabValidityChange(index: number, isValid: boolean) {
    this.tabValidity[index] = isValid;
  }

  onTabChange(event: any) {
    const newIndex = event.index;
    const previousIndex = this.selectedIndex;

    if (newIndex > previousIndex && !this.tabValidity[previousIndex]) {
      this.tabGroup.selectedIndex = previousIndex;
    } else {
      this.selectedIndex = newIndex;
    }
  }

  goToNextTab() {
    if (this.selectedIndex < this.tabValidity.length - 1 && this.tabValidity[this.selectedIndex]) {
      this.selectedIndex++;
    } else {
      console.log('Cannot go to next tab: either last tab or current tab invalid.');
    }
  }

  goToPreviousTab() {
    if (this.selectedIndex > 0) {
      this.selectedIndex--;
    } else {
      console.log('Cannot go to previous tab: already on first tab.')
    }
  }

  canComplete(): boolean {
    return this.tabValidity.every(isValid => isValid);
  }

  onComplete() {
    if (this.canComplete()) {
      alert('Tất cả dữ liệu đã được nhập đầy đủ! Đã hoàn thành.');
      console.log('Form completed:', this.tabValidity);
    } else {
      alert('Vui lòng nhập đầy đủ dữ liệu ở tất cả các tab trước khi hoàn thành!');
    }
  }
}
