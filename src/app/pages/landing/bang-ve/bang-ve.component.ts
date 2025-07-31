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
      soboyday: [''],
      bd_ha_trong: [''],
      bd_ha_ngoai: [''],
      bd_cao: [''],
      bd_ep: [''],
      bung_bd: ['', Validators.pattern(/^[0-9]*$/)],
      user_create: [{ value: 'Current User', disabled: true }],
      trang_thai: [false],
      created_at: [{ value: new Date().toISOString().slice(0, 16), disabled: true }]
    });

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
    }
  }

  /**
   * Xử lý sự kiện khi nhấn nút "Thêm Bảng Vẽ" (trong dialog)
   */
  themBangVe(): void {
    if (this.bangVeForm.valid) {
      const newBangVe = { ...this.bangVeForm.getRawValue(), id: null }; // ID sẽ được gán ở component cha
      this.dialogRef.close(newBangVe); // Đóng dialog và trả về dữ liệu mới
      this._snackBar.open('Đang thêm bảng vẽ...', 'Đóng', { duration: 2000 });
    } else {
      this._snackBar.open('Vui lòng điền đầy đủ và đúng thông tin!', 'Đóng', { duration: 3000 });
      this.bangVeForm.markAllAsTouched();
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
}
