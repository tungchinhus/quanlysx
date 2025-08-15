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

// Interface cho response từ API GetUserAssignedDrawings
export interface GetUserAssignedDrawingsResponse {
  Drawings?: any[]; // API trả về Drawings (chữ D viết hoa)
  drawings?: any[]; // Fallback cho trường hợp chữ thường
  IsAdminOrManager: boolean;
  IsSuccess: boolean;
  Message: string;
  TotalCount: number;
  UserEmail: string;
  UserId: string;
  UserRoles: string[];
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
    
    // Khởi tạo các array để tránh lỗi undefined
    this.quanDays = [];
    this.completedQuanDays = [];
    this.filteredQuanDays = [];
    this.pagedNewQuanDays = [];
    this.filteredCompletedQuanDays = [];
    this.pagedCompletedQuanDays = [];
    
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
        // Lấy thông tin user từ localStorage trực tiếp
        this.currentUser = this.getUserInfoFromLocalStorage();
        console.log('checkAuthentication: currentUser from localStorage =', this.currentUser);
        
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
            console.log('checkAuthentication: User ID valid, proceeding with role determination and data loading');
            // Xác định loại user và quyền
            this.determineUserRole();
            console.log('checkAuthentication: User role determined, loading quan day data...');
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
        console.log('User not authenticated, redirecting to login');
        this.router.navigate(['/login']);
      }
    } catch (error) {
      console.error('checkAuthentication: Lỗi kiểm tra xác thực:', error);
      console.error('checkAuthentication: Error details:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : 'Unknown'
      });
      this.showError('Lỗi xác thực người dùng');
    }
  }

  // Helper method để lấy thông tin user từ localStorage trực tiếp
  private getUserInfoFromLocalStorage(): any {
    try {
      const userInfo = {
        id: localStorage.getItem('userId') || localStorage.getItem('id'),
        user_id: localStorage.getItem('userId') || localStorage.getItem('id'),
        userId: localStorage.getItem('userId') || localStorage.getItem('id'),
        Id: localStorage.getItem('userId') || localStorage.getItem('id'),
        UserId: localStorage.getItem('userId') || localStorage.getItem('id'),
        username: localStorage.getItem('username') || '',
        email: localStorage.getItem('email') || '',
        firstName: localStorage.getItem('firstName') || '',
        lastName: localStorage.getItem('lastName') || '',
        hoten: localStorage.getItem('hoten') || '',
        role: localStorage.getItem('role') || '',
        khau_sx: localStorage.getItem('khau_sx') || ''
      };
      
      console.log('getUserInfoFromLocalStorage: Retrieved user info:', userInfo);
      return userInfo;
    } catch (error) {
      console.error('getUserInfoFromLocalStorage: Error accessing localStorage:', error);
      return null;
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
         throw new Error(`User ID không hợp lệ: ${userId}. User ID phải là UUID hợp lệ hoặc số dương > 0`);
       }
      
      // Lấy chỉ những bảng vẽ được assign cho user này từ bảng tbl_user_bangve
      const requestBody = {
        user_id: userId
      };
      console.log('Request body for user assigned drawings:', requestBody);

      // Gọi API để lấy chỉ những bảng vẽ được assign
      this.http.post<GetUserAssignedDrawingsResponse>(apiUrl, requestBody, { headers })
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
          console.log('Raw data type:', typeof data);
          console.log('Raw data is array:', Array.isArray(data));
          console.log('Raw data keys:', data ? Object.keys(data) : 'No data');
          
          // Sử dụng helper method để lấy drawings data một cách an toàn
          const drawingsData = this.extractDrawingsFromResponse(data);
          
          // Kiểm tra xem API response có thành công không
          if (!this.isApiResponseSuccessful(data)) {
            console.warn('API response indicates failure, not processing data');
            this.quanDays = [];
            this.completedQuanDays = [];
            this.filteredQuanDays = [];
            this.pagedNewQuanDays = [];
            this.filteredCompletedQuanDays = [];
            this.pagedCompletedQuanDays = [];
            return;
          }
          
          console.log('Drawings data to process:', drawingsData.length, 'items');
          
          // Loại bỏ dữ liệu trùng lặp dựa trên id
          const uniqueData = this.removeDuplicateData(drawingsData);
          console.log('Assigned data length after deduplication:', uniqueData.length);
          
          // Map dữ liệu
          const mappedData = uniqueData.map(item => this.mapBangVeToQuanDay(item));
          console.log('Mapped data length:', mappedData.length);
          console.log('Sample mapped data:', mappedData.slice(0, 2));
          
          // Filter dữ liệu theo quyền của user
          const filteredData = await this.filterDataByUserPermission(mappedData);
          console.log('Data after permission filter:', filteredData.length);
          console.log('Sample filtered data:', filteredData.slice(0, 2));
          
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
          
          console.log('Final quanDays length:', this.quanDays.length);
          console.log('Final completedQuanDays length:', this.completedQuanDays.length);
          console.log('Final quanDays data:', this.quanDays);
          console.log('Final completedQuanDays data:', this.completedQuanDays);
          
          // Debug toàn bộ quá trình xử lý data
          this.debugDataFlow(drawingsData, mappedData, filteredData, this.quanDays, this.completedQuanDays);
          
          // Cập nhật filtered data và paged data
          this.filteredQuanDays = [...this.quanDays];
          this.pagedNewQuanDays = this.getPaginatedData(this.filteredQuanDays, 0, this.pageSize);
          
          this.filteredCompletedQuanDays = [...this.completedQuanDays];
          this.pagedCompletedQuanDays = this.getPaginatedData(this.filteredCompletedQuanDays, 0, this.pageSizeCompleted);
          
          console.log('Filtered data - New:', this.quanDays.length, 'Completed:', this.completedQuanDays.length);
          console.log('Paged data - New:', this.pagedNewQuanDays.length, 'Completed:', this.pagedCompletedQuanDays.length);
          
          // Hiển thị thông báo nếu không có dữ liệu được assign
          this.showNoDataMessage();
          
          // Kiểm tra trạng thái data source
          this.checkDataSourceStatus();
          
          // Kiểm tra trạng thái hiển thị UI
          this.checkUIDisplayStatus();
          
          this.cdr.detectChanges();
        });

    } catch (error) {
      console.error('loadQuanDayData: Lỗi tải dữ liệu được assign:', error);
      console.error('loadQuanDayData: Error details:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : 'Unknown'
      });
      
      // Không sử dụng mock data, để API thực tế xử lý
      console.log('loadQuanDayData: Main catch block - API error, clearing data arrays');
      this.quanDays = [];
      this.filteredQuanDays = [];
      this.pagedNewQuanDays = [];
      this.completedQuanDays = [];
      this.filteredCompletedQuanDays = [];
      this.pagedCompletedQuanDays = [];
    }
  }

  // Lấy dữ liệu quấn dây đã hoàn thành từ tbl_user_bangve
  private async loadCompletedQuanDayData(userId: string | number, headers: HttpHeaders): Promise<void> {
    try {
      console.log('loadCompletedQuanDayData: Loading completed data for userId:', userId);
      
      // Sử dụng API mới để lấy dữ liệu từ tbl_user_bangve
      const apiUrl = `${this.commonService.getServerAPIURL()}api/ProductionData/get-completed-bangve`;
      
      const requestBody = {
        user_id: userId,
        // Filter theo các cột trong tbl_user_bangve
        trang_thai_bd_ha: [2], // 2 = đã hoàn thành bối dây hạ
        trang_thai_bd_cao: [2], // 2 = đã hoàn thành bối dây cao
        trang_thai_bd_ep: [2]  // 2 = đã hoàn thành bối dây ép
      };

      console.log('loadCompletedQuanDayData: Request body:', requestBody);

      this.http.post<any>(apiUrl, requestBody, { headers })
        .pipe(
          catchError(error => {
            console.error('loadCompletedQuanDayData: API error:', error);
            // Không sử dụng mock data, để API thực tế xử lý
            console.log('loadCompletedQuanDayData: API error - returning empty array');
            return of([]);
          })
        )
        .subscribe(async (data: any) => {
          console.log('loadCompletedQuanDayData: Raw completed data from tbl_user_bangve API:', data);
          console.log('loadCompletedQuanDayData: Data type:', typeof data, 'Is array:', Array.isArray(data));
          console.log('loadCompletedQuanDayData: Raw data keys:', data ? Object.keys(data) : 'No data');
          
          // Xử lý response từ API mới
          let completedData: any[] = [];
          
          if (data && typeof data === 'object') {
            // Nếu response có cấu trúc { data: [], success: true }
            if ('data' in data && Array.isArray(data.data)) {
              completedData = data.data;
            } else if ('bangve' in data && Array.isArray(data.bangve)) {
              completedData = data.bangve;
            } else if (Array.isArray(data)) {
              completedData = data;
            }
          }
          
          console.log('loadCompletedQuanDayData: Completed data to process:', completedData.length, 'items');
          
          // Map dữ liệu từ tbl_user_bangve sang CompletedQuanDayData
          const mappedData = completedData.map(item => this.mapCompletedBangVeToQuanDay(item));
          console.log('loadCompletedQuanDayData: Mapped data length:', mappedData.length);
          
          // Filter dữ liệu theo quyền của user
          const filteredData = await this.filterDataByUserPermission(mappedData);
          console.log('loadCompletedQuanDayData: Data after permission filter:', filteredData.length);
          
          this.completedQuanDays = filteredData;
          this.filteredCompletedQuanDays = [...this.completedQuanDays];
          this.pagedCompletedQuanDays = this.getPaginatedData(this.filteredCompletedQuanDays, 0, this.pageSizeCompleted);
          
          console.log('loadCompletedQuanDayData: Final completed data length:', this.completedQuanDays.length);
          
          this.cdr.detectChanges();
        });

    } catch (error) {
      console.error('loadCompletedQuanDayData: Error loading completed data:', error);
      console.error('loadCompletedQuanDayData: Error details:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : 'Unknown'
      });
      
      // Không sử dụng mock data, để API thực tế xử lý
      console.log('loadCompletedQuanDayData: Main catch - clearing arrays');
      this.completedQuanDays = [];
      this.filteredCompletedQuanDays = [];
      this.pagedCompletedQuanDays = [];
    }
  }

  // Helper method để kiểm tra userId có hợp lệ không
  private isValidUserId(userId: string | number | null): boolean {
    console.log('isValidUserId: Checking userId:', userId, 'Type:', typeof userId);
    
    if (userId === null || userId === undefined) {
      console.log('isValidUserId: userId is null or undefined');
      return false;
    }
    
    // Nếu userId là string, kiểm tra xem có phải UUID hợp lệ không
    if (typeof userId === 'string') {
      console.log('isValidUserId: userId is string, checking if valid UUID or numeric');
      
      // UUID format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (uuidRegex.test(userId)) {
        console.log('isValidUserId: Valid UUID userId:', userId);
        return true;
      }
      
      // Nếu không phải UUID, kiểm tra xem có phải số hợp lệ không
      const numUserId = Number(userId);
      if (!isNaN(numUserId) && numUserId > 0) {
        console.log('isValidUserId: Valid numeric userId:', userId);
        return true;
      }
      
      console.warn('isValidUserId: Invalid string userId:', userId);
      return false;
    }
    
    // Nếu userId là number, kiểm tra xem có > 0 không
    if (typeof userId === 'number') {
      if (userId > 0) {
        console.log('isValidUserId: Valid numeric userId:', userId);
        return true;
      }
      
      console.warn('isValidUserId: Invalid numeric userId:', userId);
      return false;
    }
    
    console.warn('isValidUserId: Invalid userId type:', typeof userId, 'Value:', userId);
    return false;
  }

  // Method để debug vấn đề userId
  private debugUserIdIssue(): void {
    console.log('=== DEBUG USER ID ISSUE ===');
    console.log('Current user object:', this.currentUser);
    console.log('LocalStorage contents:');
    console.log('- userId:', localStorage.getItem('userId'));
    console.log('- id:', localStorage.getItem('id'));
    console.log('- accessToken:', localStorage.getItem('accessToken'));
    console.log('- email:', localStorage.getItem('email'));
    console.log('- username:', localStorage.getItem('username'));
    console.log('- khau_sx:', localStorage.getItem('khau_sx'));
    console.log('- role:', localStorage.getItem('role'));
    
    // Kiểm tra auth service
    console.log('Auth service status:');
    console.log('- isLoggedIn:', this.authService.isLoggedIn());
    console.log('- isTokenValid:', this.authService.isTokenValid());
    console.log('- getToken:', this.authService.getToken());
    
    console.log('=== END DEBUG ===');
  }

  // Helper method để lấy userId một cách nhất quán
  private getUserId(): string | number | null {
    if (!this.currentUser) {
      console.log('getUserId: currentUser is null');
      return null;
    }
    
    // Log toàn bộ currentUser để debug
    console.log('getUserId: currentUser object:', this.currentUser);
    console.log('getUserId: currentUser keys:', Object.keys(this.currentUser));
    
    // Thử lấy từ các thuộc tính khác nhau theo thứ tự ưu tiên
    let userId = this.currentUser.id || 
                 this.currentUser.user_id || 
                 this.currentUser.userId ||
                 this.currentUser.Id ||
                 this.currentUser.UserId;
    
    console.log('getUserId: Raw userId found:', userId, 'Type:', typeof userId);
    
    // Nếu không tìm thấy từ currentUser, thử lấy từ localStorage trực tiếp
    if (!userId) {
      console.log('getUserId: No userId in currentUser, trying localStorage directly...');
      userId = localStorage.getItem('userId') || localStorage.getItem('id');
      console.log('getUserId: userId from localStorage:', userId);
    }
    
    if (userId !== undefined && userId !== null) {
      console.log('getUserId: Found userId:', userId, 'Type:', typeof userId);
      
      // Xử lý trường hợp userId = "0" - chuyển thành số 0
      if (userId === "0") {
        console.log('getUserId: Converting "0" to number 0');
        return 0;
      }
      
      // Nếu userId là UUID string, giữ nguyên
      if (typeof userId === 'string' && this.isValidUserId(userId)) {
        console.log('getUserId: Valid userId (UUID or numeric):', userId);
        return userId;
      }
      
      // Xử lý trường hợp userId là string number - chuyển thành number
      if (typeof userId === 'string' && !isNaN(Number(userId))) {
        const numUserId = Number(userId);
        console.log('getUserId: Converting string userId to number:', numUserId);
        return numUserId;
      }
      
      console.log('getUserId: Returning userId as is:', userId);
      return userId;
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
    console.log('convertUserIdToNumber: Converting userId:', userId, 'Type:', typeof userId);
    
    if (typeof userId === 'number') {
      console.log('convertUserIdToNumber: userId is already a number:', userId);
      return userId;
    }
    
    const numUserId = Number(userId);
    if (isNaN(numUserId)) {
      console.warn('convertUserIdToNumber: Invalid userId string:', userId);
      return 0;
    }
    
    console.log('convertUserIdToNumber: Successfully converted to number:', numUserId);
    return numUserId;
  }

  // Xác định loại user và quyền
  private determineUserRole(): void {
    if (this.currentUser) {
      this.userRole = {
        id: this.getUserId() || 0,
        username: this.currentUser?.username || '',
        email: this.currentUser?.email || '',
        role_name: this.currentUser?.role || '', // Changed from role_name to role
        khau_sx: this.currentUser?.khau_sx || ''
      };
      
      // Xác định loại gia công dựa trên khau_sx và role_name
      const khauSx = this.userRole.khau_sx?.toLowerCase() || '';
      const roleName = this.userRole.role_name?.toLowerCase() || '';
      
      console.log('determineUserRole: Raw values - khau_sx:', khauSx, 'role_name:', roleName);
      
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
      
      console.log('determineUserRole: User role determined:', this.userRole);
      console.log('determineUserRole: Is gia cong ha:', this.isGiaCongHa);
      console.log('determineUserRole: Is gia cong cao:', this.isGiaCongCao);
      console.log('determineUserRole: Permission check details:', {
        khauSx: khauSx,
        roleName: roleName,
        khauSxIncludes: {
          quandayha: khauSx.includes('quandayha'),
          boidayha: khauSx.includes('boidayha'),
          ha: khauSx.includes('ha')
        },
        roleNameIncludes: {
          boidayha: roleName.includes('boidayha'),
          quandayha: roleName.includes('quandayha')
        }
      });
      
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
    
    console.log('removeDuplicateData: Input data length:', data.length);
    console.log('removeDuplicateData: Sample input data:', data.slice(0, 2));
    
    const seen = new Set();
    const filteredData = data.filter(item => {
      if (!item || !item.Id) {
        console.warn('removeDuplicateData: Item missing id:', item);
        return false;
      }
      
      const duplicate = seen.has(item.Id);
      seen.add(item.Id);
      return !duplicate;
    });
    
    console.log('removeDuplicateData: Output data length:', filteredData.length);
    console.log('removeDuplicateData: Sample output data:', filteredData.slice(0, 2));
    
    return filteredData;
  }

  // Map dữ liệu từ tbl_bangve sang QuanDayData
  private mapBangVeToQuanDay(bangVe: any): QuanDayData {
    console.log('mapBangVeToQuanDay: Input bangVe:', bangVe);
    
    const mappedData = {
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
    
    console.log('mapBangVeToQuanDay: Mapped data:', mappedData);
    return mappedData;
  }

  // Map dữ liệu đã hoàn thành từ tbl_bangve sang CompletedQuanDayData
  private mapCompletedBangVeToQuanDay(bangVe: any): CompletedQuanDayData {
    console.log('mapCompletedBangVeToQuanDay: Input bangVe:', bangVe);
    
    const mappedData = {
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
    
    console.log('mapCompletedBangVeToQuanDay: Mapped data:', mappedData);
    return mappedData;
  }

  // Dữ liệu mẫu fallback
  private getMockData(): QuanDayData[] {
    console.log('getMockData: Generating mock data for current user');
    
    // Tạo dữ liệu mẫu dựa trên user hiện tại
    const currentUsername = this.currentUser?.username || 'unknown';
    console.log('getMockData: Current username:', currentUsername);
    
    const mockData = [
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
    
    console.log('getMockData: Generated mock data length:', mockData.length);
    return mockData;
  }

  private getMockCompletedData(): CompletedQuanDayData[] {
    console.log('getMockCompletedData: Generating mock completed data for current user');
    
    // Tạo dữ liệu mẫu dựa trên user hiện tại
    const currentUsername = this.currentUser?.username || 'unknown';
    console.log('getMockCompletedData: Current username:', currentUsername);
    
    const mockCompletedData = [
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
    
    console.log('getMockCompletedData: Generated mock completed data length:', mockCompletedData.length);
    return mockCompletedData;
  }

  onPageChange(event: PageEvent): void {
    console.log('onPageChange: Page change event:', event);
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.pagedNewQuanDays = this.getPaginatedData(this.filteredQuanDays, this.pageIndex, this.pageSize);
    console.log('onPageChange: Updated paged data length:', this.pagedNewQuanDays.length);
  }

  onPageChangeCompleted(event: PageEvent): void {
    console.log('onPageChangeCompleted: Page change event:', event);
    this.pageIndexCompleted = event.pageIndex;
    this.pageSizeCompleted = event.pageSize;
    this.pagedCompletedQuanDays = this.getPaginatedData(this.filteredCompletedQuanDays, this.pageIndexCompleted, this.pageSizeCompleted);
    console.log('onPageChangeCompleted: Updated paged data length:', this.pagedCompletedQuanDays.length);
  }

  onTabChange(event: MatTabChangeEvent): void {
    console.log('onTabChange: Tab change event:', event);
    this.currentTabIndex = event.index;
    console.log('onTabChange: Current tab index updated to:', this.currentTabIndex);
  }

  searchQuanDays(): void {
    console.log('searchQuanDays: Starting search with term:', this.searchTerm);
    console.log('searchQuanDays: Original quanDays length:', this.quanDays.length);
    
    if (!this.searchTerm.trim()) {
      this.filteredQuanDays = [...this.quanDays];
      console.log('searchQuanDays: Empty search term, showing all data');
    } else {
      this.filteredQuanDays = this.quanDays.filter(item =>
        item.kyhieuquanday.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        item.tbkt.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
      console.log('searchQuanDays: Filtered data length:', this.filteredQuanDays.length);
    }
    
    this.pageIndex = 0;
    this.pagedNewQuanDays = this.getPaginatedData(this.filteredQuanDays, 0, this.pageSize);
    console.log('searchQuanDays: Paged data length:', this.pagedNewQuanDays.length);
  }

  searchCompletedQuanDays(): void {
    console.log('searchCompletedQuanDays: Starting search with term:', this.searchTermCompleted);
    console.log('searchCompletedQuanDays: Original completedQuanDays length:', this.completedQuanDays.length);
    
    if (!this.searchTermCompleted.trim()) {
      this.filteredCompletedQuanDays = [...this.completedQuanDays];
      console.log('searchCompletedQuanDays: Empty search term, showing all data');
    } else {
      this.filteredCompletedQuanDays = this.completedQuanDays.filter(item =>
        item.kyhieuquanday.toLowerCase().includes(this.searchTermCompleted.toLowerCase()) ||
        item.tbkt.toLowerCase().includes(this.searchTermCompleted.toLowerCase())
      );
      console.log('searchCompletedQuanDays: Filtered data length:', this.filteredCompletedQuanDays.length);
    }
    
    this.pageIndexCompleted = 0;
    this.pagedCompletedQuanDays = this.getPaginatedData(this.filteredCompletedQuanDays, 0, this.pageSizeCompleted);
    console.log('searchCompletedQuanDays: Paged data length:', this.pagedCompletedQuanDays.length);
  }

  // Clear search terms
  clearSearch(): void {
    console.log('clearSearch: Clearing search term');
    this.searchTerm = '';
    this.searchQuanDays();
  }

  clearCompletedSearch(): void {
    console.log('clearCompletedSearch: Clearing completed search term');
    this.searchTermCompleted = '';
    this.searchCompletedQuanDays();
  }

  getPaginatedData<T>(data: T[], pageIndex: number, pageSize: number): T[] {
    console.log('getPaginatedData: Input - data length:', data.length, 'pageIndex:', pageIndex, 'pageSize:', pageSize);
    
    if (!Array.isArray(data) || data.length === 0) {
      console.log('getPaginatedData: Empty or invalid data, returning empty array');
      return [];
    }
    
    const startIndex = pageIndex * pageSize;
    const endIndex = startIndex + pageSize;
    const result = data.slice(startIndex, endIndex);
    
    console.log('getPaginatedData: Output - startIndex:', startIndex, 'endIndex:', endIndex, 'result length:', result.length);
    console.log('getPaginatedData: Sample result:', result.slice(0, 2));
    
    return result;
  }

  // Xử lý gia công hạ
  onGiaCongHa(element: QuanDayData): void {
    console.log('onGiaCongHa: Processing lower winding for:', element.kyhieuquanday);
    console.log('onGiaCongHa: Element details:', element);
    
    // Kiểm tra quyền trước khi mở popup
    if (!this.isGiaCongHa) {
      console.log('onGiaCongHa: User does not have permission for lower winding processing');
      this.showError('Bạn không có quyền thực hiện gia công hạ');
      return;
    }
    
    console.log('onGiaCongHa: Opening lower winding popup...');
    
    // Mở popup bối dây hạ
    const dialogRef = this.dialog.open(BoiDayHaPopupComponent, {
      width: '1000px',
      maxWidth: '95vw',
      data: { quanDay: element },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.success) {
        console.log('onGiaCongHa: Lower winding data saved successfully:', result.data);
        
        // Nếu lưu thành công và cần reload data
        if (result.reloadData) {
          console.log('Reload data sau khi lưu bối dây hạ thành công');
          this.showSuccess(result.message || 'Thông tin bối dây hạ đã được lưu thành công!');
          
          // Reload data và chuyển sang tab "Đã hoàn thành"
          this.loadQuanDayData();
          // Lấy userId và headers để gọi loadCompletedQuanDayData
          const userId = this.getUserId();
          const token = this.authService.getToken();
          if (userId && token) {
            const headers = new HttpHeaders({
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            });
            this.loadCompletedQuanDayData(userId, headers);
          }
          
          // Chuyển sang tab "Đã hoàn thành" để user thấy kết quả
          this.currentTabIndex = 1;
          this.cdr.detectChanges();
        } else {
          // Fallback cho trường hợp cũ
          this.showSuccess('Thông tin bối dây hạ đã được lưu thành công!');
          this.refreshData();
        }
      } else {
        console.log('onGiaCongHa: Popup closed without saving or with error');
      }
    });
  }

  // Xử lý gia công cao
  onGiaCongCao(element: QuanDayData): void {
    console.log('onGiaCongCao: Processing upper winding for:', element.kyhieuquanday);
    console.log('onGiaCongCao: Element details:', element);
    
    // Kiểm tra quyền trước khi mở popup
    if (!this.isGiaCongCao) {
      console.log('onGiaCongCao: User does not have permission for upper winding processing');
      this.showError('Bạn không có quyền thực hiện gia công cao');
      return;
    }
    
    console.log('onGiaCongCao: Opening upper winding popup...');
    
    // Mở popup bối dây cao
    const dialogRef = this.dialog.open(BoiDayCaoPopupComponent, {
      width: '1000px',
      maxWidth: '95vw',
      data: { quanDay: element },
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.success) {
        console.log('onGiaCongCao: Upper winding data saved successfully:', result.data);
        
        // Nếu lưu thành công và cần reload data
        if (result.reloadData) {
          console.log('Reload data sau khi lưu bối dây cao thành công');
          this.showSuccess(result.message || 'Thông tin bối dây cao đã được lưu thành công!');
          
          // Reload data và chuyển sang tab "Đã hoàn thành"
          this.loadQuanDayData();
          // Lấy userId và headers để gọi loadCompletedQuanDayData
          const userId = this.getUserId();
          const token = this.authService.getToken();
          if (userId && token) {
            const headers = new HttpHeaders({
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            });
            this.loadCompletedQuanDayData(userId, headers);
          }
          
          // Chuyển sang tab "Đã hoàn thành" để user thấy kết quả
          this.currentTabIndex = 1;
          this.cdr.detectChanges();
        } else {
          // Fallback cho trường hợp cũ
          this.showSuccess('Thông tin bối dây cao đã được lưu thành công!');
          this.refreshData();
        }
      } else {
        console.log('onGiaCongCao: Popup closed without saving or with error');
      }
    });
  }

  // Method để refresh data
  async refreshData(): Promise<void> {
    console.log('refreshData: Starting data refresh...');
    
    try {
      // Kiểm tra lại authentication
      await this.checkAuthentication();
      
      // Nếu vẫn có vấn đề, thử load data trực tiếp
      if (this.isAuthenticated && this.currentUser) {
        console.log('refreshData: Authentication OK, loading data directly...');
        await this.loadQuanDayData();
      } else {
        console.log('refreshData: Authentication failed, cannot load data');
      }
    } catch (error) {
      console.error('refreshData: Error during refresh:', error);
      this.showError('Lỗi khi refresh dữ liệu');
    }
  }

  // Method để kiểm tra xem có nên refresh data không
  private shouldRefreshData(): boolean {
    // Refresh nếu không có data hoặc có lỗi
    return this.quanDays.length === 0 && this.completedQuanDays.length === 0;
  }

  // Kiểm tra quyền hiển thị nút gia công
  canShowGiaCongHa(element: QuanDayData): boolean {
    // Chỉ hiển thị nút gia công hạ khi:
    // 1. User có quyền gia công hạ
    // 2. Trạng thái bối dây hạ chưa hoàn thành (null, 0, hoặc 1)
    const canShow = this.isGiaCongHa && 
           (element.trang_thai_bd_ha === null || element.trang_thai_bd_ha === 0 || element.trang_thai_bd_ha === 1);
    
    console.log('canShowGiaCongHa:', {
      elementId: element.id,
      elementKyHieu: element.kyhieuquanday,
      isGiaCongHa: this.isGiaCongHa,
      trang_thai_bd_ha: element.trang_thai_bd_ha,
      canShow: canShow
    });
    
    return canShow;
  }

  canShowGiaCongCao(element: QuanDayData): boolean {
    // Chỉ hiển thị nút gia công cao khi:
    // 1. User có quyền gia công cao
    // 2. Trạng thái bối dây cao chưa hoàn thành (null, 0, hoặc 1)
    const canShow = this.isGiaCongCao && 
           (element.trang_thai_bd_cao === null || element.trang_thai_bd_cao === 0 || element.trang_thai_bd_cao === 1);
    
    console.log('canShowGiaCongCao:', {
      elementId: element.id,
      elementKyHieu: element.kyhieuquanday,
      isGiaCongCao: this.isGiaCongCao,
      trang_thai_bd_cao: element.trang_thai_bd_cao,
      canShow: canShow
    });
    
    return canShow;
  }

  // Logout user
  logout(): void {
    try {
      console.log('logout: Starting logout process...');
      this.authService.logout();
      console.log('logout: Logout successful, redirecting to login...');
      this.router.navigate(['/login']);
    } catch (error) {
      console.error('logout: Error during logout:', error);
      console.error('logout: Error details:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : 'Unknown'
      });
      this.showError('Lỗi khi đăng xuất');
    }
  }

  // Kiểm tra và cập nhật trạng thái xác thực
  private checkAndUpdateAuthStatus(): void {
    const isStillLoggedIn = this.authService.isLoggedIn();
    console.log('checkAndUpdateAuthStatus: Current auth status:', {
      isStillLoggedIn: isStillLoggedIn,
      wasAuthenticated: this.isAuthenticated
    });
    
    if (!isStillLoggedIn && this.isAuthenticated) {
      console.log('checkAndUpdateAuthStatus: User session expired, redirecting to login');
      this.isAuthenticated = false;
      this.currentUser = null;
      this.userRole = null;
      this.router.navigate(['/login']);
    }
  }

  openDialog(message: string): void {
    console.log('openDialog: Opening dialog with message:', message);
    this.dialog.open(DialogComponent, {
      data: { message: message }
    });
  }

  // Method để xử lý lỗi và hiển thị thông báo cho user
  private showError(message: string): void {
    console.error('showError:', message);
    
    // Hiển thị thông báo lỗi cho user
    this._snackBar.open(message, 'Đóng', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['error-snackbar']
    });
  }

  // Method để xử lý lỗi và hiển thị thông báo thành công
  private showSuccess(message: string): void {
    console.log('showSuccess:', message);
    
    // Hiển thị thông báo thành công cho user
    this._snackBar.open(message, 'Đóng', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['success-snackbar']
    });
  }

  // Lấy tên hiển thị của user
  getUserDisplayName(): string {
    if (!this.currentUser) {
      console.log('getUserDisplayName: currentUser is null, returning Unknown');
      return 'Unknown';
    }
    
    let displayName = 'Unknown';
    
    if (this.currentUser.firstName && this.currentUser.lastName) {
      displayName = `${this.currentUser.firstName} ${this.currentUser.lastName}`;
    } else if (this.currentUser.username) {
      displayName = this.currentUser.username;
    } else if (this.currentUser.email) {
      displayName = this.currentUser.email;
    }
    
    console.log('getUserDisplayName: Resolved display name:', displayName, 'from user data:', {
      firstName: this.currentUser.firstName,
      lastName: this.currentUser.lastName,
      username: this.currentUser.username,
      email: this.currentUser.email
    });
    
    return displayName;
  }

  // Lấy thông tin role hiển thị
  getRoleDisplayInfo(): string {
    if (!this.userRole) {
      console.log('getRoleDisplayInfo: userRole is null, returning empty string');
      return '';
    }
    
    let roleInfo = '';
    
    if (this.userRole.role_name) {
      roleInfo += this.userRole.role_name;
    }
    
    if (this.userRole.khau_sx) {
      if (roleInfo) roleInfo += ' - ';
      roleInfo += this.userRole.khau_sx;
    }
    
    console.log('getRoleDisplayInfo: Resolved role info:', roleInfo, 'from userRole:', this.userRole);
    
    return roleInfo;
  }

  // Kiểm tra xem user có được assign bảng vẽ này không
  private async checkUserDrawingAssignment(userId: string | number, bangveId: number): Promise<boolean> {
    try {
      console.log('checkUserDrawingAssignment: Checking assignment for userId:', userId, 'bangveId:', bangveId);
      console.log('checkUserDrawingAssignment: userId type:', typeof userId, 'bangveId type:', typeof bangveId);
      
      const apiUrl = `${this.commonService.getServerAPIURL()}api/Drawings/CheckUserAssignment`;
      const token = this.authService.getToken();
      
      if (!token) {
        console.log('checkUserDrawingAssignment: No token available');
        return false;
      }

      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      });
      
      const requestBody = {
        user_id: userId,
        bangve_id: bangveId
      };

      console.log('checkUserDrawingAssignment: Request body:', requestBody);
      console.log('checkUserDrawingAssignment: API URL:', apiUrl);

      const response = await this.http.post<{isAssigned: boolean}>(apiUrl, requestBody, { headers }).toPromise();
      const isAssigned = response?.isAssigned || false;
      
      console.log('checkUserDrawingAssignment: API response:', response, 'isAssigned:', isAssigned);
      console.log('checkUserDrawingAssignment: Response type:', typeof response);
      
      return isAssigned;
      
    } catch (error) {
      console.error('checkUserDrawingAssignment: Error checking assignment:', error);
      console.error('checkUserDrawingAssignment: Error details:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : 'Unknown'
      });
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
      console.log('shouldUserSeeData: Starting permission check for user:', this.currentUser.username);
      
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
      console.log('shouldUserSeeData: API URL:', apiUrl);
      
      // Gọi API để lấy tất cả assignment
      const response = await this.http.get<any[]>(apiUrl, { headers }).toPromise();
      console.log('shouldUserSeeData: All assignments from API:', response);
      console.log('shouldUserSeeData: Response type:', typeof response, 'Is array:', Array.isArray(response));
      
      if (!response || !Array.isArray(response)) {
        console.log('shouldUserSeeData: Invalid response from API');
        return false;
      }
      
      console.log('shouldUserSeeData: Total assignments from API:', response.length);
      
      // Kiểm tra xem user hiện tại có được assign bảng vẽ nào không
      const userAssignments = response.filter(assignment => {
        const assignmentUserId = assignment.user_id || assignment.userId;
        if (!assignmentUserId) {
          console.log('shouldUserSeeData: Assignment missing userId:', assignment);
          return false;
        }
        
        console.log('shouldUserSeeData: Comparing assignment userId:', assignmentUserId, 'with current userId:', currentUserId);
        
        // So sánh trực tiếp nếu cùng kiểu dữ liệu
        if (assignmentUserId === currentUserId) {
          console.log('shouldUserSeeData: Direct match found');
          return true;
        }
        
        // So sánh string nếu cần thiết
        const stringMatch = assignmentUserId.toString() === currentUserId.toString();
        console.log('shouldUserSeeData: String comparison result:', stringMatch);
        return stringMatch;
      });
      
      console.log('shouldUserSeeData: User assignments found:', userAssignments);
      console.log('shouldUserSeeData: User assignments count:', userAssignments.length);
      
      const hasAssignment = userAssignments.length > 0;
      console.log(`shouldUserSeeData: User ${this.currentUser.username} (${currentUserId}) has assignment: ${hasAssignment}`);
      
      return hasAssignment;
      
    } catch (error) {
      console.error('shouldUserSeeData: Error checking user assignment:', error);
      console.error('shouldUserSeeData: Error details:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : 'Unknown'
      });
      
      // Fallback: kiểm tra username và khau_sx
      if (this.currentUser.username || this.currentUser.khau_sx) {
        const username = (this.currentUser.username || '').toLowerCase();
        const khauSx = (this.currentUser.khau_sx || '').toLowerCase();
        
        console.log('shouldUserSeeData: Fallback check - username:', username, 'khau_sx:', khauSx);
        
        // Kiểm tra các pattern phổ biến cho user bối dây
        const usernameChecks = {
          includesBoiday: username.includes('boiday'),
          includesQuanday: username.includes('quanday'),
          exactBoidaycao1: username === 'boidaycao1',
          exactBoidayha1: username === 'boidayha1',
          exactBoidayha: username === 'boidayha'
        };
        
        const khauSxChecks = {
          includesBoiday: khauSx.includes('boiday'),
          includesQuanday: khauSx.includes('quanday'),
          includesHa: khauSx.includes('ha'),
          includesCao: khauSx.includes('cao')
        };
        
        console.log('shouldUserSeeData: Fallback username checks:', usernameChecks);
        console.log('shouldUserSeeData: Fallback khau_sx checks:', khauSxChecks);
        
        if (username.includes('boiday') || 
            username.includes('quanday') ||
            khauSx.includes('boiday') ||
            khauSx.includes('quanday') ||
            khauSx.includes('ha') ||
            khauSx.includes('cao') ||
            username === 'boidaycao1' || 
            username === 'boidayha1' ||
            username === 'boidayha') {
          console.log('shouldUserSeeData: Fallback to username/khau_sx check - allowing access');
          return true;
        }
      }
      
      console.log('shouldUserSeeData: Fallback check failed - denying access');
      return false;
    }
  }

  // Kiểm tra xem user có quyền xem dữ liệu này không
  private hasPermissionToViewData(data: QuanDayData): boolean {
    if (!this.currentUser) {
      console.log('hasPermissionToViewData: currentUser is null');
      return false;
    }
    
    // Nếu dữ liệu đến từ API GetUserAssignedDrawings, 
    // thì mặc định user đã có quyền xem (vì API đã filter rồi)
    // Chỉ cần kiểm tra thêm để đảm bảo an toàn
    const currentUsername = this.currentUser.username;
    const currentUserId = this.getUserId();
    
    const hasPermission = data.username === currentUsername || 
           data.user_create === currentUsername ||
           data.user_create === currentUserId ||
           data.username === currentUserId ||
           data.user_create === (currentUserId?.toString() || '') ||
           data.username === (currentUserId?.toString() || '');
    
    console.log('hasPermissionToViewData: Permission check result:', {
      dataId: data.id,
      dataKyHieu: data.kyhieuquanday,
      dataUsername: data.username,
      dataUserCreate: data.user_create,
      currentUsername: currentUsername,
      currentUserId: currentUserId,
      hasPermission: hasPermission,
      permissionChecks: {
        usernameMatch: data.username === currentUsername,
        userCreateUsernameMatch: data.user_create === currentUsername,
        userCreateIdMatch: data.user_create === currentUserId,
        usernameIdMatch: data.username === currentUserId,
        userCreateIdStringMatch: data.user_create === (currentUserId?.toString() || ''),
        usernameIdStringMatch: data.username === (currentUserId?.toString() || '')
      }
    });
    
    // Kiểm tra xem dữ liệu có được assign cho user này không
    // Dựa trên bảng tbl_user_bangve
    return hasPermission;
  }

  // Filter dữ liệu theo quyền của user
  private async filterDataByUserPermission<T extends QuanDayData>(data: T[]): Promise<T[]> {
    if (!this.currentUser) {
      console.log('filterDataByUserPermission: currentUser is null, returning empty array');
      return [];
    }
    
    try {
      console.log('filterDataByUserPermission: Starting permission filter for user:', this.currentUser.username);
      console.log('filterDataByUserPermission: Input data length:', data.length);
      
      // Nếu data đến từ API GetUserAssignedDrawings, thì mặc định user đã có quyền xem
      // vì API đã filter theo user_id rồi. Không cần filter thêm gì cả.
      if (data.length > 0) {
        console.log(`filterDataByUserPermission: User ${this.currentUser.username} - Data from GetUserAssignedDrawings API, returning all data without additional filtering`);
        return data;
      }
      
      // Nếu không có data từ API, kiểm tra xem user có được assign không
      console.log(`filterDataByUserPermission: User ${this.currentUser.username} - No data from API, checking if user has any assignments`);
      
      const shouldSeeData = await this.shouldUserSeeData();
      if (shouldSeeData) {
        console.log(`filterDataByUserPermission: User ${this.currentUser.username} được assign trong database, nhưng không có data từ API`);
        // Trả về array rỗng vì không có data từ API
        return [];
      } else {
        console.log(`filterDataByUserPermission: User ${this.currentUser.username} không được assign trong database`);
        return [];
      }
      
    } catch (error) {
      console.error('filterDataByUserPermission: Error checking user permission:', error);
      console.error('filterDataByUserPermission: Error details:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : 'Unknown'
      });
      
      // Fallback: trả về data nếu có lỗi (để tránh mất data)
      console.log('filterDataByUserPermission: Fallback - returning data due to error');
      return data;
    }
  }

  // Kiểm tra xem user có dữ liệu được assign không
  hasAssignedData(): boolean {
    const hasData = this.quanDays.length > 0 || this.completedQuanDays.length > 0;
    
    console.log('hasAssignedData: Check result:', {
      quanDaysLength: this.quanDays.length,
      completedQuanDaysLength: this.completedQuanDays.length,
      hasData: hasData
    });
    
    return hasData;
  }

  // Method để hiển thị thông báo khi không có data
  private showNoDataMessage(): void {
    if (this.quanDays.length === 0 && this.completedQuanDays.length === 0) {
      console.log('showNoDataMessage: No data available, showing message');
      // Có thể hiển thị thông báo cho user ở đây
    } else {
      console.log('showNoDataMessage: Data available, quanDays:', this.quanDays.length, 'completedQuanDays:', this.completedQuanDays.length);
    }
  }

  // Method để kiểm tra trạng thái data source
  private checkDataSourceStatus(): void {
    console.log('checkDataSourceStatus: Current data status:');
    console.log('- quanDays:', this.quanDays.length);
    console.log('- completedQuanDays:', this.completedQuanDays.length);
    console.log('- filteredQuanDays:', this.filteredQuanDays.length);
    console.log('- pagedNewQuanDays:', this.pagedNewQuanDays.length);
    console.log('- filteredCompletedQuanDays:', this.filteredCompletedQuanDays.length);
    console.log('- pagedCompletedQuanDays:', this.pagedCompletedQuanDays.length);
  }

  // Debug method để kiểm tra trạng thái component
  private debugComponentState(): void {
    console.log('=== DEBUG COMPONENT STATE ===');
    console.log('Current user:', this.currentUser);
    console.log('User role:', this.userRole);
    console.log('Is gia cong ha:', this.isGiaCongHa);
    console.log('Is gia cong cao:', this.isGiaCongCao);
    console.log('QuanDays array length:', this.quanDays.length);
    console.log('CompletedQuanDays array length:', this.completedQuanDays.length);
    console.log('FilteredQuanDays array length:', this.filteredQuanDays.length);
    console.log('PagedNewQuanDays array length:', this.pagedNewQuanDays.length);
    console.log('PagedCompletedQuanDays array length:', this.pagedCompletedQuanDays.length);
    
    if (this.quanDays.length > 0) {
      console.log('Sample quanDays data:', this.quanDays[0]);
    }
    
    if (this.completedQuanDays.length > 0) {
      console.log('Sample completedQuanDays data:', this.completedQuanDays[0]);
    }
    
    console.log('=== END DEBUG ===');
  }

  // Method để debug toàn bộ quá trình xử lý data
  private debugDataFlow(data: any[], mappedData: any[], filteredData: any[], finalQuanDays: any[], finalCompletedQuanDays: any[]): void {
    console.log('=== DEBUG DATA FLOW ===');
    console.log('1. Raw API data:', {
      length: data.length,
      sample: data.slice(0, 2),
      keys: data.length > 0 ? Object.keys(data[0]) : []
    });
    
    console.log('2. Mapped data:', {
      length: mappedData.length,
      sample: mappedData.slice(0, 2),
      keys: mappedData.length > 0 ? Object.keys(mappedData[0]) : []
    });
    
    console.log('3. After permission filter:', {
      length: filteredData.length,
      sample: filteredData.slice(0, 2)
    });
    
    console.log('4. Final quanDays:', {
      length: finalQuanDays.length,
      sample: finalQuanDays.slice(0, 2)
    });
    
    console.log('5. Final completedQuanDays:', {
      length: finalCompletedQuanDays.length,
      sample: finalCompletedQuanDays.slice(0, 2)
    });
    
    console.log('6. Current user info:', {
      username: this.currentUser?.username,
      userId: this.getUserId(),
      khau_sx: this.currentUser?.khau_sx,
      role: this.currentUser?.role
    });
    
    console.log('=== END DEBUG DATA FLOW ===');
  }

  // Method để kiểm tra xem data có được hiển thị đúng trên UI không
  private checkUIDisplayStatus(): void {
    console.log('=== CHECK UI DISPLAY STATUS ===');
    console.log('Data arrays status:');
    console.log('- quanDays:', this.quanDays.length, 'items');
    console.log('- completedQuanDays:', this.completedQuanDays.length, 'items');
    console.log('- filteredQuanDays:', this.filteredQuanDays.length, 'items');
    console.log('- pagedNewQuanDays:', this.pagedNewQuanDays.length, 'items');
    console.log('- filteredCompletedQuanDays:', this.filteredCompletedQuanDays.length, 'items');
    console.log('- pagedCompletedQuanDays:', this.pagedCompletedQuanDays.length, 'items');
    
    // Kiểm tra xem data có được map đúng không
    if (this.quanDays.length > 0) {
      console.log('Sample quanDays item:', this.quanDays[0]);
      console.log('Sample quanDays item keys:', Object.keys(this.quanDays[0]));
    }
    
    if (this.completedQuanDays.length > 0) {
      console.log('Sample completedQuanDays item:', this.completedQuanDays[0]);
      console.log('Sample completedQuanDays item keys:', Object.keys(this.completedQuanDays[0]));
    }
    
    // Kiểm tra xem UI có được update không
    console.log('Change detection status:');
    console.log('- ChangeDetectorRef injected:', !!this.cdr);
    
    console.log('=== END CHECK UI DISPLAY STATUS ===');
  }

  // Helper method để lấy drawings data từ API response một cách an toàn
  private extractDrawingsFromResponse(data: any): any[] {
    console.log('extractDrawingsFromResponse: Processing data:', data);
    console.log('extractDrawingsFromResponse: Data type:', typeof data);
    console.log('extractDrawingsFromResponse: Available keys:', data ? Object.keys(data) : 'No data');
    
    if (!data || typeof data !== 'object') {
      console.warn('extractDrawingsFromResponse: Invalid data input');
      return [];
    }
    
    // Kiểm tra cả 2 trường hợp: 'drawings' (chữ thường) và 'Drawings' (chữ hoa)
    if ('drawings' in data && Array.isArray(data.drawings)) {
      console.log('extractDrawingsFromResponse: Found drawings (lowercase):', data.drawings.length, 'items');
      return data.drawings;
    }
    
    if ('Drawings' in data && Array.isArray(data.Drawings)) {
      console.log('extractDrawingsFromResponse: Found Drawings (uppercase):', data.Drawings.length, 'items');
      return data.Drawings;
    }
    
    // Fallback: nếu data trực tiếp là array
    if (Array.isArray(data)) {
      console.log('extractDrawingsFromResponse: Data is directly an array:', data.length, 'items');
      return data;
    }
    
    console.warn('extractDrawingsFromResponse: No drawings array found in response');
    console.warn('extractDrawingsFromResponse: Response structure:', data);
    return [];
  }

  // Helper method để kiểm tra xem API response có thành công không
  private isApiResponseSuccessful(data: any): boolean {
    if (!data || typeof data !== 'object') {
      return false;
    }
    
    // Kiểm tra cả 2 trường hợp: 'isSuccess' (chữ thường) và 'IsSuccess' (chữ hoa)
    const isSuccess = data.isSuccess || data.IsSuccess;
    
    console.log('isApiResponseSuccessful: Checking response success:', {
      isSuccess: isSuccess,
      hasIsSuccess: 'isSuccess' in data,
      hasIsSuccessUpper: 'IsSuccess' in data,
      dataKeys: Object.keys(data)
    });
    
    return Boolean(isSuccess);
  }
}