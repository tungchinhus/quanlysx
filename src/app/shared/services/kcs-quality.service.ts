import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CommonService } from './common.service';
import { AuthServices } from './authen/auth.service';

export interface KcsQualityCheckFailure {
  kyhieubangve: string;
  user_kcs_approve: string;
  id_khau_sanxuat: string;
  ghi_chu: string;
  check_type: 'boidayha' | 'boidaycao';
  bd_id: number;
}

export interface KcsQualityCheckSuccess {
  kyhieubangve: string;
  user_kcs_approve: string;
  id_khau_sanxuat: string;
  ghi_chu?: string;
  check_type: 'boidayha' | 'boidaycao';
  bd_id: number;
  quality_score?: number;
}

@Injectable({
  providedIn: 'root'
})
export class KcsQualityService {

  constructor(
    private http: HttpClient,
    private commonService: CommonService,
    private authService: AuthServices
  ) { }

  /**
   * Gửi thông báo KCS quality check failure
   * @param data Dữ liệu KCS failure
   * @returns Observable response
   */
  submitQualityCheckFailure(data: KcsQualityCheckFailure): Observable<any> {
    const url = `${this.commonService.getServerAPIURL()}api/Account/kcs-quality-check-failure`;
    const headers = this.getAuthHeaders();
    
    console.log('Submitting KCS quality check failure:', url, data);
    
    return this.http.post(url, data, { headers });
  }

  /**
   * Gửi thông báo KCS quality check success (nếu cần)
   * @param data Dữ liệu KCS success
   * @returns Observable response
   */
  submitQualityCheckSuccess(data: KcsQualityCheckSuccess): Observable<any> {
    const url = `${this.commonService.getServerAPIURL()}api/Account/kcs-quality-check-success`;
    const headers = this.getAuthHeaders();
    
    console.log('Submitting KCS quality check success:', url, data);
    
    return this.http.post(url, data, { headers });
  }

  /**
   * Lấy danh sách KCS quality check history
   * @param kyhieubangve Ký hiệu bảng vẽ (optional)
   * @param check_type Loại kiểm tra (optional)
   * @returns Observable response
   */
  getQualityCheckHistory(kyhieubangve?: string, check_type?: string): Observable<any> {
    let url = `${this.commonService.getServerAPIURL()}api/Account/kcs-quality-check-history`;
    
    const params: string[] = [];
    if (kyhieubangve) {
      params.push(`kyhieubangve=${encodeURIComponent(kyhieubangve)}`);
    }
    if (check_type) {
      params.push(`check_type=${encodeURIComponent(check_type)}`);
    }
    
    if (params.length > 0) {
      url += '?' + params.join('&');
    }
    
    const headers = this.getAuthHeaders();
    
    console.log('Getting KCS quality check history:', url);
    
    return this.http.get(url, { headers });
  }

  /**
   * Lấy thông tin chi tiết KCS quality check
   * @param id ID của quality check record
   * @returns Observable response
   */
  getQualityCheckDetail(id: number): Observable<any> {
    const url = `${this.commonService.getServerAPIURL()}api/Account/kcs-quality-check-detail/${id}`;
    const headers = this.getAuthHeaders();
    
    console.log('Getting KCS quality check detail:', url);
    
    return this.http.get(url, { headers });
  }

  /**
   * Cập nhật thông tin KCS quality check
   * @param id ID của quality check record
   * @param data Dữ liệu cập nhật
   * @returns Observable response
   */
  updateQualityCheck(id: number, data: Partial<KcsQualityCheckFailure>): Observable<any> {
    const url = `${this.commonService.getServerAPIURL()}api/Account/kcs-quality-check-update/${id}`;
    const headers = this.getAuthHeaders();
    
    console.log('Updating KCS quality check:', url, data);
    
    return this.http.put(url, data, { headers });
  }

  /**
   * Xóa KCS quality check record
   * @param id ID của quality check record
   * @returns Observable response
   */
  deleteQualityCheck(id: number): Observable<any> {
    const url = `${this.commonService.getServerAPIURL()}api/Account/kcs-quality-check-delete/${id}`;
    const headers = this.getAuthHeaders();
    
    console.log('Deleting KCS quality check:', url);
    
    return this.http.delete(url, { headers });
  }

  /**
   * Lấy thông tin user hiện tại cho KCS approve
   * @returns Thông tin user
   */
  getCurrentKcsUser(): any {
    return this.authService.getUserInfoFromStorage();
  }

  /**
   * Lấy auth token
   * @returns Auth token
   */
  getAuthToken(): string {
    return this.authService.getToken() || '';
  }

  /**
   * Tạo headers với auth token
   * @returns HttpHeaders
   */
  private getAuthHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.getAuthToken()}`,
      'Content-Type': 'application/json'
    });
  }

  /**
   * Validate dữ liệu KCS quality check failure
   * @param data Dữ liệu cần validate
   * @returns Kết quả validation
   */
  validateKcsFailureData(data: KcsQualityCheckFailure): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!data.kyhieubangve?.trim()) {
      errors.push('Ký hiệu bảng vẽ là bắt buộc');
    }
    
    if (!data.user_kcs_approve?.trim()) {
      errors.push('User KCS approve là bắt buộc');
    }
    
    if (!data.id_khau_sanxuat?.trim()) {
      errors.push('Khẩu sản xuất là bắt buộc');
    }
    
    if (!data.ghi_chu?.trim()) {
      errors.push('Ghi chú là bắt buộc');
    }
    
    if (!data.check_type || !['boidayha', 'boidaycao'].includes(data.check_type)) {
      errors.push('Loại kiểm tra không hợp lệ');
    }
    
    if (!data.bd_id || data.bd_id <= 0) {
      errors.push('ID bối dây không hợp lệ');
    }
    
    return { isValid: errors.length === 0, errors };
  }

  /**
   * Tạo dữ liệu KCS failure mặc định
   * @param kyhieubangve Ký hiệu bảng vẽ
   * @param check_type Loại kiểm tra
   * @param bd_id ID bối dây
   * @returns Dữ liệu mặc định
   */
  createDefaultKcsFailureData(
    kyhieubangve: string, 
    check_type: 'boidayha' | 'boidaycao', 
    bd_id: number
  ): KcsQualityCheckFailure {
    const currentUser = this.getCurrentKcsUser();
    
    return {
      kyhieubangve,
      user_kcs_approve: currentUser?.username || currentUser?.email || 'Unknown',
      id_khau_sanxuat: '',
      ghi_chu: `Kiểm tra chất lượng không đạt - ${check_type}`,
      check_type,
      bd_id
    };
  }
}
