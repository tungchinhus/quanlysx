import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BangVeData } from '../ds-bangve/ds-bangve.component';
import { CommonService } from 'src/app/shared/services/common.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface Worker {
  id: number;
  name: string;
  username?: string;
  email?: string;
  role?: string;
  code?: string;
  department?: string;
}

interface ApiResponse {
  isSuccess: boolean;
  message: string;
  users: Worker[];
  totalCount: number;
  roleName: string;
}

@Component({
  selector: 'app-boi-day-ha',
  templateUrl: './boi-day-ha.component.html',
  styleUrls: ['./boi-day-ha.component.scss']
})
export class BoiDayHaComponent implements OnInit {
  @Input() isActive: boolean = false;
  @Output() isValid = new EventEmitter<boolean>();

  title = 'Bối dây hạ';
  windingForm!: FormGroup;
  bangve: BangVeData[] = [];

  nguoiGiaCongOptions: Worker[] = [];
  isLoadingWorkers: boolean = false;

  boiDayHaControl = new FormControl('', [Validators.required]);

  constructor(
    private fb: FormBuilder, 
    private router: Router,
    private commonService: CommonService,
    private http: HttpClient
  ) {
    this.windingForm = this.fb.group({
      boiDayHa: this.boiDayHaControl
    });
    const navigation = this.router.getCurrentNavigation();
    // Lấy data drawing từ navigation state
    const drawing = navigation?.extras?.state?.['drawing'];
    if (drawing) {
      this.bangve = [drawing]; // Convert single drawing to array
    }
    console.log('Bảng vẽ:', this.bangve);
  }

  ngOnInit() {
    console.log('Bảng vẽ:', this.bangve);
    console.log('Form:', this.windingForm);
    console.log('Controls:', this.windingForm.controls);
    
    // Lấy thông tin user đang đăng nhập
    const currentUser = this.getCurrentUser();
    const today = new Date();
    
    console.log('Current User:', currentUser);
    console.log('Today Date:', today);
    
    // Load danh sách người gia công từ API
    this.loadWorkers();
    
    this.windingForm = this.fb.group({
      congSuat: [{ value: this.bangve[0]?.congsuat, disabled: true }],
      TBKT: [{ value: this.bangve[0]?.tbkt, disabled: true }],
      dienAp: [{ value: this.bangve[0]?.dienap, disabled: true }],
      soBoiDay: [{ value: this.bangve[0]?.soboiday, disabled: true }],

      ngayGiaCong: [{ value: today.toLocaleDateString('vi-VN'), disabled: true }],
      nguoiGiaCong: [{ value: currentUser.name, disabled: true }],
      kyHieuBV: [{ value: this.bangve[0]?.kyhieubangve + '-065', disabled: true }],
      quyCachDay: [null, Validators.required],
      soSoiDay: [null, [Validators.required, Validators.min(1)]],
      ngaySanXuat: [null, Validators.required],
      nhaSanXuat: [null, Validators.required],
      chuViKhuon: [null, [Validators.required, Validators.min(0)]],
      ktBungBdTruoc: [null], // Changed from [{ value: null, disabled: true }]
      bungBdSau: [null, Validators.required],
      chieuQuanDay: ['trai', Validators.required], // Default to 'trai'
      mayQuanDay: [null, Validators.required],
      // QTD Hạ - Xung quanh
      xqDay2: [null],
      xqDay3: [null],
      xqDay4: [null],
      xqDay6: [null],
      // QTD Hạ - Hai đầu
      hdDay2: [null],
      hdDay3: [null],
      hdDay4: [null],
      hdDay6: [null],
      // Các thông số kỹ thuật bổ sung
      ktBdHaTrongBv1: [''],
      ktBdHaTrongBv2: [''],
      ktBdHaTrongBv3: [''],
      cvBdHa1p: [''],
      cvBdHa2p: [''],
      cvBdHa3p: [''],
      ktBdHaNgoaiBv1: [''],
      ktBdHaNgoaiBv2: [''],
      ktBdHaNgoaiBv3: [''],
      ktBdHaNgoaiBv4: [''],
      dienTroRa: [null],
      dienTroRb: [null],
      dienTroRc: [null],
      doLechDienTro: [null]
    });
    
    // Debug: Kiểm tra giá trị sau khi set
    console.log('Form after setup - ngayGiaCong:', this.windingForm.get('ngayGiaCong')?.value);
    console.log('Form after setup - nguoiGiaCong:', this.windingForm.get('nguoiGiaCong')?.value);
    console.log('Form after setup - soBoiDay:', this.windingForm.get('soBoiDay')?.value);
    console.log('Bangve data:', this.bangve);
    console.log('Bangve[0]?.soboiday:', this.bangve[0]?.soboiday);
    console.log('All bangve[0] properties:', Object.keys(this.bangve[0] || {}));
    
    this.windingForm.get('chuViKhuon')?.valueChanges.subscribe(value => {
      const ktBungBdTruocControl = this.windingForm.get('ktBungBdTruoc');
      if (value !== null && value !== '' && value !== undefined) {
        ktBungBdTruocControl?.disable();
      } else {
        ktBungBdTruocControl?.disable();
        ktBungBdTruocControl?.setValue(null);
      }
    });

    // Emit form validity changes
    this.windingForm.statusChanges.subscribe(status => {
      this.isValid.emit(status === 'VALID');
    });
    // Emit initial validity
    this.isValid.emit(this.windingForm.valid);
  }

  loadWorkers(): void {
    this.isLoadingWorkers = true;
    
    // Debug: Kiểm tra token
    const token = localStorage.getItem('accessToken');
    console.log('Access Token:', token ? 'Present' : 'Missing');
    
    // Gọi API để lấy danh sách người gia công
    this.getWorkers().subscribe({
      next: (workers) => {
        this.nguoiGiaCongOptions = workers;
        this.isLoadingWorkers = false;
        console.log('Danh sách người gia công:', workers);
        
        // Debug: Kiểm tra cấu trúc dữ liệu của từng worker
        workers.forEach((worker, index) => {
          console.log(`Worker ${index}:`, {
            id: worker.id,
            name: worker.name,
            username: worker.username,
            email: worker.email,
            displayName: this.getWorkerDisplayName(worker)
          });
        });
      },
      error: (error) => {
        this.isLoadingWorkers = false;
        // Fallback to default list if API fails
        this.nguoiGiaCongOptions = [
          { id: 1, name: 'Nguyễn Văn A' },
          { id: 2, name: 'Trần Thị B' },
          { id: 3, name: 'Lê Văn C' }
        ];
      }
    });
  }

  getWorkers(): Observable<Worker[]> {
    // Thay đổi URL API theo endpoint thực tế của bạn
    const apiUrl = `${this.commonService.getServerAPIURL()}api/Account/users-by-role?roleName=User`;
    
    // Thêm headers authentication
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('accessToken') || ''}`
    };
    
    return this.http.get<ApiResponse>(apiUrl, { headers }).pipe(
      map(response => response.users) // Extract users array from response
    );
  }

  // Helper method để hiển thị tên người gia công trong select
  getWorkerDisplayName(worker: Worker | null | undefined): string {
    if (!worker) {
      return 'Chưa chọn người gia công';
    }
    
    // Ưu tiên hiển thị name, sau đó username, email, cuối cùng là User ID
    if (worker.name && worker.name.trim() !== '') {
      return worker.name;
    }
    
    if (worker.username && worker.username.trim() !== '') {
      return worker.username;
    }
    
    if (worker.email && worker.email.trim() !== '') {
      return worker.email;
    }
    
    return `User ${worker.id}`;
  }

  getCurrentUser(): Worker {
    // Lấy thông tin user đang đăng nhập từ localStorage
    const username = localStorage.getItem('rememberedUsername') || '';
    const userId = localStorage.getItem('userID') || '0';
    
    return {
      id: parseInt(userId),
      name: username,
      username: username,
      email: localStorage.getItem('email') || '',
      role: localStorage.getItem('userRole') || 'User'
    };
  }
  onSubmit(): void {
    if (this.windingForm.valid) {
      console.log('Form Submitted!', this.windingForm.value);
      // Here you would typically send the data to a backend service
      alert('Thông tin đã được lưu thành công!'); // Using alert for demo purposes
    } else {
      console.log('Form is invalid');
      // Mark all fields as touched to display validation errors
      this.windingForm.markAllAsTouched();
    }
  }

  giacongboidaycao(){ 
    console.log('Giao công bối dây hạ');
    this.isActive = false;
    this.isValid.emit(true);
    this.commonService.thongbao('Gia công bối dây hạ thành công!', 'Đóng', 'success');
    this.router.navigate(['ds-bang-ve']);
  }
}