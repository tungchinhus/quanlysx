import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { BangVeData } from '../ds-bangve/ds-bangve.component';

@Component({
  selector: 'app-bang-ve',
  templateUrl: './bang-ve.component.html',
  styleUrls: ['./bang-ve.component.scss']
})
export class BangVeComponent implements OnInit {
  bangVeForm!: FormGroup;
  isViewMode: boolean = false; // Biến để kiểm soát chế độ xem

  constructor(
    private fb: FormBuilder,
    private _snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<BangVeComponent>, // Inject MatDialogRef để đóng dialog
    @Inject(MAT_DIALOG_DATA) public data: { bangVeData?: BangVeData, mode: 'add' | 'view' | 'edit' } // Inject dữ liệu từ dialog
  ) { }

  ngOnInit(): void {
    this.bangVeForm = this.fb.group({
      id: [{ value: '', disabled: true }],
      kyhieubangve: ['', Validators.required],
      congsuat: ['', [Validators.required, Validators.pattern(/^[0-9]*$/)]],
      tbkt: [''],
      dienap: [''],
      soboiday: [''],
      bd_ha_trong: [''],
      bd_ha_ngoai: [''],
      bd_cao: [''],
      bd_ep: [''],
      bung_bd: ['', Validators.pattern(/^[0-9]*$/)],
      user_create: [{ value: 'Current User', disabled: true }],
      trang_thai: [false],
      created_at: [{ value: new Date().toISOString().slice(0, 16), disabled: true }]
    });

    console.log('Form initialized:', this.bangVeForm);
    console.log('kyhieubangve control:', this.bangVeForm.get('kyhieubangve'));
    console.log('kyhieubangve initial value:', this.bangVeForm.get('kyhieubangve')?.value);

    // Kiểm tra chế độ và điền dữ liệu nếu là xem/sửa
    if (this.data && this.data.bangVeData) {
      this.bangVeForm.patchValue(this.data.bangVeData); // Điền dữ liệu vào form
      if (this.data.mode === 'view') {
        this.bangVeForm.disable(); // Vô hiệu hóa form nếu ở chế độ xem
        this.isViewMode = true;
      }
    } else {
      // Nếu là thêm mới, đảm bảo các trường mặc định được thiết lập
      this.bangVeForm.patchValue({
        user_create: 'Current User',
        created_at: new Date().toISOString().slice(0, 16),
        trang_thai: false
      });
      
      // Đảm bảo kyhieubangve không bị disabled
      const kyhieuControl = this.bangVeForm.get('kyhieubangve');
      if (kyhieuControl && kyhieuControl.disabled) {
        kyhieuControl.enable();
      }
      
      // Đảm bảo form được enable trong chế độ add
      if (this.data.mode === 'add') {
        this.bangVeForm.enable();
      }
    }
    
    console.log('Form after initialization:', this.bangVeForm.value);
    console.log('kyhieubangve after init:', this.bangVeForm.get('kyhieubangve')?.value);
  }

  /**
   * Xử lý sự kiện khi nhấn nút "Thêm Bảng Vẽ" (trong dialog)
   */
  themBangVe(): void {
    console.log('Form valid:', this.bangVeForm.valid);
    console.log('Form values:', this.bangVeForm.value);
    console.log('Form raw values:', this.bangVeForm.getRawValue());
    console.log('kyhieubangve value:', this.bangVeForm.get('kyhieubangve')?.value);
    console.log('kyhieubangve valid:', this.bangVeForm.get('kyhieubangve')?.valid);
    console.log('kyhieubangve errors:', this.bangVeForm.get('kyhieubangve')?.errors);
    console.log('kyhieubangve disabled:', this.bangVeForm.get('kyhieubangve')?.disabled);
    console.log('kyhieubangve enabled:', this.bangVeForm.get('kyhieubangve')?.enabled);
    
    if (this.bangVeForm.valid) {
      const newBangVe = { ...this.bangVeForm.getRawValue(), id: null }; // ID sẽ được gán ở component cha
      console.log('Sending data to parent:', newBangVe);
      this.dialogRef.close(newBangVe); // Đóng dialog và trả về dữ liệu mới
      this._snackBar.open('Đang thêm bảng vẽ...', 'Đóng', { duration: 2000 });
    } else {
      console.log('Form is invalid. Errors:', this.bangVeForm.errors);
      this.bangVeForm.markAllAsTouched();
      this._snackBar.open('Vui lòng điền đầy đủ và đúng thông tin!', 'Đóng', { duration: 3000 });
    }
  }

  /**
   * Xử lý sự kiện khi nhấn nút "Copy Bảng Vẽ" (trong dialog)
   */
  copyBangVe(): void {
    if (this.bangVeForm.valid) {
      const currentData = this.bangVeForm.getRawValue();
      const copiedData = { ...currentData, id: null, created_at: new Date().toISOString().slice(0, 16) };
      this.bangVeForm.patchValue(copiedData);
      this._snackBar.open('Đã sao chép bảng vẽ!', 'Đóng', { duration: 3000 });
    } else {
      this._snackBar.open('Vui lòng điền đầy đủ và đúng thông tin để sao chép!', 'Đóng', { duration: 3000 });
      this.bangVeForm.markAllAsTouched();
    }
  }

  /**
   * Đóng dialog mà không lưu thay đổi.
   */
  onCancel(): void {
    this.dialogRef.close(); // Đóng dialog mà không truyền dữ liệu
  }

  /**
   * Test method để kiểm tra form
   */
  testForm(): void {
    console.log('Testing form...');
    this.bangVeForm.patchValue({
      kyhieubangve: 'TEST-BV-001',
      congsuat: 250,
      tbkt: 'TEST-TBKT',
      dienap: '22kV',
      soboiday: '3',
      bd_ha_trong: 'OK',
      bd_ha_ngoai: 'OK',
      bd_cao: 'OK',
      bd_ep: 'OK',
      bung_bd: 1
    });
    console.log('Form after test patch:', this.bangVeForm.value);
    console.log('Form valid after test:', this.bangVeForm.valid);
  }
}
