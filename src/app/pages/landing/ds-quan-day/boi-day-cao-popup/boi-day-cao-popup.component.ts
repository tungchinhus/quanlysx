import { Component, Inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonService } from 'src/app/shared/services/common.service';
import { AuthServices } from 'src/app/shared/services/authen/auth.service';
import { QuanDayData } from '../ds-quan-day.component';
import { Constant } from 'src/app/constant/constant';

export interface BoiDayCaoData {
  id?: number;
  quan_day_id: number;
  ky_hieu_bv: string;
  cong_suat: number;
  tbkt: string;
  dien_ap: string;
  so_boi_day: string;
  quy_cach_day: string;
  so_soi_day: number;
  nha_san_xuat: string;
  nha_san_xuat_name?: string; // Tên hiển thị của nhà sản xuất
  ngay_san_xuat: Date;
  chu_vi_khuon: number;
  nguoi_gia_cong: string;
  ngay_gia_cong: Date;
  ghi_chu?: string;
  trang_thai: number;
  // Thêm các field đặc biệt cho bối dây cao
  chieu_cao_day?: number;
  so_lop_day?: number;
  khoang_cach_day?: number;
  chat_lieu_cach_dien?: string;
  // Bổ sung thêm các field kỹ thuật
  do_day_cach_dien?: number;
  nhiet_do_lam_viec?: number;
  do_am_moi_truong?: number;
  ap_luc_lam_viec?: number;
  toc_do_quay?: number;
  thoi_gian_quay?: number;
  loai_may_quay?: string;
  // Bổ sung thêm các field theo hình
  kt_bung_bd_truoc?: number;
  bung_bd_sau?: number;
  chieu_quan_day?: string; // 'trái' hoặc 'phải'
  may_quan_day?: string;
  xung_quanh_day?: number; // 2, 3, 4, 6
  hai_dau_day?: number; // 2, 3, 4, 6
  kt_bd_ha_trong_bv?: string;
  chu_vi_bd_ha_trong_1p?: number;
  chu_vi_bd_ha_trong_2p?: number;
  chu_vi_bd_ha_trong_3p?: number;
  kt_bd_ha_ngoai_bv?: string;
  kt_bd_ha_ngoai_bv_1p?: number;
  kt_bd_ha_ngoai_bv_2p?: number;
  kt_bd_ha_ngoai_bv_3p?: number;
  dien_tro_ha_ra?: number;
  dien_tro_ha_rb?: number;
  dien_tro_ha_rc?: number;
  do_lech_dien_tro_giua_cac_pha?: number;
  created_at?: Date;
  updated_at?: Date;
}

@Component({
  selector: 'app-boi-day-cao-popup',
  templateUrl: './boi-day-cao-popup.component.html',
  styleUrls: ['./boi-day-cao-popup.component.scss']
})
export class BoiDayCaoPopupComponent implements OnInit {
  boiDayCaoForm!: FormGroup;
  manufacturers = Constant.manufacturers;
  isLoading = false;
  currentUser: any;
  authToken: string = '';
  currentDate: Date = new Date();

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<BoiDayCaoPopupComponent>,
    private commonService: CommonService,
    private authService: AuthServices,
    private changeDetectorRef: ChangeDetectorRef,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.boiDayCaoForm = this.fb.group({
      // Chỉ giữ lại các field thực sự cần thiết cho business logic
      quy_cach_day: ['', Validators.required], // Quy cách dây - cần thiết
      so_soi_day: [1, [Validators.required, Validators.min(1)]], // Số sợi dây - cần thiết
      nha_san_xuat: ['VAN_THANG', Validators.required], // Nhà sản xuất - cần thiết
      nha_san_xuat_other: [''], // Tên nhà sản xuất khác (optional)
      ngay_san_xuat: [new Date(), Validators.required], // Ngày sản xuất - cần thiết
      
      // Các field kỹ thuật - có thể để trống hoặc có giá trị mặc định
      chu_vi_khuon: [0, [Validators.min(0)]],
      chieu_cao_day: [0, [Validators.min(0)]],
      so_lop_day: [1, [Validators.min(1)]],
      khoang_cach_day: [0, [Validators.min(0)]],
      chat_lieu_cach_dien: [''],
      do_day_cach_dien: [0, [Validators.min(0)]],
      nhiet_do_lam_viec: [25, [Validators.min(-40), Validators.max(200)]],
      do_am_moi_truong: [60, [Validators.min(0), Validators.max(100)]],
      ap_luc_lam_viec: [1, [Validators.min(0)]],
      toc_do_quay: [0, [Validators.min(0)]],
      thoi_gian_quay: [0, [Validators.min(0)]],
      loai_may_quay: [''],
      
      // Các field theo hình - có thể để trống
      kt_bung_bd_truoc: [0, [Validators.min(0)]],
      bung_bd_sau: [0, [Validators.min(0)]],
      chieu_quan_day: ['trái'], // Có giá trị mặc định
      may_quan_day: [''],
      xung_quanh_day: [2, [Validators.min(2), Validators.max(6)]],
      hai_dau_day: [2, [Validators.min(2), Validators.max(6)]],
      kt_bd_ha_trong_bv: [''],
      chu_vi_bd_ha_trong_1p: [0, [Validators.min(0)]],
      chu_vi_bd_ha_trong_2p: [0, [Validators.min(0)]],
      chu_vi_bd_ha_trong_3p: [0, [Validators.min(0)]],
      kt_bd_ha_ngoai_bv: [''],
      kt_bd_ha_ngoai_bv_1p: [0, [Validators.min(0)]],
      kt_bd_ha_ngoai_bv_2p: [0, [Validators.min(0)]],
      kt_bd_ha_ngoai_bv_3p: [0, [Validators.min(0)]],
      dien_tro_ha_ra: [0, [Validators.min(0)]],
      dien_tro_ha_rb: [0, [Validators.min(0)]],
      dien_tro_ha_rc: [0, [Validators.min(0)]],
      do_lech_dien_tro_giua_cac_pha: [0, [Validators.min(0), Validators.max(2)]],
      ghi_chu: ['']
    });
  }

  ngOnInit() {
    console.log('BoiDayCaoPopup initialized with data:', this.data);
    
    // Khởi tạo form với giá trị mặc định
    this.boiDayCaoForm = this.fb.group({
      // Chỉ giữ lại các field thực sự cần thiết cho business logic
      quy_cach_day: ['', Validators.required], // Quy cách dây - cần thiết
      so_soi_day: [1, [Validators.required, Validators.min(1)]], // Số sợi dây - cần thiết
      nha_san_xuat: ['VAN_THANG', Validators.required], // Nhà sản xuất - cần thiết
      nha_san_xuat_other: [''], // Tên nhà sản xuất khác (optional)
      ngay_san_xuat: [new Date(), Validators.required], // Ngày sản xuất - cần thiết
      
      // Các field kỹ thuật - có thể để trống hoặc có giá trị mặc định
      chu_vi_khuon: [0, [Validators.min(0)]],
      chieu_cao_day: [0, [Validators.min(0)]],
      so_lop_day: [1, [Validators.min(1)]],
      khoang_cach_day: [0, [Validators.min(0)]],
      chat_lieu_cach_dien: [''],
      do_day_cach_dien: [0, [Validators.min(0)]],
      nhiet_do_lam_viec: [25, [Validators.min(-40), Validators.max(200)]],
      do_am_moi_truong: [60, [Validators.min(0), Validators.max(100)]],
      ap_luc_lam_viec: [1, [Validators.min(0)]],
      toc_do_quay: [0, [Validators.min(0)]],
      thoi_gian_quay: [0, [Validators.min(0)]],
      loai_may_quay: [''],
      
      // Các field theo hình - có thể để trống
      kt_bung_bd_truoc: [0, [Validators.min(0)]],
      bung_bd_sau: [0, [Validators.min(0)]],
      chieu_quan_day: ['trái'], // Có giá trị mặc định
      may_quan_day: [''],
      xung_quanh_day: [2, [Validators.min(2), Validators.max(6)]],
      hai_dau_day: [2, [Validators.min(2), Validators.max(6)]],
      kt_bd_ha_trong_bv: [''],
      chu_vi_bd_ha_trong_1p: [0, [Validators.min(0)]],
      chu_vi_bd_ha_trong_2p: [0, [Validators.min(0)]],
      chu_vi_bd_ha_trong_3p: [0, [Validators.min(0)]],
      kt_bd_ha_ngoai_bv: [''],
      kt_bd_ha_ngoai_bv_1p: [0, [Validators.min(0)]],
      kt_bd_ha_ngoai_bv_2p: [0, [Validators.min(0)]],
      kt_bd_ha_ngoai_bv_3p: [0, [Validators.min(0)]],
      dien_tro_ha_ra: [0, [Validators.min(0)]],
      dien_tro_ha_rb: [0, [Validators.min(0)]],
      dien_tro_ha_rc: [0, [Validators.min(0)]],
      do_lech_dien_tro_giua_cac_pha: [0, [Validators.min(0), Validators.max(2)]],
      ghi_chu: ['']
    });
    
    // Lấy thông tin user hiện tại
    this.currentUser = this.authService.getUserInfoFromStorage();
    this.authToken = this.authService.getToken() || '';
    
    console.log('Current user:', this.currentUser);
    console.log('Auth token:', this.authToken ? 'Available' : 'Not available');
    
    // Kiểm tra validation ban đầu
    this.onFormValueChange();
  }

  // Debug validation form
  debugFormValidation() {
    console.log('=== DEBUG FORM VALIDATION ===');
    console.log('Form valid:', this.boiDayCaoForm.valid);
    console.log('Form dirty:', this.boiDayCaoForm.dirty);
    console.log('Form touched:', this.boiDayCaoForm.touched);
    
    // Kiểm tra từng field bắt buộc
    const requiredFields = [
      'quy_cach_day',
      'so_soi_day', 
      'nha_san_xuat',
      'ngay_san_xuat'
    ];
    
    requiredFields.forEach(fieldName => {
      const control = this.boiDayCaoForm.get(fieldName);
      console.log(`${fieldName}:`, {
        value: control?.value,
        valid: control?.valid,
        errors: control?.errors,
        touched: control?.touched,
        dirty: control?.dirty
      });
    });
    
    // Kiểm tra nhà sản xuất khác nếu cần
    const nhaSanXuat = this.boiDayCaoForm.get('nha_san_xuat')?.value;
    if (nhaSanXuat === 'OTHER') {
      const otherField = this.boiDayCaoForm.get('nha_san_xuat_other');
      console.log('nha_san_xuat_other:', {
        value: otherField?.value,
        valid: otherField?.valid,
        errors: otherField?.errors,
        touched: otherField?.touched
      });
    }
    
    console.log('Can submit form:', this.canSubmitForm());
    console.log('=== END DEBUG ===');
  }

  // Kiểm tra form có thể submit được không
  canSubmitForm(): boolean {
    if (this.isLoading) return false;
    
    // Chỉ kiểm tra các field thực sự cần thiết cho business logic
    const requiredFields = [
      'quy_cach_day',
      'so_soi_day', 
      'nha_san_xuat',
      'ngay_san_xuat'
    ];
    
    // Kiểm tra các field bắt buộc
    for (const fieldName of requiredFields) {
      const control = this.boiDayCaoForm.get(fieldName);
      if (!control || !control.valid || !control.value) {
        console.log(`Field ${fieldName} không hợp lệ:`, control?.value, control?.errors);
        return false;
      }
    }
    
    // Kiểm tra nhà sản xuất khác nếu chọn "OTHER"
    const nhaSanXuat = this.boiDayCaoForm.get('nha_san_xuat')?.value;
    if (nhaSanXuat === 'OTHER') {
      const nhaSanXuatOther = this.boiDayCaoForm.get('nha_san_xuat_other')?.value;
      if (!nhaSanXuatOther || !nhaSanXuatOther.trim()) {
        console.log('Chưa nhập tên nhà sản xuất khác');
        return false;
      }
    }
    
    console.log('Form có thể submit - tất cả field bắt buộc đã được nhập');
    return true;
  }

  // Trigger validation check khi form thay đổi
  onFormValueChange() {
    // Trigger change detection để cập nhật UI
    this.changeDetectorRef.detectChanges();
    
    // Log trạng thái validation để debug
    console.log('Form validation status:', {
      canSubmit: this.canSubmitForm(),
      formValid: this.boiDayCaoForm.valid,
      requiredFields: {
        quy_cach_day: this.boiDayCaoForm.get('quy_cach_day')?.valid,
        so_soi_day: this.boiDayCaoForm.get('so_soi_day')?.valid,
        nha_san_xuat: this.boiDayCaoForm.get('nha_san_xuat')?.valid,
        ngay_san_xuat: this.boiDayCaoForm.get('ngay_san_xuat')?.valid
      }
    });
  }

  // Xử lý khi thay đổi nhà sản xuất
  onManufacturerChange(event: any) {
    const selectedValue = event.value;
    const otherField = this.boiDayCaoForm.get('nha_san_xuat_other');
    
    if (selectedValue === 'OTHER') {
      // Nếu chọn "Khác", thêm validation required cho field nhà sản xuất khác
      otherField?.setValidators([Validators.required]);
      otherField?.markAsUntouched(); // Reset trạng thái touched
    } else {
      // Nếu chọn nhà sản xuất có sẵn, bỏ validation required
      otherField?.clearValidators();
      otherField?.setValue(''); // Xóa giá trị cũ
      otherField?.markAsUntouched();
    }
    
    otherField?.updateValueAndValidity();
    
    // Trigger validation check để cập nhật trạng thái nút submit
    this.onFormValueChange();
  }

  onSubmit(): void {
    console.log('Bắt đầu submit form...');
    
    // Kiểm tra form có thể submit được không
    if (!this.canSubmitForm()) {
      console.log('Form không thể submit - kiểm tra validation');
      this.debugFormValidation();
      return;
    }

    // Lấy dữ liệu từ form
    const formData = this.boiDayCaoForm.value;
    
    // Xử lý nhà sản xuất
    let nhaSanXuat = formData.nha_san_xuat;
    let nhaSanXuatName = '';
    
    if (nhaSanXuat === 'OTHER') {
      nhaSanXuat = formData.nha_san_xuat_other;
      nhaSanXuatName = formData.nha_san_xuat_other;
    } else {
      nhaSanXuatName = this.getManufacturerName(nhaSanXuat);
    }

    // Chuẩn bị dữ liệu để gửi API
    const submitData: BoiDayCaoData = {
      ...formData,
      nha_san_xuat: nhaSanXuat,
      nha_san_xuat_name: nhaSanXuatName,
      ngay_san_xuat: formData.ngay_san_xuat instanceof Date ? 
        formData.ngay_san_xuat.toISOString().split('T')[0] : 
        formData.ngay_san_xuat
    };

    console.log('Dữ liệu sẽ gửi:', submitData);

    this.isLoading = true;
    // this.changeDetectorRef.detectChanges(); // This line was removed as per the new_code

    // Gọi API để lưu dữ liệu
    this.http.post<any>(`${this.commonService.getServerAPIURL()}api/BoiDayCao/Create`, submitData, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.authToken}`
      })
    }).subscribe({
      next: (response) => {
        console.log('Lưu thành công:', response);
        this.isLoading = false;
        // this.changeDetectorRef.detectChanges(); // This line was removed as per the new_code
        
        // Hiển thị thông báo thành công
        this.snackBar.open('Lưu thông tin bối dây cao thành công!', 'Đóng', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
        
        // Đóng popup và trả về dữ liệu
        this.dialogRef.close({
          success: true,
          data: submitData
        });
      },
      error: (error) => {
        console.error('Lỗi khi lưu:', error);
        this.isLoading = false;
        // this.changeDetectorRef.detectChanges(); // This line was removed as per the new_code
        
        let errorMessage = 'Có lỗi xảy ra khi lưu thông tin';
        
        // Xử lý các loại lỗi cụ thể
        if (error.status === 401) {
          errorMessage = 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
        } else if (error.status === 403) {
          errorMessage = 'Bạn không có quyền thực hiện thao tác này.';
        } else if (error.status === 400) {
          errorMessage = 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.';
        } else if (error.status === 500) {
          errorMessage = 'Lỗi server. Vui lòng thử lại sau.';
        }
        
        this.snackBar.open(errorMessage, 'Đóng', {
          duration: 5000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  // Lấy tên nhà sản xuất từ value
  getManufacturerName(value: string): string {
    const manufacturer = this.manufacturers.find(m => m.value === value);
    return manufacturer ? manufacturer.name : value;
  }

  // Kiểm tra form có thay đổi gì không
  hasUnsavedChanges(): boolean {
    return this.boiDayCaoForm.dirty || this.boiDayCaoForm.touched;
  }

  // Xử lý khi user muốn hủy
  onCancel() {
    if (this.hasUnsavedChanges()) {
      // Nếu có thay đổi chưa lưu, hỏi user có muốn hủy không
      if (confirm('Bạn có thay đổi chưa lưu. Bạn có chắc muốn hủy?')) {
        this.dialogRef.close();
      }
    } else {
      // Nếu không có thay đổi, đóng popup ngay
      this.dialogRef.close();
    }
  }

  // Reset form về trạng thái ban đầu
  resetForm() {
    console.log('Reset form về trạng thái ban đầu');
    
    // Reset form về giá trị mặc định
    this.boiDayCaoForm.reset({
      quy_cach_day: '',
      so_soi_day: 1,
      nha_san_xuat: 'VAN_THANG',
      nha_san_xuat_other: '',
      ngay_san_xuat: new Date(),
      chu_vi_khuon: 0,
      chieu_cao_day: 0,
      so_lop_day: 1,
      khoang_cach_day: 0,
      chat_lieu_cach_dien: '',
      do_day_cach_dien: 0,
      nhiet_do_lam_viec: 25,
      do_am_moi_truong: 60,
      ap_luc_lam_viec: 1,
      toc_do_quay: 0,
      thoi_gian_quay: 0,
      loai_may_quay: '',
      kt_bung_bd_truoc: 0,
      bung_bd_sau: 0,
      chieu_quan_day: 'trái',
      may_quan_day: '',
      xung_quanh_day: 2,
      hai_dau_day: 2,
      kt_bd_ha_trong_bv: '',
      chu_vi_bd_ha_trong_1p: 0,
      chu_vi_bd_ha_trong_2p: 0,
      chu_vi_bd_ha_trong_3p: 0,
      kt_bd_ha_ngoai_bv: '',
      kt_bd_ha_ngoai_bv_1p: 0,
      kt_bd_ha_ngoai_bv_2p: 0,
      kt_bd_ha_ngoai_bv_3p: 0,
      dien_tro_ha_ra: 0,
      dien_tro_ha_rb: 0,
      dien_tro_ha_rc: 0,
      do_lech_dien_tro_giua_cac_pha: 0,
      ghi_chu: ''
    });
    
    // Reset validation state
    this.boiDayCaoForm.markAsUntouched();
    this.boiDayCaoForm.markAsPristine();
    
    // Reset validation cho nhà sản xuất khác
    const otherField = this.boiDayCaoForm.get('nha_san_xuat_other');
    otherField?.clearValidators();
    otherField?.updateValueAndValidity();
    
    console.log('Form đã được reset');
    
    // Trigger validation check
    this.onFormValueChange();
  }

  private markFormGroupTouched(): void {
    Object.keys(this.boiDayCaoForm.controls).forEach(key => {
      const control = this.boiDayCaoForm.get(key);
      control?.markAsTouched();
    });
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Đóng', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['success-snackbar']
    });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Đóng', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['error-snackbar']
    });
  }
}
