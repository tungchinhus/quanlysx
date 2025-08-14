import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTabGroup } from '@angular/material/tabs';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { DSQuanDayService } from './ds-quan-day.service';
import { AuthServices } from '../../../shared/services/authen/auth.service';
import { WindingData, BangVeData } from '../models/winding.model';
import { WindingOperationPopupComponent, WindingOperationData } from './winding-operation-popup/winding-operation-popup.component';

@Component({
  selector: 'app-ds-quan-day',
  templateUrl: './ds-quan-day.component.html',
  styleUrls: ['./ds-quan-day.component.scss']
})
export class DSQuanDayComponent implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('tabGroup') tabGroup!: MatTabGroup;

  isAuthenticated = false;
  currentUser: any;
  currentUserRole: string = '';
  currentUserKhauSx: string = '';

  // Tab data
  selectedTabIndex = 0;
  newWindings: WindingData[] = [];
  inProgressWindings: WindingData[] = []; // Thêm danh sách quấn dây đang gia công
  processedWindings: WindingData[] = [];

  // Table data sources
  newWindingsDataSource = new MatTableDataSource<WindingData>([]);
  inProgressWindingsDataSource = new MatTableDataSource<WindingData>([]); // Thêm data source cho tab đang gia công
  processedWindingsDataSource = new MatTableDataSource<WindingData>([]);

  // Pagination
  pageSize = 5; // Default to 5 like in the image
  pageSizeOptions = [5, 10, 20];

  // Search - separate for each tab
  searchTerm = '';
  searchTermInProgress = ''; // Thêm search term cho tab đang gia công
  searchTermProcessed = '';

  // Autocomplete for processed windings
  filteredProcessedWindingsForAutocomplete: WindingData[] = [];

  // Displayed columns for new windings
  displayedColumnsNew = [
    'kyhieubangve',
    'congsuat',
    'tbkt',
    'dienap',
    'created_at',
    'actions'
  ];

  // Displayed columns for in progress windings
  displayedColumnsInProgress = [
    'kyhieubangve',
    'congsuat',
    'tbkt',
    'dienap',
    'created_at',
    'actions'
  ];

  // Displayed columns for processed windings
  displayedColumnsProcessed = [
    'kyhieubangve',
    'congsuat',
    'tbkt',
    'dienap',
    'user_update',
    'process_date',
    'actions'
  ];

  constructor(
    private dsQuanDayService: DSQuanDayService,
    private authService: AuthServices,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    console.log('DSQuanDayComponent ngOnInit called');
    this.checkAuthentication();
    this.loadData();
  }

  checkAuthentication(): void {
    this.isAuthenticated = this.authService.isLoggedIn();
    if (this.isAuthenticated) {
      this.currentUser = this.authService.getUserInfoFromStorage();
      this.currentUserRole = this.currentUser.role || 'user';
      this.currentUserKhauSx = this.currentUser.khau_sx || '';
      
      // Temporarily comment out winding access check for testing
      // if (!this.hasWindingAccess()) {
      //   this.isAuthenticated = false;
      //   console.log('User does not have access to winding operations');
      // }
    }
  }

  // Check if user has access to winding operations
  hasWindingAccess(): boolean {
    if (!this.currentUserKhauSx) return false;
    
    return this.currentUserKhauSx.includes('boidayha') || 
           this.currentUserKhauSx.includes('boidaycao') ||
           this.currentUserKhauSx.includes('quanday');
  }

  loadData(): void {
    console.log('loadData called, isAuthenticated:', this.isAuthenticated);
    if (!this.isAuthenticated) {
      console.log('User not authenticated, returning');
      return;
    }

    const userId = this.currentUser.userId || this.currentUser.Id || '';
    console.log('Loading data for userId:', userId);

    // Temporarily load data for testing without khau_sx check
    this.loadNewWindings(userId, 'ha');
    this.loadInProgressWindings(userId, 'ha'); // Thêm load dữ liệu cho tab đang gia công
    this.loadProcessedWindings(userId, 'ha');
    
    // Original logic commented out for testing
    // if (this.currentUserKhauSx.includes('boidayha')) {
    //   this.loadNewWindings(userId, 'ha');
    //   this.loadInProgressWindings(userId, 'ha');
    //   this.loadProcessedWindings(userId, 'ha');
    // } else if (this.currentUserKhauSx.includes('boidaycao')) {
    //   this.loadNewWindings(userId, 'cao');
    //   this.loadInProgressWindings(userId, 'cao');
    //   this.loadProcessedWindings(userId, 'cao');
    // }
  }

  loadNewWindings(userId: string, windingType: 'ha' | 'cao'): void {
    console.log('loadNewWindings called with:', { userId, windingType });
    this.dsQuanDayService.getNewWindings(userId, windingType).subscribe(data => {
      console.log('New windings data received:', data);
      this.newWindings = data;
      this.newWindingsDataSource.data = data;
      this.newWindingsDataSource.paginator = this.paginator;
      this.newWindingsDataSource.sort = this.sort;
    });
  }

  loadInProgressWindings(userId: string, windingType: 'ha' | 'cao'): void {
    console.log('loadInProgressWindings called with:', { userId, windingType });
    this.dsQuanDayService.getInProgressWindings(userId, windingType).subscribe(data => {
      console.log('In progress windings data received:', data);
      this.inProgressWindings = data;
      this.inProgressWindingsDataSource.data = data;
    });
  }


  loadProcessedWindings(userId: string, windingType: 'ha' | 'cao'): void {
    console.log('loadProcessedWindings called with:', { userId, windingType });
    this.dsQuanDayService.getCompletedWindings(userId, windingType).subscribe(data => {
      console.log('Processed windings data received:', data);
      this.processedWindings = data;
      this.processedWindingsDataSource.data = data;
      this.filteredProcessedWindingsForAutocomplete = data;
    });
  }

  onTabChange(event: any): void {
    this.selectedTabIndex = event.index;
  }

  // Search functionality for new windings tab
  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.newWindingsDataSource.filter = filterValue.trim().toLowerCase();
  }



  // Search functionality for processed windings tab
  filterAutoCompleteProcessed(): void {
    const filterValue = this.searchTermProcessed.toLowerCase();
    this.filteredProcessedWindingsForAutocomplete = this.processedWindings.filter(winding =>
      winding.kyhieubangve.toLowerCase().includes(filterValue) ||
      (winding.congsuat && winding.congsuat.toLowerCase().includes(filterValue)) ||
      (winding.tbkt && winding.tbkt.toLowerCase().includes(filterValue))
    );
  }

  // Autocomplete display function for processed windings
  displayFnProcessed(winding: WindingData): string {
    return winding ? winding.kyhieubangve : '';
  }

  // Handle autocomplete selection for processed windings
  onAutoCompleteSelectedProcessed(event: any): void {
    const selectedWinding = event.option.value;
    this.searchTermProcessed = selectedWinding.kyhieubangve;
    this.processedWindingsDataSource.filter = selectedWinding.kyhieubangve.toLowerCase();
  }

  // Pagination for new windings
  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
  }

  // Pagination for in progress windings
  onPageChangeInProgress(event: PageEvent): void {
    this.pageSize = event.pageSize;
  }

  // Pagination for processed windings
  onPageChangeProcessed(event: PageEvent): void {
    this.pageSize = event.pageSize;
  }

  // Search in progress windings
  searchInProgressWindings(): void {
    if (this.searchTermInProgress.trim() === '') {
      this.inProgressWindingsDataSource.data = this.inProgressWindings;
    } else {
      const filtered = this.inProgressWindings.filter(winding =>
        winding.kyhieubangve.toLowerCase().includes(this.searchTermInProgress.toLowerCase())
      );
      this.inProgressWindingsDataSource.data = filtered;
    }
  }

  // Open add winding dialog
  openAddWindingDialog(): void {
    // TODO: Implement add winding dialog
    alert('Chức năng thêm mới quấn dây sẽ được implement sau');
  }

  // Open winding detail dialog
  openWindingDetailDialog(winding: WindingData, mode: 'view' | 'edit'): void {
    // Get bang ve details first
    this.dsQuanDayService.getBangVeDetails(winding.kyhieubangve).subscribe(bangVeData => {
      this.openWindingOperationPopup(winding, bangVeData, mode);
    });
  }

  // Các method cũ đã được thay thế bằng openWindingOperationPopup

  // Open winding operation popup
  openWindingOperationPopup(winding: WindingData, bangVeData: BangVeData, mode: 'view' | 'edit'): void {
    const dialogData: WindingOperationData = {
      winding: winding,
      bangVe: bangVeData,
      mode: mode,
      userRole: this.currentUserRole,
      userKhauSx: this.currentUserKhauSx
    };

    const dialogRef = this.dialog.open(WindingOperationPopupComponent, {
      width: '90%',
      maxWidth: '1200px',
      height: '90%',
      data: dialogData,
      disableClose: false
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Handle result if needed
        console.log('Dialog closed with result:', result);
        // Refresh data if needed
        this.loadData();
      }
    });
  }

  // View processed winding details
  onViewProcessedDetails(winding: WindingData): void {
    // TODO: Implement view processed details
    alert(`Chi tiết xử lý cho: ${winding.kyhieubangve}`);
  }

  // Get winding type display name
  getWindingTypeDisplayName(): string {
    if (this.currentUserKhauSx.includes('boidayha')) {
      return 'Quấn dây hạ';
    } else if (this.currentUserKhauSx.includes('boidaycao')) {
      return 'Quấn dây cao';
    }
    return 'Quấn dây';
  }

  // Check if user has required role
  hasUserRole(): boolean {
    return this.currentUserRole === 'user' || this.currentUserRole === 'admin' || this.currentUserRole === 'manager';
  }

  // Go to login
  goToLogin(): void {
    // Implement navigation to login page
    console.log('Navigate to login');
  }
}
