import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonService } from '../../../shared/services/common.service';
import { AuthServices } from '../../../shared/services/authen/auth.service';

@Component({
  selector: 'app-kcs-check',
  templateUrl: './kcs-check.component.html',
  styleUrls: ['./kcs-check.component.scss']
})
export class KcsCheckComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  // Search variables for each tab
  searchBangVe: string = '';
  searchKeyword: string = '';
  searchBangVeCao: string = '';
  searchKeywordCao: string = '';
  searchBangVeEp: string = '';
  searchKeywordEp: string = '';

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

  // Sample data - replace with actual API calls
  sampleBoiDayHaData = [
    {
      id: 1,
      kyhieuquanday: 'khâu quấn dây hạ',
      tenbangve: 'BV001',
      congsuat: '100',
      tbkt: 'TBKT001',
      nhasanxuat: 'GM',
      ngaysanxuat: new Date('2025-08-18'),
      ngaygiacong: new Date('2025-08-18'),
      trangthai: 'pending'
    },
    {
      id: 2,
      kyhieuquanday: 'khâu quấn dây hạ 2',
      tenbangve: 'BV002',
      congsuat: '200',
      tbkt: 'TBKT002',
      nhasanxuat: 'GM',
      ngaysanxuat: new Date('2025-08-19'),
      ngaygiacong: new Date('2025-08-19'),
      trangthai: 'approved'
    }
  ];

  sampleBoiDayCaoData = [
    {
      id: 3,
      kyhieuquanday: 'khâu quấn dây cao',
      tenbangve: 'BV003',
      congsuat: '150',
      tbkt: 'TBKT003',
      nhasanxuat: 'GM',
      ngaysanxuat: new Date('2025-08-20'),
      ngaygiacong: new Date('2025-08-20'),
      trangthai: 'pending'
    }
  ];

  sampleEpBoiDayData = [
    {
      id: 4,
      kyhieuquanday: 'khâu ép bối dây',
      tenbangve: 'BV004',
      congsuat: '300',
      tbkt: 'TBKT004',
      nhasanxuat: 'GM',
      ngaysanxuat: new Date('2025-08-21'),
      ngaygiacong: new Date('2025-08-21'),
      trangthai: 'rejected'
    }
  ];

  constructor(
    private commonService: CommonService,
    private authService: AuthServices,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  ngAfterViewInit() {
    // Connect paginators to data sources
    this.boiDayHaDataSource.paginator = this.paginator;
    this.boiDayCaoDataSource.paginator = this.paginator;
    this.epBoiDayDataSource.paginator = this.paginator;
  }

  loadData(): void {
    // Load sample data - replace with actual API calls
    this.boiDayHaDataSource.data = this.sampleBoiDayHaData;
    this.boiDayCaoDataSource.data = this.sampleBoiDayCaoData;
    this.epBoiDayDataSource.data = this.sampleEpBoiDayData;
  }

  // Search methods for Bối dây hạ
  onSearchBangVeChange(value: string): void {
    this.searchBangVe = value;
    this.filterBoiDayHaData();
  }

  onSearchChange(value: string): void {
    this.searchKeyword = value;
    this.filterBoiDayHaData();
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
    let filteredData = this.sampleBoiDayHaData;

    if (this.searchBangVe) {
      filteredData = filteredData.filter(item => 
        item.tenbangve?.toLowerCase().includes(this.searchBangVe.toLowerCase())
      );
    }

    if (this.searchKeyword) {
      filteredData = filteredData.filter(item => 
        item.kyhieuquanday?.toLowerCase().includes(this.searchKeyword.toLowerCase()) ||
        item.tbkt?.toLowerCase().includes(this.searchKeyword.toLowerCase())
      );
    }

    this.boiDayHaDataSource.data = filteredData;
  }

  filterBoiDayCaoData(): void {
    let filteredData = this.sampleBoiDayCaoData;

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
    let filteredData = this.sampleEpBoiDayData;

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
    // Reset search when changing tabs
    this.resetSearch();
  }

  resetSearch(): void {
    this.searchBangVe = '';
    this.searchKeyword = '';
    this.searchBangVeCao = '';
    this.searchKeywordCao = '';
    this.searchBangVeEp = '';
    this.searchKeywordEp = '';
    this.loadData();
  }

  // Action methods
  viewBangVeDetails(element: any): void {
    console.log('Viewing details for:', element);
    this.snackBar.open(`Xem chi tiết bảng vẽ: ${element.tenbangve}`, 'Đóng', {
      duration: 3000
    });
  }

  approveKcs(element: any): void {
    console.log('Approving KCS for:', element);
    this.snackBar.open(`Đã duyệt KCS cho: ${element.tenbangve}`, 'Đóng', {
      duration: 3000
    });
  }

  rejectKcs(element: any): void {
    console.log('Rejecting KCS for:', element);
    this.snackBar.open(`Đã từ chối KCS cho: ${element.tenbangve}`, 'Đóng', {
      duration: 3000
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
