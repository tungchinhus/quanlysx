import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { BangVeComponent } from '../bang-ve/bang-ve.component';
import { DialogComponent } from 'src/app/shared/dialogs/dialog/dialog.component';
import { GiaCongPopupComponent } from './gia-cong-popup/gia-cong-popup.component';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from 'src/app/shared/services/common.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthServices } from 'src/app/shared/services/authen/auth.service';

export interface BangVeData {
  id: number;
  kyhieubangve: string;
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
  trang_thai: number | null; // Thay đổi từ boolean thành number | null
  created_at: Date;
  username: string;
  email: string;
  role_name: string;  
}

export interface ProcessedBangVeData extends BangVeData {
  user_process: string;
  process_date: Date;
  process_status: string;
}

@Component({
  selector: 'app-ds-bangve',
  templateUrl: './ds-bangve.component.html',
  styleUrls: ['./ds-bangve.component.scss']
})
export class DsBangveComponent implements OnInit {
  drawings: BangVeData[] = [];
  processedDrawings: ProcessedBangVeData[] = [];
  inProgressDrawings: BangVeData[] = []; // Thêm danh sách bảng vẽ đang gia công

  displayedColumns: string[] = ['kyhieubangve', 'congsuat', 'tbkt', 'dienap', 'created_at', 'actions'];
  displayedColumnsInProgress: string[] = ['kyhieubangve', 'congsuat', 'tbkt', 'dienap', 'created_at', 'actions']; // Cột cho tab đang gia công
  displayedColumnsProcessed: string[] = ['kyhieubangve', 'congsuat', 'tbkt', 'dienap', 'process_date','actions'];
  
  // New drawings properties
  searchTerm: string = '';
  filteredDrawings: BangVeData[] = [];
  pagedNewDrawings: BangVeData[] = [];
  
  // Processed drawings properties
  searchTermProcessed: string = '';
  filteredProcessedDrawings: ProcessedBangVeData[] = [];
  pagedProcessedDrawings: ProcessedBangVeData[] = [];

  // In Progress drawings properties
  searchTermInProgress: string = ''; // Tìm kiếm cho tab đang gia công
  filteredInProgressDrawings: BangVeData[] = [];
  pagedInProgressDrawings: BangVeData[] = [];

  pageSize = 5;
  pageIndex = 0;
  pageIndexInProgress = 0; // Page index cho tab đang gia công
  currentTabIndex = 0;
  
  // Autocomplete properties
  filteredOptions: string[] = [];
  filteredDrawingsForAutocomplete: BangVeData[] = [];
  filteredProcessedDrawingsForAutocomplete: ProcessedBangVeData[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  dataSource: BangVeData[] = [];

  // Danh sách người dùng giả lập
  availableUsers: string[] = ['user_quanday_1', 'user_quanday_2', 'user_quanday_3', 'user_quanday_4', 'user_quanday_5'];
  userRole: string | null = null;
  username: string | null = null;
  khau_sx: string | null = null;

  constructor(
    public dialog: MatDialog,
    private _snackBar: MatSnackBar,
    private router:Router,
    private commonService: CommonService,
    private http: HttpClient,
    private authService: AuthServices
  ) { }

  ngOnInit(): void {
    // Lấy thông tin user từ getUserInfo() trước, sau đó fallback về localStorage
    const userInfo = this.authService.getUserInfo();
    this.userRole = userInfo?.roles?.[0] || localStorage.getItem('userRole');
    this.username = userInfo?.username || localStorage.getItem('username');
    this.khau_sx = userInfo?.khau_sx || localStorage.getItem('khau_sx');
    
    console.log('User info from getUserInfo():', userInfo);
    console.log('khau_sx from userInfo:', userInfo?.khau_sx);
    console.log('khau_sx from localStorage:', localStorage.getItem('khau_sx'));
    console.log('Final khau_sx value:', this.khau_sx);
    
    // Debug khau_sx functionality
    this.debugKhauSxFunctionality();
    
    // Kiểm tra authentication trước khi load data
    this.checkAuthentication();
    
    // Test API connectivity
    this.testApiConnectivity();
    
    // Kiểm tra quyền của user
    this.checkUserPermissions();
  }

  // Method để debug khau_sx functionality
  private debugKhauSxFunctionality(): void {
    console.log('=== DEBUG khau_sx FUNCTIONALITY ===');
    console.log('Current khau_sx:', this.khau_sx);
    console.log('Is admin/manager?', this.hasAdminOrManagerRole());
    
    if (this.khau_sx) {
      console.log('khau_sx is defined, will redirect based on value');
      switch (this.khau_sx.toLowerCase()) {
        case 'boidayha':
          console.log('User will be redirected to boi-day-ha page');
          break;
        case 'boidaycao':
          console.log('User will be redirected to boi-day-cao page');
          break;
        case 'boidayep':
          console.log('User will see boidayep message');
          break;
        case 'admin':
          console.log('User is admin/manager, no redirection needed');
          break;
        default:
          console.log('Unknown khau_sx value, user will see warning');
      }
    } else {
      console.log('khau_sx is undefined, user will see error message');
    }
    console.log('=== END DEBUG ===');
  }

  // Method để kiểm tra authentication
  checkAuthentication(): void {
    const token = this.authService.getToken();
    const isLoggedIn = this.authService.isLoggedIn();
    
    console.log('=== Authentication Check ===');
    console.log('Token exists:', !!token);
    console.log('Token value:', token);
    console.log('IsLoggedIn:', isLoggedIn);
    console.log('UserRole:', this.userRole);
    console.log('Username:', this.username);
    console.log('Khau_sx:', this.khau_sx);
    console.log('localStorage accessToken:', localStorage.getItem('accessToken'));
    console.log('localStorage idToken:', localStorage.getItem('idToken'));
    console.log('All localStorage keys:', Object.keys(localStorage));
    
    if (!token || !isLoggedIn) {
      console.log('User not authenticated, showing mock data');
      this.thongbao('Vui lòng đăng nhập để xem dữ liệu thực tế', 'Đóng', 'warning');
      // Load mock data thay vì gọi API
      //this.initializeMockDrawings();
      //this.initializeMockProcessedDrawings();
    } else {
      console.log('User authenticated, loading real data from API');
      // Load data từ API
      this.loadDrawings();
      this.loadProcessedDrawings();
    }
  }

  // Method để kiểm tra quyền admin hoặc manager
  hasAdminOrManagerRole(): boolean {
    const userInfo = this.authService.getUserInfo();
    
    // Kiểm tra từ userInfo trước
    if (userInfo?.roles) {
      const hasAdminRole = userInfo.roles.includes('admin') || userInfo.roles.includes('manager');
      if (hasAdminRole) {
        return true;
      }
    }
    
    // Kiểm tra từ localStorage
    const role = localStorage.getItem('role');
    const hasAdminRole = role === 'admin' || role === 'manager';
    
    // Kiểm tra thêm từ khau_sx
    const hasAdminKhauSx = this.khau_sx === 'admin';
    
    return hasAdminRole || hasAdminKhauSx;
  }

  // Method để hiển thị thông báo không có quyền
  showPermissionDeniedMessage(): void {
    this.thongbao('Bạn không có quyền thực hiện chức năng này. Chỉ admin hoặc manager mới có quyền thêm bảng vẽ mới.', 'Đóng', 'error');
  }

  // Method để kiểm tra và hiển thị thông tin quyền của user
  checkUserPermissions(): void {
    const userInfo = this.authService.getUserInfo();
    const userRole = localStorage.getItem('role');
    const roles = userInfo?.roles || [];
  }

  // Test API connectivity
  testApiConnectivity(): void {
    console.log('Testing API connectivity...');
    const token = this.authService.getToken();
    
    if (!token || token === 'null' || token === 'undefined' || token.trim() === '') {
      console.log('No valid token available for API test');
      return;
    }
    
    // Test basic connectivity to the API base URL
    const testUrl = 'https://localhost:7190/api/Account/login';
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${token}`)
      .set('Content-Type', 'application/json');
    
    console.log('Testing connectivity to:', testUrl);
    this.http.get(testUrl, { headers }).subscribe({
      next: (response) => {
        console.log('API connectivity test successful:', response);
      },
      error: (error) => {
        console.error('API connectivity test failed:', error);
      }
    });
  }

  // API methods
  loadDrawings(): void {
    this.getDrawings().subscribe({
      next: (drawings) => {
        // Đảm bảo drawings là array
        if (!Array.isArray(drawings)) {
          console.warn('loadDrawings: API returned non-array data, using empty array');
          drawings = [];
        }
        
        // Phân loại bảng vẽ theo trang_thai
        this.categorizeDrawings(drawings);
        
        // Cập nhật filtered lists
        this.filterNewDrawings();
        this.filterInProgressDrawings();
        this.filterProcessedDrawings();
        
        // Reset pagination về trang đầu tiên
        this.pageIndex = 0;
        this.pageIndexInProgress = 0;
        
        // Cập nhật paged lists
        this.updatePagedNewDrawings();
        this.updatePagedInProgressDrawings();
        this.updatePagedProcessedDrawings();
        
        console.log('Drawings loaded and categorized:', {
          total: drawings.length,
          new: this.drawings.length,
          inProgress: this.inProgressDrawings.length,
          processed: this.processedDrawings.length
        });
      },
      error: (error) => {
        console.error('Lỗi khi tải danh sách bảng vẽ:', error);
        this.thongbao('Có lỗi xảy ra khi tải danh sách bảng vẽ. Vui lòng thử lại.', 'Đóng', 'error');
      }
    });
  }

  // Method mới: Phân loại bảng vẽ theo trang_thai
  private categorizeDrawings(drawings: BangVeData[]): void {
    // Đảm bảo drawings là array
    if (!Array.isArray(drawings)) {
      console.warn('categorizeDrawings: drawings is not an array, using empty array');
      drawings = [];
    }
    
    // Bảng vẽ mới: trang_thai = null hoặc empty
    this.drawings = drawings.filter(drawing => 
      !drawing.trang_thai || drawing.trang_thai === null || drawing.trang_thai === undefined
    );
    
    // Bảng vẽ đang gia công: trang_thai = 1
    this.inProgressDrawings = drawings.filter(drawing => 
      drawing.trang_thai === 1
    );
    
    // Bảng vẽ đã xử lý: trang_thai = 2
    this.processedDrawings = drawings.filter(drawing => 
      drawing.trang_thai === 2
    ).map(drawing => ({
      ...drawing,
      user_process: drawing.user_create || 'Unknown',
      process_date: drawing.created_at || new Date(),
      process_status: 'Completed'
    }));
    
    // Đảm bảo tất cả đều là array
    if (!Array.isArray(this.drawings)) this.drawings = [];
    if (!Array.isArray(this.inProgressDrawings)) this.inProgressDrawings = [];
    if (!Array.isArray(this.processedDrawings)) this.processedDrawings = [];
    
    console.log('Drawings categorized:', {
      total: drawings.length,
      new: this.drawings.length,
      inProgress: this.inProgressDrawings.length,
      processed: this.processedDrawings.length
    });
  }

  // Method mới: Filter bảng vẽ mới
  private filterNewDrawings(): void {
    // Đảm bảo drawings là array
    if (!Array.isArray(this.drawings)) {
      console.warn('filterNewDrawings: drawings is not an array, using empty array');
      this.drawings = [];
    }
    
    if (!this.searchTerm) {
      this.filteredDrawings = [...this.drawings];
    } else {
      this.filteredDrawings = this.drawings.filter(drawing =>
        drawing.kyhieubangve.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        drawing.tbkt.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        drawing.soboiday.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }
  }

  // Method mới: Filter bảng vẽ đang gia công
  private filterInProgressDrawings(): void {
    // Đảm bảo inProgressDrawings là array
    if (!Array.isArray(this.inProgressDrawings)) {
      console.warn('filterInProgressDrawings: inProgressDrawings is not an array, using empty array');
      this.inProgressDrawings = [];
    }
    
    if (!this.searchTermInProgress) {
      this.filteredInProgressDrawings = [...this.inProgressDrawings];
    } else {
      this.filteredInProgressDrawings = this.inProgressDrawings.filter(drawing =>
        drawing.kyhieubangve.toLowerCase().includes(this.searchTermInProgress.toLowerCase()) ||
        drawing.tbkt.toLowerCase().includes(this.searchTermInProgress.toLowerCase()) ||
        drawing.soboiday.toLowerCase().includes(this.searchTermInProgress.toLowerCase())
      );
    }
  }

  // Method mới: Filter bảng vẽ đã xử lý
  private filterProcessedDrawings(): void {
    // Đảm bảo processedDrawings là array
    if (!Array.isArray(this.processedDrawings)) {
      console.warn('filterProcessedDrawings: processedDrawings is not an array, using empty array');
      this.processedDrawings = [];
    }
    
    if (!this.searchTermProcessed) {
      this.filteredProcessedDrawings = [...this.processedDrawings];
    } else {
      this.filteredProcessedDrawings = this.processedDrawings.filter(drawing =>
        drawing.kyhieubangve.toLowerCase().includes(this.searchTermProcessed.toLowerCase()) ||
        drawing.tbkt.toLowerCase().includes(this.searchTermProcessed.toLowerCase()) ||
        drawing.soboiday.toLowerCase().includes(this.searchTermProcessed.toLowerCase())
      );
    }
  }

  // Method mới: Cập nhật paged list cho bảng vẽ đang gia công
  private updatePagedInProgressDrawings(): void {
    // Đảm bảo filteredInProgressDrawings là array
    if (!Array.isArray(this.filteredInProgressDrawings)) {
      console.warn('updatePagedInProgressDrawings: filteredInProgressDrawings is not an array, using empty array');
      this.filteredInProgressDrawings = [];
    }
    
    const startIndex = this.pageIndexInProgress * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.pagedInProgressDrawings = this.filteredInProgressDrawings.slice(startIndex, endIndex);
  }

  loadProcessedDrawings(): void {
    // Debug: Kiểm tra token và thông tin user
    const token = this.authService.getToken();
    const isLoggedIn = this.authService.isLoggedIn();
    console.log('Debug - Token (Processed):', token);
    console.log('Debug - IsLoggedIn (Processed):', isLoggedIn);

    // Kiểm tra token trước khi gọi API
    if (!token) {
      console.error('No authentication token found for processed drawings');
      console.log('User needs to login first for processed drawings');
      // Không hiển thị error message vì đã được xử lý trong checkAuthentication()
      this.initializeMockProcessedDrawings();
      return;
    }

    this.getProcessedDrawings().subscribe({
      next: (data: ProcessedBangVeData[]) => {
        // Đảm bảo data là array
        this.processedDrawings = Array.isArray(data) ? data : [];
        this.filteredProcessedDrawings = [...this.processedDrawings];
        this.updatePagedProcessedDrawings();
        this.filteredProcessedDrawingsForAutocomplete = [...this.processedDrawings];
        console.log('Processed drawings loaded from API:', this.processedDrawings);
      },
      error: (error) => {
        console.error('Error loading processed drawings:', error);
        console.error('Error status:', error.status);
        console.error('Error message:', error.message);
        console.error('Error details:', error.error);
        
        // Xử lý lỗi authentication
        if (error.status === 401) {
          this.thongbao('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại', 'Đóng', 'error');
          // Có thể redirect về trang login
          this.router.navigate(['/landing']);
        } else if (error.status === 400) {
          console.error('Bad Request - Check API parameters for processed drawings');
          this.thongbao('Lỗi tham số API khi tải danh sách bảng vẽ đã xử lý', 'Đóng', 'error');
        } else if (error.status === 500) {
          console.error('Internal Server Error - Server issue for processed drawings');
          this.thongbao('Lỗi máy chủ khi tải danh sách bảng vẽ đã xử lý', 'Đóng', 'error');
        } else {
          this.thongbao('Lỗi khi tải danh sách bảng vẽ đã xử lý', 'Đóng', 'error');
        }
        
        // Fallback to mock data
        this.initializeMockProcessedDrawings();
      }
    });
  }

  getDrawings(): Observable<BangVeData[]> {
    // Replace with your actual API endpoint
    const apiUrl = `${this.commonService.getServerAPIURL()}api/Drawings/GetDrawings`;
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${this.authService.getToken()}`)
      .set('Content-Type', 'application/json');
    
    // Add common query parameters that might be expected
    const params = {
      page: '1',
      pageSize: '10',
      sortBy: 'created_at',
      sortOrder: 'desc'
    };
    
    console.log('Calling GetDrawings API with token:', this.authService.getToken());
    console.log('API URL:', apiUrl);
    console.log('Headers:', headers);
    console.log('Params:', params);
    
    // First try with parameters
    return this.http.get<BangVeData[]>(apiUrl, { headers, params }).pipe(
      catchError((error) => {
        console.log('First attempt failed, trying without parameters...');
        // If first attempt fails, try without parameters
        return this.http.get<BangVeData[]>(apiUrl, { headers });
      })
    );
  }

  getProcessedDrawings(): Observable<ProcessedBangVeData[]> {
    // Replace with your actual API endpoint
    const apiUrl = `${this.commonService.getServerAPIURL()}api/Drawings/GetProcessedDrawings`;
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${this.authService.getToken()}`)
      .set('Content-Type', 'application/json');
    
    // Add common query parameters that might be expected
    const params = {
      page: '1',
      pageSize: '10',
      sortBy: 'process_date',
      sortOrder: 'desc'
    };
    
    console.log('Calling GetProcessedDrawings API with token:', this.authService.getToken());
    console.log('API URL:', apiUrl);
    console.log('Headers:', headers);
    console.log('Params:', params);
    
    // First try with parameters
    return this.http.get<ProcessedBangVeData[]>(apiUrl, { headers, params }).pipe(
      catchError((error) => {
        console.log('First attempt failed, trying without parameters...');
        // If first attempt fails, try without parameters
        return this.http.get<ProcessedBangVeData[]>(apiUrl, { headers });
      })
    );
  }

  // API method để thêm mới bảng vẽ
  addNewDrawing(drawingData: BangVeData): Observable<BangVeData> {
    const apiUrl = `${this.commonService.getServerAPIURL()}api/Drawings/AddDrawing`;
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${this.authService.getToken()}`)
      .set('Content-Type', 'application/json');
    
    // Lấy thông tin user hiện tại
    const userInfo = this.authService.getUserInfo();
    const currentUserId = userInfo?.userId || localStorage.getItem('userId') || 'unknown';
    const currentUsername = userInfo?.username || localStorage.getItem('username') || 'unknown';
    
    // Chuẩn bị dữ liệu để gửi lên API
    const requestData = {
      kyhieubangve: drawingData.kyhieubangve,
      congsuat: drawingData.congsuat,
      tbkt: drawingData.tbkt,
      dienap: drawingData.dienap,
      soboiday: drawingData.soboiday,
      bd_ha_trong: drawingData.bd_ha_trong,
      bd_ha_ngoai: drawingData.bd_ha_ngoai,
      bd_cao: drawingData.bd_cao,
      bd_ep: drawingData.bd_ep,
      bung_bd: drawingData.bung_bd,
      user_create: currentUsername,
      trang_thai: null, // Bảng vẽ mới có trang_thai = null
      created_at: new Date().toISOString(),
      username: currentUsername,
      email: userInfo?.email || '',
      role_name: userInfo?.roles?.[0] || localStorage.getItem('role') || 'user'
    };
    
    console.log('Calling AddDrawing API with data:', requestData);
    console.log('API URL:', apiUrl);
    console.log('Headers:', headers);
    
    return this.http.post<BangVeData>(apiUrl, requestData, { headers }).pipe(
      catchError((error) => {
        console.error('Error adding new drawing:', error);
        throw error;
      })
    );
  }

  // API method để cập nhật bảng vẽ
  updateDrawing(drawingData: BangVeData): Observable<BangVeData> {
    const apiUrl = `https://localhost:7190/api/Drawings/UpdateDrawing/${drawingData.id}`;
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${this.authService.getToken()}`)
      .set('Content-Type', 'application/json');
    
    // Chuẩn bị dữ liệu để gửi lên API
    const requestData = {
      id: drawingData.id,
      kyhieubangve: drawingData.kyhieubangve,
      congsuat: drawingData.congsuat,
      tbkt: drawingData.tbkt,
      dienap: drawingData.dienap,
      soboiday: drawingData.soboiday,
      bd_ha_trong: drawingData.bd_ha_trong,
      bd_ha_ngoai: drawingData.bd_ha_ngoai,
      bd_cao: drawingData.bd_cao,
      bd_ep: drawingData.bd_ep,
      bung_bd: drawingData.bung_bd,
      user_create: drawingData.user_create,
      trang_thai: drawingData.trang_thai,
      created_at: drawingData.created_at
    };
    
    console.log('Calling UpdateDrawing API with data:', requestData);
    console.log('API URL:', apiUrl);
    console.log('Headers:', headers);
    
    return this.http.put<BangVeData>(apiUrl, requestData, { headers });
  }

  // API method để xóa bảng vẽ
  deleteDrawing(drawingId: number): Observable<any> {
    const apiUrl = `https://localhost:7190/api/Drawings/DeleteDrawing/${drawingId}`;
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${this.authService.getToken()}`)
      .set('Content-Type', 'application/json');
    
    console.log('Calling DeleteDrawing API for ID:', drawingId);
    console.log('API URL:', apiUrl);
    console.log('Headers:', headers);
    
    return this.http.delete(apiUrl, { headers });
  }

  // API method để gia công bảng vẽ
  processDrawingApi(drawingId: number, userQuanday1: string, userQuanday2: string): Observable<any> {
    const apiUrl = `https://localhost:7190/api/Drawings/ProcessDrawing/${drawingId}`;
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${this.authService.getToken()}`)
      .set('Content-Type', 'application/json');
    
    const requestData = {
      drawingId: drawingId,
      userQuanday1: userQuanday1,
      userQuanday2: userQuanday2,
      processDate: new Date().toISOString(),
      processStatus: 'Processing'
    };
    
    console.log('Calling ProcessDrawing API with data:', requestData);
    console.log('API URL:', apiUrl);
    console.log('Headers:', headers);
    
    return this.http.post(apiUrl, requestData, { headers });
  }

  // Fallback methods with mock data
  initializeMockDrawings(): void {
    this.drawings = [
      {
        id: 1,
        kyhieubangve: 'BV-001',
        congsuat: 250,
        tbkt: 'TBKT-01',
        dienap: '22kV',
        soboiday: '3',
        bd_ha_trong: 'OK',
        bd_ha_ngoai: 'OK',
        bd_cao: 'OK',
        bd_ep: 'OK',
        bung_bd: 1,
        user_create: 'admin',
        trang_thai: 1,
        username: 'boidayha',
        email: 'quandayha1@thibidi.com',
        role_name: 'user',
        created_at: new Date('2024-07-01')
      },
      {
        id: 2,
        kyhieubangve: 'BV-002',
        congsuat: 400,
        tbkt: 'TBKT-02',
        dienap: '35kV',
        soboiday: '4',
        bd_ha_trong: 'OK',
        bd_ha_ngoai: 'Chưa',
        bd_cao: 'OK',
        bd_ep: 'Chưa',
        bung_bd: 0,
        user_create: 'user1',
        trang_thai: null,
        username: 'boidayha',
        email: 'quandayha1@thibidi.com',
        role_name: 'user',
        created_at: new Date('2024-07-10')
      },
      {
        id: 3,
        kyhieubangve: 'BV-003',
        congsuat: 630,
        tbkt: 'TBKT-03',
        dienap: '10kV',
        soboiday: '5',
        bd_ha_trong: 'OK',
        bd_ha_ngoai: 'OK',
        bd_cao: 'Chưa',
        bd_ep: 'OK',
        bung_bd: 1,
        user_create: 'user2',
        trang_thai: 1,
        username: 'boidaycao',
        email: 'quandaycao1@thibidi.com',
        role_name: 'user',
        created_at: new Date('2024-07-15')
      }
    ];
    this.filteredDrawings = [...this.drawings];
    this.updatePagedNewDrawings();
    this.filteredDrawingsForAutocomplete = [...this.drawings];
  }

  initializeMockProcessedDrawings(): void {
    this.processedDrawings = [
      {
        id: 101,
        kyhieubangve: 'BV-101',
        congsuat: 250,
        tbkt: 'TBKT-01',
        dienap: '22kV',
        soboiday: '3',
        bd_ha_trong: 'OK',
        bd_ha_ngoai: 'OK',
        bd_cao: 'OK',
        bd_ep: 'OK',
        bung_bd: 1,
        user_create: 'admin',
        trang_thai: 2,
        username: 'boidayha',
        email: 'quandayha1@thibidi.com',
        role_name: 'user',
        created_at: new Date('2024-06-01'),
        user_process: 'worker1',
        process_date: new Date('2024-06-15'),
        process_status: 'completed'
      },
      {
        id: 102,
        kyhieubangve: 'BV-102',
        congsuat: 400,
        tbkt: 'TBKT-02',
        dienap: '35kV',
        soboiday: '4',
        bd_ha_trong: 'OK',
        bd_ha_ngoai: 'OK',
        bd_cao: 'OK',
        bd_ep: 'OK',
        bung_bd: 1,
        user_create: 'user1',
        trang_thai: 2,
        username: 'boidayha',
        email: 'quandayha1@thibidi.com',
        role_name: 'user',
        created_at: new Date('2024-06-05'),
        user_process: 'worker2',
        process_date: new Date('2024-06-20'),
        process_status: 'completed'
      }
    ];
    this.filteredProcessedDrawings = [...this.processedDrawings];
    this.updatePagedProcessedDrawings();
    this.filteredProcessedDrawingsForAutocomplete = [...this.processedDrawings];
  }

  // Tab management
  onTabChange(event: any): void {
    this.currentTabIndex = event.index;
    console.log('Tab changed to index:', this.currentTabIndex);
    
    // Reset page index khi chuyển tab
    if (this.currentTabIndex === 0) {
      // Tab "Bảng vẽ mới"
      this.pageIndex = 0;
      this.updatePagedNewDrawings();
    } else if (this.currentTabIndex === 1) {
      // Tab "Đang gia công"
      this.pageIndexInProgress = 0;
      this.updatePagedInProgressDrawings();
    } else if (this.currentTabIndex === 2) {
      // Tab "Bảng vẽ đã xử lý"
      this.pageIndex = 0;
      this.updatePagedProcessedDrawings();
    }
    
    // Reset search terms khi chuyển tab
    this.searchTerm = '';
    this.searchTermInProgress = '';
    this.searchTermProcessed = '';
  }

  // New drawings methods
  filterAutoComplete() {
    if (this.searchTerm) {
      this.filteredDrawingsForAutocomplete = this.drawings.filter(drawing =>
        drawing.kyhieubangve.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        drawing.tbkt.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    } else {
      this.filteredDrawingsForAutocomplete = [...this.drawings];
    }
  }

  displayFn = (drawing: BangVeData): string => {
    return drawing ? drawing.kyhieubangve : '';
  }

  onAutoCompleteSelected(event: any) {
    this.searchTerm = event.option.value.kyhieubangve;
    this.searchNewDrawings();
  }

  searchNewDrawings() {
    if (this.searchTerm) {
      this.filteredDrawings = this.drawings.filter(drawing =>
        drawing.kyhieubangve.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        drawing.tbkt.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    } else {
      this.filteredDrawings = [...this.drawings];
    }
    this.updatePagedNewDrawings();
  }

  updatePagedNewDrawings() {
    const startIndex = this.pageIndex * this.pageSize;
    this.pagedNewDrawings = this.filteredDrawings.slice(startIndex, startIndex + this.pageSize);
  }

  onNewDrawingsPageChange(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updatePagedNewDrawings();
  }

  // Processed drawings methods
  filterAutoCompleteProcessed() {
    if (this.searchTermProcessed) {
      this.filteredProcessedDrawingsForAutocomplete = this.processedDrawings.filter(drawing =>
        drawing.kyhieubangve.toLowerCase().includes(this.searchTermProcessed.toLowerCase()) ||
        drawing.tbkt.toLowerCase().includes(this.searchTermProcessed.toLowerCase())
      );
    } else {
      this.filteredProcessedDrawingsForAutocomplete = [...this.processedDrawings];
    }
  }

  displayFnProcessed = (drawing: ProcessedBangVeData): string => {
    return drawing ? drawing.kyhieubangve : '';
  }

  onAutoCompleteSelectedProcessed(event: any) {
    this.searchTermProcessed = event.option.value.kyhieubangve;
    this.searchProcessedDrawings();
  }

  searchProcessedDrawings() {
    if (this.searchTermProcessed) {
      this.filteredProcessedDrawings = this.processedDrawings.filter(drawing =>
        drawing.kyhieubangve.toLowerCase().includes(this.searchTermProcessed.toLowerCase()) ||
        drawing.tbkt.toLowerCase().includes(this.searchTermProcessed.toLowerCase())
      );
    } else {
      this.filteredProcessedDrawings = [...this.processedDrawings];
    }
    this.updatePagedProcessedDrawings();
  }

  updatePagedProcessedDrawings() {
    const startIndex = this.pageIndex * this.pageSize;
    this.pagedProcessedDrawings = this.filteredProcessedDrawings.slice(startIndex, startIndex + this.pageSize);
  }

  onProcessedDrawingsPageChange(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updatePagedProcessedDrawings();
  }

  // View processed details
  onViewProcessedDetails(drawing: ProcessedBangVeData): void {
    // Implement view processed details logic
    console.log('View processed details:', drawing);
  }

  addDrawing() {
    console.log('Drawing added');
  }
  editDrawing(d: BangVeData) {
    console.log('Drawing edited', d);
  }

  onGiaCong(drawing: BangVeData): void {
    // Kiểm tra quyền admin hoặc manager
    if (!this.hasAdminOrManagerRole()) {
      // Nếu không phải admin/manager, tự động chuyển trang dựa trên khau_sx
      this.redirectBasedOnKhauSx(drawing);
      return;
    }

    // Mở popup để user chọn workers
    const dialogRef = this.dialog.open(GiaCongPopupComponent, {
      width: '500px',
      data: { drawing }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('Popup closed with result:', result);
      console.log('Result type:', typeof result);
      console.log('Result confirmed:', result?.confirmed);
      console.log('Result boiDayHa:', result?.boiDayHa);
      console.log('Result boiDayCao:', result?.boiDayCao);
      
      if (result && result.confirmed) {
        console.log('Calling assignDrawingToUsers...');
        // Gọi API assign-drawing-to-user khi user xác nhận
        this.assignDrawingToUsers(drawing, result.boiDayHa, result.boiDayCao);
      } else {
        console.log('Popup closed without confirmation or invalid result');
      }
    });
  }

  // Method mới: Gán bảng vẽ cho users sử dụng API assign-drawing-to-user
  private assignDrawingToUsers(drawing: BangVeData, boiDayHa: any, boiDayCao: any): void {
    // Kiểm tra xem có chọn đủ 2 workers không
    if (!boiDayHa || !boiDayCao) {
      this.thongbao('Vui lòng chọn đủ 2 người gia công.', 'Đóng', 'warning');
      return;
    }

    // Validation về trùng lặp đã được xử lý trong popup, không cần kiểm tra lại ở đây
    // Chỉ cần kiểm tra cơ bản để đảm bảo an toàn

    // Lấy thông tin user hiện tại
    const currentUser = this.authService.getUserInfo();
    const currentUserId = currentUser?.userId || localStorage.getItem('userId') || 'unknown';
    
    console.log('Current user info:', currentUser);
    console.log('Current user ID from auth service:', currentUser?.userId);
    console.log('Current user ID from localStorage:', localStorage.getItem('userId'));
    console.log('Final currentUserId:', currentUserId);
    
    // Tạo request body theo format API yêu cầu
    const requestBody = {
      userId_boidayha: boiDayHa.userId?.toString() || boiDayHa.id?.toString(),
      userId_boidaycao: boiDayCao.userId?.toString() || boiDayCao.id?.toString(),
      bangVeId: drawing.id,
      permissionType: "gia_cong", // Loại quyền
      status: true, // Trạng thái active
      assignedAt: new Date().toISOString(),
      assignedByUserId: currentUserId
    };

    console.log('Assigning drawing to users with request:', requestBody);
    console.log('Selected workers:', { 
      boidayha: { 
        id: boiDayHa.id, 
        userId: boiDayHa.userId,
        name: boiDayHa.name, 
        email: boiDayHa.email 
      },
      boidaycao: { 
        id: boiDayCao.id, 
        userId: boiDayCao.userId,
        name: boiDayCao.name, 
        email: boiDayCao.email 
      }
    });

    // Gọi API assign-drawing-to-user
    this.callAssignDrawingAPI(requestBody, drawing).subscribe({
      next: (response) => {
        console.log('Drawing assigned successfully:', response);
        this.thongbao('Gia công bảng vẽ thành công!', 'Đóng', 'success');
        
        // Cập nhật trạng thái bảng vẽ trong danh sách
        this.updateDrawingStatus(drawing.id, true);
        
        // Cập nhật trạng thái thành "đang gia công" (1)
        this.updateDrawingStatusToInProgress(drawing.id);
        
        // Refresh danh sách bảng vẽ
        this.loadDrawings();
      },
      error: (error) => {
        if(error.error.errors.length > 0) {
          this.thongbao('Bảng vẽ đã được chuyển qua khâu sản xuất trước đó.', 'Đóng','info');
        } else {
          this.thongbao('Có lỗi xảy ra khi gia công bảng vẽ. Vui lòng thử lại.', 'Đóng', 'error');
        }        
      }
    });
  }

  // Method để gọi API assign-drawing-to-user
  private callAssignDrawingAPI(requestBody: any, drawing: BangVeData): Observable<any> {
    const apiUrl = `${this.commonService.getServerAPIURL()}api/Drawings/assign-drawing-to-user`;
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${this.authService.getToken()}`)
      .set('Content-Type', 'application/json');

    return this.http.post(apiUrl, requestBody, { headers });
  }

  // Method để cập nhật trạng thái bảng vẽ
  private updateDrawingStatus(drawingId: number, isProcessed: boolean): void {
    const drawingIndex = this.drawings.findIndex(d => d.id === drawingId);
    if (drawingIndex !== -1) {
      this.drawings[drawingIndex].trang_thai = isProcessed ? 1 : null;
      
      // Cập nhật filtered lists
      const filteredIndex = this.filteredDrawings.findIndex(d => d.id === drawingId);
      if (filteredIndex !== -1) {
        this.filteredDrawings[filteredIndex].trang_thai = isProcessed ? 1 : null;
      }
    }
  }

  // Method mới: Cập nhật trạng thái bảng vẽ thành "đang gia công" (1)
  private updateDrawingStatusToInProgress(drawingId: number): void {
    // Tìm bảng vẽ trong danh sách mới
    const drawingIndex = this.drawings.findIndex(d => d.id === drawingId);
    if (drawingIndex !== -1) {
      const drawing = this.drawings[drawingIndex];
      drawing.trang_thai = 1;
      
      // Cập nhật filtered lists
      const filteredIndex = this.filteredDrawings.findIndex(d => d.id === drawingId);
      if (filteredIndex !== -1) {
        this.filteredDrawings[filteredIndex].trang_thai = 1;
      }
      
      // Chuyển bảng vẽ từ danh sách mới sang danh sách đang gia công
      this.drawings.splice(drawingIndex, 1);
      this.inProgressDrawings.push(drawing);
      
      // Cập nhật filtered lists
      this.filteredDrawings = this.filteredDrawings.filter(d => d.id !== drawingId);
      this.filteredInProgressDrawings.push(drawing);
      
      // Cập nhật paged lists
      this.updatePagedNewDrawings();
      this.updatePagedInProgressDrawings();
    }
  }

  // Phương thức mới: Tự động chuyển trang dựa trên khau_sx của user
  private redirectBasedOnKhauSx(drawing: BangVeData): void {
    if (!this.khau_sx || this.khau_sx === 'unknown') {
      this.thongbao('Không thể xác định khâu sản xuất của bạn. Vui lòng liên hệ quản trị viên.', 'Đóng', 'warning');
      return;
    }

    // Nếu user là admin/manager, không cần chuyển hướng
    if (this.khau_sx === 'admin') {
      this.thongbao('Bạn có quyền admin/manager. Vui lòng sử dụng chức năng gia công thông thường.', 'Đóng', 'info');
      return;
    }

    console.log(`User khau_sx: ${this.khau_sx}, redirecting to appropriate page...`);

    switch (this.khau_sx.toLowerCase()) {
      case 'boidayha':
        console.log('Redirecting to boi-day-ha page');
        this.goBoidayHa(drawing);
        break;
      case 'boidaycao':
        console.log('Redirecting to boi-day-cao page');
        this.goBoidayCao();
        break;
      case 'boidayep':
        console.log('Redirecting to boi-day-ep page (if exists)');
        // Nếu có trang boi-day-ep, có thể thêm navigation ở đây
        this.thongbao('Chức năng bối dây ép đang được phát triển.', 'Đóng', 'info');
        break;
      default:
        console.log(`Unknown khau_sx: ${this.khau_sx}`);
        this.thongbao(`Khâu sản xuất "${this.khau_sx}" không được hỗ trợ. Vui lòng liên hệ quản trị viên.`, 'Đóng', 'warning');
        break;
    }
  }

  goBoidayHa(drawing: BangVeData){
    // Không dùng localStorage để truyền dữ liệu, chỉ dùng state khi navigate
    this.router.navigate(['boi-day-ha'], { state: { drawing: drawing } });
  }

  goBoidayCao(){
    this.router.navigate(['boi-day-cao']);
  }

  confirmGiaCong(drawing: BangVeData): void {
    // Simulate processing
    const processedDrawing: ProcessedBangVeData = {
      ...drawing,
      user_process: this.username || 'unknown',
      process_date: new Date(),
      process_status: 'completed'
    };
    
    // Move from new drawings to processed drawings
    this.drawings = this.drawings.filter(d => d.id !== drawing.id);
    this.processedDrawings.push(processedDrawing);
    
    // Update filtered lists
    this.filteredDrawings = this.filteredDrawings.filter(d => d.id !== drawing.id);
    this.filteredProcessedDrawings.push(processedDrawing);
    
    // Update paged lists
    this.updatePagedNewDrawings();
    this.updatePagedProcessedDrawings();
    
    this.thongbao('Gia công thành công!', 'Đóng', 'success');
  }

  giacongboidayha(drawing: BangVeData) {
    // Kiểm tra quyền admin hoặc manager
    if (!this.hasAdminOrManagerRole()) {
      // Nếu không phải admin/manager, tự động chuyển trang dựa trên khau_sx
      this.redirectBasedOnKhauSx(drawing);
      return;
    }

    const dialogRef = this.dialog.open(GiaCongPopupComponent, {
      width: '500px',
      data: { drawing }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.confirmed) {
        this.processDrawing(drawing, result.boiDayHa, result.boiDayCao);
      }
    });
  }

  giacongboidayep(drawing: BangVeData) {
    // Kiểm tra quyền admin hoặc manager
    if (!this.hasAdminOrManagerRole()) {
      // Nếu không phải admin/manager, tự động chuyển trang dựa trên khau_sx
      this.redirectBasedOnKhauSx(drawing);
      return;
    }

    this.commonService.thongbao('Giao công bối dây ép thành công!', 'Đóng', 'success');
  }

  giacongboidaycao(drawing: BangVeData) {
    // Kiểm tra quyền admin hoặc manager
    if (!this.hasAdminOrManagerRole()) {
      // Nếu không phải admin/manager, tự động chuyển trang dựa trên khau_sx
      this.redirectBasedOnKhauSx(drawing);
      return;
    }

    this.commonService.thongbao('Giao công bối dây cao thành công!', 'Đóng', 'success');
    this.router.navigate(['boi-day-cao']);
  }

  // Logic gia công bảng vẽ, nhận thêm tham số người dùng thực hiện cho từng khâu
  processDrawing(drawing: BangVeData, userQuanday1: any, userQuanday2: any): void {
    // Lấy tên người dùng từ object Worker
    const userName1 = typeof userQuanday1 === 'string' ? userQuanday1 : userQuanday1?.name || 'Không xác định';
    const userName2 = typeof userQuanday2 === 'string' ? userQuanday2 : userQuanday2?.name || 'Không xác định';
    
    console.log(`Bảng vẽ "${drawing.kyhieubangve}" đang được gia công.`);
    console.log(`Người quấn dây hạ: ${userName1}`);
    console.log(`Người quấn dây cao: ${userName2}`);
    
    // Kiểm tra authentication trước khi gọi API
    const token = this.authService.getToken();
    if (!token) {
      this.thongbao('Vui lòng đăng nhập để gia công bảng vẽ', 'Đóng', 'error');
      return;
    }

    // Gọi API để gia công bảng vẽ
    this.processDrawingApi(drawing.id, userQuanday1, userQuanday2).subscribe({
      next: (response) => {
        console.log('API response for processed drawing:', response);
        
        // Xóa bảng vẽ khỏi danh sách mới và thêm vào danh sách đã xử lý
        this.drawings = this.drawings.filter(b => b.id !== drawing.id);
        this.filteredDrawings = this.filteredDrawings.filter(b => b.id !== drawing.id);
        this.updatePagedNewDrawings();
        
        // Thêm vào danh sách đã xử lý
        const processedDrawing: ProcessedBangVeData = {
          ...drawing,
          user_process: `${userName1}, ${userName2}`,
          process_date: new Date(),
          process_status: 'Completed'
        };
        this.processedDrawings = [...this.processedDrawings, processedDrawing];
        this.filteredProcessedDrawings = this.processedDrawings.slice();
        this.updatePagedProcessedDrawings();
        
        this.thongbao(`Đã chuyển bảng vẽ "${drawing.kyhieubangve}" thành công cho ${userName1} và ${userName2}!`, 'Đóng', 'success');
      },
      error: (error) => {
        console.error('Error processing drawing:', error);
        console.error('Error status:', error.status);
        console.error('Error message:', error.message);
        console.error('Error details:', error.error);
        
        if (error.status === 401) {
          this.thongbao('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại', 'Đóng', 'error');
          this.router.navigate(['/landing']);
        } else if (error.status === 400) {
          this.thongbao('Dữ liệu không hợp lệ, vui lòng kiểm tra lại thông tin', 'Đóng', 'error');
        } else if (error.status === 500) {
          this.thongbao('Lỗi máy chủ, vui lòng thử lại sau', 'Đóng', 'error');
        } else {
          this.thongbao('Lỗi khi gia công bảng vẽ', 'Đóng', 'error');
        }
        
        // Fallback: xử lý local nếu API thất bại
        this.drawings = this.drawings.filter(b => b.id !== drawing.id);
        this.filteredDrawings = this.filteredDrawings.filter(b => b.id !== drawing.id);
        this.updatePagedNewDrawings();
        
        const processedDrawing: ProcessedBangVeData = {
          ...drawing,
          user_process: `${userName1}, ${userName2}`,
          process_date: new Date(),
          process_status: 'Completed'
        };
        this.processedDrawings = [...this.processedDrawings, processedDrawing];
        this.filteredProcessedDrawings = this.processedDrawings.slice();
        this.updatePagedProcessedDrawings();
        
        this.thongbao(`Đã chuyển bảng vẽ "${drawing.kyhieubangve}" thành công cho ${userName1} và ${userName2}!`, 'Đóng', 'success');
      }
    });
  }

  viewDrawing(d: BangVeData) {
    alert(JSON.stringify(d, null, 2));
  }

  thongbao(text: string,action: string,type: 'success' | 'error' | 'warning' | 'info'): void {
    let config = new MatSnackBarConfig();
    config.verticalPosition = 'top'; // Đặt vị trí dọc là "trên cùng"
    config.horizontalPosition = 'right'; // Đặt vị trí ngang là "bên phải"
    config.duration = 3000; // Tùy chọn: Thời gian hiển thị (ví dụ 3 giây)
    config.panelClass = ['snackbar-custom', `snackbar-${type}`];
    this._snackBar.open(text, action, config);
  }

  openAddBangVeDialog(): void {
    // Kiểm tra quyền admin hoặc manager trước khi mở dialog
    if (!this.hasAdminOrManagerRole()) {
      this.showPermissionDeniedMessage();
      return;
    }

    const dialogRef = this.dialog.open(BangVeComponent, {
      width: '850px',
      disableClose: true,
      data: {
        mode: 'add'
      },
      panelClass: 'custom-dialog-container'
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('Dialog thêm mới đã đóng với kết quả:', result);
      if (result) {
        // Kiểm tra authentication trước khi gọi API
        const token = this.authService.getToken();
        if (!token) {
          this.thongbao('Vui lòng đăng nhập để thêm bảng vẽ mới', 'Đóng', 'error');
          return;
        }

        // Kiểm tra lại quyền trước khi gọi API (double-check)
        if (!this.hasAdminOrManagerRole()) {
          this.showPermissionDeniedMessage();
          return;
        }

        // Chuẩn bị dữ liệu cho API
        const newDrawingData: BangVeData = {
          ...result,
          id: 0, // ID sẽ được server tạo
          trang_thai: null, // Bảng vẽ mới có trang_thai = null
          created_at: new Date(),
          username: this.authService.getUserInfo()?.username || 'Unknown',
          email: this.authService.getUserInfo()?.email || '',
          role_name: this.authService.getUserInfo()?.roles?.[0] || 'user'
        };
        
        // Validate required fields
        if (!newDrawingData.kyhieubangve || newDrawingData.kyhieubangve.trim() === '') {
          this.thongbao('Ký hiệu bảng vẽ là bắt buộc', 'Đóng', 'error');
          return;
        }
        
        if (!newDrawingData.congsuat) {
          this.thongbao('Công suất là bắt buộc', 'Đóng', 'error');
          return;
        }

        // Gọi API để thêm bảng vẽ mới
        this.addNewDrawing(newDrawingData).subscribe({
          next: (response) => {
            console.log('API response for new drawing:', response);
            
            // Refresh toàn bộ danh sách từ server để đảm bảo đồng bộ
            this.loadDrawings();
            
            // Reset search và pagination về trạng thái ban đầu
            this.searchTerm = '';
            this.pageIndex = 0;
            
            // Chuyển về tab "Bảng vẽ mới" để user thấy bảng vẽ mới được thêm
            this.currentTabIndex = 0;
            
            this.thongbao('Thêm bảng vẽ mới thành công!', 'Đóng', 'success');
          },
          error: (error) => {
            console.error('Error adding new drawing:', error);
            console.error('Error status:', error.status);
            console.error('Error message:', error.message);
            console.error('Error details:', error.error);
            
            if (error.status === 401) {
              this.thongbao('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại', 'Đóng', 'error');
              this.router.navigate(['/landing']);
            } else if (error.status === 403) {
              this.thongbao('Bạn không có quyền thực hiện chức năng này', 'Đóng', 'error');
            } else if (error.status === 400) {
              this.thongbao('Dữ liệu không hợp lệ, vui lòng kiểm tra lại thông tin', 'Đóng', 'error');
            } else if (error.status === 500) {
              this.thongbao('Lỗi máy chủ, vui lòng thử lại sau', 'Đóng', 'error');
            } else {
              this.thongbao('Lỗi khi thêm bảng vẽ mới', 'Đóng', 'error');
            }
            
            // Fallback: thêm vào local nếu API thất bại
            const fallbackDrawing = {
              ...newDrawingData,
              id: this.drawings.length > 0 ? Math.max(...this.drawings.map(b => b.id)) + 1 : 1,
              trang_thai: null // Đảm bảo trang_thai = null cho bảng vẽ mới
            };
            
            // Thêm vào local list
            this.drawings = [...this.drawings, fallbackDrawing];
            
            // Cập nhật filtered lists và paged lists
            this.filterNewDrawings();
            this.updatePagedNewDrawings();
            
            // Reset search và pagination
            this.searchTerm = '';
            this.pageIndex = 0;
            
            // Chuyển về tab "Bảng vẽ mới"
            this.currentTabIndex = 0;
            
            this.thongbao('Bảng vẽ đã được thêm vào local (API thất bại)', 'Đóng', 'warning');
          }
        });
      }
    });
  }
  
  openBangVeDetailDialog(bangVe: BangVeData, mode: 'view' | 'edit'): void {
    const dialogRef = this.dialog.open(BangVeComponent, {
      width: '850px',
      disableClose: true,
      data: {
        bangVeData: bangVe,
        mode: mode
      },
      panelClass: 'custom-dialog-container'
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('Dialog chi tiết/sửa đã đóng với kết quả:', result);
      if (result && mode === 'edit') {
        // Kiểm tra authentication trước khi gọi API
        const token = this.authService.getToken();
        if (!token) {
          this.thongbao('Vui lòng đăng nhập để cập nhật bảng vẽ', 'Đóng', 'error');
          return;
        }

        // Gọi API để cập nhật bảng vẽ
        this.updateDrawing(result).subscribe({
          next: (response) => {
            console.log('API response for updated drawing:', response);
            
            // Cập nhật bảng vẽ trong danh sách local
            const index = this.drawings.findIndex(b => b.id === result.id);
            if (index > -1) {
              this.drawings[index] = response;
              this.filteredDrawings = this.drawings.slice();
              this.updatePagedNewDrawings();
            }
            
            this.thongbao('Cập nhật bảng vẽ thành công!', 'Đóng', 'success');
          },
          error: (error) => {
            console.error('Error updating drawing:', error);
            console.error('Error status:', error.status);
            console.error('Error message:', error.message);
            console.error('Error details:', error.error);
            
            if (error.status === 401) {
              this.thongbao('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại', 'Đóng', 'error');
              this.router.navigate(['/landing']);
            } else if (error.status === 400) {
              this.thongbao('Dữ liệu không hợp lệ, vui lòng kiểm tra lại thông tin', 'Đóng', 'error');
            } else if (error.status === 500) {
              this.thongbao('Lỗi máy chủ, vui lòng thử lại sau', 'Đóng', 'error');
            } else {
              this.thongbao('Lỗi khi cập nhật bảng vẽ', 'Đóng', 'error');
            }
            
            // Fallback: cập nhật local nếu API thất bại
            const index = this.drawings.findIndex(b => b.id === result.id);
            if (index > -1) {
              this.drawings[index] = result;
              this.filteredDrawings = this.drawings.slice();
              this.updatePagedNewDrawings();
            }
          }
        });
      }
    });
  }

  deleteBangVe(bangVe: BangVeData): void {
    // Hiển thị dialog xác nhận trước khi xóa
    const confirmDialog = this.dialog.open(DialogComponent, {
      width: '400px',
      data: {
        title: 'Xác nhận xóa',
        message: `Bạn có chắc chắn muốn xóa bảng vẽ "${bangVe.kyhieubangve}" không?`,
        confirmText: 'Xóa',
        cancelText: 'Hủy'
      }
    });

    confirmDialog.afterClosed().subscribe(result => {
      if (result) {
        // Kiểm tra authentication trước khi gọi API
        const token = this.authService.getToken();
        if (!token) {
          this.thongbao('Vui lòng đăng nhập để xóa bảng vẽ', 'Đóng', 'error');
          return;
        }

        // Gọi API để xóa bảng vẽ
        this.deleteDrawing(bangVe.id).subscribe({
          next: (response) => {
            console.log('API response for deleted drawing:', response);
            
            // Xóa bảng vẽ khỏi danh sách local
            this.drawings = this.drawings.filter(b => b.id !== bangVe.id);
            this.filteredDrawings = this.filteredDrawings.filter(b => b.id !== bangVe.id);
            this.updatePagedNewDrawings();
            
            this.thongbao('Xóa bảng vẽ thành công!', 'Đóng', 'success');
          },
          error: (error) => {
            console.error('Error deleting drawing:', error);
            console.error('Error status:', error.status);
            console.error('Error message:', error.message);
            console.error('Error details:', error.error);
            
            if (error.status === 401) {
              this.thongbao('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại', 'Đóng', 'error');
              this.router.navigate(['/landing']);
            } else if (error.status === 404) {
              this.thongbao('Bảng vẽ không tồn tại', 'Đóng', 'error');
            } else if (error.status === 500) {
              this.thongbao('Lỗi máy chủ, vui lòng thử lại sau', 'Đóng', 'error');
            } else {
              this.thongbao('Lỗi khi xóa bảng vẽ', 'Đóng', 'error');
            }
          }
        });
      }
    });
  }

  // Method mới: Tìm kiếm bảng vẽ đang gia công
  searchInProgressDrawings(): void {
    this.filterInProgressDrawings();
    this.pageIndexInProgress = 0;
    this.updatePagedInProgressDrawings();
  }

  // Method mới: Xử lý page change cho bảng vẽ đang gia công
  onInProgressDrawingsPageChange(event: PageEvent): void {
    this.pageIndexInProgress = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updatePagedInProgressDrawings();
  }

}