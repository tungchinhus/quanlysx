import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { DialogComponent } from 'src/app/shared/dialogs/dialog/dialog.component';
import { BoiDayHaPopupComponent } from './boi-day-ha-popup/boi-day-ha-popup.component';
import { BoiDayCaoPopupComponent } from './boi-day-cao-popup/boi-day-cao-popup.component';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from 'src/app/shared/services/common.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthServices } from 'src/app/shared/services/authen/auth.service';
import { MatTabChangeEvent } from '@angular/material/tabs';

export interface QuanDayData {
  id: number;
  kyhieuquanday: string;
  congsuat: number;
  tbkt: string;
  dienap: string;
  soboiday: string;
  bd_ha_trong: string;
  bd_ha_ngoai: string;
  bd_cao: string;
  bd_ep: string;
  bung_bd: number;
  user_create: string;
  trang_thai: number | null;
  trang_thai_bd_cao: number | null; // Trạng thái bối dây cao: 1=đang làm, 2=đã hoàn thành
  trang_thai_bd_ha: number | null; // Trạng thái bối dây hạ: 1=đang làm, 2=đã hoàn thành
  trang_thai_bd_ep: number | null; // Trạng thái bối dây ép: 1=đang làm, 2=đã hoàn thành
  created_at: Date;
  username: string;
  email: string;
  role_name: string;
  khau_sx?: string; // Thêm khau_sx để lưu thông tin khâu sản xuất
}

export interface UserRole {
  id: string | number;
  username: string;
  email: string;
  role_name: string;
  khau_sx?: string;
}

export interface CompletedQuanDayData extends QuanDayData {
  completed_date: Date;
  completed_by: string;
  completion_notes: string;
}

@Component({
  selector: 'app-ds-quan-day',
  templateUrl: './ds-quan-day.component.html',
  styleUrls: ['./ds-quan-day.component.scss']
})
export class DsQuanDayComponent implements OnInit {
  quanDays: QuanDayData[] = [];
  completedQuanDays: CompletedQuanDayData[] = [];
   
  isAuthenticated: boolean = false;
  currentUser: any = null;
  userRole: UserRole | null = null;
  isGiaCongHa: boolean = false;
  isGiaCongCao: boolean = false;

  displayedColumns: string[] = ['kyhieuquanday', 'congsuat', 'tbkt', 'dienap', 'created_at', 'actions'];
  displayedColumnsCompleted: string[] = ['kyhieuquanday', 'congsuat', 'tbkt', 'dienap', 'completed_date', 'actions'];
  
  searchTerm: string = '';
  filteredQuanDays: QuanDayData[] = [];
  pagedNewQuanDays: QuanDayData[] = [];
  
  searchTermCompleted: string = '';
  filteredCompletedQuanDays: CompletedQuanDayData[] = [];
  pagedCompletedQuanDays: CompletedQuanDayData[] = [];

  pageSize = 5;
  pageIndex = 0;
  pageSizeCompleted = 5;
  pageIndexCompleted = 0;
  currentTabIndex = 0;
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  dataSource: QuanDayData[] = [];

  constructor(
    public dialog: MatDialog,
    private _snackBar: MatSnackBar,
    private router: Router,
    private commonService: CommonService,
    private http: HttpClient,
    private authService: AuthServices,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    console.log('DsQuanDayComponent initialized');
    this.checkAuthentication();
    
    // Kiểm tra và refresh dữ liệu nếu cần
    setTimeout(() => {
      if (this.shouldRefreshData()) {
        console.log('Auto-refreshing data...');
        this.refreshData();
      }
    }, 2000); // Đợi 2 giây sau khi component khởi tạo
  }

  async checkAuthentication(): Promise<void> {
    try {
      // Kiểm tra xem user có đăng nhập không
      this.isAuthenticated = this.authService.isLoggedIn();
      console.log('checkAuthentication: isLoggedIn =', this.isAuthenticated);
      
      if (this.isAuthenticated) {
        // Lấy thông tin user từ localStorage
        this.currentUser = this.authService.getUserInfoFromStorage();
        console.log('checkAuthentication: currentUser from storage =', this.currentUser);
        
                 if (this.currentUser) {
           // Kiểm tra xem user có user_id không
           const userId = this.getUserId();
           console.log('checkAuthentication: resolved userId =', userId);
           console.log('checkAuthentication: userId details =', {
             id: this.currentUser?.id,
             user_id: this.currentUser?.user_id,
             userId: this.currentUser?.userId,
             Id: this.currentUser?.Id,
             UserId: this.currentUser?.UserId
           });
           
           if (userId !== null && this.isValidUserId(userId)) {
             // Xác định loại user và quyền
             this.determineUserRole();
             this.loadQuanDayData();
           } else {
             console.error('User không có thông tin user_id hợp lệ:', userId);
             this.debugUserIdIssue();
             this.showError('User không có quyền truy cập dữ liệu này - userId không hợp lệ');
           }
        } else {
          console.error('Không thể lấy thông tin user');
          this.showError('Không thể lấy thông tin người dùng');
        }
      } else {
        this.router.navigate(['/login']);
      }
    } catch (error) {
      console.error('Lỗi kiểm tra xác thực:', error);
      this.showError('Lỗi xác thực người dùng');
    }
  }

  async loadQuanDayData(): Promise<void> {
    try {
      // Lấy dữ liệu từ API với filter theo user_id của user hiện tại
      const apiUrl = `${this.commonService.getServerAPIURL()}api/Drawings/GetUserAssignedDrawings`;
      const token = this.authService.getToken();
      
      if (!token) {
        throw new Error('Không có token xác thực');
      }

      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      });
      
             // Lấy user_id từ thông tin user hiện tại
       const userId = this.getUserId();
       if (userId === null) {
         throw new Error('Không thể lấy user_id');
       }
       
       if (!this.isValidUserId(userId)) {
         throw new Error(`User ID không hợp lệ: ${userId}. User ID phải là số dương > 0`);
       }
      
      // Lấy chỉ những bảng vẽ được assign cho user này từ bảng tbl_user_bangve
      const requestBody = {
        user_id: userId
      };
      console.log('Request body for user assigned drawings:', requestBody);

      // Gọi API để lấy chỉ những bảng vẽ được assign
      this.http.post<any[]>(apiUrl, requestBody, { headers })
        .pipe(
          catchError(error => {
            console.error('Lỗi API lấy dữ liệu được assign:', error);
            // Không sử dụng mock data, để API thực tế xử lý
            console.log('Main catch block - API error, clearing data arrays');
            this.quanDays = [];
            this.filteredQuanDays = [];
            this.pagedNewQuanDays = [];
            this.completedQuanDays = [];
            this.filteredCompletedQuanDays = [];
            this.pagedCompletedQuanDays = [];
            return of([]);
          })
        )
        .subscribe(async data => {
          console.log('Raw assigned data from API:', data);
          
          // Kiểm tra xem data có phải là array không
          if (!Array.isArray(data)) {
            console.warn('API returned non-array data:', typeof data, data);
            data = [];
          }
          
          console.log('Assigned data length before deduplication:', data.length);
          
          // Loại bỏ dữ liệu trùng lặp dựa trên id
          const uniqueData = this.removeDuplicateData(data);
          console.log('Assigned data length after deduplication:', uniqueData.length);
          
          // Map dữ liệu
          const mappedData = uniqueData.map(item => this.mapBangVeToQuanDay(item));
          
          // Filter dữ liệu theo quyền của user
          const filteredData = await this.filterDataByUserPermission(mappedData);
          console.log('Data after permission filter:', filteredData.length);
          
          // Phân loại dữ liệu dựa trên trang_thai_bd_cao
          this.quanDays = filteredData.filter(item => 
            item.trang_thai_bd_cao === 1 || item.trang_thai_bd_cao === null || item.trang_thai_bd_cao === 0
          );
          
          this.completedQuanDays = filteredData.filter(item => 
            item.trang_thai_bd_cao === 2
          ).map(item => ({
            ...item,
            completed_date: item.created_at, // Sử dụng created_at làm completed_date tạm thời
            completed_by: item.user_create || 'Unknown',
            completion_notes: 'Hoàn thành bối dây cao'
          }));
          
          // Cập nhật filtered data và paged data
          this.filteredQuanDays = [...this.quanDays];
          this.pagedNewQuanDays = this.getPaginatedData(this.filteredQuanDays, 0, this.pageSize);
          
          this.filteredCompletedQuanDays = [...this.completedQuanDays];
          this.pagedCompletedQuanDays = this.getPaginatedData(this.filteredCompletedQuanDays, 0, this.pageSizeCompleted);
          
          console.log('Filtered data - New:', this.quanDays.length, 'Completed:', this.completedQuanDays.length);
          
          // Hiển thị thông báo nếu không có dữ liệu được assign
          this.showNoDataMessage();
          
          this.cdr.detectChanges();
        });

    } catch (error) {
      console.error('Lỗi tải dữ liệu được assign:', error);
      // Không sử dụng mock data, để API thực tế xử lý
      console.log('Main catch block - API error, clearing data arrays');
      this.quanDays = [];
      this.filteredQuanDays = [];
      this.pagedNewQuanDays = [];
      this.completedQuanDays = [];
      this.filteredCompletedQuanDays = [];
      this.pagedCompletedQuanDays = [];
    }
  }

  // Lấy dữ liệu quấn dây đã hoàn thành
  private async loadCompletedQuanDayData(userId: string | number, headers: HttpHeaders): Promise<void> {
    try {
      const apiUrl = `${this.commonService.getServerAPIURL()}api/Drawings/GetUserAssignedDrawings`;
      
      const requestBody = {
        user_id: userId,
        trang_thai: [1, 2] // 1 = đang gia công, 2 = đã hoàn thành
      };

      this.http.post<any[]>(apiUrl, requestBody, { headers })
        .pipe(
          catchError(error => {
            console.error('Lỗi API lấy dữ liệu đã hoàn thành được assign:', error);
            // Không sử dụng mock data, để API thực tế xử lý
            console.log('Completed data API error - returning empty array');
            return of([]);
          })
        )
        .subscribe(async data => {
          console.log('Raw assigned completed data from API:', data);
          
          // Kiểm tra xem data có phải là array không
          if (!Array.isArray(data)) {
            console.warn('API returned non-array data for completed drawings:', typeof data, data);
            data = [];
          }
          
          // Map dữ liệu đã hoàn thành
          const mappedData = data.map(item => this.mapCompletedBangVeToQuanDay(item));
          
          // Filter dữ liệu theo quyền của user
          const filteredData = await this.filterDataByUserPermission(mappedData);
          console.log('Completed data after permission filter:', filteredData.length);
          
          this.completedQuanDays = filteredData;
          this.filteredCompletedQuanDays = [...this.completedQuanDays];
          this.pagedCompletedQuanDays = this.getPaginatedData(this.filteredCompletedQuanDays, 0, this.pageSizeCompleted);
          
          console.log('Completed assigned data:', this.completedQuanDays.length);
          
          this.cdr.detectChanges();
        });

    } catch (error) {
      console.error('Lỗi tải dữ liệu đã hoàn thành được assign:', error);
      // Không sử dụng mock data, để API thực tế xử lý
      console.log('Completed data main catch - clearing arrays');
      this.completedQuanDays = [];
      this.filteredCompletedQuanDays = [];
      this.pagedCompletedQuanDays = [];
    }
  }

  // Helper method để kiểm tra userId có hợp lệ không
  private isValidUserId(userId: string | number | null): boolean {
    if (userId === null || userId === undefined) return false;
    
    // Chuyển đổi thành number để kiểm tra
    const numUserId = Number(userId);
    
    // Kiểm tra xem có phải là số hợp lệ và > 0 không
    if (isNaN(numUserId) || numUserId <= 0) {
      console.warn('isValidUserId: Invalid userId:', userId, 'Type:', typeof userId, 'Converted to number:', numUserId);
      return false;
    }
    
    console.log('isValidUserId: Valid userId:', userId, 'Converted to number:', numUserId);
    return true;
  }

  // Method để debug vấn đề userId
  private debugUserIdIssue(): void {
    console.error('=== DEBUG USER ID ISSUE ===');
    console.error('Current user object:', this.currentUser);
    
    if (this.currentUser) {
      console.error('All currentUser properties:');
      Object.keys(this.currentUser).forEach(key => {
        console.error(`  ${key}:`, this.currentUser[key], `(type: ${typeof this.currentUser[key]})`);
      });
      
      // Kiểm tra từng thuộc tính có thể chứa userId
      const possibleUserIdKeys = ['id', 'user_id', 'userId', 'Id', 'UserId'];
      possibleUserIdKeys.forEach(key => {
        const value = this.currentUser[key];
        console.error(`  ${key}:`, value, `(type: ${typeof value}, valid: ${this.isValidUserId(value)})`);
      });
    }
    
    // Kiểm tra localStorage trực tiếp
    console.error('LocalStorage check:');
    try {
      const localStorageUserId = localStorage.getItem('userId');
      const localStorageId = localStorage.getItem('id');
      console.error('  localStorage.userId:', localStorageUserId, `(type: ${typeof localStorageUserId})`);
      console.error('  localStorage.id:', localStorageId, `(type: ${typeof localStorageId})`);
      
      if (localStorageUserId) {
        console.error('  localStorage.userId validation:', this.isValidUserId(localStorageUserId));
      }
      if (localStorageId) {
        console.error('  localStorage.id validation:', this.isValidUserId(localStorageId));
      }
    } catch (error) {
      console.error('  Error accessing localStorage:', error);
    }
    
    console.error('=== END DEBUG ===');
  }

  // Helper method để lấy userId một cách nhất quán
  private getUserId(): string | number | null {
    if (!this.currentUser) return null;
    
    // Log toàn bộ currentUser để debug
    console.log('getUserId: currentUser object:', this.currentUser);
    console.log('getUserId: currentUser keys:', Object.keys(this.currentUser));
    
    // Thử lấy từ các thuộc tính khác nhau theo thứ tự ưu tiên
    const userId = this.currentUser.id || 
                   this.currentUser.user_id || 
                   this.currentUser.userId ||
                   this.currentUser.Id ||
                   this.currentUser.UserId;
    
    if (userId !== undefined && userId !== null) {
      console.log('getUserId: Found userId:', userId, 'Type:', typeof userId);
      
      // Xử lý trường hợp userId = "0" - chuyển thành số 0
      if (userId === "0") {
        console.log('getUserId: Converting "0" to number 0');
        return 0;
      }
      
      // Xử lý trường hợp userId là string number - chuyển thành number
      if (typeof userId === 'string' && !isNaN(Number(userId))) {
        const numUserId = Number(userId);
        console.log('getUserId: Converting string userId to number:', numUserId);
        return numUserId;
      }
      
      return userId;
    }
    
    // Fallback: thử lấy từ localStorage trực tiếp
    console.log('getUserId: Trying localStorage fallback...');
    try {
      const localStorageUserId = localStorage.getItem('userId');
      const localStorageId = localStorage.getItem('id');
      
      if (localStorageUserId && localStorageUserId !== "0") {
        console.log('getUserId: Found userId in localStorage:', localStorageUserId);
        return this.convertUserIdToNumber(localStorageUserId);
      }
      
      if (localStorageId && localStorageId !== "0") {
        console.log('getUserId: Found id in localStorage:', localStorageId);
        return this.convertUserIdToNumber(localStorageId);
      }
    } catch (error) {
      console.warn('getUserId: Error accessing localStorage:', error);
    }
    
    console.warn('getUserId: Không thể lấy userId từ currentUser hoặc localStorage. Available properties:', {
      id: this.currentUser.id,
      user_id: this.currentUser.user_id,
      userId: this.currentUser.userId,
      Id: this.currentUser.Id,
      UserId: this.currentUser.UserId
    });
    return null;
  }

  // Helper method để chuyển đổi userId thành number
  private convertUserIdToNumber(userId: string | number): number {
    if (typeof userId === 'number') return userId;
    
    const numUserId = Number(userId);
    if (isNaN(numUserId)) {
      console.warn('convertUserIdToNumber: Invalid userId string:', userId);
      return 0;
    }
    
    return numUserId;
  }

  // Xác định loại user và quyền
  private determineUserRole(): void {
         if (this.currentUser) {
       this.userRole = {
         id: this.getUserId() || 0,
         username: this.currentUser?.username || '',
         email: this.currentUser?.email || '',
         role_name: this.currentUser?.role_name || '',
         khau_sx: this.currentUser?.khau_sx || ''
       };
      
      // Xác định loại gia công dựa trên khau_sx và role_name
      const khauSx = this.userRole.khau_sx?.toLowerCase() || '';
      const roleName = this.userRole.role_name?.toLowerCase() || '';
      
      // Kiểm tra quyền gia công hạ
      this.isGiaCongHa = khauSx.includes('quandayha') || 
                         khauSx.includes('boidayha') || 
                         khauSx.includes('ha') ||
                         roleName.includes('boidayha') ||
                         roleName.includes('quandayha');
      
      // Kiểm tra quyền gia công cao
      this.isGiaCongCao = khauSx.includes('quandaycao') || 
                          khauSx.includes('boidaycao') || 
                          khauSx.includes('cao') ||
                          roleName.includes('boidaycao') ||
                          roleName.includes('quandaycao');
      
      console.log('User role determined:', this.userRole);
      console.log('Is gia cong ha:', this.isGiaCongHa);
      console.log('Is gia cong cao:', this.isGiaCongCao);
      
             // Log thông tin user để debug
       console.log('Current user info:', {
         id: this.currentUser?.id,
         user_id: this.currentUser?.user_id,
         userId: this.currentUser?.userId,
         Id: this.currentUser?.Id,
         UserId: this.currentUser?.UserId,
         username: this.currentUser?.username,
         role_name: this.currentUser?.role_name,
         khau_sx: this.currentUser?.khau_sx
       });
    }
  }

  // Loại bỏ dữ liệu trùng lặp dựa trên id
  private removeDuplicateData(data: any): any[] {
    // Kiểm tra xem data có phải là array không
    if (!Array.isArray(data)) {
      console.warn('removeDuplicateData: data is not an array, returning empty array. Data type:', typeof data, 'Data:', data);
      return [];
    }
    
    const seen = new Set();
    return data.filter(item => {
      const duplicate = seen.has(item.id);
      seen.add(item.id);
      return !duplicate;
    });
  }

  // Map dữ liệu từ tbl_bangve sang QuanDayData
  private mapBangVeToQuanDay(bangVe: any): QuanDayData {
    return {
      id: bangVe.id,
      kyhieuquanday: bangVe.kyhieubangve || '',
      congsuat: bangVe.congsuat || 0,
      tbkt: bangVe.tbkt || '',
      dienap: bangVe.dienap || '',
      soboiday: bangVe.soboiday || '',
      bd_ha_trong: bangVe.bd_ha_trong || '',
      bd_ha_ngoai: bangVe.bd_ha_ngoai || '',
      bd_cao: bangVe.bd_cao || '',
      bd_ep: bangVe.bd_ep || '',
      bung_bd: bangVe.bung_bd || 0,
      user_create: bangVe.user_create || '',
      trang_thai: bangVe.trang_thai || 0,
      trang_thai_bd_cao: bangVe.trang_thai_bd_cao || 0,
      trang_thai_bd_ha: bangVe.trang_thai_bd_ha || 0,
      trang_thai_bd_ep: bangVe.trang_thai_bd_ep || 0,
      created_at: new Date(bangVe.created_at) || new Date(),
      username: bangVe.username || '',
      email: bangVe.email || '',
      role_name: bangVe.role_name || '',
      khau_sx: bangVe.khau_sx || ''
    };
  }

  // Map dữ liệu đã hoàn thành từ tbl_bangve sang CompletedQuanDayData
  private mapCompletedBangVeToQuanDay(bangVe: any): CompletedQuanDayData {
    return {
      id: bangVe.id,
      kyhieuquanday: bangVe.kyhieubangve || '',
      congsuat: bangVe.congsuat || 0,
      tbkt: bangVe.tbkt || '',
      dienap: bangVe.dienap || '',
      soboiday: bangVe.soboiday || '',
      bd_ha_trong: bangVe.bd_ha_trong || '',
      bd_ha_ngoai: bangVe.bd_ha_ngoai || '',
      bd_cao: bangVe.bd_cao || '',
      bd_ep: bangVe.bd_ep || '',
      bung_bd: bangVe.bung_bd || 0,
      user_create: bangVe.user_create || '',
      trang_thai: bangVe.trang_thai || 0,
      trang_thai_bd_cao: bangVe.trang_thai_bd_cao || 0,
      trang_thai_bd_ha: bangVe.trang_thai_bd_ha || 0,
      trang_thai_bd_ep: bangVe.trang_thai_bd_ep || 0,
      created_at: new Date(bangVe.created_at) || new Date(),
      username: bangVe.username || '',
      email: bangVe.email || '',
      role_name: bangVe.role_name || '',
      khau_sx: bangVe.khau_sx || '',
      completed_date: new Date(bangVe.completed_date) || new Date(),
      completed_by: bangVe.completed_by || '',
      completion_notes: bangVe.completion_notes || ''
    };
  }

  // Dữ liệu mẫu fallback
  private getMockData(): QuanDayData[] {
    // Tạo dữ liệu mẫu dựa trên user hiện tại
    const currentUsername = this.currentUser?.username || 'unknown';
    
    return [
      {
        id: 1, 
        kyhieuquanday: 'QD001', 
        congsuat: 212, 
        tbkt: 'Máy biến áp 1', 
        dienap: '220V', 
        soboiday: '5',
        bd_ha_trong: '10mm', 
        bd_ha_ngoai: '12mm', 
        bd_cao: '15mm', 
        bd_ep: '2mm', 
        bung_bd: 1,
        user_create: currentUsername, // Sử dụng username hiện tại
        trang_thai: 0, 
        trang_thai_bd_cao: 1, // Đang làm bối dây cao
        trang_thai_bd_ha: 0,
        trang_thai_bd_ep: 0,
        created_at: new Date('2025-08-11'), 
        username: currentUsername, // Sử dụng username hiện tại
        email: `${currentUsername}@example.com`, 
        role_name: 'operator',
        khau_sx: 'Khâu 1'
      },
      {
        id: 2, 
        kyhieuquanday: 'QD002', 
        congsuat: 234, 
        tbkt: 'Máy biến áp 2', 
        dienap: '380V', 
        soboiday: '3',
        bd_ha_trong: '8mm', 
        bd_ha_ngoai: '10mm', 
        bd_cao: '12mm', 
        bd_ep: '1.5mm', 
        bung_bd: 1,
        user_create: currentUsername, // Sử dụng username hiện tại
        trang_thai: 0, 
        trang_thai_bd_cao: 0, // Chưa làm bối dây cao
        trang_thai_bd_ha: 0,
        trang_thai_bd_ep: 0,
        created_at: new Date('2025-08-11'), 
        username: currentUsername, // Sử dụng username hiện tại
        email: `${currentUsername}@example.com`, 
        role_name: 'operator',
        khau_sx: 'Khâu 2'
      }
    ];
  }

  private getMockCompletedData(): CompletedQuanDayData[] {
    // Tạo dữ liệu mẫu dựa trên user hiện tại
    const currentUsername = this.currentUser?.username || 'unknown';
    
    return [
      {
        id: 3, 
        kyhieuquanday: 'QD003', 
        congsuat: 100, 
        tbkt: 'Máy biến áp 3', 
        dienap: '220V', 
        soboiday: '5',
        bd_ha_trong: '10mm', 
        bd_ha_ngoai: '12mm', 
        bd_cao: '15mm', 
        bd_ep: '2mm', 
        bung_bd: 1,
        user_create: currentUsername, // Sử dụng username hiện tại
        trang_thai: 2, 
        trang_thai_bd_cao: 2, // Đã hoàn thành bối dây cao
        trang_thai_bd_ha: 2,
        trang_thai_bd_ep: 2,
        created_at: new Date('2025-08-01'), 
        username: currentUsername, // Sử dụng username hiện tại
        email: `${currentUsername}@example.com`, 
        role_name: 'operator',
        khau_sx: 'Khâu 1',
        completed_date: new Date('2025-08-10'), 
        completed_by: currentUsername, // Sử dụng username hiện tại
        completion_notes: 'Hoàn thành đúng tiến độ'
      },
      {
        id: 4, 
        kyhieuquanday: 'QD004', 
        congsuat: 150, 
        tbkt: 'Máy biến áp 4', 
        dienap: '380V', 
        soboiday: '4',
        bd_ha_trong: '12mm', 
        bd_ha_ngoai: '14mm', 
        bd_cao: '18mm', 
        bd_ep: '2.5mm', 
        bung_bd: 1,
        user_create: currentUsername, // Sử dụng username hiện tại
        trang_thai: 2, 
        trang_thai_bd_cao: 2, // Đã hoàn thành bối dây cao
        trang_thai_bd_ha: 2,
        trang_thai_bd_ep: 2,
        created_at: new Date('2025-08-02'), 
        username: currentUsername, // Sử dụng username hiện tại
        email: `${currentUsername}@example.com`, 
        role_name: 'operator',
        khau_sx: 'Khâu 2',
        completed_date: new Date('2025-08-12'), 
        completed_by: currentUsername, // Sử dụng username hiện tại
        completion_notes: 'Hoàn thành đúng tiến độ'
      }
    ];
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.pagedNewQuanDays = this.getPaginatedData(this.filteredQuanDays, this.pageIndex, this.pageSize);
  }

  onPageChangeCompleted(event: PageEvent): void {
    this.pageIndexCompleted = event.pageIndex;
    this.pageSizeCompleted = event.pageSize;
    this.pagedCompletedQuanDays = this.getPaginatedData(this.filteredCompletedQuanDays, this.pageIndexCompleted, this.pageSizeCompleted);
  }

  onTabChange(event: MatTabChangeEvent): void {
    this.currentTabIndex = event.index;
  }

  searchQuanDays(): void {
    if (!this.searchTerm.trim()) {
      this.filteredQuanDays = [...this.quanDays];
    } else {
      this.filteredQuanDays = this.quanDays.filter(item =>
        item.kyhieuquanday.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        item.tbkt.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
    this.pageIndex = 0;
    this.pagedNewQuanDays = this.getPaginatedData(this.filteredQuanDays, 0, this.pageSize);
  }

  searchCompletedQuanDays(): void {
    if (!this.searchTermCompleted.trim()) {
      this.filteredCompletedQuanDays = [...this.completedQuanDays];
    } else {
      this.filteredCompletedQuanDays = this.completedQuanDays.filter(item =>
        item.kyhieuquanday.toLowerCase().includes(this.searchTermCompleted.toLowerCase()) ||
        item.tbkt.toLowerCase().includes(this.searchTermCompleted.toLowerCase())
      );
    }
    this.pageIndexCompleted = 0;
    this.pagedCompletedQuanDays = this.getPaginatedData(this.filteredCompletedQuanDays, 0, this.pageSizeCompleted);
  }

  // Clear search terms
  clearSearch(): void {
    this.searchTerm = '';
    this.searchQuanDays();
  }

  clearCompletedSearch(): void {
    this.searchTermCompleted = '';
    this.searchCompletedQuanDays();
  }

  getPaginatedData<T>(data: T[], pageIndex: number, pageSize: number): T[] {
    const startIndex = pageIndex * pageSize;
    return data.slice(startIndex, startIndex + pageSize);
  }

  // Xử lý gia công hạ
  onGiaCongHa(element: QuanDayData): void {
    console.log('Gia công hạ cho:', element.kyhieuquanday);
    
    // Kiểm tra quyền trước khi mở popup
    if (!this.isGiaCongHa) {
      this.showError('Bạn không có quyền thực hiện gia công hạ');
      return;
    }
    
    // Mở popup bối dây hạ
    const dialogRef = this.dialog.open(BoiDayHaPopupComponent, {
      width: '800px',
      maxWidth: '90vw',
      data: { quanDay: element },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.success) {
        console.log('Bối dây hạ đã được lưu:', result.data);
        this.showSuccess('Thông tin bối dây hạ đã được lưu thành công!');
        // Refresh dữ liệu sau khi lưu thành công
        this.refreshData();
      }
    });
  }

  // Xử lý gia công cao
  onGiaCongCao(element: QuanDayData): void {
    console.log('Gia công cao cho:', element.kyhieuquanday);
    
    // Kiểm tra quyền trước khi mở popup
    if (!this.isGiaCongCao) {
      this.showError('Bạn không có quyền thực hiện gia công cao');
      return;
    }
    
    // Mở popup bối dây cao
    const dialogRef = this.dialog.open(BoiDayCaoPopupComponent, {
      width: '1000px',
      maxWidth: '95vw',
      data: { quanDay: element },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.success) {
        console.log('Bối dây cao đã được lưu:', result.data);
        this.showSuccess('Thông tin bối dây cao đã được lưu thành công!');
        // Refresh dữ liệu sau khi lưu thành công
        this.refreshData();
      }
    });
  }

  // Refresh dữ liệu và kiểm tra assignment mới
  refreshData(): void {
    console.log('Refreshing data...');
    this.loadQuanDayData();
  }

  // Kiểm tra xem có cần refresh dữ liệu không
  shouldRefreshData(): boolean {
    // Refresh nếu không có dữ liệu hoặc dữ liệu quá cũ
    return !this.hasAssignedData() || this.quanDays.length === 0;
  }

  // Kiểm tra quyền hiển thị nút gia công
  canShowGiaCongHa(element: QuanDayData): boolean {
    // Chỉ hiển thị nút gia công hạ khi:
    // 1. User có quyền gia công hạ
    // 2. Trạng thái bối dây hạ chưa hoàn thành (null, 0, hoặc 1)
    return this.isGiaCongHa && 
           (element.trang_thai_bd_ha === null || element.trang_thai_bd_ha === 0 || element.trang_thai_bd_ha === 1);
  }

  canShowGiaCongCao(element: QuanDayData): boolean {
    // Chỉ hiển thị nút gia công cao khi:
    // 1. User có quyền gia công cao
    // 2. Trạng thái bối dây cao chưa hoàn thành (null, 0, hoặc 1)
    return this.isGiaCongCao && 
           (element.trang_thai_bd_cao === null || element.trang_thai_bd_cao === 0 || element.trang_thai_bd_cao === 1);
  }

  // Logout user
  logout(): void {
    try {
      this.authService.logout();
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('Lỗi khi logout:', error);
      this.showError('Lỗi khi đăng xuất');
    }
  }

  // Kiểm tra và cập nhật trạng thái xác thực
  private checkAndUpdateAuthStatus(): void {
    const isStillLoggedIn = this.authService.isLoggedIn();
    if (!isStillLoggedIn && this.isAuthenticated) {
      console.log('User session expired, redirecting to login');
      this.isAuthenticated = false;
      this.currentUser = null;
      this.userRole = null;
      this.router.navigate(['/login']);
    }
  }

  openDialog(message: string): void {
    this.dialog.open(DialogComponent, {
      data: { message: message }
    });
  }

  private showSuccess(message: string): void {
    this._snackBar.open(message, 'Đóng', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['success-snackbar']
    });
  }

  private showError(message: string): void {
    this._snackBar.open(message, 'Đóng', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
    });
  }

  // Lấy tên hiển thị của user
  getUserDisplayName(): string {
    if (!this.currentUser) return 'Unknown';
    
    if (this.currentUser.firstName && this.currentUser.lastName) {
      return `${this.currentUser.firstName} ${this.currentUser.lastName}`;
    }
    
    if (this.currentUser.username) {
      return this.currentUser.username;
    }
    
    if (this.currentUser.email) {
      return this.currentUser.email;
    }
    
    return 'Unknown';
  }

  // Lấy thông tin role hiển thị
  getRoleDisplayInfo(): string {
    if (!this.userRole) return '';
    
    let roleInfo = '';
    
    if (this.userRole.role_name) {
      roleInfo += this.userRole.role_name;
    }
    
    if (this.userRole.khau_sx) {
      if (roleInfo) roleInfo += ' - ';
      roleInfo += this.userRole.khau_sx;
    }
    
    return roleInfo;
  }

  // Kiểm tra xem user có được assign bảng vẽ này không
  private async checkUserDrawingAssignment(userId: string | number, bangveId: number): Promise<boolean> {
    try {
      const apiUrl = `${this.commonService.getServerAPIURL()}api/Drawings/CheckUserAssignment`;
      const token = this.authService.getToken();
      
      if (!token) return false;

      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      });
      
      const requestBody = {
        user_id: userId,
        bangve_id: bangveId
      };

      const response = await this.http.post<{isAssigned: boolean}>(apiUrl, requestBody, { headers }).toPromise();
      return response?.isAssigned || false;
      
    } catch (error) {
      console.error('Lỗi kiểm tra assignment:', error);
      return false;
    }
  }

  // Kiểm tra xem user hiện tại có nên thấy dữ liệu không dựa trên database
  public async shouldUserSeeData(): Promise<boolean> {
    if (!this.currentUser) {
      console.log('shouldUserSeeData: currentUser is null');
      return false;
    }
    
    try {
      // Gọi API api/UserBangVe để lấy tất cả assignment
      const apiUrl = `${this.commonService.getServerAPIURL()}api/UserBangVe`;
      const token = this.authService.getToken();
      
      if (!token) {
        console.log('shouldUserSeeData: No token available');
        return false;
      }

      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      });
      
             // Lấy user_id từ thông tin user hiện tại
       const currentUserId = this.getUserId();
       if (currentUserId === null) {
         console.log('shouldUserSeeData: No user ID available');
         return false;
       }
      
      console.log('shouldUserSeeData: Checking assignment for user ID:', currentUserId);
      
      // Gọi API để lấy tất cả assignment
      const response = await this.http.get<any[]>(apiUrl, { headers }).toPromise();
      console.log('shouldUserSeeData: All assignments from API:', response);
      
      if (!response || !Array.isArray(response)) {
        console.log('shouldUserSeeData: Invalid response from API');
        return false;
      }
      
      // Kiểm tra xem user hiện tại có được assign bảng vẽ nào không
      const userAssignments = response.filter(assignment => 
        assignment.user_id?.toString() === currentUserId.toString() ||
        assignment.userId?.toString() === currentUserId.toString()
      );
      
      console.log('shouldUserSeeData: User assignments found:', userAssignments);
      
      const hasAssignment = userAssignments.length > 0;
      console.log(`User ${this.currentUser.username} (${currentUserId}) has assignment: ${hasAssignment}`);
      
      return hasAssignment;
      
    } catch (error) {
      console.error('shouldUserSeeData: Error checking user assignment:', error);
      // Fallback: kiểm tra username
      if (this.currentUser.username) {
        const username = this.currentUser.username.toLowerCase();
        if (username === 'boidaycao1' || username === 'boidayha1') {
          console.log('shouldUserSeeData: Fallback to username check - allowing access');
          return true;
        }
      }
      return false;
    }
  }

  // Kiểm tra xem user có quyền xem dữ liệu này không
  private hasPermissionToViewData(data: QuanDayData): boolean {
    if (!this.currentUser) return false;
    
    // Nếu dữ liệu đến từ API GetUserAssignedDrawings, 
    // thì mặc định user đã có quyền xem (vì API đã filter rồi)
    // Chỉ cần kiểm tra thêm để đảm bảo an toàn
    const currentUsername = this.currentUser.username;
    const currentUserId = this.getUserId();
    
    // Kiểm tra xem dữ liệu có được assign cho user này không
    // Dựa trên bảng tbl_user_bangve
    return data.username === currentUsername || 
           data.user_create === currentUsername ||
           data.user_create === (currentUserId?.toString() || '') ||
           data.username === (currentUserId?.toString() || '');
  }

  // Filter dữ liệu theo quyền của user
  private async filterDataByUserPermission<T extends QuanDayData>(data: T[]): Promise<T[]> {
    if (!this.currentUser) return [];
    
    try {
      // Kiểm tra xem user có được assign trong database không
      const shouldSeeData = await this.shouldUserSeeData();
      
      if (!shouldSeeData) {
        console.log(`User ${this.currentUser.username} không được assign trong database, trả về mảng rỗng`);
        return [];
      }
      
      // Nếu user được assign, trả về tất cả dữ liệu (vì API đã filter rồi)
      console.log(`User ${this.currentUser.username} được assign, hiển thị tất cả dữ liệu được assign`);
      return data;
      
    } catch (error) {
      console.error('filterDataByUserPermission: Error checking user permission:', error);
      return [];
    }
  }

  // Kiểm tra xem user có dữ liệu được assign không
  hasAssignedData(): boolean {
    return this.quanDays.length > 0 || this.completedQuanDays.length > 0;
  }

  // Hiển thị thông báo khi không có dữ liệu
  showNoDataMessage(): void {
    // Không hiển thị thông báo phức tạp, chỉ để HTML hiển thị "Không có dữ liệu"
    console.log('No data message check - User has assigned data:', this.hasAssignedData());
  }
}
