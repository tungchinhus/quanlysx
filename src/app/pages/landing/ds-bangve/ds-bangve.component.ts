import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { BangVeComponent } from '../bang-ve/bang-ve.component';
import { DialogComponent } from 'src/app/shared/dialogs/dialog/dialog.component';
import { ActivatedRoute, Router } from '@angular/router';

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
}

@Component({
  selector: 'app-ds-bangve',
  templateUrl: './ds-bangve.component.html',
  styleUrls: ['./ds-bangve.component.scss']
})
export class DsBangveComponent implements OnInit {
  drawings: BangVeData[] = [
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
      created_at: new Date('2024-07-15')
    },
    {
      id: 4,
      kyhieubangve: 'BV-004',
      congsuat: 630,
      tbkt: 'TBKT-04',
      dienap: '10kV',
      soboiday: '5',
      bd_ha_trong: 'OK',
      bd_ha_ngoai: 'OK',
      bd_cao: 'Chưa',
      bd_ep: 'OK',
      bung_bd: 1,
      user_create: 'user2',
      trang_thai: true,
      created_at: new Date('2024-07-15')
    },
    {
      id: 5,
      kyhieubangve: 'BV-005',
      congsuat: 630,
      tbkt: 'TBKT-05',
      dienap: '10kV',
      soboiday: '5',
      bd_ha_trong: 'OK',
      bd_ha_ngoai: 'OK',
      bd_cao: 'Chưa',
      bd_ep: 'OK',
      bung_bd: 1,
      user_create: 'user2',
      trang_thai: true,
      created_at: new Date('2024-07-15')
    },
    {
      id: 6,
      kyhieubangve: 'BV-006',
      congsuat: 630,
      tbkt: 'TBKT-06',
      dienap: '10kV',
      soboiday: '5',
      bd_ha_trong: 'OK',
      bd_ha_ngoai: 'OK',
      bd_cao: 'Chưa',
      bd_ep: 'OK',
      bung_bd: 1,
      user_create: 'user2',
      trang_thai: true,
      created_at: new Date('2024-07-15')
    }
  ];

  displayedColumns: string[] = ['kyhieubangve', 'congsuat', 'tbkt', 'dienap', 'created_at', 'actions'];

  searchTerm: string = '';
  filteredDrawings: BangVeData[] = [];
  pagedDrawings: BangVeData[] = [];
  pageSize = 5;
  pageIndex = 0;

  // Autocomplete
  filteredOptions: string[] = [];
  filteredDrawingsForAutocomplete: BangVeData[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  dataSource: BangVeData[] = [];

  // Danh sách người dùng giả lập
  availableUsers: string[] = ['user_quanday_1', 'user_quanday_2', 'user_quanday_3', 'user_quanday_4', 'user_quanday_5'];

  constructor(
    public dialog: MatDialog,
    private _snackBar: MatSnackBar,
    private router:Router,
  ) { }

  ngOnInit(): void {
    this.filteredDrawings = this.drawings.slice();
    this.updatePagedDrawings();
    this.filteredOptions = this.drawings.map(d => d.kyhieubangve);
    this.filteredDrawingsForAutocomplete = this.drawings.slice();
    let userLogin = localStorage.getItem('rememberedUsername');
    this.dataSource = this.drawings.slice(); // Đảm bảo dataSource được khởi tạo
  }

  filterAutoComplete() {
    const value = this.searchTerm.toLowerCase();
    this.filteredDrawingsForAutocomplete = this.drawings.filter(d =>
      d.kyhieubangve.toLowerCase().includes(value) ||
      d.tbkt.toLowerCase().includes(value) ||
      d.dienap.toLowerCase().includes(value) ||
      d.user_create.toLowerCase().includes(value)
    );
    this.filteredOptions = this.filteredDrawingsForAutocomplete.map(d => d.kyhieubangve);
  }

  displayFn = (drawing: BangVeData): string => {
    return drawing ? drawing.kyhieubangve : '';
  }

  onAutoCompleteSelected(event: any) {
    const selectedDrawing = event.option.value;
    this.searchTerm = selectedDrawing.kyhieubangve;
    this.searchDrawings();
  }

  searchDrawings() {
    const value = this.searchTerm.trim().toLowerCase();
    this.filteredDrawings = this.drawings.filter(d =>
      d.kyhieubangve.toLowerCase().includes(value)
    );
    this.pageIndex = 0;
    this.updatePagedDrawings();
    if (this.paginator) this.paginator.firstPage();
  }

  updatePagedDrawings() {
    const start = this.pageIndex * this.pageSize;
    const end = start + this.pageSize;
    this.pagedDrawings = this.filteredDrawings.slice(start, end);
  }

  onPageChange(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.updatePagedDrawings();
  }

  addDrawing() {
    console.log('Drawing added');
  }
  editDrawing(d: BangVeData) {
    console.log('Drawing edited', d);
  }
  
  // Hàm này sẽ được gọi khi nhấn nút "Gia công"
  confirmGiaCong(drawing: BangVeData): void {
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

  // Logic gia công bảng vẽ, nhận thêm tham số người dùng thực hiện cho từng khâu
  processDrawing(drawing: BangVeData, userQuanday1: string, userQuanday2: string): void {
    console.log(`Bảng vẽ "${drawing.kyhieubangve}" đang được gia công.`);
    console.log(`Người quấn dây 1: ${userQuanday1}`);
    console.log(`Người quấn dây 2: ${userQuanday2}`);
    
    // Implement your processing logic here
    // Ví dụ: thay đổi trạng thái hoặc xóa khỏi danh sách
    let  go_bangve = this.drawings.filter(b => b.id === drawing.id);
    this.drawings = this.drawings.filter(b => b.id !== drawing.id);
    this.filteredDrawings = this.filteredDrawings.filter(b => b.id !== drawing.id);
    this.updatePagedDrawings();
    this.thongbao(`Đã chuyển bảng vẽ "${drawing.kyhieubangve}" thành công cho ${userQuanday1} và ${userQuanday2}!`, 'Đóng', 'success');
    this.router.navigate(['boi-day-ha'], { state: { drawings: go_bangve } });
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
        this.drawings = [
          ...this.drawings,
          { ...result, id: this.drawings.length > 0 ? Math.max(...this.drawings.map(b => b.id)) + 1 : 1 }
        ];
        this.filteredDrawings = this.drawings.slice();
        this.updatePagedDrawings();
        this.thongbao('Thêm bảng vẽ mới thành công!', 'Đóng', 'success');
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
      if (result) {
        const index = this.drawings.findIndex(b => b.id === result.id);
        if (index > -1) {
          this.drawings[index] = result;
          this.filteredDrawings = this.drawings.slice();
          this.updatePagedDrawings();
          this.thongbao('Cập nhật bảng vẽ thành công!', 'Đóng', 'success');
        }
      }
    });
  }

  deleteBangVe(bangVe: BangVeData): void {
    console.log('deleteBangVe called, consider using confirmGiaCong for processing or a dedicated confirm for deletion.');
  }

}