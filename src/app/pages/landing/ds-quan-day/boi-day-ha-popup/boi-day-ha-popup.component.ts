import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonService } from 'src/app/shared/services/common.service';
import { AuthServices } from 'src/app/shared/services/authen/auth.service';
import { QuanDayData } from '../ds-quan-day.component';

export interface BoiDayHaData {
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
  ngay_san_xuat: Date;
  chu_vi_khuon: number;
  nguoi_gia_cong: string;
  ngay_gia_cong: Date;
  ghi_chu?: string;
  trang_thai: number;
  created_at?: Date;
  updated_at?: Date;
}

@Component({
  selector: 'app-boi-day-ha-popup',
  templateUrl: './boi-day-ha-popup.component.html',
  styleUrls: ['./boi-day-ha-popup.component.scss']
})
export class BoiDayHaPopupComponent implements OnInit {
  boiDayHaForm!: FormGroup;
  isLoading: boolean = false;
  currentUser: any = null;
  currentDate: Date = new Date();

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<BoiDayHaPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { quanDay: QuanDayData },
    private snackBar: MatSnackBar,
    private http: HttpClient,
    private commonService: CommonService,
    private authService: AuthServices
  ) {
    this.boiDayHaForm = this.fb.group({
      quy_cach_day: ['', Validators.required],
      so_soi_day: [1, [Validators.required, Validators.min(1)]],
      nha_san_xuat: ['', Validators.required],
      ngay_san_xuat: [new Date(), Validators.required],
      chu_vi_khuon: [0, [Validators.required, Validators.min(0)]],
      // Thêm các field mới cho bối dây cao
      chieu_cao_day: [0, [Validators.required, Validators.min(0)]],
      so_lop_day: [1, [Validators.required, Validators.min(1)]],
      khoang_cach_day: [0, [Validators.required, Validators.min(0)]],
      chat_lieu_cach_dien: ['', Validators.required],
      // Bổ sung thêm các field kỹ thuật
      do_day_cach_dien: [0, [Validators.required, Validators.min(0)]],
      nhiet_do_lam_viec: [25, [Validators.required, Validators.min(-40), Validators.max(200)]],
      do_am_moi_truong: [60, [Validators.required, Validators.min(0), Validators.max(100)]],
      ap_luc_lam_viec: [1, [Validators.required, Validators.min(0)]],
      toc_do_quay: [0, [Validators.required, Validators.min(0)]],
      thoi_gian_quay: [0, [Validators.required, Validators.min(0)]],
      loai_may_quay: ['', Validators.required],
      // Bổ sung thêm các field theo hình
      kt_bung_bd_truoc: [0, [Validators.required, Validators.min(0)]],
      bung_bd_sau: [0, [Validators.required, Validators.min(0)]],
      chieu_quan_day: ['trái', Validators.required],
      may_quan_day: ['', Validators.required],
      xung_quanh_day: [2, [Validators.required, Validators.min(2), Validators.max(6)]],
      hai_dau_day: [2, [Validators.required, Validators.min(2), Validators.max(6)]],
      kt_bd_ha_trong_bv: ['', Validators.required],
      chu_vi_bd_ha_trong_1p: [0, [Validators.required, Validators.min(0)]],
      chu_vi_bd_ha_trong_2p: [0, [Validators.required, Validators.min(0)]],
      chu_vi_bd_ha_trong_3p: [0, [Validators.required, Validators.min(0)]],
      kt_bd_ha_ngoai_bv: ['', Validators.required],
      kt_bd_ha_ngoai_bv_1p: [0, [Validators.required, Validators.min(0)]],
      kt_bd_ha_ngoai_bv_2p: [0, [Validators.required, Validators.min(0)]],
      kt_bd_ha_ngoai_bv_3p: [0, [Validators.required, Validators.min(0)]],
      dien_tro_ha_ra: [0, [Validators.required, Validators.min(0)]],
      dien_tro_ha_rb: [0, [Validators.required, Validators.min(0)]],
      dien_tro_ha_rc: [0, [Validators.required, Validators.min(0)]],
      do_lech_dien_tro_giua_cac_pha: [0, [Validators.required, Validators.min(0), Validators.max(2)]],
      ghi_chu: ['']
    });
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getUserInfoFromStorage();
    console.log('Quan day data:', this.data.quanDay);
    console.log('Current user:', this.currentUser);
  }

  onSubmit(): void {
    if (this.boiDayHaForm.valid) {
      this.isLoading = true;
      
      const formData = this.boiDayHaForm.value;
      const boiDayHaData: BoiDayHaData = {
        quan_day_id: this.data.quanDay.id,
        ky_hieu_bv: this.data.quanDay.kyhieuquanday + '-065',
        cong_suat: this.data.quanDay.congsuat,
        tbkt: this.data.quanDay.tbkt,
        dien_ap: this.data.quanDay.dienap,
        so_boi_day: this.data.quanDay.soboiday,
        quy_cach_day: formData.quy_cach_day,
        so_soi_day: formData.so_soi_day,
        nha_san_xuat: formData.nha_san_xuat,
        ngay_san_xuat: formData.ngay_san_xuat,
        chu_vi_khuon: formData.chu_vi_khuon,
        nguoi_gia_cong: this.currentUser?.username || this.currentUser?.name || 'Unknown',
        ngay_gia_cong: new Date(),
        ghi_chu: formData.ghi_chu,
        trang_thai: 1 // 1 = Đang gia công
      };

      console.log('Submitting boi day ha data:', boiDayHaData);
      
      this.saveBoiDayHa(boiDayHaData);
    } else {
      this.markFormGroupTouched();
    }
  }

  private saveBoiDayHa(data: BoiDayHaData): void {
    const apiUrl = `${this.commonService.getServerAPIURL()}api/BoiDayHa/Create`;
    const token = this.authService.getToken();
    
    if (!token) {
      this.showError('Không có token xác thực');
      this.isLoading = false;
      return;
    }

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    this.http.post<any>(apiUrl, data, { headers })
      .subscribe({
        next: (response) => {
          console.log('Boi day ha saved successfully:', response);
          this.showSuccess('Lưu thông tin bối dây hạ thành công!');
          this.dialogRef.close({ success: true, data: response });
        },
        error: (error) => {
          console.error('Error saving boi day ha:', error);
          this.showError('Lỗi khi lưu thông tin bối dây hạ: ' + (error.error?.message || error.message || 'Unknown error'));
          this.isLoading = false;
        }
      });
  }

  onCancel(): void {
    this.dialogRef.close({ success: false });
  }

  private markFormGroupTouched(): void {
    Object.keys(this.boiDayHaForm.controls).forEach(key => {
      const control = this.boiDayHaForm.get(key);
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
