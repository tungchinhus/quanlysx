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
  created_at: Date;
  username: string;
  email: string;
  role_name: string;
  khau_sx?: string; // Thêm khau_sx để lưu thông tin khâu sản xuất
}

export interface UserRole {
  id: number;
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
  }

  async checkAuthentication(): Promise<void> {
    try {
      // Kiểm tra xem user có đăng nhập không
      this.isAuthenticated = this.authService.isLoggedIn();
      
      if (this.isAuthenticated) {
        // Lấy thông tin user từ localStorage
        this.currentUser = this.authService.getUserInfoFromStorage();
        
        if (this.currentUser) {
          // Kiểm tra xem user có user_id không
          const userId = this.currentUser?.id || this.currentUser?.user_id || this.currentUser?.userId;
          if (userId) {
            // Xác định loại user và quyền
            this.determineUserRole();
            this.loadQuanDayData();
          } else {
            console.error('User không có thông tin user_id');
            this.showError('User không có quyền truy cập dữ liệu này');
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
      const apiUrl = `${this.commonService.getServerAPIURL()}api/Drawings/GetDrawingsWithUserRole`;
      const token = this.authService.getToken();
      
      if (!token) {
        throw new Error('Không có token xác thực');
      }

      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      });
      
      // Lấy user_id từ thông tin user hiện tại
      const userId = this.currentUser?.id || this.currentUser?.user_id || this.currentUser?.userId;
      if (!userId) {
        throw new Error('Không thể lấy user_id');
      }
      
      const requestBody = {
        user_id: userId,
        trang_thai: 0
      };
      console.log('Request body with user_id:', requestBody);

      this.http.post<any[]>(apiUrl, requestBody, { headers })
        .pipe(
          catchError(error => {
            console.error('Lỗi API:', error);
            // Fallback: sử dụng dữ liệu mẫu nếu API không hoạt động
            const mockData = this.getMockData();
            return of(this.removeDuplicateData(mockData));
          })
        )
        .subscribe(data => {
          console.log('Raw data from API:', data);
          console.log('Data length before deduplication:', data.length);
          
          // Loại bỏ dữ liệu trùng lặp dựa trên id
          const uniqueData = this.removeDuplicateData(data);
          console.log('Data length after deduplication:', uniqueData.length);
          
          this.quanDays = uniqueData.map(item => this.mapBangVeToQuanDay(item));
          this.filteredQuanDays = [...this.quanDays];
          this.pagedNewQuanDays = this.getPaginatedData(this.filteredQuanDays, 0, this.pageSize);
          
          // Tạo dữ liệu mẫu cho tab "Đã hoàn thành" (có thể thay bằng API call thực tế)
          this.completedQuanDays = this.getMockCompletedData();
          this.filteredCompletedQuanDays = [...this.completedQuanDays];
          this.pagedCompletedQuanDays = this.getPaginatedData(this.filteredCompletedQuanDays, 0, this.pageSizeCompleted);
          
          this.cdr.detectChanges();
        });

    } catch (error) {
      console.error('Lỗi tải dữ liệu:', error);
      // Fallback: sử dụng dữ liệu mẫu
      const mockData = this.getMockData();
      this.quanDays = this.removeDuplicateData(mockData);
      this.filteredQuanDays = [...this.quanDays];
      this.pagedNewQuanDays = this.getPaginatedData(this.filteredQuanDays, 0, this.pageSize);
      
      this.completedQuanDays = this.getMockCompletedData();
      this.filteredCompletedQuanDays = [...this.completedQuanDays];
      this.pagedCompletedQuanDays = this.getPaginatedData(this.filteredCompletedQuanDays, 0, this.pageSizeCompleted);
    }
  }

  // Xác định loại user và quyền
  private determineUserRole(): void {
    if (this.currentUser) {
      this.userRole = {
        id: this.currentUser?.id || this.currentUser?.user_id || this.currentUser?.userId,
        username: this.currentUser?.username || '',
        email: this.currentUser?.email || '',
        role_name: this.currentUser?.role_name || '',
        khau_sx: this.currentUser?.khau_sx || ''
      };
      
      // Xác định loại gia công dựa trên khau_sx
      const khauSx = this.userRole.khau_sx?.toLowerCase() || '';
      this.isGiaCongHa = khauSx.includes('quandayha') || khauSx.includes('boidayha') || khauSx.includes('ha');
      this.isGiaCongCao = khauSx.includes('quandaycao') || khauSx.includes('boidaycao') || khauSx.includes('cao');
      
      console.log('User role determined:', this.userRole);
      console.log('Is gia cong ha:', this.isGiaCongHa);
      console.log('Is gia cong cao:', this.isGiaCongCao);
    }
  }

  // Loại bỏ dữ liệu trùng lặp dựa trên id
  private removeDuplicateData(data: any[]): any[] {
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
      created_at: new Date(bangVe.created_at) || new Date(),
      username: bangVe.username || '',
      email: bangVe.email || '',
      role_name: bangVe.role_name || '',
      khau_sx: bangVe.khau_sx || ''
    };
  }

  // Dữ liệu mẫu fallback
  private getMockData(): QuanDayData[] {
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
        user_create: 'user1', 
        trang_thai: 0, 
        created_at: new Date('2025-08-11'), 
        username: 'user1',
        email: 'user1@example.com', 
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
        user_create: 'user2', 
        trang_thai: 0, 
        created_at: new Date('2025-08-11'), 
        username: 'user2',
        email: 'user2@example.com', 
        role_name: 'operator',
        khau_sx: 'Khâu 2'
      }
    ];
  }

  private getMockCompletedData(): CompletedQuanDayData[] {
    return [
      {
        id: 4, 
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
        user_create: 'user1', 
        trang_thai: 2, 
        created_at: new Date('2025-08-01'), 
        username: 'user1',
        email: 'user1@example.com', 
        role_name: 'operator',
        khau_sx: 'Khâu 1',
        completed_date: new Date('2025-08-10'), 
        completed_by: 'user1', 
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

  getPaginatedData<T>(data: T[], pageIndex: number, pageSize: number): T[] {
    const startIndex = pageIndex * pageSize;
    return data.slice(startIndex, startIndex + pageSize);
  }

  // Xử lý gia công hạ
  onGiaCongHa(element: QuanDayData): void {
    console.log('Gia công hạ cho:', element.kyhieuquanday);
    
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
        // Có thể refresh dữ liệu hoặc cập nhật UI ở đây
        this.loadQuanDayData();
      }
    });
  }

  // Xử lý gia công cao
  onGiaCongCao(element: QuanDayData): void {
    console.log('Gia công cao cho:', element.kyhieuquanday);
    
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
        // Có thể refresh dữ liệu hoặc cập nhật UI ở đây
        this.loadQuanDayData();
      }
    });
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
}
