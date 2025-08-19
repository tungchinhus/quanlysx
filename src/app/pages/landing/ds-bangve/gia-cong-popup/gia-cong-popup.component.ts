import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AuthServices } from 'src/app/shared/services/authen/auth.service';
import { CommonService } from 'src/app/shared/services/common.service';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface Worker {
  id: number;
  userId?: number; // Thêm field userId
  name: string;
  username?: string;
  email?: string;
  role?: string;
  code?: string;
  department?: string;
  khau_sx?: string; // Thêm field khau_sx để phân loại
  LastName?: string;
  FirstName?: string;
}

interface ApiResponse {
  users: Worker[];
}

@Component({
  selector: 'app-gia-cong-popup',
  templateUrl: './gia-cong-popup.component.html',
  styleUrls: ['./gia-cong-popup.component.scss']
})
export class GiaCongPopupComponent implements OnInit {
  giaCongForm!: FormGroup;
  nguoiGiaCongOptions: Worker[] = [];
  quandayhaUsers: Worker[] = []; // Danh sách user cho bối dây hạ
  quandaycaoUsers: Worker[] = []; // Danh sách user cho bối dây cao
  isLoadingWorkers: boolean = false;
  hasPermission: boolean = false;

  constructor(
    private fb: FormBuilder,
    public dialogRef: MatDialogRef<GiaCongPopupComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private authService: AuthServices,
    private commonService: CommonService,
    private http: HttpClient
  ) {
    this.giaCongForm = this.fb.group({
      boiDayHa: ['', Validators.required],
      boiDayCao: ['', Validators.required]
    });
  }

  ngOnInit() {
    // Kiểm tra quyền admin hoặc manager
    this.hasPermission = this.hasAdminOrManagerRole();
    
    if (!this.hasPermission) {
      this.commonService.thongbao('Bạn không có quyền thực hiện chức năng này. Chỉ admin hoặc manager mới được phép.', 'Đóng', 'error');
      this.dialogRef.close();
      return;
    }

    // Load danh sách người gia công
    this.loadWorkers();
    
    // Subscribe to form changes to validate user selection
    this.giaCongForm.valueChanges.subscribe(() => {
      console.log('Form values changed, validating...');
      this.validateUserSelection();
      // Force refresh validation state
      this.forceValidationRefresh();
    });
  }

  // Method để force refresh validation state
  private forceValidationRefresh(): void {
    // Trigger change detection để cập nhật UI
    setTimeout(() => {
      this.giaCongForm.updateValueAndValidity();
      console.log('Validation refreshed');
      console.log('Form valid:', this.giaCongForm.valid);
      console.log('isFormValidForSubmission:', this.isFormValidForSubmission);
    }, 100);
  }

  // Kiểm tra quyền admin hoặc manager
  hasAdminOrManagerRole(): boolean {
    const userInfo = this.authService.getUserInfo();
    const userRole = localStorage.getItem('role');
    const roles = userInfo?.roles || [];
    
    // Kiểm tra role từ userInfo trước
    if (roles && roles.length > 0) {
      return roles.some((role: string) => 
        role.toLowerCase() === 'admin' || 
        role.toLowerCase() === 'manager' ||
        role.toLowerCase() === 'administrator'
      );
    }
    
    // Fallback: kiểm tra role từ localStorage
    if (userRole) {
      return userRole.toLowerCase() === 'admin' || 
             userRole.toLowerCase() === 'manager' ||
             userRole.toLowerCase() === 'administrator';
    }
    
    return false;
  }

  loadWorkers(): void {
    this.isLoadingWorkers = true;
    
    // Gọi API để lấy danh sách người gia công
    this.getWorkers().subscribe({
      next: (workers) => {
        // Lọc chỉ lấy user có role là 'user' (không phải admin/manager)
        this.nguoiGiaCongOptions = workers.filter(worker => 
          worker.role?.toLowerCase() === 'user' || 
          !worker.role || // Nếu không có role, coi như là user thường
          worker.role?.toLowerCase() !== 'admin' && 
          worker.role?.toLowerCase() !== 'manager'
        );
        
        // Phân loại user theo khau_sx
        this.quandayhaUsers = this.nguoiGiaCongOptions.filter(worker => 
          worker.khau_sx?.toLowerCase() === 'quandayha' ||
          worker.khau_sx?.toLowerCase() === 'boidayha'
        );
        
        this.quandaycaoUsers = this.nguoiGiaCongOptions.filter(worker => 
          worker.khau_sx?.toLowerCase() === 'quandaycao' ||
          worker.khau_sx?.toLowerCase() === 'boidaycao'
        );
        
        console.log('All workers from API:', workers);
        console.log('Filtered workers (role=user):', this.nguoiGiaCongOptions);
        console.log('Quan day ha users:', this.quandayhaUsers);
        console.log('Quan day cao users:', this.quandaycaoUsers);
        
        // Log thông tin chi tiết về workers được lọc
        this.logWorkerDetails();
        
        // Kiểm tra xem có worker nào được load không
        this.checkWorkersAvailability();
        
        this.isLoadingWorkers = false;
      },
      error: (error) => {
        console.error('Lỗi khi tải danh sách người gia công:', error);
        this.isLoadingWorkers = false;
      }
    });
  }

  getWorkers(): Observable<Worker[]> {
    // Gọi API để lấy danh sách user có role là 'User' (không phải admin/manager)
    const apiUrl = `${this.commonService.getServerAPIURL()}api/Account/users-by-role-public?roleName=User`;
    
    console.log('Calling API to get workers with role=User:', apiUrl);
    console.log('Expected fields: id, userId, name, username, email, role, code, department, khau_sx');
    
    // Thêm headers authentication
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('accessToken') || ''}`
    };
    
    return this.http.get<ApiResponse>(apiUrl, { headers }).pipe(
      map(response => {
        console.log('API response for workers:', response);
        
        // Đảm bảo mỗi worker có đầy đủ thông tin
        const workers = response.users || [];
        workers.forEach(worker => {
          // Đảm bảo field name không bị undefined và tạo tên duy nhất
          if (!worker.name || worker.name.trim() === '') {
            if (worker.FirstName && worker.LastName) {
              worker.name = `${worker.FirstName} ${worker.LastName}`;
            } else if (worker.username && worker.username.trim() !== '') {
              worker.name = worker.username;
            } else if (worker.email && worker.email.trim() !== '') {
              worker.name = worker.email;
            } else {
              worker.name = `User ${worker.id}`;
            }
          }
          
          // Tạo tên duy nhất bằng cách thêm khau_sx prefix nếu có
          if (worker.khau_sx && worker.khau_sx.trim() !== '') {
            const khauSxPrefix = worker.khau_sx.toLowerCase();
            // Chỉ thêm prefix nếu chưa có
            if (!worker.name.toLowerCase().startsWith(khauSxPrefix)) {
              worker.name = `${khauSxPrefix} ${worker.name}`;
            }
          }
        });
        
        return workers;
      })
    );
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onConfirm(): void {
    console.log('=== POPUP onConfirm called ===');
    console.log('Form valid:', this.giaCongForm.valid);
    console.log('isFormValidForSubmission:', this.isFormValidForSubmission);
    console.log('Form values:', this.giaCongForm.value);
    
    if (this.isFormValidForSubmission) {
      const formValue = this.giaCongForm.value;
      console.log('Form is valid, preparing to close with data:', formValue);
      console.log('boiDayHa details:', {
        id: formValue.boiDayHa?.id,
        userId: formValue.boiDayHa?.userId,
        name: formValue.boiDayHa?.name,
        email: formValue.boiDayHa?.email
      });
      console.log('boiDayCao details:', {
        id: formValue.boiDayCao?.id,
        userId: formValue.boiDayCao?.userId,
        name: formValue.boiDayCao?.name,
        email: formValue.boiDayCao?.email
      });
      
      const closeData = {
        confirmed: true,
        boiDayHa: formValue.boiDayHa,
        boiDayCao: formValue.boiDayCao
      };
      
      console.log('Closing popup with data:', closeData);
      this.dialogRef.close(closeData);
    } else {
      console.log('Form validation failed, showing error messages');
      // Kiểm tra từng trường hợp lỗi để hiển thị thông báo phù hợp
      const boiDayHa = this.giaCongForm.get('boiDayHa')?.value;
      const boiDayCao = this.giaCongForm.get('boiDayCao')?.value;
      
      console.log('Form validation failed:');
      console.log('boiDayHa:', boiDayHa);
      console.log('boiDayCao:', boiDayCao);
      console.log('boiDayHa errors:', this.giaCongForm.get('boiDayHa')?.errors);
      console.log('boiDayCao errors:', this.giaCongForm.get('boiDayCao')?.errors);
      
      if (!boiDayHa) {
        this.commonService.thongbao('Vui lòng chọn người thực hiện bối dây hạ.', 'Đóng', 'warning');
      } else if (!boiDayCao) {
        this.commonService.thongbao('Vui lòng chọn người thực hiện bối dây cao.', 'Đóng', 'warning');
      } else if (this.giaCongForm.get('boiDayCao')?.hasError('sameUser')) {
        this.commonService.thongbao('Không thể chọn cùng một người cho cả hai khâu. Vui lòng chọn người khác nhau.', 'Đóng', 'warning');
      } else {
        this.commonService.thongbao('Vui lòng kiểm tra lại thông tin đã nhập.', 'Đóng', 'warning');
      }
    }
  }

  // Helper method để hiển thị tên người gia công trong select
  getWorkerDisplayName(worker: Worker): string {
    let displayName = '';
    
    // Ưu tiên sử dụng name đã được xử lý từ getWorkers
    if (worker.name && worker.name.trim() !== '') {
      displayName = worker.name;
    } else if (worker.FirstName && worker.LastName) {
      displayName = `${worker.FirstName} ${worker.LastName}`;
    } else if (worker.username && worker.username.trim() !== '') {
      displayName = worker.username;
    } else if (worker.email && worker.email.trim() !== '') {
      displayName = worker.email;
    } else {
      displayName = `User ID: ${worker.id}`;
    }
    
    // Thêm thông tin role nếu có
    if (worker.role && worker.role.trim() !== '') {
      displayName += ` (${worker.role})`;
    }
    
    return displayName;
  }

  // Kiểm tra form có hợp lệ và 2 user khác nhau
  get isFormValidForSubmission(): boolean {
    console.log('=== Checking isFormValidForSubmission ===');
    console.log('Form valid:', this.giaCongForm.valid);
    
    if (!this.giaCongForm.valid) {
      console.log('Form is not valid, returning false');
      return false;
    }
    
    const boiDayHa = this.giaCongForm.get('boiDayHa')?.value;
    const boiDayCao = this.giaCongForm.get('boiDayCao')?.value;
    
    console.log('Checking form validity:');
    console.log('boiDayHa:', boiDayHa);
    console.log('boiDayCao:', boiDayCao);
    console.log('boiDayHa type:', typeof boiDayHa);
    console.log('boiDayCao type:', typeof boiDayCao);
    
    // Kiểm tra cả hai trường đã được chọn
    if (!boiDayHa || !boiDayCao) {
      console.log('One or both fields are empty, returning false');
      return false;
    }
    
    // Kiểm tra 2 user phải khác nhau - so sánh nhiều trường
    const areDifferent = this.areUsersDifferent(boiDayHa, boiDayCao);
    console.log('Are users different?', areDifferent);
    console.log('Final result:', areDifferent);
    
    return areDifferent;
  }

  // Method để kiểm tra 2 user có khác nhau không
  private areUsersDifferent(user1: Worker, user2: Worker): boolean {
    console.log('=== Comparing users ===');
    console.log('User1:', user1);
    console.log('User2:', user2);
    console.log('User1 ID:', user1?.id, 'Type:', typeof user1?.id);
    console.log('User2 ID:', user2?.id, 'Type:', typeof user2?.id);
    console.log('User1 userId:', user1?.userId, 'Type:', typeof user1?.userId);
    console.log('User2 userId:', user2?.userId, 'Type:', typeof user2?.userId);
    console.log('User1 khau_sx:', user1?.khau_sx);
    console.log('User2 khau_sx:', user2?.khau_sx);
    console.log('User1 name:', user1?.name);
    console.log('User2 name:', user2?.name);
    console.log('User1 FirstName:', user1?.FirstName);
    console.log('User2 FirstName:', user2?.FirstName);
    console.log('User1 LastName:', user1?.LastName);
    console.log('User2 LastName:', user2?.LastName);
    
    // So sánh ID trước (quan trọng nhất)
    if (user1.id !== user2.id) {
      console.log('Users have different IDs, returning true');
      return true;
    }
    
    // So sánh userId nếu có
    if (user1.userId && user2.userId && user1.userId !== user2.userId) {
      console.log('Users have different userIds, returning true');
      return true;
    }
    
    // So sánh FirstName + LastName nếu có
    if (user1.FirstName && user2.FirstName && user1.FirstName !== user2.FirstName) {
      console.log('Users have different FirstNames, returning true');
      return true;
    }
    
    if (user1.LastName && user2.LastName && user1.LastName !== user2.LastName) {
      console.log('Users have different LastNames, returning true');
      return true;
    }
    
    // So sánh name nếu có
    if (user1.name && user2.name && user1.name !== user2.name) {
      console.log('Users have different names, returning true');
      return true;
    }
    
    // So sánh email
    if (user1.email && user2.email && user1.email !== user2.email) {
      console.log('Users have different emails, returning true');
      return true;
    }
    
    // So sánh username
    if (user1.username && user2.username && user1.username !== user2.username) {
      console.log('Users have different usernames, returning true');
      return true;
    }
    
    // So sánh khau_sx (cuối cùng vì có thể giống nhau)
    if (user1.khau_sx && user2.khau_sx && user1.khau_sx !== user2.khau_sx) {
      console.log('Users have different khau_sx, returning true');
      return true;
    }
    
    console.log('All fields are the same, returning false');
    // Nếu tất cả đều giống nhau, trả về false
    return false;
  }

  // Validate user selection to ensure they are different
  private validateUserSelection(): void {
    const boiDayHa = this.giaCongForm.get('boiDayHa')?.value;
    const boiDayCao = this.giaCongForm.get('boiDayCao')?.value;
    
    console.log('Validating user selection:');
    console.log('boiDayHa:', boiDayHa);
    console.log('boiDayCao:', boiDayCao);
    
    if (boiDayHa && boiDayCao) {
      const areDifferent = this.areUsersDifferent(boiDayHa, boiDayCao);
      console.log('Users are different?', areDifferent);
      
      if (!areDifferent) {
        // Nếu 2 user giống nhau, hiển thị thông báo
        console.log('Setting sameUser error');
        this.giaCongForm.get('boiDayCao')?.setErrors({ 'sameUser': true });
      } else {
        // Xóa lỗi nếu 2 user khác nhau
        console.log('Clearing sameUser error');
        const currentErrors = this.giaCongForm.get('boiDayCao')?.errors;
        if (currentErrors && currentErrors['sameUser']) {
          delete currentErrors['sameUser'];
          if (Object.keys(currentErrors).length === 0) {
            this.giaCongForm.get('boiDayCao')?.setErrors(null);
          } else {
            this.giaCongForm.get('boiDayCao')?.setErrors(currentErrors);
          }
        }
      }
      
      // Debug: Log form state sau khi validation
      console.log('Form state after validation:');
      console.log('Form valid:', this.giaCongForm.valid);
      console.log('boiDayCao errors:', this.giaCongForm.get('boiDayCao')?.errors);
      console.log('isFormValidForSubmission:', this.isFormValidForSubmission);
    }
  }

  // Method to log worker details for debugging
  private logWorkerDetails(): void {
    console.log('=== Logging Worker Details ===');
    this.nguoiGiaCongOptions.forEach(worker => {
      console.log('Worker:', {
        id: worker.id,
        userId: worker.userId,
        name: worker.name,
        username: worker.username,
        email: worker.email,
        role: worker.role,
        department: worker.department,
        khau_sx: worker.khau_sx,
        FirstName: worker.FirstName,
        LastName: worker.LastName,
        displayName: this.getWorkerDisplayName(worker)
      });
    });
    
    console.log('=== Quan Day Ha Users ===');
    this.quandayhaUsers.forEach(worker => {
      console.log('Quan Day Ha:', {
        id: worker.id,
        name: worker.name,
        email: worker.email,
        khau_sx: worker.khau_sx,
        displayName: this.getWorkerDisplayName(worker)
      });
    });
    
    console.log('=== Quan Day Cao Users ===');
    this.quandaycaoUsers.forEach(worker => {
      console.log('Quan Day Cao:', {
        id: worker.id,
        name: worker.name,
        email: worker.email,
        khau_sx: worker.khau_sx,
        displayName: this.getWorkerDisplayName(worker)
      });
    });
  }

  // Method to check if workers are available
  private checkWorkersAvailability(): void {
    if (this.nguoiGiaCongOptions.length === 0) {
      this.commonService.thongbao('Không tìm thấy người gia công. Vui lòng thử lại sau.', 'Đóng', 'warning');
      this.dialogRef.close(); // Close the dialog if no workers are available
      return;
    }
    
    // Kiểm tra từng danh sách cụ thể
    if (this.quandayhaUsers.length === 0) {
      this.commonService.thongbao('Không tìm thấy người gia công cho bối dây hạ (quandayha). Vui lòng kiểm tra lại.', 'Đóng', 'warning');
    }
    
    if (this.quandaycaoUsers.length === 0) {
      this.commonService.thongbao('Không tìm thấy người gia công cho bối dây cao (quandaycao). Vui lòng kiểm tra lại.', 'Đóng', 'warning');
    }
    
    // Nếu cả hai danh sách đều trống, đóng dialog
    if (this.quandayhaUsers.length === 0 && this.quandaycaoUsers.length === 0) {
      this.commonService.thongbao('Không có người gia công nào phù hợp. Vui lòng thử lại sau.', 'Đóng', 'error');
      this.dialogRef.close();
    }
    
    // Debug: Test validation với 2 user khác nhau
    if (this.quandayhaUsers.length > 0 && this.quandaycaoUsers.length > 0) {
      const testUser1 = this.quandayhaUsers[0];
      const testUser2 = this.quandaycaoUsers[0];
      console.log('=== Testing Validation ===');
      console.log('Test User 1:', testUser1);
      console.log('Test User 2:', testUser2);
      const areDifferent = this.areUsersDifferent(testUser1, testUser2);
      console.log('Test validation result:', areDifferent);
      console.log('========================');
    }
  }
}
