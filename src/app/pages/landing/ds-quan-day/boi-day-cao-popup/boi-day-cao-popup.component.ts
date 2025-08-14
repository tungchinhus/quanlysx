import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonService } from 'src/app/shared/services/common.service';
import { AuthServices } from 'src/app/shared/services/authen/auth.service';
import { QuanDayData } from '../ds-quan-day.component';

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
  isLoading: boolean = false;
  currentUser: any = null;
  currentDate: Date = new Date();

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<BoiDayCaoPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { quanDay: QuanDayData },
    private snackBar: MatSnackBar,
    private http: HttpClient,
    private commonService: CommonService,
    private authService: AuthServices
  ) {
    this.boiDayCaoForm = this.fb.group({
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
    if (this.boiDayCaoForm.valid) {
      this.isLoading = true;
      
      const formData = this.boiDayCaoForm.value;
      const boiDayCaoData: BoiDayCaoData = {
        quan_day_id: this.data.quanDay.id,
        ky_hieu_bv: this.data.quanDay.kyhieuquanday + '-066',
        cong_suat: this.data.quanDay.congsuat,
        tbkt: this.data.quanDay.tbkt,
        dien_ap: this.data.quanDay.dienap,
        so_boi_day: this.data.quanDay.soboiday,
        quy_cach_day: formData.quy_cach_day,
        so_soi_day: formData.so_soi_day,
        nha_san_xuat: formData.nha_san_xuat,
        ngay_san_xuat: formData.ngay_san_xuat,
        chu_vi_khuon: formData.chu_vi_khuon,
        // Thêm các field mới cho bối dây cao
        chieu_cao_day: formData.chieu_cao_day,
        so_lop_day: formData.so_lop_day,
        khoang_cach_day: formData.khoang_cach_day,
        chat_lieu_cach_dien: formData.chat_lieu_cach_dien,
        // Bổ sung thêm các field kỹ thuật
        do_day_cach_dien: formData.do_day_cach_dien,
        nhiet_do_lam_viec: formData.nhiet_do_lam_viec,
        do_am_moi_truong: formData.do_am_moi_truong,
        ap_luc_lam_viec: formData.ap_luc_lam_viec,
        toc_do_quay: formData.toc_do_quay,
        thoi_gian_quay: formData.thoi_gian_quay,
        loai_may_quay: formData.loai_may_quay,
        // Bổ sung thêm các field theo hình
        kt_bung_bd_truoc: formData.kt_bung_bd_truoc,
        bung_bd_sau: formData.bung_bd_sau,
        chieu_quan_day: formData.chieu_quan_day,
        may_quan_day: formData.may_quan_day,
        xung_quanh_day: formData.xung_quanh_day,
        hai_dau_day: formData.hai_dau_day,
        kt_bd_ha_trong_bv: formData.kt_bd_ha_trong_bv,
        chu_vi_bd_ha_trong_1p: formData.chu_vi_bd_ha_trong_1p,
        chu_vi_bd_ha_trong_2p: formData.chu_vi_bd_ha_trong_2p,
        chu_vi_bd_ha_trong_3p: formData.chu_vi_bd_ha_trong_3p,
        kt_bd_ha_ngoai_bv: formData.kt_bd_ha_ngoai_bv,
        kt_bd_ha_ngoai_bv_1p: formData.kt_bd_ha_ngoai_bv_1p,
        kt_bd_ha_ngoai_bv_2p: formData.kt_bd_ha_ngoai_bv_2p,
        kt_bd_ha_ngoai_bv_3p: formData.kt_bd_ha_ngoai_bv_3p,
        dien_tro_ha_ra: formData.dien_tro_ha_ra,
        dien_tro_ha_rb: formData.dien_tro_ha_rb,
        dien_tro_ha_rc: formData.dien_tro_ha_rc,
        do_lech_dien_tro_giua_cac_pha: formData.do_lech_dien_tro_giua_cac_pha,
        nguoi_gia_cong: this.currentUser?.username || this.currentUser?.name || 'Unknown',
        ngay_gia_cong: new Date(),
        ghi_chu: formData.ghi_chu,
        trang_thai: 1 // 1 = Đang gia công
      };

      console.log('Submitting boi day cao data:', boiDayCaoData);
      
      this.saveBoiDayCao(boiDayCaoData);
    } else {
      this.markFormGroupTouched();
    }
  }

  private saveBoiDayCao(data: BoiDayCaoData): void {
    const apiUrl = `${this.commonService.getServerAPIURL()}api/BoiDayCao/Create`;
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
          console.log('Boi day cao saved successfully:', response);
          this.showSuccess('Lưu thông tin bối dây cao thành công!');
          this.dialogRef.close({ success: true, data: response });
        },
        error: (error) => {
          console.error('Error saving boi day cao:', error);
          this.showError('Lỗi khi lưu thông tin bối dây cao: ' + (error.error?.message || error.message || 'Unknown error'));
          this.isLoading = false;
        }
      });
  }

  onCancel(): void {
    this.dialogRef.close({ success: false });
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
