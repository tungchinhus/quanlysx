import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { BangVeComponent } from '../bang-ve/bang-ve.component';
import { DialogComponent } from 'src/app/shared/dialogs/dialog/dialog.component';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from 'src/app/shared/services/common.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError } from 'rxjs/operators';
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
  trang_thai: boolean;
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

  displayedColumns: string[] = ['kyhieubangve', 'congsuat', 'tbkt', 'dienap', 'created_at', 'actions'];
  
  // New drawings properties
  searchTerm: string = '';
  filteredDrawings: BangVeData[] = [];
  pagedNewDrawings: BangVeData[] = [];
  
  // Processed drawings properties
  searchTermProcessed: string = '';
  filteredProcessedDrawings: ProcessedBangVeData[] = [];
  pagedProcessedDrawings: ProcessedBangVeData[] = [];
  displayedColumnsProcessed: string[] = ['kyhieubangve', 'congsuat', 'tbkt', 'dienap', 'process_date','actions'];
  
  pageSize = 5;
  pageIndex = 0;
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
    this.userRole = localStorage.getItem('userRole');
    this.username = localStorage.getItem('username');
    this.khau_sx = localStorage.getItem('khau_sx');
    
    // Kiểm tra authentication trước khi load data
    this.checkAuthentication();
    
    // Test API connectivity
    this.testApiConnectivity();
    
    // Kiểm tra quyền của user
    this.checkUserPermissions();
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
      this.initializeMockDrawings();
      this.initializeMockProcessedDrawings();
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
    const userRole = localStorage.getItem('role');
    const roles = userInfo?.roles || [];
    
    console.log('Checking user permissions:');
    console.log('User info:', userInfo);
    console.log('User role from localStorage:', userRole);
    console.log('Roles from user info:', roles);
    
    // Kiểm tra role từ userInfo trước
    if (roles && roles.length > 0) {
      const hasPermission = roles.some((role: string) => 
        role.toLowerCase() === 'admin' || 
        role.toLowerCase() === 'manager' ||
        role.toLowerCase() === 'administrator'
      );
      console.log('Has permission from userInfo roles:', hasPermission);
      return hasPermission;
    }
    
    // Fallback: kiểm tra role từ localStorage
    if (userRole) {
      const hasPermission = userRole.toLowerCase() === 'admin' || 
                           userRole.toLowerCase() === 'manager' ||
                           userRole.toLowerCase() === 'administrator';
      console.log('Has permission from localStorage role:', hasPermission);
      return hasPermission;
    }
    
    console.log('No role found, denying access');
    return false;
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
    
    console.log('=== User Permission Check ===');
    console.log('User Info:', userInfo);
    console.log('User Role from localStorage:', userRole);
    console.log('Roles from userInfo:', roles);
    console.log('Has Admin/Manager Role:', this.hasAdminOrManagerRole());
    
    // Hiển thị thông tin quyền cho user
    if (this.hasAdminOrManagerRole()) {
      console.log('User has admin/manager permissions');
    } else {
      console.log('User does not have admin/manager permissions');
      this.thongbao('Bạn đang xem ở chế độ chỉ đọc. Chỉ admin hoặc manager mới có quyền thêm/sửa/xóa bảng vẽ.', 'Đóng', 'info');
    }
  }

  // Test API connectivity
  testApiConnectivity(): void {
    console.log('Testing API connectivity...');
    const token = this.authService.getToken();
    
    if (!token) {
      console.log('No token available for API test');
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
        console.error('Error status:', error.status);
        console.error('Error message:', error.message);
      }
    });
  }

  // API methods
  loadDrawings(): void {
    // Debug: Kiểm tra token và thông tin user
    const token = this.authService.getToken();
    const isLoggedIn = this.authService.isLoggedIn();
    console.log('Debug - Token:', token);
    console.log('Debug - IsLoggedIn:', isLoggedIn);
    console.log('Debug - localStorage accessToken:', localStorage.getItem('accessToken'));
    console.log('Debug - localStorage idToken:', localStorage.getItem('idToken'));

    // Kiểm tra token trước khi gọi API
    if (!token) {
      console.error('No authentication token found');
      console.log('User needs to login first');
      // Không hiển thị error message vì đã được xử lý trong checkAuthentication()
      this.initializeMockDrawings();
      return;
    }

    this.getDrawings().subscribe({
      next: (data: BangVeData[]) => {
        this.drawings = data;
        this.filteredDrawings = [...this.drawings];
        this.updatePagedNewDrawings();
        this.filteredDrawingsForAutocomplete = [...this.drawings];
        console.log('Drawings loaded from API:', this.drawings);
      },
      error: (error) => {
        console.error('Error loading drawings:', error);
        console.error('Error status:', error.status);
        console.error('Error message:', error.message);
        console.error('Error details:', error.error);
        
        // Xử lý lỗi authentication
        if (error.status === 401) {
          this.thongbao('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại', 'Đóng', 'error');
          // Có thể redirect về trang login
          this.router.navigate(['/landing']);
        } else if (error.status === 400) {
          console.error('Bad Request - Check API parameters');
          this.thongbao('Lỗi tham số API khi tải danh sách bảng vẽ', 'Đóng', 'error');
        } else if (error.status === 500) {
          console.error('Internal Server Error - Server issue');
          this.thongbao('Lỗi máy chủ khi tải danh sách bảng vẽ', 'Đóng', 'error');
        } else {
          this.thongbao('Lỗi khi tải danh sách bảng vẽ', 'Đóng', 'error');
        }
        
        // Fallback to mock data
        this.initializeMockDrawings();
      }
    });
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
        this.processedDrawings = data;
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
    const apiUrl = 'https://localhost:7190/api/Drawings/GetDrawings';
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
    const apiUrl = 'https://localhost:7190/api/Drawings/GetProcessedDrawings';
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
    const apiUrl = 'https://localhost:7190/api/Drawings/AddDrawing';
    const headers = new HttpHeaders()
      .set('Authorization', `Bearer ${this.authService.getToken()}`)
      .set('Content-Type', 'application/json');
    
    // Lấy thông tin user và role
    const userInfo = this.authService.getUserInfo();
    const userRole = localStorage.getItem('role');
    const roles = userInfo?.roles || [];
    
    // Chuẩn bị dữ liệu để gửi lên API theo cấu trúc mà server mong đợi
    const requestData = {
      drawing: {
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
      },
      userInfo: {
        userId: userInfo?.userId || 0,
        username: userInfo?.username || '',
        email: userInfo?.email || '',
        roles: roles,
        userRole: userRole
      }
    };
    
    console.log('Calling AddDrawing API with data:', requestData);
    console.log('API URL:', apiUrl);
    console.log('Headers:', headers);
    
    return this.http.post<BangVeData>(apiUrl, requestData, { headers });
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
        trang_thai: true,
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
        trang_thai: false,
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
        trang_thai: true,
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
        trang_thai: true,
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
        trang_thai: true,
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
    const dialogRef = this.dialog.open(DialogComponent, {
      width: '400px',
      data: {
        title: 'Xác nhận gia công',
        message: `Bạn có chắc chắn muốn gia công bảng vẽ ${drawing.kyhieubangve}?`,
        confirmText: 'Gia công',
        cancelText: 'Hủy'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.confirmGiaCong(drawing);
      }
    });
  }

  goBoidayHa(){
    this.router.navigate(['/landing/boi-day-ha']);
  }

  goBoidayCao(){
    this.router.navigate(['/landing/boi-day-cao']);
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
    const dialogRef = this.dialog.open(DialogComponent, {
      data: {
        title: 'Xác nhận gia công và thực hiện',
        message: `Bạn có chắc chắn muốn gia công bảng vẽ "${drawing.kyhieubangve}"?`,
        showProcessUsers: true,
        users: this.availableUsers,
        process1Label: 'Người quấn bối dây hạ',
        process2Label: 'Người quấn bối dây cao'
      }
    });

    dialogRef.afterClosed().subscribe(result => {      
      if (result && result.confirmed) {
        this.processDrawing(drawing, result.user1, result.user2);
      } else {
        console.log('Gia công bị hủy hoặc không có người dùng được chọn.');
      }
    });
  }

  giacongboidayep() {
    this.commonService.thongbao('Giao công bối dây ép thành công!', 'Đóng', 'success');
  }

  giacongboidaycao() {
    this.commonService.thongbao('Giao công bối dây cao thành công!', 'Đóng', 'success');
    this.router.navigate(['boi-day-cao']);
  }

  // Logic gia công bảng vẽ, nhận thêm tham số người dùng thực hiện cho từng khâu
  processDrawing(drawing: BangVeData, userQuanday1: string, userQuanday2: string): void {
    console.log(`Bảng vẽ "${drawing.kyhieubangve}" đang được gia công.`);
    console.log(`Người quấn dây 1: ${userQuanday1}`);
    console.log(`Người quấn dây 2: ${userQuanday2}`);
    
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
          user_process: `${userQuanday1}, ${userQuanday2}`,
          process_date: new Date(),
          process_status: 'Completed'
        };
        this.processedDrawings = [...this.processedDrawings, processedDrawing];
        this.filteredProcessedDrawings = this.processedDrawings.slice();
        this.updatePagedProcessedDrawings();
        
        this.thongbao(`Đã chuyển bảng vẽ "${drawing.kyhieubangve}" thành công cho ${userQuanday1} và ${userQuanday2}!`, 'Đóng', 'success');
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
          user_process: `${userQuanday1}, ${userQuanday2}`,
          process_date: new Date(),
          process_status: 'Completed'
        };
        this.processedDrawings = [...this.processedDrawings, processedDrawing];
        this.filteredProcessedDrawings = this.processedDrawings.slice();
        this.updatePagedProcessedDrawings();
        
        this.thongbao(`Đã chuyển bảng vẽ "${drawing.kyhieubangve}" thành công cho ${userQuanday1} và ${userQuanday2}!`, 'Đóng', 'success');
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
          created_at: new Date(),
          username: this.authService.getUserInfo()?.username || 'Unknown',
          email: this.authService.getUserInfo()?.email || '',
          role_name: this.authService.getUserInfo()?.roles?.[0] || 'user'
        };

        // Kiểm tra và log dữ liệu trước khi gửi API
        console.log('Result from dialog:', result);
        console.log('New drawing data prepared:', newDrawingData);
        console.log('kyhieubangve value:', newDrawingData.kyhieubangve);
        console.log('kyhieubangve type:', typeof newDrawingData.kyhieubangve);
        console.log('kyhieubangve length:', newDrawingData.kyhieubangve?.length);
        console.log('kyhieubangve trimmed:', newDrawingData.kyhieubangve?.trim());
        
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
            
            // Thêm bảng vẽ mới vào danh sách local
            this.drawings = [...this.drawings, response];
            this.filteredDrawings = this.drawings.slice();
            this.updatePagedNewDrawings();
            
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
              id: this.drawings.length > 0 ? Math.max(...this.drawings.map(b => b.id)) + 1 : 1
            };
            this.drawings = [...this.drawings, fallbackDrawing];
            this.filteredDrawings = this.drawings.slice();
            this.updatePagedNewDrawings();
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

}