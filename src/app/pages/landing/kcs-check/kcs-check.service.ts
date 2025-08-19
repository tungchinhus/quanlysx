import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay, catchError, map } from 'rxjs/operators';
import { AuthServices } from 'src/app/shared/services/authen/auth.service';

export interface BoiDayHaData {
  id: number;
  kyhieuquanday: string;        // Mã số thẻ bối dây hạ (masothe_bd_ha)
  congsuat: string;             // Ký hiệu bản vẽ (kyhieubangve)
  tbkt: string;                 // Quy cách dây (quycachday)
  dienap: string;               // Số sợi dây (sosoiday)
  quy_cach_day: string;         // Nhà sản xuất (nhasanxuat)
  so_soi_day: number;           // Ngày sản xuất (ngaysanxuat) - convert to timestamp
  nha_san_xuat: string;         // Người gia công (nguoigiacong)
  ngay_san_xuat: Date;          // Ngày gia công (ngaygiacong)
  trang_thai: 'pending' | 'approved' | 'rejected';
  
  // Các field bổ sung từ API response (optional)
  ngaygiacong?: Date;           // Ngày gia công
  nguoigiacong?: string;        // Người gia công (email)
  chieuquanday?: number;        // Chiều quấn dây
  mayquanday?: string;          // Máy quấn dây
  xungquanh?: number;           // Xung quanh
  haidau?: number;              // Hai đầu
  dientroRa?: number;           // Điện trở Ra
  dientroRb?: number;           // Điện trở Rb
  dientroRc?: number;           // Điện trở Rc
  user_update?: string;         // User update
}

export interface BoiDayCaoData {
  id: number;
  kyhieuquanday: string;        // Mã số thẻ bối dây cao (masothe_bd_cao)
  congsuat: string;             // Ký hiệu bản vẽ (kyhieubangve)
  tbkt: string;                 // Quy cách dây (quycachday)
  dienap: string;               // Số sợi dây (sosoiday)
  quy_cach_day: string;         // Nhà sản xuất (nhasanxuat)
  so_soi_day: number;           // Ngày sản xuất (ngaysanxuat) - convert to timestamp
  nha_san_xuat: string;         // Người gia công (nguoigiacong)
  ngay_san_xuat: Date;          // Ngày gia công (ngaygiacong)
  trang_thai: 'pending' | 'approved' | 'rejected';
}

export interface EpBoiDayData {
  id: number;
  kyhieuquanday: string;        // Mã số thẻ bối dây ép (masothe_bd_ep)
  congsuat: string;             // Ký hiệu bản vẽ (kyhieubangve)
  tbkt: string;                 // Quy cách dây (quycachday)
  dienap: string;               // Số sợi dây (sosoiday)
  bd_ep: string;                // Nhà sản xuất (nhasanxuat)
  bung_bd: number;              // Ngày sản xuất (ngaysanxuat) - convert to timestamp
  ngay_hoan_thanh: Date;        // Người gia công (nguoigiacong)
  trang_thai: 'pending' | 'approved' | 'rejected';
}

@Injectable({
  providedIn: 'root'
})
export class KcsCheckService {

  private baseUrl = 'https://localhost:7190'; // Base URL cho API
  private headers = new HttpHeaders({
    'Content-Type': 'application/json'
  });

  constructor(
    private http: HttpClient,
    private authService: AuthServices
  ) {}

  // Method để lấy headers với token
  private getAuthHeaders(): HttpHeaders {
    const token = this.authService.getToken();
    if (token) {
      return this.headers.set('Authorization', `Bearer ${token}`);
    }
    return this.headers;
  }

  // Get Bối dây hạ data - chỉ lấy những item chưa kiểm tra
  getBoiDayHaData(): Observable<BoiDayHaData[]> {
    const url = `${this.baseUrl}/api/kcs-check/boi-day-ha-all`;
    
    console.log('Calling API for BoiDayHa data:', url);
    
    return this.http.get<any>(url, { headers: this.getAuthHeaders() })
      .pipe(
        map(response => {
          console.log('API Response for BoiDayHa:', response);
          
          // Kiểm tra cấu trúc response và xử lý dữ liệu
          let allData: BoiDayHaData[] = [];
          if (response && response.Data) {
            allData = this.mapBoiDayHaData(response.Data);
          } else if (Array.isArray(response)) {
            allData = this.mapBoiDayHaData(response);
          } else {
            console.warn('Unexpected response structure:', response);
            return [];
          }
          
          // Lọc chỉ lấy những item có trạng thái 'pending' (chưa kiểm tra)
          const pendingData = allData.filter(item => item.trang_thai === 'pending');
          console.log(`Filtered BoiDayHa data: ${pendingData.length}/${allData.length} items are pending`);
          
          return pendingData;
        }),
        catchError(error => {
          console.error('Error fetching BoiDayHa data:', error);
          // Fallback to mock data if API fails
          return this.getMockBoiDayHaData();
        })
      );
  }

  // Method để map dữ liệu từ API response
  private mapBoiDayHaData(apiData: any[]): BoiDayHaData[] {
    return apiData.map(item => {
      console.log('Mapping BoiDayHa item:', item);
      
      return {
        id: item.id || item.Id || 0,
        // Sử dụng masothe_bd_ha làm kyhieuquanday
        kyhieuquanday: item.masothe_bd_ha || item.MaSoTheBdHa || item.kyhieuquanday || '',
        // Sử dụng kyhieubangve làm congsuat
        congsuat: item.kyhieubangve || item.KyHieuBangVe || item.congsuat || '',
        // Sử dụng quycachday làm tbkt
        tbkt: item.quycachday || item.QuyCachDay || item.tbkt || '',
        // Sử dụng sosoiday làm dienap
        dienap: item.sosoiday || item.SoSoiDay || item.dienap || '',
        // Sử dụng nhasanxuat làm quy_cach_day
        quy_cach_day: item.nhasanxuat || item.NhaSanXuat || item.quy_cach_day || '',
        // Sử dụng ngaysanxuat làm so_soi_day (convert to timestamp)
        so_soi_day: item.ngaysanxuat ? new Date(item.ngaysanxuat).getTime() : 0,
        // Sử dụng nguoigiacong làm nha_san_xuat
        nha_san_xuat: item.nguoigiacong || item.NguoiGiaCong || item.nha_san_xuat || '',
        // Sử dụng ngaygiacong làm ngay_san_xuat
        ngay_san_xuat: item.ngaygiacong ? new Date(item.ngaygiacong) : new Date(),
        // Map trạng thái từ số sang enum
        trang_thai: this.mapTrangThaiFromNumber(item.trang_thai ?? item.TrangThai ?? 1),
        
        // Các field bổ sung từ API response
        ngaygiacong: item.ngaygiacong ? new Date(item.ngaygiacong) : undefined,
        nguoigiacong: item.nguoigiacong || item.NguoiGiaCong || '',
        chieuquanday: item.chieuquanday || item.ChieuQuanDay || 0,
        mayquanday: item.mayquanday || item.MayQuanDay || '',
        xungquanh: item.xungquanh || item.XungQuanh || 0,
        haidau: item.haidau || item.HaiDau || 0,
        dientroRa: item.dientroRa || item.DienTroRa || 0,
        dientroRb: item.dientroRb || item.DienTroRb || 0,
        dientroRc: item.dientroRc || item.DienTroRc || 0,
        user_update: item.user_update || item.UserUpdate || ''
      };
    });
  }

  // Method để map trạng thái từ string
  private mapTrangThai(apiTrangThai: string): 'pending' | 'approved' | 'rejected' {
    const trangThai = apiTrangThai?.toLowerCase();
    if (trangThai === 'approved' || trangThai === 'duyet' || trangThai === 'đã duyệt') {
      return 'approved';
    } else if (trangThai === 'rejected' || trangThai === 'tuchoi' || trangThai === 'từ chối') {
      return 'rejected';
    } else {
      return 'pending';
    }
  }

  // Method để map trạng thái từ number (dựa vào API response thực tế)
  private mapTrangThaiFromNumber(apiTrangThai: number | null): 'pending' | 'approved' | 'rejected' {
    // Theo yêu cầu nghiệp vụ:
    // 1 = "chờ kiểm tra" (pending)
    // 2 = "đã kiểm tra" (approved)
    // null = "không đạt" (rejected)
    
    if (apiTrangThai === null || apiTrangThai === undefined) {
      return 'rejected'; // null = không đạt
    }
    
    switch (apiTrangThai) {
      case 1:
        return 'pending'; // 1 = chờ kiểm tra
      case 2:
        return 'approved'; // 2 = đã kiểm tra
      default:
        return 'pending'; // Mặc định là chờ kiểm tra
    }
  }

  // Fallback mock data khi API fail - chỉ lấy những item chưa kiểm tra
  private getMockBoiDayHaData(): Observable<BoiDayHaData[]> {
    console.log('Using mock data for BoiDayHa');
    const mockData: BoiDayHaData[] = [
      {
        id: 1,
        kyhieuquanday: 'BDH001',
        congsuat: '100',
        tbkt: 'TBKT001',
        dienap: '22kV',
        quy_cach_day: '2.5mm²',
        so_soi_day: 2,
        nha_san_xuat: 'Công ty A',
        ngay_san_xuat: new Date('2024-01-15'),
        trang_thai: 'pending'
      },
      {
        id: 3,
        kyhieuquanday: 'BDH003',
        congsuat: '150',
        tbkt: 'TBKT003',
        dienap: '22kV',
        quy_cach_day: '3.0mm²',
        so_soi_day: 2,
        nha_san_xuat: 'Công ty C',
        ngay_san_xuat: new Date('2024-01-17'),
        trang_thai: 'pending'
      }
    ];
    
    // Lọc chỉ lấy những item có trạng thái 'pending'
    const pendingData = mockData.filter(item => item.trang_thai === 'pending');
    console.log(`Mock BoiDayHa data: ${pendingData.length}/${mockData.length} items are pending`);
    
    return of(pendingData).pipe(delay(500));
  }

  // Get Bối dây cao data - chỉ lấy những item chưa kiểm tra
  getBoiDayCaoData(): Observable<BoiDayCaoData[]> {
    const url = `${this.baseUrl}/api/kcs-check/boi-day-cao`;
    
    console.log('Calling API for BoiDayCao data:', url);
    
    return this.http.get<any>(url, { headers: this.getAuthHeaders() })
      .pipe(
        map(response => {
          console.log('API Response for BoiDayCao:', response);
          
          let allData: BoiDayCaoData[] = [];
          if (response && response.Data) {
            allData = this.mapBoiDayCaoData(response.Data);
          } else if (Array.isArray(response)) {
            allData = this.mapBoiDayCaoData(response);
          } else {
            console.warn('Unexpected response structure:', response);
            return [];
          }
          
          // Lọc chỉ lấy những item có trạng thái 'pending' (chưa kiểm tra)
          const pendingData = allData.filter(item => item.trang_thai === 'pending');
          console.log(`Filtered BoiDayCao data: ${pendingData.length}/${allData.length} items are pending`);
          
          return pendingData;
        }),
        catchError(error => {
          console.error('Error fetching BoiDayCao data:', error);
          return this.getMockBoiDayCaoData();
        })
      );
  }

  // Method để map dữ liệu từ API response cho BoiDayCao
  private mapBoiDayCaoData(apiData: any[]): BoiDayCaoData[] {
    return apiData.map(item => {
      console.log('Mapping BoiDayCao item:', item);
      
      return {
        id: item.id || item.Id || 0,
        // Sử dụng masothe_bd_cao làm kyhieuquanday (theo API response thực tế)
        kyhieuquanday: item.masothe_bd_cao || item.MaSoTheBdCao || item.kyhieuquanday || '',
        // Sử dụng kyhieubangve làm congsuat (theo API response thực tế)
        congsuat: item.kyhieubangve || item.KyHieuBangVe || item.congsuat || '',
        // Sử dụng quycachday làm tbkt (theo API response thực tế)
        tbkt: item.quycachday || item.QuyCachDay || item.tbkt || '',
        // Sử dụng sosoiday làm dienap (theo API response thực tế)
        dienap: item.sosoiday || item.SoSoiDay || item.dienap || '',
        // Sử dụng nhasanxuat làm quy_cach_day (theo API response thực tế)
        quy_cach_day: item.nhasanxuat || item.NhaSanXuat || item.quy_cach_day || '',
        // Sử dụng ngaysanxuat làm so_soi_day (theo API response thực tế)
        so_soi_day: item.ngaysanxuat ? new Date(item.ngaysanxuat).getTime() : 0,
        // Sử dụng nguoigiacong làm nha_san_xuat (theo API response thực tế)
        nha_san_xuat: item.nguoigiacong || item.NguoiGiaCong || item.nha_san_xuat || '',
        // Sử dụng ngaygiacong làm ngay_san_xuat (theo API response thực tế)
        ngay_san_xuat: item.ngaygiacong ? new Date(item.ngaygiacong) : new Date(),
        trang_thai: this.mapTrangThaiFromNumber(item.trang_thai ?? item.TrangThai ?? 1)
      };
    });
  }

  // Fallback mock data cho BoiDayCao - chỉ lấy những item chưa kiểm tra
  private getMockBoiDayCaoData(): Observable<BoiDayCaoData[]> {
    console.log('Using mock data for BoiDayCao');
    const mockData: BoiDayCaoData[] = [
      {
        id: 1,
        kyhieuquanday: 'BDC001',
        congsuat: '100',
        tbkt: 'TBKT001',
        dienap: '22kV',
        quy_cach_day: '1.5mm²',
        so_soi_day: 1,
        nha_san_xuat: 'Công ty C',
        ngay_san_xuat: new Date('2024-01-16'),
        trang_thai: 'pending'
      },
      {
        id: 3,
        kyhieuquanday: 'BDC003',
        congsuat: '150',
        tbkt: 'TBKT003',
        dienap: '22kV',
        quy_cach_day: '2.0mm²',
        so_soi_day: 1,
        nha_san_xuat: 'Công ty E',
        ngay_san_xuat: new Date('2024-01-18'),
        trang_thai: 'pending'
      }
    ];
    
    // Lọc chỉ lấy những item có trạng thái 'pending'
    const pendingData = mockData.filter(item => item.trang_thai === 'pending');
    console.log(`Mock BoiDayCao data: ${pendingData.length}/${mockData.length} items are pending`);
    
    return of(pendingData).pipe(delay(500));
  }

  // Get Ép bối dây data - chỉ lấy những item chưa kiểm tra
  getEpBoiDayData(): Observable<EpBoiDayData[]> {
    const url = `${this.baseUrl}/api/kcs-check/ep-boi-day`;
    
    console.log('Calling API for EpBoiDay data:', url);
    
    return this.http.get<any>(url, { headers: this.getAuthHeaders() })
      .pipe(
        map(response => {
          console.log('API Response for EpBoiDay:', response);
          
          let allData: EpBoiDayData[] = [];
          if (response && response.Data) {
            allData = this.mapEpBoiDayData(response.Data);
          } else if (Array.isArray(response)) {
            allData = this.mapEpBoiDayData(response);
          } else {
            console.warn('Unexpected response structure:', response);
            return [];
          }
          
          // Lọc chỉ lấy những item có trạng thái 'pending' (chưa kiểm tra)
          const pendingData = allData.filter(item => item.trang_thai === 'pending');
          console.log(`Filtered EpBoiDay data: ${pendingData.length}/${allData.length} items are pending`);
          
          return pendingData;
        }),
        catchError(error => {
          console.error('Error fetching EpBoiDay data:', error);
          return this.getMockEpBoiDayData();
        })
      );
  }

  // Method để map dữ liệu từ API response cho EpBoiDay
  private mapEpBoiDayData(apiData: any[]): EpBoiDayData[] {
    return apiData.map(item => {
      console.log('Mapping EpBoiDay item:', item);
      
      return {
        id: item.id || item.Id || 0,
        // Sử dụng masothe_bd_ep làm kyhieuquanday (theo API response thực tế)
        kyhieuquanday: item.masothe_bd_ep || item.MaSoTheBdEp || item.kyhieuquanday || '',
        // Sử dụng kyhieubangve làm congsuat (theo API response thực tế)
        congsuat: item.kyhieubangve || item.KyHieuBangVe || item.congsuat || '',
        // Sử dụng quycachday làm tbkt (theo API response thực tế)
        tbkt: item.quycachday || item.QuyCachDay || item.tbkt || '',
        // Sử dụng sosoiday làm dienap (theo API response thực tế)
        dienap: item.sosoiday || item.SoSoiDay || item.dienap || '',
        // Sử dụng nhasanxuat làm bd_ep (theo API response thực tế)
        bd_ep: item.nhasanxuat || item.NhaSanXuat || item.bd_ep || '',
        // Sử dụng ngaysanxuat làm bung_bd (theo API response thực tế)
        bung_bd: item.ngaysanxuat ? new Date(item.ngaysanxuat).getTime() : 0,
        // Sử dụng nguoigiacong làm ngay_hoan_thanh (theo API response thực tế)
        ngay_hoan_thanh: item.nguoigiacong ? new Date(item.nguoigiacong) : new Date(),
        trang_thai: this.mapTrangThaiFromNumber(item.trang_thai ?? item.TrangThai ?? 1)
      };
    });
  }

  // Fallback mock data cho EpBoiDay - chỉ lấy những item chưa kiểm tra
  private getMockEpBoiDayData(): Observable<EpBoiDayData[]> {
    console.log('Using mock data for EpBoiDay');
    const mockData: EpBoiDayData[] = [
      {
        id: 1,
        kyhieuquanday: 'EP001',
        congsuat: '100',
        tbkt: 'TBKT001',
        dienap: '22kV',
        bd_ep: 'EP-BD-001',
        bung_bd: 4,
        ngay_hoan_thanh: new Date('2024-01-17'),
        trang_thai: 'pending'
      },
      {
        id: 3,
        kyhieuquanday: 'EP003',
        congsuat: '150',
        tbkt: 'TBKT003',
        dienap: '22kV',
        bd_ep: 'EP-BD-003',
        bung_bd: 5,
        ngay_hoan_thanh: new Date('2024-01-19'),
        trang_thai: 'pending'
      }
    ];
    
    // Lọc chỉ lấy những item có trạng thái 'pending'
    const pendingData = mockData.filter(item => item.trang_thai === 'pending');
    console.log(`Mock EpBoiDay data: ${pendingData.length}/${mockData.length} items are pending`);
    
    return of(pendingData).pipe(delay(500));
  }

  // Map type từ component sang API format
  private mapTypeToApi(type: string): string {
    switch (type) {
      case 'boiDayHa':
        return 'boi-day-ha';
      case 'boiDayCao':
        return 'boi-day-cao';
      case 'epBoiDay':
        return 'ep-boi-day';
      default:
        return type;
    }
  }

  // Approve item
  approveItem(type: string, id: number, notes?: string): Observable<any> {
    // Sử dụng endpoint mới theo định nghĩa BE
    const apiType = this.mapTypeToApi(type);
    const url = `${this.baseUrl}/api/kcs-check/${apiType}/approve`;
    
    const payload = {
      itemId: id,
      notes: notes || 'Đạt tiêu chuẩn chất lượng',
      approvedAt: new Date().toISOString()
    };
    
    console.log('=== APPROVE ITEM DEBUG ===');
    console.log(`Type: ${type}`);
    console.log(`Mapped API Type: ${apiType}`);
    console.log(`Item ID: ${id}`);
    console.log(`Payload:`, payload);
    console.log(`Full URL: ${url}`);
    console.log(`Headers:`, this.getAuthHeaders());
    console.log('==========================');
    
    return this.http.post<any>(url, payload, { headers: this.getAuthHeaders() })
      .pipe(
        map(response => {
          console.log('Approve response:', response);
          return response;
        }),
        catchError(error => {
          console.error('Error approving item:', error);
          return of({ success: false, message: 'Approval failed' });
        })
      );
  }



  // Reject item
  rejectItem(type: string, id: number, reason?: string): Observable<any> {
    // Sử dụng endpoint mới theo định nghĩa BE
    const apiType = this.mapTypeToApi(type);
    const url = `${this.baseUrl}/api/kcs-check/${apiType}/reject`;
    
    const payload = {
      itemId: id,
      reason: reason || 'Không đạt tiêu chuẩn chất lượng',
      rejectedAt: new Date().toISOString(),
      // Thêm thông tin để cập nhật trạng thái thành 1 (đang xử lý)
      status: 1,
      updateTables: ['tbl_bd_ha', 'tbl_user_bangve'],
      // Thêm thông tin chi tiết để cập nhật các bảng
      tableUpdates: {
        tbl_bd_ha: {
          id: id,
          trang_thai: 1, // Đang xử lý
          ghi_chu: reason,
          ngay_cap_nhat: new Date().toISOString()
        },
        tbl_user_bangve: {
          id: id,
          trang_thai: 1, // Đang xử lý
          ghi_chu: reason,
          ngay_cap_nhat: new Date().toISOString()
        }
      }
    };
    
    console.log('=== REJECT ITEM DEBUG ===');
    console.log(`Type: ${type}`);
    console.log(`Mapped API Type: ${apiType}`);
    console.log(`Item ID: ${id}`);
    console.log(`Reason: ${reason}`);
    console.log(`Payload:`, payload);
    console.log(`Full URL: ${url}`);
    console.log(`Headers:`, this.getAuthHeaders());
    console.log('==========================');
    
    return this.http.post<any>(url, payload, { headers: this.getAuthHeaders() })
      .pipe(
        map(response => {
          console.log('Reject response:', response);
          return response;
        }),
        catchError(error => {
          console.error('Error rejecting item:', error);
          return of({ success: false, message: 'Rejection failed' });
        })
      );
  }

  // Get item details
  getItemDetails(type: string, id: number): Observable<any> {
    const url = `${this.baseUrl}/api/kcs-check/${this.mapTypeToApi(type)}/${id}`;
    
    console.log(`Getting details for ${type} item with id: ${id}`, url);
    
    return this.http.get<any>(url, { headers: this.getAuthHeaders() })
      .pipe(
        map(response => {
          console.log('Item details response:', response);
          return response;
        }),
        catchError(error => {
          console.error('Error getting item details:', error);
          return of({ success: false, data: {} });
        })
      );
  }

  // Method để refresh data sau khi approve/reject
  refreshData(type: string): Observable<any> {
    switch (type) {
      case 'boiDayHa':
        return this.getBoiDayHaData();
      case 'boiDayCao':
        return this.getBoiDayCaoData();
      case 'epBoiDay':
        return this.getEpBoiDayData();
      default:
        return of([]);
    }
  }
}
