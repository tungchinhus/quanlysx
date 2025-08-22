import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay, catchError, map } from 'rxjs/operators';
import { AuthServices } from 'src/app/shared/services/authen/auth.service';

// New interfaces based on API specification
export interface BoiDayHaPendingResponse {
  isSuccess: boolean;
  message: string;
  data: BoiDayHaPendingItem[];
  totalCount: number;
  currentUserId: string;
  isKcsUser: boolean;
  userRoles: string[];
}

export interface BoiDayHaPendingSearchResponse {
  isSuccess: boolean;
  message: string;
  data: BoiDayHaPendingItem[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  currentUserId: string;
  isKcsUser: boolean;
  userRoles: string[];
  searchCriteria: SearchCriteria;
}

export interface SearchCriteria {
  searchByDrawingName?: string;
  searchByWindingSymbolOrTBKT?: string;
  pageNumber: number;
  pageSize: number;
}

export interface BoiDayHaPendingItem {
  id: number;
  user_id: string;
  bangve_id: number;
  bd_ha_id: number;
  trang_thai_bv: number;
  trang_thai_bd_ha: number;
  assigned_at: string;
  assigned_by_user_id: string;
  bangve: BangVeInfo;
  bdHa: BdHaInfo;
  user: UserInfo;
}

export interface BangVeInfo {
  id: number;
  kyhieubangve: string;
  congsuat: string;
  tbkt: string;
  dienap: string;
  soboiday: number;
  bd_ha_trong: number;
  bd_ha_ngoai: number;
  bd_cao: number;
  bd_ep: number;
  bung_bd: number;
  user_create: string;
  trang_thai: number;
  created_at: string;
  isActive: boolean;
}

export interface BdHaInfo {
  id: number;
  masothe_bd_ha: string;
  kyhieubangve: string;
  ngaygiacong: string;
  nguoigiacong: string;
  quycachday: string;
  sosoiday: number;
  ngaysanxuat: string;
  nhasanxuat: string;
  chuvikhuon: number;
  kt_bung_bd: number;
  chieuquanday: boolean;
  mayquanday: string;
  xungquanh: number;
  haidau: number;
  kt_boiday_trong: string;
  chuvi_bd_trong: number;
  kt_bd_ngoai: string;
  dientroRa: number;
  dientroRb: number;
  dientroRc: number;
  dolechdientro: number;
  user_update: string;
  trang_thai: number;
  khau_sx: string;
}

export interface UserInfo {
  id: string;
  userName: string;
  email: string;
  fullName: string;
}

// Legacy interfaces for backward compatibility
export interface BoiDayHaData {
  id: number;
  kyhieuquanday: string;
  congsuat: string;
  tbkt: string;
  dienap: string;
  quy_cach_day: string;
  so_soi_day: number;
  nha_san_xuat: string;
  ngay_san_xuat: Date;
  trang_thai: 'pending' | 'approved' | 'rejected';
  ngaygiacong?: Date;
  nguoigiacong?: string;
  chieuquanday?: number;
  mayquanday?: string;
  xungquanh?: number;
  haidau?: number;
  dientroRa?: number;
  dientroRb?: number;
  dientroRc?: number;
  user_update?: string;
}

export interface BoiDayCaoData {
  id: number;
  kyhieuquanday: string;
  congsuat: string;
  tbkt: string;
  dienap: string;
  quy_cach_day: string;
  so_soi_day: number;
  nha_san_xuat: string;
  ngay_san_xuat: Date;
  trang_thai: 'pending' | 'approved' | 'rejected';
}

export interface EpBoiDayData {
  id: number;
  kyhieuquanday: string;
  congsuat: string;
  tbkt: string;
  dienap: string;
  bd_ep: string;
  bung_bd: number;
  ngay_hoan_thanh: Date;
  trang_thai: 'pending' | 'approved' | 'rejected';
}

@Injectable({
  providedIn: 'root'
})
export class KcsCheckService {

  private baseUrl = 'https://localhost:7001'; // Updated base URL from API spec
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

  // New API methods based on specification
  
  // 1. Lấy danh sách bối dây hạ chờ duyệt
  getBoiDayHaPending(): Observable<BoiDayHaPendingResponse> {
    const url = `${this.baseUrl}/api/kcs-check/boi-day-ha-pending`;
    
    console.log('Calling API for BoiDayHa pending data:', url);
    
    return this.http.get<BoiDayHaPendingResponse>(url, { headers: this.getAuthHeaders() })
      .pipe(
        map(response => {
          console.log('API Response for BoiDayHa pending:', response);
          return response;
        }),
        catchError(error => {
          console.error('Error fetching BoiDayHa pending data:', error);
          return this.getMockBoiDayHaPendingResponse();
        })
      );
  }

  // 2. Lấy danh sách bối dây hạ chờ duyệt với tìm kiếm và phân trang
  searchBoiDayHaPending(searchCriteria: SearchCriteria): Observable<BoiDayHaPendingSearchResponse> {
    const url = `${this.baseUrl}/api/kcs-check/boi-day-ha-pending-search`;
    
    console.log('Calling API for BoiDayHa pending search:', url, searchCriteria);
    
    return this.http.post<BoiDayHaPendingSearchResponse>(url, searchCriteria, { headers: this.getAuthHeaders() })
      .pipe(
        map(response => {
          console.log('API Response for BoiDayHa pending search:', response);
          return response;
        }),
        catchError(error => {
          console.error('Error searching BoiDayHa pending data:', error);
          return this.getMockBoiDayHaPendingSearchResponse(searchCriteria);
        })
      );
  }

  // Convert new API response to legacy format for backward compatibility
  convertToLegacyFormat(items: BoiDayHaPendingItem[]): BoiDayHaData[] {
    return items.map(item => ({
      id: item.id,
      kyhieuquanday: item.bdHa?.masothe_bd_ha || 'N/A',
      congsuat: item.bangve?.kyhieubangve || 'N/A',
      tbkt: item.bangve?.tbkt || 'N/A',
      dienap: item.bangve?.dienap || 'N/A',
      quy_cach_day: item.bdHa?.quycachday || 'N/A',
      so_soi_day: item.bdHa?.sosoiday || 0,
      nha_san_xuat: item.bdHa?.nhasanxuat || 'N/A',
      ngay_san_xuat: item.bdHa?.ngaysanxuat ? new Date(item.bdHa.ngaysanxuat) : new Date(),
      trang_thai: this.mapTrangThaiFromNumber(item.trang_thai_bd_ha),
      ngaygiacong: item.bdHa?.ngaygiacong ? new Date(item.bdHa.ngaygiacong) : new Date(),
      nguoigiacong: item.bdHa?.nguoigiacong || 'N/A',
      chieuquanday: item.bdHa?.chieuquanday ? 1 : 0,
      mayquanday: item.bdHa?.mayquanday || 'N/A',
      xungquanh: item.bdHa?.xungquanh || 0,
      haidau: item.bdHa?.haidau || 0,
      dientroRa: item.bdHa?.dientroRa || 0,
      dientroRb: item.bdHa?.dientroRb || 0,
      dientroRc: item.bdHa?.dientroRc || 0,
      user_update: item.bdHa?.user_update || 'N/A'
    }));
  }

  // Mock data methods for fallback
  private getMockBoiDayHaPendingResponse(): Observable<BoiDayHaPendingResponse> {
    console.log('Using mock data for BoiDayHa pending');
    const mockData: BoiDayHaPendingItem[] = [
      {
        id: 1,
        user_id: "user123",
        bangve_id: 1,
        bd_ha_id: 1,
        trang_thai_bv: 1,
        trang_thai_bd_ha: 2,
        assigned_at: "2025-01-20T10:00:00Z",
        assigned_by_user_id: "admin123",
        bangve: {
          id: 1,
          kyhieubangve: "BV001",
          congsuat: "100 kVA",
          tbkt: "TBKT001",
          dienap: "220V",
          soboiday: 5,
          bd_ha_trong: 10,
          bd_ha_ngoai: 12,
          bd_cao: 8,
          bd_ep: 6,
          bung_bd: 15,
          user_create: "user123",
          trang_thai: 1,
          created_at: "2025-01-20T09:00:00Z",
          isActive: true
        },
        bdHa: {
          id: 1,
          masothe_bd_ha: "khâu quấn dây hạ",
          kyhieubangve: "BV001",
          ngaygiacong: "2025-01-20T08:00:00Z",
          nguoigiacong: "Nguyễn Văn A",
          quycachday: "0.5mm",
          sosoiday: 100,
          ngaysanxuat: "2025-01-19T00:00:00Z",
          nhasanxuat: "GM",
          chuvikhuon: 50,
          kt_bung_bd: 45,
          chieuquanday: true,
          mayquanday: "Máy quấn dây tự động",
          xungquanh: 25.5,
          haidau: 30.2,
          kt_boiday_trong: "40x50",
          chuvi_bd_trong: 180.0,
          kt_bd_ngoai: "45x55",
          dientroRa: 2.5,
          dientroRb: 2.6,
          dientroRc: 2.4,
          dolechdientro: 0.1,
          user_update: "user123",
          trang_thai: 2,
          khau_sx: "KH001"
        },
        user: {
          id: "user123",
          userName: "nguyenvana",
          email: "nguyenvana@example.com",
          fullName: "Nguyễn Văn A"
        }
      }
    ];
    
    const mockResponse: BoiDayHaPendingResponse = {
      isSuccess: true,
      message: `Đã tìm thấy ${mockData.length} bối dây hạ chờ duyệt.`,
      data: mockData,
      totalCount: mockData.length,
      currentUserId: "user123",
      isKcsUser: false,
      userRoles: ["User"]
    };
    
    return of(mockResponse).pipe(delay(500));
  }

  private getMockBoiDayHaPendingSearchResponse(searchCriteria: SearchCriteria): Observable<BoiDayHaPendingSearchResponse> {
    console.log('Using mock data for BoiDayHa pending search');
    const mockData = this.getMockBoiDayHaPendingResponse();
    
    return mockData.pipe(
      map(response => {
        const totalPages = Math.ceil(response.totalCount / searchCriteria.pageSize);
        return {
          ...response,
          pageNumber: searchCriteria.pageNumber,
          pageSize: searchCriteria.pageSize,
          totalPages: totalPages,
          searchCriteria: searchCriteria
        };
      })
    );
  }

  // Legacy methods for backward compatibility
  getBoiDayHaData(): Observable<BoiDayHaData[]> {
    return this.getBoiDayHaPending().pipe(
      map(response => this.convertToLegacyFormat(response.data))
    );
  }

  // Method để map trạng thái từ number (dựa vào API response thực tế)
  private mapTrangThaiFromNumber(apiTrangThai: number | null): 'pending' | 'approved' | 'rejected' {
    // Theo yêu cầu nghiệp vụ:
    // 1 = "đang xử lý" (pending)
    // 2 = "hoàn thành, chờ duyệt" (pending)
    // 3 = "từ chối" (rejected)
    
    if (apiTrangThai === null || apiTrangThai === undefined) {
      return 'pending';
    }
    
    switch (apiTrangThai) {
      case 1:
        return 'pending'; // 1 = đang xử lý
      case 2:
        return 'pending'; // 2 = hoàn thành, chờ duyệt
      case 3:
        return 'rejected'; // 3 = từ chối
      default:
        return 'pending';
    }
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
  approveItem(type: string, id: number, approvalData?: any): Observable<any> {
    // Sử dụng endpoint mới theo định nghĩa BE
    const apiType = this.mapTypeToApi(type);
    const url = `${this.baseUrl}/api/kcs-check/${apiType}/approve`;
    
    const payload = {
      itemId: id,
      notes: approvalData?.notes || 'Đạt tiêu chuẩn chất lượng',
      qualityScore: approvalData?.qualityScore || 5,
      inspectorName: approvalData?.inspectorName || '',
      inspectionDate: approvalData?.inspectionDate || new Date().toISOString(),
      approvedAt: new Date().toISOString(),
      // Save to tbl_kcs_approve table
      saveToKcsApprove: true,
      kcsApproveData: {
        item_id: id,
        item_type: type,
        action: 'approve',
        notes: approvalData?.notes || 'Đạt tiêu chuẩn chất lượng',
        quality_score: approvalData?.qualityScore || 5,
        inspector_name: approvalData?.inspectorName || 'Unknown',
        inspection_date: approvalData?.inspectionDate || new Date().toISOString(),
        created_at: new Date().toISOString(),
        status: 'approved'
      }
    };
    
    console.log('=== APPROVE ITEM DEBUG ===');
    console.log(`Type: ${type}`);
    console.log(`Mapped API Type: ${apiType}`);
    console.log(`Item ID: ${id}`);
    console.log(`Approval Data:`, approvalData);
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

  // Reject item with detailed information and save to tbl_kcs_approve
  rejectItemWithDetails(type: string, id: number, rejectionData: any): Observable<any> {
    const apiType = this.mapTypeToApi(type);
    const url = `${this.baseUrl}/api/kcs-check/${apiType}/reject-with-details`;
    
    const payload = {
      itemId: id,
      reason: rejectionData.reason,
      technicalDetails: rejectionData.technicalDetails,
      qualityIssues: rejectionData.qualityIssues,
      recommendations: rejectionData.recommendations,
      rejectedAt: rejectionData.rejectedAt,
      itemType: rejectionData.itemType,
      // Save to tbl_kcs_approve table
      saveToKcsApprove: true,
      kcsApproveData: {
        item_id: id,
        item_type: type,
        action: 'reject',
        reason: rejectionData.reason,
        technical_details: rejectionData.technicalDetails,
        quality_issues: rejectionData.qualityIssues,
        recommendations: rejectionData.recommendations,
        inspector_name: rejectionData.inspectorName || 'Unknown',
        inspection_date: rejectionData.inspectionDate || new Date().toISOString(),
        created_at: new Date().toISOString(),
        status: 'rejected'
      }
    };
    
    console.log('=== REJECT ITEM WITH DETAILS DEBUG ===');
    console.log(`Type: ${type}`);
    console.log(`Mapped API Type: ${apiType}`);
    console.log(`Item ID: ${id}`);
    console.log(`Rejection Data:`, rejectionData);
    console.log(`Payload:`, payload);
    console.log(`Full URL: ${url}`);
    console.log(`Headers:`, this.getAuthHeaders());
    console.log('==========================');
    
    return this.http.post<any>(url, payload, { headers: this.getAuthHeaders() })
      .pipe(
        map(response => {
          console.log('Reject with details response:', response);
          return response;
        }),
        catchError(error => {
          console.error('Error rejecting item with details:', error);
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
        return this.getBoiDayHaPending().pipe(
          map(response => this.convertToLegacyFormat(response.data))
        );
      case 'boiDayCao':
        return this.getBoiDayCaoData();
      case 'epBoiDay':
        return this.getEpBoiDayData();
      default:
        return of([]);
    }
  }
}
