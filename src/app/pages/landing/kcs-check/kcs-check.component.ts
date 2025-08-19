import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { FormControl } from '@angular/forms';
import { AuthServices } from 'src/app/shared/services/authen/auth.service';
import { Router } from '@angular/router';
import { KcsCheckService, BoiDayHaData, BoiDayCaoData, EpBoiDayData } from './kcs-check.service';
import { ConfirmDialogComponent } from 'src/app/shared/components/confirm-dialog/confirm-dialog.component';
import { RejectDialogComponent } from 'src/app/shared/components/reject-dialog/reject-dialog.component';

@Component({
  selector: 'app-kcs-check',
  templateUrl: './kcs-check.component.html',
  styleUrls: ['./kcs-check.component.scss']
})
export class KcsCheckComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // Authentication check
  isAuthenticated = false;
  hasEpBoiDayPermission = false;
  currentUser: any;

  // Tab management
  selectedTabIndex = 0;

  // Search controls
  searchTermBoiDayHa = new FormControl('');
  searchTermBoiDayCao = new FormControl('');
  searchTermEpBoiDay = new FormControl('');

  // Data sources for tables
  boiDayHaDataSource = new MatTableDataSource<BoiDayHaData>([]);
  boiDayCaoDataSource = new MatTableDataSource<BoiDayCaoData>([]);
  epBoiDayDataSource = new MatTableDataSource<EpBoiDayData>([]);

  // Display columns for each tab
  boiDayHaColumns = ['kyhieuquanday', 'congsuat', 'quy_cach_day', 'so_soi_day', 'ngay_san_xuat', 'trang_thai', 'actions'];
  boiDayCaoColumns = ['kyhieuquanday', 'congsuat', 'tbkt', 'dienap', 'quy_cach_day', 'ngay_san_xuat', 'trang_thai', 'actions'];
  epBoiDayColumns = ['kyhieuquanday', 'congsuat', 'tbkt', 'dienap', 'trang_thai', 'actions'];

  // Data arrays
  boiDayHaData: BoiDayHaData[] = [];
  boiDayCaoData: BoiDayCaoData[] = [];
  epBoiDayData: EpBoiDayData[] = [];

  // Loading states
  isLoadingBoiDayHa = false;
  isLoadingBoiDayCao = false;
  isLoadingEpBoiDay = false;
  
  // Loading states cho từng item (để hiển thị loading trên button cụ thể)
  loadingItems = new Set<string>(); // Format: 'type_id_action' (ví dụ: 'boiDayHa_1_approve')

  constructor(
    private authService: AuthServices,
    private router: Router,
    private dialog: MatDialog,
    private kcsCheckService: KcsCheckService
  ) {}

  ngOnInit(): void {
    this.checkAuthentication();
    this.loadData();
  }

  ngAfterViewInit(): void {
    this.setupTableSorting();
  }

  private checkAuthentication(): void {
    this.isAuthenticated = this.authService.isLoggedIn();
    if (this.isAuthenticated) {
      this.currentUser = this.authService.getFullUserInfo() || this.authService.getUserInfoFromStorage();
      
      // Debug thông tin user
      console.log('=== AUTHENTICATION DEBUG ===');
      this.authService.debugUserInfo();
      console.log('Current User in component:', this.currentUser);
      console.log('================================');
      
      this.checkEpBoiDayPermission();
    }
  }

  private checkEpBoiDayPermission(): void {
    if (this.currentUser) {      
      // Sử dụng method refreshKhauSx để lấy giá trị chính xác
      const khauSx = this.authService.refreshKhauSx();     
      
      const roleName = this.currentUser.roles[0] || '';
      
      this.hasEpBoiDayPermission = khauSx.includes('kcs') || 
                                   roleName.includes('user');
      
      console.log('KCS Check: EpBoiDay permission:', this.hasEpBoiDayPermission);
      console.log('========================');
    }
  }

  private loadData(): void {
    this.loadBoiDayHaData();
    this.loadBoiDayCaoData();
    this.loadEpBoiDayData();
  }

  private loadBoiDayHaData(): void {
    this.isLoadingBoiDayHa = true;
    this.kcsCheckService.getBoiDayHaData().subscribe({
      next: (data) => {
        this.boiDayHaData = data;
        this.boiDayHaDataSource.data = data;
        this.isLoadingBoiDayHa = false;
      },
      error: (error) => {
        console.error('Error loading boi day ha data:', error);
        this.isLoadingBoiDayHa = false;
      }
    });
  }

  private loadBoiDayCaoData(): void {
    this.isLoadingBoiDayCao = true;
    this.kcsCheckService.getBoiDayCaoData().subscribe({
      next: (data) => {
        this.boiDayCaoData = data;
        this.boiDayCaoDataSource.data = data;
        this.isLoadingBoiDayCao = false;
      },
      error: (error) => {
        console.error('Error loading boi day cao data:', error);
        this.isLoadingBoiDayCao = false;
      }
    });
  }

  private loadEpBoiDayData(): void {
    this.isLoadingEpBoiDay = true;
    this.kcsCheckService.getEpBoiDayData().subscribe({
      next: (data) => {
        this.epBoiDayData = data;
        this.epBoiDayDataSource.data = data;
        this.isLoadingEpBoiDay = false;
      },
      error: (error) => {
        console.error('Error loading ep boi day data:', error);
        this.isLoadingEpBoiDay = false;
      }
    });
  }

  private setupTableSorting(): void {
    this.boiDayHaDataSource.paginator = this.paginator;
    this.boiDayHaDataSource.sort = this.sort;
    this.boiDayCaoDataSource.paginator = this.paginator;
    this.boiDayCaoDataSource.sort = this.sort;
    this.epBoiDayDataSource.paginator = this.paginator;
    this.epBoiDayDataSource.sort = this.sort;
  }

  onTabChange(event: MatTabChangeEvent): void {
    this.selectedTabIndex = event.index;
    console.log('Tab changed to:', event.index);
  }

  // Search functions
  onSearchBoiDayHa(): void {
    const searchTerm = this.searchTermBoiDayHa.value?.toLowerCase() || '';
    this.boiDayHaDataSource.data = this.boiDayHaData.filter(item =>
      item.kyhieuquanday.toLowerCase().includes(searchTerm) ||
      item.tbkt.toLowerCase().includes(searchTerm)
    );
  }

  onSearchBoiDayCao(): void {
    const searchTerm = this.searchTermBoiDayCao.value?.toLowerCase() || '';
    this.boiDayCaoDataSource.data = this.boiDayCaoData.filter(item =>
      item.kyhieuquanday.toLowerCase().includes(searchTerm) ||
      item.tbkt.toLowerCase().includes(searchTerm)
    );
  }

  onSearchEpBoiDay(): void {
    const searchTerm = this.searchTermEpBoiDay.value?.toLowerCase() || '';
    this.epBoiDayDataSource.data = this.epBoiDayData.filter(item =>
      item.kyhieuquanday.toLowerCase().includes(searchTerm) ||
      item.tbkt.toLowerCase().includes(searchTerm)
    );
  }

  // Action functions
  onApprove(item: any, type: string): void {
    console.log('Approve item:', item, 'Type:', type);
    
    // Hiển thị confirm dialog
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '500px',
      data: {
        title: 'Xác nhận kiểm duyệt',
        message: `Bạn có chắc chắn muốn kiểm duyệt item "${item.kyhieuquanday}"?`,
        confirmText: 'Kiểm duyệt',
        cancelText: 'Hủy',
        type: 'approve'
      }
    });
    
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // User đã xác nhận, gọi API
        this.executeApprove(item, type);
      }
    });
  }
  
  // Method thực hiện approve sau khi confirm
  private executeApprove(item: any, type: string): void {
    const loadingKey = `${type}_${item.id}_approve`;
    this.loadingItems.add(loadingKey);
    
    this.kcsCheckService.approveItem(type, item.id).subscribe({
      next: (response) => {
        console.log('Approval successful:', response);
        
        if (response.IsSuccess) {
          // Reload data từ API thay vì chỉ update local
          this.reloadDataAfterAction(type);
          
          // Hiển thị thông báo thành công (có thể thêm toast/notification)
          console.log('Item approved successfully:', response.Message || 'Approval successful');
        } else {
          console.error('Approval failed:', response.Message || 'Approval failed');
          // Hiển thị thông báo lỗi
        }
      },
      error: (error) => {
        console.error('Approval failed:', error);
        // Hiển thị thông báo lỗi
      },
      complete: () => {
        this.loadingItems.delete(loadingKey);
      }
    });
  }

  onReject(item: any, type: string): void {
    console.log('Reject item:', item, 'Type:', type);
    
    // Hiển thị dialog reject với form nhập ghi chú
    const dialogRef = this.dialog.open(RejectDialogComponent, {
      width: '600px',
      disableClose: true,
      data: {
        title: 'Từ chối item',
        message: `Bạn đang từ chối item "${item.kyhieuquanday}". Vui lòng nhập lý do từ chối:`,
        itemName: item.kyhieuquanday,
        confirmText: 'Xác nhận từ chối',
        cancelText: 'Hủy'
      }
    });
    
    dialogRef.afterClosed().subscribe(result => {
      if (result && result.confirmed) {
        // User đã xác nhận và nhập ghi chú, gọi API với ghi chú
        this.executeReject(item, type, result.reason);
      }
    });
  }
  
  // Method thực hiện reject sau khi confirm
  private executeReject(item: any, type: string, reason: string): void {
    const loadingKey = `${type}_${item.id}_reject`;
    this.loadingItems.add(loadingKey);
    
    this.kcsCheckService.rejectItem(type, item.id, reason).subscribe({
      next: (response) => {
        console.log('Rejection successful:', response);
        
        if (response.IsSuccess) {
          // Reload data từ API thay vì chỉ update local
          this.reloadDataAfterAction(type);
          
          // Hiển thị thông báo thành công
          console.log('Item rejected successfully:', response.Message || 'Rejection successful');
        } else {
          console.error('Rejection failed:', response.Message || 'Rejection failed');
          // Hiển thị thông báo lỗi
        }
      },
      error: (error) => {
        console.error('Rejection failed:', error);
        // Hiển thị thông báo lỗi
      },
      complete: () => {
        this.loadingItems.delete(loadingKey);
      }
    });
  }

  onViewDetails(item: any, type: string): void {
    console.log('View details for:', item, 'Type:', type);
    
    this.kcsCheckService.getItemDetails(type, item.id).subscribe({
      next: (response) => {
        console.log('Item details:', response);
        // Implement view details logic here
        // Could open a dialog or navigate to detail page
      },
      error: (error) => {
        console.error('Failed to get item details:', error);
      }
    });
  }

  private refreshTableData(type: string): void {
    switch (type) {
      case 'boiDayHa':
        this.boiDayHaDataSource.data = [...this.boiDayHaData];
        break;
      case 'boiDayCao':
        this.boiDayCaoDataSource.data = [...this.boiDayCaoData];
        break;
      case 'epBoiDay':
        this.epBoiDayDataSource.data = [...this.epBoiDayData];
        break;
    }
  }

  goToLogin(): void {
    this.router.navigate(['/landing']);
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'approved':
        return 'primary'; // Xanh - Đã kiểm tra
      case 'rejected':
        return 'warn';    // Đỏ - Không đạt
      case 'pending':
        return 'accent';  // Vàng - Chờ kiểm tra
      default:
        return 'basic';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'approved':
        return 'Đã kiểm tra';
      case 'rejected':
        return 'Không đạt';
      case 'pending':
        return 'Chờ kiểm tra';
      default:
        return 'Không xác định';
    }
  }

  // Method để test và debug khau_sx
  testKhauSx(): void {
    console.log('=== TEST KHAU_SX ===');
    console.log('1. Direct localStorage:', localStorage.getItem('khau_sx'));
    console.log('2. AuthService.getKhauSx():', this.authService.getKhauSx());
    console.log('3. AuthService.refreshKhauSx():', this.authService.refreshKhauSx());
    console.log('4. Current User khau_sx:', this.currentUser?.khau_sx);
    console.log('5. Full User Info:', this.authService.getFullUserInfo());
    console.log('6. User from Storage:', this.authService.getUserInfoFromStorage());
    console.log('=====================');
  }

  // Method để kiểm tra loading state cho từng item
  isItemLoading(type: string, id: number, action: 'approve' | 'reject'): boolean {
    const loadingKey = `${type}_${id}_${action}`;
    return this.loadingItems.has(loadingKey);
  }
  
  // Method để set loading state cho từng tab
  private setLoadingState(type: string, isLoading: boolean): void {
    switch (type) {
      case 'boiDayHa':
        this.isLoadingBoiDayHa = isLoading;
        break;
      case 'boiDayCao':
        this.isLoadingBoiDayCao = isLoading;
        break;
      case 'epBoiDay':
        this.isLoadingEpBoiDay = isLoading;
        break;
    }
  }

  // Method để reload data sau khi approve/reject
  private reloadDataAfterAction(type: string): void {
    console.log(`Reloading data for type: ${type}`);
    
    // Reload data để chỉ hiển thị những item còn pending
    switch (type) {
      case 'boiDayHa':
        this.loadBoiDayHaData();
        break;
      case 'boiDayCao':
        this.loadBoiDayCaoData();
        break;
      case 'epBoiDay':
        this.loadEpBoiDayData();
        break;
    }
    
    // Hiển thị thông báo thành công
    console.log(`Data reloaded for ${type} - only pending items are displayed`);
  }
}
