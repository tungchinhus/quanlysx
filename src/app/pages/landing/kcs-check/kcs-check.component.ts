import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { CommonService } from '../../../shared/services/common.service';
import { AuthServices } from '../../../shared/services/authen/auth.service';
import { KcsCheckService, SearchCriteria, BoiDayHaPendingResponse, BoiDayHaPendingSearchResponse } from './kcs-check.service';
import { ApproveDialogComponent, ApproveDialogData } from './approve-dialog/approve-dialog.component';
import { RejectDialogComponent, RejectDialogData } from './reject-dialog/reject-dialog.component';

@Component({
  selector: 'app-kcs-check',
  templateUrl: './kcs-check.component.html',
  styleUrls: ['./kcs-check.component.scss']
})
export class KcsCheckComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  
  // Make Math available in template
  Math = Math;

  // Search variables for each tab
  searchBangVe: string = '';
  searchKeyword: string = '';
  searchBangVeCao: string = '';
  searchKeywordCao: string = '';
  searchBangVeEp: string = '';
  searchKeywordEp: string = '';

  // Pagination variables
  currentPage = 1;
  pageSize = 10;
  totalCount = 0;
  totalPages = 0;

  // Data sources for each tab
  boiDayHaDataSource = new MatTableDataSource<any>([]);
  boiDayCaoDataSource = new MatTableDataSource<any>([]);
  epBoiDayDataSource = new MatTableDataSource<any>([]);

  // Displayed columns for each tab
  boiDayHaDisplayedColumns: string[] = [
    'kyhieuQuanDay', 'tenBangVe', 'congSuat', 'tbkt', 
    'nhaSanXuat', 'ngaySanXuat', 'ngayGiaCong', 'trangThai', 'thaoTac'
  ];
  
  boiDayCaoDisplayedColumns: string[] = [
    'kyhieuQuanDay', 'tenBangVe', 'congSuat', 'tbkt', 
    'nhaSanXuat', 'ngaySanXuat', 'ngayGiaCong', 'trangThai', 'thaoTac'
  ];
  
  epBoiDayDisplayedColumns: string[] = [
    'kyhieuQuanDay', 'tenBangVe', 'congSuat', 'tbkt', 
    'nhaSanXuat', 'ngaySanXuat', 'ngayGiaCong', 'trangThai', 'thaoTac'
  ];

  // Loading states
  isLoading = false;
  currentTab = 'boiDayHa';

  constructor(
    private commonService: CommonService,
    private authService: AuthServices,
    private kcsService: KcsCheckService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  ngAfterViewInit(): void {
    // Connect paginators to data sources
    this.boiDayHaDataSource.paginator = this.paginator;
    this.boiDayCaoDataSource.paginator = this.paginator;
    this.epBoiDayDataSource.paginator = this.paginator;
  }

  loadData(): void {
    this.isLoading = true;
    
    switch (this.currentTab) {
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
  }

  loadBoiDayHaData(): void {
    this.isLoading = true;
    
    // Use new API method for pending items
    this.kcsService.getBoiDayHaPending().subscribe({
      next: (response: BoiDayHaPendingResponse) => {
        if (response.isSuccess) {
          // Convert to legacy format for backward compatibility
          const legacyData = this.kcsService.convertToLegacyFormat(response.data);
          this.boiDayHaDataSource.data = legacyData;
          this.totalCount = response.totalCount;
          this.totalPages = Math.ceil(this.totalCount / this.pageSize);
          
          console.log(`Loaded ${legacyData.length} BoiDayHa pending items`);
        } else {
          console.error('Failed to load BoiDayHa data:', response.message);
          this.snackBar.open(response.message || 'Lỗi khi tải dữ liệu', 'Đóng', { duration: 3000 });
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading BoiDayHa data:', error);
        this.snackBar.open('Lỗi khi tải dữ liệu', 'Đóng', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  searchBoiDayHaData(): void {
    this.isLoading = true;
    
    const searchCriteria: SearchCriteria = {
      searchByDrawingName: this.searchBangVe || undefined,
      searchByWindingSymbolOrTBKT: this.searchKeyword || undefined,
      pageNumber: this.currentPage,
      pageSize: this.pageSize
    };

    this.kcsService.searchBoiDayHaPending(searchCriteria).subscribe({
      next: (response: BoiDayHaPendingSearchResponse) => {
        if (response.isSuccess) {
          // Convert to legacy format for backward compatibility
          const legacyData = this.kcsService.convertToLegacyFormat(response.data);
          this.boiDayHaDataSource.data = legacyData;
          this.totalCount = response.totalCount;
          this.totalPages = response.totalPages;
          this.currentPage = response.pageNumber;
          this.pageSize = response.pageSize;
          
          console.log(`Search results: ${legacyData.length} items found`);
        } else {
          console.error('Search failed:', response.message);
          this.snackBar.open(response.message || 'Lỗi khi tìm kiếm', 'Đóng', { duration: 3000 });
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error searching BoiDayHa data:', error);
        this.snackBar.open('Lỗi khi tìm kiếm', 'Đóng', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  loadBoiDayCaoData(): void {
    this.isLoading = true;
    this.kcsService.getBoiDayCaoData().subscribe({
      next: (data) => {
        this.boiDayCaoDataSource.data = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading BoiDayCao data:', error);
        this.snackBar.open('Lỗi khi tải dữ liệu', 'Đóng', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  loadEpBoiDayData(): void {
    this.isLoading = true;
    this.kcsService.getEpBoiDayData().subscribe({
      next: (data) => {
        this.epBoiDayDataSource.data = data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading EpBoiDay data:', error);
        this.snackBar.open('Lỗi khi tải dữ liệu', 'Đóng', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  // Search methods for Bối dây hạ
  onSearchBangVeChange(value: string): void {
    this.searchBangVe = value;
    this.currentPage = 1; // Reset to first page
    this.searchBoiDayHaData();
  }

  onSearchChange(value: string): void {
    this.searchKeyword = value;
    this.currentPage = 1; // Reset to first page
    this.searchBoiDayHaData();
  }

  // Search methods for Bối dây cao
  onSearchBangVeCaoChange(value: string): void {
    this.searchBangVeCao = value;
    this.filterBoiDayCaoData();
  }

  onSearchCaoChange(value: string): void {
    this.searchKeywordCao = value;
    this.filterBoiDayCaoData();
  }

  // Search methods for Ép bối dây
  onSearchBangVeEpChange(value: string): void {
    this.searchBangVeEp = value;
    this.filterEpBoiDayData();
  }

  onSearchEpChange(value: string): void {
    this.searchKeywordEp = value;
    this.filterEpBoiDayData();
  }

  // Filter methods for each tab
  filterBoiDayHaData(): void {
    // For BoiDayHa, use the new search API
    this.searchBoiDayHaData();
  }

  filterBoiDayCaoData(): void {
    let filteredData = this.boiDayCaoDataSource.data;

    if (this.searchBangVeCao) {
      filteredData = filteredData.filter(item => 
        item.tenbangve?.toLowerCase().includes(this.searchBangVeCao.toLowerCase())
      );
    }

    if (this.searchKeywordCao) {
      filteredData = filteredData.filter(item => 
        item.kyhieuquanday?.toLowerCase().includes(this.searchKeywordCao.toLowerCase()) ||
        item.tbkt?.toLowerCase().includes(this.searchKeywordCao.toLowerCase())
      );
    }

    this.boiDayCaoDataSource.data = filteredData;
  }

  filterEpBoiDayData(): void {
    let filteredData = this.epBoiDayDataSource.data;

    if (this.searchBangVeEp) {
      filteredData = filteredData.filter(item => 
        item.tenbangve?.toLowerCase().includes(this.searchBangVeEp.toLowerCase())
      );
    }

    if (this.searchKeywordEp) {
      filteredData = filteredData.filter(item => 
        item.kyhieuquanday?.toLowerCase().includes(this.searchKeywordEp.toLowerCase()) ||
        item.tbkt?.toLowerCase().includes(this.searchKeywordEp.toLowerCase())
      );
    }

    this.epBoiDayDataSource.data = filteredData;
  }

  onTabChange(event: MatTabChangeEvent): void {
    console.log('Tab changed to:', event.tab.textLabel);
    this.currentTab = this.getTabKey(event.tab.textLabel);
    // Reset search when changing tabs
    this.resetSearch();
    this.loadData();
  }

  getTabKey(tabLabel: string): string {
    switch (tabLabel) {
      case 'Bối dây hạ':
        return 'boiDayHa';
      case 'Bối dây cao':
        return 'boiDayCao';
      case 'Ép bối dây':
        return 'epBoiDay';
      default:
        return 'boiDayHa';
    }
  }

  resetSearch(): void {
    this.searchBangVe = '';
    this.searchKeyword = '';
    this.searchBangVeCao = '';
    this.searchKeywordCao = '';
    this.searchBangVeEp = '';
    this.searchKeywordEp = '';
    this.currentPage = 1;
    this.pageSize = 10;
  }

  // Pagination handler
  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex + 1;
    this.pageSize = event.pageSize;
    
    if (this.currentTab === 'boiDayHa') {
      this.searchBoiDayHaData();
    }
  }

  // Action methods
  viewBangVeDetails(element: any): void {
    console.log('Viewing details for:', element);
    this.snackBar.open(`Xem chi tiết bảng vẽ: ${element.kyhieuquanday}`, 'Đóng', {
      duration: 3000
    });
  }

  approveKcs(element: any): void {
    console.log('Opening approve dialog for:', element);
    
    const dialogData: ApproveDialogData = {
      itemId: element.id,
      itemName: element.kyhieuquanday,
      itemType: this.currentTab
    };

    const dialogRef = this.dialog.open(ApproveDialogComponent, {
      width: '600px',
      data: dialogData,
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.success) {
        this.snackBar.open(result.message, 'Đóng', {
          duration: 3000
        });
        // Refresh data after approval
        this.loadData();
      } else if (result && !result.success) {
        this.snackBar.open(result.message, 'Đóng', {
          duration: 3000
        });
      }
    });
  }

  rejectKcs(element: any): void {
    console.log('Opening reject dialog for:', element);
    
    const dialogData: RejectDialogData = {
      itemId: element.id,
      itemName: element.kyhieuquanday,
      itemType: this.currentTab
    };

    const dialogRef = this.dialog.open(RejectDialogComponent, {
      width: '700px',
      data: dialogData,
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.success) {
        this.snackBar.open(result.message, 'Đóng', {
          duration: 3000
        });
        // Refresh data after rejection
        this.loadData();
      } else if (result && !result.success) {
        this.snackBar.open(result.message, 'Đóng', {
          duration: 3000
        });
      }
    });
  }

  // Status helper methods
  getStatusClass(status: string): string {
    switch (status) {
      case 'approved':
        return 'status-approved';
      case 'rejected':
        return 'status-rejected';
      case 'pending':
      default:
        return 'status-pending';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'approved':
        return 'Đã duyệt';
      case 'rejected':
        return 'Từ chối';
      case 'pending':
      default:
        return 'Chờ kiểm tra';
    }
  }
}
