import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BangVeData } from '../ds-bangve/ds-bangve.component';
import { CommonService } from 'src/app/shared/services/common.service';

@Component({
  selector: 'app-boi-day-ha',
  templateUrl: './boi-day-ha.component.html',
  styleUrls: ['./boi-day-ha.component.scss']
})
export class BoiDayHaComponent implements OnInit {
  @Input() isActive: boolean = false;
  @Output() isValid = new EventEmitter<boolean>();

  title = 'Bối dây hạ';
  windingForm!: FormGroup;
  bangve: BangVeData[] = [];

  nguoiGiaCongOptions: string[] = ['Nguyễn Văn A', 'Trần Thị B', 'Lê Văn C'];

  boiDayHaControl = new FormControl('', [Validators.required]);

  constructor(private fb: FormBuilder, private router: Router,private commonService: CommonService,) {
    this.windingForm = this.fb.group({
      boiDayHa: this.boiDayHaControl
    });
    const navigation = this.router.getCurrentNavigation();
    this.bangve = navigation?.extras?.state?.['drawings'];
    console.log('Bảng vẽ:', this.bangve);
  }

  ngOnInit() {
    console.log('Form:', this.windingForm);
    console.log('Controls:', this.windingForm.controls);
    this.windingForm = this.fb.group({
      congSuat: [{ value: this.bangve[0]?.congsuat, disabled: true }],
      TBKT: [{ value: this.bangve[0]?.tbkt, disabled: true }],
      dienAp: [{ value: this.bangve[0]?.dienap, disabled: true }],
      soBoiDay: [{ value: this.bangve[0]?.soboiday, disabled: true }],

      ngayGiaCong: [null, Validators.required],
      nguoiGiaCong: [null, Validators.required],
      kyHieuBV: [null, Validators.required],
      quyCachDay: [null, Validators.required],
      soSoiDay: [null, [Validators.required, Validators.min(1)]],
      ngaySanXuat: [null, Validators.required],
      nhaSanXuat: [null, Validators.required],
      chuViKhuon: [null, [Validators.required, Validators.min(0)]],
      ktBungBdTruoc: [null], // Changed from [{ value: null, disabled: true }]
      bungBdSau: [null, Validators.required],
      chieuQuanDay: ['trai', Validators.required], // Default to 'trai'
      mayQuanDay: [null, Validators.required],
      // QTD Hạ - Xung quanh
      xqDay2: [null],
      xqDay3: [null],
      xqDay4: [null],
      xqDay6: [null],
      // QTD Hạ - Hai đầu
      hdDay2: [null],
      hdDay3: [null],
      hdDay4: [null],
      hdDay6: [null],
      // Các thông số kỹ thuật bổ sung
      ktBdHaTrongBv1: [''],
      ktBdHaTrongBv2: [''],
      ktBdHaTrongBv3: [''],
      cvBdHa1p: [''],
      cvBdHa2p: [''],
      cvBdHa3p: [''],
      ktBdHaNgoaiBv1: [''],
      ktBdHaNgoaiBv2: [''],
      ktBdHaNgoaiBv3: [''],
      ktBdHaNgoaiBv4: [''],
      dienTroRa: [null],
      dienTroRb: [null],
      dienTroRc: [null],
      doLechDienTro: [null]
    });
    
    this.windingForm.get('chuViKhuon')?.valueChanges.subscribe(value => {
      const ktBungBdTruocControl = this.windingForm.get('ktBungBdTruoc');
      if (value !== null && value !== '' && value !== undefined) {
        ktBungBdTruocControl?.disable();
      } else {
        ktBungBdTruocControl?.disable();
        ktBungBdTruocControl?.setValue(null);
      }
    });
  }
  onSubmit(): void {
    if (this.windingForm.valid) {
      console.log('Form Submitted!', this.windingForm.value);
      // Here you would typically send the data to a backend service
      alert('Thông tin đã được lưu thành công!'); // Using alert for demo purposes
    } else {
      console.log('Form is invalid');
      // Mark all fields as touched to display validation errors
      this.windingForm.markAllAsTouched();
    }
  }

  giacongboidaycao(){ 
    console.log('Giao công bối dây hạ');
    this.isActive = false;
    this.isValid.emit(true);
    this.commonService.thongbao('Gia công bối dây hạ thành công!', 'Đóng', 'success');
    this.router.navigate(['ds-bang-ve']);
  }
}