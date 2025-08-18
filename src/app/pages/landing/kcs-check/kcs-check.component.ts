import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { FormControl } from '@angular/forms';
import { AuthServices } from 'src/app/shared/services/authen/auth.service';
import { Router } from '@angular/router';
import { KcsCheckService, BoiDayHaData, BoiDayCaoData, EpBoiDayData } from './kcs-check.service';

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
  boiDayHaColumns = ['kyhieuquanday', 'congsuat', 'tbkt', 'dienap', 'quy_cach_day', 'so_soi_day', 'nha_san_xuat', 'ngay_san_xuat', 'trang_thai', 'actions'];
  boiDayCaoColumns = ['kyhieuquanday', 'congsuat', 'tbkt', 'dienap', 'quy_cach_day', 'so_soi_day', 'nha_san_xuat', 'ngay_san_xuat', 'trang_thai', 'actions'];
  epBoiDayColumns = ['kyhieuquanday', 'congsuat', 'tbkt', 'dienap', 'bd_ep', 'bung_bd', 'ngay_hoan_thanh', 'trang_thai', 'actions'];

  // Data arrays
  boiDayHaData: BoiDayHaData[] = [];
  boiDayCaoData: BoiDayCaoData[] = [];
  epBoiDayData: EpBoiDayData[] = [];

  // Loading states
  isLoadingBoiDayHa = false;
  isLoadingBoiDayCao = false;
  isLoadingEpBoiDay = false;

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
      this.currentUser = this.authService.getUserInfo() || this.authService.getUserInfoFromStorage();
      this.checkEpBoiDayPermission();
    }
  }

  private checkEpBoiDayPermission(): void {
    if (this.currentUser) {
      const khauSx = this.currentUser.khau_sx || '';
      const roleName = this.currentUser.role_name || '';
      
      this.hasEpBoiDayPermission = khauSx.includes('epboiday') || 
                                   khauSx.includes('boidayep') || 
                                   khauSx.includes('ep') ||
                                   roleName.includes('epboiday') ||
                                   roleName.includes('boidayep');
      
      console.log('KCS Check: EpBoiDay permission:', this.hasEpBoiDayPermission);
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
    
    this.kcsCheckService.approveItem(type, item.id).subscribe({
      next: (response) => {
        console.log('Approval successful:', response);
        // Update local data
        item.trang_thai = 'approved';
        this.refreshTableData(type);
      },
      error: (error) => {
        console.error('Approval failed:', error);
        // Handle error (show notification, etc.)
      }
    });
  }

  onReject(item: any, type: string): void {
    console.log('Reject item:', item, 'Type:', type);
    
    this.kcsCheckService.rejectItem(type, item.id).subscribe({
      next: (response) => {
        console.log('Rejection successful:', response);
        // Update local data
        item.trang_thai = 'rejected';
        this.refreshTableData(type);
      },
      error: (error) => {
        console.error('Rejection failed:', error);
        // Handle error (show notification, etc.)
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
        return 'primary';
      case 'rejected':
        return 'warn';
      case 'pending':
        return 'accent';
      default:
        return 'basic';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'approved':
        return 'Đã duyệt';
      case 'rejected':
        return 'Từ chối';
      case 'pending':
        return 'Chờ duyệt';
      default:
        return 'Không xác định';
    }
  }
}
